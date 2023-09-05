<template>
    <div class="container pt-3">
        <h1>Impressão de Contratos Digitais</h1>
        <div class="row input-group">
            <div class="col-3">Nro Contrato:</div>
            <div class="col-6"><input type="number" class="form-control" v-model="nro_contrato"></div>
            <div class="col"><button class="btn btn-primary" @click="getData()">Procurar</button></div>
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
                <tbody>
                    <tr v-for="item in this.list" :key="item.uuid">
                        <th scope="row">{{ item.nro_contrato }}</th>
                        <td>{{ item.titular }}</td>
                        <td>{{ item.solicitado_em }}</td>
                        <td>{{ item.motivo }}</td>
                        <td>
                            <div class="buttons">
                                <button class="btn btn-success" type="button" expanded @click="acessar(item.uuid)">Acessar</button>
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
</script>
<script>
export default defineComponent({
    name: "listContractsSign",
    layout: 'blank',
    title: "Lista",
    data() {
        return {
            nro_contrato: '',
            title: "Lista de Contratos para Assinar",
            list: [],
            urlHomolog: 'https://floriculturaathia.com.br/teste/api-assinatura-digital.php?app=',
            urlProd: 'https://portal.athia.com.br/site/api/api-assinatura-digital.php?app=',
            url: null,
            token: null
        }
    },
    mounted() {

        // if (window.location.hostname == "localhost") {
        this.url = this.urlHomolog;
        this.token = '6830ce18-ee25-4861-b337-c1db7fe79df0';
        /* } else {
             this.url = this.urlProd;
         }*/

        //this.getData();
    },
    methods: {
        async getData() {
            this.list = [];
            this.list = await $fetch(this.url + 'getDocumentos&nro_contrato=' + this.nro_contrato, {
                    headers: {
                        'x-api-key': 'e949f8ee3299e48ed653375017868b9b6d7a2c7b06191278eebaa9766ee9ab55'
                    }
                });
        },
        get(event) {
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
        async acessar(uuid) {
            var options = {
                method: 'GET',
                params: {
                    access_token: this.token
                },

                headers: {
                    'Content-Type': 'application/json'
                }
            };

            try {
                let response = await $fetch('/api/documents/'+uuid, options);
                if (response) {
                    window.open(response.document.downloads.signed_file_url, '_blank');
                } else {
                    this.error = response.error;
                }
            } catch (error) {
                console.error(error)
            }
        }
    },
    computed: {
    }
})
</script>