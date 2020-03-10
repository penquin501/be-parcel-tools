import Vue from "vue";
import Router from "vue-router";


Vue.use(Router);

const routes = [
    {
        path: "/",
        name: 'Main',
        component: () => import("../App.vue"),
        hidden: true
    },
    {
        path: "/tools",
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
    {
        path: "/setpriority",
        name: 'SetPriority',
        component: () => import("../components/SetPriority.vue"),
        hidden: true
    },
    {
        path: "/listphone",
        name: 'ListPhone',
        component: () => import("../components/ListPhone.vue"),
        hidden: true
    },
    {
        path: "/listnotkeytracking",
        name: 'ListNotkeyTracking',
        component: () => import("../components/ListNotKeyTracking.vue"),
        hidden: true
    },
    {
        path: "/listbilling",
        name: 'ViewBilling',
        component: () => import("../components/ViewBilling.vue"),
        hidden: true
    },

  
];

export default new Router({
    base: '/admin',
    // linkActiveClass: "active",
    mode: "history",
    scrollBehavior: () => ({
        y: 0
    }),
    routes
});