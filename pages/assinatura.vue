<template>
    <div>
        <div class="row" v-if="this.error" style="text-align: center; font-size: 20px; margin-top: 50px;">
            <h2>{{ this.error }}</h2>
        </div>

        <div class="row" v-if="this.signPrepare" style="text-align: center; font-size: 20px; margin-top: 50px;">
            <h2>Estamos preparando o contrato para assinatura, aguarde a finalização.</h2>
        </div>

        <div class="row" v-if="this.success" style="text-align: center; font-size: 20px; margin-top: 50px;">
            <h2>Documento enviado para assinatura, verifique a caixa de email e siga a instruções.</h2>
            <a :href="'/list?usuario='+$route.query.usuario" class="btn btn-primary">Voltar</a>
        </div>

        <div class="row" v-if="this.cancelPrepare" style="text-align: center; font-size: 20px; margin-top: 50px;">
            <h2>Estamos cancelando o contrato.</h2>
        </div>

        <div class="row" v-if="this.cancelSuccess" style="text-align: center; font-size: 20px; margin-top: 50px;">
            <h2>Documento cancelado com sucesso.</h2>
            <a :href="'/list?usuario='+$route.query.usuario" class="btn btn-primary">Voltar</a>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import hmacSHA256 from 'crypto-js/hmac-sha256';
import Base64 from 'crypto-js/enc-base64';

export default defineComponent({
    name: 'assinatura',
    layout: 'assinatura',
    data() {
        return {
            data: null,
            token: null,
            crypt: null,
            error: null,
            success: null,
            cancelPrepare: null,
            cancelSuccess: null,
            signPrepare: null,
            urlHomolog: 'https://floriculturaathia.com.br/teste/api-assinatura-digital.php?app=',
            urlProd: 'https://portal.athia.com.br/site/api/api-assinatura-digital.php?app=',
            url: null,
            contrato: null,
            cod_doc: null,
            tipo: null,
            email: null,
            telefone: null
        }
    },
    mounted() {
        // if (window.location.hostname == "localhost") {
            this.token = '6830ce18-ee25-4861-b337-c1db7fe79df0';
            this.url = this.urlHomolog;
        // } else {
        //     this.token = 'a7063c4f-52bb-4f53-a5a4-5e6733e337f5';
        //     this.url = this.urlProd;
        // }

        let uri = window.location.search.substring(1);
        let params = new URLSearchParams(uri);
        this.contrato = params.get("contrato");
        this.cod_doc = params.get("cod_doc");
        this.tipo = params.get("tipo");
        this.email = params.get("email");
        this.telefone = params.get("telefone");
        this.get(this.contrato);
    },
    methods: {
        async get(contrato) {
            this.data = await $fetch(this.url + 'getDadosContrato&cod_contrato=' + contrato + '&cod_doc=' + this.cod_doc + "&tipo=" + this.tipo + "&email=" + this.email + "&telefone=" + this.telefone + "&cod_usuario=" + this.$route.query.usuario, {
                headers: {
                    'x-api-key': 'e949f8ee3299e48ed653375017868b9b6d7a2c7b06191278eebaa9766ee9ab55'
                }
            });

            if (this.data.clicksign.uuid == undefined && this.data.clicksign.uuid == null) {
                this.carregarTemplate();
            } else {
                this.cancelDocument(this.data.clicksign.uuid);
            }
        },
        async carregarTemplate() {
            this.signPrepare = true;

            var options = {
                method: 'POST',
                params: {
                    access_token: this.token
                },

                headers: {
                    'Content-Type': 'application/json'
                },

                body: {
                    document: this.data.document
                }
            };

            try {
                const response = await $fetch('/api/templates/' + this.data.clicksign.template + '/documents', options);
                await $fetch('/api/documents/' + response.document.key, {
                    method: 'PATCH',
                    params: {
                        access_token: this.token
                    },

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: {
                        sequence_enabled: true
                    }
                });
                console.log(response);
                if (response) {
                    this.registraSolicitacao(this.contrato, response.document.key, this.cod_doc);
                    this.adicionarSignatarios(response.document.key);
                } else {
                    this.signPrepare = false;
                    this.error = response.error;
                }
            } catch (error) {
                this.signPrepare = false;
                this.error = "Não foi possível criar o documento para assinatura. (" + error.response.data.error + ")";
            }
        },
        async cancelDocument(uuidDoc) {
            this.cancelPrepare = true;
            var options = {
                method: 'PATCH',
                params: {
                    access_token: this.token
                },

                headers: {
                    'Content-Type': 'application/json'
                }
            };

            try {
                await $fetch('/api/documents/' + uuidDoc + '/cancel', options);
                this.cancelPrepare = false;
                this.cancelSuccess = true;
            } catch (error) {
                this.cancelPrepare = false;
                this.error = "Não foi possível cancelar o documento para assinatura. (" + error.response.data.error + ")";
            }
        },
        async registraSolicitacao(contrato, uuidDoc, cod_doc) {
            var options = {
                method: 'POST',
                headers: { 'Content-Type': 'multipart/form-data', 'x-api-key': 'e949f8ee3299e48ed653375017868b9b6d7a2c7b06191278eebaa9766ee9ab55' },
                body: {
                    cod_contrato: contrato,
                    uuid: uuidDoc,
                    cod_doc: cod_doc
                }
            }

            try {
                await $fetch(this.url + 'registrarSolicitacao', options);
            } catch (error) {
                this.error = "Não foi possível criar o documento para assinatura. (" + error.response.data.error + ")";
            }
        },
        async adicionarSignatarios(uuidDoc) {

            // let array = ['presential'];
            //this.data.signers[0].auths = array;

            for (let i = 0; i < this.data.signers['novas'].length; i++) {

                var options = {
                    method: 'POST',
                    params: {
                        access_token: this.token,
                    },
                    headers: { 'Content-Type': 'application/json' },
                    body: {
                        signer: this.data.signers['novas'][i]
                    }
                };

                try {
                    const response = await $fetch('/api/signers', options);
                    if (response) {
                        this.enviarSignatarioPresencial(uuidDoc, response.signer.key);
                    } else {
                        this.error = response.error;
                    }
                } catch (error) {
                    this.error = "Não foi possível criar o documento para assinatura. (" + error.response.data.error + ")";
                }
            }
            for (let i = 0; i < this.data.signers['api'].length; i++) {

                this.enviarSignatario(uuidDoc, this.data.signers['api'][i].key, this.data.signers['api'][i].role, this.data.signers['api'][i].pkey);
            }
        },
        async enviarSignatarioPresencial(uuidDoc, signerKey) {
            var options = {
                method: 'POST',
                params: {
                    access_token: this.token,
                },
                headers: { 'Content-Type': 'application/json' },
                body: {
                    list: {
                        document_key: uuidDoc,
                        signer_key: signerKey,
                        sign_as: "sign",
                        group: 2
                    }
                }
            };

            try {
                const response = await $fetch('/api/lists', options);
                if (response) {
                    var reqKey = response.list.request_signature_key;
                    switch (this.tipo) {
                        case 'presential':
                            this.notificaSignatarioPresencial(reqKey);
                            break;
                        default:
                            this.notificaSignatario(reqKey, this.tipo);
                            break;

                    }
                } else {
                    this.error = response.error;
                }
            } catch (error) {
                this.error = "Não foi possível criar o documento para assinatura. (" + error.response.data.error + ")";
            }
        },
        async enviarSignatario(uuidDoc, signerKey, role, pkey) {
            let g = 1;
            if (role == 'validator')
                g = 3;
            var options = {
                method: 'POST',
                params: {
                    access_token: this.token,
                },
                headers: { 'Content-Type': 'application/json' },
                body: {
                    list: {
                        document_key: uuidDoc,
                        signer_key: signerKey,
                        sign_as: role,
                        group: g
                    }
                }
            };

            try {
                const response = await $fetch('/api/lists', options);
                if (response) {
                    var reqKey = response.list.request_signature_key;
                    if (role == 'validator') {
                        this.notificaSignatario(reqKey, this.tipo);
                    }
                    this.assinar(pkey, reqKey);
                } else {
                    this.error = response.error;
                }
            } catch (error) {
                this.error = "Não foi possível criar o documento para assinatura. (" + error.response.data.error + ")";
            }
        },
        async assinar(pkey, reqKey) {

            // async function calculateHMACSHA256(key, message) {
            //     const encoder = new TextEncoder();
            //     const data = encoder.encode(message);
            //     const keyData = encoder.encode(key);

            //     const keyBuffer = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
            //     const signatureBuffer = await crypto.subtle.sign('HMAC', keyBuffer, data);

            //     const signatureArray = Array.from(new Uint8Array(signatureBuffer));
            //     const signatureHex = signatureArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

            //     return signatureHex;
            // }

            function base64ToHex(str) {
                const raw = atob(str);
                let result = '';
                for (let i = 0; i < raw.length; i++) {
                    const hex = raw.charCodeAt(i).toString(16);
                    result += (hex.length === 2 ? hex : '0' + hex);
                }
                return result.toLowerCase();
            }

            var options = {
                method: 'POST',
                params: {
                    access_token: this.token,
                },
                headers: { 'Content-Type': 'application/json' },
                body: {
                    request_signature_key: reqKey,
                    secret_hmac_sha256: base64ToHex(Base64.stringify(hmacSHA256(reqKey, pkey)))
                }
            };

            try {
                await $fetch('/api/sign', options);
            } catch (error) {
                this.error = "Não foi possível criar o documento para assinatura. (" + error.response.data.error + ")";
            }


        },
        async notificaSignatarioPresencial(keyRequestSignature) {
            var options = {
                method: 'POST',
                params: {
                    access_token: this.token,
                },
                headers: { 'Content-Type': 'application/json' },
                body: {
                    request_signature_key: keyRequestSignature,
                    signature_host: this.data.host.signature_host,
                    recipient: this.data.host.recipient,
                    messages: this.data.host.messages
                }
            };

            try {
                await $fetch('/api/send_presential_signature_request/email', options);
                this.success = true;
            } catch (error) {
                this.error = "Não foi possível criar o documento para assinatura. (" + error.response.data.error + ")";
            }
        },
        async notificaSignatario(keyRequestSignature, tipo) {
            var options = {
                method: 'POST',
                params: {
                    access_token: this.token,
                },
                headers: { 'Content-Type': 'application/json' },
                body: {
                    request_signature_key: keyRequestSignature,
                    messages: "Por favor, assine esse documento!"
                }
            };

            try {
                //        await $fetch('/api/' + (tipo == 'email' ? 'notifications' : 'notify_by_whatsapp'), options);
                this.success = true;
            } catch (error) {
                this.error = "Não foi possível criar o documento para assinatura. (" + error.response.data.error + ")";
            }
        },
    }
})
</script>
  