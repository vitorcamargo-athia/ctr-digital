<template>
    <div class="container pt-3">
        <h1>Gerar Assinatura de Documentos Digitais</h1>
        <div class="row input-group">
            <div class="col-8"><select class="form-select" v-if="listFilial.length > 0" style="width: 100%; height: 35px;"
                    @change="get">
                    <option value="-1">Selecione a filial</option>
                    <option v-for="item in listFilial" :value="item.cod_filial" :key="item.cod_filial">
                        {{ item.filial }}
                    </option>
                </select></div>
            <div class="col"><button class="btn btn-primary" @click="getData()">
                    <Icon name="material-symbols:search" />
                    Procurar
                </button></div>
        </div>
        <div class="row">
            <table class="table table-responsive table-striped" style="width: 100%;">
                <thead>
                    <tr>
                        <th scope="col">Contrato N°</th>
                        <th scope="col">Nome</th>
                        <th scope="col">Data</th>
                        <th scope="col">Motivo</th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody v-if="list.length > 0">
                    <tr v-for="item in list" :key="item.cod_contrato">
                        <th scope="row">{{ item.nro_contrato }}</th>
                        <td>{{ item.nome }}</td>
                        <td>{{ item.data }}</td>
                        <td>{{ item.motivo }}</td>
                        <td>
                            <div class="buttons" v-if="item.status == 'N'">
                                <button class="btn btn-success mx-1" expanded v-if="conf.opcoes.whatsapp"
                                    @click="assinarWhatsapp(item.cod_contrato, item.cod_doc)">
                                    <Icon name="ic:baseline-whatsapp" />
                                    <span class="d-md-none d-lg-inline mx-1">WhatsApp</span>
                                </button>
                                <button class="btn btn-primary mx-1" expanded v-if="conf.opcoes.email"
                                    @click="assinarEmail(item.cod_contrato, item.cod_doc)">
                                    <Icon name="ic:outline-email" />
                                    <span class="d-md-none d-lg-inline mx-1">E-mail</span>
                                </button>
                                <button class="btn btn-warning mx-1" expanded v-if="conf.opcoes.loja"
                                    @click="assinar(item.cod_contrato, item.cod_doc)">
                                    <Icon name="ic:outline-store" />
                                    <span class="d-md-none d-lg-inline mx-1">Loja</span>
                                </button>
                            </div>
                            <div class="buttons" v-else>
                                <button class="btn btn-danger mx-1" expanded
                                    @click="cancelar(item.cod_contrato, item.cod_doc)">
                                    <Icon name="ic:outline-cancel" />
                                    <span class="d-md-none d-lg-inline mx-1">Cancelar</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
<script setup>
import { defineComponent } from 'vue';
import Swal from 'sweetalert2'

</script>
<script>
export default defineComponent({
    name: "AssinarContrato",
    layout: 'blank',
    title: "Lista",
    data() {
        return {
            title: "Lista de Contratos para Assinar",
            list: [],
            listFilial: [],
            selected: 0,
            urlHomolog: 'https://floriculturaathia.com.br/teste/api-assinatura-digital.php?app=',
            urlProd: 'https://portal.athia.com.br/site/api/api-assinatura-digital.php?app=',
            url: null,
            conf: { opcoes: { whatsapp: false, email: false, loja: false } }
        }
    },
    async mounted() {

        if (window.location.hostname == "localhost") {
            this.url = this.urlHomolog;
        } else {
            this.url = this.urlProd;
        }

        this.conf = await $fetch(this.url + 'getOpcoesUsuario&cod_usuario=' + this.$route.query.usuario, {
            headers: {
                'x-api-key': 'e949f8ee3299e48ed653375017868b9b6d7a2c7b06191278eebaa9766ee9ab55'
            }
        });

        this.getFilial();
        this.getData();
    },
    methods: {
        getData() {
            this.list = [];
            let filial = localStorage.getItem("athiaFilial");
            if (filial !== undefined) {
                this.selected = filial;
                this.getDefault(filial);
            }
        },
        async getFilial() {
            let f = await $fetch(this.url + 'getFiliais', {
                headers: {
                    'x-api-key': 'e949f8ee3299e48ed653375017868b9b6d7a2c7b06191278eebaa9766ee9ab55'
                }
            });
            if (this.$route.query.filiais) {
                let filiais = this.$route.query.filiais.split(',');

                this.listFilial = [];
                f.forEach(e => {
                    if (filiais.includes(e.cod_filial))
                        this.listFilial.push(e);
                })
            } else {
                this.listFilial = f;
            }
        },
        get: function (event) {
            let id = event.target.value;
            var url = this.url + 'buscar&filial=' + id;

            localStorage.setItem("athiaFilial", id);

            this.$axios
                .get(url, {
                    headers: {
                        'x-api-key': 'e949f8ee3299e48ed653375017868b9b6d7a2c7b06191278eebaa9766ee9ab55'
                    }
                }).then((response) => {
                    this.list = response.data;
                });
        },
        async getDefault(filial) {
            this.list = await $fetch(this.url + 'buscar&filial=' + filial, {
                headers: {
                    'x-api-key': 'e949f8ee3299e48ed653375017868b9b6d7a2c7b06191278eebaa9766ee9ab55'
                }
            });
        },
        assinar(codigo, cod_doc) {
            window.location.href = "/assinatura?contrato=" + codigo + '&cod_doc=' + cod_doc + "&tipo=presential&usuario=" + (this.$route.query.usuario ? this.$route.query.usuario : null);
        },
        cancelar(codigo, cod_doc) {
            Swal.fire({
                title: 'Deseja mesmo cancelar?',
                showDenyButton: true,
                showCancelButton: true,
                showConfirmButton: false,
                cancelButtonText: 'Não, sair',
                denyButtonText: 'Sim, cancelar',
            }).then((result) => {
                if (result.isDenied) {
                    window.location.href = "/assinatura?contrato=" + codigo + '&cod_doc=' + cod_doc + "&tipo=presential";
                }
            })
        },
        async assinarEmail(codigo, cod_doc) {
            let emails = await $fetch(this.url + 'getEmails&cod_contrato=' + codigo, {
                headers: {
                    'x-api-key': 'e949f8ee3299e48ed653375017868b9b6d7a2c7b06191278eebaa9766ee9ab55'
                }
            });


            const { value: selecionado } = await Swal.fire({
                title: 'Selecione um e-mail para envio do contrato',
                input: 'select',
                inputOptions: emails,
                inputPlaceholder: 'Selecione um e-mail',
                showCancelButton: true,
                inputValidator: (value) => {
                    return new Promise((resolve) => {
                        if (value != '') {
                            resolve()
                        } else {
                            resolve('Selecione um e-mail!')
                        }
                    })
                }
            })

            if (selecionado) {
                window.location.href = "/assinatura?contrato=" + codigo + '&cod_doc=' + cod_doc + "&tipo=email&email=" + emails[selecionado];
            }
        },
        async assinarWhatsapp(codigo, cod_doc) {
            let telefones = await $fetch(this.url + 'getTelefones&cod_contrato=' + codigo, {
                headers: {
                    'x-api-key': 'e949f8ee3299e48ed653375017868b9b6d7a2c7b06191278eebaa9766ee9ab55'
                }
            });


            const { value: selecionado } = await Swal.fire({
                title: 'Selecione o telefone com WhatsApp',
                input: 'select',
                inputOptions: telefones,
                inputPlaceholder: 'Selecione um telefone',
                showCancelButton: true,
                inputValidator: (value) => {
                    return new Promise((resolve) => {
                        if (value != '') {
                            resolve()
                        } else {
                            resolve('Selecione um telefone!')
                        }
                    })
                }
            })

            if (selecionado) {
                window.location.href = "/assinatura?contrato=" + codigo + '&cod_doc=' + cod_doc + "&tipo=whatsapp&telefone=" + telefones[selecionado];
            }
        }
    },
    computed: {
    }
})
</script>