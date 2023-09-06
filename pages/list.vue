<template>
    <div class="container pt-3">
        <h1>Gerar Assinatura de Contratos Digitais</h1>
        <div class="row input-group">
            <div class="col-6"><select class="form-select" v-if="listFilial.length > 0" style="width: 100%; height: 35px;" @change="get">
                    <option>Selecione</option>
                    <option v-for="item in listFilial" :value="item.cod_filial" :key="item.cod_filial">
                        {{ item.filial }}
                    </option>
                </select></div>
            <div class="col"><button class="btn btn-primary" @click="getData()">Procurar</button></div>
        </div>
        <div class="row">
            <table class="table table-responsive table-striped" style="width: 100%;">
                <thead>
                    <tr>
                        <th scope="col">Contrato N°</th>
                        <th scope="col">Nome</th>
                        <th scope="col">Data</th>
                        <th scope="col"></th>
                    </tr>
                </thead>
                <tbody v-if="list.length > 0">
                    <tr v-for="item in list" :key="item.cod_contrato">
                        <th scope="row">{{ item.cod_contrato }}</th>
                        <td>{{ item.nome }}</td>
                        <td>{{ item.data_venda }}</td>
                        <td>
                            <div class="buttons">
                                <button v-if="item.status == 'N'" class="btn btn-success" expanded
                                    @click="assinar(item.cod_contrato)">Assinar</button>
                                <button v-else class="btn btn-danger" expanded
                                    @click="assinar(item.cod_contrato)">Cancelar</button>
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
            url: null
        }
    },
    mounted() {

        // if (window.location.hostname == "localhost") {
        this.url = this.urlHomolog;
        /* } else {
             this.url = this.urlProd;
         }*/

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
        assinar(codigo) {
            window.location.href = "/assinatura?contrato=" + codigo;
        }
    },
    computed: {
    }
})
</script>