import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

const routes = [
  {
    path: "/",
    name: "Main",
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
    name: "ListTracking",
    component: () => import("../components/ListTracking.vue"),
    hidden: true
  },
  {
    path: "/comparedata",
    name: "CompareData",
    component: () => import("../components/CompareData.vue"),
    hidden: true
  },
  {
    path: "/cancelbillno",
    name: "CancelBill",
    component: () => import("../components/CancelBillNo.vue"),
    hidden: true
  },
  {
    path: "/cancelallbillno",
    name: "CancelAllBill",
    component: () => import("../components/CancelAllBillNo.vue"),
    hidden: true
  },
  {
    path: "/setpriority",
    name: "SetPriority",
    component: () => import("../components/SetPriority.vue"),
    hidden: true
  },
  {
    path: "/listphone",
    name: "ListPhone",
    component: () => import("../components/ListPhone.vue"),
    hidden: true
  },
  {
    path: "/listnotkeytracking",
    name: "ListNotkeyTracking",
    component: () => import("../components/ListNotKeyTracking.vue"),
    hidden: true
  },
  {
    path: "/list-daily-billing",
    name: "ViewBilling",
    component: () => import("../components/ViewBilling.vue"),
    hidden: true
  },
  {
    path: "/list-daily-tracking",
    name: "ViewTracking",
    component: () => import("../components/ViewTracking.vue"),
    hidden: true
  },
  {
    path: "/list-skip-tracking",
    name: "ListSkipTracking",
    component: () => import("../components/ReportSkipKey.vue"),
    hidden: true
  },
  {
    path: "/list-branch",
    name: "ListBranch",
    component: () => import("../components/SummaryBranch.vue"),
    hidden: true
  },
  {
    path: "/size-info",
    name: "SizeInfo",
    component: () => import("../components/SizeInfo.vue"),
    hidden: true
  },
  {
    path: "/add-size/:sizeId",
    name: "AddSize",
    component: () => import("../components/AddSize.vue"),
    hidden: true
  },
  {
    path: "/branch-info",
    name: "BranchInfo",
    component: () => import("../components/BranchInfo.vue"),
    hidden: true
  },
  {
    path: "/add-branch/:branchId",
    name: "AddBranch",
    component: () => import("../components/AddBranchInfo.vue"),
    hidden: true
  },
  {
    path: "/change-member",
    name: "ChangeMember",
    component: () => import("../components/ChangeMember.vue"),
    hidden: true
  },
  {
    path: "/report-tool-log",
    name: "ReportToolLog",
    component: () => import("../components/ReportToolLog.vue"),
    hidden: true
  },
  {
    path: "/relabeling",
    name: "ReLabeling",
    component: () => import("../components/ReLabeling.vue"),
    hidden: true
  },
  {
    path: "/movemember",
    name: "MoveMember",
    component: () => import("../components/MoveMember.vue"),
    hidden: true
  },
  {
    path: "/change-phoneregis",
    name: "ChangePhoneRegis",
    component: () => import("../components/ChangePhoneRegis.vue"),
    hidden: true
  },
  {
    path: "/report-relabel",
    name: "ReportRelabel",
    component: () => import("../components/ReportRelabel.vue"),
    hidden: true
  },
  {
    path: "/report-ql-checker",
    name: "ReportQLChecker",
    component: () => import("../components/ReportQLChecker.vue"),
    hidden: true
  },
  {
    path: "/report-flash-booking",
    name: "ReportFlashBooking",
    component: () => import("../components/ReportFlashbooking.vue"),
    hidden: true
  },
  {
    path: "/report-ninja-booking",
    name: "ReportNinjaBooking",
    component: () => import("../components/ReportNinjaBooking.vue"),
    hidden: true
  },
  {
    path: "/report-flash",
    name: "ReportFlash",
    component: () => import("../components/ReportFlash.vue"),
    hidden: true
  },
  {
    path: "/report-ninja",
    name: "ReportNinja",
    component: () => import("../components/ReportNinja.vue"),
    hidden: true
  },
  {
    path: "/report-capture-monitor",
    name: "ReportCaptureMonitor",
    component: () => import("../components/ListCaptureMonitor.vue"),
    hidden: true
  },
  {
    path: "/list-capture",
    name: "ListCapture",
    component: () => import("../components/ListCapture.vue"),
    hidden: true
  },
  {
    path: "/recal-billing",
    name: "ReCalBilling",
    component: () => import("../components/ReCalBilling.vue"),
    hidden: true
  },
];

export default new Router({
  base: "/admin",
  // linkActiveClass: "active",
  mode: "history",
  scrollBehavior: () => ({
    y: 0
  }),
  routes
});
