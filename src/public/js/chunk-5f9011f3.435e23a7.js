(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-5f9011f3"],{"289d":function(t,i,a){"use strict";a.r(i);var s=function(){var t=this,i=t.$createElement,a=t._self._c||i;return a("div",{staticClass:"container",staticStyle:{"margin-top":"60px"}},[a("div",{staticClass:"search"},[a("b",{staticStyle:{"font-size":"18px"}},[t._v("กรุณาใส่เลขที่บิล : ")]),a("input",{directives:[{name:"model",rawName:"v-model",value:t.billingInput,expression:"billingInput"}],attrs:{maxlength:"30",autocomplete:"false"},domProps:{value:t.billingInput},on:{input:function(i){i.target.composing||(t.billingInput=i.target.value)}}}),a("button",{attrs:{type:"button"},on:{click:t.getData}},[t._v("Search")])]),a("div",{staticClass:"row"},[a("div",{staticClass:"col-md-4"}),a("div",{staticClass:"col-md-4"},[a("div",{staticClass:"center"},[a("div",[a("b",{staticStyle:{"font-size":"16px"}},[t._v("Billing No : "+t._s(t.billingNo))])]),a("div",[a("b",{staticStyle:{"font-size":"16px"}},[t._v("จำนวน Tracking : "+t._s(t.countTracking))])]),a("div",[t.status?t._e():a("b",{staticStyle:{"font-size":"16px"}},[t._v(" สถานะ : "),a("label",{staticStyle:{color:"red"}},[t._v(t._s(t.txtStatus))])]),t.status?a("b",{staticStyle:{"font-size":"16px"}},[t._v(" สถานะ : "),a("label",{staticStyle:{color:"green"}},[t._v(t._s(t.txtStatus))])]):t._e()])])]),a("div",{staticClass:"col-md-4"})]),a("div",{staticClass:"group-btn"},[a("button",{attrs:{type:"button"},on:{click:t.confirmData}},[t._v("บันทึก")])])])},n=[],l=a("2b0e"),e=(a("62bb"),a("1aa0")),o=a.n(e),c=a("bc3a");l["a"].use(o.a);var u={data:function(){return{billingInput:"",billingNo:"",countTracking:"",billingStatus:"",status:!1,txtStatus:"",previous_value:{}}},mounted:function(){this.$session.get("session_username")||this.$router.push({name:"Main"})},methods:{getData:function(){var t=this,i={okLabel:"ตกลง"};""==this.billingInput?this.$dialogs.alert("กรุณาใส่เลขที่บิลให้ถูกต้อง",i):c.get("https://tool.945parcel.com/check/info/billing?billing="+this.billingInput).then((function(a){if(a.data){console.log(a.data),t.txtStatus="";var s=a.data.billingInfo;t.billingNo=s.billingNo,t.billingStatus=s.billingStatus,t.countTracking=s.countTracking,t.status=a.data.statusParcel,t.status?t.txtStatus="สามารถยกเลิกเลขที่บิลนี้ได้":t.txtStatus="ไม่สามารถยกเลิกเลขที่บิลนี้ได้",t.previous_value=t.billingStatus}else t.$dialogs.alert("ไม่พบข้อมุล",i)})).catch((function(t){console.log(t)}))},confirmData:function(){var t=this,i={okLabel:"ตกลง"};if(this.status){var a={billing_no:this.billingNo,previous_value:this.previous_value,user:this.$session.get("session_username")};c.post("https://tool.945parcel.com/save/cancel/billing",a).then((function(a){"SUCCESS"==a.data.status&&(t.$dialogs.alert("ยกเลิกเรียบร้อยแล้ว",i),window.location.reload())}))}else this.$dialogs.alert("ไม่สามารถยกเลิกเลขที่บิลนี้ได้",i)}}},r=u,g=(a("3b4a"),a("2877")),b=Object(g["a"])(r,s,n,!1,null,null,null);i["default"]=b.exports},"3b4a":function(t,i,a){"use strict";var s=a("9e9d"),n=a.n(s);n.a},"9e9d":function(t,i,a){}}]);
//# sourceMappingURL=chunk-5f9011f3.435e23a7.js.map