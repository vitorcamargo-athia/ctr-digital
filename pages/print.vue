<template>
    <Menu>
        <MenuButton>More</MenuButton>
        <MenuItems>
            <MenuItem v-slot="{ active }">
            <a :class='{ "bg-blue-500": active }' href="/account-settings">
                Account settings
            </a>
            </MenuItem>
            <MenuItem v-slot="{ active }">
            <a :class='{ "bg-blue-500": active }' href="/account-settings">
                Documentation
            </a>
            </MenuItem>
            <MenuItem disabled>
            <span class="opacity-75">Invite a friend (coming soon!)</span>
            </MenuItem>
        </MenuItems>
    </Menu>
</template>
<script setup>
import { defineComponent } from 'vue';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
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
        getData() {
            this.list = [];
            this.$axios
                .get(this.url + 'getDocumentos&nro_contrato=' + this.nro_contrato, {
                    headers: {
                        'x-api-key': 'e949f8ee3299e48ed653375017868b9b6d7a2c7b06191278eebaa9766ee9ab55'
                    }
                }).then((response) => {
                    this.list = response.data;
                });
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
        async acessar(uuid) {
            var options = {
                method: 'GET',
                url: '/api/view',
                params: {
                    access_token: this.token,
                    key: uuid
                },

                headers: {
                    'Content-Type': 'application/json'
                }
            };

            try {
                let response = await this.$axios.request(options);
                if (response.status == 200) {
                    window.open(response.data.document.downloads.signed_file_url, '_blank');
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
  
<style scoped></style>
  