<template>
  <div class="container" style="margin-top: 60px;">
        <div class="group-btn">
            <select v-model="codeBank" @change="onChange($event)">
                <option disabled selected>เลือกธนาคาร</option>
                <option v-bind:key="item.id" v-for="(item  , index) in dataBank" v-bind:value="{ id: dataBank[index].id, text: dataBank[index].bankTh }">{{ dataBank[index].bankTh }}</option>
            </select>
            {{ codeBank }}
        </div>
  </div>
</template>

<script>
const axios = require("axios");
export default {
    data: function() {
        return {
            codeBank: "เลือกธนาคาร",
            dataBank: [],
        }
    },
    mounted: function() {
        this.listMember();
    },
    methods: {
        getDataBank() {
            axios.get("https://www.945api.com/parcel/agent/bank/name")
            .then(resultsDataBank => {
                this.dataBank = resultsDataBank.data;
            })
            .catch(error => {
                console.log(error);
            });
        },
        listMember() {
            const data = {
                branch_id: 90
            };
            axios.post("https://www.945api.com/parcel/list/member/api",JSON.stringify(data))
            .then(function(response) {
                // this.dataBank = response.data.listMember;
                console.log(response.data.listMember);
                // that.getDataBank();
            })
            .catch(function(error) {
                console.log(error);
            });
        },
    }
}
</script>

<style>

</style>