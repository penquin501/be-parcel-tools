(function(e){function t(t){for(var a,r,i=t[0],l=t[1],c=t[2],u=0,d=[];u<i.length;u++)r=i[u],Object.prototype.hasOwnProperty.call(o,r)&&o[r]&&d.push(o[r][0]),o[r]=0;for(a in l)Object.prototype.hasOwnProperty.call(l,a)&&(e[a]=l[a]);f&&f(t);while(d.length)d.shift()();return s.push.apply(s,c||[]),n()}function n(){for(var e,t=0;t<s.length;t++){for(var n=s[t],a=!0,r=1;r<n.length;r++){var i=n[r];0!==o[i]&&(a=!1)}a&&(s.splice(t--,1),e=l(l.s=n[0]))}return e}var a={},r={app:0},o={app:0},s=[];function i(e){return l.p+"js/"+({}[e]||e)+"."+{"chunk-5f9011f3":"435e23a7","chunk-6df66d00":"efa09a52","chunk-ae82b962":"f2c6f4df","chunk-f8a334ee":"0434bcf3"}[e]+".js"}function l(t){if(a[t])return a[t].exports;var n=a[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,l),n.l=!0,n.exports}l.e=function(e){var t=[],n={"chunk-5f9011f3":1,"chunk-6df66d00":1,"chunk-ae82b962":1,"chunk-f8a334ee":1};r[e]?t.push(r[e]):0!==r[e]&&n[e]&&t.push(r[e]=new Promise((function(t,n){for(var a="css/"+({}[e]||e)+"."+{"chunk-5f9011f3":"e9a410d8","chunk-6df66d00":"5decbcac","chunk-ae82b962":"116fbb21","chunk-f8a334ee":"d19f1993"}[e]+".css",o=l.p+a,s=document.getElementsByTagName("link"),i=0;i<s.length;i++){var c=s[i],u=c.getAttribute("data-href")||c.getAttribute("href");if("stylesheet"===c.rel&&(u===a||u===o))return t()}var d=document.getElementsByTagName("style");for(i=0;i<d.length;i++){c=d[i],u=c.getAttribute("data-href");if(u===a||u===o)return t()}var f=document.createElement("link");f.rel="stylesheet",f.type="text/css",f.onload=t,f.onerror=function(t){var a=t&&t.target&&t.target.src||o,s=new Error("Loading CSS chunk "+e+" failed.\n("+a+")");s.code="CSS_CHUNK_LOAD_FAILED",s.request=a,delete r[e],f.parentNode.removeChild(f),n(s)},f.href=o;var p=document.getElementsByTagName("head")[0];p.appendChild(f)})).then((function(){r[e]=0})));var a=o[e];if(0!==a)if(a)t.push(a[2]);else{var s=new Promise((function(t,n){a=o[e]=[t,n]}));t.push(a[2]=s);var c,u=document.createElement("script");u.charset="utf-8",u.timeout=120,l.nc&&u.setAttribute("nonce",l.nc),u.src=i(e);var d=new Error;c=function(t){u.onerror=u.onload=null,clearTimeout(f);var n=o[e];if(0!==n){if(n){var a=t&&("load"===t.type?"missing":t.type),r=t&&t.target&&t.target.src;d.message="Loading chunk "+e+" failed.\n("+a+": "+r+")",d.name="ChunkLoadError",d.type=a,d.request=r,n[1](d)}o[e]=void 0}};var f=setTimeout((function(){c({type:"timeout",target:u})}),12e4);u.onerror=u.onload=c,document.head.appendChild(u)}return Promise.all(t)},l.m=e,l.c=a,l.d=function(e,t,n){l.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},l.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},l.t=function(e,t){if(1&t&&(e=l(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(l.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var a in e)l.d(n,a,function(t){return e[t]}.bind(null,a));return n},l.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return l.d(t,"a",t),t},l.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},l.p="/",l.oe=function(e){throw console.error(e),e};var c=window["webpackJsonp"]=window["webpackJsonp"]||[],u=c.push.bind(c);c.push=t,c=c.slice();for(var d=0;d<c.length;d++)t(c[d]);var f=u;s.push([0,"chunk-vendors"]),n()})({0:function(e,t,n){e.exports=n("56d7")},"3dfd":function(e,t,n){"use strict";n.r(t);var a=function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{attrs:{id:"app"}},["login"==e.state?n("div",{staticClass:"login",attrs:{v:""}},[n("div",{staticClass:"content2"},[e._m(0),n("input",{directives:[{name:"model",rawName:"v-model",value:e.username,expression:"username"}],attrs:{placeholder:"Username"},domProps:{value:e.username},on:{keyup:function(t){return!t.type.indexOf("key")&&e._k(t.keyCode,"enter",13,t.key,"Enter")?null:e.logIn(t)},input:function(t){t.target.composing||(e.username=t.target.value)}}}),n("br"),n("input",{directives:[{name:"model",rawName:"v-model",value:e.password,expression:"password"}],attrs:{placeholder:"Password",type:"password"},domProps:{value:e.password},on:{keyup:function(t){return!t.type.indexOf("key")&&e._k(t.keyCode,"enter",13,t.key,"Enter")?null:e.logIn(t)},input:function(t){t.target.composing||(e.password=t.target.value)}}}),n("br"),n("br"),n("button",{staticClass:"btn btn-outline-success",on:{click:e.logIn}},[e._v("LOGIN")])])]):e._e(),"blank"==e.state?n("div",[n("nav",{staticClass:"navbar navbar-expand-lg navbar-light bg-light fixed-top"},[n("h4",{staticStyle:{color:"rgb(0, 136, 148)"}},[e._v("Parcel Tools")]),e._m(1),n("div",{staticClass:"collapse navbar-collapse",staticStyle:{"margin-left":"30px"},attrs:{id:"navbarTogglerDemo02"}},[n("ul",{staticClass:"navbar-nav mr-auto mt-2 mt-lg-0"},[n("li",{staticClass:"nav-item dropdown"},[n("a",{staticClass:"nav-link dropdown-toggle",attrs:{href:"#",id:"navbarDropdown",role:"button","data-toggle":"dropdown","aria-haspopup":"true","aria-expanded":"false"}},[e._v(" เมนู ")]),n("div",{staticClass:"dropdown-menu",attrs:{"aria-labelledby":"navbarDropdown"}},[n("router-link",{attrs:{to:"/tools"}},[n("a",{staticClass:"dropdown-item",on:{click:e.toView}},[e._v("เครื่องมือทั่วไป")])]),n("router-link",{attrs:{to:"/cancelbillno"}},[n("a",{staticClass:"dropdown-item",on:{click:e.toView}},[e._v("ยกเลิกเลขที่บิล")])]),n("router-link",{attrs:{to:"/listtracking"}},[n("a",{staticClass:"dropdown-item",on:{click:e.toView}},[e._v("QL Checker")])])],1)])]),n("form",{staticClass:"form-inline my-2 my-lg-0"},[n("a",{staticClass:"nav-link",on:{click:e.Logout}},[e._m(2)])])])]),n("div",{directives:[{name:"show",rawName:"v-show",value:e.showMain,expression:"showMain"}]},[n("router-view")],1)]):e._e()])},r=[function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",{staticClass:"row"},[n("h3",[e._v("Parcel-Tool")])])},function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("button",{staticClass:"navbar-toggler",attrs:{type:"button","data-toggle":"collapse","data-target":"#navbarTogglerDemo02","aria-controls":"navbarTogglerDemo02","aria-expanded":"false","aria-label":"Toggle navigation"}},[n("span",{staticClass:"navbar-toggler-icon"})])},function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("label",{staticStyle:{color:"rgb(0, 136, 148)"}},[a("img",{staticStyle:{width:"20px"},attrs:{src:n("bc8c")}}),e._v(" Logout")])}],o=(n("b0c0"),n("6dfc"),n("72bf")),s=n("bc3a"),i={name:"app",components:{},data:function(){return{state:"login",inMenu:0,showMain:!1,username:"",password:""}},mounted:function(){this.$session.start();var e=JSON.parse(localStorage.getItem("dataLoginParcelTool"));console.log("dataLogin",e),null!=e&&(this.state="blank"),this.$session.get("session_username")||(this.state="login")},methods:{logIn:function(){var e=this;this.state="blank";var t=this.username,n=this.password,a={username:t,password:n};s.post("https://945cs.work/login_api",o.stringify(a)).then((function(t){console.log(t.data.name),t.data.status&&(localStorage.setItem("dataLoginParcelTool",JSON.stringify(a)),e.$session.set("session_username",t.data.name))})).catch((function(e){console.log(e)}))},Logout:function(){this.$session.clear(),this.state="login"},toView:function(){this.showMain=!0}}},l=i,c=(n("abb8"),n("2877")),u=Object(c["a"])(l,a,r,!1,null,null,null);t["default"]=u.exports},"56d1":function(e,t,n){},"56d7":function(e,t,n){"use strict";n.r(t);n("e260"),n("e6cf"),n("cca6"),n("a79d");var a=n("2b0e"),r=n("3dfd"),o=n("8f0d"),s=n("4a7a"),i=n.n(s),l=(n("d3b7"),n("8c4f"));a["a"].use(l["a"]);var c=[{path:"/",name:"Main",component:function(){return Promise.resolve().then(n.bind(null,"3dfd"))},hidden:!0},{path:"/tools",component:function(){return n.e("chunk-f8a334ee").then(n.bind(null,"5456"))},hidden:!0},{path:"/listtracking",name:"ListTracking",component:function(){return n.e("chunk-ae82b962").then(n.bind(null,"fd6a"))},hidden:!0},{path:"/comparedata",name:"CompareData",component:function(){return n.e("chunk-6df66d00").then(n.bind(null,"17ab"))},hidden:!0},{path:"/cancelbillno",name:"CancelBill",component:function(){return n.e("chunk-5f9011f3").then(n.bind(null,"289d"))},hidden:!0}],u=new l["a"]({mode:"history",scrollBehavior:function(){return{y:0}},routes:c}),d=(n("f9e3"),n("4989"),n("ecee")),f=n("c074"),p=n("ad3d"),h=(n("6dfc"),n("62bb"),n("1aa0")),m=n.n(h),g=n("0628"),v=n.n(g);a["a"].use(v.a),a["a"].use(m.a),d["c"].add(f["a"]),a["a"].component("font-awesome-icon",p["a"]),a["a"].component("v-select",i.a),a["a"].use(o["a"]),a["a"].config.productionTip=!1,new a["a"]({render:function(e){return e(r["default"])},router:u}).$mount("#app")},abb8:function(e,t,n){"use strict";var a=n("56d1"),r=n.n(a);r.a},bc8c:function(e,t,n){e.exports=n.p+"img/logout.5eebc80d.png"}});
//# sourceMappingURL=app.3f39ec77.js.map