import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

const routes = [
    {
        path: "/",
        component: () => import("../components/main.vue"),
        hidden: true
    },
    {
        path: "/listtracking",
        name: 'ListTracking',
        component: () => import("../components/ListTracking.vue"),
        hidden: true
    },
    {
        path: "/comparedata",
        name: 'CompareData',
        component: () => import("../components/CompareData.vue"),
        hidden: true
    },
    {
        path: "/cancelbillno",
        name: 'CancelBill',
        component: () => import("../components/CancelBillNo.vue"),
        hidden: true
    },
  
];

export default new Router({
    // base: '/parceltool',
    // linkActiveClass: "active",
    mode: "history",
    scrollBehavior: () => ({
        y: 0
    }),
    routes
});