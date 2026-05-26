(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function n(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=n(s);fetch(s.href,r)}})();/**
* @vue/shared v3.5.26
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function Wl(t){const e=Object.create(null);for(const n of t.split(","))e[n]=1;return n=>n in e}const Mt={},Es=[],Gn=()=>{},Md=()=>!1,Ca=t=>t.charCodeAt(0)===111&&t.charCodeAt(1)===110&&(t.charCodeAt(2)>122||t.charCodeAt(2)<97),ql=t=>t.startsWith("onUpdate:"),nn=Object.assign,Xl=(t,e)=>{const n=t.indexOf(e);n>-1&&t.splice(n,1)},Th=Object.prototype.hasOwnProperty,gt=(t,e)=>Th.call(t,e),Ze=Array.isArray,ws=t=>Mr(t)==="[object Map]",Bs=t=>Mr(t)==="[object Set]",Fc=t=>Mr(t)==="[object Date]",it=t=>typeof t=="function",Ut=t=>typeof t=="string",In=t=>typeof t=="symbol",wt=t=>t!==null&&typeof t=="object",Td=t=>(wt(t)||it(t))&&it(t.then)&&it(t.catch),Ed=Object.prototype.toString,Mr=t=>Ed.call(t),Eh=t=>Mr(t).slice(8,-1),wd=t=>Mr(t)==="[object Object]",jl=t=>Ut(t)&&t!=="NaN"&&t[0]!=="-"&&""+parseInt(t,10)===t,ar=Wl(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),Ra=t=>{const e=Object.create(null);return n=>e[n]||(e[n]=t(n))},wh=/-\w/g,bn=Ra(t=>t.replace(wh,e=>e.slice(1).toUpperCase())),Ah=/\B([A-Z])/g,rs=Ra(t=>t.replace(Ah,"-$1").toLowerCase()),Ia=Ra(t=>t.charAt(0).toUpperCase()+t.slice(1)),ja=Ra(t=>t?`on${Ia(t)}`:""),$i=(t,e)=>!Object.is(t,e),sa=(t,...e)=>{for(let n=0;n<t.length;n++)t[n](...e)},Ad=(t,e,n,i=!1)=>{Object.defineProperty(t,e,{configurable:!0,enumerable:!1,writable:i,value:n})},La=t=>{const e=parseFloat(t);return isNaN(e)?t:e};let kc;const Da=()=>kc||(kc=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function hn(t){if(Ze(t)){const e={};for(let n=0;n<t.length;n++){const i=t[n],s=Ut(i)?Ih(i):hn(i);if(s)for(const r in s)e[r]=s[r]}return e}else if(Ut(t)||wt(t))return t}const Ph=/;(?![^(]*\))/g,Ch=/:([^]+)/,Rh=/\/\*[^]*?\*\//g;function Ih(t){const e={};return t.replace(Rh,"").split(Ph).forEach(n=>{if(n){const i=n.split(Ch);i.length>1&&(e[i[0].trim()]=i[1].trim())}}),e}function Be(t){let e="";if(Ut(t))e=t;else if(Ze(t))for(let n=0;n<t.length;n++){const i=Be(t[n]);i&&(e+=i+" ")}else if(wt(t))for(const n in t)t[n]&&(e+=n+" ");return e.trim()}const Lh="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",Dh=Wl(Lh);function Pd(t){return!!t||t===""}function Nh(t,e){if(t.length!==e.length)return!1;let n=!0;for(let i=0;n&&i<t.length;i++)n=ns(t[i],e[i]);return n}function ns(t,e){if(t===e)return!0;let n=Fc(t),i=Fc(e);if(n||i)return n&&i?t.getTime()===e.getTime():!1;if(n=In(t),i=In(e),n||i)return t===e;if(n=Ze(t),i=Ze(e),n||i)return n&&i?Nh(t,e):!1;if(n=wt(t),i=wt(e),n||i){if(!n||!i)return!1;const s=Object.keys(t).length,r=Object.keys(e).length;if(s!==r)return!1;for(const a in t){const l=t.hasOwnProperty(a),u=e.hasOwnProperty(a);if(l&&!u||!l&&u||!ns(t[a],e[a]))return!1}}return String(t)===String(e)}function Yl(t,e){return t.findIndex(n=>ns(n,e))}const Cd=t=>!!(t&&t.__v_isRef===!0),B=t=>Ut(t)?t:t==null?"":Ze(t)||wt(t)&&(t.toString===Ed||!it(t.toString))?Cd(t)?B(t.value):JSON.stringify(t,Rd,2):String(t),Rd=(t,e)=>Cd(e)?Rd(t,e.value):ws(e)?{[`Map(${e.size})`]:[...e.entries()].reduce((n,[i,s],r)=>(n[Ya(i,r)+" =>"]=s,n),{})}:Bs(e)?{[`Set(${e.size})`]:[...e.values()].map(n=>Ya(n))}:In(e)?Ya(e):wt(e)&&!Ze(e)&&!wd(e)?String(e):e,Ya=(t,e="")=>{var n;return In(t)?`Symbol(${(n=t.description)!=null?n:e})`:t};/**
* @vue/reactivity v3.5.26
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let rn;class Uh{constructor(e=!1){this.detached=e,this._active=!0,this._on=0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.parent=rn,!e&&rn&&(this.index=(rn.scopes||(rn.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let e,n;if(this.scopes)for(e=0,n=this.scopes.length;e<n;e++)this.scopes[e].pause();for(e=0,n=this.effects.length;e<n;e++)this.effects[e].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let e,n;if(this.scopes)for(e=0,n=this.scopes.length;e<n;e++)this.scopes[e].resume();for(e=0,n=this.effects.length;e<n;e++)this.effects[e].resume()}}run(e){if(this._active){const n=rn;try{return rn=this,e()}finally{rn=n}}}on(){++this._on===1&&(this.prevScope=rn,rn=this)}off(){this._on>0&&--this._on===0&&(rn=this.prevScope,this.prevScope=void 0)}stop(e){if(this._active){this._active=!1;let n,i;for(n=0,i=this.effects.length;n<i;n++)this.effects[n].stop();for(this.effects.length=0,n=0,i=this.cleanups.length;n<i;n++)this.cleanups[n]();if(this.cleanups.length=0,this.scopes){for(n=0,i=this.scopes.length;n<i;n++)this.scopes[n].stop(!0);this.scopes.length=0}if(!this.detached&&this.parent&&!e){const s=this.parent.scopes.pop();s&&s!==this&&(this.parent.scopes[this.index]=s,s.index=this.index)}this.parent=void 0}}}function Fh(){return rn}let Et;const Ka=new WeakSet;class Id{constructor(e){this.fn=e,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,rn&&rn.active&&rn.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,Ka.has(this)&&(Ka.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||Dd(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,Oc(this),Nd(this);const e=Et,n=Pn;Et=this,Pn=!0;try{return this.fn()}finally{Ud(this),Et=e,Pn=n,this.flags&=-3}}stop(){if(this.flags&1){for(let e=this.deps;e;e=e.nextDep)Zl(e);this.deps=this.depsTail=void 0,Oc(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?Ka.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){Bo(this)&&this.run()}get dirty(){return Bo(this)}}let Ld=0,or,lr;function Dd(t,e=!1){if(t.flags|=8,e){t.next=lr,lr=t;return}t.next=or,or=t}function Kl(){Ld++}function Jl(){if(--Ld>0)return;if(lr){let e=lr;for(lr=void 0;e;){const n=e.next;e.next=void 0,e.flags&=-9,e=n}}let t;for(;or;){let e=or;for(or=void 0;e;){const n=e.next;if(e.next=void 0,e.flags&=-9,e.flags&1)try{e.trigger()}catch(i){t||(t=i)}e=n}}if(t)throw t}function Nd(t){for(let e=t.deps;e;e=e.nextDep)e.version=-1,e.prevActiveLink=e.dep.activeLink,e.dep.activeLink=e}function Ud(t){let e,n=t.depsTail,i=n;for(;i;){const s=i.prevDep;i.version===-1?(i===n&&(n=s),Zl(i),kh(i)):e=i,i.dep.activeLink=i.prevActiveLink,i.prevActiveLink=void 0,i=s}t.deps=e,t.depsTail=n}function Bo(t){for(let e=t.deps;e;e=e.nextDep)if(e.dep.version!==e.version||e.dep.computed&&(Fd(e.dep.computed)||e.dep.version!==e.version))return!0;return!!t._dirty}function Fd(t){if(t.flags&4&&!(t.flags&16)||(t.flags&=-17,t.globalVersion===pr)||(t.globalVersion=pr,!t.isSSR&&t.flags&128&&(!t.deps&&!t._dirty||!Bo(t))))return;t.flags|=2;const e=t.dep,n=Et,i=Pn;Et=t,Pn=!0;try{Nd(t);const s=t.fn(t._value);(e.version===0||$i(s,t._value))&&(t.flags|=128,t._value=s,e.version++)}catch(s){throw e.version++,s}finally{Et=n,Pn=i,Ud(t),t.flags&=-3}}function Zl(t,e=!1){const{dep:n,prevSub:i,nextSub:s}=t;if(i&&(i.nextSub=s,t.prevSub=void 0),s&&(s.prevSub=i,t.nextSub=void 0),n.subs===t&&(n.subs=i,!i&&n.computed)){n.computed.flags&=-5;for(let r=n.computed.deps;r;r=r.nextDep)Zl(r,!0)}!e&&!--n.sc&&n.map&&n.map.delete(n.key)}function kh(t){const{prevDep:e,nextDep:n}=t;e&&(e.nextDep=n,t.prevDep=void 0),n&&(n.prevDep=e,t.nextDep=void 0)}let Pn=!0;const kd=[];function ci(){kd.push(Pn),Pn=!1}function ui(){const t=kd.pop();Pn=t===void 0?!0:t}function Oc(t){const{cleanup:e}=t;if(t.cleanup=void 0,e){const n=Et;Et=void 0;try{e()}finally{Et=n}}}let pr=0;class Oh{constructor(e,n){this.sub=e,this.dep=n,this.version=n.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class Od{constructor(e){this.computed=e,this.version=0,this.activeLink=void 0,this.subs=void 0,this.map=void 0,this.key=void 0,this.sc=0,this.__v_skip=!0}track(e){if(!Et||!Pn||Et===this.computed)return;let n=this.activeLink;if(n===void 0||n.sub!==Et)n=this.activeLink=new Oh(Et,this),Et.deps?(n.prevDep=Et.depsTail,Et.depsTail.nextDep=n,Et.depsTail=n):Et.deps=Et.depsTail=n,Bd(n);else if(n.version===-1&&(n.version=this.version,n.nextDep)){const i=n.nextDep;i.prevDep=n.prevDep,n.prevDep&&(n.prevDep.nextDep=i),n.prevDep=Et.depsTail,n.nextDep=void 0,Et.depsTail.nextDep=n,Et.depsTail=n,Et.deps===n&&(Et.deps=i)}return n}trigger(e){this.version++,pr++,this.notify(e)}notify(e){Kl();try{for(let n=this.subs;n;n=n.prevSub)n.sub.notify()&&n.sub.dep.notify()}finally{Jl()}}}function Bd(t){if(t.dep.sc++,t.sub.flags&4){const e=t.dep.computed;if(e&&!t.dep.subs){e.flags|=20;for(let i=e.deps;i;i=i.nextDep)Bd(i)}const n=t.dep.subs;n!==t&&(t.prevSub=n,n&&(n.nextSub=t)),t.dep.subs=t}}const Vo=new WeakMap,es=Symbol(""),zo=Symbol(""),mr=Symbol("");function jt(t,e,n){if(Pn&&Et){let i=Vo.get(t);i||Vo.set(t,i=new Map);let s=i.get(n);s||(i.set(n,s=new Od),s.map=i,s.key=n),s.track()}}function ni(t,e,n,i,s,r){const a=Vo.get(t);if(!a){pr++;return}const l=u=>{u&&u.trigger()};if(Kl(),e==="clear")a.forEach(l);else{const u=Ze(t),d=u&&jl(n);if(u&&n==="length"){const f=Number(i);a.forEach((m,p)=>{(p==="length"||p===mr||!In(p)&&p>=f)&&l(m)})}else switch((n!==void 0||a.has(void 0))&&l(a.get(n)),d&&l(a.get(mr)),e){case"add":u?d&&l(a.get("length")):(l(a.get(es)),ws(t)&&l(a.get(zo)));break;case"delete":u||(l(a.get(es)),ws(t)&&l(a.get(zo)));break;case"set":ws(t)&&l(a.get(es));break}}Jl()}function cs(t){const e=xt(t);return e===t?e:(jt(e,"iterate",mr),Cn(t)?e:e.map(di))}function Na(t){return jt(t=xt(t),"iterate",mr),t}function Ai(t,e){return Li(t)?ts(t)?Ls(di(e)):Ls(e):di(e)}const Bh={__proto__:null,[Symbol.iterator](){return Ja(this,Symbol.iterator,t=>Ai(this,t))},concat(...t){return cs(this).concat(...t.map(e=>Ze(e)?cs(e):e))},entries(){return Ja(this,"entries",t=>(t[1]=Ai(this,t[1]),t))},every(t,e){return Kn(this,"every",t,e,void 0,arguments)},filter(t,e){return Kn(this,"filter",t,e,n=>n.map(i=>Ai(this,i)),arguments)},find(t,e){return Kn(this,"find",t,e,n=>Ai(this,n),arguments)},findIndex(t,e){return Kn(this,"findIndex",t,e,void 0,arguments)},findLast(t,e){return Kn(this,"findLast",t,e,n=>Ai(this,n),arguments)},findLastIndex(t,e){return Kn(this,"findLastIndex",t,e,void 0,arguments)},forEach(t,e){return Kn(this,"forEach",t,e,void 0,arguments)},includes(...t){return Za(this,"includes",t)},indexOf(...t){return Za(this,"indexOf",t)},join(t){return cs(this).join(t)},lastIndexOf(...t){return Za(this,"lastIndexOf",t)},map(t,e){return Kn(this,"map",t,e,void 0,arguments)},pop(){return Ws(this,"pop")},push(...t){return Ws(this,"push",t)},reduce(t,...e){return Bc(this,"reduce",t,e)},reduceRight(t,...e){return Bc(this,"reduceRight",t,e)},shift(){return Ws(this,"shift")},some(t,e){return Kn(this,"some",t,e,void 0,arguments)},splice(...t){return Ws(this,"splice",t)},toReversed(){return cs(this).toReversed()},toSorted(t){return cs(this).toSorted(t)},toSpliced(...t){return cs(this).toSpliced(...t)},unshift(...t){return Ws(this,"unshift",t)},values(){return Ja(this,"values",t=>Ai(this,t))}};function Ja(t,e,n){const i=Na(t),s=i[e]();return i!==t&&!Cn(t)&&(s._next=s.next,s.next=()=>{const r=s._next();return r.done||(r.value=n(r.value)),r}),s}const Vh=Array.prototype;function Kn(t,e,n,i,s,r){const a=Na(t),l=a!==t&&!Cn(t),u=a[e];if(u!==Vh[e]){const m=u.apply(t,r);return l?di(m):m}let d=n;a!==t&&(l?d=function(m,p){return n.call(this,Ai(t,m),p,t)}:n.length>2&&(d=function(m,p){return n.call(this,m,p,t)}));const f=u.call(a,d,i);return l&&s?s(f):f}function Bc(t,e,n,i){const s=Na(t);let r=n;return s!==t&&(Cn(t)?n.length>3&&(r=function(a,l,u){return n.call(this,a,l,u,t)}):r=function(a,l,u){return n.call(this,a,Ai(t,l),u,t)}),s[e](r,...i)}function Za(t,e,n){const i=xt(t);jt(i,"iterate",mr);const s=i[e](...n);return(s===-1||s===!1)&&tc(n[0])?(n[0]=xt(n[0]),i[e](...n)):s}function Ws(t,e,n=[]){ci(),Kl();const i=xt(t)[e].apply(t,n);return Jl(),ui(),i}const zh=Wl("__proto__,__v_isRef,__isVue"),Vd=new Set(Object.getOwnPropertyNames(Symbol).filter(t=>t!=="arguments"&&t!=="caller").map(t=>Symbol[t]).filter(In));function Gh(t){In(t)||(t=String(t));const e=xt(this);return jt(e,"has",t),e.hasOwnProperty(t)}class zd{constructor(e=!1,n=!1){this._isReadonly=e,this._isShallow=n}get(e,n,i){if(n==="__v_skip")return e.__v_skip;const s=this._isReadonly,r=this._isShallow;if(n==="__v_isReactive")return!s;if(n==="__v_isReadonly")return s;if(n==="__v_isShallow")return r;if(n==="__v_raw")return i===(s?r?Qh:qd:r?Wd:Hd).get(e)||Object.getPrototypeOf(e)===Object.getPrototypeOf(i)?e:void 0;const a=Ze(e);if(!s){let u;if(a&&(u=Bh[n]))return u;if(n==="hasOwnProperty")return Gh}const l=Reflect.get(e,n,$t(e)?e:i);if((In(n)?Vd.has(n):zh(n))||(s||jt(e,"get",n),r))return l;if($t(l)){const u=a&&jl(n)?l:l.value;return s&&wt(u)?Ho(u):u}return wt(l)?s?Ho(l):$l(l):l}}class Gd extends zd{constructor(e=!1){super(!1,e)}set(e,n,i,s){let r=e[n];const a=Ze(e)&&jl(n);if(!this._isShallow){const d=Li(r);if(!Cn(i)&&!Li(i)&&(r=xt(r),i=xt(i)),!a&&$t(r)&&!$t(i))return d||(r.value=i),!0}const l=a?Number(n)<e.length:gt(e,n),u=Reflect.set(e,n,i,$t(e)?e:s);return e===xt(s)&&(l?$i(i,r)&&ni(e,"set",n,i):ni(e,"add",n,i)),u}deleteProperty(e,n){const i=gt(e,n);e[n];const s=Reflect.deleteProperty(e,n);return s&&i&&ni(e,"delete",n,void 0),s}has(e,n){const i=Reflect.has(e,n);return(!In(n)||!Vd.has(n))&&jt(e,"has",n),i}ownKeys(e){return jt(e,"iterate",Ze(e)?"length":es),Reflect.ownKeys(e)}}class Hh extends zd{constructor(e=!1){super(!0,e)}set(e,n){return!0}deleteProperty(e,n){return!0}}const Wh=new Gd,qh=new Hh,Xh=new Gd(!0);const Go=t=>t,Ir=t=>Reflect.getPrototypeOf(t);function jh(t,e,n){return function(...i){const s=this.__v_raw,r=xt(s),a=ws(r),l=t==="entries"||t===Symbol.iterator&&a,u=t==="keys"&&a,d=s[t](...i),f=n?Go:e?Ls:di;return!e&&jt(r,"iterate",u?zo:es),{next(){const{value:m,done:p}=d.next();return p?{value:m,done:p}:{value:l?[f(m[0]),f(m[1])]:f(m),done:p}},[Symbol.iterator](){return this}}}}function Lr(t){return function(...e){return t==="delete"?!1:t==="clear"?void 0:this}}function Yh(t,e){const n={get(s){const r=this.__v_raw,a=xt(r),l=xt(s);t||($i(s,l)&&jt(a,"get",s),jt(a,"get",l));const{has:u}=Ir(a),d=e?Go:t?Ls:di;if(u.call(a,s))return d(r.get(s));if(u.call(a,l))return d(r.get(l));r!==a&&r.get(s)},get size(){const s=this.__v_raw;return!t&&jt(xt(s),"iterate",es),s.size},has(s){const r=this.__v_raw,a=xt(r),l=xt(s);return t||($i(s,l)&&jt(a,"has",s),jt(a,"has",l)),s===l?r.has(s):r.has(s)||r.has(l)},forEach(s,r){const a=this,l=a.__v_raw,u=xt(l),d=e?Go:t?Ls:di;return!t&&jt(u,"iterate",es),l.forEach((f,m)=>s.call(r,d(f),d(m),a))}};return nn(n,t?{add:Lr("add"),set:Lr("set"),delete:Lr("delete"),clear:Lr("clear")}:{add(s){!e&&!Cn(s)&&!Li(s)&&(s=xt(s));const r=xt(this);return Ir(r).has.call(r,s)||(r.add(s),ni(r,"add",s,s)),this},set(s,r){!e&&!Cn(r)&&!Li(r)&&(r=xt(r));const a=xt(this),{has:l,get:u}=Ir(a);let d=l.call(a,s);d||(s=xt(s),d=l.call(a,s));const f=u.call(a,s);return a.set(s,r),d?$i(r,f)&&ni(a,"set",s,r):ni(a,"add",s,r),this},delete(s){const r=xt(this),{has:a,get:l}=Ir(r);let u=a.call(r,s);u||(s=xt(s),u=a.call(r,s)),l&&l.call(r,s);const d=r.delete(s);return u&&ni(r,"delete",s,void 0),d},clear(){const s=xt(this),r=s.size!==0,a=s.clear();return r&&ni(s,"clear",void 0,void 0),a}}),["keys","values","entries",Symbol.iterator].forEach(s=>{n[s]=jh(s,t,e)}),n}function Ql(t,e){const n=Yh(t,e);return(i,s,r)=>s==="__v_isReactive"?!t:s==="__v_isReadonly"?t:s==="__v_raw"?i:Reflect.get(gt(n,s)&&s in i?n:i,s,r)}const Kh={get:Ql(!1,!1)},Jh={get:Ql(!1,!0)},Zh={get:Ql(!0,!1)};const Hd=new WeakMap,Wd=new WeakMap,qd=new WeakMap,Qh=new WeakMap;function $h(t){switch(t){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function ep(t){return t.__v_skip||!Object.isExtensible(t)?0:$h(Eh(t))}function $l(t){return Li(t)?t:ec(t,!1,Wh,Kh,Hd)}function tp(t){return ec(t,!1,Xh,Jh,Wd)}function Ho(t){return ec(t,!0,qh,Zh,qd)}function ec(t,e,n,i,s){if(!wt(t)||t.__v_raw&&!(e&&t.__v_isReactive))return t;const r=ep(t);if(r===0)return t;const a=s.get(t);if(a)return a;const l=new Proxy(t,r===2?i:n);return s.set(t,l),l}function ts(t){return Li(t)?ts(t.__v_raw):!!(t&&t.__v_isReactive)}function Li(t){return!!(t&&t.__v_isReadonly)}function Cn(t){return!!(t&&t.__v_isShallow)}function tc(t){return t?!!t.__v_raw:!1}function xt(t){const e=t&&t.__v_raw;return e?xt(e):t}function np(t){return!gt(t,"__v_skip")&&Object.isExtensible(t)&&Ad(t,"__v_skip",!0),t}const di=t=>wt(t)?$l(t):t,Ls=t=>wt(t)?Ho(t):t;function $t(t){return t?t.__v_isRef===!0:!1}function ip(t){return $t(t)?t.value:t}const sp={get:(t,e,n)=>e==="__v_raw"?t:ip(Reflect.get(t,e,n)),set:(t,e,n,i)=>{const s=t[e];return $t(s)&&!$t(n)?(s.value=n,!0):Reflect.set(t,e,n,i)}};function Xd(t){return ts(t)?t:new Proxy(t,sp)}class rp{constructor(e,n,i){this.fn=e,this.setter=n,this._value=void 0,this.dep=new Od(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=pr-1,this.next=void 0,this.effect=this,this.__v_isReadonly=!n,this.isSSR=i}notify(){if(this.flags|=16,!(this.flags&8)&&Et!==this)return Dd(this,!0),!0}get value(){const e=this.dep.track();return Fd(this),e&&(e.version=this.dep.version),this._value}set value(e){this.setter&&this.setter(e)}}function ap(t,e,n=!1){let i,s;return it(t)?i=t:(i=t.get,s=t.set),new rp(i,s,n)}const Dr={},ma=new WeakMap;let ji;function op(t,e=!1,n=ji){if(n){let i=ma.get(n);i||ma.set(n,i=[]),i.push(t)}}function lp(t,e,n=Mt){const{immediate:i,deep:s,once:r,scheduler:a,augmentJob:l,call:u}=n,d=b=>s?b:Cn(b)||s===!1||s===0?ii(b,1):ii(b);let f,m,p,o,h=!1,y=!1;if($t(t)?(m=()=>t.value,h=Cn(t)):ts(t)?(m=()=>d(t),h=!0):Ze(t)?(y=!0,h=t.some(b=>ts(b)||Cn(b)),m=()=>t.map(b=>{if($t(b))return b.value;if(ts(b))return d(b);if(it(b))return u?u(b,2):b()})):it(t)?e?m=u?()=>u(t,2):t:m=()=>{if(p){ci();try{p()}finally{ui()}}const b=ji;ji=f;try{return u?u(t,3,[o]):t(o)}finally{ji=b}}:m=Gn,e&&s){const b=m,L=s===!0?1/0:s;m=()=>ii(b(),L)}const _=Fh(),g=()=>{f.stop(),_&&_.active&&Xl(_.effects,f)};if(r&&e){const b=e;e=(...L)=>{b(...L),g()}}let S=y?new Array(t.length).fill(Dr):Dr;const E=b=>{if(!(!(f.flags&1)||!f.dirty&&!b))if(e){const L=f.run();if(s||h||(y?L.some((w,D)=>$i(w,S[D])):$i(L,S))){p&&p();const w=ji;ji=f;try{const D=[L,S===Dr?void 0:y&&S[0]===Dr?[]:S,o];S=L,u?u(e,3,D):e(...D)}finally{ji=w}}}else f.run()};return l&&l(E),f=new Id(m),f.scheduler=a?()=>a(E,!1):E,o=b=>op(b,!1,f),p=f.onStop=()=>{const b=ma.get(f);if(b){if(u)u(b,4);else for(const L of b)L();ma.delete(f)}},e?i?E(!0):S=f.run():a?a(E.bind(null,!0),!0):f.run(),g.pause=f.pause.bind(f),g.resume=f.resume.bind(f),g.stop=g,g}function ii(t,e=1/0,n){if(e<=0||!wt(t)||t.__v_skip||(n=n||new Map,(n.get(t)||0)>=e))return t;if(n.set(t,e),e--,$t(t))ii(t.value,e,n);else if(Ze(t))for(let i=0;i<t.length;i++)ii(t[i],e,n);else if(Bs(t)||ws(t))t.forEach(i=>{ii(i,e,n)});else if(wd(t)){for(const i in t)ii(t[i],e,n);for(const i of Object.getOwnPropertySymbols(t))Object.prototype.propertyIsEnumerable.call(t,i)&&ii(t[i],e,n)}return t}/**
* @vue/runtime-core v3.5.26
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function Tr(t,e,n,i){try{return i?t(...i):t()}catch(s){Ua(s,e,n)}}function qn(t,e,n,i){if(it(t)){const s=Tr(t,e,n,i);return s&&Td(s)&&s.catch(r=>{Ua(r,e,n)}),s}if(Ze(t)){const s=[];for(let r=0;r<t.length;r++)s.push(qn(t[r],e,n,i));return s}}function Ua(t,e,n,i=!0){const s=e?e.vnode:null,{errorHandler:r,throwUnhandledErrorInProduction:a}=e&&e.appContext.config||Mt;if(e){let l=e.parent;const u=e.proxy,d=`https://vuejs.org/error-reference/#runtime-${n}`;for(;l;){const f=l.ec;if(f){for(let m=0;m<f.length;m++)if(f[m](t,u,d)===!1)return}l=l.parent}if(r){ci(),Tr(r,null,10,[t,u,d]),ui();return}}cp(t,n,s,i,a)}function cp(t,e,n,i=!0,s=!1){if(s)throw t;console.error(t)}const Qt=[];let kn=-1;const As=[];let Pi=null,Ts=0;const jd=Promise.resolve();let ga=null;function Yd(t){const e=ga||jd;return t?e.then(this?t.bind(this):t):e}function up(t){let e=kn+1,n=Qt.length;for(;e<n;){const i=e+n>>>1,s=Qt[i],r=gr(s);r<t||r===t&&s.flags&2?e=i+1:n=i}return e}function nc(t){if(!(t.flags&1)){const e=gr(t),n=Qt[Qt.length-1];!n||!(t.flags&2)&&e>=gr(n)?Qt.push(t):Qt.splice(up(e),0,t),t.flags|=1,Kd()}}function Kd(){ga||(ga=jd.then(Zd))}function dp(t){Ze(t)?As.push(...t):Pi&&t.id===-1?Pi.splice(Ts+1,0,t):t.flags&1||(As.push(t),t.flags|=1),Kd()}function Vc(t,e,n=kn+1){for(;n<Qt.length;n++){const i=Qt[n];if(i&&i.flags&2){if(t&&i.id!==t.uid)continue;Qt.splice(n,1),n--,i.flags&4&&(i.flags&=-2),i(),i.flags&4||(i.flags&=-2)}}}function Jd(t){if(As.length){const e=[...new Set(As)].sort((n,i)=>gr(n)-gr(i));if(As.length=0,Pi){Pi.push(...e);return}for(Pi=e,Ts=0;Ts<Pi.length;Ts++){const n=Pi[Ts];n.flags&4&&(n.flags&=-2),n.flags&8||n(),n.flags&=-2}Pi=null,Ts=0}}const gr=t=>t.id==null?t.flags&2?-1:1/0:t.id;function Zd(t){try{for(kn=0;kn<Qt.length;kn++){const e=Qt[kn];e&&!(e.flags&8)&&(e.flags&4&&(e.flags&=-2),Tr(e,e.i,e.i?15:14),e.flags&4||(e.flags&=-2))}}finally{for(;kn<Qt.length;kn++){const e=Qt[kn];e&&(e.flags&=-2)}kn=-1,Qt.length=0,Jd(),ga=null,(Qt.length||As.length)&&Zd()}}let zt=null,Qd=null;function _a(t){const e=zt;return zt=t,Qd=t&&t.type.__scopeId||null,e}function tr(t,e=zt,n){if(!e||t._n)return t;const i=(...s)=>{i._d&&Qc(-1);const r=_a(e);let a;try{a=t(...s)}finally{_a(r),i._d&&Qc(1)}return a};return i._n=!0,i._c=!0,i._d=!0,i}function Me(t,e){if(zt===null)return t;const n=Ba(zt),i=t.dirs||(t.dirs=[]);for(let s=0;s<e.length;s++){let[r,a,l,u=Mt]=e[s];r&&(it(r)&&(r={mounted:r,updated:r}),r.deep&&ii(a),i.push({dir:r,instance:n,value:a,oldValue:void 0,arg:l,modifiers:u}))}return t}function Oi(t,e,n,i){const s=t.dirs,r=e&&e.dirs;for(let a=0;a<s.length;a++){const l=s[a];r&&(l.oldValue=r[a].value);let u=l.dir[i];u&&(ci(),qn(u,n,8,[t.el,l,t,e]),ui())}}function fp(t,e){if(Yt){let n=Yt.provides;const i=Yt.parent&&Yt.parent.provides;i===n&&(n=Yt.provides=Object.create(i)),n[t]=e}}function ra(t,e,n=!1){const i=hm();if(i||Cs){let s=Cs?Cs._context.provides:i?i.parent==null||i.ce?i.vnode.appContext&&i.vnode.appContext.provides:i.parent.provides:void 0;if(s&&t in s)return s[t];if(arguments.length>1)return n&&it(e)?e.call(i&&i.proxy):e}}const hp=Symbol.for("v-scx"),pp=()=>ra(hp);function Qa(t,e,n){return $d(t,e,n)}function $d(t,e,n=Mt){const{immediate:i,deep:s,flush:r,once:a}=n,l=nn({},n),u=e&&i||!e&&r!=="post";let d;if(yr){if(r==="sync"){const o=pp();d=o.__watcherHandles||(o.__watcherHandles=[])}else if(!u){const o=()=>{};return o.stop=Gn,o.resume=Gn,o.pause=Gn,o}}const f=Yt;l.call=(o,h,y)=>qn(o,f,h,y);let m=!1;r==="post"?l.scheduler=o=>{fn(o,f&&f.suspense)}:r!=="sync"&&(m=!0,l.scheduler=(o,h)=>{h?o():nc(o)}),l.augmentJob=o=>{e&&(o.flags|=4),m&&(o.flags|=2,f&&(o.id=f.uid,o.i=f))};const p=lp(t,e,l);return yr&&(d?d.push(p):u&&p()),p}function mp(t,e,n){const i=this.proxy,s=Ut(t)?t.includes(".")?ef(i,t):()=>i[t]:t.bind(i,i);let r;it(e)?r=e:(r=e.handler,n=e);const a=Er(this),l=$d(s,r.bind(i),n);return a(),l}function ef(t,e){const n=e.split(".");return()=>{let i=t;for(let s=0;s<n.length&&i;s++)i=i[n[s]];return i}}const gp=Symbol("_vte"),_p=t=>t.__isTeleport,vp=Symbol("_leaveCb");function ic(t,e){t.shapeFlag&6&&t.component?(t.transition=e,ic(t.component.subTree,e)):t.shapeFlag&128?(t.ssContent.transition=e.clone(t.ssContent),t.ssFallback.transition=e.clone(t.ssFallback)):t.transition=e}function tf(t){t.ids=[t.ids[0]+t.ids[2]+++"-",0,0]}const va=new WeakMap;function cr(t,e,n,i,s=!1){if(Ze(t)){t.forEach((h,y)=>cr(h,e&&(Ze(e)?e[y]:e),n,i,s));return}if(Ps(i)&&!s){i.shapeFlag&512&&i.type.__asyncResolved&&i.component.subTree.component&&cr(t,e,n,i.component.subTree);return}const r=i.shapeFlag&4?Ba(i.component):i.el,a=s?null:r,{i:l,r:u}=t,d=e&&e.r,f=l.refs===Mt?l.refs={}:l.refs,m=l.setupState,p=xt(m),o=m===Mt?Md:h=>gt(p,h);if(d!=null&&d!==u){if(zc(e),Ut(d))f[d]=null,o(d)&&(m[d]=null);else if($t(d)){d.value=null;const h=e;h.k&&(f[h.k]=null)}}if(it(u))Tr(u,l,12,[a,f]);else{const h=Ut(u),y=$t(u);if(h||y){const _=()=>{if(t.f){const g=h?o(u)?m[u]:f[u]:u.value;if(s)Ze(g)&&Xl(g,r);else if(Ze(g))g.includes(r)||g.push(r);else if(h)f[u]=[r],o(u)&&(m[u]=f[u]);else{const S=[r];u.value=S,t.k&&(f[t.k]=S)}}else h?(f[u]=a,o(u)&&(m[u]=a)):y&&(u.value=a,t.k&&(f[t.k]=a))};if(a){const g=()=>{_(),va.delete(t)};g.id=-1,va.set(t,g),fn(g,n)}else zc(t),_()}}}function zc(t){const e=va.get(t);e&&(e.flags|=8,va.delete(t))}Da().requestIdleCallback;Da().cancelIdleCallback;const Ps=t=>!!t.type.__asyncLoader,nf=t=>t.type.__isKeepAlive;function yp(t,e){sf(t,"a",e)}function xp(t,e){sf(t,"da",e)}function sf(t,e,n=Yt){const i=t.__wdc||(t.__wdc=()=>{let s=n;for(;s;){if(s.isDeactivated)return;s=s.parent}return t()});if(Fa(e,i,n),n){let s=n.parent;for(;s&&s.parent;)nf(s.parent.vnode)&&Sp(i,e,n,s),s=s.parent}}function Sp(t,e,n,i){const s=Fa(e,t,i,!0);rf(()=>{Xl(i[e],s)},n)}function Fa(t,e,n=Yt,i=!1){if(n){const s=n[t]||(n[t]=[]),r=e.__weh||(e.__weh=(...a)=>{ci();const l=Er(n),u=qn(e,n,t,a);return l(),ui(),u});return i?s.unshift(r):s.push(r),r}}const mi=t=>(e,n=Yt)=>{(!yr||t==="sp")&&Fa(t,(...i)=>e(...i),n)},bp=mi("bm"),Mp=mi("m"),Tp=mi("bu"),Ep=mi("u"),wp=mi("bum"),rf=mi("um"),Ap=mi("sp"),Pp=mi("rtg"),Cp=mi("rtc");function Rp(t,e=Yt){Fa("ec",t,e)}const Ip="components";function Bi(t,e){return Dp(Ip,t,!0,e)||t}const Lp=Symbol.for("v-ndc");function Dp(t,e,n=!0,i=!1){const s=zt||Yt;if(s){const r=s.type;{const l=vm(r,!1);if(l&&(l===e||l===bn(e)||l===Ia(bn(e))))return r}const a=Gc(s[t]||r[t],e)||Gc(s.appContext[t],e);return!a&&i?r:a}}function Gc(t,e){return t&&(t[e]||t[bn(e)]||t[Ia(bn(e))])}function ze(t,e,n,i){let s;const r=n,a=Ze(t);if(a||Ut(t)){const l=a&&ts(t);let u=!1,d=!1;l&&(u=!Cn(t),d=Li(t),t=Na(t)),s=new Array(t.length);for(let f=0,m=t.length;f<m;f++)s[f]=e(u?d?Ls(di(t[f])):di(t[f]):t[f],f,void 0,r)}else if(typeof t=="number"){s=new Array(t);for(let l=0;l<t;l++)s[l]=e(l+1,l,void 0,r)}else if(wt(t))if(t[Symbol.iterator])s=Array.from(t,(l,u)=>e(l,u,void 0,r));else{const l=Object.keys(t);s=new Array(l.length);for(let u=0,d=l.length;u<d;u++){const f=l[u];s[u]=e(t[f],f,u,r)}}else s=[];return s}function Hc(t,e,n={},i,s){if(zt.ce||zt.parent&&Ps(zt.parent)&&zt.parent.ce){const d=Object.keys(n).length>0;return e!=="default"&&(n.name=e),A(),vr(we,null,[Bt("slot",n,i)],d?-2:64)}let r=t[e];r&&r._c&&(r._d=!1),A();const a=r&&af(r(n)),l=n.key||a&&a.key,u=vr(we,{key:(l&&!In(l)?l:`_${e}`)+(!a&&i?"_fb":"")},a||[],a&&t._===1?64:-2);return r&&r._c&&(r._d=!0),u}function af(t){return t.some(e=>ac(e)?!(e.type===fi||e.type===we&&!af(e.children)):!0)?t:null}const Wo=t=>t?Ef(t)?Ba(t):Wo(t.parent):null,ur=nn(Object.create(null),{$:t=>t,$el:t=>t.vnode.el,$data:t=>t.data,$props:t=>t.props,$attrs:t=>t.attrs,$slots:t=>t.slots,$refs:t=>t.refs,$parent:t=>Wo(t.parent),$root:t=>Wo(t.root),$host:t=>t.ce,$emit:t=>t.emit,$options:t=>lf(t),$forceUpdate:t=>t.f||(t.f=()=>{nc(t.update)}),$nextTick:t=>t.n||(t.n=Yd.bind(t.proxy)),$watch:t=>mp.bind(t)}),$a=(t,e)=>t!==Mt&&!t.__isScriptSetup&&gt(t,e),Np={get({_:t},e){if(e==="__v_skip")return!0;const{ctx:n,setupState:i,data:s,props:r,accessCache:a,type:l,appContext:u}=t;if(e[0]!=="$"){const p=a[e];if(p!==void 0)switch(p){case 1:return i[e];case 2:return s[e];case 4:return n[e];case 3:return r[e]}else{if($a(i,e))return a[e]=1,i[e];if(s!==Mt&&gt(s,e))return a[e]=2,s[e];if(gt(r,e))return a[e]=3,r[e];if(n!==Mt&&gt(n,e))return a[e]=4,n[e];qo&&(a[e]=0)}}const d=ur[e];let f,m;if(d)return e==="$attrs"&&jt(t.attrs,"get",""),d(t);if((f=l.__cssModules)&&(f=f[e]))return f;if(n!==Mt&&gt(n,e))return a[e]=4,n[e];if(m=u.config.globalProperties,gt(m,e))return m[e]},set({_:t},e,n){const{data:i,setupState:s,ctx:r}=t;return $a(s,e)?(s[e]=n,!0):i!==Mt&&gt(i,e)?(i[e]=n,!0):gt(t.props,e)||e[0]==="$"&&e.slice(1)in t?!1:(r[e]=n,!0)},has({_:{data:t,setupState:e,accessCache:n,ctx:i,appContext:s,props:r,type:a}},l){let u;return!!(n[l]||t!==Mt&&l[0]!=="$"&&gt(t,l)||$a(e,l)||gt(r,l)||gt(i,l)||gt(ur,l)||gt(s.config.globalProperties,l)||(u=a.__cssModules)&&u[l])},defineProperty(t,e,n){return n.get!=null?t._.accessCache[e]=0:gt(n,"value")&&this.set(t,e,n.value,null),Reflect.defineProperty(t,e,n)}};function Wc(t){return Ze(t)?t.reduce((e,n)=>(e[n]=null,e),{}):t}let qo=!0;function Up(t){const e=lf(t),n=t.proxy,i=t.ctx;qo=!1,e.beforeCreate&&qc(e.beforeCreate,t,"bc");const{data:s,computed:r,methods:a,watch:l,provide:u,inject:d,created:f,beforeMount:m,mounted:p,beforeUpdate:o,updated:h,activated:y,deactivated:_,beforeDestroy:g,beforeUnmount:S,destroyed:E,unmounted:b,render:L,renderTracked:w,renderTriggered:D,errorCaptured:x,serverPrefetch:R,expose:O,inheritAttrs:U,components:W,directives:ee,filters:le}=e;if(d&&Fp(d,i,null),a)for(const z in a){const te=a[z];it(te)&&(i[z]=te.bind(n))}if(s){const z=s.call(n,n);wt(z)&&(t.data=$l(z))}if(qo=!0,r)for(const z in r){const te=r[z],de=it(te)?te.bind(n,n):it(te.get)?te.get.bind(n,n):Gn,Ee=!it(te)&&it(te.set)?te.set.bind(n):Gn,De=xm({get:de,set:Ee});Object.defineProperty(i,z,{enumerable:!0,configurable:!0,get:()=>De.value,set:Fe=>De.value=Fe})}if(l)for(const z in l)of(l[z],i,n,z);if(u){const z=it(u)?u.call(n):u;Reflect.ownKeys(z).forEach(te=>{fp(te,z[te])})}f&&qc(f,t,"c");function q(z,te){Ze(te)?te.forEach(de=>z(de.bind(n))):te&&z(te.bind(n))}if(q(bp,m),q(Mp,p),q(Tp,o),q(Ep,h),q(yp,y),q(xp,_),q(Rp,x),q(Cp,w),q(Pp,D),q(wp,S),q(rf,b),q(Ap,R),Ze(O))if(O.length){const z=t.exposed||(t.exposed={});O.forEach(te=>{Object.defineProperty(z,te,{get:()=>n[te],set:de=>n[te]=de,enumerable:!0})})}else t.exposed||(t.exposed={});L&&t.render===Gn&&(t.render=L),U!=null&&(t.inheritAttrs=U),W&&(t.components=W),ee&&(t.directives=ee),R&&tf(t)}function Fp(t,e,n=Gn){Ze(t)&&(t=Xo(t));for(const i in t){const s=t[i];let r;wt(s)?"default"in s?r=ra(s.from||i,s.default,!0):r=ra(s.from||i):r=ra(s),$t(r)?Object.defineProperty(e,i,{enumerable:!0,configurable:!0,get:()=>r.value,set:a=>r.value=a}):e[i]=r}}function qc(t,e,n){qn(Ze(t)?t.map(i=>i.bind(e.proxy)):t.bind(e.proxy),e,n)}function of(t,e,n,i){let s=i.includes(".")?ef(n,i):()=>n[i];if(Ut(t)){const r=e[t];it(r)&&Qa(s,r)}else if(it(t))Qa(s,t.bind(n));else if(wt(t))if(Ze(t))t.forEach(r=>of(r,e,n,i));else{const r=it(t.handler)?t.handler.bind(n):e[t.handler];it(r)&&Qa(s,r,t)}}function lf(t){const e=t.type,{mixins:n,extends:i}=e,{mixins:s,optionsCache:r,config:{optionMergeStrategies:a}}=t.appContext,l=r.get(e);let u;return l?u=l:!s.length&&!n&&!i?u=e:(u={},s.length&&s.forEach(d=>ya(u,d,a,!0)),ya(u,e,a)),wt(e)&&r.set(e,u),u}function ya(t,e,n,i=!1){const{mixins:s,extends:r}=e;r&&ya(t,r,n,!0),s&&s.forEach(a=>ya(t,a,n,!0));for(const a in e)if(!(i&&a==="expose")){const l=kp[a]||n&&n[a];t[a]=l?l(t[a],e[a]):e[a]}return t}const kp={data:Xc,props:jc,emits:jc,methods:nr,computed:nr,beforeCreate:Jt,created:Jt,beforeMount:Jt,mounted:Jt,beforeUpdate:Jt,updated:Jt,beforeDestroy:Jt,beforeUnmount:Jt,destroyed:Jt,unmounted:Jt,activated:Jt,deactivated:Jt,errorCaptured:Jt,serverPrefetch:Jt,components:nr,directives:nr,watch:Bp,provide:Xc,inject:Op};function Xc(t,e){return e?t?function(){return nn(it(t)?t.call(this,this):t,it(e)?e.call(this,this):e)}:e:t}function Op(t,e){return nr(Xo(t),Xo(e))}function Xo(t){if(Ze(t)){const e={};for(let n=0;n<t.length;n++)e[t[n]]=t[n];return e}return t}function Jt(t,e){return t?[...new Set([].concat(t,e))]:e}function nr(t,e){return t?nn(Object.create(null),t,e):e}function jc(t,e){return t?Ze(t)&&Ze(e)?[...new Set([...t,...e])]:nn(Object.create(null),Wc(t),Wc(e??{})):e}function Bp(t,e){if(!t)return e;if(!e)return t;const n=nn(Object.create(null),t);for(const i in e)n[i]=Jt(t[i],e[i]);return n}function cf(){return{app:null,config:{isNativeTag:Md,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let Vp=0;function zp(t,e){return function(i,s=null){it(i)||(i=nn({},i)),s!=null&&!wt(s)&&(s=null);const r=cf(),a=new WeakSet,l=[];let u=!1;const d=r.app={_uid:Vp++,_component:i,_props:s,_container:null,_context:r,_instance:null,version:Sm,get config(){return r.config},set config(f){},use(f,...m){return a.has(f)||(f&&it(f.install)?(a.add(f),f.install(d,...m)):it(f)&&(a.add(f),f(d,...m))),d},mixin(f){return r.mixins.includes(f)||r.mixins.push(f),d},component(f,m){return m?(r.components[f]=m,d):r.components[f]},directive(f,m){return m?(r.directives[f]=m,d):r.directives[f]},mount(f,m,p){if(!u){const o=d._ceVNode||Bt(i,s);return o.appContext=r,p===!0?p="svg":p===!1&&(p=void 0),t(o,f,p),u=!0,d._container=f,f.__vue_app__=d,Ba(o.component)}},onUnmount(f){l.push(f)},unmount(){u&&(qn(l,d._instance,16),t(null,d._container),delete d._container.__vue_app__)},provide(f,m){return r.provides[f]=m,d},runWithContext(f){const m=Cs;Cs=d;try{return f()}finally{Cs=m}}};return d}}let Cs=null;const Gp=(t,e)=>e==="modelValue"||e==="model-value"?t.modelModifiers:t[`${e}Modifiers`]||t[`${bn(e)}Modifiers`]||t[`${rs(e)}Modifiers`];function Hp(t,e,...n){if(t.isUnmounted)return;const i=t.vnode.props||Mt;let s=n;const r=e.startsWith("update:"),a=r&&Gp(i,e.slice(7));a&&(a.trim&&(s=n.map(f=>Ut(f)?f.trim():f)),a.number&&(s=n.map(La)));let l,u=i[l=ja(e)]||i[l=ja(bn(e))];!u&&r&&(u=i[l=ja(rs(e))]),u&&qn(u,t,6,s);const d=i[l+"Once"];if(d){if(!t.emitted)t.emitted={};else if(t.emitted[l])return;t.emitted[l]=!0,qn(d,t,6,s)}}const Wp=new WeakMap;function uf(t,e,n=!1){const i=n?Wp:e.emitsCache,s=i.get(t);if(s!==void 0)return s;const r=t.emits;let a={},l=!1;if(!it(t)){const u=d=>{const f=uf(d,e,!0);f&&(l=!0,nn(a,f))};!n&&e.mixins.length&&e.mixins.forEach(u),t.extends&&u(t.extends),t.mixins&&t.mixins.forEach(u)}return!r&&!l?(wt(t)&&i.set(t,null),null):(Ze(r)?r.forEach(u=>a[u]=null):nn(a,r),wt(t)&&i.set(t,a),a)}function ka(t,e){return!t||!Ca(e)?!1:(e=e.slice(2).replace(/Once$/,""),gt(t,e[0].toLowerCase()+e.slice(1))||gt(t,rs(e))||gt(t,e))}function Yc(t){const{type:e,vnode:n,proxy:i,withProxy:s,propsOptions:[r],slots:a,attrs:l,emit:u,render:d,renderCache:f,props:m,data:p,setupState:o,ctx:h,inheritAttrs:y}=t,_=_a(t);let g,S;try{if(n.shapeFlag&4){const b=s||i,L=b;g=On(d.call(L,b,f,m,o,p,h)),S=l}else{const b=e;g=On(b.length>1?b(m,{attrs:l,slots:a,emit:u}):b(m,null)),S=e.props?l:qp(l)}}catch(b){dr.length=0,Ua(b,t,1),g=Bt(fi)}let E=g;if(S&&y!==!1){const b=Object.keys(S),{shapeFlag:L}=E;b.length&&L&7&&(r&&b.some(ql)&&(S=Xp(S,r)),E=Ds(E,S,!1,!0))}return n.dirs&&(E=Ds(E,null,!1,!0),E.dirs=E.dirs?E.dirs.concat(n.dirs):n.dirs),n.transition&&ic(E,n.transition),g=E,_a(_),g}const qp=t=>{let e;for(const n in t)(n==="class"||n==="style"||Ca(n))&&((e||(e={}))[n]=t[n]);return e},Xp=(t,e)=>{const n={};for(const i in t)(!ql(i)||!(i.slice(9)in e))&&(n[i]=t[i]);return n};function jp(t,e,n){const{props:i,children:s,component:r}=t,{props:a,children:l,patchFlag:u}=e,d=r.emitsOptions;if(e.dirs||e.transition)return!0;if(n&&u>=0){if(u&1024)return!0;if(u&16)return i?Kc(i,a,d):!!a;if(u&8){const f=e.dynamicProps;for(let m=0;m<f.length;m++){const p=f[m];if(a[p]!==i[p]&&!ka(d,p))return!0}}}else return(s||l)&&(!l||!l.$stable)?!0:i===a?!1:i?a?Kc(i,a,d):!0:!!a;return!1}function Kc(t,e,n){const i=Object.keys(e);if(i.length!==Object.keys(t).length)return!0;for(let s=0;s<i.length;s++){const r=i[s];if(e[r]!==t[r]&&!ka(n,r))return!0}return!1}function Yp({vnode:t,parent:e},n){for(;e;){const i=e.subTree;if(i.suspense&&i.suspense.activeBranch===t&&(i.el=t.el),i===t)(t=e.vnode).el=n,e=e.parent;else break}}const df={},ff=()=>Object.create(df),hf=t=>Object.getPrototypeOf(t)===df;function Kp(t,e,n,i=!1){const s={},r=ff();t.propsDefaults=Object.create(null),pf(t,e,s,r);for(const a in t.propsOptions[0])a in s||(s[a]=void 0);n?t.props=i?s:tp(s):t.type.props?t.props=s:t.props=r,t.attrs=r}function Jp(t,e,n,i){const{props:s,attrs:r,vnode:{patchFlag:a}}=t,l=xt(s),[u]=t.propsOptions;let d=!1;if((i||a>0)&&!(a&16)){if(a&8){const f=t.vnode.dynamicProps;for(let m=0;m<f.length;m++){let p=f[m];if(ka(t.emitsOptions,p))continue;const o=e[p];if(u)if(gt(r,p))o!==r[p]&&(r[p]=o,d=!0);else{const h=bn(p);s[h]=jo(u,l,h,o,t,!1)}else o!==r[p]&&(r[p]=o,d=!0)}}}else{pf(t,e,s,r)&&(d=!0);let f;for(const m in l)(!e||!gt(e,m)&&((f=rs(m))===m||!gt(e,f)))&&(u?n&&(n[m]!==void 0||n[f]!==void 0)&&(s[m]=jo(u,l,m,void 0,t,!0)):delete s[m]);if(r!==l)for(const m in r)(!e||!gt(e,m))&&(delete r[m],d=!0)}d&&ni(t.attrs,"set","")}function pf(t,e,n,i){const[s,r]=t.propsOptions;let a=!1,l;if(e)for(let u in e){if(ar(u))continue;const d=e[u];let f;s&&gt(s,f=bn(u))?!r||!r.includes(f)?n[f]=d:(l||(l={}))[f]=d:ka(t.emitsOptions,u)||(!(u in i)||d!==i[u])&&(i[u]=d,a=!0)}if(r){const u=xt(n),d=l||Mt;for(let f=0;f<r.length;f++){const m=r[f];n[m]=jo(s,u,m,d[m],t,!gt(d,m))}}return a}function jo(t,e,n,i,s,r){const a=t[n];if(a!=null){const l=gt(a,"default");if(l&&i===void 0){const u=a.default;if(a.type!==Function&&!a.skipFactory&&it(u)){const{propsDefaults:d}=s;if(n in d)i=d[n];else{const f=Er(s);i=d[n]=u.call(null,e),f()}}else i=u;s.ce&&s.ce._setProp(n,i)}a[0]&&(r&&!l?i=!1:a[1]&&(i===""||i===rs(n))&&(i=!0))}return i}const Zp=new WeakMap;function mf(t,e,n=!1){const i=n?Zp:e.propsCache,s=i.get(t);if(s)return s;const r=t.props,a={},l=[];let u=!1;if(!it(t)){const f=m=>{u=!0;const[p,o]=mf(m,e,!0);nn(a,p),o&&l.push(...o)};!n&&e.mixins.length&&e.mixins.forEach(f),t.extends&&f(t.extends),t.mixins&&t.mixins.forEach(f)}if(!r&&!u)return wt(t)&&i.set(t,Es),Es;if(Ze(r))for(let f=0;f<r.length;f++){const m=bn(r[f]);Jc(m)&&(a[m]=Mt)}else if(r)for(const f in r){const m=bn(f);if(Jc(m)){const p=r[f],o=a[m]=Ze(p)||it(p)?{type:p}:nn({},p),h=o.type;let y=!1,_=!0;if(Ze(h))for(let g=0;g<h.length;++g){const S=h[g],E=it(S)&&S.name;if(E==="Boolean"){y=!0;break}else E==="String"&&(_=!1)}else y=it(h)&&h.name==="Boolean";o[0]=y,o[1]=_,(y||gt(o,"default"))&&l.push(m)}}const d=[a,l];return wt(t)&&i.set(t,d),d}function Jc(t){return t[0]!=="$"&&!ar(t)}const sc=t=>t==="_"||t==="_ctx"||t==="$stable",rc=t=>Ze(t)?t.map(On):[On(t)],Qp=(t,e,n)=>{if(e._n)return e;const i=tr((...s)=>rc(e(...s)),n);return i._c=!1,i},gf=(t,e,n)=>{const i=t._ctx;for(const s in t){if(sc(s))continue;const r=t[s];if(it(r))e[s]=Qp(s,r,i);else if(r!=null){const a=rc(r);e[s]=()=>a}}},_f=(t,e)=>{const n=rc(e);t.slots.default=()=>n},vf=(t,e,n)=>{for(const i in e)(n||!sc(i))&&(t[i]=e[i])},$p=(t,e,n)=>{const i=t.slots=ff();if(t.vnode.shapeFlag&32){const s=e._;s?(vf(i,e,n),n&&Ad(i,"_",s,!0)):gf(e,i)}else e&&_f(t,e)},em=(t,e,n)=>{const{vnode:i,slots:s}=t;let r=!0,a=Mt;if(i.shapeFlag&32){const l=e._;l?n&&l===1?r=!1:vf(s,e,n):(r=!e.$stable,gf(e,s)),a=e}else e&&(_f(t,e),a={default:1});if(r)for(const l in s)!sc(l)&&a[l]==null&&delete s[l]},fn=rm;function tm(t){return nm(t)}function nm(t,e){const n=Da();n.__VUE__=!0;const{insert:i,remove:s,patchProp:r,createElement:a,createText:l,createComment:u,setText:d,setElementText:f,parentNode:m,nextSibling:p,setScopeId:o=Gn,insertStaticContent:h}=t,y=(I,N,j,ne=null,J=null,se=null,fe=void 0,me=null,C=!!N.dynamicChildren)=>{if(I===N)return;I&&!qs(I,N)&&(ne=Ae(I),Fe(I,J,se,!0),I=null),N.patchFlag===-2&&(C=!1,N.dynamicChildren=null);const{type:re,ref:ve,shapeFlag:he}=N;switch(re){case Oa:_(I,N,j,ne);break;case fi:g(I,N,j,ne);break;case aa:I==null&&S(N,j,ne,fe);break;case we:W(I,N,j,ne,J,se,fe,me,C);break;default:he&1?L(I,N,j,ne,J,se,fe,me,C):he&6?ee(I,N,j,ne,J,se,fe,me,C):(he&64||he&128)&&re.process(I,N,j,ne,J,se,fe,me,C,Ye)}ve!=null&&J?cr(ve,I&&I.ref,se,N||I,!N):ve==null&&I&&I.ref!=null&&cr(I.ref,null,se,I,!0)},_=(I,N,j,ne)=>{if(I==null)i(N.el=l(N.children),j,ne);else{const J=N.el=I.el;N.children!==I.children&&d(J,N.children)}},g=(I,N,j,ne)=>{I==null?i(N.el=u(N.children||""),j,ne):N.el=I.el},S=(I,N,j,ne)=>{[I.el,I.anchor]=h(I.children,N,j,ne,I.el,I.anchor)},E=({el:I,anchor:N},j,ne)=>{let J;for(;I&&I!==N;)J=p(I),i(I,j,ne),I=J;i(N,j,ne)},b=({el:I,anchor:N})=>{let j;for(;I&&I!==N;)j=p(I),s(I),I=j;s(N)},L=(I,N,j,ne,J,se,fe,me,C)=>{if(N.type==="svg"?fe="svg":N.type==="math"&&(fe="mathml"),I==null)w(N,j,ne,J,se,fe,me,C);else{const re=I.el&&I.el._isVueCE?I.el:null;try{re&&re._beginPatch(),R(I,N,J,se,fe,me,C)}finally{re&&re._endPatch()}}},w=(I,N,j,ne,J,se,fe,me)=>{let C,re;const{props:ve,shapeFlag:he,transition:$,dirs:Ue}=I;if(C=I.el=a(I.type,se,ve&&ve.is,ve),he&8?f(C,I.children):he&16&&x(I.children,C,null,ne,J,eo(I,se),fe,me),Ue&&Oi(I,null,ne,"created"),D(C,I,I.scopeId,fe,ne),ve){for(const v in ve)v!=="value"&&!ar(v)&&r(C,v,null,ve[v],se,ne);"value"in ve&&r(C,"value",null,ve.value,se),(re=ve.onVnodeBeforeMount)&&Nn(re,ne,I)}Ue&&Oi(I,null,ne,"beforeMount");const T=im(J,$);T&&$.beforeEnter(C),i(C,N,j),((re=ve&&ve.onVnodeMounted)||T||Ue)&&fn(()=>{re&&Nn(re,ne,I),T&&$.enter(C),Ue&&Oi(I,null,ne,"mounted")},J)},D=(I,N,j,ne,J)=>{if(j&&o(I,j),ne)for(let se=0;se<ne.length;se++)o(I,ne[se]);if(J){let se=J.subTree;if(N===se||bf(se.type)&&(se.ssContent===N||se.ssFallback===N)){const fe=J.vnode;D(I,fe,fe.scopeId,fe.slotScopeIds,J.parent)}}},x=(I,N,j,ne,J,se,fe,me,C=0)=>{for(let re=C;re<I.length;re++){const ve=I[re]=me?Ci(I[re]):On(I[re]);y(null,ve,N,j,ne,J,se,fe,me)}},R=(I,N,j,ne,J,se,fe)=>{const me=N.el=I.el;let{patchFlag:C,dynamicChildren:re,dirs:ve}=N;C|=I.patchFlag&16;const he=I.props||Mt,$=N.props||Mt;let Ue;if(j&&Vi(j,!1),(Ue=$.onVnodeBeforeUpdate)&&Nn(Ue,j,N,I),ve&&Oi(N,I,j,"beforeUpdate"),j&&Vi(j,!0),(he.innerHTML&&$.innerHTML==null||he.textContent&&$.textContent==null)&&f(me,""),re?O(I.dynamicChildren,re,me,j,ne,eo(N,J),se):fe||te(I,N,me,null,j,ne,eo(N,J),se,!1),C>0){if(C&16)U(me,he,$,j,J);else if(C&2&&he.class!==$.class&&r(me,"class",null,$.class,J),C&4&&r(me,"style",he.style,$.style,J),C&8){const T=N.dynamicProps;for(let v=0;v<T.length;v++){const k=T[v],Q=he[k],ce=$[k];(ce!==Q||k==="value")&&r(me,k,Q,ce,J,j)}}C&1&&I.children!==N.children&&f(me,N.children)}else!fe&&re==null&&U(me,he,$,j,J);((Ue=$.onVnodeUpdated)||ve)&&fn(()=>{Ue&&Nn(Ue,j,N,I),ve&&Oi(N,I,j,"updated")},ne)},O=(I,N,j,ne,J,se,fe)=>{for(let me=0;me<N.length;me++){const C=I[me],re=N[me],ve=C.el&&(C.type===we||!qs(C,re)||C.shapeFlag&198)?m(C.el):j;y(C,re,ve,null,ne,J,se,fe,!0)}},U=(I,N,j,ne,J)=>{if(N!==j){if(N!==Mt)for(const se in N)!ar(se)&&!(se in j)&&r(I,se,N[se],null,J,ne);for(const se in j){if(ar(se))continue;const fe=j[se],me=N[se];fe!==me&&se!=="value"&&r(I,se,me,fe,J,ne)}"value"in j&&r(I,"value",N.value,j.value,J)}},W=(I,N,j,ne,J,se,fe,me,C)=>{const re=N.el=I?I.el:l(""),ve=N.anchor=I?I.anchor:l("");let{patchFlag:he,dynamicChildren:$,slotScopeIds:Ue}=N;Ue&&(me=me?me.concat(Ue):Ue),I==null?(i(re,j,ne),i(ve,j,ne),x(N.children||[],j,ve,J,se,fe,me,C)):he>0&&he&64&&$&&I.dynamicChildren&&I.dynamicChildren.length===$.length?(O(I.dynamicChildren,$,j,J,se,fe,me),(N.key!=null||J&&N===J.subTree)&&yf(I,N,!0)):te(I,N,j,ve,J,se,fe,me,C)},ee=(I,N,j,ne,J,se,fe,me,C)=>{N.slotScopeIds=me,I==null?N.shapeFlag&512?J.ctx.activate(N,j,ne,fe,C):le(N,j,ne,J,se,fe,C):V(I,N,C)},le=(I,N,j,ne,J,se,fe)=>{const me=I.component=fm(I,ne,J);if(nf(I)&&(me.ctx.renderer=Ye),pm(me,!1,fe),me.asyncDep){if(J&&J.registerDep(me,q,fe),!I.el){const C=me.subTree=Bt(fi);g(null,C,N,j),I.placeholder=C.el}}else q(me,I,N,j,J,se,fe)},V=(I,N,j)=>{const ne=N.component=I.component;if(jp(I,N,j))if(ne.asyncDep&&!ne.asyncResolved){z(ne,N,j);return}else ne.next=N,ne.update();else N.el=I.el,ne.vnode=N},q=(I,N,j,ne,J,se,fe)=>{const me=()=>{if(I.isMounted){let{next:he,bu:$,u:Ue,parent:T,vnode:v}=I;{const ge=xf(I);if(ge){he&&(he.el=v.el,z(I,he,fe)),ge.asyncDep.then(()=>{I.isUnmounted||me()});return}}let k=he,Q;Vi(I,!1),he?(he.el=v.el,z(I,he,fe)):he=v,$&&sa($),(Q=he.props&&he.props.onVnodeBeforeUpdate)&&Nn(Q,T,he,v),Vi(I,!0);const ce=Yc(I),pe=I.subTree;I.subTree=ce,y(pe,ce,m(pe.el),Ae(pe),I,J,se),he.el=ce.el,k===null&&Yp(I,ce.el),Ue&&fn(Ue,J),(Q=he.props&&he.props.onVnodeUpdated)&&fn(()=>Nn(Q,T,he,v),J)}else{let he;const{el:$,props:Ue}=N,{bm:T,m:v,parent:k,root:Q,type:ce}=I,pe=Ps(N);Vi(I,!1),T&&sa(T),!pe&&(he=Ue&&Ue.onVnodeBeforeMount)&&Nn(he,k,N),Vi(I,!0);{Q.ce&&Q.ce._def.shadowRoot!==!1&&Q.ce._injectChildStyle(ce);const ge=I.subTree=Yc(I);y(null,ge,j,ne,I,J,se),N.el=ge.el}if(v&&fn(v,J),!pe&&(he=Ue&&Ue.onVnodeMounted)){const ge=N;fn(()=>Nn(he,k,ge),J)}(N.shapeFlag&256||k&&Ps(k.vnode)&&k.vnode.shapeFlag&256)&&I.a&&fn(I.a,J),I.isMounted=!0,N=j=ne=null}};I.scope.on();const C=I.effect=new Id(me);I.scope.off();const re=I.update=C.run.bind(C),ve=I.job=C.runIfDirty.bind(C);ve.i=I,ve.id=I.uid,C.scheduler=()=>nc(ve),Vi(I,!0),re()},z=(I,N,j)=>{N.component=I;const ne=I.vnode.props;I.vnode=N,I.next=null,Jp(I,N.props,ne,j),em(I,N.children,j),ci(),Vc(I),ui()},te=(I,N,j,ne,J,se,fe,me,C=!1)=>{const re=I&&I.children,ve=I?I.shapeFlag:0,he=N.children,{patchFlag:$,shapeFlag:Ue}=N;if($>0){if($&128){Ee(re,he,j,ne,J,se,fe,me,C);return}else if($&256){de(re,he,j,ne,J,se,fe,me,C);return}}Ue&8?(ve&16&&oe(re,J,se),he!==re&&f(j,he)):ve&16?Ue&16?Ee(re,he,j,ne,J,se,fe,me,C):oe(re,J,se,!0):(ve&8&&f(j,""),Ue&16&&x(he,j,ne,J,se,fe,me,C))},de=(I,N,j,ne,J,se,fe,me,C)=>{I=I||Es,N=N||Es;const re=I.length,ve=N.length,he=Math.min(re,ve);let $;for($=0;$<he;$++){const Ue=N[$]=C?Ci(N[$]):On(N[$]);y(I[$],Ue,j,null,J,se,fe,me,C)}re>ve?oe(I,J,se,!0,!1,he):x(N,j,ne,J,se,fe,me,C,he)},Ee=(I,N,j,ne,J,se,fe,me,C)=>{let re=0;const ve=N.length;let he=I.length-1,$=ve-1;for(;re<=he&&re<=$;){const Ue=I[re],T=N[re]=C?Ci(N[re]):On(N[re]);if(qs(Ue,T))y(Ue,T,j,null,J,se,fe,me,C);else break;re++}for(;re<=he&&re<=$;){const Ue=I[he],T=N[$]=C?Ci(N[$]):On(N[$]);if(qs(Ue,T))y(Ue,T,j,null,J,se,fe,me,C);else break;he--,$--}if(re>he){if(re<=$){const Ue=$+1,T=Ue<ve?N[Ue].el:ne;for(;re<=$;)y(null,N[re]=C?Ci(N[re]):On(N[re]),j,T,J,se,fe,me,C),re++}}else if(re>$)for(;re<=he;)Fe(I[re],J,se,!0),re++;else{const Ue=re,T=re,v=new Map;for(re=T;re<=$;re++){const xe=N[re]=C?Ci(N[re]):On(N[re]);xe.key!=null&&v.set(xe.key,re)}let k,Q=0;const ce=$-T+1;let pe=!1,ge=0;const Z=new Array(ce);for(re=0;re<ce;re++)Z[re]=0;for(re=Ue;re<=he;re++){const xe=I[re];if(Q>=ce){Fe(xe,J,se,!0);continue}let Pe;if(xe.key!=null)Pe=v.get(xe.key);else for(k=T;k<=$;k++)if(Z[k-T]===0&&qs(xe,N[k])){Pe=k;break}Pe===void 0?Fe(xe,J,se,!0):(Z[Pe-T]=re+1,Pe>=ge?ge=Pe:pe=!0,y(xe,N[Pe],j,null,J,se,fe,me,C),Q++)}const ae=pe?sm(Z):Es;for(k=ae.length-1,re=ce-1;re>=0;re--){const xe=T+re,Pe=N[xe],Se=N[xe+1],_e=xe+1<ve?Se.el||Sf(Se):ne;Z[re]===0?y(null,Pe,j,_e,J,se,fe,me,C):pe&&(k<0||re!==ae[k]?De(Pe,j,_e,2):k--)}}},De=(I,N,j,ne,J=null)=>{const{el:se,type:fe,transition:me,children:C,shapeFlag:re}=I;if(re&6){De(I.component.subTree,N,j,ne);return}if(re&128){I.suspense.move(N,j,ne);return}if(re&64){fe.move(I,N,j,Ye);return}if(fe===we){i(se,N,j);for(let he=0;he<C.length;he++)De(C[he],N,j,ne);i(I.anchor,N,j);return}if(fe===aa){E(I,N,j);return}if(ne!==2&&re&1&&me)if(ne===0)me.beforeEnter(se),i(se,N,j),fn(()=>me.enter(se),J);else{const{leave:he,delayLeave:$,afterLeave:Ue}=me,T=()=>{I.ctx.isUnmounted?s(se):i(se,N,j)},v=()=>{se._isLeaving&&se[vp](!0),he(se,()=>{T(),Ue&&Ue()})};$?$(se,T,v):v()}else i(se,N,j)},Fe=(I,N,j,ne=!1,J=!1)=>{const{type:se,props:fe,ref:me,children:C,dynamicChildren:re,shapeFlag:ve,patchFlag:he,dirs:$,cacheIndex:Ue}=I;if(he===-2&&(J=!1),me!=null&&(ci(),cr(me,null,j,I,!0),ui()),Ue!=null&&(N.renderCache[Ue]=void 0),ve&256){N.ctx.deactivate(I);return}const T=ve&1&&$,v=!Ps(I);let k;if(v&&(k=fe&&fe.onVnodeBeforeUnmount)&&Nn(k,N,I),ve&6)$e(I.component,j,ne);else{if(ve&128){I.suspense.unmount(j,ne);return}T&&Oi(I,null,N,"beforeUnmount"),ve&64?I.type.remove(I,N,j,Ye,ne):re&&!re.hasOnce&&(se!==we||he>0&&he&64)?oe(re,N,j,!1,!0):(se===we&&he&384||!J&&ve&16)&&oe(C,N,j),ne&&ot(I)}(v&&(k=fe&&fe.onVnodeUnmounted)||T)&&fn(()=>{k&&Nn(k,N,I),T&&Oi(I,null,N,"unmounted")},j)},ot=I=>{const{type:N,el:j,anchor:ne,transition:J}=I;if(N===we){mt(j,ne);return}if(N===aa){b(I);return}const se=()=>{s(j),J&&!J.persisted&&J.afterLeave&&J.afterLeave()};if(I.shapeFlag&1&&J&&!J.persisted){const{leave:fe,delayLeave:me}=J,C=()=>fe(j,se);me?me(I.el,se,C):C()}else se()},mt=(I,N)=>{let j;for(;I!==N;)j=p(I),s(I),I=j;s(N)},$e=(I,N,j)=>{const{bum:ne,scope:J,job:se,subTree:fe,um:me,m:C,a:re}=I;Zc(C),Zc(re),ne&&sa(ne),J.stop(),se&&(se.flags|=8,Fe(fe,I,N,j)),me&&fn(me,N),fn(()=>{I.isUnmounted=!0},N)},oe=(I,N,j,ne=!1,J=!1,se=0)=>{for(let fe=se;fe<I.length;fe++)Fe(I[fe],N,j,ne,J)},Ae=I=>{if(I.shapeFlag&6)return Ae(I.component.subTree);if(I.shapeFlag&128)return I.suspense.next();const N=p(I.anchor||I.el),j=N&&N[gp];return j?p(j):N};let ye=!1;const Xe=(I,N,j)=>{let ne;I==null?N._vnode&&(Fe(N._vnode,null,null,!0),ne=N._vnode.component):y(N._vnode||null,I,N,null,null,null,j),N._vnode=I,ye||(ye=!0,Vc(ne),Jd(),ye=!1)},Ye={p:y,um:Fe,m:De,r:ot,mt:le,mc:x,pc:te,pbc:O,n:Ae,o:t};return{render:Xe,hydrate:void 0,createApp:zp(Xe)}}function eo({type:t,props:e},n){return n==="svg"&&t==="foreignObject"||n==="mathml"&&t==="annotation-xml"&&e&&e.encoding&&e.encoding.includes("html")?void 0:n}function Vi({effect:t,job:e},n){n?(t.flags|=32,e.flags|=4):(t.flags&=-33,e.flags&=-5)}function im(t,e){return(!t||t&&!t.pendingBranch)&&e&&!e.persisted}function yf(t,e,n=!1){const i=t.children,s=e.children;if(Ze(i)&&Ze(s))for(let r=0;r<i.length;r++){const a=i[r];let l=s[r];l.shapeFlag&1&&!l.dynamicChildren&&((l.patchFlag<=0||l.patchFlag===32)&&(l=s[r]=Ci(s[r]),l.el=a.el),!n&&l.patchFlag!==-2&&yf(a,l)),l.type===Oa&&(l.patchFlag!==-1?l.el=a.el:l.__elIndex=r+(t.type===we?1:0)),l.type===fi&&!l.el&&(l.el=a.el)}}function sm(t){const e=t.slice(),n=[0];let i,s,r,a,l;const u=t.length;for(i=0;i<u;i++){const d=t[i];if(d!==0){if(s=n[n.length-1],t[s]<d){e[i]=s,n.push(i);continue}for(r=0,a=n.length-1;r<a;)l=r+a>>1,t[n[l]]<d?r=l+1:a=l;d<t[n[r]]&&(r>0&&(e[i]=n[r-1]),n[r]=i)}}for(r=n.length,a=n[r-1];r-- >0;)n[r]=a,a=e[a];return n}function xf(t){const e=t.subTree.component;if(e)return e.asyncDep&&!e.asyncResolved?e:xf(e)}function Zc(t){if(t)for(let e=0;e<t.length;e++)t[e].flags|=8}function Sf(t){if(t.placeholder)return t.placeholder;const e=t.component;return e?Sf(e.subTree):null}const bf=t=>t.__isSuspense;function rm(t,e){e&&e.pendingBranch?Ze(t)?e.effects.push(...t):e.effects.push(t):dp(t)}const we=Symbol.for("v-fgt"),Oa=Symbol.for("v-txt"),fi=Symbol.for("v-cmt"),aa=Symbol.for("v-stc"),dr=[];let gn=null;function A(t=!1){dr.push(gn=t?null:[])}function am(){dr.pop(),gn=dr[dr.length-1]||null}let _r=1;function Qc(t,e=!1){_r+=t,t<0&&gn&&e&&(gn.hasOnce=!0)}function Mf(t){return t.dynamicChildren=_r>0?gn||Es:null,am(),_r>0&&gn&&gn.push(t),t}function P(t,e,n,i,s,r){return Mf(c(t,e,n,i,s,r,!0))}function vr(t,e,n,i,s){return Mf(Bt(t,e,n,i,s,!0))}function ac(t){return t?t.__v_isVNode===!0:!1}function qs(t,e){return t.type===e.type&&t.key===e.key}const Tf=({key:t})=>t??null,oa=({ref:t,ref_key:e,ref_for:n})=>(typeof t=="number"&&(t=""+t),t!=null?Ut(t)||$t(t)||it(t)?{i:zt,r:t,k:e,f:!!n}:t:null);function c(t,e=null,n=null,i=0,s=null,r=t===we?0:1,a=!1,l=!1){const u={__v_isVNode:!0,__v_skip:!0,type:t,props:e,key:e&&Tf(e),ref:e&&oa(e),scopeId:Qd,slotScopeIds:null,children:n,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:r,patchFlag:i,dynamicProps:s,dynamicChildren:null,appContext:null,ctx:zt};return l?(oc(u,n),r&128&&t.normalize(u)):n&&(u.shapeFlag|=Ut(n)?8:16),_r>0&&!a&&gn&&(u.patchFlag>0||r&6)&&u.patchFlag!==32&&gn.push(u),u}const Bt=om;function om(t,e=null,n=null,i=0,s=null,r=!1){if((!t||t===Lp)&&(t=fi),ac(t)){const l=Ds(t,e,!0);return n&&oc(l,n),_r>0&&!r&&gn&&(l.shapeFlag&6?gn[gn.indexOf(t)]=l:gn.push(l)),l.patchFlag=-2,l}if(ym(t)&&(t=t.__vccOpts),e){e=lm(e);let{class:l,style:u}=e;l&&!Ut(l)&&(e.class=Be(l)),wt(u)&&(tc(u)&&!Ze(u)&&(u=nn({},u)),e.style=hn(u))}const a=Ut(t)?1:bf(t)?128:_p(t)?64:wt(t)?4:it(t)?2:0;return c(t,e,n,i,s,a,r,!0)}function lm(t){return t?tc(t)||hf(t)?nn({},t):t:null}function Ds(t,e,n=!1,i=!1){const{props:s,ref:r,patchFlag:a,children:l,transition:u}=t,d=e?cm(s||{},e):s,f={__v_isVNode:!0,__v_skip:!0,type:t.type,props:d,key:d&&Tf(d),ref:e&&e.ref?n&&r?Ze(r)?r.concat(oa(e)):[r,oa(e)]:oa(e):r,scopeId:t.scopeId,slotScopeIds:t.slotScopeIds,children:l,target:t.target,targetStart:t.targetStart,targetAnchor:t.targetAnchor,staticCount:t.staticCount,shapeFlag:t.shapeFlag,patchFlag:e&&t.type!==we?a===-1?16:a|16:a,dynamicProps:t.dynamicProps,dynamicChildren:t.dynamicChildren,appContext:t.appContext,dirs:t.dirs,transition:u,component:t.component,suspense:t.suspense,ssContent:t.ssContent&&Ds(t.ssContent),ssFallback:t.ssFallback&&Ds(t.ssFallback),placeholder:t.placeholder,el:t.el,anchor:t.anchor,ctx:t.ctx,ce:t.ce};return u&&i&&ic(f,u.clone(f)),f}function Ge(t=" ",e=0){return Bt(Oa,null,t,e)}function yi(t,e){const n=Bt(aa,null,t);return n.staticCount=e,n}function Le(t="",e=!1){return e?(A(),vr(fi,null,t)):Bt(fi,null,t)}function On(t){return t==null||typeof t=="boolean"?Bt(fi):Ze(t)?Bt(we,null,t.slice()):ac(t)?Ci(t):Bt(Oa,null,String(t))}function Ci(t){return t.el===null&&t.patchFlag!==-1||t.memo?t:Ds(t)}function oc(t,e){let n=0;const{shapeFlag:i}=t;if(e==null)e=null;else if(Ze(e))n=16;else if(typeof e=="object")if(i&65){const s=e.default;s&&(s._c&&(s._d=!1),oc(t,s()),s._c&&(s._d=!0));return}else{n=32;const s=e._;!s&&!hf(e)?e._ctx=zt:s===3&&zt&&(zt.slots._===1?e._=1:(e._=2,t.patchFlag|=1024))}else it(e)?(e={default:e,_ctx:zt},n=32):(e=String(e),i&64?(n=16,e=[Ge(e)]):n=8);t.children=e,t.shapeFlag|=n}function cm(...t){const e={};for(let n=0;n<t.length;n++){const i=t[n];for(const s in i)if(s==="class")e.class!==i.class&&(e.class=Be([e.class,i.class]));else if(s==="style")e.style=hn([e.style,i.style]);else if(Ca(s)){const r=e[s],a=i[s];a&&r!==a&&!(Ze(r)&&r.includes(a))&&(e[s]=r?[].concat(r,a):a)}else s!==""&&(e[s]=i[s])}return e}function Nn(t,e,n,i=null){qn(t,e,7,[n,i])}const um=cf();let dm=0;function fm(t,e,n){const i=t.type,s=(e?e.appContext:t.appContext)||um,r={uid:dm++,vnode:t,type:i,parent:e,appContext:s,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new Uh(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:e?e.provides:Object.create(s.provides),ids:e?e.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:mf(i,s),emitsOptions:uf(i,s),emit:null,emitted:null,propsDefaults:Mt,inheritAttrs:i.inheritAttrs,ctx:Mt,data:Mt,props:Mt,attrs:Mt,slots:Mt,refs:Mt,setupState:Mt,setupContext:null,suspense:n,suspenseId:n?n.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return r.ctx={_:r},r.root=e?e.root:r,r.emit=Hp.bind(null,r),t.ce&&t.ce(r),r}let Yt=null;const hm=()=>Yt||zt;let xa,Yo;{const t=Da(),e=(n,i)=>{let s;return(s=t[n])||(s=t[n]=[]),s.push(i),r=>{s.length>1?s.forEach(a=>a(r)):s[0](r)}};xa=e("__VUE_INSTANCE_SETTERS__",n=>Yt=n),Yo=e("__VUE_SSR_SETTERS__",n=>yr=n)}const Er=t=>{const e=Yt;return xa(t),t.scope.on(),()=>{t.scope.off(),xa(e)}},$c=()=>{Yt&&Yt.scope.off(),xa(null)};function Ef(t){return t.vnode.shapeFlag&4}let yr=!1;function pm(t,e=!1,n=!1){e&&Yo(e);const{props:i,children:s}=t.vnode,r=Ef(t);Kp(t,i,r,e),$p(t,s,n||e);const a=r?mm(t,e):void 0;return e&&Yo(!1),a}function mm(t,e){const n=t.type;t.accessCache=Object.create(null),t.proxy=new Proxy(t.ctx,Np);const{setup:i}=n;if(i){ci();const s=t.setupContext=i.length>1?_m(t):null,r=Er(t),a=Tr(i,t,0,[t.props,s]),l=Td(a);if(ui(),r(),(l||t.sp)&&!Ps(t)&&tf(t),l){if(a.then($c,$c),e)return a.then(u=>{eu(t,u)}).catch(u=>{Ua(u,t,0)});t.asyncDep=a}else eu(t,a)}else wf(t)}function eu(t,e,n){it(e)?t.type.__ssrInlineRender?t.ssrRender=e:t.render=e:wt(e)&&(t.setupState=Xd(e)),wf(t)}function wf(t,e,n){const i=t.type;t.render||(t.render=i.render||Gn);{const s=Er(t);ci();try{Up(t)}finally{ui(),s()}}}const gm={get(t,e){return jt(t,"get",""),t[e]}};function _m(t){const e=n=>{t.exposed=n||{}};return{attrs:new Proxy(t.attrs,gm),slots:t.slots,emit:t.emit,expose:e}}function Ba(t){return t.exposed?t.exposeProxy||(t.exposeProxy=new Proxy(Xd(np(t.exposed)),{get(e,n){if(n in e)return e[n];if(n in ur)return ur[n](t)},has(e,n){return n in e||n in ur}})):t.proxy}function vm(t,e=!0){return it(t)?t.displayName||t.name:t.name||e&&t.__name}function ym(t){return it(t)&&"__vccOpts"in t}const xm=(t,e)=>ap(t,e,yr),Sm="3.5.26";/**
* @vue/runtime-dom v3.5.26
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let Ko;const tu=typeof window<"u"&&window.trustedTypes;if(tu)try{Ko=tu.createPolicy("vue",{createHTML:t=>t})}catch{}const Af=Ko?t=>Ko.createHTML(t):t=>t,bm="http://www.w3.org/2000/svg",Mm="http://www.w3.org/1998/Math/MathML",ti=typeof document<"u"?document:null,nu=ti&&ti.createElement("template"),Tm={insert:(t,e,n)=>{e.insertBefore(t,n||null)},remove:t=>{const e=t.parentNode;e&&e.removeChild(t)},createElement:(t,e,n,i)=>{const s=e==="svg"?ti.createElementNS(bm,t):e==="mathml"?ti.createElementNS(Mm,t):n?ti.createElement(t,{is:n}):ti.createElement(t);return t==="select"&&i&&i.multiple!=null&&s.setAttribute("multiple",i.multiple),s},createText:t=>ti.createTextNode(t),createComment:t=>ti.createComment(t),setText:(t,e)=>{t.nodeValue=e},setElementText:(t,e)=>{t.textContent=e},parentNode:t=>t.parentNode,nextSibling:t=>t.nextSibling,querySelector:t=>ti.querySelector(t),setScopeId(t,e){t.setAttribute(e,"")},insertStaticContent(t,e,n,i,s,r){const a=n?n.previousSibling:e.lastChild;if(s&&(s===r||s.nextSibling))for(;e.insertBefore(s.cloneNode(!0),n),!(s===r||!(s=s.nextSibling)););else{nu.innerHTML=Af(i==="svg"?`<svg>${t}</svg>`:i==="mathml"?`<math>${t}</math>`:t);const l=nu.content;if(i==="svg"||i==="mathml"){const u=l.firstChild;for(;u.firstChild;)l.appendChild(u.firstChild);l.removeChild(u)}e.insertBefore(l,n)}return[a?a.nextSibling:e.firstChild,n?n.previousSibling:e.lastChild]}},Em=Symbol("_vtc");function wm(t,e,n){const i=t[Em];i&&(e=(e?[e,...i]:[...i]).join(" ")),e==null?t.removeAttribute("class"):n?t.setAttribute("class",e):t.className=e}const Sa=Symbol("_vod"),Pf=Symbol("_vsh"),iu={name:"show",beforeMount(t,{value:e},{transition:n}){t[Sa]=t.style.display==="none"?"":t.style.display,n&&e?n.beforeEnter(t):Xs(t,e)},mounted(t,{value:e},{transition:n}){n&&e&&n.enter(t)},updated(t,{value:e,oldValue:n},{transition:i}){!e!=!n&&(i?e?(i.beforeEnter(t),Xs(t,!0),i.enter(t)):i.leave(t,()=>{Xs(t,!1)}):Xs(t,e))},beforeUnmount(t,{value:e}){Xs(t,e)}};function Xs(t,e){t.style.display=e?t[Sa]:"none",t[Pf]=!e}const Am=Symbol(""),Pm=/(?:^|;)\s*display\s*:/;function Cm(t,e,n){const i=t.style,s=Ut(n);let r=!1;if(n&&!s){if(e)if(Ut(e))for(const a of e.split(";")){const l=a.slice(0,a.indexOf(":")).trim();n[l]==null&&la(i,l,"")}else for(const a in e)n[a]==null&&la(i,a,"");for(const a in n)a==="display"&&(r=!0),la(i,a,n[a])}else if(s){if(e!==n){const a=i[Am];a&&(n+=";"+a),i.cssText=n,r=Pm.test(n)}}else e&&t.removeAttribute("style");Sa in t&&(t[Sa]=r?i.display:"",t[Pf]&&(i.display="none"))}const su=/\s*!important$/;function la(t,e,n){if(Ze(n))n.forEach(i=>la(t,e,i));else if(n==null&&(n=""),e.startsWith("--"))t.setProperty(e,n);else{const i=Rm(t,e);su.test(n)?t.setProperty(rs(i),n.replace(su,""),"important"):t[i]=n}}const ru=["Webkit","Moz","ms"],to={};function Rm(t,e){const n=to[e];if(n)return n;let i=bn(e);if(i!=="filter"&&i in t)return to[e]=i;i=Ia(i);for(let s=0;s<ru.length;s++){const r=ru[s]+i;if(r in t)return to[e]=r}return e}const au="http://www.w3.org/1999/xlink";function ou(t,e,n,i,s,r=Dh(e)){i&&e.startsWith("xlink:")?n==null?t.removeAttributeNS(au,e.slice(6,e.length)):t.setAttributeNS(au,e,n):n==null||r&&!Pd(n)?t.removeAttribute(e):t.setAttribute(e,r?"":In(n)?String(n):n)}function lu(t,e,n,i,s){if(e==="innerHTML"||e==="textContent"){n!=null&&(t[e]=e==="innerHTML"?Af(n):n);return}const r=t.tagName;if(e==="value"&&r!=="PROGRESS"&&!r.includes("-")){const l=r==="OPTION"?t.getAttribute("value")||"":t.value,u=n==null?t.type==="checkbox"?"on":"":String(n);(l!==u||!("_value"in t))&&(t.value=u),n==null&&t.removeAttribute(e),t._value=n;return}let a=!1;if(n===""||n==null){const l=typeof t[e];l==="boolean"?n=Pd(n):n==null&&l==="string"?(n="",a=!0):l==="number"&&(n=0,a=!0)}try{t[e]=n}catch{}a&&t.removeAttribute(s||e)}function si(t,e,n,i){t.addEventListener(e,n,i)}function Im(t,e,n,i){t.removeEventListener(e,n,i)}const cu=Symbol("_vei");function Lm(t,e,n,i,s=null){const r=t[cu]||(t[cu]={}),a=r[e];if(i&&a)a.value=i;else{const[l,u]=Dm(e);if(i){const d=r[e]=Fm(i,s);si(t,l,d,u)}else a&&(Im(t,l,a,u),r[e]=void 0)}}const uu=/(?:Once|Passive|Capture)$/;function Dm(t){let e;if(uu.test(t)){e={};let i;for(;i=t.match(uu);)t=t.slice(0,t.length-i[0].length),e[i[0].toLowerCase()]=!0}return[t[2]===":"?t.slice(3):rs(t.slice(2)),e]}let no=0;const Nm=Promise.resolve(),Um=()=>no||(Nm.then(()=>no=0),no=Date.now());function Fm(t,e){const n=i=>{if(!i._vts)i._vts=Date.now();else if(i._vts<=n.attached)return;qn(km(i,n.value),e,5,[i])};return n.value=t,n.attached=Um(),n}function km(t,e){if(Ze(e)){const n=t.stopImmediatePropagation;return t.stopImmediatePropagation=()=>{n.call(t),t._stopped=!0},e.map(i=>s=>!s._stopped&&i&&i(s))}else return e}const du=t=>t.charCodeAt(0)===111&&t.charCodeAt(1)===110&&t.charCodeAt(2)>96&&t.charCodeAt(2)<123,Om=(t,e,n,i,s,r)=>{const a=s==="svg";e==="class"?wm(t,i,a):e==="style"?Cm(t,n,i):Ca(e)?ql(e)||Lm(t,e,n,i,r):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):Bm(t,e,i,a))?(lu(t,e,i),!t.tagName.includes("-")&&(e==="value"||e==="checked"||e==="selected")&&ou(t,e,i,a,r,e!=="value")):t._isVueCE&&(/[A-Z]/.test(e)||!Ut(i))?lu(t,bn(e),i,r,e):(e==="true-value"?t._trueValue=i:e==="false-value"&&(t._falseValue=i),ou(t,e,i,a))};function Bm(t,e,n,i){if(i)return!!(e==="innerHTML"||e==="textContent"||e in t&&du(e)&&it(n));if(e==="spellcheck"||e==="draggable"||e==="translate"||e==="autocorrect"||e==="sandbox"&&t.tagName==="IFRAME"||e==="form"||e==="list"&&t.tagName==="INPUT"||e==="type"&&t.tagName==="TEXTAREA")return!1;if(e==="width"||e==="height"){const s=t.tagName;if(s==="IMG"||s==="VIDEO"||s==="CANVAS"||s==="SOURCE")return!1}return du(e)&&Ut(n)?!1:e in t}const Di=t=>{const e=t.props["onUpdate:modelValue"]||!1;return Ze(e)?n=>sa(e,n):e};function Vm(t){t.target.composing=!0}function fu(t){const e=t.target;e.composing&&(e.composing=!1,e.dispatchEvent(new Event("input")))}const Sn=Symbol("_assign");function hu(t,e,n){return e&&(t=t.trim()),n&&(t=La(t)),t}const je={created(t,{modifiers:{lazy:e,trim:n,number:i}},s){t[Sn]=Di(s);const r=i||s.props&&s.props.type==="number";si(t,e?"change":"input",a=>{a.target.composing||t[Sn](hu(t.value,n,r))}),(n||r)&&si(t,"change",()=>{t.value=hu(t.value,n,r)}),e||(si(t,"compositionstart",Vm),si(t,"compositionend",fu),si(t,"change",fu))},mounted(t,{value:e}){t.value=e??""},beforeUpdate(t,{value:e,oldValue:n,modifiers:{lazy:i,trim:s,number:r}},a){if(t[Sn]=Di(a),t.composing)return;const l=(r||t.type==="number")&&!/^0\d/.test(t.value)?La(t.value):t.value,u=e??"";l!==u&&(document.activeElement===t&&t.type!=="range"&&(i&&e===n||s&&t.value.trim()===u)||(t.value=u))}},xi={deep:!0,created(t,e,n){t[Sn]=Di(n),si(t,"change",()=>{const i=t._modelValue,s=Ns(t),r=t.checked,a=t[Sn];if(Ze(i)){const l=Yl(i,s),u=l!==-1;if(r&&!u)a(i.concat(s));else if(!r&&u){const d=[...i];d.splice(l,1),a(d)}}else if(Bs(i)){const l=new Set(i);r?l.add(s):l.delete(s),a(l)}else a(Cf(t,r))})},mounted:pu,beforeUpdate(t,e,n){t[Sn]=Di(n),pu(t,e,n)}};function pu(t,{value:e,oldValue:n},i){t._modelValue=e;let s;if(Ze(e))s=Yl(e,i.props.value)>-1;else if(Bs(e))s=e.has(i.props.value);else{if(e===n)return;s=ns(e,Cf(t,!0))}t.checked!==s&&(t.checked=s)}const zm={created(t,{value:e},n){t.checked=ns(e,n.props.value),t[Sn]=Di(n),si(t,"change",()=>{t[Sn](Ns(t))})},beforeUpdate(t,{value:e,oldValue:n},i){t[Sn]=Di(i),e!==n&&(t.checked=ns(e,i.props.value))}},Pt={deep:!0,created(t,{value:e,modifiers:{number:n}},i){const s=Bs(e);si(t,"change",()=>{const r=Array.prototype.filter.call(t.options,a=>a.selected).map(a=>n?La(Ns(a)):Ns(a));t[Sn](t.multiple?s?new Set(r):r:r[0]),t._assigning=!0,Yd(()=>{t._assigning=!1})}),t[Sn]=Di(i)},mounted(t,{value:e}){mu(t,e)},beforeUpdate(t,e,n){t[Sn]=Di(n)},updated(t,{value:e}){t._assigning||mu(t,e)}};function mu(t,e){const n=t.multiple,i=Ze(e);if(!(n&&!i&&!Bs(e))){for(let s=0,r=t.options.length;s<r;s++){const a=t.options[s],l=Ns(a);if(n)if(i){const u=typeof l;u==="string"||u==="number"?a.selected=e.some(d=>String(d)===String(l)):a.selected=Yl(e,l)>-1}else a.selected=e.has(l);else if(ns(Ns(a),e)){t.selectedIndex!==s&&(t.selectedIndex=s);return}}!n&&t.selectedIndex!==-1&&(t.selectedIndex=-1)}}function Ns(t){return"_value"in t?t._value:t.value}function Cf(t,e){const n=e?"_trueValue":"_falseValue";return n in t?t[n]:e}const Gm=["ctrl","shift","alt","meta"],Hm={stop:t=>t.stopPropagation(),prevent:t=>t.preventDefault(),self:t=>t.target!==t.currentTarget,ctrl:t=>!t.ctrlKey,shift:t=>!t.shiftKey,alt:t=>!t.altKey,meta:t=>!t.metaKey,left:t=>"button"in t&&t.button!==0,middle:t=>"button"in t&&t.button!==1,right:t=>"button"in t&&t.button!==2,exact:(t,e)=>Gm.some(n=>t[`${n}Key`]&&!e.includes(n))},cn=(t,e)=>{const n=t._withMods||(t._withMods={}),i=e.join(".");return n[i]||(n[i]=(s,...r)=>{for(let a=0;a<e.length;a++){const l=Hm[e[a]];if(l&&l(s,e))return}return t(s,...r)})},Wm=nn({patchProp:Om},Tm);let gu;function qm(){return gu||(gu=tm(Wm))}const Xm=(...t)=>{const e=qm().createApp(...t),{mount:n}=e;return e.mount=i=>{const s=Ym(i);if(!s)return;const r=e._component;!it(r)&&!r.render&&!r.template&&(r.template=s.innerHTML),s.nodeType===1&&(s.textContent="");const a=n(s,!1,jm(s));return s instanceof Element&&(s.removeAttribute("v-cloak"),s.setAttribute("data-v-app","")),a},e};function jm(t){if(t instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&t instanceof MathMLElement)return"mathml"}function Ym(t){return Ut(t)?document.querySelector(t):t}function Rf(t){const e=Number(t);return Number.isFinite(e)?Math.max(0,Math.min(1,e)):.5}function Vs(t){const e=Rf(t);return e*e*(3-2*e)}function fr(t,e,n){const i=Vs(n),s=t!=null&&t!=="",r=e!=null&&e!=="";if(!s&&!r)return null;if(!s)return Number(e);if(!r)return Number(t);const a=Number(t),l=Number(e);return!Number.isFinite(a)||!Number.isFinite(l)?r?e:t:a+(l-a)*i}function Km(t,e,n){const i=t!=null?String(t).trim():"",s=e!=null?String(e).trim():"";if(!i&&!s)return"";if(!i)return s;if(!s)return i;const r=Vs(n);if(r<=.02)return i;if(r>=.98)return s;const a=(1-r).toFixed(2),l=r.toFixed(2);return`(${i}:${a}) (${s}:${l})`}function Jm(t,e,n){const i=t!=null,s=e!=null;return!i&&!s?null:i?s&&Vs(n)>=.5?!!e:!!t:!!e}function Zm(t,e,n){const i=Vs(n),s=l=>l?typeof l=="object"?l:{name:String(l),strength:1}:null,r=s(t),a=s(e);return!r&&!a?null:r?a?i<.5?{name:r.name,strength:(r.strength??1)*(1-i*2)}:{name:a.name,strength:(a.strength??1)*((i-.5)*2)}:r:a}function Qm(t,e,n){const i=Vs(n),s=l=>!l||typeof l!="object"?null:{slotId:l.slotId||l.id||"CN1",weight:Number(l.weight??.4),start:Number(l.start??0),end:Number(l.end??.9),enabled:l.enabled!==!1},r=s(t),a=s(e);return!r&&!a?null:r?a?{slotId:i<.5?r.slotId:a.slotId,weight:fr(r.weight,a.weight,i),start:fr(r.start,a.start,i),end:fr(r.end,a.end,i),enabled:Jm(r.enabled,a.enabled,i)}:r:a}function js(t,e){if(!t)return null;const n=Rf(e);switch(t.type){case"prompt":return Km(t.valueA,t.valueB,n);case"param":return fr(t.valueA,t.valueB,n);case"lora":return Zm(t.valueA,t.valueB,n);case"controlnet":return Qm(t.valueA,t.valueB,n);default:return fr(t.valueA,t.valueB,n)}}const $m=[{id:"prompt",label:"Prompt"},{id:"param",label:"Parameter"},{id:"lora",label:"LoRA"},{id:"controlnet",label:"ControlNet"}],io={W:960,H:540,show_info_on_ui:!1,tiling:!1,restore_faces:!1,seed_resize_from_w:0,seed_resize_from_h:0,seed:1693,sampler:"HeunPP2",scheduler:"Normal",steps:10,batch_name:"floral_neu",seed_behavior:"random",seed_iter_N:1,use_init:!1,strength:1,strength_0_no_init:!0,init_image:null,use_mask:!1,animation_mode:"2D",max_frames:9999,border:"replicate",angle:"0: (0)",zoom:"0: (1.0)",translation_x:"0: (0)",translation_y:"0: (0.0)",translation_z:"0: (0.0)",transform_center_x:"0: (0.5)",transform_center_y:"0: (0.5)",rotation_3d_x:"0: (0)",rotation_3d_y:"0: (0)",rotation_3d_z:"0: (0)",noise_schedule:"0: (0.01)",strength_schedule:"0: (0.7)",keyframe_strength_schedule:"0: (0.50)",contrast_schedule:"0: (1.0)",cfg_scale_schedule:"0:(9)",distilled_cfg_scale_schedule:"0: (1.5)",enable_steps_scheduling:!1,steps_schedule:"0: (6)",prompts:{0:" <lora:floral_dreamshaper:1.5>silhouette black  big wild flowers and  wild plants and berries , red background, many different flowers, layered silhouettes, folk art style floral graphics, flat folk art style illustration, layered composition, detailed composition,   natural colors, medium high contrast    --neg star, star shape, watermark, signature , dreamstime, logo, writing, text, poster element, year, number, date, label,   vignette, glow, , symbol, alphabet, number, freepik"},positive_prompts:"",negative_prompts:"star, star shape, watermark, signature , dreamstime, logo, writing, text, poster element, year, number, date, label,   vignette, glow, , symbol, alphabet, number, freepik",fps:12,sd_model_name:"nightvisionxl_v0811.safetensors",skip_video_creation:!0,cn_1_enabled:!1,cn_1_weight:"0:(2)",cn_1_module:"None",cn_1_model:"temporalnetversion2 [b554c208]"},eg=[{id:"canvas",label:"Canvas",fields:[{key:"W",label:"Width",type:"number",min:256,max:4096,step:64},{key:"H",label:"Height",type:"number",min:256,max:4096,step:64},{key:"fps",label:"FPS",type:"number",min:5,max:25,step:1},{key:"max_frames",label:"Max frames",type:"number",min:1,max:99999,step:1},{key:"batch_name",label:"Batch name",type:"text"}]},{id:"sampling",label:"Sampling",fields:[{key:"seed",label:"Seed",type:"number",min:-1,max:2147483647,step:1},{key:"sampler",label:"Sampler",type:"text"},{key:"scheduler",label:"Scheduler",type:"text"},{key:"steps",label:"Steps",type:"number",min:1,max:150,step:1},{key:"sd_model_name",label:"Checkpoint",type:"text"}]},{id:"prompts",label:"Prompts",fields:[{key:"prompts.0",label:"Prompt @ 0",type:"textarea",rows:4},{key:"negative_prompts",label:"Negative",type:"textarea",rows:3},{key:"positive_prompts",label:"Positive (extra)",type:"textarea",rows:2}]},{id:"init",label:"Init",fields:[{key:"use_init",label:"Use init image",type:"bool"},{key:"strength",label:"Strength",type:"number",min:0,max:1.5,step:.01},{key:"init_image",label:"Init image URL/path",type:"text"}]},{id:"motion",label:"Motion 2D",fields:[{key:"animation_mode",label:"Mode",type:"text"},{key:"zoom",label:"Zoom schedule",type:"text"},{key:"translation_x",label:"Pan X schedule",type:"text"},{key:"translation_y",label:"Pan Y schedule",type:"text"},{key:"angle",label:"Angle schedule",type:"text"}]},{id:"schedules",label:"Schedules",fields:[{key:"noise_schedule",label:"Noise",type:"text"},{key:"strength_schedule",label:"Strength",type:"text"},{key:"cfg_scale_schedule",label:"CFG",type:"text"},{key:"steps_schedule",label:"Steps",type:"text"}]},{id:"controlnet",label:"ControlNet 1",fields:[{key:"cn_1_enabled",label:"Enabled",type:"bool"},{key:"cn_1_weight",label:"Weight schedule",type:"text"},{key:"cn_1_module",label:"Module",type:"text"},{key:"cn_1_model",label:"Model",type:"text"}]}];function _u(t,e){if(!e||!t)return;const n=String(e).split(".");let i=t;for(const s of n){if(i==null)return;i=i[s]}return i}function tg(t,e,n){const i=String(e).split(".");let s=t;for(let r=0;r<i.length-1;r++){const a=i[r];(s[a]==null||typeof s[a]!="object")&&(s[a]={}),s=s[a]}s[i[i.length-1]]=n}function ng(t,e){const n=String(t).split(".");if(n.length===1)return{[n[0]]:e};const i=n[0],s={};let r=s;for(let a=1;a<n.length-1;a++)r[n[a]]={},r=r[n[a]];return r[n[n.length-1]]=e,{[i]:s}}function vu(t,e){const n={...t,...e};return e.prompts&&typeof e.prompts=="object"&&(n.prompts={...t.prompts||{},...e.prompts}),n}const ig="defora_control_token";let yu=!1;function If(){if(typeof localStorage>"u")return"";try{return localStorage.getItem(ig)||""}catch{return""}}function sg(t){if(typeof window>"u"||typeof URL>"u")return!1;const e=typeof t=="string"||t instanceof URL?t:t&&typeof t.url=="string"?t.url:null;if(!e)return!1;try{const n=new URL(e,window.location.origin);return n.origin===window.location.origin&&n.pathname.startsWith("/api")}catch{return!1}}function Lf(t,e={}){const n=If();if(!n||!sg(t)||typeof Headers>"u")return e;const i=new Headers(e.headers||void 0);return!i.has("Authorization")&&!i.has("X-API-Token")&&!i.has("X-Control-Token")&&i.set("Authorization",`Bearer ${n}`),{...e,headers:i}}function rg(){if(yu||typeof window>"u"||typeof window.fetch!="function")return;const t=window.fetch.bind(window);window.fetch=(e,n={})=>t(e,Lf(e,n)),yu=!0}async function Wt(t,e={},n="API"){const i=n||t;try{const s=await fetch(t,Lf(t,e));let r=null;if((s.headers.get("content-type")||"").includes("application/json"))try{r=await s.json()}catch{r=null}else{const l=await s.text();l&&(r={_raw:l.slice(0,200)})}if(!s.ok){const l=r&&(r.error||r.message)||s.statusText||`HTTP ${s.status}`;console.error(`[Defora ${i}] ${s.status}: ${l}`,r||"");const u=new Error(l);throw u.status=s.status,u.data=r,u}return{res:s,data:r}}catch(s){throw s.status||console.error(`[Defora ${i}] Network error: ${s.message}`),s}}function ag(t){return t==="sd-forge"?"Forge":t==="cache"?"Cache":t==="placeholder"?"Placeholder":t||"Unknown"}const Fi=(t,e)=>{const n=t.__vccOpts||t;for(const[i,s]of e)n[i]=s;return n},og={name:"StatusStrip",emits:["toggle-play","stop-play","toggle-record"],props:{playing:{type:Boolean,default:!1},recording:{type:Boolean,default:!1},apiHealth:{type:Object,default:()=>({})},midiSupported:{type:Boolean,default:!1},midiSelected:{default:null},wsStatus:{type:String,default:"disconnected"},session:{type:String,default:""}}},lg={class:"status-strip"},cg=["title"],ug=["title"],dg={class:"ss-pill"};function fg(t,e,n,i,s,r){return A(),P("div",lg,[c("button",{class:Be(["ss-btn",{"ss-btn--active":n.playing}]),title:n.playing?"Pause Deforum":"Play Deforum animation",onClick:e[0]||(e[0]=a=>t.$emit("toggle-play"))},[Ge(B(n.playing?"⏸":"▶"),1),e[3]||(e[3]=c("span",{class:"ss-label"},"Anim",-1))],10,cg),c("button",{class:"ss-btn ss-btn--ghost",title:"Stop animation",onClick:e[1]||(e[1]=a=>t.$emit("stop-play"))},"⏹"),c("button",{class:Be(["ss-btn ss-btn--ghost",{"ss-btn--recording":n.recording}]),onClick:e[2]||(e[2]=a=>t.$emit("toggle-record"))},[Ge(B(n.recording?"⏹":"●"),1),e[4]||(e[4]=c("span",{class:"ss-label"},"Rec",-1))],2),n.apiHealth&&n.apiHealth.sdForge?(A(),P("div",{key:0,class:Be(["ss-pill",{"ss-pill--live":n.apiHealth.sdForge.available===!0,"ss-pill--error":n.apiHealth.sdForge.available===!1}]),title:n.apiHealth.sdForge.lastChecked?"SD-Forge last check: "+n.apiHealth.sdForge.lastChecked:"SD-Forge status"},[e[5]||(e[5]=c("span",{class:"ss-dot"},null,-1)),e[6]||(e[6]=c("span",{class:"ss-key"},"Forge",-1)),c("strong",null,B(n.apiHealth.sdForge.available==null?"…":n.apiHealth.sdForge.available?"up":"down"),1)],10,ug)):Le("",!0),n.midiSupported?(A(),P("div",{key:1,class:Be(["ss-pill",{"ss-pill--live":n.midiSelected}])},[e[7]||(e[7]=c("span",{class:"ss-dot"},null,-1)),e[8]||(e[8]=c("span",{class:"ss-key"},"MIDI",-1)),c("strong",null,B(n.midiSelected?"on":"off"),1)],2)):Le("",!0),c("div",{class:Be(["ss-pill",{"ss-pill--live":n.wsStatus==="connected","ss-pill--warn":n.wsStatus!=="connected"}])},[e[9]||(e[9]=c("span",{class:"ss-dot"},null,-1)),e[10]||(e[10]=c("span",{class:"ss-key"},"WS",-1)),c("strong",null,B(n.wsStatus),1)],2),c("div",dg,[e[11]||(e[11]=c("span",{class:"ss-key"},"Session",-1)),c("strong",null,B(n.session),1)])])}const hg=Fi(og,[["render",fg],["__scopeId","data-v-d2d6c2af"]]),pg={name:"GlassPanel",props:{size:{type:String,default:"md"}}},mg={key:0,class:"glass-panel-header"},gg={class:"glass-panel-body"};function _g(t,e,n,i,s,r){return A(),P("div",{class:Be(["glass-panel",[`glass-panel--${n.size}`]])},[t.$slots.header?(A(),P("div",mg,[Hc(t.$slots,"header",{},void 0)])):Le("",!0),c("div",gg,[Hc(t.$slots,"default",{},void 0)])],2)}const vg=Fi(pg,[["render",_g],["__scopeId","data-v-e516a2a4"]]),yg={name:"Crossfader",emits:["update:modelValue","snap-a","snap-b","randomize"],props:{modelValue:{type:Number,default:.5},disabled:{type:Boolean,default:!1},testid:{type:String,default:""}},computed:{aPercent(){return((1-this.modelValue)*100).toFixed(0)},bPercent(){return(this.modelValue*100).toFixed(0)}},methods:{onRandomize(){const t=parseFloat(Math.random().toFixed(2));this.$emit("update:modelValue",t),this.$emit("randomize",t)}}},xg={class:"crossfader"},Sg={class:"crossfader-labels"},bg={class:"crossfader-label crossfader-label--a"},Mg={class:"crossfader-label crossfader-label--b"},Tg={class:"crossfader-track"},Eg=["value","disabled","data-testid"],wg={class:"crossfader-actions"},Ag=["disabled"],Pg=["disabled"],Cg=["disabled"];function Rg(t,e,n,i,s,r){return A(),P("div",xg,[c("div",Sg,[c("span",bg,"A "+B(r.aPercent)+"%",1),c("span",Mg,"B "+B(r.bPercent)+"%",1)]),c("div",Tg,[c("div",{class:"crossfader-fill",style:hn({width:n.modelValue*100+"%"})},null,4),c("div",{class:"crossfader-thumb",style:hn({left:n.modelValue*100+"%"})},null,4),c("input",{type:"range",class:"crossfader-input",min:"0",max:"1",step:"0.01",value:n.modelValue,disabled:n.disabled,onInput:e[0]||(e[0]=a=>t.$emit("update:modelValue",parseFloat(a.target.value))),"data-testid":n.testid||void 0},null,40,Eg)]),c("div",wg,[c("button",{class:"crossfader-snap crossfader-snap--a",disabled:n.disabled,onClick:e[1]||(e[1]=a=>{t.$emit("update:modelValue",0),t.$emit("snap-a")})},"Snap A",8,Ag),c("button",{class:"crossfader-randomize",disabled:n.disabled,onClick:e[2]||(e[2]=(...a)=>r.onRandomize&&r.onRandomize(...a)),title:"Randomize"},"~",8,Pg),c("button",{class:"crossfader-snap crossfader-snap--b",disabled:n.disabled,onClick:e[3]||(e[3]=a=>{t.$emit("update:modelValue",1),t.$emit("snap-b")})},"Snap B",8,Cg)])])}const Ig=Fi(yg,[["render",Rg],["__scopeId","data-v-2fa9f584"]]),Lg={name:"LiveParamRow",props:{label:{type:String,required:!0},paramKey:{type:String,required:!0},value:{type:Number,default:0},min:{type:Number,default:0},max:{type:Number,default:1},source:{type:String,default:""},modulated:{type:Boolean,default:!1}},computed:{fillPct(){const t=this.max-this.min;return t===0?0:Math.max(0,Math.min(100,(this.value-this.min)/t*100))},formattedValue(){const t=this.value;return Number.isNaN(t)?"—":Math.abs(t)>=10?t.toFixed(1):t.toFixed(2)}}},Dg={class:"lpr-label"},Ng={class:"lpr-name"},Ug={key:0,class:"lpr-source"},Fg={class:"lpr-bar-wrap"},kg={class:"lpr-value"};function Og(t,e,n,i,s,r){return A(),P("div",{class:Be(["lpr",{"lpr--modulated":n.modulated}])},[c("div",Dg,[c("span",Ng,B(n.label),1),n.source&&n.modulated?(A(),P("span",Ug,"← "+B(n.source),1)):Le("",!0)]),c("div",Fg,[c("div",{class:"lpr-bar",style:hn({width:r.fillPct+"%"})},null,4)]),c("code",kg,B(r.formattedValue),1)],2)}const Bg=Fi(Lg,[["render",Og],["__scopeId","data-v-9b271c77"]]),xu={sine:t=>Math.sin(t),triangle:t=>{const e=(t/(Math.PI*2)%1+1)%1;return e<.5?4*e-1:3-4*e},saw:t=>2*((t/(Math.PI*2)%1+1)%1)-1,square:t=>Math.sin(t)>=0?1:-1},Vg={name:"Waveform",props:{shape:{type:String,default:"Sine"},phase:{type:Number,default:0},depth:{type:Number,default:.8},active:{type:Boolean,default:!1},width:{type:Number,default:80},height:{type:Number,default:30},cycles:{type:Number,default:2}},computed:{strokeColor(){return this.active?"var(--live)":"var(--text-dim)"},points(){const{width:t,height:e,shape:n,phase:i,depth:s,cycles:r}=this,a=e/2,l=(e/2-2)*Math.min(1,Math.max(0,s)),u=(n||"sine").toLowerCase(),d=xu[u]||xu.sine,f=[],m=t;if(u==="noise")for(let p=0;p<=m;p++){const o=a+Math.sin(p*.8+i)*Math.cos(p*1.3+i*.7)*l;f.push(`${p},${o.toFixed(1)}`)}else for(let p=0;p<=m;p++){const o=p/m*Math.PI*2*r+(i||0),h=a-d(o)*l;f.push(`${p},${h.toFixed(1)}`)}return f.join(" ")}}},zg=["width","height","viewBox"],Gg=["points","stroke"];function Hg(t,e,n,i,s,r){return A(),P("svg",{width:n.width,height:n.height,viewBox:`0 0 ${n.width} ${n.height}`,class:Be(["waveform",{"waveform--active":n.active}]),"aria-hidden":"true"},[c("polyline",{points:r.points,fill:"none",stroke:r.strokeColor,"stroke-width":"1.5","stroke-linejoin":"round","stroke-linecap":"round"},null,8,Gg)],10,zg)}const Wg=Fi(Vg,[["render",Hg],["__scopeId","data-v-fb4eb07f"]]),qg={name:"TargetCell",emits:["toggle"],props:{label:{type:String,required:!0},paramKey:{type:String,required:!0},owners:{type:Array,default:()=>[]},selected:{type:Boolean,default:!1}},computed:{tooltip(){return this.owners.length?`${this.label} ← ${this.owners.join(", ")}`:this.label}}},Xg=["title"],jg={class:"target-cell-label"},Yg={key:0,class:"target-cell-owner"},Kg={key:1,class:"target-cell-owner"},Jg={class:"target-cell-extra"};function Zg(t,e,n,i,s,r){return A(),P("button",{class:Be(["target-cell",{"target-cell--routed":n.owners.length>0,"target-cell--selected":n.selected}]),title:r.tooltip,onClick:e[0]||(e[0]=a=>t.$emit("toggle",n.paramKey)),type:"button"},[c("span",jg,B(n.label),1),n.owners.length===1?(A(),P("span",Yg,B(n.owners[0]),1)):n.owners.length>1?(A(),P("span",Kg,[Ge(B(n.owners[0]),1),c("span",Jg," +"+B(n.owners.length-1),1)])):Le("",!0)],10,Xg)}const Qg=Fi(qg,[["render",Zg],["__scopeId","data-v-4372db52"]]);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const lc="184",$g=0,Su=1,e_=2,ca=1,t_=2,ir=3,Ni=0,an=1,ri=2,oi=0,Rs=1,Jo=2,bu=3,Mu=4,n_=5,Ki=100,i_=101,s_=102,r_=103,a_=104,o_=200,l_=201,c_=202,u_=203,Zo=204,Qo=205,d_=206,f_=207,h_=208,p_=209,m_=210,g_=211,__=212,v_=213,y_=214,$o=0,el=1,tl=2,Us=3,nl=4,il=5,sl=6,rl=7,cc=0,x_=1,S_=2,Hn=0,Df=1,Nf=2,Uf=3,Ff=4,kf=5,Of=6,Bf=7,Vf=300,is=301,Fs=302,so=303,ro=304,Va=306,al=1e3,ai=1001,ol=1002,Gt=1003,b_=1004,Nr=1005,Kt=1006,ao=1007,Zi=1008,mn=1009,zf=1010,Gf=1011,xr=1012,uc=1013,Xn=1014,Vn=1015,hi=1016,dc=1017,fc=1018,Sr=1020,Hf=35902,Wf=35899,qf=1021,Xf=1022,An=1023,pi=1026,Qi=1027,jf=1028,hc=1029,ss=1030,pc=1031,mc=1033,ua=33776,da=33777,fa=33778,ha=33779,ll=35840,cl=35841,ul=35842,dl=35843,fl=36196,hl=37492,pl=37496,ml=37488,gl=37489,ba=37490,_l=37491,vl=37808,yl=37809,xl=37810,Sl=37811,bl=37812,Ml=37813,Tl=37814,El=37815,wl=37816,Al=37817,Pl=37818,Cl=37819,Rl=37820,Il=37821,Ll=36492,Dl=36494,Nl=36495,Ul=36283,Fl=36284,Ma=36285,kl=36286,M_=3200,Ol=0,T_=1,Ri="",xn="srgb",Ta="srgb-linear",Ea="linear",_t="srgb",us=7680,Tu=519,E_=512,w_=513,A_=514,gc=515,P_=516,C_=517,_c=518,R_=519,Eu=35044,wu="300 es",zn=2e3,br=2001;function I_(t){for(let e=t.length-1;e>=0;--e)if(t[e]>=65535)return!0;return!1}function wa(t){return document.createElementNS("http://www.w3.org/1999/xhtml",t)}function L_(){const t=wa("canvas");return t.style.display="block",t}const Au={};function Pu(...t){const e="THREE."+t.shift();console.log(e,...t)}function Yf(t){const e=t[0];if(typeof e=="string"&&e.startsWith("TSL:")){const n=t[1];n&&n.isStackTrace?t[0]+=" "+n.getLocation():t[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return t}function Je(...t){t=Yf(t);const e="THREE."+t.shift();{const n=t[0];n&&n.isStackTrace?console.warn(n.getError(e)):console.warn(e,...t)}}function ht(...t){t=Yf(t);const e="THREE."+t.shift();{const n=t[0];n&&n.isStackTrace?console.error(n.getError(e)):console.error(e,...t)}}function Bl(...t){const e=t.join(" ");e in Au||(Au[e]=!0,Je(...t))}function D_(t,e,n){return new Promise(function(i,s){function r(){switch(t.clientWaitSync(e,t.SYNC_FLUSH_COMMANDS_BIT,0)){case t.WAIT_FAILED:s();break;case t.TIMEOUT_EXPIRED:setTimeout(r,n);break;default:i()}}setTimeout(r,n)})}const N_={[$o]:el,[tl]:sl,[nl]:rl,[Us]:il,[el]:$o,[sl]:tl,[rl]:nl,[il]:Us};class as{addEventListener(e,n){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(n)===-1&&i[e].push(n)}hasEventListener(e,n){const i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(n)!==-1}removeEventListener(e,n){const i=this._listeners;if(i===void 0)return;const s=i[e];if(s!==void 0){const r=s.indexOf(n);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const n=this._listeners;if(n===void 0)return;const i=n[e.type];if(i!==void 0){e.target=this;const s=i.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}}const qt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],oo=Math.PI/180,Vl=180/Math.PI;function wr(){const t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(qt[t&255]+qt[t>>8&255]+qt[t>>16&255]+qt[t>>24&255]+"-"+qt[e&255]+qt[e>>8&255]+"-"+qt[e>>16&15|64]+qt[e>>24&255]+"-"+qt[n&63|128]+qt[n>>8&255]+"-"+qt[n>>16&255]+qt[n>>24&255]+qt[i&255]+qt[i>>8&255]+qt[i>>16&255]+qt[i>>24&255]).toLowerCase()}function ct(t,e,n){return Math.max(e,Math.min(n,t))}function U_(t,e){return(t%e+e)%e}function lo(t,e,n){return(1-n)*t+n*e}function Ys(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return t/4294967295;case Uint16Array:return t/65535;case Uint8Array:return t/255;case Int32Array:return Math.max(t/2147483647,-1);case Int16Array:return Math.max(t/32767,-1);case Int8Array:return Math.max(t/127,-1);default:throw new Error("Invalid component type.")}}function sn(t,e){switch(e.constructor){case Float32Array:return t;case Uint32Array:return Math.round(t*4294967295);case Uint16Array:return Math.round(t*65535);case Uint8Array:return Math.round(t*255);case Int32Array:return Math.round(t*2147483647);case Int16Array:return Math.round(t*32767);case Int8Array:return Math.round(t*127);default:throw new Error("Invalid component type.")}}const Mc=class Mc{constructor(e=0,n=0){this.x=e,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,n){return this.x=e,this.y=n,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const n=this.x,i=this.y,s=e.elements;return this.x=s[0]*n+s[3]*i+s[6],this.y=s[1]*n+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,n){return this.x=ct(this.x,e.x,n.x),this.y=ct(this.y,e.y,n.y),this}clampScalar(e,n){return this.x=ct(this.x,e,n),this.y=ct(this.y,e,n),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(ct(i,e,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;const i=this.dot(e)/n;return Math.acos(ct(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const n=this.x-e.x,i=this.y-e.y;return n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this}rotateAround(e,n){const i=Math.cos(n),s=Math.sin(n),r=this.x-e.x,a=this.y-e.y;return this.x=r*i-a*s+e.x,this.y=r*s+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Mc.prototype.isVector2=!0;let dt=Mc;class zs{constructor(e=0,n=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=n,this._z=i,this._w=s}static slerpFlat(e,n,i,s,r,a,l){let u=i[s+0],d=i[s+1],f=i[s+2],m=i[s+3],p=r[a+0],o=r[a+1],h=r[a+2],y=r[a+3];if(m!==y||u!==p||d!==o||f!==h){let _=u*p+d*o+f*h+m*y;_<0&&(p=-p,o=-o,h=-h,y=-y,_=-_);let g=1-l;if(_<.9995){const S=Math.acos(_),E=Math.sin(S);g=Math.sin(g*S)/E,l=Math.sin(l*S)/E,u=u*g+p*l,d=d*g+o*l,f=f*g+h*l,m=m*g+y*l}else{u=u*g+p*l,d=d*g+o*l,f=f*g+h*l,m=m*g+y*l;const S=1/Math.sqrt(u*u+d*d+f*f+m*m);u*=S,d*=S,f*=S,m*=S}}e[n]=u,e[n+1]=d,e[n+2]=f,e[n+3]=m}static multiplyQuaternionsFlat(e,n,i,s,r,a){const l=i[s],u=i[s+1],d=i[s+2],f=i[s+3],m=r[a],p=r[a+1],o=r[a+2],h=r[a+3];return e[n]=l*h+f*m+u*o-d*p,e[n+1]=u*h+f*p+d*m-l*o,e[n+2]=d*h+f*o+l*p-u*m,e[n+3]=f*h-l*m-u*p-d*o,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,n,i,s){return this._x=e,this._y=n,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,n=!0){const i=e._x,s=e._y,r=e._z,a=e._order,l=Math.cos,u=Math.sin,d=l(i/2),f=l(s/2),m=l(r/2),p=u(i/2),o=u(s/2),h=u(r/2);switch(a){case"XYZ":this._x=p*f*m+d*o*h,this._y=d*o*m-p*f*h,this._z=d*f*h+p*o*m,this._w=d*f*m-p*o*h;break;case"YXZ":this._x=p*f*m+d*o*h,this._y=d*o*m-p*f*h,this._z=d*f*h-p*o*m,this._w=d*f*m+p*o*h;break;case"ZXY":this._x=p*f*m-d*o*h,this._y=d*o*m+p*f*h,this._z=d*f*h+p*o*m,this._w=d*f*m-p*o*h;break;case"ZYX":this._x=p*f*m-d*o*h,this._y=d*o*m+p*f*h,this._z=d*f*h-p*o*m,this._w=d*f*m+p*o*h;break;case"YZX":this._x=p*f*m+d*o*h,this._y=d*o*m+p*f*h,this._z=d*f*h-p*o*m,this._w=d*f*m-p*o*h;break;case"XZY":this._x=p*f*m-d*o*h,this._y=d*o*m-p*f*h,this._z=d*f*h+p*o*m,this._w=d*f*m+p*o*h;break;default:Je("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return n===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,n){const i=n/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const n=e.elements,i=n[0],s=n[4],r=n[8],a=n[1],l=n[5],u=n[9],d=n[2],f=n[6],m=n[10],p=i+l+m;if(p>0){const o=.5/Math.sqrt(p+1);this._w=.25/o,this._x=(f-u)*o,this._y=(r-d)*o,this._z=(a-s)*o}else if(i>l&&i>m){const o=2*Math.sqrt(1+i-l-m);this._w=(f-u)/o,this._x=.25*o,this._y=(s+a)/o,this._z=(r+d)/o}else if(l>m){const o=2*Math.sqrt(1+l-i-m);this._w=(r-d)/o,this._x=(s+a)/o,this._y=.25*o,this._z=(u+f)/o}else{const o=2*Math.sqrt(1+m-i-l);this._w=(a-s)/o,this._x=(r+d)/o,this._y=(u+f)/o,this._z=.25*o}return this._onChangeCallback(),this}setFromUnitVectors(e,n){let i=e.dot(n)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*n.z-e.z*n.y,this._y=e.z*n.x-e.x*n.z,this._z=e.x*n.y-e.y*n.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(ct(this.dot(e),-1,1)))}rotateTowards(e,n){const i=this.angleTo(e);if(i===0)return this;const s=Math.min(1,n/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,n){const i=e._x,s=e._y,r=e._z,a=e._w,l=n._x,u=n._y,d=n._z,f=n._w;return this._x=i*f+a*l+s*d-r*u,this._y=s*f+a*u+r*l-i*d,this._z=r*f+a*d+i*u-s*l,this._w=a*f-i*l-s*u-r*d,this._onChangeCallback(),this}slerp(e,n){let i=e._x,s=e._y,r=e._z,a=e._w,l=this.dot(e);l<0&&(i=-i,s=-s,r=-r,a=-a,l=-l);let u=1-n;if(l<.9995){const d=Math.acos(l),f=Math.sin(d);u=Math.sin(u*d)/f,n=Math.sin(n*d)/f,this._x=this._x*u+i*n,this._y=this._y*u+s*n,this._z=this._z*u+r*n,this._w=this._w*u+a*n,this._onChangeCallback()}else this._x=this._x*u+i*n,this._y=this._y*u+s*n,this._z=this._z*u+r*n,this._w=this._w*u+a*n,this.normalize();return this}slerpQuaternions(e,n,i){return this.copy(e).slerp(n,i)}random(){const e=2*Math.PI*Math.random(),n=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(n),r*Math.cos(n))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,n=0){return this._x=e[n],this._y=e[n+1],this._z=e[n+2],this._w=e[n+3],this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._w,e}fromBufferAttribute(e,n){return this._x=e.getX(n),this._y=e.getY(n),this._z=e.getZ(n),this._w=e.getW(n),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const Tc=class Tc{constructor(e=0,n=0,i=0){this.x=e,this.y=n,this.z=i}set(e,n,i){return i===void 0&&(i=this.z),this.x=e,this.y=n,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,n){return this.x=e.x*n.x,this.y=e.y*n.y,this.z=e.z*n.z,this}applyEuler(e){return this.applyQuaternion(Cu.setFromEuler(e))}applyAxisAngle(e,n){return this.applyQuaternion(Cu.setFromAxisAngle(e,n))}applyMatrix3(e){const n=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*n+r[3]*i+r[6]*s,this.y=r[1]*n+r[4]*i+r[7]*s,this.z=r[2]*n+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const n=this.x,i=this.y,s=this.z,r=e.elements,a=1/(r[3]*n+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*n+r[4]*i+r[8]*s+r[12])*a,this.y=(r[1]*n+r[5]*i+r[9]*s+r[13])*a,this.z=(r[2]*n+r[6]*i+r[10]*s+r[14])*a,this}applyQuaternion(e){const n=this.x,i=this.y,s=this.z,r=e.x,a=e.y,l=e.z,u=e.w,d=2*(a*s-l*i),f=2*(l*n-r*s),m=2*(r*i-a*n);return this.x=n+u*d+a*m-l*f,this.y=i+u*f+l*d-r*m,this.z=s+u*m+r*f-a*d,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const n=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*n+r[4]*i+r[8]*s,this.y=r[1]*n+r[5]*i+r[9]*s,this.z=r[2]*n+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,n){return this.x=ct(this.x,e.x,n.x),this.y=ct(this.y,e.y,n.y),this.z=ct(this.z,e.z,n.z),this}clampScalar(e,n){return this.x=ct(this.x,e,n),this.y=ct(this.y,e,n),this.z=ct(this.z,e,n),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(ct(i,e,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,n){const i=e.x,s=e.y,r=e.z,a=n.x,l=n.y,u=n.z;return this.x=s*u-r*l,this.y=r*a-i*u,this.z=i*l-s*a,this}projectOnVector(e){const n=e.lengthSq();if(n===0)return this.set(0,0,0);const i=e.dot(this)/n;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return co.copy(this).projectOnVector(e),this.sub(co)}reflect(e){return this.sub(co.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;const i=this.dot(e)/n;return Math.acos(ct(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const n=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return n*n+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,n,i){const s=Math.sin(n)*e;return this.x=s*Math.sin(i),this.y=Math.cos(n)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,n,i){return this.x=e*Math.sin(n),this.y=i,this.z=e*Math.cos(n),this}setFromMatrixPosition(e){const n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(e){const n=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=n,this.y=i,this.z=s,this}setFromMatrixColumn(e,n){return this.fromArray(e.elements,n*4)}setFromMatrix3Column(e,n){return this.fromArray(e.elements,n*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,n=Math.random()*2-1,i=Math.sqrt(1-n*n);return this.x=i*Math.cos(e),this.y=n,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Tc.prototype.isVector3=!0;let H=Tc;const co=new H,Cu=new zs,Ec=class Ec{constructor(e,n,i,s,r,a,l,u,d){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,n,i,s,r,a,l,u,d)}set(e,n,i,s,r,a,l,u,d){const f=this.elements;return f[0]=e,f[1]=s,f[2]=l,f[3]=n,f[4]=r,f[5]=u,f[6]=i,f[7]=a,f[8]=d,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],this}extractBasis(e,n,i){return e.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const n=e.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){const i=e.elements,s=n.elements,r=this.elements,a=i[0],l=i[3],u=i[6],d=i[1],f=i[4],m=i[7],p=i[2],o=i[5],h=i[8],y=s[0],_=s[3],g=s[6],S=s[1],E=s[4],b=s[7],L=s[2],w=s[5],D=s[8];return r[0]=a*y+l*S+u*L,r[3]=a*_+l*E+u*w,r[6]=a*g+l*b+u*D,r[1]=d*y+f*S+m*L,r[4]=d*_+f*E+m*w,r[7]=d*g+f*b+m*D,r[2]=p*y+o*S+h*L,r[5]=p*_+o*E+h*w,r[8]=p*g+o*b+h*D,this}multiplyScalar(e){const n=this.elements;return n[0]*=e,n[3]*=e,n[6]*=e,n[1]*=e,n[4]*=e,n[7]*=e,n[2]*=e,n[5]*=e,n[8]*=e,this}determinant(){const e=this.elements,n=e[0],i=e[1],s=e[2],r=e[3],a=e[4],l=e[5],u=e[6],d=e[7],f=e[8];return n*a*f-n*l*d-i*r*f+i*l*u+s*r*d-s*a*u}invert(){const e=this.elements,n=e[0],i=e[1],s=e[2],r=e[3],a=e[4],l=e[5],u=e[6],d=e[7],f=e[8],m=f*a-l*d,p=l*u-f*r,o=d*r-a*u,h=n*m+i*p+s*o;if(h===0)return this.set(0,0,0,0,0,0,0,0,0);const y=1/h;return e[0]=m*y,e[1]=(s*d-f*i)*y,e[2]=(l*i-s*a)*y,e[3]=p*y,e[4]=(f*n-s*u)*y,e[5]=(s*r-l*n)*y,e[6]=o*y,e[7]=(i*u-d*n)*y,e[8]=(a*n-i*r)*y,this}transpose(){let e;const n=this.elements;return e=n[1],n[1]=n[3],n[3]=e,e=n[2],n[2]=n[6],n[6]=e,e=n[5],n[5]=n[7],n[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const n=this.elements;return e[0]=n[0],e[1]=n[3],e[2]=n[6],e[3]=n[1],e[4]=n[4],e[5]=n[7],e[6]=n[2],e[7]=n[5],e[8]=n[8],this}setUvTransform(e,n,i,s,r,a,l){const u=Math.cos(r),d=Math.sin(r);return this.set(i*u,i*d,-i*(u*a+d*l)+a+e,-s*d,s*u,-s*(-d*a+u*l)+l+n,0,0,1),this}scale(e,n){return this.premultiply(uo.makeScale(e,n)),this}rotate(e){return this.premultiply(uo.makeRotation(-e)),this}translate(e,n){return this.premultiply(uo.makeTranslation(e,n)),this}makeTranslation(e,n){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,n,0,0,1),this}makeRotation(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,i,n,0,0,0,1),this}makeScale(e,n){return this.set(e,0,0,0,n,0,0,0,1),this}equals(e){const n=this.elements,i=e.elements;for(let s=0;s<9;s++)if(n[s]!==i[s])return!1;return!0}fromArray(e,n=0){for(let i=0;i<9;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){const i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}};Ec.prototype.isMatrix3=!0;let et=Ec;const uo=new et,Ru=new et().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Iu=new et().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function F_(){const t={enabled:!0,workingColorSpace:Ta,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===_t&&(s.r=li(s.r),s.g=li(s.g),s.b=li(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===_t&&(s.r=Is(s.r),s.g=Is(s.g),s.b=Is(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Ri?Ea:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Bl("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),t.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Bl("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),t.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],i=[.3127,.329];return t.define({[Ta]:{primaries:e,whitePoint:i,transfer:Ea,toXYZ:Ru,fromXYZ:Iu,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:xn},outputColorSpaceConfig:{drawingBufferColorSpace:xn}},[xn]:{primaries:e,whitePoint:i,transfer:_t,toXYZ:Ru,fromXYZ:Iu,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:xn}}}),t}const lt=F_();function li(t){return t<.04045?t*.0773993808:Math.pow(t*.9478672986+.0521327014,2.4)}function Is(t){return t<.0031308?t*12.92:1.055*Math.pow(t,.41666)-.055}let ds;class k_{static getDataURL(e,n="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{ds===void 0&&(ds=wa("canvas")),ds.width=e.width,ds.height=e.height;const s=ds.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=ds}return i.toDataURL(n)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const n=wa("canvas");n.width=e.width,n.height=e.height;const i=n.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=li(r[a]/255)*255;return i.putImageData(s,0,0),n}else if(e.data){const n=e.data.slice(0);for(let i=0;i<n.length;i++)n instanceof Uint8Array||n instanceof Uint8ClampedArray?n[i]=Math.floor(li(n[i]/255)*255):n[i]=li(n[i]);return{data:n,width:e.width,height:e.height}}else return Je("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let O_=0;class vc{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:O_++}),this.uuid=wr(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const n=this.data;return typeof HTMLVideoElement<"u"&&n instanceof HTMLVideoElement?e.set(n.videoWidth,n.videoHeight,0):typeof VideoFrame<"u"&&n instanceof VideoFrame?e.set(n.displayWidth,n.displayHeight,0):n!==null?e.set(n.width,n.height,n.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const n=e===void 0||typeof e=="string";if(!n&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,l=s.length;a<l;a++)s[a].isDataTexture?r.push(fo(s[a].image)):r.push(fo(s[a]))}else r=fo(s);i.url=r}return n||(e.images[this.uuid]=i),i}}function fo(t){return typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap?k_.getDataURL(t):t.data?{data:Array.from(t.data),width:t.width,height:t.height,type:t.data.constructor.name}:(Je("Texture: Unable to serialize Texture."),{})}let B_=0;const ho=new H;class en extends as{constructor(e=en.DEFAULT_IMAGE,n=en.DEFAULT_MAPPING,i=ai,s=ai,r=Kt,a=Zi,l=An,u=mn,d=en.DEFAULT_ANISOTROPY,f=Ri){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:B_++}),this.uuid=wr(),this.name="",this.source=new vc(e),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=d,this.format=l,this.internalFormat=null,this.type=u,this.offset=new dt(0,0),this.repeat=new dt(1,1),this.center=new dt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new et,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=f,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(ho).x}get height(){return this.source.getSize(ho).y}get depth(){return this.source.getSize(ho).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const n in e){const i=e[n];if(i===void 0){Je(`Texture.setValues(): parameter '${n}' has value of undefined.`);continue}const s=this[n];if(s===void 0){Je(`Texture.setValues(): property '${n}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[n]=i}}toJSON(e){const n=e===void 0||typeof e=="string";if(!n&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),n||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Vf)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case al:e.x=e.x-Math.floor(e.x);break;case ai:e.x=e.x<0?0:1;break;case ol:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case al:e.y=e.y-Math.floor(e.y);break;case ai:e.y=e.y<0?0:1;break;case ol:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}en.DEFAULT_IMAGE=null;en.DEFAULT_MAPPING=Vf;en.DEFAULT_ANISOTROPY=1;const wc=class wc{constructor(e=0,n=0,i=0,s=1){this.x=e,this.y=n,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,n,i,s){return this.x=e,this.y=n,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this.w=e.w+n.w,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this.w+=e.w*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this.w=e.w-n.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const n=this.x,i=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*n+a[4]*i+a[8]*s+a[12]*r,this.y=a[1]*n+a[5]*i+a[9]*s+a[13]*r,this.z=a[2]*n+a[6]*i+a[10]*s+a[14]*r,this.w=a[3]*n+a[7]*i+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const n=Math.sqrt(1-e.w*e.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/n,this.y=e.y/n,this.z=e.z/n),this}setAxisAngleFromRotationMatrix(e){let n,i,s,r;const u=e.elements,d=u[0],f=u[4],m=u[8],p=u[1],o=u[5],h=u[9],y=u[2],_=u[6],g=u[10];if(Math.abs(f-p)<.01&&Math.abs(m-y)<.01&&Math.abs(h-_)<.01){if(Math.abs(f+p)<.1&&Math.abs(m+y)<.1&&Math.abs(h+_)<.1&&Math.abs(d+o+g-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;const E=(d+1)/2,b=(o+1)/2,L=(g+1)/2,w=(f+p)/4,D=(m+y)/4,x=(h+_)/4;return E>b&&E>L?E<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(E),s=w/i,r=D/i):b>L?b<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(b),i=w/s,r=x/s):L<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(L),i=D/r,s=x/r),this.set(i,s,r,n),this}let S=Math.sqrt((_-h)*(_-h)+(m-y)*(m-y)+(p-f)*(p-f));return Math.abs(S)<.001&&(S=1),this.x=(_-h)/S,this.y=(m-y)/S,this.z=(p-f)/S,this.w=Math.acos((d+o+g-1)/2),this}setFromMatrixPosition(e){const n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this.w=n[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,n){return this.x=ct(this.x,e.x,n.x),this.y=ct(this.y,e.y,n.y),this.z=ct(this.z,e.z,n.z),this.w=ct(this.w,e.w,n.w),this}clampScalar(e,n){return this.x=ct(this.x,e,n),this.y=ct(this.y,e,n),this.z=ct(this.z,e,n),this.w=ct(this.w,e,n),this}clampLength(e,n){const i=this.length();return this.divideScalar(i||1).multiplyScalar(ct(i,e,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this.w+=(e.w-this.w)*n,this}lerpVectors(e,n,i){return this.x=e.x+(n.x-e.x)*i,this.y=e.y+(n.y-e.y)*i,this.z=e.z+(n.z-e.z)*i,this.w=e.w+(n.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this.w=e[n+3],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e[n+3]=this.w,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this.w=e.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};wc.prototype.isVector4=!0;let Ct=wc;class V_ extends as{constructor(e=1,n=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Kt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},i),this.isRenderTarget=!0,this.width=e,this.height=n,this.depth=i.depth,this.scissor=new Ct(0,0,e,n),this.scissorTest=!1,this.viewport=new Ct(0,0,e,n),this.textures=[];const s={width:e,height:n,depth:i.depth},r=new en(s),a=i.count;for(let l=0;l<a;l++)this.textures[l]=r.clone(),this.textures[l].isRenderTargetTexture=!0,this.textures[l].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview}_setTextureOptions(e={}){const n={minFilter:Kt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(n.mapping=e.mapping),e.wrapS!==void 0&&(n.wrapS=e.wrapS),e.wrapT!==void 0&&(n.wrapT=e.wrapT),e.wrapR!==void 0&&(n.wrapR=e.wrapR),e.magFilter!==void 0&&(n.magFilter=e.magFilter),e.minFilter!==void 0&&(n.minFilter=e.minFilter),e.format!==void 0&&(n.format=e.format),e.type!==void 0&&(n.type=e.type),e.anisotropy!==void 0&&(n.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(n.colorSpace=e.colorSpace),e.flipY!==void 0&&(n.flipY=e.flipY),e.generateMipmaps!==void 0&&(n.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(n.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(n)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,n,i=1){if(this.width!==e||this.height!==n||this.depth!==i){this.width=e,this.height=n,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=n,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,n),this.scissor.set(0,0,e,n)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let n=0,i=e.textures.length;n<i;n++){this.textures[n]=e.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0,this.textures[n].renderTarget=this;const s=Object.assign({},e.textures[n].image);this.textures[n].source=new vc(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this.multiview=e.multiview,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Wn extends V_{constructor(e=1,n=1,i={}){super(e,n,i),this.isWebGLRenderTarget=!0}}class Kf extends en{constructor(e=null,n=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:n,height:i,depth:s},this.magFilter=Gt,this.minFilter=Gt,this.wrapR=ai,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class z_ extends en{constructor(e=null,n=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:n,height:i,depth:s},this.magFilter=Gt,this.minFilter=Gt,this.wrapR=ai,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Pa=class Pa{constructor(e,n,i,s,r,a,l,u,d,f,m,p,o,h,y,_){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,n,i,s,r,a,l,u,d,f,m,p,o,h,y,_)}set(e,n,i,s,r,a,l,u,d,f,m,p,o,h,y,_){const g=this.elements;return g[0]=e,g[4]=n,g[8]=i,g[12]=s,g[1]=r,g[5]=a,g[9]=l,g[13]=u,g[2]=d,g[6]=f,g[10]=m,g[14]=p,g[3]=o,g[7]=h,g[11]=y,g[15]=_,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Pa().fromArray(this.elements)}copy(e){const n=this.elements,i=e.elements;return n[0]=i[0],n[1]=i[1],n[2]=i[2],n[3]=i[3],n[4]=i[4],n[5]=i[5],n[6]=i[6],n[7]=i[7],n[8]=i[8],n[9]=i[9],n[10]=i[10],n[11]=i[11],n[12]=i[12],n[13]=i[13],n[14]=i[14],n[15]=i[15],this}copyPosition(e){const n=this.elements,i=e.elements;return n[12]=i[12],n[13]=i[13],n[14]=i[14],this}setFromMatrix3(e){const n=e.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(e,n,i){return this.determinant()===0?(e.set(1,0,0),n.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,n,i){return this.set(e.x,n.x,i.x,0,e.y,n.y,i.y,0,e.z,n.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinant()===0)return this.identity();const n=this.elements,i=e.elements,s=1/fs.setFromMatrixColumn(e,0).length(),r=1/fs.setFromMatrixColumn(e,1).length(),a=1/fs.setFromMatrixColumn(e,2).length();return n[0]=i[0]*s,n[1]=i[1]*s,n[2]=i[2]*s,n[3]=0,n[4]=i[4]*r,n[5]=i[5]*r,n[6]=i[6]*r,n[7]=0,n[8]=i[8]*a,n[9]=i[9]*a,n[10]=i[10]*a,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(e){const n=this.elements,i=e.x,s=e.y,r=e.z,a=Math.cos(i),l=Math.sin(i),u=Math.cos(s),d=Math.sin(s),f=Math.cos(r),m=Math.sin(r);if(e.order==="XYZ"){const p=a*f,o=a*m,h=l*f,y=l*m;n[0]=u*f,n[4]=-u*m,n[8]=d,n[1]=o+h*d,n[5]=p-y*d,n[9]=-l*u,n[2]=y-p*d,n[6]=h+o*d,n[10]=a*u}else if(e.order==="YXZ"){const p=u*f,o=u*m,h=d*f,y=d*m;n[0]=p+y*l,n[4]=h*l-o,n[8]=a*d,n[1]=a*m,n[5]=a*f,n[9]=-l,n[2]=o*l-h,n[6]=y+p*l,n[10]=a*u}else if(e.order==="ZXY"){const p=u*f,o=u*m,h=d*f,y=d*m;n[0]=p-y*l,n[4]=-a*m,n[8]=h+o*l,n[1]=o+h*l,n[5]=a*f,n[9]=y-p*l,n[2]=-a*d,n[6]=l,n[10]=a*u}else if(e.order==="ZYX"){const p=a*f,o=a*m,h=l*f,y=l*m;n[0]=u*f,n[4]=h*d-o,n[8]=p*d+y,n[1]=u*m,n[5]=y*d+p,n[9]=o*d-h,n[2]=-d,n[6]=l*u,n[10]=a*u}else if(e.order==="YZX"){const p=a*u,o=a*d,h=l*u,y=l*d;n[0]=u*f,n[4]=y-p*m,n[8]=h*m+o,n[1]=m,n[5]=a*f,n[9]=-l*f,n[2]=-d*f,n[6]=o*m+h,n[10]=p-y*m}else if(e.order==="XZY"){const p=a*u,o=a*d,h=l*u,y=l*d;n[0]=u*f,n[4]=-m,n[8]=d*f,n[1]=p*m+y,n[5]=a*f,n[9]=o*m-h,n[2]=h*m-o,n[6]=l*f,n[10]=y*m+p}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(e){return this.compose(G_,e,H_)}lookAt(e,n,i){const s=this.elements;return un.subVectors(e,n),un.lengthSq()===0&&(un.z=1),un.normalize(),Si.crossVectors(i,un),Si.lengthSq()===0&&(Math.abs(i.z)===1?un.x+=1e-4:un.z+=1e-4,un.normalize(),Si.crossVectors(i,un)),Si.normalize(),Ur.crossVectors(un,Si),s[0]=Si.x,s[4]=Ur.x,s[8]=un.x,s[1]=Si.y,s[5]=Ur.y,s[9]=un.y,s[2]=Si.z,s[6]=Ur.z,s[10]=un.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){const i=e.elements,s=n.elements,r=this.elements,a=i[0],l=i[4],u=i[8],d=i[12],f=i[1],m=i[5],p=i[9],o=i[13],h=i[2],y=i[6],_=i[10],g=i[14],S=i[3],E=i[7],b=i[11],L=i[15],w=s[0],D=s[4],x=s[8],R=s[12],O=s[1],U=s[5],W=s[9],ee=s[13],le=s[2],V=s[6],q=s[10],z=s[14],te=s[3],de=s[7],Ee=s[11],De=s[15];return r[0]=a*w+l*O+u*le+d*te,r[4]=a*D+l*U+u*V+d*de,r[8]=a*x+l*W+u*q+d*Ee,r[12]=a*R+l*ee+u*z+d*De,r[1]=f*w+m*O+p*le+o*te,r[5]=f*D+m*U+p*V+o*de,r[9]=f*x+m*W+p*q+o*Ee,r[13]=f*R+m*ee+p*z+o*De,r[2]=h*w+y*O+_*le+g*te,r[6]=h*D+y*U+_*V+g*de,r[10]=h*x+y*W+_*q+g*Ee,r[14]=h*R+y*ee+_*z+g*De,r[3]=S*w+E*O+b*le+L*te,r[7]=S*D+E*U+b*V+L*de,r[11]=S*x+E*W+b*q+L*Ee,r[15]=S*R+E*ee+b*z+L*De,this}multiplyScalar(e){const n=this.elements;return n[0]*=e,n[4]*=e,n[8]*=e,n[12]*=e,n[1]*=e,n[5]*=e,n[9]*=e,n[13]*=e,n[2]*=e,n[6]*=e,n[10]*=e,n[14]*=e,n[3]*=e,n[7]*=e,n[11]*=e,n[15]*=e,this}determinant(){const e=this.elements,n=e[0],i=e[4],s=e[8],r=e[12],a=e[1],l=e[5],u=e[9],d=e[13],f=e[2],m=e[6],p=e[10],o=e[14],h=e[3],y=e[7],_=e[11],g=e[15],S=u*o-d*p,E=l*o-d*m,b=l*p-u*m,L=a*o-d*f,w=a*p-u*f,D=a*m-l*f;return n*(y*S-_*E+g*b)-i*(h*S-_*L+g*w)+s*(h*E-y*L+g*D)-r*(h*b-y*w+_*D)}transpose(){const e=this.elements;let n;return n=e[1],e[1]=e[4],e[4]=n,n=e[2],e[2]=e[8],e[8]=n,n=e[6],e[6]=e[9],e[9]=n,n=e[3],e[3]=e[12],e[12]=n,n=e[7],e[7]=e[13],e[13]=n,n=e[11],e[11]=e[14],e[14]=n,this}setPosition(e,n,i){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=n,s[14]=i),this}invert(){const e=this.elements,n=e[0],i=e[1],s=e[2],r=e[3],a=e[4],l=e[5],u=e[6],d=e[7],f=e[8],m=e[9],p=e[10],o=e[11],h=e[12],y=e[13],_=e[14],g=e[15],S=n*l-i*a,E=n*u-s*a,b=n*d-r*a,L=i*u-s*l,w=i*d-r*l,D=s*d-r*u,x=f*y-m*h,R=f*_-p*h,O=f*g-o*h,U=m*_-p*y,W=m*g-o*y,ee=p*g-o*_,le=S*ee-E*W+b*U+L*O-w*R+D*x;if(le===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const V=1/le;return e[0]=(l*ee-u*W+d*U)*V,e[1]=(s*W-i*ee-r*U)*V,e[2]=(y*D-_*w+g*L)*V,e[3]=(p*w-m*D-o*L)*V,e[4]=(u*O-a*ee-d*R)*V,e[5]=(n*ee-s*O+r*R)*V,e[6]=(_*b-h*D-g*E)*V,e[7]=(f*D-p*b+o*E)*V,e[8]=(a*W-l*O+d*x)*V,e[9]=(i*O-n*W-r*x)*V,e[10]=(h*w-y*b+g*S)*V,e[11]=(m*b-f*w-o*S)*V,e[12]=(l*R-a*U-u*x)*V,e[13]=(n*U-i*R+s*x)*V,e[14]=(y*E-h*L-_*S)*V,e[15]=(f*L-m*E+p*S)*V,this}scale(e){const n=this.elements,i=e.x,s=e.y,r=e.z;return n[0]*=i,n[4]*=s,n[8]*=r,n[1]*=i,n[5]*=s,n[9]*=r,n[2]*=i,n[6]*=s,n[10]*=r,n[3]*=i,n[7]*=s,n[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,n=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(n,i,s))}makeTranslation(e,n,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,n,0,0,1,i,0,0,0,1),this}makeRotationX(e){const n=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,n,-i,0,0,i,n,0,0,0,0,1),this}makeRotationY(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,0,i,0,0,1,0,0,-i,0,n,0,0,0,0,1),this}makeRotationZ(e){const n=Math.cos(e),i=Math.sin(e);return this.set(n,-i,0,0,i,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,n){const i=Math.cos(n),s=Math.sin(n),r=1-i,a=e.x,l=e.y,u=e.z,d=r*a,f=r*l;return this.set(d*a+i,d*l-s*u,d*u+s*l,0,d*l+s*u,f*l+i,f*u-s*a,0,d*u-s*l,f*u+s*a,r*u*u+i,0,0,0,0,1),this}makeScale(e,n,i){return this.set(e,0,0,0,0,n,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,n,i,s,r,a){return this.set(1,i,r,0,e,1,a,0,n,s,1,0,0,0,0,1),this}compose(e,n,i){const s=this.elements,r=n._x,a=n._y,l=n._z,u=n._w,d=r+r,f=a+a,m=l+l,p=r*d,o=r*f,h=r*m,y=a*f,_=a*m,g=l*m,S=u*d,E=u*f,b=u*m,L=i.x,w=i.y,D=i.z;return s[0]=(1-(y+g))*L,s[1]=(o+b)*L,s[2]=(h-E)*L,s[3]=0,s[4]=(o-b)*w,s[5]=(1-(p+g))*w,s[6]=(_+S)*w,s[7]=0,s[8]=(h+E)*D,s[9]=(_-S)*D,s[10]=(1-(p+y))*D,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,n,i){const s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];const r=this.determinant();if(r===0)return i.set(1,1,1),n.identity(),this;let a=fs.set(s[0],s[1],s[2]).length();const l=fs.set(s[4],s[5],s[6]).length(),u=fs.set(s[8],s[9],s[10]).length();r<0&&(a=-a),Mn.copy(this);const d=1/a,f=1/l,m=1/u;return Mn.elements[0]*=d,Mn.elements[1]*=d,Mn.elements[2]*=d,Mn.elements[4]*=f,Mn.elements[5]*=f,Mn.elements[6]*=f,Mn.elements[8]*=m,Mn.elements[9]*=m,Mn.elements[10]*=m,n.setFromRotationMatrix(Mn),i.x=a,i.y=l,i.z=u,this}makePerspective(e,n,i,s,r,a,l=zn,u=!1){const d=this.elements,f=2*r/(n-e),m=2*r/(i-s),p=(n+e)/(n-e),o=(i+s)/(i-s);let h,y;if(u)h=r/(a-r),y=a*r/(a-r);else if(l===zn)h=-(a+r)/(a-r),y=-2*a*r/(a-r);else if(l===br)h=-a/(a-r),y=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+l);return d[0]=f,d[4]=0,d[8]=p,d[12]=0,d[1]=0,d[5]=m,d[9]=o,d[13]=0,d[2]=0,d[6]=0,d[10]=h,d[14]=y,d[3]=0,d[7]=0,d[11]=-1,d[15]=0,this}makeOrthographic(e,n,i,s,r,a,l=zn,u=!1){const d=this.elements,f=2/(n-e),m=2/(i-s),p=-(n+e)/(n-e),o=-(i+s)/(i-s);let h,y;if(u)h=1/(a-r),y=a/(a-r);else if(l===zn)h=-2/(a-r),y=-(a+r)/(a-r);else if(l===br)h=-1/(a-r),y=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+l);return d[0]=f,d[4]=0,d[8]=0,d[12]=p,d[1]=0,d[5]=m,d[9]=0,d[13]=o,d[2]=0,d[6]=0,d[10]=h,d[14]=y,d[3]=0,d[7]=0,d[11]=0,d[15]=1,this}equals(e){const n=this.elements,i=e.elements;for(let s=0;s<16;s++)if(n[s]!==i[s])return!1;return!0}fromArray(e,n=0){for(let i=0;i<16;i++)this.elements[i]=e[i+n];return this}toArray(e=[],n=0){const i=this.elements;return e[n]=i[0],e[n+1]=i[1],e[n+2]=i[2],e[n+3]=i[3],e[n+4]=i[4],e[n+5]=i[5],e[n+6]=i[6],e[n+7]=i[7],e[n+8]=i[8],e[n+9]=i[9],e[n+10]=i[10],e[n+11]=i[11],e[n+12]=i[12],e[n+13]=i[13],e[n+14]=i[14],e[n+15]=i[15],e}};Pa.prototype.isMatrix4=!0;let Rt=Pa;const fs=new H,Mn=new Rt,G_=new H(0,0,0),H_=new H(1,1,1),Si=new H,Ur=new H,un=new H,Lu=new Rt,Du=new zs;class Ui{constructor(e=0,n=0,i=0,s=Ui.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=n,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,n,i,s=this._order){return this._x=e,this._y=n,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,n=this._order,i=!0){const s=e.elements,r=s[0],a=s[4],l=s[8],u=s[1],d=s[5],f=s[9],m=s[2],p=s[6],o=s[10];switch(n){case"XYZ":this._y=Math.asin(ct(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-f,o),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(p,d),this._z=0);break;case"YXZ":this._x=Math.asin(-ct(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(l,o),this._z=Math.atan2(u,d)):(this._y=Math.atan2(-m,r),this._z=0);break;case"ZXY":this._x=Math.asin(ct(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(-m,o),this._z=Math.atan2(-a,d)):(this._y=0,this._z=Math.atan2(u,r));break;case"ZYX":this._y=Math.asin(-ct(m,-1,1)),Math.abs(m)<.9999999?(this._x=Math.atan2(p,o),this._z=Math.atan2(u,r)):(this._x=0,this._z=Math.atan2(-a,d));break;case"YZX":this._z=Math.asin(ct(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(-f,d),this._y=Math.atan2(-m,r)):(this._x=0,this._y=Math.atan2(l,o));break;case"XZY":this._z=Math.asin(-ct(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(p,d),this._y=Math.atan2(l,r)):(this._x=Math.atan2(-f,o),this._y=0);break;default:Je("Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,n,i){return Lu.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Lu,n,i)}setFromVector3(e,n=this._order){return this.set(e.x,e.y,e.z,n)}reorder(e){return Du.setFromEuler(this),this.setFromQuaternion(Du,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Ui.DEFAULT_ORDER="XYZ";class Jf{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let W_=0;const Nu=new H,hs=new zs,Jn=new Rt,Fr=new H,Ks=new H,q_=new H,X_=new zs,Uu=new H(1,0,0),Fu=new H(0,1,0),ku=new H(0,0,1),Ou={type:"added"},j_={type:"removed"},ps={type:"childadded",child:null},po={type:"childremoved",child:null};class tn extends as{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:W_++}),this.uuid=wr(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=tn.DEFAULT_UP.clone();const e=new H,n=new Ui,i=new zs,s=new H(1,1,1);function r(){i.setFromEuler(n,!1)}function a(){n.setFromQuaternion(i,void 0,!1)}n._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Rt},normalMatrix:{value:new et}}),this.matrix=new Rt,this.matrixWorld=new Rt,this.matrixAutoUpdate=tn.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=tn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Jf,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,n){this.quaternion.setFromAxisAngle(e,n)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,n){return hs.setFromAxisAngle(e,n),this.quaternion.multiply(hs),this}rotateOnWorldAxis(e,n){return hs.setFromAxisAngle(e,n),this.quaternion.premultiply(hs),this}rotateX(e){return this.rotateOnAxis(Uu,e)}rotateY(e){return this.rotateOnAxis(Fu,e)}rotateZ(e){return this.rotateOnAxis(ku,e)}translateOnAxis(e,n){return Nu.copy(e).applyQuaternion(this.quaternion),this.position.add(Nu.multiplyScalar(n)),this}translateX(e){return this.translateOnAxis(Uu,e)}translateY(e){return this.translateOnAxis(Fu,e)}translateZ(e){return this.translateOnAxis(ku,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Jn.copy(this.matrixWorld).invert())}lookAt(e,n,i){e.isVector3?Fr.copy(e):Fr.set(e,n,i);const s=this.parent;this.updateWorldMatrix(!0,!1),Ks.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Jn.lookAt(Ks,Fr,this.up):Jn.lookAt(Fr,Ks,this.up),this.quaternion.setFromRotationMatrix(Jn),s&&(Jn.extractRotation(s.matrixWorld),hs.setFromRotationMatrix(Jn),this.quaternion.premultiply(hs.invert()))}add(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return e===this?(ht("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Ou),ps.child=e,this.dispatchEvent(ps),ps.child=null):ht("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const n=this.children.indexOf(e);return n!==-1&&(e.parent=null,this.children.splice(n,1),e.dispatchEvent(j_),po.child=e,this.dispatchEvent(po),po.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Jn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Jn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Jn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Ou),ps.child=e,this.dispatchEvent(ps),ps.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,n){if(this[e]===n)return this;for(let i=0,s=this.children.length;i<s;i++){const a=this.children[i].getObjectByProperty(e,n);if(a!==void 0)return a}}getObjectsByProperty(e,n,i=[]){this[e]===n&&i.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,n,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ks,e,q_),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ks,X_,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const n=this.matrixWorld.elements;return e.set(n[8],n[9],n[10]).normalize()}raycast(){}traverse(e){e(this);const n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].traverseVisible(e)}traverseAncestors(e){const n=this.parent;n!==null&&(e(n),n.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const n=e.x,i=e.y,s=e.z,r=this.matrix.elements;r[12]+=n-r[0]*n-r[4]*i-r[8]*s,r[13]+=i-r[1]*n-r[5]*i-r[9]*s,r[14]+=s-r[2]*n-r[6]*i-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const n=this.children;for(let i=0,s=n.length;i<s;i++)n[i].updateMatrixWorld(e)}updateWorldMatrix(e,n){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),n===!0){const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){const n=e===void 0||typeof e=="string",i={};n&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),this.static!==!1&&(s.static=this.static),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(l=>({...l,boundingBox:l.boundingBox?l.boundingBox.toJSON():void 0,boundingSphere:l.boundingSphere?l.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(l=>({...l})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(l,u){return l[u.uuid]===void 0&&(l[u.uuid]=u.toJSON(e)),u.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const l=this.geometry.parameters;if(l!==void 0&&l.shapes!==void 0){const u=l.shapes;if(Array.isArray(u))for(let d=0,f=u.length;d<f;d++){const m=u[d];r(e.shapes,m)}else r(e.shapes,u)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const l=[];for(let u=0,d=this.material.length;u<d;u++)l.push(r(e.materials,this.material[u]));s.material=l}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let l=0;l<this.children.length;l++)s.children.push(this.children[l].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let l=0;l<this.animations.length;l++){const u=this.animations[l];s.animations.push(r(e.animations,u))}}if(n){const l=a(e.geometries),u=a(e.materials),d=a(e.textures),f=a(e.images),m=a(e.shapes),p=a(e.skeletons),o=a(e.animations),h=a(e.nodes);l.length>0&&(i.geometries=l),u.length>0&&(i.materials=u),d.length>0&&(i.textures=d),f.length>0&&(i.images=f),m.length>0&&(i.shapes=m),p.length>0&&(i.skeletons=p),o.length>0&&(i.animations=o),h.length>0&&(i.nodes=h)}return i.object=s,i;function a(l){const u=[];for(const d in l){const f=l[d];delete f.metadata,u.push(f)}return u}}clone(e){return new this.constructor().copy(this,e)}copy(e,n=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),n===!0)for(let i=0;i<e.children.length;i++){const s=e.children[i];this.add(s.clone())}return this}}tn.DEFAULT_UP=new H(0,1,0);tn.DEFAULT_MATRIX_AUTO_UPDATE=!0;tn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class sr extends tn{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Y_={type:"move"};class mo{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new sr,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new sr,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new H,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new H),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new sr,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new H,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new H,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const n=this._hand;if(n)for(const i of e.hand.values())this._getHandJoint(n,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,n,i){let s=null,r=null,a=null;const l=this._targetRay,u=this._grip,d=this._hand;if(e&&n.session.visibilityState!=="visible-blurred"){if(d&&e.hand){a=!0;for(const y of e.hand.values()){const _=n.getJointPose(y,i),g=this._getHandJoint(d,y);_!==null&&(g.matrix.fromArray(_.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=_.radius),g.visible=_!==null}const f=d.joints["index-finger-tip"],m=d.joints["thumb-tip"],p=f.position.distanceTo(m.position),o=.02,h=.005;d.inputState.pinching&&p>o+h?(d.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!d.inputState.pinching&&p<=o-h&&(d.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else u!==null&&e.gripSpace&&(r=n.getPose(e.gripSpace,i),r!==null&&(u.matrix.fromArray(r.transform.matrix),u.matrix.decompose(u.position,u.rotation,u.scale),u.matrixWorldNeedsUpdate=!0,r.linearVelocity?(u.hasLinearVelocity=!0,u.linearVelocity.copy(r.linearVelocity)):u.hasLinearVelocity=!1,r.angularVelocity?(u.hasAngularVelocity=!0,u.angularVelocity.copy(r.angularVelocity)):u.hasAngularVelocity=!1,u.eventsEnabled&&u.dispatchEvent({type:"gripUpdated",data:e,target:this})));l!==null&&(s=n.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1,this.dispatchEvent(Y_)))}return l!==null&&(l.visible=s!==null),u!==null&&(u.visible=r!==null),d!==null&&(d.visible=a!==null),this}_getHandJoint(e,n){if(e.joints[n.jointName]===void 0){const i=new sr;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[n.jointName]=i,e.add(i)}return e.joints[n.jointName]}}const Zf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},bi={h:0,s:0,l:0},kr={h:0,s:0,l:0};function go(t,e,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?t+(e-t)*6*n:n<1/2?e:n<2/3?t+(e-t)*6*(2/3-n):t}class ut{constructor(e,n,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,n,i)}set(e,n,i){if(n===void 0&&i===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,n,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,n=xn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,lt.colorSpaceToWorking(this,n),this}setRGB(e,n,i,s=lt.workingColorSpace){return this.r=e,this.g=n,this.b=i,lt.colorSpaceToWorking(this,s),this}setHSL(e,n,i,s=lt.workingColorSpace){if(e=U_(e,1),n=ct(n,0,1),i=ct(i,0,1),n===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+n):i+n-i*n,a=2*i-r;this.r=go(a,r,e+1/3),this.g=go(a,r,e),this.b=go(a,r,e-1/3)}return lt.colorSpaceToWorking(this,s),this}setStyle(e,n=xn){function i(r){r!==void 0&&parseFloat(r)<1&&Je("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=s[1],l=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(l))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,n);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(l))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,n);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(l))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,n);break;default:Je("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,n);if(a===6)return this.setHex(parseInt(r,16),n);Je("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,n);return this}setColorName(e,n=xn){const i=Zf[e.toLowerCase()];return i!==void 0?this.setHex(i,n):Je("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=li(e.r),this.g=li(e.g),this.b=li(e.b),this}copyLinearToSRGB(e){return this.r=Is(e.r),this.g=Is(e.g),this.b=Is(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=xn){return lt.workingToColorSpace(Xt.copy(this),e),Math.round(ct(Xt.r*255,0,255))*65536+Math.round(ct(Xt.g*255,0,255))*256+Math.round(ct(Xt.b*255,0,255))}getHexString(e=xn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,n=lt.workingColorSpace){lt.workingToColorSpace(Xt.copy(this),n);const i=Xt.r,s=Xt.g,r=Xt.b,a=Math.max(i,s,r),l=Math.min(i,s,r);let u,d;const f=(l+a)/2;if(l===a)u=0,d=0;else{const m=a-l;switch(d=f<=.5?m/(a+l):m/(2-a-l),a){case i:u=(s-r)/m+(s<r?6:0);break;case s:u=(r-i)/m+2;break;case r:u=(i-s)/m+4;break}u/=6}return e.h=u,e.s=d,e.l=f,e}getRGB(e,n=lt.workingColorSpace){return lt.workingToColorSpace(Xt.copy(this),n),e.r=Xt.r,e.g=Xt.g,e.b=Xt.b,e}getStyle(e=xn){lt.workingToColorSpace(Xt.copy(this),e);const n=Xt.r,i=Xt.g,s=Xt.b;return e!==xn?`color(${e} ${n.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(n*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,n,i){return this.getHSL(bi),this.setHSL(bi.h+e,bi.s+n,bi.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,n){return this.r=e.r+n.r,this.g=e.g+n.g,this.b=e.b+n.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,n){return this.r+=(e.r-this.r)*n,this.g+=(e.g-this.g)*n,this.b+=(e.b-this.b)*n,this}lerpColors(e,n,i){return this.r=e.r+(n.r-e.r)*i,this.g=e.g+(n.g-e.g)*i,this.b=e.b+(n.b-e.b)*i,this}lerpHSL(e,n){this.getHSL(bi),e.getHSL(kr);const i=lo(bi.h,kr.h,n),s=lo(bi.s,kr.s,n),r=lo(bi.l,kr.l,n);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const n=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*n+r[3]*i+r[6]*s,this.g=r[1]*n+r[4]*i+r[7]*s,this.b=r[2]*n+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,n=0){return this.r=e[n],this.g=e[n+1],this.b=e[n+2],this}toArray(e=[],n=0){return e[n]=this.r,e[n+1]=this.g,e[n+2]=this.b,e}fromBufferAttribute(e,n){return this.r=e.getX(n),this.g=e.getY(n),this.b=e.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Xt=new ut;ut.NAMES=Zf;class K_ extends tn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ui,this.environmentIntensity=1,this.environmentRotation=new Ui,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,n){return super.copy(e,n),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const n=super.toJSON(e);return this.fog!==null&&(n.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(n.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(n.object.backgroundIntensity=this.backgroundIntensity),n.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(n.object.environmentIntensity=this.environmentIntensity),n.object.environmentRotation=this.environmentRotation.toArray(),n}}const Tn=new H,Zn=new H,_o=new H,Qn=new H,ms=new H,gs=new H,Bu=new H,vo=new H,yo=new H,xo=new H,So=new Ct,bo=new Ct,Mo=new Ct;class wn{constructor(e=new H,n=new H,i=new H){this.a=e,this.b=n,this.c=i}static getNormal(e,n,i,s){s.subVectors(i,n),Tn.subVectors(e,n),s.cross(Tn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,n,i,s,r){Tn.subVectors(s,n),Zn.subVectors(i,n),_o.subVectors(e,n);const a=Tn.dot(Tn),l=Tn.dot(Zn),u=Tn.dot(_o),d=Zn.dot(Zn),f=Zn.dot(_o),m=a*d-l*l;if(m===0)return r.set(0,0,0),null;const p=1/m,o=(d*u-l*f)*p,h=(a*f-l*u)*p;return r.set(1-o-h,h,o)}static containsPoint(e,n,i,s){return this.getBarycoord(e,n,i,s,Qn)===null?!1:Qn.x>=0&&Qn.y>=0&&Qn.x+Qn.y<=1}static getInterpolation(e,n,i,s,r,a,l,u){return this.getBarycoord(e,n,i,s,Qn)===null?(u.x=0,u.y=0,"z"in u&&(u.z=0),"w"in u&&(u.w=0),null):(u.setScalar(0),u.addScaledVector(r,Qn.x),u.addScaledVector(a,Qn.y),u.addScaledVector(l,Qn.z),u)}static getInterpolatedAttribute(e,n,i,s,r,a){return So.setScalar(0),bo.setScalar(0),Mo.setScalar(0),So.fromBufferAttribute(e,n),bo.fromBufferAttribute(e,i),Mo.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(So,r.x),a.addScaledVector(bo,r.y),a.addScaledVector(Mo,r.z),a}static isFrontFacing(e,n,i,s){return Tn.subVectors(i,n),Zn.subVectors(e,n),Tn.cross(Zn).dot(s)<0}set(e,n,i){return this.a.copy(e),this.b.copy(n),this.c.copy(i),this}setFromPointsAndIndices(e,n,i,s){return this.a.copy(e[n]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,n,i,s){return this.a.fromBufferAttribute(e,n),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Tn.subVectors(this.c,this.b),Zn.subVectors(this.a,this.b),Tn.cross(Zn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return wn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,n){return wn.getBarycoord(e,this.a,this.b,this.c,n)}getInterpolation(e,n,i,s,r){return wn.getInterpolation(e,this.a,this.b,this.c,n,i,s,r)}containsPoint(e){return wn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return wn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,n){const i=this.a,s=this.b,r=this.c;let a,l;ms.subVectors(s,i),gs.subVectors(r,i),vo.subVectors(e,i);const u=ms.dot(vo),d=gs.dot(vo);if(u<=0&&d<=0)return n.copy(i);yo.subVectors(e,s);const f=ms.dot(yo),m=gs.dot(yo);if(f>=0&&m<=f)return n.copy(s);const p=u*m-f*d;if(p<=0&&u>=0&&f<=0)return a=u/(u-f),n.copy(i).addScaledVector(ms,a);xo.subVectors(e,r);const o=ms.dot(xo),h=gs.dot(xo);if(h>=0&&o<=h)return n.copy(r);const y=o*d-u*h;if(y<=0&&d>=0&&h<=0)return l=d/(d-h),n.copy(i).addScaledVector(gs,l);const _=f*h-o*m;if(_<=0&&m-f>=0&&o-h>=0)return Bu.subVectors(r,s),l=(m-f)/(m-f+(o-h)),n.copy(s).addScaledVector(Bu,l);const g=1/(_+y+p);return a=y*g,l=p*g,n.copy(i).addScaledVector(ms,a).addScaledVector(gs,l)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class Ar{constructor(e=new H(1/0,1/0,1/0),n=new H(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=n}set(e,n){return this.min.copy(e),this.max.copy(n),this}setFromArray(e){this.makeEmpty();for(let n=0,i=e.length;n<i;n+=3)this.expandByPoint(En.fromArray(e,n));return this}setFromBufferAttribute(e){this.makeEmpty();for(let n=0,i=e.count;n<i;n++)this.expandByPoint(En.fromBufferAttribute(e,n));return this}setFromPoints(e){this.makeEmpty();for(let n=0,i=e.length;n<i;n++)this.expandByPoint(e[n]);return this}setFromCenterAndSize(e,n){const i=En.copy(n).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,n=!1){return this.makeEmpty(),this.expandByObject(e,n)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,n=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const r=i.getAttribute("position");if(n===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,l=r.count;a<l;a++)e.isMesh===!0?e.getVertexPosition(a,En):En.fromBufferAttribute(r,a),En.applyMatrix4(e.matrixWorld),this.expandByPoint(En);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Or.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Or.copy(i.boundingBox)),Or.applyMatrix4(e.matrixWorld),this.union(Or)}const s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],n);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,n){return n.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,En),En.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let n,i;return e.normal.x>0?(n=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(n=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(n+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(n+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(n+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(n+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),n<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Js),Br.subVectors(this.max,Js),_s.subVectors(e.a,Js),vs.subVectors(e.b,Js),ys.subVectors(e.c,Js),Mi.subVectors(vs,_s),Ti.subVectors(ys,vs),zi.subVectors(_s,ys);let n=[0,-Mi.z,Mi.y,0,-Ti.z,Ti.y,0,-zi.z,zi.y,Mi.z,0,-Mi.x,Ti.z,0,-Ti.x,zi.z,0,-zi.x,-Mi.y,Mi.x,0,-Ti.y,Ti.x,0,-zi.y,zi.x,0];return!To(n,_s,vs,ys,Br)||(n=[1,0,0,0,1,0,0,0,1],!To(n,_s,vs,ys,Br))?!1:(Vr.crossVectors(Mi,Ti),n=[Vr.x,Vr.y,Vr.z],To(n,_s,vs,ys,Br))}clampPoint(e,n){return n.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,En).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(En).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:($n[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),$n[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),$n[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),$n[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),$n[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),$n[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),$n[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),$n[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints($n),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const $n=[new H,new H,new H,new H,new H,new H,new H,new H],En=new H,Or=new Ar,_s=new H,vs=new H,ys=new H,Mi=new H,Ti=new H,zi=new H,Js=new H,Br=new H,Vr=new H,Gi=new H;function To(t,e,n,i,s){for(let r=0,a=t.length-3;r<=a;r+=3){Gi.fromArray(t,r);const l=s.x*Math.abs(Gi.x)+s.y*Math.abs(Gi.y)+s.z*Math.abs(Gi.z),u=e.dot(Gi),d=n.dot(Gi),f=i.dot(Gi);if(Math.max(-Math.max(u,d,f),Math.min(u,d,f))>l)return!1}return!0}const Nt=new H,zr=new dt;let J_=0;class Rn extends as{constructor(e,n,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:J_++}),this.name="",this.array=e,this.itemSize=n,this.count=e!==void 0?e.length/n:0,this.normalized=i,this.usage=Eu,this.updateRanges=[],this.gpuType=Vn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,n,i){e*=this.itemSize,i*=n.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=n.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let n=0,i=this.count;n<i;n++)zr.fromBufferAttribute(this,n),zr.applyMatrix3(e),this.setXY(n,zr.x,zr.y);else if(this.itemSize===3)for(let n=0,i=this.count;n<i;n++)Nt.fromBufferAttribute(this,n),Nt.applyMatrix3(e),this.setXYZ(n,Nt.x,Nt.y,Nt.z);return this}applyMatrix4(e){for(let n=0,i=this.count;n<i;n++)Nt.fromBufferAttribute(this,n),Nt.applyMatrix4(e),this.setXYZ(n,Nt.x,Nt.y,Nt.z);return this}applyNormalMatrix(e){for(let n=0,i=this.count;n<i;n++)Nt.fromBufferAttribute(this,n),Nt.applyNormalMatrix(e),this.setXYZ(n,Nt.x,Nt.y,Nt.z);return this}transformDirection(e){for(let n=0,i=this.count;n<i;n++)Nt.fromBufferAttribute(this,n),Nt.transformDirection(e),this.setXYZ(n,Nt.x,Nt.y,Nt.z);return this}set(e,n=0){return this.array.set(e,n),this}getComponent(e,n){let i=this.array[e*this.itemSize+n];return this.normalized&&(i=Ys(i,this.array)),i}setComponent(e,n,i){return this.normalized&&(i=sn(i,this.array)),this.array[e*this.itemSize+n]=i,this}getX(e){let n=this.array[e*this.itemSize];return this.normalized&&(n=Ys(n,this.array)),n}setX(e,n){return this.normalized&&(n=sn(n,this.array)),this.array[e*this.itemSize]=n,this}getY(e){let n=this.array[e*this.itemSize+1];return this.normalized&&(n=Ys(n,this.array)),n}setY(e,n){return this.normalized&&(n=sn(n,this.array)),this.array[e*this.itemSize+1]=n,this}getZ(e){let n=this.array[e*this.itemSize+2];return this.normalized&&(n=Ys(n,this.array)),n}setZ(e,n){return this.normalized&&(n=sn(n,this.array)),this.array[e*this.itemSize+2]=n,this}getW(e){let n=this.array[e*this.itemSize+3];return this.normalized&&(n=Ys(n,this.array)),n}setW(e,n){return this.normalized&&(n=sn(n,this.array)),this.array[e*this.itemSize+3]=n,this}setXY(e,n,i){return e*=this.itemSize,this.normalized&&(n=sn(n,this.array),i=sn(i,this.array)),this.array[e+0]=n,this.array[e+1]=i,this}setXYZ(e,n,i,s){return e*=this.itemSize,this.normalized&&(n=sn(n,this.array),i=sn(i,this.array),s=sn(s,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,n,i,s,r){return e*=this.itemSize,this.normalized&&(n=sn(n,this.array),i=sn(i,this.array),s=sn(s,this.array),r=sn(r,this.array)),this.array[e+0]=n,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Eu&&(e.usage=this.usage),e}dispose(){this.dispatchEvent({type:"dispose"})}}class Qf extends Rn{constructor(e,n,i){super(new Uint16Array(e),n,i)}}class $f extends Rn{constructor(e,n,i){super(new Uint32Array(e),n,i)}}class Vt extends Rn{constructor(e,n,i){super(new Float32Array(e),n,i)}}const Z_=new Ar,Zs=new H,Eo=new H;class za{constructor(e=new H,n=-1){this.isSphere=!0,this.center=e,this.radius=n}set(e,n){return this.center.copy(e),this.radius=n,this}setFromPoints(e,n){const i=this.center;n!==void 0?i.copy(n):Z_.setFromPoints(e).getCenter(i);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const n=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=n*n}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,n){const i=this.center.distanceToSquared(e);return n.copy(e),i>this.radius*this.radius&&(n.sub(this.center).normalize(),n.multiplyScalar(this.radius).add(this.center)),n}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Zs.subVectors(e,this.center);const n=Zs.lengthSq();if(n>this.radius*this.radius){const i=Math.sqrt(n),s=(i-this.radius)*.5;this.center.addScaledVector(Zs,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Eo.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Zs.copy(e.center).add(Eo)),this.expandByPoint(Zs.copy(e.center).sub(Eo))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let Q_=0;const yn=new Rt,wo=new tn,xs=new H,dn=new Ar,Qs=new Ar,Ot=new H;class on extends as{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Q_++}),this.uuid=wr(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(I_(e)?$f:Qf)(e,1):this.index=e,this}setIndirect(e,n=0){return this.indirect=e,this.indirectOffset=n,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,n){return this.attributes[e]=n,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,n,i=0){this.groups.push({start:e,count:n,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,n){this.drawRange.start=e,this.drawRange.count=n}applyMatrix4(e){const n=this.attributes.position;n!==void 0&&(n.applyMatrix4(e),n.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const r=new et().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return yn.makeRotationFromQuaternion(e),this.applyMatrix4(yn),this}rotateX(e){return yn.makeRotationX(e),this.applyMatrix4(yn),this}rotateY(e){return yn.makeRotationY(e),this.applyMatrix4(yn),this}rotateZ(e){return yn.makeRotationZ(e),this.applyMatrix4(yn),this}translate(e,n,i){return yn.makeTranslation(e,n,i),this.applyMatrix4(yn),this}scale(e,n,i){return yn.makeScale(e,n,i),this.applyMatrix4(yn),this}lookAt(e){return wo.lookAt(e),wo.updateMatrix(),this.applyMatrix4(wo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(xs).negate(),this.translate(xs.x,xs.y,xs.z),this}setFromPoints(e){const n=this.getAttribute("position");if(n===void 0){const i=[];for(let s=0,r=e.length;s<r;s++){const a=e[s];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Vt(i,3))}else{const i=Math.min(e.length,n.count);for(let s=0;s<i;s++){const r=e[s];n.setXYZ(s,r.x,r.y,r.z||0)}e.length>n.count&&Je("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),n.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ar);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ht("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new H(-1/0,-1/0,-1/0),new H(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),n)for(let i=0,s=n.length;i<s;i++){const r=n[i];dn.setFromBufferAttribute(r),this.morphTargetsRelative?(Ot.addVectors(this.boundingBox.min,dn.min),this.boundingBox.expandByPoint(Ot),Ot.addVectors(this.boundingBox.max,dn.max),this.boundingBox.expandByPoint(Ot)):(this.boundingBox.expandByPoint(dn.min),this.boundingBox.expandByPoint(dn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&ht('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new za);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ht("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new H,1/0);return}if(e){const i=this.boundingSphere.center;if(dn.setFromBufferAttribute(e),n)for(let r=0,a=n.length;r<a;r++){const l=n[r];Qs.setFromBufferAttribute(l),this.morphTargetsRelative?(Ot.addVectors(dn.min,Qs.min),dn.expandByPoint(Ot),Ot.addVectors(dn.max,Qs.max),dn.expandByPoint(Ot)):(dn.expandByPoint(Qs.min),dn.expandByPoint(Qs.max))}dn.getCenter(i);let s=0;for(let r=0,a=e.count;r<a;r++)Ot.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(Ot));if(n)for(let r=0,a=n.length;r<a;r++){const l=n[r],u=this.morphTargetsRelative;for(let d=0,f=l.count;d<f;d++)Ot.fromBufferAttribute(l,d),u&&(xs.fromBufferAttribute(e,d),Ot.add(xs)),s=Math.max(s,i.distanceToSquared(Ot))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&ht('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,n=this.attributes;if(e===null||n.position===void 0||n.normal===void 0||n.uv===void 0){ht("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=n.position,s=n.normal,r=n.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Rn(new Float32Array(4*i.count),4));const a=this.getAttribute("tangent"),l=[],u=[];for(let x=0;x<i.count;x++)l[x]=new H,u[x]=new H;const d=new H,f=new H,m=new H,p=new dt,o=new dt,h=new dt,y=new H,_=new H;function g(x,R,O){d.fromBufferAttribute(i,x),f.fromBufferAttribute(i,R),m.fromBufferAttribute(i,O),p.fromBufferAttribute(r,x),o.fromBufferAttribute(r,R),h.fromBufferAttribute(r,O),f.sub(d),m.sub(d),o.sub(p),h.sub(p);const U=1/(o.x*h.y-h.x*o.y);isFinite(U)&&(y.copy(f).multiplyScalar(h.y).addScaledVector(m,-o.y).multiplyScalar(U),_.copy(m).multiplyScalar(o.x).addScaledVector(f,-h.x).multiplyScalar(U),l[x].add(y),l[R].add(y),l[O].add(y),u[x].add(_),u[R].add(_),u[O].add(_))}let S=this.groups;S.length===0&&(S=[{start:0,count:e.count}]);for(let x=0,R=S.length;x<R;++x){const O=S[x],U=O.start,W=O.count;for(let ee=U,le=U+W;ee<le;ee+=3)g(e.getX(ee+0),e.getX(ee+1),e.getX(ee+2))}const E=new H,b=new H,L=new H,w=new H;function D(x){L.fromBufferAttribute(s,x),w.copy(L);const R=l[x];E.copy(R),E.sub(L.multiplyScalar(L.dot(R))).normalize(),b.crossVectors(w,R);const U=b.dot(u[x])<0?-1:1;a.setXYZW(x,E.x,E.y,E.z,U)}for(let x=0,R=S.length;x<R;++x){const O=S[x],U=O.start,W=O.count;for(let ee=U,le=U+W;ee<le;ee+=3)D(e.getX(ee+0)),D(e.getX(ee+1)),D(e.getX(ee+2))}}computeVertexNormals(){const e=this.index,n=this.getAttribute("position");if(n!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Rn(new Float32Array(n.count*3),3),this.setAttribute("normal",i);else for(let p=0,o=i.count;p<o;p++)i.setXYZ(p,0,0,0);const s=new H,r=new H,a=new H,l=new H,u=new H,d=new H,f=new H,m=new H;if(e)for(let p=0,o=e.count;p<o;p+=3){const h=e.getX(p+0),y=e.getX(p+1),_=e.getX(p+2);s.fromBufferAttribute(n,h),r.fromBufferAttribute(n,y),a.fromBufferAttribute(n,_),f.subVectors(a,r),m.subVectors(s,r),f.cross(m),l.fromBufferAttribute(i,h),u.fromBufferAttribute(i,y),d.fromBufferAttribute(i,_),l.add(f),u.add(f),d.add(f),i.setXYZ(h,l.x,l.y,l.z),i.setXYZ(y,u.x,u.y,u.z),i.setXYZ(_,d.x,d.y,d.z)}else for(let p=0,o=n.count;p<o;p+=3)s.fromBufferAttribute(n,p+0),r.fromBufferAttribute(n,p+1),a.fromBufferAttribute(n,p+2),f.subVectors(a,r),m.subVectors(s,r),f.cross(m),i.setXYZ(p+0,f.x,f.y,f.z),i.setXYZ(p+1,f.x,f.y,f.z),i.setXYZ(p+2,f.x,f.y,f.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let n=0,i=e.count;n<i;n++)Ot.fromBufferAttribute(e,n),Ot.normalize(),e.setXYZ(n,Ot.x,Ot.y,Ot.z)}toNonIndexed(){function e(l,u){const d=l.array,f=l.itemSize,m=l.normalized,p=new d.constructor(u.length*f);let o=0,h=0;for(let y=0,_=u.length;y<_;y++){l.isInterleavedBufferAttribute?o=u[y]*l.data.stride+l.offset:o=u[y]*f;for(let g=0;g<f;g++)p[h++]=d[o++]}return new Rn(p,f,m)}if(this.index===null)return Je("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const n=new on,i=this.index.array,s=this.attributes;for(const l in s){const u=s[l],d=e(u,i);n.setAttribute(l,d)}const r=this.morphAttributes;for(const l in r){const u=[],d=r[l];for(let f=0,m=d.length;f<m;f++){const p=d[f],o=e(p,i);u.push(o)}n.morphAttributes[l]=u}n.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let l=0,u=a.length;l<u;l++){const d=a[l];n.addGroup(d.start,d.count,d.materialIndex)}return n}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const u=this.parameters;for(const d in u)u[d]!==void 0&&(e[d]=u[d]);return e}e.data={attributes:{}};const n=this.index;n!==null&&(e.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});const i=this.attributes;for(const u in i){const d=i[u];e.data.attributes[u]=d.toJSON(e.data)}const s={};let r=!1;for(const u in this.morphAttributes){const d=this.morphAttributes[u],f=[];for(let m=0,p=d.length;m<p;m++){const o=d[m];f.push(o.toJSON(e.data))}f.length>0&&(s[u]=f,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const l=this.boundingSphere;return l!==null&&(e.data.boundingSphere=l.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const n={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone());const s=e.attributes;for(const d in s){const f=s[d];this.setAttribute(d,f.clone(n))}const r=e.morphAttributes;for(const d in r){const f=[],m=r[d];for(let p=0,o=m.length;p<o;p++)f.push(m[p].clone(n));this.morphAttributes[d]=f}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let d=0,f=a.length;d<f;d++){const m=a[d];this.addGroup(m.start,m.count,m.materialIndex)}const l=e.boundingBox;l!==null&&(this.boundingBox=l.clone());const u=e.boundingSphere;return u!==null&&(this.boundingSphere=u.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}let $_=0;class Gs extends as{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:$_++}),this.uuid=wr(),this.name="",this.type="Material",this.blending=Rs,this.side=Ni,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Zo,this.blendDst=Qo,this.blendEquation=Ki,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ut(0,0,0),this.blendAlpha=0,this.depthFunc=Us,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Tu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=us,this.stencilZFail=us,this.stencilZPass=us,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const n in e){const i=e[n];if(i===void 0){Je(`Material: parameter '${n}' has value of undefined.`);continue}const s=this[n];if(s===void 0){Je(`Material: '${n}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[n]=i}}toJSON(e){const n=e===void 0||typeof e=="string";n&&(e={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Rs&&(i.blending=this.blending),this.side!==Ni&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Zo&&(i.blendSrc=this.blendSrc),this.blendDst!==Qo&&(i.blendDst=this.blendDst),this.blendEquation!==Ki&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==Us&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Tu&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==us&&(i.stencilFail=this.stencilFail),this.stencilZFail!==us&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==us&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.allowOverride===!1&&(i.allowOverride=!1),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){const a=[];for(const l in r){const u=r[l];delete u.metadata,a.push(u)}return a}if(n){const r=s(e.textures),a=s(e.images);r.length>0&&(i.textures=r),a.length>0&&(i.images=a)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const n=e.clippingPlanes;let i=null;if(n!==null){const s=n.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=n[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}const ei=new H,Ao=new H,Gr=new H,Ei=new H,Po=new H,Hr=new H,Co=new H;class eh{constructor(e=new H,n=new H(0,0,-1)){this.origin=e,this.direction=n}set(e,n){return this.origin.copy(e),this.direction.copy(n),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,n){return n.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,ei)),this}closestPointToPoint(e,n){n.subVectors(e,this.origin);const i=n.dot(this.direction);return i<0?n.copy(this.origin):n.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const n=ei.subVectors(e,this.origin).dot(this.direction);return n<0?this.origin.distanceToSquared(e):(ei.copy(this.origin).addScaledVector(this.direction,n),ei.distanceToSquared(e))}distanceSqToSegment(e,n,i,s){Ao.copy(e).add(n).multiplyScalar(.5),Gr.copy(n).sub(e).normalize(),Ei.copy(this.origin).sub(Ao);const r=e.distanceTo(n)*.5,a=-this.direction.dot(Gr),l=Ei.dot(this.direction),u=-Ei.dot(Gr),d=Ei.lengthSq(),f=Math.abs(1-a*a);let m,p,o,h;if(f>0)if(m=a*u-l,p=a*l-u,h=r*f,m>=0)if(p>=-h)if(p<=h){const y=1/f;m*=y,p*=y,o=m*(m+a*p+2*l)+p*(a*m+p+2*u)+d}else p=r,m=Math.max(0,-(a*p+l)),o=-m*m+p*(p+2*u)+d;else p=-r,m=Math.max(0,-(a*p+l)),o=-m*m+p*(p+2*u)+d;else p<=-h?(m=Math.max(0,-(-a*r+l)),p=m>0?-r:Math.min(Math.max(-r,-u),r),o=-m*m+p*(p+2*u)+d):p<=h?(m=0,p=Math.min(Math.max(-r,-u),r),o=p*(p+2*u)+d):(m=Math.max(0,-(a*r+l)),p=m>0?r:Math.min(Math.max(-r,-u),r),o=-m*m+p*(p+2*u)+d);else p=a>0?-r:r,m=Math.max(0,-(a*p+l)),o=-m*m+p*(p+2*u)+d;return i&&i.copy(this.origin).addScaledVector(this.direction,m),s&&s.copy(Ao).addScaledVector(Gr,p),o}intersectSphere(e,n){ei.subVectors(e.center,this.origin);const i=ei.dot(this.direction),s=ei.dot(ei)-i*i,r=e.radius*e.radius;if(s>r)return null;const a=Math.sqrt(r-s),l=i-a,u=i+a;return u<0?null:l<0?this.at(u,n):this.at(l,n)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const n=e.normal.dot(this.direction);if(n===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/n;return i>=0?i:null}intersectPlane(e,n){const i=this.distanceToPlane(e);return i===null?null:this.at(i,n)}intersectsPlane(e){const n=e.distanceToPoint(this.origin);return n===0||e.normal.dot(this.direction)*n<0}intersectBox(e,n){let i,s,r,a,l,u;const d=1/this.direction.x,f=1/this.direction.y,m=1/this.direction.z,p=this.origin;return d>=0?(i=(e.min.x-p.x)*d,s=(e.max.x-p.x)*d):(i=(e.max.x-p.x)*d,s=(e.min.x-p.x)*d),f>=0?(r=(e.min.y-p.y)*f,a=(e.max.y-p.y)*f):(r=(e.max.y-p.y)*f,a=(e.min.y-p.y)*f),i>a||r>s||((r>i||isNaN(i))&&(i=r),(a<s||isNaN(s))&&(s=a),m>=0?(l=(e.min.z-p.z)*m,u=(e.max.z-p.z)*m):(l=(e.max.z-p.z)*m,u=(e.min.z-p.z)*m),i>u||l>s)||((l>i||i!==i)&&(i=l),(u<s||s!==s)&&(s=u),s<0)?null:this.at(i>=0?i:s,n)}intersectsBox(e){return this.intersectBox(e,ei)!==null}intersectTriangle(e,n,i,s,r){Po.subVectors(n,e),Hr.subVectors(i,e),Co.crossVectors(Po,Hr);let a=this.direction.dot(Co),l;if(a>0){if(s)return null;l=1}else if(a<0)l=-1,a=-a;else return null;Ei.subVectors(this.origin,e);const u=l*this.direction.dot(Hr.crossVectors(Ei,Hr));if(u<0)return null;const d=l*this.direction.dot(Po.cross(Ei));if(d<0||u+d>a)return null;const f=-l*Ei.dot(Co);return f<0?null:this.at(f/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class hr extends Gs{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ut(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ui,this.combine=cc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const Vu=new Rt,Hi=new eh,Wr=new za,zu=new H,qr=new H,Xr=new H,jr=new H,Ro=new H,Yr=new H,Gu=new H,Kr=new H;class _n extends tn{constructor(e=new on,n=new hr){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=n,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){const s=n[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const l=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[l]=r}}}}getVertexPosition(e,n){const i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;n.fromBufferAttribute(s,e);const l=this.morphTargetInfluences;if(r&&l){Yr.set(0,0,0);for(let u=0,d=r.length;u<d;u++){const f=l[u],m=r[u];f!==0&&(Ro.fromBufferAttribute(m,e),a?Yr.addScaledVector(Ro,f):Yr.addScaledVector(Ro.sub(n),f))}n.add(Yr)}return n}raycast(e,n){const i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Wr.copy(i.boundingSphere),Wr.applyMatrix4(r),Hi.copy(e.ray).recast(e.near),!(Wr.containsPoint(Hi.origin)===!1&&(Hi.intersectSphere(Wr,zu)===null||Hi.origin.distanceToSquared(zu)>(e.far-e.near)**2))&&(Vu.copy(r).invert(),Hi.copy(e.ray).applyMatrix4(Vu),!(i.boundingBox!==null&&Hi.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,n,Hi)))}_computeIntersections(e,n,i){let s;const r=this.geometry,a=this.material,l=r.index,u=r.attributes.position,d=r.attributes.uv,f=r.attributes.uv1,m=r.attributes.normal,p=r.groups,o=r.drawRange;if(l!==null)if(Array.isArray(a))for(let h=0,y=p.length;h<y;h++){const _=p[h],g=a[_.materialIndex],S=Math.max(_.start,o.start),E=Math.min(l.count,Math.min(_.start+_.count,o.start+o.count));for(let b=S,L=E;b<L;b+=3){const w=l.getX(b),D=l.getX(b+1),x=l.getX(b+2);s=Jr(this,g,e,i,d,f,m,w,D,x),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=_.materialIndex,n.push(s))}}else{const h=Math.max(0,o.start),y=Math.min(l.count,o.start+o.count);for(let _=h,g=y;_<g;_+=3){const S=l.getX(_),E=l.getX(_+1),b=l.getX(_+2);s=Jr(this,a,e,i,d,f,m,S,E,b),s&&(s.faceIndex=Math.floor(_/3),n.push(s))}}else if(u!==void 0)if(Array.isArray(a))for(let h=0,y=p.length;h<y;h++){const _=p[h],g=a[_.materialIndex],S=Math.max(_.start,o.start),E=Math.min(u.count,Math.min(_.start+_.count,o.start+o.count));for(let b=S,L=E;b<L;b+=3){const w=b,D=b+1,x=b+2;s=Jr(this,g,e,i,d,f,m,w,D,x),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=_.materialIndex,n.push(s))}}else{const h=Math.max(0,o.start),y=Math.min(u.count,o.start+o.count);for(let _=h,g=y;_<g;_+=3){const S=_,E=_+1,b=_+2;s=Jr(this,a,e,i,d,f,m,S,E,b),s&&(s.faceIndex=Math.floor(_/3),n.push(s))}}}}function e0(t,e,n,i,s,r,a,l){let u;if(e.side===an?u=i.intersectTriangle(a,r,s,!0,l):u=i.intersectTriangle(s,r,a,e.side===Ni,l),u===null)return null;Kr.copy(l),Kr.applyMatrix4(t.matrixWorld);const d=n.ray.origin.distanceTo(Kr);return d<n.near||d>n.far?null:{distance:d,point:Kr.clone(),object:t}}function Jr(t,e,n,i,s,r,a,l,u,d){t.getVertexPosition(l,qr),t.getVertexPosition(u,Xr),t.getVertexPosition(d,jr);const f=e0(t,e,n,i,qr,Xr,jr,Gu);if(f){const m=new H;wn.getBarycoord(Gu,qr,Xr,jr,m),s&&(f.uv=wn.getInterpolatedAttribute(s,l,u,d,m,new dt)),r&&(f.uv1=wn.getInterpolatedAttribute(r,l,u,d,m,new dt)),a&&(f.normal=wn.getInterpolatedAttribute(a,l,u,d,m,new H),f.normal.dot(i.direction)>0&&f.normal.multiplyScalar(-1));const p={a:l,b:u,c:d,normal:new H,materialIndex:0};wn.getNormal(qr,Xr,jr,p.normal),f.face=p,f.barycoord=m}return f}class t0 extends en{constructor(e=null,n=1,i=1,s,r,a,l,u,d=Gt,f=Gt,m,p){super(null,a,l,u,d,f,s,r,m,p),this.isDataTexture=!0,this.image={data:e,width:n,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Io=new H,n0=new H,i0=new et;class Yi{constructor(e=new H(1,0,0),n=0){this.isPlane=!0,this.normal=e,this.constant=n}set(e,n){return this.normal.copy(e),this.constant=n,this}setComponents(e,n,i,s){return this.normal.set(e,n,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,n){return this.normal.copy(e),this.constant=-n.dot(this.normal),this}setFromCoplanarPoints(e,n,i){const s=Io.subVectors(i,n).cross(n0.subVectors(e,n)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,n){return n.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,n,i=!0){const s=e.delta(Io),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?n.copy(e.start):null;const a=-(e.start.dot(this.normal)+this.constant)/r;return i===!0&&(a<0||a>1)?null:n.copy(e.start).addScaledVector(s,a)}intersectsLine(e){const n=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return n<0&&i>0||i<0&&n>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,n){const i=n||i0.getNormalMatrix(e),s=this.coplanarPoint(Io).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Wi=new za,s0=new dt(.5,.5),Zr=new H;class yc{constructor(e=new Yi,n=new Yi,i=new Yi,s=new Yi,r=new Yi,a=new Yi){this.planes=[e,n,i,s,r,a]}set(e,n,i,s,r,a){const l=this.planes;return l[0].copy(e),l[1].copy(n),l[2].copy(i),l[3].copy(s),l[4].copy(r),l[5].copy(a),this}copy(e){const n=this.planes;for(let i=0;i<6;i++)n[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,n=zn,i=!1){const s=this.planes,r=e.elements,a=r[0],l=r[1],u=r[2],d=r[3],f=r[4],m=r[5],p=r[6],o=r[7],h=r[8],y=r[9],_=r[10],g=r[11],S=r[12],E=r[13],b=r[14],L=r[15];if(s[0].setComponents(d-a,o-f,g-h,L-S).normalize(),s[1].setComponents(d+a,o+f,g+h,L+S).normalize(),s[2].setComponents(d+l,o+m,g+y,L+E).normalize(),s[3].setComponents(d-l,o-m,g-y,L-E).normalize(),i)s[4].setComponents(u,p,_,b).normalize(),s[5].setComponents(d-u,o-p,g-_,L-b).normalize();else if(s[4].setComponents(d-u,o-p,g-_,L-b).normalize(),n===zn)s[5].setComponents(d+u,o+p,g+_,L+b).normalize();else if(n===br)s[5].setComponents(u,p,_,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+n);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Wi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const n=e.geometry;n.boundingSphere===null&&n.computeBoundingSphere(),Wi.copy(n.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Wi)}intersectsSprite(e){Wi.center.set(0,0,0);const n=s0.distanceTo(e.center);return Wi.radius=.7071067811865476+n,Wi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Wi)}intersectsSphere(e){const n=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(n[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){const n=this.planes;for(let i=0;i<6;i++){const s=n[i];if(Zr.x=s.normal.x>0?e.max.x:e.min.x,Zr.y=s.normal.y>0?e.max.y:e.min.y,Zr.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Zr)<0)return!1}return!0}containsPoint(e){const n=this.planes;for(let i=0;i<6;i++)if(n[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class th extends Gs{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new ut(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Hu=new Rt,zl=new eh,Qr=new za,$r=new H;class r0 extends tn{constructor(e=new on,n=new th){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=n,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,n){const i=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Qr.copy(i.boundingSphere),Qr.applyMatrix4(s),Qr.radius+=r,e.ray.intersectsSphere(Qr)===!1)return;Hu.copy(s).invert(),zl.copy(e.ray).applyMatrix4(Hu);const l=r/((this.scale.x+this.scale.y+this.scale.z)/3),u=l*l,d=i.index,m=i.attributes.position;if(d!==null){const p=Math.max(0,a.start),o=Math.min(d.count,a.start+a.count);for(let h=p,y=o;h<y;h++){const _=d.getX(h);$r.fromBufferAttribute(m,_),Wu($r,_,u,s,e,n,this)}}else{const p=Math.max(0,a.start),o=Math.min(m.count,a.start+a.count);for(let h=p,y=o;h<y;h++)$r.fromBufferAttribute(m,h),Wu($r,h,u,s,e,n,this)}}updateMorphTargets(){const n=this.geometry.morphAttributes,i=Object.keys(n);if(i.length>0){const s=n[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const l=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[l]=r}}}}}function Wu(t,e,n,i,s,r,a){const l=zl.distanceSqToPoint(t);if(l<n){const u=new H;zl.closestPointToPoint(t,u),u.applyMatrix4(i);const d=s.ray.origin.distanceTo(u);if(d<s.near||d>s.far)return;r.push({distance:d,distanceToRay:Math.sqrt(l),point:u,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class nh extends en{constructor(e=[],n=is,i,s,r,a,l,u,d,f){super(e,n,i,s,r,a,l,u,d,f),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class ks extends en{constructor(e,n,i=Xn,s,r,a,l=Gt,u=Gt,d,f=pi,m=1){if(f!==pi&&f!==Qi)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const p={width:e,height:n,depth:m};super(p,s,r,a,l,u,f,i,d),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new vc(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const n=super.toJSON(e);return this.compareFunction!==null&&(n.compareFunction=this.compareFunction),n}}class a0 extends ks{constructor(e,n=Xn,i=is,s,r,a=Gt,l=Gt,u,d=pi){const f={width:e,height:e,depth:1},m=[f,f,f,f,f,f];super(e,e,n,i,s,r,a,l,u,d),this.image=m,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class ih extends en{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Pr extends on{constructor(e=1,n=1,i=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:n,depth:i,widthSegments:s,heightSegments:r,depthSegments:a};const l=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const u=[],d=[],f=[],m=[];let p=0,o=0;h("z","y","x",-1,-1,i,n,e,a,r,0),h("z","y","x",1,-1,i,n,-e,a,r,1),h("x","z","y",1,1,e,i,n,s,a,2),h("x","z","y",1,-1,e,i,-n,s,a,3),h("x","y","z",1,-1,e,n,i,s,r,4),h("x","y","z",-1,-1,e,n,-i,s,r,5),this.setIndex(u),this.setAttribute("position",new Vt(d,3)),this.setAttribute("normal",new Vt(f,3)),this.setAttribute("uv",new Vt(m,2));function h(y,_,g,S,E,b,L,w,D,x,R){const O=b/D,U=L/x,W=b/2,ee=L/2,le=w/2,V=D+1,q=x+1;let z=0,te=0;const de=new H;for(let Ee=0;Ee<q;Ee++){const De=Ee*U-ee;for(let Fe=0;Fe<V;Fe++){const ot=Fe*O-W;de[y]=ot*S,de[_]=De*E,de[g]=le,d.push(de.x,de.y,de.z),de[y]=0,de[_]=0,de[g]=w>0?1:-1,f.push(de.x,de.y,de.z),m.push(Fe/D),m.push(1-Ee/x),z+=1}}for(let Ee=0;Ee<x;Ee++)for(let De=0;De<D;De++){const Fe=p+De+V*Ee,ot=p+De+V*(Ee+1),mt=p+(De+1)+V*(Ee+1),$e=p+(De+1)+V*Ee;u.push(Fe,ot,$e),u.push(ot,mt,$e),te+=6}l.addGroup(o,te,R),o+=te,p+=z}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Pr(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class xc extends on{constructor(e=[],n=[],i=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:n,radius:i,detail:s};const r=[],a=[];l(s),d(i),f(),this.setAttribute("position",new Vt(r,3)),this.setAttribute("normal",new Vt(r.slice(),3)),this.setAttribute("uv",new Vt(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function l(S){const E=new H,b=new H,L=new H;for(let w=0;w<n.length;w+=3)o(n[w+0],E),o(n[w+1],b),o(n[w+2],L),u(E,b,L,S)}function u(S,E,b,L){const w=L+1,D=[];for(let x=0;x<=w;x++){D[x]=[];const R=S.clone().lerp(b,x/w),O=E.clone().lerp(b,x/w),U=w-x;for(let W=0;W<=U;W++)W===0&&x===w?D[x][W]=R:D[x][W]=R.clone().lerp(O,W/U)}for(let x=0;x<w;x++)for(let R=0;R<2*(w-x)-1;R++){const O=Math.floor(R/2);R%2===0?(p(D[x][O+1]),p(D[x+1][O]),p(D[x][O])):(p(D[x][O+1]),p(D[x+1][O+1]),p(D[x+1][O]))}}function d(S){const E=new H;for(let b=0;b<r.length;b+=3)E.x=r[b+0],E.y=r[b+1],E.z=r[b+2],E.normalize().multiplyScalar(S),r[b+0]=E.x,r[b+1]=E.y,r[b+2]=E.z}function f(){const S=new H;for(let E=0;E<r.length;E+=3){S.x=r[E+0],S.y=r[E+1],S.z=r[E+2];const b=_(S)/2/Math.PI+.5,L=g(S)/Math.PI+.5;a.push(b,1-L)}h(),m()}function m(){for(let S=0;S<a.length;S+=6){const E=a[S+0],b=a[S+2],L=a[S+4],w=Math.max(E,b,L),D=Math.min(E,b,L);w>.9&&D<.1&&(E<.2&&(a[S+0]+=1),b<.2&&(a[S+2]+=1),L<.2&&(a[S+4]+=1))}}function p(S){r.push(S.x,S.y,S.z)}function o(S,E){const b=S*3;E.x=e[b+0],E.y=e[b+1],E.z=e[b+2]}function h(){const S=new H,E=new H,b=new H,L=new H,w=new dt,D=new dt,x=new dt;for(let R=0,O=0;R<r.length;R+=9,O+=6){S.set(r[R+0],r[R+1],r[R+2]),E.set(r[R+3],r[R+4],r[R+5]),b.set(r[R+6],r[R+7],r[R+8]),w.set(a[O+0],a[O+1]),D.set(a[O+2],a[O+3]),x.set(a[O+4],a[O+5]),L.copy(S).add(E).add(b).divideScalar(3);const U=_(L);y(w,O+0,S,U),y(D,O+2,E,U),y(x,O+4,b,U)}}function y(S,E,b,L){L<0&&S.x===1&&(a[E]=S.x-1),b.x===0&&b.z===0&&(a[E]=L/2/Math.PI+.5)}function _(S){return Math.atan2(S.z,-S.x)}function g(S){return Math.atan2(-S.y,Math.sqrt(S.x*S.x+S.z*S.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new xc(e.vertices,e.indices,e.radius,e.detail)}}class Sc extends xc{constructor(e=1,n=0){const i=(1+Math.sqrt(5))/2,s=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,n),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:n}}static fromJSON(e){return new Sc(e.radius,e.detail)}}class Ga extends on{constructor(e=1,n=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:n,widthSegments:i,heightSegments:s};const r=e/2,a=n/2,l=Math.floor(i),u=Math.floor(s),d=l+1,f=u+1,m=e/l,p=n/u,o=[],h=[],y=[],_=[];for(let g=0;g<f;g++){const S=g*p-a;for(let E=0;E<d;E++){const b=E*m-r;h.push(b,-S,0),y.push(0,0,1),_.push(E/l),_.push(1-g/u)}}for(let g=0;g<u;g++)for(let S=0;S<l;S++){const E=S+d*g,b=S+d*(g+1),L=S+1+d*(g+1),w=S+1+d*g;o.push(E,b,w),o.push(b,L,w)}this.setIndex(o),this.setAttribute("position",new Vt(h,3)),this.setAttribute("normal",new Vt(y,3)),this.setAttribute("uv",new Vt(_,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ga(e.width,e.height,e.widthSegments,e.heightSegments)}}class Aa extends on{constructor(e=1,n=32,i=16,s=0,r=Math.PI*2,a=0,l=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:n,heightSegments:i,phiStart:s,phiLength:r,thetaStart:a,thetaLength:l},n=Math.max(3,Math.floor(n)),i=Math.max(2,Math.floor(i));const u=Math.min(a+l,Math.PI);let d=0;const f=[],m=new H,p=new H,o=[],h=[],y=[],_=[];for(let g=0;g<=i;g++){const S=[],E=g/i;let b=0;g===0&&a===0?b=.5/n:g===i&&u===Math.PI&&(b=-.5/n);for(let L=0;L<=n;L++){const w=L/n;m.x=-e*Math.cos(s+w*r)*Math.sin(a+E*l),m.y=e*Math.cos(a+E*l),m.z=e*Math.sin(s+w*r)*Math.sin(a+E*l),h.push(m.x,m.y,m.z),p.copy(m).normalize(),y.push(p.x,p.y,p.z),_.push(w+b,1-E),S.push(d++)}f.push(S)}for(let g=0;g<i;g++)for(let S=0;S<n;S++){const E=f[g][S+1],b=f[g][S],L=f[g+1][S],w=f[g+1][S+1];(g!==0||a>0)&&o.push(E,b,w),(g!==i-1||u<Math.PI)&&o.push(b,L,w)}this.setIndex(o),this.setAttribute("position",new Vt(h,3)),this.setAttribute("normal",new Vt(y,3)),this.setAttribute("uv",new Vt(_,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Aa(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class bc extends on{constructor(e=1,n=.4,i=12,s=48,r=Math.PI*2,a=0,l=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:n,radialSegments:i,tubularSegments:s,arc:r,thetaStart:a,thetaLength:l},i=Math.floor(i),s=Math.floor(s);const u=[],d=[],f=[],m=[],p=new H,o=new H,h=new H;for(let y=0;y<=i;y++){const _=a+y/i*l;for(let g=0;g<=s;g++){const S=g/s*r;o.x=(e+n*Math.cos(_))*Math.cos(S),o.y=(e+n*Math.cos(_))*Math.sin(S),o.z=n*Math.sin(_),d.push(o.x,o.y,o.z),p.x=e*Math.cos(S),p.y=e*Math.sin(S),h.subVectors(o,p).normalize(),f.push(h.x,h.y,h.z),m.push(g/s),m.push(y/i)}}for(let y=1;y<=i;y++)for(let _=1;_<=s;_++){const g=(s+1)*y+_-1,S=(s+1)*(y-1)+_-1,E=(s+1)*(y-1)+_,b=(s+1)*y+_;u.push(g,S,b),u.push(S,E,b)}this.setIndex(u),this.setAttribute("position",new Vt(d,3)),this.setAttribute("normal",new Vt(f,3)),this.setAttribute("uv",new Vt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new bc(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}function Os(t){const e={};for(const n in t){e[n]={};for(const i in t[n]){const s=t[n][i];if(qu(s))s.isRenderTargetTexture?(Je("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[n][i]=null):e[n][i]=s.clone();else if(Array.isArray(s))if(qu(s[0])){const r=[];for(let a=0,l=s.length;a<l;a++)r[a]=s[a].clone();e[n][i]=r}else e[n][i]=s.slice();else e[n][i]=s}}return e}function Zt(t){const e={};for(let n=0;n<t.length;n++){const i=Os(t[n]);for(const s in i)e[s]=i[s]}return e}function qu(t){return t&&(t.isColor||t.isMatrix3||t.isMatrix4||t.isVector2||t.isVector3||t.isVector4||t.isTexture||t.isQuaternion)}function o0(t){const e=[];for(let n=0;n<t.length;n++)e.push(t[n].clone());return e}function sh(t){const e=t.getRenderTarget();return e===null?t.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:lt.workingColorSpace}const l0={clone:Os,merge:Zt};var c0=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,u0=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class jn extends Gs{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=c0,this.fragmentShader=u0,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Os(e.uniforms),this.uniformsGroups=o0(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const n=super.toJSON(e);n.glslVersion=this.glslVersion,n.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?n.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?n.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?n.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?n.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?n.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?n.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?n.uniforms[s]={type:"m4",value:a.toArray()}:n.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(n.defines=this.defines),n.vertexShader=this.vertexShader,n.fragmentShader=this.fragmentShader,n.lights=this.lights,n.clipping=this.clipping;const i={};for(const s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(n.extensions=i),n}}class d0 extends jn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class f0 extends Gs{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new ut(16777215),this.specular=new ut(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ut(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ol,this.normalScale=new dt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ui,this.combine=cc,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class h0 extends Gs{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=M_,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class p0 extends Gs{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class rh extends tn{constructor(e,n=1){super(),this.isLight=!0,this.type="Light",this.color=new ut(e),this.intensity=n}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,n){return super.copy(e,n),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const n=super.toJSON(e);return n.object.color=this.color.getHex(),n.object.intensity=this.intensity,n}}const Lo=new Rt,Xu=new H,ju=new H;class m0{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new dt(512,512),this.mapType=mn,this.map=null,this.mapPass=null,this.matrix=new Rt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new yc,this._frameExtents=new dt(1,1),this._viewportCount=1,this._viewports=[new Ct(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const n=this.camera,i=this.matrix;Xu.setFromMatrixPosition(e.matrixWorld),n.position.copy(Xu),ju.setFromMatrixPosition(e.target.matrixWorld),n.lookAt(ju),n.updateMatrixWorld(),Lo.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Lo,n.coordinateSystem,n.reversedDepth),n.coordinateSystem===br||n.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Lo)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const ea=new H,ta=new zs,Un=new H;class ah extends tn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Rt,this.projectionMatrix=new Rt,this.projectionMatrixInverse=new Rt,this.coordinateSystem=zn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,n){return super.copy(e,n),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(ea,ta,Un),Un.x===1&&Un.y===1&&Un.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ea,ta,Un.set(1,1,1)).invert()}updateWorldMatrix(e,n){super.updateWorldMatrix(e,n),this.matrixWorld.decompose(ea,ta,Un),Un.x===1&&Un.y===1&&Un.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ea,ta,Un.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const wi=new H,Yu=new dt,Ku=new dt;class pn extends ah{constructor(e=50,n=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=n,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const n=.5*this.getFilmHeight()/e;this.fov=Vl*2*Math.atan(n),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(oo*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Vl*2*Math.atan(Math.tan(oo*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,n,i){wi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(wi.x,wi.y).multiplyScalar(-e/wi.z),wi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(wi.x,wi.y).multiplyScalar(-e/wi.z)}getViewSize(e,n){return this.getViewBounds(e,Yu,Ku),n.subVectors(Ku,Yu)}setViewOffset(e,n,i,s,r,a){this.aspect=e/n,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let n=e*Math.tan(oo*.5*this.fov)/this.zoom,i=2*n,s=this.aspect*i,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const u=a.fullWidth,d=a.fullHeight;r+=a.offsetX*s/u,n-=a.offsetY*i/d,s*=a.width/u,i*=a.height/d}const l=this.filmOffset;l!==0&&(r+=e*l/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,n,n-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.fov=this.fov,n.object.zoom=this.zoom,n.object.near=this.near,n.object.far=this.far,n.object.focus=this.focus,n.object.aspect=this.aspect,this.view!==null&&(n.object.view=Object.assign({},this.view)),n.object.filmGauge=this.filmGauge,n.object.filmOffset=this.filmOffset,n}}class g0 extends m0{constructor(){super(new pn(90,1,.5,500)),this.isPointLightShadow=!0}}class Ju extends rh{constructor(e,n,i=0,s=2){super(e,n),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new g0}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,n){return super.copy(e,n),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){const n=super.toJSON(e);return n.object.distance=this.distance,n.object.decay=this.decay,n.object.shadow=this.shadow.toJSON(),n}}class oh extends ah{constructor(e=-1,n=1,i=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=n,this.top=i,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,n,i,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),n=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=i-e,a=i+e,l=s+n,u=s-n;if(this.view!==null&&this.view.enabled){const d=(this.right-this.left)/this.view.fullWidth/this.zoom,f=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=d*this.view.offsetX,a=r+d*this.view.width,l-=f*this.view.offsetY,u=l-f*this.view.height}this.projectionMatrix.makeOrthographic(r,a,l,u,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.zoom=this.zoom,n.object.left=this.left,n.object.right=this.right,n.object.top=this.top,n.object.bottom=this.bottom,n.object.near=this.near,n.object.far=this.far,this.view!==null&&(n.object.view=Object.assign({},this.view)),n}}class _0 extends rh{constructor(e,n){super(e,n),this.isAmbientLight=!0,this.type="AmbientLight"}}const Ss=-90,bs=1;class v0 extends tn{constructor(e,n,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new pn(Ss,bs,e,n);s.layers=this.layers,this.add(s);const r=new pn(Ss,bs,e,n);r.layers=this.layers,this.add(r);const a=new pn(Ss,bs,e,n);a.layers=this.layers,this.add(a);const l=new pn(Ss,bs,e,n);l.layers=this.layers,this.add(l);const u=new pn(Ss,bs,e,n);u.layers=this.layers,this.add(u);const d=new pn(Ss,bs,e,n);d.layers=this.layers,this.add(d)}updateCoordinateSystem(){const e=this.coordinateSystem,n=this.children.concat(),[i,s,r,a,l,u]=n;for(const d of n)this.remove(d);if(e===zn)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),l.up.set(0,1,0),l.lookAt(0,0,1),u.up.set(0,1,0),u.lookAt(0,0,-1);else if(e===br)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),l.up.set(0,-1,0),l.lookAt(0,0,1),u.up.set(0,-1,0),u.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const d of n)this.add(d),d.updateMatrixWorld()}update(e,n){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,l,u,d,f]=this.children,m=e.getRenderTarget(),p=e.getActiveCubeFace(),o=e.getActiveMipmapLevel(),h=e.xr.enabled;e.xr.enabled=!1;const y=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let _=!1;e.isWebGLRenderer===!0?_=e.state.buffers.depth.getReversed():_=e.reversedDepthBuffer,e.setRenderTarget(i,0,s),_&&e.autoClear===!1&&e.clearDepth(),e.render(n,r),e.setRenderTarget(i,1,s),_&&e.autoClear===!1&&e.clearDepth(),e.render(n,a),e.setRenderTarget(i,2,s),_&&e.autoClear===!1&&e.clearDepth(),e.render(n,l),e.setRenderTarget(i,3,s),_&&e.autoClear===!1&&e.clearDepth(),e.render(n,u),e.setRenderTarget(i,4,s),_&&e.autoClear===!1&&e.clearDepth(),e.render(n,d),i.texture.generateMipmaps=y,e.setRenderTarget(i,5,s),_&&e.autoClear===!1&&e.clearDepth(),e.render(n,f),e.setRenderTarget(m,p,o),e.xr.enabled=h,i.texture.needsPMREMUpdate=!0}}class y0 extends pn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class x0{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1,Je("Clock: This module has been deprecated. Please use THREE.Timer instead.")}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const n=performance.now();e=(n-this.oldTime)/1e3,this.oldTime=n,this.elapsedTime+=e}return e}}const Ac=class Ac{constructor(e,n,i,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,n,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,n=0){for(let i=0;i<4;i++)this.elements[i]=e[i+n];return this}set(e,n,i,s){const r=this.elements;return r[0]=e,r[2]=n,r[1]=i,r[3]=s,this}};Ac.prototype.isMatrix2=!0;let Zu=Ac;function Qu(t,e,n,i){const s=S0(i);switch(n){case qf:return t*e;case jf:return t*e/s.components*s.byteLength;case hc:return t*e/s.components*s.byteLength;case ss:return t*e*2/s.components*s.byteLength;case pc:return t*e*2/s.components*s.byteLength;case Xf:return t*e*3/s.components*s.byteLength;case An:return t*e*4/s.components*s.byteLength;case mc:return t*e*4/s.components*s.byteLength;case ua:case da:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case fa:case ha:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case cl:case dl:return Math.max(t,16)*Math.max(e,8)/4;case ll:case ul:return Math.max(t,8)*Math.max(e,8)/2;case fl:case hl:case ml:case gl:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case pl:case ba:case _l:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case vl:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case yl:return Math.floor((t+4)/5)*Math.floor((e+3)/4)*16;case xl:return Math.floor((t+4)/5)*Math.floor((e+4)/5)*16;case Sl:return Math.floor((t+5)/6)*Math.floor((e+4)/5)*16;case bl:return Math.floor((t+5)/6)*Math.floor((e+5)/6)*16;case Ml:return Math.floor((t+7)/8)*Math.floor((e+4)/5)*16;case Tl:return Math.floor((t+7)/8)*Math.floor((e+5)/6)*16;case El:return Math.floor((t+7)/8)*Math.floor((e+7)/8)*16;case wl:return Math.floor((t+9)/10)*Math.floor((e+4)/5)*16;case Al:return Math.floor((t+9)/10)*Math.floor((e+5)/6)*16;case Pl:return Math.floor((t+9)/10)*Math.floor((e+7)/8)*16;case Cl:return Math.floor((t+9)/10)*Math.floor((e+9)/10)*16;case Rl:return Math.floor((t+11)/12)*Math.floor((e+9)/10)*16;case Il:return Math.floor((t+11)/12)*Math.floor((e+11)/12)*16;case Ll:case Dl:case Nl:return Math.ceil(t/4)*Math.ceil(e/4)*16;case Ul:case Fl:return Math.ceil(t/4)*Math.ceil(e/4)*8;case Ma:case kl:return Math.ceil(t/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${n} format.`)}function S0(t){switch(t){case mn:case zf:return{byteLength:1,components:1};case xr:case Gf:case hi:return{byteLength:2,components:1};case dc:case fc:return{byteLength:2,components:4};case Xn:case uc:case Vn:return{byteLength:4,components:1};case Hf:case Wf:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${t}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:lc}}));typeof window<"u"&&(window.__THREE__?Je("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=lc);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function lh(){let t=null,e=!1,n=null,i=null;function s(r,a){n(r,a),i=t.requestAnimationFrame(s)}return{start:function(){e!==!0&&n!==null&&t!==null&&(i=t.requestAnimationFrame(s),e=!0)},stop:function(){t!==null&&t.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){n=r},setContext:function(r){t=r}}}function b0(t){const e=new WeakMap;function n(l,u){const d=l.array,f=l.usage,m=d.byteLength,p=t.createBuffer();t.bindBuffer(u,p),t.bufferData(u,d,f),l.onUploadCallback();let o;if(d instanceof Float32Array)o=t.FLOAT;else if(typeof Float16Array<"u"&&d instanceof Float16Array)o=t.HALF_FLOAT;else if(d instanceof Uint16Array)l.isFloat16BufferAttribute?o=t.HALF_FLOAT:o=t.UNSIGNED_SHORT;else if(d instanceof Int16Array)o=t.SHORT;else if(d instanceof Uint32Array)o=t.UNSIGNED_INT;else if(d instanceof Int32Array)o=t.INT;else if(d instanceof Int8Array)o=t.BYTE;else if(d instanceof Uint8Array)o=t.UNSIGNED_BYTE;else if(d instanceof Uint8ClampedArray)o=t.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+d);return{buffer:p,type:o,bytesPerElement:d.BYTES_PER_ELEMENT,version:l.version,size:m}}function i(l,u,d){const f=u.array,m=u.updateRanges;if(t.bindBuffer(d,l),m.length===0)t.bufferSubData(d,0,f);else{m.sort((o,h)=>o.start-h.start);let p=0;for(let o=1;o<m.length;o++){const h=m[p],y=m[o];y.start<=h.start+h.count+1?h.count=Math.max(h.count,y.start+y.count-h.start):(++p,m[p]=y)}m.length=p+1;for(let o=0,h=m.length;o<h;o++){const y=m[o];t.bufferSubData(d,y.start*f.BYTES_PER_ELEMENT,f,y.start,y.count)}u.clearUpdateRanges()}u.onUploadCallback()}function s(l){return l.isInterleavedBufferAttribute&&(l=l.data),e.get(l)}function r(l){l.isInterleavedBufferAttribute&&(l=l.data);const u=e.get(l);u&&(t.deleteBuffer(u.buffer),e.delete(l))}function a(l,u){if(l.isInterleavedBufferAttribute&&(l=l.data),l.isGLBufferAttribute){const f=e.get(l);(!f||f.version<l.version)&&e.set(l,{buffer:l.buffer,type:l.type,bytesPerElement:l.elementSize,version:l.version});return}const d=e.get(l);if(d===void 0)e.set(l,n(l,u));else if(d.version<l.version){if(d.size!==l.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(d.buffer,l,u),d.version=l.version}}return{get:s,remove:r,update:a}}var M0=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,T0=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,E0=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,w0=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,A0=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,P0=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,C0=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,R0=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,I0=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,L0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,D0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,N0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,U0=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,F0=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,k0=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,O0=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,B0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,V0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,z0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,G0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,H0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,W0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,q0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,X0=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,j0=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Y0=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,K0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,J0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Z0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Q0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,$0="gl_FragColor = linearToOutputTexel( gl_FragColor );",ev=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,tv=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,nv=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,iv=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,sv=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,rv=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,av=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,ov=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,lv=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,cv=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,uv=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,dv=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,fv=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,hv=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,pv=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,mv=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,gv=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,_v=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,vv=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,yv=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,xv=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Sv=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,bv=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = inverseTransformDirection( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Mv=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Tv=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Ev=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,wv=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Av=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Pv=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Cv=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Rv=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Iv=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Lv=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Dv=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Nv=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Uv=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Fv=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,kv=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Ov=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Bv=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Vv=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,zv=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Gv=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Hv=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Wv=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,qv=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Xv=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,jv=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Yv=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Kv=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Jv=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Zv=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Qv=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,$v=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,ey=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,ty=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,ny=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,iy=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,sy=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,ry=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,ay=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,oy=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,ly=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,cy=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,uy=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,dy=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,fy=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,hy=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,py=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,my=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,gy=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,_y=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,vy=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,yy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,xy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Sy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,by=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const My=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Ty=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ey=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,wy=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ay=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Py=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Cy=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Ry=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Iy=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Ly=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,Dy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Ny=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Uy=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Fy=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ky=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Oy=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,By=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Vy=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,zy=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Gy=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Hy=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Wy=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,qy=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Xy=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,jy=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Yy=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ky=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Jy=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Zy=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Qy=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,$y=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ex=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,tx=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,nx=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,rt={alphahash_fragment:M0,alphahash_pars_fragment:T0,alphamap_fragment:E0,alphamap_pars_fragment:w0,alphatest_fragment:A0,alphatest_pars_fragment:P0,aomap_fragment:C0,aomap_pars_fragment:R0,batching_pars_vertex:I0,batching_vertex:L0,begin_vertex:D0,beginnormal_vertex:N0,bsdfs:U0,iridescence_fragment:F0,bumpmap_pars_fragment:k0,clipping_planes_fragment:O0,clipping_planes_pars_fragment:B0,clipping_planes_pars_vertex:V0,clipping_planes_vertex:z0,color_fragment:G0,color_pars_fragment:H0,color_pars_vertex:W0,color_vertex:q0,common:X0,cube_uv_reflection_fragment:j0,defaultnormal_vertex:Y0,displacementmap_pars_vertex:K0,displacementmap_vertex:J0,emissivemap_fragment:Z0,emissivemap_pars_fragment:Q0,colorspace_fragment:$0,colorspace_pars_fragment:ev,envmap_fragment:tv,envmap_common_pars_fragment:nv,envmap_pars_fragment:iv,envmap_pars_vertex:sv,envmap_physical_pars_fragment:mv,envmap_vertex:rv,fog_vertex:av,fog_pars_vertex:ov,fog_fragment:lv,fog_pars_fragment:cv,gradientmap_pars_fragment:uv,lightmap_pars_fragment:dv,lights_lambert_fragment:fv,lights_lambert_pars_fragment:hv,lights_pars_begin:pv,lights_toon_fragment:gv,lights_toon_pars_fragment:_v,lights_phong_fragment:vv,lights_phong_pars_fragment:yv,lights_physical_fragment:xv,lights_physical_pars_fragment:Sv,lights_fragment_begin:bv,lights_fragment_maps:Mv,lights_fragment_end:Tv,lightprobes_pars_fragment:Ev,logdepthbuf_fragment:wv,logdepthbuf_pars_fragment:Av,logdepthbuf_pars_vertex:Pv,logdepthbuf_vertex:Cv,map_fragment:Rv,map_pars_fragment:Iv,map_particle_fragment:Lv,map_particle_pars_fragment:Dv,metalnessmap_fragment:Nv,metalnessmap_pars_fragment:Uv,morphinstance_vertex:Fv,morphcolor_vertex:kv,morphnormal_vertex:Ov,morphtarget_pars_vertex:Bv,morphtarget_vertex:Vv,normal_fragment_begin:zv,normal_fragment_maps:Gv,normal_pars_fragment:Hv,normal_pars_vertex:Wv,normal_vertex:qv,normalmap_pars_fragment:Xv,clearcoat_normal_fragment_begin:jv,clearcoat_normal_fragment_maps:Yv,clearcoat_pars_fragment:Kv,iridescence_pars_fragment:Jv,opaque_fragment:Zv,packing:Qv,premultiplied_alpha_fragment:$v,project_vertex:ey,dithering_fragment:ty,dithering_pars_fragment:ny,roughnessmap_fragment:iy,roughnessmap_pars_fragment:sy,shadowmap_pars_fragment:ry,shadowmap_pars_vertex:ay,shadowmap_vertex:oy,shadowmask_pars_fragment:ly,skinbase_vertex:cy,skinning_pars_vertex:uy,skinning_vertex:dy,skinnormal_vertex:fy,specularmap_fragment:hy,specularmap_pars_fragment:py,tonemapping_fragment:my,tonemapping_pars_fragment:gy,transmission_fragment:_y,transmission_pars_fragment:vy,uv_pars_fragment:yy,uv_pars_vertex:xy,uv_vertex:Sy,worldpos_vertex:by,background_vert:My,background_frag:Ty,backgroundCube_vert:Ey,backgroundCube_frag:wy,cube_vert:Ay,cube_frag:Py,depth_vert:Cy,depth_frag:Ry,distance_vert:Iy,distance_frag:Ly,equirect_vert:Dy,equirect_frag:Ny,linedashed_vert:Uy,linedashed_frag:Fy,meshbasic_vert:ky,meshbasic_frag:Oy,meshlambert_vert:By,meshlambert_frag:Vy,meshmatcap_vert:zy,meshmatcap_frag:Gy,meshnormal_vert:Hy,meshnormal_frag:Wy,meshphong_vert:qy,meshphong_frag:Xy,meshphysical_vert:jy,meshphysical_frag:Yy,meshtoon_vert:Ky,meshtoon_frag:Jy,points_vert:Zy,points_frag:Qy,shadow_vert:$y,shadow_frag:ex,sprite_vert:tx,sprite_frag:nx},Ce={common:{diffuse:{value:new ut(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new et},alphaMap:{value:null},alphaMapTransform:{value:new et},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new et}},envmap:{envMap:{value:null},envMapRotation:{value:new et},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new et}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new et}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new et},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new et},normalScale:{value:new dt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new et},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new et}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new et}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new et}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ut(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new H},probesMax:{value:new H},probesResolution:{value:new H}},points:{diffuse:{value:new ut(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new et},alphaTest:{value:0},uvTransform:{value:new et}},sprite:{diffuse:{value:new ut(16777215)},opacity:{value:1},center:{value:new dt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new et},alphaMap:{value:null},alphaMapTransform:{value:new et},alphaTest:{value:0}}},Bn={basic:{uniforms:Zt([Ce.common,Ce.specularmap,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.fog]),vertexShader:rt.meshbasic_vert,fragmentShader:rt.meshbasic_frag},lambert:{uniforms:Zt([Ce.common,Ce.specularmap,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.fog,Ce.lights,{emissive:{value:new ut(0)},envMapIntensity:{value:1}}]),vertexShader:rt.meshlambert_vert,fragmentShader:rt.meshlambert_frag},phong:{uniforms:Zt([Ce.common,Ce.specularmap,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.fog,Ce.lights,{emissive:{value:new ut(0)},specular:{value:new ut(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:rt.meshphong_vert,fragmentShader:rt.meshphong_frag},standard:{uniforms:Zt([Ce.common,Ce.envmap,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.roughnessmap,Ce.metalnessmap,Ce.fog,Ce.lights,{emissive:{value:new ut(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:rt.meshphysical_vert,fragmentShader:rt.meshphysical_frag},toon:{uniforms:Zt([Ce.common,Ce.aomap,Ce.lightmap,Ce.emissivemap,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.gradientmap,Ce.fog,Ce.lights,{emissive:{value:new ut(0)}}]),vertexShader:rt.meshtoon_vert,fragmentShader:rt.meshtoon_frag},matcap:{uniforms:Zt([Ce.common,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,Ce.fog,{matcap:{value:null}}]),vertexShader:rt.meshmatcap_vert,fragmentShader:rt.meshmatcap_frag},points:{uniforms:Zt([Ce.points,Ce.fog]),vertexShader:rt.points_vert,fragmentShader:rt.points_frag},dashed:{uniforms:Zt([Ce.common,Ce.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:rt.linedashed_vert,fragmentShader:rt.linedashed_frag},depth:{uniforms:Zt([Ce.common,Ce.displacementmap]),vertexShader:rt.depth_vert,fragmentShader:rt.depth_frag},normal:{uniforms:Zt([Ce.common,Ce.bumpmap,Ce.normalmap,Ce.displacementmap,{opacity:{value:1}}]),vertexShader:rt.meshnormal_vert,fragmentShader:rt.meshnormal_frag},sprite:{uniforms:Zt([Ce.sprite,Ce.fog]),vertexShader:rt.sprite_vert,fragmentShader:rt.sprite_frag},background:{uniforms:{uvTransform:{value:new et},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:rt.background_vert,fragmentShader:rt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new et}},vertexShader:rt.backgroundCube_vert,fragmentShader:rt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:rt.cube_vert,fragmentShader:rt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:rt.equirect_vert,fragmentShader:rt.equirect_frag},distance:{uniforms:Zt([Ce.common,Ce.displacementmap,{referencePosition:{value:new H},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:rt.distance_vert,fragmentShader:rt.distance_frag},shadow:{uniforms:Zt([Ce.lights,Ce.fog,{color:{value:new ut(0)},opacity:{value:1}}]),vertexShader:rt.shadow_vert,fragmentShader:rt.shadow_frag}};Bn.physical={uniforms:Zt([Bn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new et},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new et},clearcoatNormalScale:{value:new dt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new et},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new et},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new et},sheen:{value:0},sheenColor:{value:new ut(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new et},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new et},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new et},transmissionSamplerSize:{value:new dt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new et},attenuationDistance:{value:0},attenuationColor:{value:new ut(0)},specularColor:{value:new ut(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new et},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new et},anisotropyVector:{value:new dt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new et}}]),vertexShader:rt.meshphysical_vert,fragmentShader:rt.meshphysical_frag};const na={r:0,b:0,g:0},ix=new Rt,ch=new et;ch.set(-1,0,0,0,1,0,0,0,1);function sx(t,e,n,i,s,r){const a=new ut(0);let l=s===!0?0:1,u,d,f=null,m=0,p=null;function o(S){let E=S.isScene===!0?S.background:null;if(E&&E.isTexture){const b=S.backgroundBlurriness>0;E=e.get(E,b)}return E}function h(S){let E=!1;const b=o(S);b===null?_(a,l):b&&b.isColor&&(_(b,1),E=!0);const L=t.xr.getEnvironmentBlendMode();L==="additive"?n.buffers.color.setClear(0,0,0,1,r):L==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,r),(t.autoClear||E)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil))}function y(S,E){const b=o(E);b&&(b.isCubeTexture||b.mapping===Va)?(d===void 0&&(d=new _n(new Pr(1,1,1),new jn({name:"BackgroundCubeMaterial",uniforms:Os(Bn.backgroundCube.uniforms),vertexShader:Bn.backgroundCube.vertexShader,fragmentShader:Bn.backgroundCube.fragmentShader,side:an,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),d.geometry.deleteAttribute("normal"),d.geometry.deleteAttribute("uv"),d.onBeforeRender=function(L,w,D){this.matrixWorld.copyPosition(D.matrixWorld)},Object.defineProperty(d.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(d)),d.material.uniforms.envMap.value=b,d.material.uniforms.backgroundBlurriness.value=E.backgroundBlurriness,d.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,d.material.uniforms.backgroundRotation.value.setFromMatrix4(ix.makeRotationFromEuler(E.backgroundRotation)).transpose(),b.isCubeTexture&&b.isRenderTargetTexture===!1&&d.material.uniforms.backgroundRotation.value.premultiply(ch),d.material.toneMapped=lt.getTransfer(b.colorSpace)!==_t,(f!==b||m!==b.version||p!==t.toneMapping)&&(d.material.needsUpdate=!0,f=b,m=b.version,p=t.toneMapping),d.layers.enableAll(),S.unshift(d,d.geometry,d.material,0,0,null)):b&&b.isTexture&&(u===void 0&&(u=new _n(new Ga(2,2),new jn({name:"BackgroundMaterial",uniforms:Os(Bn.background.uniforms),vertexShader:Bn.background.vertexShader,fragmentShader:Bn.background.fragmentShader,side:Ni,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),Object.defineProperty(u.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(u)),u.material.uniforms.t2D.value=b,u.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,u.material.toneMapped=lt.getTransfer(b.colorSpace)!==_t,b.matrixAutoUpdate===!0&&b.updateMatrix(),u.material.uniforms.uvTransform.value.copy(b.matrix),(f!==b||m!==b.version||p!==t.toneMapping)&&(u.material.needsUpdate=!0,f=b,m=b.version,p=t.toneMapping),u.layers.enableAll(),S.unshift(u,u.geometry,u.material,0,0,null))}function _(S,E){S.getRGB(na,sh(t)),n.buffers.color.setClear(na.r,na.g,na.b,E,r)}function g(){d!==void 0&&(d.geometry.dispose(),d.material.dispose(),d=void 0),u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0)}return{getClearColor:function(){return a},setClearColor:function(S,E=1){a.set(S),l=E,_(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(S){l=S,_(a,l)},render:h,addToRenderList:y,dispose:g}}function rx(t,e){const n=t.getParameter(t.MAX_VERTEX_ATTRIBS),i={},s=p(null);let r=s,a=!1;function l(U,W,ee,le,V){let q=!1;const z=m(U,le,ee,W);r!==z&&(r=z,d(r.object)),q=o(U,le,ee,V),q&&h(U,le,ee,V),V!==null&&e.update(V,t.ELEMENT_ARRAY_BUFFER),(q||a)&&(a=!1,b(U,W,ee,le),V!==null&&t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,e.get(V).buffer))}function u(){return t.createVertexArray()}function d(U){return t.bindVertexArray(U)}function f(U){return t.deleteVertexArray(U)}function m(U,W,ee,le){const V=le.wireframe===!0;let q=i[W.id];q===void 0&&(q={},i[W.id]=q);const z=U.isInstancedMesh===!0?U.id:0;let te=q[z];te===void 0&&(te={},q[z]=te);let de=te[ee.id];de===void 0&&(de={},te[ee.id]=de);let Ee=de[V];return Ee===void 0&&(Ee=p(u()),de[V]=Ee),Ee}function p(U){const W=[],ee=[],le=[];for(let V=0;V<n;V++)W[V]=0,ee[V]=0,le[V]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:W,enabledAttributes:ee,attributeDivisors:le,object:U,attributes:{},index:null}}function o(U,W,ee,le){const V=r.attributes,q=W.attributes;let z=0;const te=ee.getAttributes();for(const de in te)if(te[de].location>=0){const De=V[de];let Fe=q[de];if(Fe===void 0&&(de==="instanceMatrix"&&U.instanceMatrix&&(Fe=U.instanceMatrix),de==="instanceColor"&&U.instanceColor&&(Fe=U.instanceColor)),De===void 0||De.attribute!==Fe||Fe&&De.data!==Fe.data)return!0;z++}return r.attributesNum!==z||r.index!==le}function h(U,W,ee,le){const V={},q=W.attributes;let z=0;const te=ee.getAttributes();for(const de in te)if(te[de].location>=0){let De=q[de];De===void 0&&(de==="instanceMatrix"&&U.instanceMatrix&&(De=U.instanceMatrix),de==="instanceColor"&&U.instanceColor&&(De=U.instanceColor));const Fe={};Fe.attribute=De,De&&De.data&&(Fe.data=De.data),V[de]=Fe,z++}r.attributes=V,r.attributesNum=z,r.index=le}function y(){const U=r.newAttributes;for(let W=0,ee=U.length;W<ee;W++)U[W]=0}function _(U){g(U,0)}function g(U,W){const ee=r.newAttributes,le=r.enabledAttributes,V=r.attributeDivisors;ee[U]=1,le[U]===0&&(t.enableVertexAttribArray(U),le[U]=1),V[U]!==W&&(t.vertexAttribDivisor(U,W),V[U]=W)}function S(){const U=r.newAttributes,W=r.enabledAttributes;for(let ee=0,le=W.length;ee<le;ee++)W[ee]!==U[ee]&&(t.disableVertexAttribArray(ee),W[ee]=0)}function E(U,W,ee,le,V,q,z){z===!0?t.vertexAttribIPointer(U,W,ee,V,q):t.vertexAttribPointer(U,W,ee,le,V,q)}function b(U,W,ee,le){y();const V=le.attributes,q=ee.getAttributes(),z=W.defaultAttributeValues;for(const te in q){const de=q[te];if(de.location>=0){let Ee=V[te];if(Ee===void 0&&(te==="instanceMatrix"&&U.instanceMatrix&&(Ee=U.instanceMatrix),te==="instanceColor"&&U.instanceColor&&(Ee=U.instanceColor)),Ee!==void 0){const De=Ee.normalized,Fe=Ee.itemSize,ot=e.get(Ee);if(ot===void 0)continue;const mt=ot.buffer,$e=ot.type,oe=ot.bytesPerElement,Ae=$e===t.INT||$e===t.UNSIGNED_INT||Ee.gpuType===uc;if(Ee.isInterleavedBufferAttribute){const ye=Ee.data,Xe=ye.stride,Ye=Ee.offset;if(ye.isInstancedInterleavedBuffer){for(let Ke=0;Ke<de.locationSize;Ke++)g(de.location+Ke,ye.meshPerAttribute);U.isInstancedMesh!==!0&&le._maxInstanceCount===void 0&&(le._maxInstanceCount=ye.meshPerAttribute*ye.count)}else for(let Ke=0;Ke<de.locationSize;Ke++)_(de.location+Ke);t.bindBuffer(t.ARRAY_BUFFER,mt);for(let Ke=0;Ke<de.locationSize;Ke++)E(de.location+Ke,Fe/de.locationSize,$e,De,Xe*oe,(Ye+Fe/de.locationSize*Ke)*oe,Ae)}else{if(Ee.isInstancedBufferAttribute){for(let ye=0;ye<de.locationSize;ye++)g(de.location+ye,Ee.meshPerAttribute);U.isInstancedMesh!==!0&&le._maxInstanceCount===void 0&&(le._maxInstanceCount=Ee.meshPerAttribute*Ee.count)}else for(let ye=0;ye<de.locationSize;ye++)_(de.location+ye);t.bindBuffer(t.ARRAY_BUFFER,mt);for(let ye=0;ye<de.locationSize;ye++)E(de.location+ye,Fe/de.locationSize,$e,De,Fe*oe,Fe/de.locationSize*ye*oe,Ae)}}else if(z!==void 0){const De=z[te];if(De!==void 0)switch(De.length){case 2:t.vertexAttrib2fv(de.location,De);break;case 3:t.vertexAttrib3fv(de.location,De);break;case 4:t.vertexAttrib4fv(de.location,De);break;default:t.vertexAttrib1fv(de.location,De)}}}}S()}function L(){R();for(const U in i){const W=i[U];for(const ee in W){const le=W[ee];for(const V in le){const q=le[V];for(const z in q)f(q[z].object),delete q[z];delete le[V]}}delete i[U]}}function w(U){if(i[U.id]===void 0)return;const W=i[U.id];for(const ee in W){const le=W[ee];for(const V in le){const q=le[V];for(const z in q)f(q[z].object),delete q[z];delete le[V]}}delete i[U.id]}function D(U){for(const W in i){const ee=i[W];for(const le in ee){const V=ee[le];if(V[U.id]===void 0)continue;const q=V[U.id];for(const z in q)f(q[z].object),delete q[z];delete V[U.id]}}}function x(U){for(const W in i){const ee=i[W],le=U.isInstancedMesh===!0?U.id:0,V=ee[le];if(V!==void 0){for(const q in V){const z=V[q];for(const te in z)f(z[te].object),delete z[te];delete V[q]}delete ee[le],Object.keys(ee).length===0&&delete i[W]}}}function R(){O(),a=!0,r!==s&&(r=s,d(r.object))}function O(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:l,reset:R,resetDefaultState:O,dispose:L,releaseStatesOfGeometry:w,releaseStatesOfObject:x,releaseStatesOfProgram:D,initAttributes:y,enableAttribute:_,disableUnusedAttributes:S}}function ax(t,e,n){let i;function s(u){i=u}function r(u,d){t.drawArrays(i,u,d),n.update(d,i,1)}function a(u,d,f){f!==0&&(t.drawArraysInstanced(i,u,d,f),n.update(d,i,f))}function l(u,d,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,u,0,d,0,f);let p=0;for(let o=0;o<f;o++)p+=d[o];n.update(p,i,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=l}function ox(t,e,n,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const D=e.get("EXT_texture_filter_anisotropic");s=t.getParameter(D.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(D){return!(D!==An&&i.convert(D)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_FORMAT))}function l(D){const x=D===hi&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(D!==mn&&i.convert(D)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_TYPE)&&D!==Vn&&!x)}function u(D){if(D==="highp"){if(t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.HIGH_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.HIGH_FLOAT).precision>0)return"highp";D="mediump"}return D==="mediump"&&t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.MEDIUM_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let d=n.precision!==void 0?n.precision:"highp";const f=u(d);f!==d&&(Je("WebGLRenderer:",d,"not supported, using",f,"instead."),d=f);const m=n.logarithmicDepthBuffer===!0,p=n.reversedDepthBuffer===!0&&e.has("EXT_clip_control");n.reversedDepthBuffer===!0&&p===!1&&Je("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const o=t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS),h=t.getParameter(t.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=t.getParameter(t.MAX_TEXTURE_SIZE),_=t.getParameter(t.MAX_CUBE_MAP_TEXTURE_SIZE),g=t.getParameter(t.MAX_VERTEX_ATTRIBS),S=t.getParameter(t.MAX_VERTEX_UNIFORM_VECTORS),E=t.getParameter(t.MAX_VARYING_VECTORS),b=t.getParameter(t.MAX_FRAGMENT_UNIFORM_VECTORS),L=t.getParameter(t.MAX_SAMPLES),w=t.getParameter(t.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:u,textureFormatReadable:a,textureTypeReadable:l,precision:d,logarithmicDepthBuffer:m,reversedDepthBuffer:p,maxTextures:o,maxVertexTextures:h,maxTextureSize:y,maxCubemapSize:_,maxAttributes:g,maxVertexUniforms:S,maxVaryings:E,maxFragmentUniforms:b,maxSamples:L,samples:w}}function lx(t){const e=this;let n=null,i=0,s=!1,r=!1;const a=new Yi,l=new et,u={value:null,needsUpdate:!1};this.uniform=u,this.numPlanes=0,this.numIntersection=0,this.init=function(m,p){const o=m.length!==0||p||i!==0||s;return s=p,i=m.length,o},this.beginShadows=function(){r=!0,f(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(m,p){n=f(m,p,0)},this.setState=function(m,p,o){const h=m.clippingPlanes,y=m.clipIntersection,_=m.clipShadows,g=t.get(m);if(!s||h===null||h.length===0||r&&!_)r?f(null):d();else{const S=r?0:i,E=S*4;let b=g.clippingState||null;u.value=b,b=f(h,p,E,o);for(let L=0;L!==E;++L)b[L]=n[L];g.clippingState=b,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=S}};function d(){u.value!==n&&(u.value=n,u.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function f(m,p,o,h){const y=m!==null?m.length:0;let _=null;if(y!==0){if(_=u.value,h!==!0||_===null){const g=o+y*4,S=p.matrixWorldInverse;l.getNormalMatrix(S),(_===null||_.length<g)&&(_=new Float32Array(g));for(let E=0,b=o;E!==y;++E,b+=4)a.copy(m[E]).applyMatrix4(S,l),a.normal.toArray(_,b),_[b+3]=a.constant}u.value=_,u.needsUpdate=!0}return e.numPlanes=y,e.numIntersection=0,_}}const Ii=4,$u=[.125,.215,.35,.446,.526,.582],Ji=20,cx=256,$s=new oh,ed=new ut;let Do=null,No=0,Uo=0,Fo=!1;const ux=new H;class td{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,n=0,i=.1,s=100,r={}){const{size:a=256,position:l=ux}=r;Do=this._renderer.getRenderTarget(),No=this._renderer.getActiveCubeFace(),Uo=this._renderer.getActiveMipmapLevel(),Fo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const u=this._allocateTargets();return u.depthBuffer=!0,this._sceneToCubeUV(e,i,s,u,l),n>0&&this._blur(u,0,0,n),this._applyPMREM(u),this._cleanup(u),u}fromEquirectangular(e,n=null){return this._fromTexture(e,n)}fromCubemap(e,n=null){return this._fromTexture(e,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=sd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=id(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Do,No,Uo),this._renderer.xr.enabled=Fo,e.scissorTest=!1,Ms(e,0,0,e.width,e.height)}_fromTexture(e,n){e.mapping===is||e.mapping===Fs?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Do=this._renderer.getRenderTarget(),No=this._renderer.getActiveCubeFace(),Uo=this._renderer.getActiveMipmapLevel(),Fo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=n||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,i={magFilter:Kt,minFilter:Kt,generateMipmaps:!1,type:hi,format:An,colorSpace:Ta,depthBuffer:!1},s=nd(e,n,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=nd(e,n,i);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=dx(r)),this._blurMaterial=hx(r,e,n),this._ggxMaterial=fx(r,e,n)}return s}_compileMaterial(e){const n=new _n(new on,e);this._renderer.compile(n,$s)}_sceneToCubeUV(e,n,i,s,r){const u=new pn(90,1,n,i),d=[1,-1,1,1,1,1],f=[1,1,1,-1,-1,-1],m=this._renderer,p=m.autoClear,o=m.toneMapping;m.getClearColor(ed),m.toneMapping=Hn,m.autoClear=!1,m.state.buffers.depth.getReversed()&&(m.setRenderTarget(s),m.clearDepth(),m.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new _n(new Pr,new hr({name:"PMREM.Background",side:an,depthWrite:!1,depthTest:!1})));const y=this._backgroundBox,_=y.material;let g=!1;const S=e.background;S?S.isColor&&(_.color.copy(S),e.background=null,g=!0):(_.color.copy(ed),g=!0);for(let E=0;E<6;E++){const b=E%3;b===0?(u.up.set(0,d[E],0),u.position.set(r.x,r.y,r.z),u.lookAt(r.x+f[E],r.y,r.z)):b===1?(u.up.set(0,0,d[E]),u.position.set(r.x,r.y,r.z),u.lookAt(r.x,r.y+f[E],r.z)):(u.up.set(0,d[E],0),u.position.set(r.x,r.y,r.z),u.lookAt(r.x,r.y,r.z+f[E]));const L=this._cubeSize;Ms(s,b*L,E>2?L:0,L,L),m.setRenderTarget(s),g&&m.render(y,u),m.render(e,u)}m.toneMapping=o,m.autoClear=p,e.background=S}_textureToCubeUV(e,n){const i=this._renderer,s=e.mapping===is||e.mapping===Fs;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=sd()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=id());const r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;const l=r.uniforms;l.envMap.value=e;const u=this._cubeSize;Ms(n,0,0,3*u,2*u),i.setRenderTarget(n),i.render(a,$s)}_applyPMREM(e){const n=this._renderer,i=n.autoClear;n.autoClear=!1;const s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);n.autoClear=i}_applyGGXFilter(e,n,i){const s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,l=this._lodMeshes[i];l.material=a;const u=a.uniforms,d=i/(this._lodMeshes.length-1),f=n/(this._lodMeshes.length-1),m=Math.sqrt(d*d-f*f),p=0+d*1.25,o=m*p,{_lodMax:h}=this,y=this._sizeLods[i],_=3*y*(i>h-Ii?i-h+Ii:0),g=4*(this._cubeSize-y);u.envMap.value=e.texture,u.roughness.value=o,u.mipInt.value=h-n,Ms(r,_,g,3*y,2*y),s.setRenderTarget(r),s.render(l,$s),u.envMap.value=r.texture,u.roughness.value=0,u.mipInt.value=h-i,Ms(e,_,g,3*y,2*y),s.setRenderTarget(e),s.render(l,$s)}_blur(e,n,i,s,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,n,i,s,"latitudinal",r),this._halfBlur(a,e,i,i,s,"longitudinal",r)}_halfBlur(e,n,i,s,r,a,l){const u=this._renderer,d=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&ht("blur direction must be either latitudinal or longitudinal!");const f=3,m=this._lodMeshes[s];m.material=d;const p=d.uniforms,o=this._sizeLods[i]-1,h=isFinite(r)?Math.PI/(2*o):2*Math.PI/(2*Ji-1),y=r/h,_=isFinite(r)?1+Math.floor(f*y):Ji;_>Ji&&Je(`sigmaRadians, ${r}, is too large and will clip, as it requested ${_} samples when the maximum is set to ${Ji}`);const g=[];let S=0;for(let D=0;D<Ji;++D){const x=D/y,R=Math.exp(-x*x/2);g.push(R),D===0?S+=R:D<_&&(S+=2*R)}for(let D=0;D<g.length;D++)g[D]=g[D]/S;p.envMap.value=e.texture,p.samples.value=_,p.weights.value=g,p.latitudinal.value=a==="latitudinal",l&&(p.poleAxis.value=l);const{_lodMax:E}=this;p.dTheta.value=h,p.mipInt.value=E-i;const b=this._sizeLods[s],L=3*b*(s>E-Ii?s-E+Ii:0),w=4*(this._cubeSize-b);Ms(n,L,w,3*b,2*b),u.setRenderTarget(n),u.render(m,$s)}}function dx(t){const e=[],n=[],i=[];let s=t;const r=t-Ii+1+$u.length;for(let a=0;a<r;a++){const l=Math.pow(2,s);e.push(l);let u=1/l;a>t-Ii?u=$u[a-t+Ii-1]:a===0&&(u=0),n.push(u);const d=1/(l-2),f=-d,m=1+d,p=[f,f,m,f,m,m,f,f,m,m,f,m],o=6,h=6,y=3,_=2,g=1,S=new Float32Array(y*h*o),E=new Float32Array(_*h*o),b=new Float32Array(g*h*o);for(let w=0;w<o;w++){const D=w%3*2/3-1,x=w>2?0:-1,R=[D,x,0,D+2/3,x,0,D+2/3,x+1,0,D,x,0,D+2/3,x+1,0,D,x+1,0];S.set(R,y*h*w),E.set(p,_*h*w);const O=[w,w,w,w,w,w];b.set(O,g*h*w)}const L=new on;L.setAttribute("position",new Rn(S,y)),L.setAttribute("uv",new Rn(E,_)),L.setAttribute("faceIndex",new Rn(b,g)),i.push(new _n(L,null)),s>Ii&&s--}return{lodMeshes:i,sizeLods:e,sigmas:n}}function nd(t,e,n){const i=new Wn(t,e,n);return i.texture.mapping=Va,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Ms(t,e,n,i,s){t.viewport.set(e,n,i,s),t.scissor.set(e,n,i,s)}function fx(t,e,n){return new jn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:cx,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${t}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Ha(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:oi,depthTest:!1,depthWrite:!1})}function hx(t,e,n){const i=new Float32Array(Ji),s=new H(0,1,0);return new jn({name:"SphericalGaussianBlur",defines:{n:Ji,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${t}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Ha(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:oi,depthTest:!1,depthWrite:!1})}function id(){return new jn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Ha(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:oi,depthTest:!1,depthWrite:!1})}function sd(){return new jn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ha(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:oi,depthTest:!1,depthWrite:!1})}function Ha(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}class uh extends Wn{constructor(e=1,n={}){super(e,e,n),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new nh(s),this._setTextureOptions(n),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,n){this.texture.type=n.type,this.texture.colorSpace=n.colorSpace,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Pr(5,5,5),r=new jn({name:"CubemapFromEquirect",uniforms:Os(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:an,blending:oi});r.uniforms.tEquirect.value=n;const a=new _n(s,r),l=n.minFilter;return n.minFilter===Zi&&(n.minFilter=Kt),new v0(1,10,this).update(e,a),n.minFilter=l,a.geometry.dispose(),a.material.dispose(),this}clear(e,n=!0,i=!0,s=!0){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(n,i,s);e.setRenderTarget(r)}}function px(t){let e=new WeakMap,n=new WeakMap,i=null;function s(p,o=!1){return p==null?null:o?a(p):r(p)}function r(p){if(p&&p.isTexture){const o=p.mapping;if(o===so||o===ro)if(e.has(p)){const h=e.get(p).texture;return l(h,p.mapping)}else{const h=p.image;if(h&&h.height>0){const y=new uh(h.height);return y.fromEquirectangularTexture(t,p),e.set(p,y),p.addEventListener("dispose",d),l(y.texture,p.mapping)}else return null}}return p}function a(p){if(p&&p.isTexture){const o=p.mapping,h=o===so||o===ro,y=o===is||o===Fs;if(h||y){let _=n.get(p);const g=_!==void 0?_.texture.pmremVersion:0;if(p.isRenderTargetTexture&&p.pmremVersion!==g)return i===null&&(i=new td(t)),_=h?i.fromEquirectangular(p,_):i.fromCubemap(p,_),_.texture.pmremVersion=p.pmremVersion,n.set(p,_),_.texture;if(_!==void 0)return _.texture;{const S=p.image;return h&&S&&S.height>0||y&&S&&u(S)?(i===null&&(i=new td(t)),_=h?i.fromEquirectangular(p):i.fromCubemap(p),_.texture.pmremVersion=p.pmremVersion,n.set(p,_),p.addEventListener("dispose",f),_.texture):null}}}return p}function l(p,o){return o===so?p.mapping=is:o===ro&&(p.mapping=Fs),p}function u(p){let o=0;const h=6;for(let y=0;y<h;y++)p[y]!==void 0&&o++;return o===h}function d(p){const o=p.target;o.removeEventListener("dispose",d);const h=e.get(o);h!==void 0&&(e.delete(o),h.dispose())}function f(p){const o=p.target;o.removeEventListener("dispose",f);const h=n.get(o);h!==void 0&&(n.delete(o),h.dispose())}function m(){e=new WeakMap,n=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:m}}function mx(t){const e={};function n(i){if(e[i]!==void 0)return e[i];const s=t.getExtension(i);return e[i]=s,s}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){const s=n(i);return s===null&&Bl("WebGLRenderer: "+i+" extension not supported."),s}}}function gx(t,e,n,i){const s={},r=new WeakMap;function a(m){const p=m.target;p.index!==null&&e.remove(p.index);for(const h in p.attributes)e.remove(p.attributes[h]);p.removeEventListener("dispose",a),delete s[p.id];const o=r.get(p);o&&(e.remove(o),r.delete(p)),i.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,n.memory.geometries--}function l(m,p){return s[p.id]===!0||(p.addEventListener("dispose",a),s[p.id]=!0,n.memory.geometries++),p}function u(m){const p=m.attributes;for(const o in p)e.update(p[o],t.ARRAY_BUFFER)}function d(m){const p=[],o=m.index,h=m.attributes.position;let y=0;if(h===void 0)return;if(o!==null){const S=o.array;y=o.version;for(let E=0,b=S.length;E<b;E+=3){const L=S[E+0],w=S[E+1],D=S[E+2];p.push(L,w,w,D,D,L)}}else{const S=h.array;y=h.version;for(let E=0,b=S.length/3-1;E<b;E+=3){const L=E+0,w=E+1,D=E+2;p.push(L,w,w,D,D,L)}}const _=new(h.count>=65535?$f:Qf)(p,1);_.version=y;const g=r.get(m);g&&e.remove(g),r.set(m,_)}function f(m){const p=r.get(m);if(p){const o=m.index;o!==null&&p.version<o.version&&d(m)}else d(m);return r.get(m)}return{get:l,update:u,getWireframeAttribute:f}}function _x(t,e,n){let i;function s(m){i=m}let r,a;function l(m){r=m.type,a=m.bytesPerElement}function u(m,p){t.drawElements(i,p,r,m*a),n.update(p,i,1)}function d(m,p,o){o!==0&&(t.drawElementsInstanced(i,p,r,m*a,o),n.update(p,i,o))}function f(m,p,o){if(o===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,p,0,r,m,0,o);let y=0;for(let _=0;_<o;_++)y+=p[_];n.update(y,i,1)}this.setMode=s,this.setIndex=l,this.render=u,this.renderInstances=d,this.renderMultiDraw=f}function vx(t){const e={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,l){switch(n.calls++,a){case t.TRIANGLES:n.triangles+=l*(r/3);break;case t.LINES:n.lines+=l*(r/2);break;case t.LINE_STRIP:n.lines+=l*(r-1);break;case t.LINE_LOOP:n.lines+=l*r;break;case t.POINTS:n.points+=l*r;break;default:ht("WebGLInfo: Unknown draw mode:",a);break}}function s(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:e,render:n,programs:null,autoReset:!0,reset:s,update:i}}function yx(t,e,n){const i=new WeakMap,s=new Ct;function r(a,l,u){const d=a.morphTargetInfluences,f=l.morphAttributes.position||l.morphAttributes.normal||l.morphAttributes.color,m=f!==void 0?f.length:0;let p=i.get(l);if(p===void 0||p.count!==m){let O=function(){x.dispose(),i.delete(l),l.removeEventListener("dispose",O)};var o=O;p!==void 0&&p.texture.dispose();const h=l.morphAttributes.position!==void 0,y=l.morphAttributes.normal!==void 0,_=l.morphAttributes.color!==void 0,g=l.morphAttributes.position||[],S=l.morphAttributes.normal||[],E=l.morphAttributes.color||[];let b=0;h===!0&&(b=1),y===!0&&(b=2),_===!0&&(b=3);let L=l.attributes.position.count*b,w=1;L>e.maxTextureSize&&(w=Math.ceil(L/e.maxTextureSize),L=e.maxTextureSize);const D=new Float32Array(L*w*4*m),x=new Kf(D,L,w,m);x.type=Vn,x.needsUpdate=!0;const R=b*4;for(let U=0;U<m;U++){const W=g[U],ee=S[U],le=E[U],V=L*w*4*U;for(let q=0;q<W.count;q++){const z=q*R;h===!0&&(s.fromBufferAttribute(W,q),D[V+z+0]=s.x,D[V+z+1]=s.y,D[V+z+2]=s.z,D[V+z+3]=0),y===!0&&(s.fromBufferAttribute(ee,q),D[V+z+4]=s.x,D[V+z+5]=s.y,D[V+z+6]=s.z,D[V+z+7]=0),_===!0&&(s.fromBufferAttribute(le,q),D[V+z+8]=s.x,D[V+z+9]=s.y,D[V+z+10]=s.z,D[V+z+11]=le.itemSize===4?s.w:1)}}p={count:m,texture:x,size:new dt(L,w)},i.set(l,p),l.addEventListener("dispose",O)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)u.getUniforms().setValue(t,"morphTexture",a.morphTexture,n);else{let h=0;for(let _=0;_<d.length;_++)h+=d[_];const y=l.morphTargetsRelative?1:1-h;u.getUniforms().setValue(t,"morphTargetBaseInfluence",y),u.getUniforms().setValue(t,"morphTargetInfluences",d)}u.getUniforms().setValue(t,"morphTargetsTexture",p.texture,n),u.getUniforms().setValue(t,"morphTargetsTextureSize",p.size)}return{update:r}}function xx(t,e,n,i,s){let r=new WeakMap;function a(d){const f=s.render.frame,m=d.geometry,p=e.get(d,m);if(r.get(p)!==f&&(e.update(p),r.set(p,f)),d.isInstancedMesh&&(d.hasEventListener("dispose",u)===!1&&d.addEventListener("dispose",u),r.get(d)!==f&&(n.update(d.instanceMatrix,t.ARRAY_BUFFER),d.instanceColor!==null&&n.update(d.instanceColor,t.ARRAY_BUFFER),r.set(d,f))),d.isSkinnedMesh){const o=d.skeleton;r.get(o)!==f&&(o.update(),r.set(o,f))}return p}function l(){r=new WeakMap}function u(d){const f=d.target;f.removeEventListener("dispose",u),i.releaseStatesOfObject(f),n.remove(f.instanceMatrix),f.instanceColor!==null&&n.remove(f.instanceColor)}return{update:a,dispose:l}}const Sx={[Df]:"LINEAR_TONE_MAPPING",[Nf]:"REINHARD_TONE_MAPPING",[Uf]:"CINEON_TONE_MAPPING",[Ff]:"ACES_FILMIC_TONE_MAPPING",[Of]:"AGX_TONE_MAPPING",[Bf]:"NEUTRAL_TONE_MAPPING",[kf]:"CUSTOM_TONE_MAPPING"};function bx(t,e,n,i,s){const r=new Wn(e,n,{type:t,depthBuffer:i,stencilBuffer:s,depthTexture:i?new ks(e,n):void 0}),a=new Wn(e,n,{type:hi,depthBuffer:!1,stencilBuffer:!1}),l=new on;l.setAttribute("position",new Vt([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new Vt([0,2,0,0,2,0],2));const u=new d0({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new _n(l,u),f=new oh(-1,1,1,-1,0,1);let m=null,p=null,o=!1,h,y=null,_=[],g=!1;this.setSize=function(S,E){r.setSize(S,E),a.setSize(S,E);for(let b=0;b<_.length;b++){const L=_[b];L.setSize&&L.setSize(S,E)}},this.setEffects=function(S){_=S,g=_.length>0&&_[0].isRenderPass===!0;const E=r.width,b=r.height;for(let L=0;L<_.length;L++){const w=_[L];w.setSize&&w.setSize(E,b)}},this.begin=function(S,E){if(o||S.toneMapping===Hn&&_.length===0)return!1;if(y=E,E!==null){const b=E.width,L=E.height;(r.width!==b||r.height!==L)&&this.setSize(b,L)}return g===!1&&S.setRenderTarget(r),h=S.toneMapping,S.toneMapping=Hn,!0},this.hasRenderPass=function(){return g},this.end=function(S,E){S.toneMapping=h,o=!0;let b=r,L=a;for(let w=0;w<_.length;w++){const D=_[w];if(D.enabled!==!1&&(D.render(S,L,b,E),D.needsSwap!==!1)){const x=b;b=L,L=x}}if(m!==S.outputColorSpace||p!==S.toneMapping){m=S.outputColorSpace,p=S.toneMapping,u.defines={},lt.getTransfer(m)===_t&&(u.defines.SRGB_TRANSFER="");const w=Sx[p];w&&(u.defines[w]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=b.texture,S.setRenderTarget(y),S.render(d,f),y=null,o=!1},this.isCompositing=function(){return o},this.dispose=function(){r.depthTexture&&r.depthTexture.dispose(),r.dispose(),a.dispose(),l.dispose(),u.dispose()}}const dh=new en,Gl=new ks(1,1),fh=new Kf,hh=new z_,ph=new nh,rd=[],ad=[],od=new Float32Array(16),ld=new Float32Array(9),cd=new Float32Array(4);function Hs(t,e,n){const i=t[0];if(i<=0||i>0)return t;const s=e*n;let r=rd[s];if(r===void 0&&(r=new Float32Array(s),rd[s]=r),e!==0){i.toArray(r,0);for(let a=1,l=0;a!==e;++a)l+=n,t[a].toArray(r,l)}return r}function Ft(t,e){if(t.length!==e.length)return!1;for(let n=0,i=t.length;n<i;n++)if(t[n]!==e[n])return!1;return!0}function kt(t,e){for(let n=0,i=e.length;n<i;n++)t[n]=e[n]}function Wa(t,e){let n=ad[e];n===void 0&&(n=new Int32Array(e),ad[e]=n);for(let i=0;i!==e;++i)n[i]=t.allocateTextureUnit();return n}function Mx(t,e){const n=this.cache;n[0]!==e&&(t.uniform1f(this.addr,e),n[0]=e)}function Tx(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2f(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Ft(n,e))return;t.uniform2fv(this.addr,e),kt(n,e)}}function Ex(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3f(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else if(e.r!==void 0)(n[0]!==e.r||n[1]!==e.g||n[2]!==e.b)&&(t.uniform3f(this.addr,e.r,e.g,e.b),n[0]=e.r,n[1]=e.g,n[2]=e.b);else{if(Ft(n,e))return;t.uniform3fv(this.addr,e),kt(n,e)}}function wx(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4f(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Ft(n,e))return;t.uniform4fv(this.addr,e),kt(n,e)}}function Ax(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(Ft(n,e))return;t.uniformMatrix2fv(this.addr,!1,e),kt(n,e)}else{if(Ft(n,i))return;cd.set(i),t.uniformMatrix2fv(this.addr,!1,cd),kt(n,i)}}function Px(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(Ft(n,e))return;t.uniformMatrix3fv(this.addr,!1,e),kt(n,e)}else{if(Ft(n,i))return;ld.set(i),t.uniformMatrix3fv(this.addr,!1,ld),kt(n,i)}}function Cx(t,e){const n=this.cache,i=e.elements;if(i===void 0){if(Ft(n,e))return;t.uniformMatrix4fv(this.addr,!1,e),kt(n,e)}else{if(Ft(n,i))return;od.set(i),t.uniformMatrix4fv(this.addr,!1,od),kt(n,i)}}function Rx(t,e){const n=this.cache;n[0]!==e&&(t.uniform1i(this.addr,e),n[0]=e)}function Ix(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2i(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Ft(n,e))return;t.uniform2iv(this.addr,e),kt(n,e)}}function Lx(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3i(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(Ft(n,e))return;t.uniform3iv(this.addr,e),kt(n,e)}}function Dx(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4i(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Ft(n,e))return;t.uniform4iv(this.addr,e),kt(n,e)}}function Nx(t,e){const n=this.cache;n[0]!==e&&(t.uniform1ui(this.addr,e),n[0]=e)}function Ux(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(t.uniform2ui(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Ft(n,e))return;t.uniform2uiv(this.addr,e),kt(n,e)}}function Fx(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(t.uniform3ui(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(Ft(n,e))return;t.uniform3uiv(this.addr,e),kt(n,e)}}function kx(t,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(t.uniform4ui(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Ft(n,e))return;t.uniform4uiv(this.addr,e),kt(n,e)}}function Ox(t,e,n){const i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(t.uniform1i(this.addr,s),i[0]=s);let r;this.type===t.SAMPLER_2D_SHADOW?(Gl.compareFunction=n.isReversedDepthBuffer()?_c:gc,r=Gl):r=dh,n.setTexture2D(e||r,s)}function Bx(t,e,n){const i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(t.uniform1i(this.addr,s),i[0]=s),n.setTexture3D(e||hh,s)}function Vx(t,e,n){const i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(t.uniform1i(this.addr,s),i[0]=s),n.setTextureCube(e||ph,s)}function zx(t,e,n){const i=this.cache,s=n.allocateTextureUnit();i[0]!==s&&(t.uniform1i(this.addr,s),i[0]=s),n.setTexture2DArray(e||fh,s)}function Gx(t){switch(t){case 5126:return Mx;case 35664:return Tx;case 35665:return Ex;case 35666:return wx;case 35674:return Ax;case 35675:return Px;case 35676:return Cx;case 5124:case 35670:return Rx;case 35667:case 35671:return Ix;case 35668:case 35672:return Lx;case 35669:case 35673:return Dx;case 5125:return Nx;case 36294:return Ux;case 36295:return Fx;case 36296:return kx;case 35678:case 36198:case 36298:case 36306:case 35682:return Ox;case 35679:case 36299:case 36307:return Bx;case 35680:case 36300:case 36308:case 36293:return Vx;case 36289:case 36303:case 36311:case 36292:return zx}}function Hx(t,e){t.uniform1fv(this.addr,e)}function Wx(t,e){const n=Hs(e,this.size,2);t.uniform2fv(this.addr,n)}function qx(t,e){const n=Hs(e,this.size,3);t.uniform3fv(this.addr,n)}function Xx(t,e){const n=Hs(e,this.size,4);t.uniform4fv(this.addr,n)}function jx(t,e){const n=Hs(e,this.size,4);t.uniformMatrix2fv(this.addr,!1,n)}function Yx(t,e){const n=Hs(e,this.size,9);t.uniformMatrix3fv(this.addr,!1,n)}function Kx(t,e){const n=Hs(e,this.size,16);t.uniformMatrix4fv(this.addr,!1,n)}function Jx(t,e){t.uniform1iv(this.addr,e)}function Zx(t,e){t.uniform2iv(this.addr,e)}function Qx(t,e){t.uniform3iv(this.addr,e)}function $x(t,e){t.uniform4iv(this.addr,e)}function eS(t,e){t.uniform1uiv(this.addr,e)}function tS(t,e){t.uniform2uiv(this.addr,e)}function nS(t,e){t.uniform3uiv(this.addr,e)}function iS(t,e){t.uniform4uiv(this.addr,e)}function sS(t,e,n){const i=this.cache,s=e.length,r=Wa(n,s);Ft(i,r)||(t.uniform1iv(this.addr,r),kt(i,r));let a;this.type===t.SAMPLER_2D_SHADOW?a=Gl:a=dh;for(let l=0;l!==s;++l)n.setTexture2D(e[l]||a,r[l])}function rS(t,e,n){const i=this.cache,s=e.length,r=Wa(n,s);Ft(i,r)||(t.uniform1iv(this.addr,r),kt(i,r));for(let a=0;a!==s;++a)n.setTexture3D(e[a]||hh,r[a])}function aS(t,e,n){const i=this.cache,s=e.length,r=Wa(n,s);Ft(i,r)||(t.uniform1iv(this.addr,r),kt(i,r));for(let a=0;a!==s;++a)n.setTextureCube(e[a]||ph,r[a])}function oS(t,e,n){const i=this.cache,s=e.length,r=Wa(n,s);Ft(i,r)||(t.uniform1iv(this.addr,r),kt(i,r));for(let a=0;a!==s;++a)n.setTexture2DArray(e[a]||fh,r[a])}function lS(t){switch(t){case 5126:return Hx;case 35664:return Wx;case 35665:return qx;case 35666:return Xx;case 35674:return jx;case 35675:return Yx;case 35676:return Kx;case 5124:case 35670:return Jx;case 35667:case 35671:return Zx;case 35668:case 35672:return Qx;case 35669:case 35673:return $x;case 5125:return eS;case 36294:return tS;case 36295:return nS;case 36296:return iS;case 35678:case 36198:case 36298:case 36306:case 35682:return sS;case 35679:case 36299:case 36307:return rS;case 35680:case 36300:case 36308:case 36293:return aS;case 36289:case 36303:case 36311:case 36292:return oS}}class cS{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.setValue=Gx(n.type)}}class uS{constructor(e,n,i){this.id=e,this.addr=i,this.cache=[],this.type=n.type,this.size=n.size,this.setValue=lS(n.type)}}class dS{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,n,i){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const l=s[r];l.setValue(e,n[l.id],i)}}}const ko=/(\w+)(\])?(\[|\.)?/g;function ud(t,e){t.seq.push(e),t.map[e.id]=e}function fS(t,e,n){const i=t.name,s=i.length;for(ko.lastIndex=0;;){const r=ko.exec(i),a=ko.lastIndex;let l=r[1];const u=r[2]==="]",d=r[3];if(u&&(l=l|0),d===void 0||d==="["&&a+2===s){ud(n,d===void 0?new cS(l,t,e):new uS(l,t,e));break}else{let m=n.map[l];m===void 0&&(m=new dS(l),ud(n,m)),n=m}}}class pa{constructor(e,n){this.seq=[],this.map={};const i=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){const l=e.getActiveUniform(n,a),u=e.getUniformLocation(n,l.name);fS(l,u,this)}const s=[],r=[];for(const a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,n,i,s){const r=this.map[n];r!==void 0&&r.setValue(e,i,s)}setOptional(e,n,i){const s=n[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,n,i,s){for(let r=0,a=n.length;r!==a;++r){const l=n[r],u=i[l.id];u.needsUpdate!==!1&&l.setValue(e,u.value,s)}}static seqWithValue(e,n){const i=[];for(let s=0,r=e.length;s!==r;++s){const a=e[s];a.id in n&&i.push(a)}return i}}function dd(t,e,n){const i=t.createShader(e);return t.shaderSource(i,n),t.compileShader(i),i}const hS=37297;let pS=0;function mS(t,e){const n=t.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,n.length);for(let a=s;a<r;a++){const l=a+1;i.push(`${l===e?">":" "} ${l}: ${n[a]}`)}return i.join(`
`)}const fd=new et;function gS(t){lt._getMatrix(fd,lt.workingColorSpace,t);const e=`mat3( ${fd.elements.map(n=>n.toFixed(4))} )`;switch(lt.getTransfer(t)){case Ea:return[e,"LinearTransferOETF"];case _t:return[e,"sRGBTransferOETF"];default:return Je("WebGLProgram: Unsupported color space: ",t),[e,"LinearTransferOETF"]}}function hd(t,e,n){const i=t.getShaderParameter(e,t.COMPILE_STATUS),r=(t.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const l=parseInt(a[1]);return n.toUpperCase()+`

`+r+`

`+mS(t.getShaderSource(e),l)}else return r}function _S(t,e){const n=gS(e);return[`vec4 ${t}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,"}"].join(`
`)}const vS={[Df]:"Linear",[Nf]:"Reinhard",[Uf]:"Cineon",[Ff]:"ACESFilmic",[Of]:"AgX",[Bf]:"Neutral",[kf]:"Custom"};function yS(t,e){const n=vS[e];return n===void 0?(Je("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+t+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+t+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}const ia=new H;function xS(){lt.getLuminanceCoefficients(ia);const t=ia.x.toFixed(4),e=ia.y.toFixed(4),n=ia.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${t}, ${e}, ${n} );`,"	return dot( weights, rgb );","}"].join(`
`)}function SS(t){return[t.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",t.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(rr).join(`
`)}function bS(t){const e=[];for(const n in t){const i=t[n];i!==!1&&e.push("#define "+n+" "+i)}return e.join(`
`)}function MS(t,e){const n={},i=t.getProgramParameter(e,t.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){const r=t.getActiveAttrib(e,s),a=r.name;let l=1;r.type===t.FLOAT_MAT2&&(l=2),r.type===t.FLOAT_MAT3&&(l=3),r.type===t.FLOAT_MAT4&&(l=4),n[a]={type:r.type,location:t.getAttribLocation(e,a),locationSize:l}}return n}function rr(t){return t!==""}function pd(t,e){const n=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return t.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function md(t,e){return t.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const TS=/^[ \t]*#include +<([\w\d./]+)>/gm;function Hl(t){return t.replace(TS,wS)}const ES=new Map;function wS(t,e){let n=rt[e];if(n===void 0){const i=ES.get(e);if(i!==void 0)n=rt[i],Je('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return Hl(n)}const AS=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function gd(t){return t.replace(AS,PS)}function PS(t,e,n,i){let s="";for(let r=parseInt(e);r<parseInt(n);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function _d(t){let e=`precision ${t.precision} float;
	precision ${t.precision} int;
	precision ${t.precision} sampler2D;
	precision ${t.precision} samplerCube;
	precision ${t.precision} sampler3D;
	precision ${t.precision} sampler2DArray;
	precision ${t.precision} sampler2DShadow;
	precision ${t.precision} samplerCubeShadow;
	precision ${t.precision} sampler2DArrayShadow;
	precision ${t.precision} isampler2D;
	precision ${t.precision} isampler3D;
	precision ${t.precision} isamplerCube;
	precision ${t.precision} isampler2DArray;
	precision ${t.precision} usampler2D;
	precision ${t.precision} usampler3D;
	precision ${t.precision} usamplerCube;
	precision ${t.precision} usampler2DArray;
	`;return t.precision==="highp"?e+=`
#define HIGH_PRECISION`:t.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:t.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const CS={[ca]:"SHADOWMAP_TYPE_PCF",[ir]:"SHADOWMAP_TYPE_VSM"};function RS(t){return CS[t.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const IS={[is]:"ENVMAP_TYPE_CUBE",[Fs]:"ENVMAP_TYPE_CUBE",[Va]:"ENVMAP_TYPE_CUBE_UV"};function LS(t){return t.envMap===!1?"ENVMAP_TYPE_CUBE":IS[t.envMapMode]||"ENVMAP_TYPE_CUBE"}const DS={[Fs]:"ENVMAP_MODE_REFRACTION"};function NS(t){return t.envMap===!1?"ENVMAP_MODE_REFLECTION":DS[t.envMapMode]||"ENVMAP_MODE_REFLECTION"}const US={[cc]:"ENVMAP_BLENDING_MULTIPLY",[x_]:"ENVMAP_BLENDING_MIX",[S_]:"ENVMAP_BLENDING_ADD"};function FS(t){return t.envMap===!1?"ENVMAP_BLENDING_NONE":US[t.combine]||"ENVMAP_BLENDING_NONE"}function kS(t){const e=t.envMapCubeUVHeight;if(e===null)return null;const n=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,n),7*16)),texelHeight:i,maxMip:n}}function OS(t,e,n,i){const s=t.getContext(),r=n.defines;let a=n.vertexShader,l=n.fragmentShader;const u=RS(n),d=LS(n),f=NS(n),m=FS(n),p=kS(n),o=SS(n),h=bS(r),y=s.createProgram();let _,g,S=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(_=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,h].filter(rr).join(`
`),_.length>0&&(_+=`
`),g=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,h].filter(rr).join(`
`),g.length>0&&(g+=`
`)):(_=[_d(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,h,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+f:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexNormals?"#define HAS_NORMAL":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+u:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(rr).join(`
`),g=[_d(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,h,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+d:"",n.envMap?"#define "+f:"",n.envMap?"#define "+m:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor?"#define USE_COLOR":"",n.vertexAlphas||n.batchingColor?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+u:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==Hn?"#define TONE_MAPPING":"",n.toneMapping!==Hn?rt.tonemapping_pars_fragment:"",n.toneMapping!==Hn?yS("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",rt.colorspace_pars_fragment,_S("linearToOutputTexel",n.outputColorSpace),xS(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(rr).join(`
`)),a=Hl(a),a=pd(a,n),a=md(a,n),l=Hl(l),l=pd(l,n),l=md(l,n),a=gd(a),l=gd(l),n.isRawShaderMaterial!==!0&&(S=`#version 300 es
`,_=[o,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+_,g=["#define varying in",n.glslVersion===wu?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===wu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);const E=S+_+a,b=S+g+l,L=dd(s,s.VERTEX_SHADER,E),w=dd(s,s.FRAGMENT_SHADER,b);s.attachShader(y,L),s.attachShader(y,w),n.index0AttributeName!==void 0?s.bindAttribLocation(y,0,n.index0AttributeName):n.morphTargets===!0&&s.bindAttribLocation(y,0,"position"),s.linkProgram(y);function D(U){if(t.debug.checkShaderErrors){const W=s.getProgramInfoLog(y)||"",ee=s.getShaderInfoLog(L)||"",le=s.getShaderInfoLog(w)||"",V=W.trim(),q=ee.trim(),z=le.trim();let te=!0,de=!0;if(s.getProgramParameter(y,s.LINK_STATUS)===!1)if(te=!1,typeof t.debug.onShaderError=="function")t.debug.onShaderError(s,y,L,w);else{const Ee=hd(s,L,"vertex"),De=hd(s,w,"fragment");ht("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(y,s.VALIDATE_STATUS)+`

Material Name: `+U.name+`
Material Type: `+U.type+`

Program Info Log: `+V+`
`+Ee+`
`+De)}else V!==""?Je("WebGLProgram: Program Info Log:",V):(q===""||z==="")&&(de=!1);de&&(U.diagnostics={runnable:te,programLog:V,vertexShader:{log:q,prefix:_},fragmentShader:{log:z,prefix:g}})}s.deleteShader(L),s.deleteShader(w),x=new pa(s,y),R=MS(s,y)}let x;this.getUniforms=function(){return x===void 0&&D(this),x};let R;this.getAttributes=function(){return R===void 0&&D(this),R};let O=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return O===!1&&(O=s.getProgramParameter(y,hS)),O},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(y),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=pS++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=L,this.fragmentShader=w,this}let BS=0;class VS{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const n=e.vertexShader,i=e.fragmentShader,s=this._getShaderStage(n),r=this._getShaderStage(i),a=this._getShaderCacheForMaterial(e);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(e){const n=this.materialCache.get(e);for(const i of n)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const n=this.materialCache;let i=n.get(e);return i===void 0&&(i=new Set,n.set(e,i)),i}_getShaderStage(e){const n=this.shaderCache;let i=n.get(e);return i===void 0&&(i=new zS(e),n.set(e,i)),i}}class zS{constructor(e){this.id=BS++,this.code=e,this.usedTimes=0}}function GS(t){return t===ss||t===ba||t===Ma}function HS(t,e,n,i,s,r){const a=new Jf,l=new VS,u=new Set,d=[],f=new Map,m=i.logarithmicDepthBuffer;let p=i.precision;const o={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function h(x){return u.add(x),x===0?"uv":`uv${x}`}function y(x,R,O,U,W,ee){const le=U.fog,V=W.geometry,q=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?U.environment:null,z=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,te=e.get(x.envMap||q,z),de=te&&te.mapping===Va?te.image.height:null,Ee=o[x.type];x.precision!==null&&(p=i.getMaxPrecision(x.precision),p!==x.precision&&Je("WebGLProgram.getParameters:",x.precision,"not supported, using",p,"instead."));const De=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,Fe=De!==void 0?De.length:0;let ot=0;V.morphAttributes.position!==void 0&&(ot=1),V.morphAttributes.normal!==void 0&&(ot=2),V.morphAttributes.color!==void 0&&(ot=3);let mt,$e,oe,Ae;if(Ee){const tt=Bn[Ee];mt=tt.vertexShader,$e=tt.fragmentShader}else mt=x.vertexShader,$e=x.fragmentShader,l.update(x),oe=l.getVertexShaderID(x),Ae=l.getFragmentShaderID(x);const ye=t.getRenderTarget(),Xe=t.state.buffers.depth.getReversed(),Ye=W.isInstancedMesh===!0,Ke=W.isBatchedMesh===!0,I=!!x.map,N=!!x.matcap,j=!!te,ne=!!x.aoMap,J=!!x.lightMap,se=!!x.bumpMap,fe=!!x.normalMap,me=!!x.displacementMap,C=!!x.emissiveMap,re=!!x.metalnessMap,ve=!!x.roughnessMap,he=x.anisotropy>0,$=x.clearcoat>0,Ue=x.dispersion>0,T=x.iridescence>0,v=x.sheen>0,k=x.transmission>0,Q=he&&!!x.anisotropyMap,ce=$&&!!x.clearcoatMap,pe=$&&!!x.clearcoatNormalMap,ge=$&&!!x.clearcoatRoughnessMap,Z=T&&!!x.iridescenceMap,ae=T&&!!x.iridescenceThicknessMap,xe=v&&!!x.sheenColorMap,Pe=v&&!!x.sheenRoughnessMap,Se=!!x.specularMap,_e=!!x.specularColorMap,Qe=!!x.specularIntensityMap,st=k&&!!x.transmissionMap,pt=k&&!!x.thicknessMap,F=!!x.gradientMap,be=!!x.alphaMap,ie=x.alphaTest>0,Ne=!!x.alphaHash,Te=!!x.extensions;let ue=Hn;x.toneMapped&&(ye===null||ye.isXRRenderTarget===!0)&&(ue=t.toneMapping);const He={shaderID:Ee,shaderType:x.type,shaderName:x.name,vertexShader:mt,fragmentShader:$e,defines:x.defines,customVertexShaderID:oe,customFragmentShaderID:Ae,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:p,batching:Ke,batchingColor:Ke&&W._colorsTexture!==null,instancing:Ye,instancingColor:Ye&&W.instanceColor!==null,instancingMorph:Ye&&W.morphTexture!==null,outputColorSpace:ye===null?t.outputColorSpace:ye.isXRRenderTarget===!0?ye.texture.colorSpace:lt.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:I,matcap:N,envMap:j,envMapMode:j&&te.mapping,envMapCubeUVHeight:de,aoMap:ne,lightMap:J,bumpMap:se,normalMap:fe,displacementMap:me,emissiveMap:C,normalMapObjectSpace:fe&&x.normalMapType===T_,normalMapTangentSpace:fe&&x.normalMapType===Ol,packedNormalMap:fe&&x.normalMapType===Ol&&GS(x.normalMap.format),metalnessMap:re,roughnessMap:ve,anisotropy:he,anisotropyMap:Q,clearcoat:$,clearcoatMap:ce,clearcoatNormalMap:pe,clearcoatRoughnessMap:ge,dispersion:Ue,iridescence:T,iridescenceMap:Z,iridescenceThicknessMap:ae,sheen:v,sheenColorMap:xe,sheenRoughnessMap:Pe,specularMap:Se,specularColorMap:_e,specularIntensityMap:Qe,transmission:k,transmissionMap:st,thicknessMap:pt,gradientMap:F,opaque:x.transparent===!1&&x.blending===Rs&&x.alphaToCoverage===!1,alphaMap:be,alphaTest:ie,alphaHash:Ne,combine:x.combine,mapUv:I&&h(x.map.channel),aoMapUv:ne&&h(x.aoMap.channel),lightMapUv:J&&h(x.lightMap.channel),bumpMapUv:se&&h(x.bumpMap.channel),normalMapUv:fe&&h(x.normalMap.channel),displacementMapUv:me&&h(x.displacementMap.channel),emissiveMapUv:C&&h(x.emissiveMap.channel),metalnessMapUv:re&&h(x.metalnessMap.channel),roughnessMapUv:ve&&h(x.roughnessMap.channel),anisotropyMapUv:Q&&h(x.anisotropyMap.channel),clearcoatMapUv:ce&&h(x.clearcoatMap.channel),clearcoatNormalMapUv:pe&&h(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ge&&h(x.clearcoatRoughnessMap.channel),iridescenceMapUv:Z&&h(x.iridescenceMap.channel),iridescenceThicknessMapUv:ae&&h(x.iridescenceThicknessMap.channel),sheenColorMapUv:xe&&h(x.sheenColorMap.channel),sheenRoughnessMapUv:Pe&&h(x.sheenRoughnessMap.channel),specularMapUv:Se&&h(x.specularMap.channel),specularColorMapUv:_e&&h(x.specularColorMap.channel),specularIntensityMapUv:Qe&&h(x.specularIntensityMap.channel),transmissionMapUv:st&&h(x.transmissionMap.channel),thicknessMapUv:pt&&h(x.thicknessMap.channel),alphaMapUv:be&&h(x.alphaMap.channel),vertexTangents:!!V.attributes.tangent&&(fe||he),vertexNormals:!!V.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,pointsUvs:W.isPoints===!0&&!!V.attributes.uv&&(I||be),fog:!!le,useFog:x.fog===!0,fogExp2:!!le&&le.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||V.attributes.normal===void 0&&fe===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:m,reversedDepthBuffer:Xe,skinning:W.isSkinnedMesh===!0,morphTargets:V.morphAttributes.position!==void 0,morphNormals:V.morphAttributes.normal!==void 0,morphColors:V.morphAttributes.color!==void 0,morphTargetsCount:Fe,morphTextureStride:ot,numDirLights:R.directional.length,numPointLights:R.point.length,numSpotLights:R.spot.length,numSpotLightMaps:R.spotLightMap.length,numRectAreaLights:R.rectArea.length,numHemiLights:R.hemi.length,numDirLightShadows:R.directionalShadowMap.length,numPointLightShadows:R.pointShadowMap.length,numSpotLightShadows:R.spotShadowMap.length,numSpotLightShadowsWithMaps:R.numSpotLightShadowsWithMaps,numLightProbes:R.numLightProbes,numLightProbeGrids:ee.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:x.dithering,shadowMapEnabled:t.shadowMap.enabled&&O.length>0,shadowMapType:t.shadowMap.type,toneMapping:ue,decodeVideoTexture:I&&x.map.isVideoTexture===!0&&lt.getTransfer(x.map.colorSpace)===_t,decodeVideoTextureEmissive:C&&x.emissiveMap.isVideoTexture===!0&&lt.getTransfer(x.emissiveMap.colorSpace)===_t,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===ri,flipSided:x.side===an,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:Te&&x.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Te&&x.extensions.multiDraw===!0||Ke)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return He.vertexUv1s=u.has(1),He.vertexUv2s=u.has(2),He.vertexUv3s=u.has(3),u.clear(),He}function _(x){const R=[];if(x.shaderID?R.push(x.shaderID):(R.push(x.customVertexShaderID),R.push(x.customFragmentShaderID)),x.defines!==void 0)for(const O in x.defines)R.push(O),R.push(x.defines[O]);return x.isRawShaderMaterial===!1&&(g(R,x),S(R,x),R.push(t.outputColorSpace)),R.push(x.customProgramCacheKey),R.join()}function g(x,R){x.push(R.precision),x.push(R.outputColorSpace),x.push(R.envMapMode),x.push(R.envMapCubeUVHeight),x.push(R.mapUv),x.push(R.alphaMapUv),x.push(R.lightMapUv),x.push(R.aoMapUv),x.push(R.bumpMapUv),x.push(R.normalMapUv),x.push(R.displacementMapUv),x.push(R.emissiveMapUv),x.push(R.metalnessMapUv),x.push(R.roughnessMapUv),x.push(R.anisotropyMapUv),x.push(R.clearcoatMapUv),x.push(R.clearcoatNormalMapUv),x.push(R.clearcoatRoughnessMapUv),x.push(R.iridescenceMapUv),x.push(R.iridescenceThicknessMapUv),x.push(R.sheenColorMapUv),x.push(R.sheenRoughnessMapUv),x.push(R.specularMapUv),x.push(R.specularColorMapUv),x.push(R.specularIntensityMapUv),x.push(R.transmissionMapUv),x.push(R.thicknessMapUv),x.push(R.combine),x.push(R.fogExp2),x.push(R.sizeAttenuation),x.push(R.morphTargetsCount),x.push(R.morphAttributeCount),x.push(R.numDirLights),x.push(R.numPointLights),x.push(R.numSpotLights),x.push(R.numSpotLightMaps),x.push(R.numHemiLights),x.push(R.numRectAreaLights),x.push(R.numDirLightShadows),x.push(R.numPointLightShadows),x.push(R.numSpotLightShadows),x.push(R.numSpotLightShadowsWithMaps),x.push(R.numLightProbes),x.push(R.shadowMapType),x.push(R.toneMapping),x.push(R.numClippingPlanes),x.push(R.numClipIntersection),x.push(R.depthPacking)}function S(x,R){a.disableAll(),R.instancing&&a.enable(0),R.instancingColor&&a.enable(1),R.instancingMorph&&a.enable(2),R.matcap&&a.enable(3),R.envMap&&a.enable(4),R.normalMapObjectSpace&&a.enable(5),R.normalMapTangentSpace&&a.enable(6),R.clearcoat&&a.enable(7),R.iridescence&&a.enable(8),R.alphaTest&&a.enable(9),R.vertexColors&&a.enable(10),R.vertexAlphas&&a.enable(11),R.vertexUv1s&&a.enable(12),R.vertexUv2s&&a.enable(13),R.vertexUv3s&&a.enable(14),R.vertexTangents&&a.enable(15),R.anisotropy&&a.enable(16),R.alphaHash&&a.enable(17),R.batching&&a.enable(18),R.dispersion&&a.enable(19),R.batchingColor&&a.enable(20),R.gradientMap&&a.enable(21),R.packedNormalMap&&a.enable(22),R.vertexNormals&&a.enable(23),x.push(a.mask),a.disableAll(),R.fog&&a.enable(0),R.useFog&&a.enable(1),R.flatShading&&a.enable(2),R.logarithmicDepthBuffer&&a.enable(3),R.reversedDepthBuffer&&a.enable(4),R.skinning&&a.enable(5),R.morphTargets&&a.enable(6),R.morphNormals&&a.enable(7),R.morphColors&&a.enable(8),R.premultipliedAlpha&&a.enable(9),R.shadowMapEnabled&&a.enable(10),R.doubleSided&&a.enable(11),R.flipSided&&a.enable(12),R.useDepthPacking&&a.enable(13),R.dithering&&a.enable(14),R.transmission&&a.enable(15),R.sheen&&a.enable(16),R.opaque&&a.enable(17),R.pointsUvs&&a.enable(18),R.decodeVideoTexture&&a.enable(19),R.decodeVideoTextureEmissive&&a.enable(20),R.alphaToCoverage&&a.enable(21),R.numLightProbeGrids>0&&a.enable(22),x.push(a.mask)}function E(x){const R=o[x.type];let O;if(R){const U=Bn[R];O=l0.clone(U.uniforms)}else O=x.uniforms;return O}function b(x,R){let O=f.get(R);return O!==void 0?++O.usedTimes:(O=new OS(t,R,x,s),d.push(O),f.set(R,O)),O}function L(x){if(--x.usedTimes===0){const R=d.indexOf(x);d[R]=d[d.length-1],d.pop(),f.delete(x.cacheKey),x.destroy()}}function w(x){l.remove(x)}function D(){l.dispose()}return{getParameters:y,getProgramCacheKey:_,getUniforms:E,acquireProgram:b,releaseProgram:L,releaseShaderCache:w,programs:d,dispose:D}}function WS(){let t=new WeakMap;function e(a){return t.has(a)}function n(a){let l=t.get(a);return l===void 0&&(l={},t.set(a,l)),l}function i(a){t.delete(a)}function s(a,l,u){t.get(a)[l]=u}function r(){t=new WeakMap}return{has:e,get:n,remove:i,update:s,dispose:r}}function qS(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.material.id!==e.material.id?t.material.id-e.material.id:t.materialVariant!==e.materialVariant?t.materialVariant-e.materialVariant:t.z!==e.z?t.z-e.z:t.id-e.id}function vd(t,e){return t.groupOrder!==e.groupOrder?t.groupOrder-e.groupOrder:t.renderOrder!==e.renderOrder?t.renderOrder-e.renderOrder:t.z!==e.z?e.z-t.z:t.id-e.id}function yd(){const t=[];let e=0;const n=[],i=[],s=[];function r(){e=0,n.length=0,i.length=0,s.length=0}function a(p){let o=0;return p.isInstancedMesh&&(o+=2),p.isSkinnedMesh&&(o+=1),o}function l(p,o,h,y,_,g){let S=t[e];return S===void 0?(S={id:p.id,object:p,geometry:o,material:h,materialVariant:a(p),groupOrder:y,renderOrder:p.renderOrder,z:_,group:g},t[e]=S):(S.id=p.id,S.object=p,S.geometry=o,S.material=h,S.materialVariant=a(p),S.groupOrder=y,S.renderOrder=p.renderOrder,S.z=_,S.group=g),e++,S}function u(p,o,h,y,_,g){const S=l(p,o,h,y,_,g);h.transmission>0?i.push(S):h.transparent===!0?s.push(S):n.push(S)}function d(p,o,h,y,_,g){const S=l(p,o,h,y,_,g);h.transmission>0?i.unshift(S):h.transparent===!0?s.unshift(S):n.unshift(S)}function f(p,o){n.length>1&&n.sort(p||qS),i.length>1&&i.sort(o||vd),s.length>1&&s.sort(o||vd)}function m(){for(let p=e,o=t.length;p<o;p++){const h=t[p];if(h.id===null)break;h.id=null,h.object=null,h.geometry=null,h.material=null,h.group=null}}return{opaque:n,transmissive:i,transparent:s,init:r,push:u,unshift:d,finish:m,sort:f}}function XS(){let t=new WeakMap;function e(i,s){const r=t.get(i);let a;return r===void 0?(a=new yd,t.set(i,[a])):s>=r.length?(a=new yd,r.push(a)):a=r[s],a}function n(){t=new WeakMap}return{get:e,dispose:n}}function jS(){const t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"DirectionalLight":n={direction:new H,color:new ut};break;case"SpotLight":n={position:new H,direction:new H,color:new ut,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new H,color:new ut,distance:0,decay:0};break;case"HemisphereLight":n={direction:new H,skyColor:new ut,groundColor:new ut};break;case"RectAreaLight":n={color:new ut,position:new H,halfWidth:new H,halfHeight:new H};break}return t[e.id]=n,n}}}function YS(){const t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new dt};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new dt};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new dt,shadowCameraNear:1,shadowCameraFar:1e3};break}return t[e.id]=n,n}}}let KS=0;function JS(t,e){return(e.castShadow?2:0)-(t.castShadow?2:0)+(e.map?1:0)-(t.map?1:0)}function ZS(t){const e=new jS,n=YS(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let d=0;d<9;d++)i.probe.push(new H);const s=new H,r=new Rt,a=new Rt;function l(d){let f=0,m=0,p=0;for(let R=0;R<9;R++)i.probe[R].set(0,0,0);let o=0,h=0,y=0,_=0,g=0,S=0,E=0,b=0,L=0,w=0,D=0;d.sort(JS);for(let R=0,O=d.length;R<O;R++){const U=d[R],W=U.color,ee=U.intensity,le=U.distance;let V=null;if(U.shadow&&U.shadow.map&&(U.shadow.map.texture.format===ss?V=U.shadow.map.texture:V=U.shadow.map.depthTexture||U.shadow.map.texture),U.isAmbientLight)f+=W.r*ee,m+=W.g*ee,p+=W.b*ee;else if(U.isLightProbe){for(let q=0;q<9;q++)i.probe[q].addScaledVector(U.sh.coefficients[q],ee);D++}else if(U.isDirectionalLight){const q=e.get(U);if(q.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){const z=U.shadow,te=n.get(U);te.shadowIntensity=z.intensity,te.shadowBias=z.bias,te.shadowNormalBias=z.normalBias,te.shadowRadius=z.radius,te.shadowMapSize=z.mapSize,i.directionalShadow[o]=te,i.directionalShadowMap[o]=V,i.directionalShadowMatrix[o]=U.shadow.matrix,S++}i.directional[o]=q,o++}else if(U.isSpotLight){const q=e.get(U);q.position.setFromMatrixPosition(U.matrixWorld),q.color.copy(W).multiplyScalar(ee),q.distance=le,q.coneCos=Math.cos(U.angle),q.penumbraCos=Math.cos(U.angle*(1-U.penumbra)),q.decay=U.decay,i.spot[y]=q;const z=U.shadow;if(U.map&&(i.spotLightMap[L]=U.map,L++,z.updateMatrices(U),U.castShadow&&w++),i.spotLightMatrix[y]=z.matrix,U.castShadow){const te=n.get(U);te.shadowIntensity=z.intensity,te.shadowBias=z.bias,te.shadowNormalBias=z.normalBias,te.shadowRadius=z.radius,te.shadowMapSize=z.mapSize,i.spotShadow[y]=te,i.spotShadowMap[y]=V,b++}y++}else if(U.isRectAreaLight){const q=e.get(U);q.color.copy(W).multiplyScalar(ee),q.halfWidth.set(U.width*.5,0,0),q.halfHeight.set(0,U.height*.5,0),i.rectArea[_]=q,_++}else if(U.isPointLight){const q=e.get(U);if(q.color.copy(U.color).multiplyScalar(U.intensity),q.distance=U.distance,q.decay=U.decay,U.castShadow){const z=U.shadow,te=n.get(U);te.shadowIntensity=z.intensity,te.shadowBias=z.bias,te.shadowNormalBias=z.normalBias,te.shadowRadius=z.radius,te.shadowMapSize=z.mapSize,te.shadowCameraNear=z.camera.near,te.shadowCameraFar=z.camera.far,i.pointShadow[h]=te,i.pointShadowMap[h]=V,i.pointShadowMatrix[h]=U.shadow.matrix,E++}i.point[h]=q,h++}else if(U.isHemisphereLight){const q=e.get(U);q.skyColor.copy(U.color).multiplyScalar(ee),q.groundColor.copy(U.groundColor).multiplyScalar(ee),i.hemi[g]=q,g++}}_>0&&(t.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=Ce.LTC_FLOAT_1,i.rectAreaLTC2=Ce.LTC_FLOAT_2):(i.rectAreaLTC1=Ce.LTC_HALF_1,i.rectAreaLTC2=Ce.LTC_HALF_2)),i.ambient[0]=f,i.ambient[1]=m,i.ambient[2]=p;const x=i.hash;(x.directionalLength!==o||x.pointLength!==h||x.spotLength!==y||x.rectAreaLength!==_||x.hemiLength!==g||x.numDirectionalShadows!==S||x.numPointShadows!==E||x.numSpotShadows!==b||x.numSpotMaps!==L||x.numLightProbes!==D)&&(i.directional.length=o,i.spot.length=y,i.rectArea.length=_,i.point.length=h,i.hemi.length=g,i.directionalShadow.length=S,i.directionalShadowMap.length=S,i.pointShadow.length=E,i.pointShadowMap.length=E,i.spotShadow.length=b,i.spotShadowMap.length=b,i.directionalShadowMatrix.length=S,i.pointShadowMatrix.length=E,i.spotLightMatrix.length=b+L-w,i.spotLightMap.length=L,i.numSpotLightShadowsWithMaps=w,i.numLightProbes=D,x.directionalLength=o,x.pointLength=h,x.spotLength=y,x.rectAreaLength=_,x.hemiLength=g,x.numDirectionalShadows=S,x.numPointShadows=E,x.numSpotShadows=b,x.numSpotMaps=L,x.numLightProbes=D,i.version=KS++)}function u(d,f){let m=0,p=0,o=0,h=0,y=0;const _=f.matrixWorldInverse;for(let g=0,S=d.length;g<S;g++){const E=d[g];if(E.isDirectionalLight){const b=i.directional[m];b.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(_),m++}else if(E.isSpotLight){const b=i.spot[o];b.position.setFromMatrixPosition(E.matrixWorld),b.position.applyMatrix4(_),b.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(_),o++}else if(E.isRectAreaLight){const b=i.rectArea[h];b.position.setFromMatrixPosition(E.matrixWorld),b.position.applyMatrix4(_),a.identity(),r.copy(E.matrixWorld),r.premultiply(_),a.extractRotation(r),b.halfWidth.set(E.width*.5,0,0),b.halfHeight.set(0,E.height*.5,0),b.halfWidth.applyMatrix4(a),b.halfHeight.applyMatrix4(a),h++}else if(E.isPointLight){const b=i.point[p];b.position.setFromMatrixPosition(E.matrixWorld),b.position.applyMatrix4(_),p++}else if(E.isHemisphereLight){const b=i.hemi[y];b.direction.setFromMatrixPosition(E.matrixWorld),b.direction.transformDirection(_),y++}}}return{setup:l,setupView:u,state:i}}function xd(t){const e=new ZS(t),n=[],i=[],s=[];function r(p){m.camera=p,n.length=0,i.length=0,s.length=0}function a(p){n.push(p)}function l(p){i.push(p)}function u(p){s.push(p)}function d(){e.setup(n)}function f(p){e.setupView(n,p)}const m={lightsArray:n,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:m,setupLights:d,setupLightsView:f,pushLight:a,pushShadow:l,pushLightProbeGrid:u}}function QS(t){let e=new WeakMap;function n(s,r=0){const a=e.get(s);let l;return a===void 0?(l=new xd(t),e.set(s,[l])):r>=a.length?(l=new xd(t),a.push(l)):l=a[r],l}function i(){e=new WeakMap}return{get:n,dispose:i}}const $S=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,eb=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,tb=[new H(1,0,0),new H(-1,0,0),new H(0,1,0),new H(0,-1,0),new H(0,0,1),new H(0,0,-1)],nb=[new H(0,-1,0),new H(0,-1,0),new H(0,0,1),new H(0,0,-1),new H(0,-1,0),new H(0,-1,0)],Sd=new Rt,er=new H,Oo=new H;function ib(t,e,n){let i=new yc;const s=new dt,r=new dt,a=new Ct,l=new h0,u=new p0,d={},f=n.maxTextureSize,m={[Ni]:an,[an]:Ni,[ri]:ri},p=new jn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new dt},radius:{value:4}},vertexShader:$S,fragmentShader:eb}),o=p.clone();o.defines.HORIZONTAL_PASS=1;const h=new on;h.setAttribute("position",new Rn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const y=new _n(h,p),_=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ca;let g=this.type;this.render=function(w,D,x){if(_.enabled===!1||_.autoUpdate===!1&&_.needsUpdate===!1||w.length===0)return;this.type===t_&&(Je("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=ca);const R=t.getRenderTarget(),O=t.getActiveCubeFace(),U=t.getActiveMipmapLevel(),W=t.state;W.setBlending(oi),W.buffers.depth.getReversed()===!0?W.buffers.color.setClear(0,0,0,0):W.buffers.color.setClear(1,1,1,1),W.buffers.depth.setTest(!0),W.setScissorTest(!1);const ee=g!==this.type;ee&&D.traverse(function(le){le.material&&(Array.isArray(le.material)?le.material.forEach(V=>V.needsUpdate=!0):le.material.needsUpdate=!0)});for(let le=0,V=w.length;le<V;le++){const q=w[le],z=q.shadow;if(z===void 0){Je("WebGLShadowMap:",q,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;s.copy(z.mapSize);const te=z.getFrameExtents();s.multiply(te),r.copy(z.mapSize),(s.x>f||s.y>f)&&(s.x>f&&(r.x=Math.floor(f/te.x),s.x=r.x*te.x,z.mapSize.x=r.x),s.y>f&&(r.y=Math.floor(f/te.y),s.y=r.y*te.y,z.mapSize.y=r.y));const de=t.state.buffers.depth.getReversed();if(z.camera._reversedDepth=de,z.map===null||ee===!0){if(z.map!==null&&(z.map.depthTexture!==null&&(z.map.depthTexture.dispose(),z.map.depthTexture=null),z.map.dispose()),this.type===ir){if(q.isPointLight){Je("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}z.map=new Wn(s.x,s.y,{format:ss,type:hi,minFilter:Kt,magFilter:Kt,generateMipmaps:!1}),z.map.texture.name=q.name+".shadowMap",z.map.depthTexture=new ks(s.x,s.y,Vn),z.map.depthTexture.name=q.name+".shadowMapDepth",z.map.depthTexture.format=pi,z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Gt,z.map.depthTexture.magFilter=Gt}else q.isPointLight?(z.map=new uh(s.x),z.map.depthTexture=new a0(s.x,Xn)):(z.map=new Wn(s.x,s.y),z.map.depthTexture=new ks(s.x,s.y,Xn)),z.map.depthTexture.name=q.name+".shadowMap",z.map.depthTexture.format=pi,this.type===ca?(z.map.depthTexture.compareFunction=de?_c:gc,z.map.depthTexture.minFilter=Kt,z.map.depthTexture.magFilter=Kt):(z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Gt,z.map.depthTexture.magFilter=Gt);z.camera.updateProjectionMatrix()}const Ee=z.map.isWebGLCubeRenderTarget?6:1;for(let De=0;De<Ee;De++){if(z.map.isWebGLCubeRenderTarget)t.setRenderTarget(z.map,De),t.clear();else{De===0&&(t.setRenderTarget(z.map),t.clear());const Fe=z.getViewport(De);a.set(r.x*Fe.x,r.y*Fe.y,r.x*Fe.z,r.y*Fe.w),W.viewport(a)}if(q.isPointLight){const Fe=z.camera,ot=z.matrix,mt=q.distance||Fe.far;mt!==Fe.far&&(Fe.far=mt,Fe.updateProjectionMatrix()),er.setFromMatrixPosition(q.matrixWorld),Fe.position.copy(er),Oo.copy(Fe.position),Oo.add(tb[De]),Fe.up.copy(nb[De]),Fe.lookAt(Oo),Fe.updateMatrixWorld(),ot.makeTranslation(-er.x,-er.y,-er.z),Sd.multiplyMatrices(Fe.projectionMatrix,Fe.matrixWorldInverse),z._frustum.setFromProjectionMatrix(Sd,Fe.coordinateSystem,Fe.reversedDepth)}else z.updateMatrices(q);i=z.getFrustum(),b(D,x,z.camera,q,this.type)}z.isPointLightShadow!==!0&&this.type===ir&&S(z,x),z.needsUpdate=!1}g=this.type,_.needsUpdate=!1,t.setRenderTarget(R,O,U)};function S(w,D){const x=e.update(y);p.defines.VSM_SAMPLES!==w.blurSamples&&(p.defines.VSM_SAMPLES=w.blurSamples,o.defines.VSM_SAMPLES=w.blurSamples,p.needsUpdate=!0,o.needsUpdate=!0),w.mapPass===null&&(w.mapPass=new Wn(s.x,s.y,{format:ss,type:hi})),p.uniforms.shadow_pass.value=w.map.depthTexture,p.uniforms.resolution.value=w.mapSize,p.uniforms.radius.value=w.radius,t.setRenderTarget(w.mapPass),t.clear(),t.renderBufferDirect(D,null,x,p,y,null),o.uniforms.shadow_pass.value=w.mapPass.texture,o.uniforms.resolution.value=w.mapSize,o.uniforms.radius.value=w.radius,t.setRenderTarget(w.map),t.clear(),t.renderBufferDirect(D,null,x,o,y,null)}function E(w,D,x,R){let O=null;const U=x.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(U!==void 0)O=U;else if(O=x.isPointLight===!0?u:l,t.localClippingEnabled&&D.clipShadows===!0&&Array.isArray(D.clippingPlanes)&&D.clippingPlanes.length!==0||D.displacementMap&&D.displacementScale!==0||D.alphaMap&&D.alphaTest>0||D.map&&D.alphaTest>0||D.alphaToCoverage===!0){const W=O.uuid,ee=D.uuid;let le=d[W];le===void 0&&(le={},d[W]=le);let V=le[ee];V===void 0&&(V=O.clone(),le[ee]=V,D.addEventListener("dispose",L)),O=V}if(O.visible=D.visible,O.wireframe=D.wireframe,R===ir?O.side=D.shadowSide!==null?D.shadowSide:D.side:O.side=D.shadowSide!==null?D.shadowSide:m[D.side],O.alphaMap=D.alphaMap,O.alphaTest=D.alphaToCoverage===!0?.5:D.alphaTest,O.map=D.map,O.clipShadows=D.clipShadows,O.clippingPlanes=D.clippingPlanes,O.clipIntersection=D.clipIntersection,O.displacementMap=D.displacementMap,O.displacementScale=D.displacementScale,O.displacementBias=D.displacementBias,O.wireframeLinewidth=D.wireframeLinewidth,O.linewidth=D.linewidth,x.isPointLight===!0&&O.isMeshDistanceMaterial===!0){const W=t.properties.get(O);W.light=x}return O}function b(w,D,x,R,O){if(w.visible===!1)return;if(w.layers.test(D.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&O===ir)&&(!w.frustumCulled||i.intersectsObject(w))){w.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,w.matrixWorld);const ee=e.update(w),le=w.material;if(Array.isArray(le)){const V=ee.groups;for(let q=0,z=V.length;q<z;q++){const te=V[q],de=le[te.materialIndex];if(de&&de.visible){const Ee=E(w,de,R,O);w.onBeforeShadow(t,w,D,x,ee,Ee,te),t.renderBufferDirect(x,null,ee,Ee,w,te),w.onAfterShadow(t,w,D,x,ee,Ee,te)}}}else if(le.visible){const V=E(w,le,R,O);w.onBeforeShadow(t,w,D,x,ee,V,null),t.renderBufferDirect(x,null,ee,V,w,null),w.onAfterShadow(t,w,D,x,ee,V,null)}}const W=w.children;for(let ee=0,le=W.length;ee<le;ee++)b(W[ee],D,x,R,O)}function L(w){w.target.removeEventListener("dispose",L);for(const x in d){const R=d[x],O=w.target.uuid;O in R&&(R[O].dispose(),delete R[O])}}}function sb(t,e){function n(){let F=!1;const be=new Ct;let ie=null;const Ne=new Ct(0,0,0,0);return{setMask:function(Te){ie!==Te&&!F&&(t.colorMask(Te,Te,Te,Te),ie=Te)},setLocked:function(Te){F=Te},setClear:function(Te,ue,He,tt,It){It===!0&&(Te*=tt,ue*=tt,He*=tt),be.set(Te,ue,He,tt),Ne.equals(be)===!1&&(t.clearColor(Te,ue,He,tt),Ne.copy(be))},reset:function(){F=!1,ie=null,Ne.set(-1,0,0,0)}}}function i(){let F=!1,be=!1,ie=null,Ne=null,Te=null;return{setReversed:function(ue){if(be!==ue){const He=e.get("EXT_clip_control");ue?He.clipControlEXT(He.LOWER_LEFT_EXT,He.ZERO_TO_ONE_EXT):He.clipControlEXT(He.LOWER_LEFT_EXT,He.NEGATIVE_ONE_TO_ONE_EXT),be=ue;const tt=Te;Te=null,this.setClear(tt)}},getReversed:function(){return be},setTest:function(ue){ue?ye(t.DEPTH_TEST):Xe(t.DEPTH_TEST)},setMask:function(ue){ie!==ue&&!F&&(t.depthMask(ue),ie=ue)},setFunc:function(ue){if(be&&(ue=N_[ue]),Ne!==ue){switch(ue){case $o:t.depthFunc(t.NEVER);break;case el:t.depthFunc(t.ALWAYS);break;case tl:t.depthFunc(t.LESS);break;case Us:t.depthFunc(t.LEQUAL);break;case nl:t.depthFunc(t.EQUAL);break;case il:t.depthFunc(t.GEQUAL);break;case sl:t.depthFunc(t.GREATER);break;case rl:t.depthFunc(t.NOTEQUAL);break;default:t.depthFunc(t.LEQUAL)}Ne=ue}},setLocked:function(ue){F=ue},setClear:function(ue){Te!==ue&&(Te=ue,be&&(ue=1-ue),t.clearDepth(ue))},reset:function(){F=!1,ie=null,Ne=null,Te=null,be=!1}}}function s(){let F=!1,be=null,ie=null,Ne=null,Te=null,ue=null,He=null,tt=null,It=null;return{setTest:function(vt){F||(vt?ye(t.STENCIL_TEST):Xe(t.STENCIL_TEST))},setMask:function(vt){be!==vt&&!F&&(t.stencilMask(vt),be=vt)},setFunc:function(vt,Yn,Ln){(ie!==vt||Ne!==Yn||Te!==Ln)&&(t.stencilFunc(vt,Yn,Ln),ie=vt,Ne=Yn,Te=Ln)},setOp:function(vt,Yn,Ln){(ue!==vt||He!==Yn||tt!==Ln)&&(t.stencilOp(vt,Yn,Ln),ue=vt,He=Yn,tt=Ln)},setLocked:function(vt){F=vt},setClear:function(vt){It!==vt&&(t.clearStencil(vt),It=vt)},reset:function(){F=!1,be=null,ie=null,Ne=null,Te=null,ue=null,He=null,tt=null,It=null}}}const r=new n,a=new i,l=new s,u=new WeakMap,d=new WeakMap;let f={},m={},p={},o=new WeakMap,h=[],y=null,_=!1,g=null,S=null,E=null,b=null,L=null,w=null,D=null,x=new ut(0,0,0),R=0,O=!1,U=null,W=null,ee=null,le=null,V=null;const q=t.getParameter(t.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let z=!1,te=0;const de=t.getParameter(t.VERSION);de.indexOf("WebGL")!==-1?(te=parseFloat(/^WebGL (\d)/.exec(de)[1]),z=te>=1):de.indexOf("OpenGL ES")!==-1&&(te=parseFloat(/^OpenGL ES (\d)/.exec(de)[1]),z=te>=2);let Ee=null,De={};const Fe=t.getParameter(t.SCISSOR_BOX),ot=t.getParameter(t.VIEWPORT),mt=new Ct().fromArray(Fe),$e=new Ct().fromArray(ot);function oe(F,be,ie,Ne){const Te=new Uint8Array(4),ue=t.createTexture();t.bindTexture(F,ue),t.texParameteri(F,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(F,t.TEXTURE_MAG_FILTER,t.NEAREST);for(let He=0;He<ie;He++)F===t.TEXTURE_3D||F===t.TEXTURE_2D_ARRAY?t.texImage3D(be,0,t.RGBA,1,1,Ne,0,t.RGBA,t.UNSIGNED_BYTE,Te):t.texImage2D(be+He,0,t.RGBA,1,1,0,t.RGBA,t.UNSIGNED_BYTE,Te);return ue}const Ae={};Ae[t.TEXTURE_2D]=oe(t.TEXTURE_2D,t.TEXTURE_2D,1),Ae[t.TEXTURE_CUBE_MAP]=oe(t.TEXTURE_CUBE_MAP,t.TEXTURE_CUBE_MAP_POSITIVE_X,6),Ae[t.TEXTURE_2D_ARRAY]=oe(t.TEXTURE_2D_ARRAY,t.TEXTURE_2D_ARRAY,1,1),Ae[t.TEXTURE_3D]=oe(t.TEXTURE_3D,t.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),l.setClear(0),ye(t.DEPTH_TEST),a.setFunc(Us),se(!1),fe(Su),ye(t.CULL_FACE),ne(oi);function ye(F){f[F]!==!0&&(t.enable(F),f[F]=!0)}function Xe(F){f[F]!==!1&&(t.disable(F),f[F]=!1)}function Ye(F,be){return p[F]!==be?(t.bindFramebuffer(F,be),p[F]=be,F===t.DRAW_FRAMEBUFFER&&(p[t.FRAMEBUFFER]=be),F===t.FRAMEBUFFER&&(p[t.DRAW_FRAMEBUFFER]=be),!0):!1}function Ke(F,be){let ie=h,Ne=!1;if(F){ie=o.get(be),ie===void 0&&(ie=[],o.set(be,ie));const Te=F.textures;if(ie.length!==Te.length||ie[0]!==t.COLOR_ATTACHMENT0){for(let ue=0,He=Te.length;ue<He;ue++)ie[ue]=t.COLOR_ATTACHMENT0+ue;ie.length=Te.length,Ne=!0}}else ie[0]!==t.BACK&&(ie[0]=t.BACK,Ne=!0);Ne&&t.drawBuffers(ie)}function I(F){return y!==F?(t.useProgram(F),y=F,!0):!1}const N={[Ki]:t.FUNC_ADD,[i_]:t.FUNC_SUBTRACT,[s_]:t.FUNC_REVERSE_SUBTRACT};N[r_]=t.MIN,N[a_]=t.MAX;const j={[o_]:t.ZERO,[l_]:t.ONE,[c_]:t.SRC_COLOR,[Zo]:t.SRC_ALPHA,[m_]:t.SRC_ALPHA_SATURATE,[h_]:t.DST_COLOR,[d_]:t.DST_ALPHA,[u_]:t.ONE_MINUS_SRC_COLOR,[Qo]:t.ONE_MINUS_SRC_ALPHA,[p_]:t.ONE_MINUS_DST_COLOR,[f_]:t.ONE_MINUS_DST_ALPHA,[g_]:t.CONSTANT_COLOR,[__]:t.ONE_MINUS_CONSTANT_COLOR,[v_]:t.CONSTANT_ALPHA,[y_]:t.ONE_MINUS_CONSTANT_ALPHA};function ne(F,be,ie,Ne,Te,ue,He,tt,It,vt){if(F===oi){_===!0&&(Xe(t.BLEND),_=!1);return}if(_===!1&&(ye(t.BLEND),_=!0),F!==n_){if(F!==g||vt!==O){if((S!==Ki||L!==Ki)&&(t.blendEquation(t.FUNC_ADD),S=Ki,L=Ki),vt)switch(F){case Rs:t.blendFuncSeparate(t.ONE,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case Jo:t.blendFunc(t.ONE,t.ONE);break;case bu:t.blendFuncSeparate(t.ZERO,t.ONE_MINUS_SRC_COLOR,t.ZERO,t.ONE);break;case Mu:t.blendFuncSeparate(t.DST_COLOR,t.ONE_MINUS_SRC_ALPHA,t.ZERO,t.ONE);break;default:ht("WebGLState: Invalid blending: ",F);break}else switch(F){case Rs:t.blendFuncSeparate(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case Jo:t.blendFuncSeparate(t.SRC_ALPHA,t.ONE,t.ONE,t.ONE);break;case bu:ht("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Mu:ht("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:ht("WebGLState: Invalid blending: ",F);break}E=null,b=null,w=null,D=null,x.set(0,0,0),R=0,g=F,O=vt}return}Te=Te||be,ue=ue||ie,He=He||Ne,(be!==S||Te!==L)&&(t.blendEquationSeparate(N[be],N[Te]),S=be,L=Te),(ie!==E||Ne!==b||ue!==w||He!==D)&&(t.blendFuncSeparate(j[ie],j[Ne],j[ue],j[He]),E=ie,b=Ne,w=ue,D=He),(tt.equals(x)===!1||It!==R)&&(t.blendColor(tt.r,tt.g,tt.b,It),x.copy(tt),R=It),g=F,O=!1}function J(F,be){F.side===ri?Xe(t.CULL_FACE):ye(t.CULL_FACE);let ie=F.side===an;be&&(ie=!ie),se(ie),F.blending===Rs&&F.transparent===!1?ne(oi):ne(F.blending,F.blendEquation,F.blendSrc,F.blendDst,F.blendEquationAlpha,F.blendSrcAlpha,F.blendDstAlpha,F.blendColor,F.blendAlpha,F.premultipliedAlpha),a.setFunc(F.depthFunc),a.setTest(F.depthTest),a.setMask(F.depthWrite),r.setMask(F.colorWrite);const Ne=F.stencilWrite;l.setTest(Ne),Ne&&(l.setMask(F.stencilWriteMask),l.setFunc(F.stencilFunc,F.stencilRef,F.stencilFuncMask),l.setOp(F.stencilFail,F.stencilZFail,F.stencilZPass)),C(F.polygonOffset,F.polygonOffsetFactor,F.polygonOffsetUnits),F.alphaToCoverage===!0?ye(t.SAMPLE_ALPHA_TO_COVERAGE):Xe(t.SAMPLE_ALPHA_TO_COVERAGE)}function se(F){U!==F&&(F?t.frontFace(t.CW):t.frontFace(t.CCW),U=F)}function fe(F){F!==$g?(ye(t.CULL_FACE),F!==W&&(F===Su?t.cullFace(t.BACK):F===e_?t.cullFace(t.FRONT):t.cullFace(t.FRONT_AND_BACK))):Xe(t.CULL_FACE),W=F}function me(F){F!==ee&&(z&&t.lineWidth(F),ee=F)}function C(F,be,ie){F?(ye(t.POLYGON_OFFSET_FILL),(le!==be||V!==ie)&&(le=be,V=ie,a.getReversed()&&(be=-be),t.polygonOffset(be,ie))):Xe(t.POLYGON_OFFSET_FILL)}function re(F){F?ye(t.SCISSOR_TEST):Xe(t.SCISSOR_TEST)}function ve(F){F===void 0&&(F=t.TEXTURE0+q-1),Ee!==F&&(t.activeTexture(F),Ee=F)}function he(F,be,ie){ie===void 0&&(Ee===null?ie=t.TEXTURE0+q-1:ie=Ee);let Ne=De[ie];Ne===void 0&&(Ne={type:void 0,texture:void 0},De[ie]=Ne),(Ne.type!==F||Ne.texture!==be)&&(Ee!==ie&&(t.activeTexture(ie),Ee=ie),t.bindTexture(F,be||Ae[F]),Ne.type=F,Ne.texture=be)}function $(){const F=De[Ee];F!==void 0&&F.type!==void 0&&(t.bindTexture(F.type,null),F.type=void 0,F.texture=void 0)}function Ue(){try{t.compressedTexImage2D(...arguments)}catch(F){ht("WebGLState:",F)}}function T(){try{t.compressedTexImage3D(...arguments)}catch(F){ht("WebGLState:",F)}}function v(){try{t.texSubImage2D(...arguments)}catch(F){ht("WebGLState:",F)}}function k(){try{t.texSubImage3D(...arguments)}catch(F){ht("WebGLState:",F)}}function Q(){try{t.compressedTexSubImage2D(...arguments)}catch(F){ht("WebGLState:",F)}}function ce(){try{t.compressedTexSubImage3D(...arguments)}catch(F){ht("WebGLState:",F)}}function pe(){try{t.texStorage2D(...arguments)}catch(F){ht("WebGLState:",F)}}function ge(){try{t.texStorage3D(...arguments)}catch(F){ht("WebGLState:",F)}}function Z(){try{t.texImage2D(...arguments)}catch(F){ht("WebGLState:",F)}}function ae(){try{t.texImage3D(...arguments)}catch(F){ht("WebGLState:",F)}}function xe(F){return m[F]!==void 0?m[F]:t.getParameter(F)}function Pe(F,be){m[F]!==be&&(t.pixelStorei(F,be),m[F]=be)}function Se(F){mt.equals(F)===!1&&(t.scissor(F.x,F.y,F.z,F.w),mt.copy(F))}function _e(F){$e.equals(F)===!1&&(t.viewport(F.x,F.y,F.z,F.w),$e.copy(F))}function Qe(F,be){let ie=d.get(be);ie===void 0&&(ie=new WeakMap,d.set(be,ie));let Ne=ie.get(F);Ne===void 0&&(Ne=t.getUniformBlockIndex(be,F.name),ie.set(F,Ne))}function st(F,be){const Ne=d.get(be).get(F);u.get(be)!==Ne&&(t.uniformBlockBinding(be,Ne,F.__bindingPointIndex),u.set(be,Ne))}function pt(){t.disable(t.BLEND),t.disable(t.CULL_FACE),t.disable(t.DEPTH_TEST),t.disable(t.POLYGON_OFFSET_FILL),t.disable(t.SCISSOR_TEST),t.disable(t.STENCIL_TEST),t.disable(t.SAMPLE_ALPHA_TO_COVERAGE),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ONE,t.ZERO),t.blendFuncSeparate(t.ONE,t.ZERO,t.ONE,t.ZERO),t.blendColor(0,0,0,0),t.colorMask(!0,!0,!0,!0),t.clearColor(0,0,0,0),t.depthMask(!0),t.depthFunc(t.LESS),a.setReversed(!1),t.clearDepth(1),t.stencilMask(4294967295),t.stencilFunc(t.ALWAYS,0,4294967295),t.stencilOp(t.KEEP,t.KEEP,t.KEEP),t.clearStencil(0),t.cullFace(t.BACK),t.frontFace(t.CCW),t.polygonOffset(0,0),t.activeTexture(t.TEXTURE0),t.bindFramebuffer(t.FRAMEBUFFER,null),t.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),t.bindFramebuffer(t.READ_FRAMEBUFFER,null),t.useProgram(null),t.lineWidth(1),t.scissor(0,0,t.canvas.width,t.canvas.height),t.viewport(0,0,t.canvas.width,t.canvas.height),t.pixelStorei(t.PACK_ALIGNMENT,4),t.pixelStorei(t.UNPACK_ALIGNMENT,4),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,!1),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,t.BROWSER_DEFAULT_WEBGL),t.pixelStorei(t.PACK_ROW_LENGTH,0),t.pixelStorei(t.PACK_SKIP_PIXELS,0),t.pixelStorei(t.PACK_SKIP_ROWS,0),t.pixelStorei(t.UNPACK_ROW_LENGTH,0),t.pixelStorei(t.UNPACK_IMAGE_HEIGHT,0),t.pixelStorei(t.UNPACK_SKIP_PIXELS,0),t.pixelStorei(t.UNPACK_SKIP_ROWS,0),t.pixelStorei(t.UNPACK_SKIP_IMAGES,0),f={},m={},Ee=null,De={},p={},o=new WeakMap,h=[],y=null,_=!1,g=null,S=null,E=null,b=null,L=null,w=null,D=null,x=new ut(0,0,0),R=0,O=!1,U=null,W=null,ee=null,le=null,V=null,mt.set(0,0,t.canvas.width,t.canvas.height),$e.set(0,0,t.canvas.width,t.canvas.height),r.reset(),a.reset(),l.reset()}return{buffers:{color:r,depth:a,stencil:l},enable:ye,disable:Xe,bindFramebuffer:Ye,drawBuffers:Ke,useProgram:I,setBlending:ne,setMaterial:J,setFlipSided:se,setCullFace:fe,setLineWidth:me,setPolygonOffset:C,setScissorTest:re,activeTexture:ve,bindTexture:he,unbindTexture:$,compressedTexImage2D:Ue,compressedTexImage3D:T,texImage2D:Z,texImage3D:ae,pixelStorei:Pe,getParameter:xe,updateUBOMapping:Qe,uniformBlockBinding:st,texStorage2D:pe,texStorage3D:ge,texSubImage2D:v,texSubImage3D:k,compressedTexSubImage2D:Q,compressedTexSubImage3D:ce,scissor:Se,viewport:_e,reset:pt}}function rb(t,e,n,i,s,r,a){const l=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,u=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),d=new dt,f=new WeakMap,m=new Set;let p;const o=new WeakMap;let h=!1;try{h=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(T,v){return h?new OffscreenCanvas(T,v):wa("canvas")}function _(T,v,k){let Q=1;const ce=Ue(T);if((ce.width>k||ce.height>k)&&(Q=k/Math.max(ce.width,ce.height)),Q<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){const pe=Math.floor(Q*ce.width),ge=Math.floor(Q*ce.height);p===void 0&&(p=y(pe,ge));const Z=v?y(pe,ge):p;return Z.width=pe,Z.height=ge,Z.getContext("2d").drawImage(T,0,0,pe,ge),Je("WebGLRenderer: Texture has been resized from ("+ce.width+"x"+ce.height+") to ("+pe+"x"+ge+")."),Z}else return"data"in T&&Je("WebGLRenderer: Image in DataTexture is too big ("+ce.width+"x"+ce.height+")."),T;return T}function g(T){return T.generateMipmaps}function S(T){t.generateMipmap(T)}function E(T){return T.isWebGLCubeRenderTarget?t.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?t.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?t.TEXTURE_2D_ARRAY:t.TEXTURE_2D}function b(T,v,k,Q,ce,pe=!1){if(T!==null){if(t[T]!==void 0)return t[T];Je("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let ge;Q&&(ge=e.get("EXT_texture_norm16"),ge||Je("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Z=v;if(v===t.RED&&(k===t.FLOAT&&(Z=t.R32F),k===t.HALF_FLOAT&&(Z=t.R16F),k===t.UNSIGNED_BYTE&&(Z=t.R8),k===t.UNSIGNED_SHORT&&ge&&(Z=ge.R16_EXT),k===t.SHORT&&ge&&(Z=ge.R16_SNORM_EXT)),v===t.RED_INTEGER&&(k===t.UNSIGNED_BYTE&&(Z=t.R8UI),k===t.UNSIGNED_SHORT&&(Z=t.R16UI),k===t.UNSIGNED_INT&&(Z=t.R32UI),k===t.BYTE&&(Z=t.R8I),k===t.SHORT&&(Z=t.R16I),k===t.INT&&(Z=t.R32I)),v===t.RG&&(k===t.FLOAT&&(Z=t.RG32F),k===t.HALF_FLOAT&&(Z=t.RG16F),k===t.UNSIGNED_BYTE&&(Z=t.RG8),k===t.UNSIGNED_SHORT&&ge&&(Z=ge.RG16_EXT),k===t.SHORT&&ge&&(Z=ge.RG16_SNORM_EXT)),v===t.RG_INTEGER&&(k===t.UNSIGNED_BYTE&&(Z=t.RG8UI),k===t.UNSIGNED_SHORT&&(Z=t.RG16UI),k===t.UNSIGNED_INT&&(Z=t.RG32UI),k===t.BYTE&&(Z=t.RG8I),k===t.SHORT&&(Z=t.RG16I),k===t.INT&&(Z=t.RG32I)),v===t.RGB_INTEGER&&(k===t.UNSIGNED_BYTE&&(Z=t.RGB8UI),k===t.UNSIGNED_SHORT&&(Z=t.RGB16UI),k===t.UNSIGNED_INT&&(Z=t.RGB32UI),k===t.BYTE&&(Z=t.RGB8I),k===t.SHORT&&(Z=t.RGB16I),k===t.INT&&(Z=t.RGB32I)),v===t.RGBA_INTEGER&&(k===t.UNSIGNED_BYTE&&(Z=t.RGBA8UI),k===t.UNSIGNED_SHORT&&(Z=t.RGBA16UI),k===t.UNSIGNED_INT&&(Z=t.RGBA32UI),k===t.BYTE&&(Z=t.RGBA8I),k===t.SHORT&&(Z=t.RGBA16I),k===t.INT&&(Z=t.RGBA32I)),v===t.RGB&&(k===t.UNSIGNED_SHORT&&ge&&(Z=ge.RGB16_EXT),k===t.SHORT&&ge&&(Z=ge.RGB16_SNORM_EXT),k===t.UNSIGNED_INT_5_9_9_9_REV&&(Z=t.RGB9_E5),k===t.UNSIGNED_INT_10F_11F_11F_REV&&(Z=t.R11F_G11F_B10F)),v===t.RGBA){const ae=pe?Ea:lt.getTransfer(ce);k===t.FLOAT&&(Z=t.RGBA32F),k===t.HALF_FLOAT&&(Z=t.RGBA16F),k===t.UNSIGNED_BYTE&&(Z=ae===_t?t.SRGB8_ALPHA8:t.RGBA8),k===t.UNSIGNED_SHORT&&ge&&(Z=ge.RGBA16_EXT),k===t.SHORT&&ge&&(Z=ge.RGBA16_SNORM_EXT),k===t.UNSIGNED_SHORT_4_4_4_4&&(Z=t.RGBA4),k===t.UNSIGNED_SHORT_5_5_5_1&&(Z=t.RGB5_A1)}return(Z===t.R16F||Z===t.R32F||Z===t.RG16F||Z===t.RG32F||Z===t.RGBA16F||Z===t.RGBA32F)&&e.get("EXT_color_buffer_float"),Z}function L(T,v){let k;return T?v===null||v===Xn||v===Sr?k=t.DEPTH24_STENCIL8:v===Vn?k=t.DEPTH32F_STENCIL8:v===xr&&(k=t.DEPTH24_STENCIL8,Je("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===Xn||v===Sr?k=t.DEPTH_COMPONENT24:v===Vn?k=t.DEPTH_COMPONENT32F:v===xr&&(k=t.DEPTH_COMPONENT16),k}function w(T,v){return g(T)===!0||T.isFramebufferTexture&&T.minFilter!==Gt&&T.minFilter!==Kt?Math.log2(Math.max(v.width,v.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?v.mipmaps.length:1}function D(T){const v=T.target;v.removeEventListener("dispose",D),R(v),v.isVideoTexture&&f.delete(v),v.isHTMLTexture&&m.delete(v)}function x(T){const v=T.target;v.removeEventListener("dispose",x),U(v)}function R(T){const v=i.get(T);if(v.__webglInit===void 0)return;const k=T.source,Q=o.get(k);if(Q){const ce=Q[v.__cacheKey];ce.usedTimes--,ce.usedTimes===0&&O(T),Object.keys(Q).length===0&&o.delete(k)}i.remove(T)}function O(T){const v=i.get(T);t.deleteTexture(v.__webglTexture);const k=T.source,Q=o.get(k);delete Q[v.__cacheKey],a.memory.textures--}function U(T){const v=i.get(T);if(T.depthTexture&&(T.depthTexture.dispose(),i.remove(T.depthTexture)),T.isWebGLCubeRenderTarget)for(let Q=0;Q<6;Q++){if(Array.isArray(v.__webglFramebuffer[Q]))for(let ce=0;ce<v.__webglFramebuffer[Q].length;ce++)t.deleteFramebuffer(v.__webglFramebuffer[Q][ce]);else t.deleteFramebuffer(v.__webglFramebuffer[Q]);v.__webglDepthbuffer&&t.deleteRenderbuffer(v.__webglDepthbuffer[Q])}else{if(Array.isArray(v.__webglFramebuffer))for(let Q=0;Q<v.__webglFramebuffer.length;Q++)t.deleteFramebuffer(v.__webglFramebuffer[Q]);else t.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&t.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&t.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let Q=0;Q<v.__webglColorRenderbuffer.length;Q++)v.__webglColorRenderbuffer[Q]&&t.deleteRenderbuffer(v.__webglColorRenderbuffer[Q]);v.__webglDepthRenderbuffer&&t.deleteRenderbuffer(v.__webglDepthRenderbuffer)}const k=T.textures;for(let Q=0,ce=k.length;Q<ce;Q++){const pe=i.get(k[Q]);pe.__webglTexture&&(t.deleteTexture(pe.__webglTexture),a.memory.textures--),i.remove(k[Q])}i.remove(T)}let W=0;function ee(){W=0}function le(){return W}function V(T){W=T}function q(){const T=W;return T>=s.maxTextures&&Je("WebGLTextures: Trying to use "+T+" texture units while this GPU supports only "+s.maxTextures),W+=1,T}function z(T){const v=[];return v.push(T.wrapS),v.push(T.wrapT),v.push(T.wrapR||0),v.push(T.magFilter),v.push(T.minFilter),v.push(T.anisotropy),v.push(T.internalFormat),v.push(T.format),v.push(T.type),v.push(T.generateMipmaps),v.push(T.premultiplyAlpha),v.push(T.flipY),v.push(T.unpackAlignment),v.push(T.colorSpace),v.join()}function te(T,v){const k=i.get(T);if(T.isVideoTexture&&he(T),T.isRenderTargetTexture===!1&&T.isExternalTexture!==!0&&T.version>0&&k.__version!==T.version){const Q=T.image;if(Q===null)Je("WebGLRenderer: Texture marked for update but no image data found.");else if(Q.complete===!1)Je("WebGLRenderer: Texture marked for update but image is incomplete");else{Xe(k,T,v);return}}else T.isExternalTexture&&(k.__webglTexture=T.sourceTexture?T.sourceTexture:null);n.bindTexture(t.TEXTURE_2D,k.__webglTexture,t.TEXTURE0+v)}function de(T,v){const k=i.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&k.__version!==T.version){Xe(k,T,v);return}else T.isExternalTexture&&(k.__webglTexture=T.sourceTexture?T.sourceTexture:null);n.bindTexture(t.TEXTURE_2D_ARRAY,k.__webglTexture,t.TEXTURE0+v)}function Ee(T,v){const k=i.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&k.__version!==T.version){Xe(k,T,v);return}n.bindTexture(t.TEXTURE_3D,k.__webglTexture,t.TEXTURE0+v)}function De(T,v){const k=i.get(T);if(T.isCubeDepthTexture!==!0&&T.version>0&&k.__version!==T.version){Ye(k,T,v);return}n.bindTexture(t.TEXTURE_CUBE_MAP,k.__webglTexture,t.TEXTURE0+v)}const Fe={[al]:t.REPEAT,[ai]:t.CLAMP_TO_EDGE,[ol]:t.MIRRORED_REPEAT},ot={[Gt]:t.NEAREST,[b_]:t.NEAREST_MIPMAP_NEAREST,[Nr]:t.NEAREST_MIPMAP_LINEAR,[Kt]:t.LINEAR,[ao]:t.LINEAR_MIPMAP_NEAREST,[Zi]:t.LINEAR_MIPMAP_LINEAR},mt={[E_]:t.NEVER,[R_]:t.ALWAYS,[w_]:t.LESS,[gc]:t.LEQUAL,[A_]:t.EQUAL,[_c]:t.GEQUAL,[P_]:t.GREATER,[C_]:t.NOTEQUAL};function $e(T,v){if(v.type===Vn&&e.has("OES_texture_float_linear")===!1&&(v.magFilter===Kt||v.magFilter===ao||v.magFilter===Nr||v.magFilter===Zi||v.minFilter===Kt||v.minFilter===ao||v.minFilter===Nr||v.minFilter===Zi)&&Je("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),t.texParameteri(T,t.TEXTURE_WRAP_S,Fe[v.wrapS]),t.texParameteri(T,t.TEXTURE_WRAP_T,Fe[v.wrapT]),(T===t.TEXTURE_3D||T===t.TEXTURE_2D_ARRAY)&&t.texParameteri(T,t.TEXTURE_WRAP_R,Fe[v.wrapR]),t.texParameteri(T,t.TEXTURE_MAG_FILTER,ot[v.magFilter]),t.texParameteri(T,t.TEXTURE_MIN_FILTER,ot[v.minFilter]),v.compareFunction&&(t.texParameteri(T,t.TEXTURE_COMPARE_MODE,t.COMPARE_REF_TO_TEXTURE),t.texParameteri(T,t.TEXTURE_COMPARE_FUNC,mt[v.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===Gt||v.minFilter!==Nr&&v.minFilter!==Zi||v.type===Vn&&e.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||i.get(v).__currentAnisotropy){const k=e.get("EXT_texture_filter_anisotropic");t.texParameterf(T,k.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,s.getMaxAnisotropy())),i.get(v).__currentAnisotropy=v.anisotropy}}}function oe(T,v){let k=!1;T.__webglInit===void 0&&(T.__webglInit=!0,v.addEventListener("dispose",D));const Q=v.source;let ce=o.get(Q);ce===void 0&&(ce={},o.set(Q,ce));const pe=z(v);if(pe!==T.__cacheKey){ce[pe]===void 0&&(ce[pe]={texture:t.createTexture(),usedTimes:0},a.memory.textures++,k=!0),ce[pe].usedTimes++;const ge=ce[T.__cacheKey];ge!==void 0&&(ce[T.__cacheKey].usedTimes--,ge.usedTimes===0&&O(v)),T.__cacheKey=pe,T.__webglTexture=ce[pe].texture}return k}function Ae(T,v,k){return Math.floor(Math.floor(T/k)/v)}function ye(T,v,k,Q){const pe=T.updateRanges;if(pe.length===0)n.texSubImage2D(t.TEXTURE_2D,0,0,0,v.width,v.height,k,Q,v.data);else{pe.sort((Pe,Se)=>Pe.start-Se.start);let ge=0;for(let Pe=1;Pe<pe.length;Pe++){const Se=pe[ge],_e=pe[Pe],Qe=Se.start+Se.count,st=Ae(_e.start,v.width,4),pt=Ae(Se.start,v.width,4);_e.start<=Qe+1&&st===pt&&Ae(_e.start+_e.count-1,v.width,4)===st?Se.count=Math.max(Se.count,_e.start+_e.count-Se.start):(++ge,pe[ge]=_e)}pe.length=ge+1;const Z=n.getParameter(t.UNPACK_ROW_LENGTH),ae=n.getParameter(t.UNPACK_SKIP_PIXELS),xe=n.getParameter(t.UNPACK_SKIP_ROWS);n.pixelStorei(t.UNPACK_ROW_LENGTH,v.width);for(let Pe=0,Se=pe.length;Pe<Se;Pe++){const _e=pe[Pe],Qe=Math.floor(_e.start/4),st=Math.ceil(_e.count/4),pt=Qe%v.width,F=Math.floor(Qe/v.width),be=st,ie=1;n.pixelStorei(t.UNPACK_SKIP_PIXELS,pt),n.pixelStorei(t.UNPACK_SKIP_ROWS,F),n.texSubImage2D(t.TEXTURE_2D,0,pt,F,be,ie,k,Q,v.data)}T.clearUpdateRanges(),n.pixelStorei(t.UNPACK_ROW_LENGTH,Z),n.pixelStorei(t.UNPACK_SKIP_PIXELS,ae),n.pixelStorei(t.UNPACK_SKIP_ROWS,xe)}}function Xe(T,v,k){let Q=t.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(Q=t.TEXTURE_2D_ARRAY),v.isData3DTexture&&(Q=t.TEXTURE_3D);const ce=oe(T,v),pe=v.source;n.bindTexture(Q,T.__webglTexture,t.TEXTURE0+k);const ge=i.get(pe);if(pe.version!==ge.__version||ce===!0){if(n.activeTexture(t.TEXTURE0+k),(typeof ImageBitmap<"u"&&v.image instanceof ImageBitmap)===!1){const ie=lt.getPrimaries(lt.workingColorSpace),Ne=v.colorSpace===Ri?null:lt.getPrimaries(v.colorSpace),Te=v.colorSpace===Ri||ie===Ne?t.NONE:t.BROWSER_DEFAULT_WEBGL;n.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,v.flipY),n.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),n.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,Te)}n.pixelStorei(t.UNPACK_ALIGNMENT,v.unpackAlignment);let ae=_(v.image,!1,s.maxTextureSize);ae=$(v,ae);const xe=r.convert(v.format,v.colorSpace),Pe=r.convert(v.type);let Se=b(v.internalFormat,xe,Pe,v.normalized,v.colorSpace,v.isVideoTexture);$e(Q,v);let _e;const Qe=v.mipmaps,st=v.isVideoTexture!==!0,pt=ge.__version===void 0||ce===!0,F=pe.dataReady,be=w(v,ae);if(v.isDepthTexture)Se=L(v.format===Qi,v.type),pt&&(st?n.texStorage2D(t.TEXTURE_2D,1,Se,ae.width,ae.height):n.texImage2D(t.TEXTURE_2D,0,Se,ae.width,ae.height,0,xe,Pe,null));else if(v.isDataTexture)if(Qe.length>0){st&&pt&&n.texStorage2D(t.TEXTURE_2D,be,Se,Qe[0].width,Qe[0].height);for(let ie=0,Ne=Qe.length;ie<Ne;ie++)_e=Qe[ie],st?F&&n.texSubImage2D(t.TEXTURE_2D,ie,0,0,_e.width,_e.height,xe,Pe,_e.data):n.texImage2D(t.TEXTURE_2D,ie,Se,_e.width,_e.height,0,xe,Pe,_e.data);v.generateMipmaps=!1}else st?(pt&&n.texStorage2D(t.TEXTURE_2D,be,Se,ae.width,ae.height),F&&ye(v,ae,xe,Pe)):n.texImage2D(t.TEXTURE_2D,0,Se,ae.width,ae.height,0,xe,Pe,ae.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){st&&pt&&n.texStorage3D(t.TEXTURE_2D_ARRAY,be,Se,Qe[0].width,Qe[0].height,ae.depth);for(let ie=0,Ne=Qe.length;ie<Ne;ie++)if(_e=Qe[ie],v.format!==An)if(xe!==null)if(st){if(F)if(v.layerUpdates.size>0){const Te=Qu(_e.width,_e.height,v.format,v.type);for(const ue of v.layerUpdates){const He=_e.data.subarray(ue*Te/_e.data.BYTES_PER_ELEMENT,(ue+1)*Te/_e.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,ie,0,0,ue,_e.width,_e.height,1,xe,He)}v.clearLayerUpdates()}else n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,ie,0,0,0,_e.width,_e.height,ae.depth,xe,_e.data)}else n.compressedTexImage3D(t.TEXTURE_2D_ARRAY,ie,Se,_e.width,_e.height,ae.depth,0,_e.data,0,0);else Je("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else st?F&&n.texSubImage3D(t.TEXTURE_2D_ARRAY,ie,0,0,0,_e.width,_e.height,ae.depth,xe,Pe,_e.data):n.texImage3D(t.TEXTURE_2D_ARRAY,ie,Se,_e.width,_e.height,ae.depth,0,xe,Pe,_e.data)}else{st&&pt&&n.texStorage2D(t.TEXTURE_2D,be,Se,Qe[0].width,Qe[0].height);for(let ie=0,Ne=Qe.length;ie<Ne;ie++)_e=Qe[ie],v.format!==An?xe!==null?st?F&&n.compressedTexSubImage2D(t.TEXTURE_2D,ie,0,0,_e.width,_e.height,xe,_e.data):n.compressedTexImage2D(t.TEXTURE_2D,ie,Se,_e.width,_e.height,0,_e.data):Je("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):st?F&&n.texSubImage2D(t.TEXTURE_2D,ie,0,0,_e.width,_e.height,xe,Pe,_e.data):n.texImage2D(t.TEXTURE_2D,ie,Se,_e.width,_e.height,0,xe,Pe,_e.data)}else if(v.isDataArrayTexture)if(st){if(pt&&n.texStorage3D(t.TEXTURE_2D_ARRAY,be,Se,ae.width,ae.height,ae.depth),F)if(v.layerUpdates.size>0){const ie=Qu(ae.width,ae.height,v.format,v.type);for(const Ne of v.layerUpdates){const Te=ae.data.subarray(Ne*ie/ae.data.BYTES_PER_ELEMENT,(Ne+1)*ie/ae.data.BYTES_PER_ELEMENT);n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,Ne,ae.width,ae.height,1,xe,Pe,Te)}v.clearLayerUpdates()}else n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,0,ae.width,ae.height,ae.depth,xe,Pe,ae.data)}else n.texImage3D(t.TEXTURE_2D_ARRAY,0,Se,ae.width,ae.height,ae.depth,0,xe,Pe,ae.data);else if(v.isData3DTexture)st?(pt&&n.texStorage3D(t.TEXTURE_3D,be,Se,ae.width,ae.height,ae.depth),F&&n.texSubImage3D(t.TEXTURE_3D,0,0,0,0,ae.width,ae.height,ae.depth,xe,Pe,ae.data)):n.texImage3D(t.TEXTURE_3D,0,Se,ae.width,ae.height,ae.depth,0,xe,Pe,ae.data);else if(v.isFramebufferTexture){if(pt)if(st)n.texStorage2D(t.TEXTURE_2D,be,Se,ae.width,ae.height);else{let ie=ae.width,Ne=ae.height;for(let Te=0;Te<be;Te++)n.texImage2D(t.TEXTURE_2D,Te,Se,ie,Ne,0,xe,Pe,null),ie>>=1,Ne>>=1}}else if(v.isHTMLTexture){if("texElementImage2D"in t){const ie=t.canvas;if(ie.hasAttribute("layoutsubtree")||ie.setAttribute("layoutsubtree","true"),ae.parentNode!==ie){ie.appendChild(ae),m.add(v),ie.onpaint=tt=>{const It=tt.changedElements;for(const vt of m)It.includes(vt.image)&&(vt.needsUpdate=!0)},ie.requestPaint();return}const Ne=0,Te=t.RGBA,ue=t.RGBA,He=t.UNSIGNED_BYTE;t.texElementImage2D(t.TEXTURE_2D,Ne,Te,ue,He,ae),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE)}}else if(Qe.length>0){if(st&&pt){const ie=Ue(Qe[0]);n.texStorage2D(t.TEXTURE_2D,be,Se,ie.width,ie.height)}for(let ie=0,Ne=Qe.length;ie<Ne;ie++)_e=Qe[ie],st?F&&n.texSubImage2D(t.TEXTURE_2D,ie,0,0,xe,Pe,_e):n.texImage2D(t.TEXTURE_2D,ie,Se,xe,Pe,_e);v.generateMipmaps=!1}else if(st){if(pt){const ie=Ue(ae);n.texStorage2D(t.TEXTURE_2D,be,Se,ie.width,ie.height)}F&&n.texSubImage2D(t.TEXTURE_2D,0,0,0,xe,Pe,ae)}else n.texImage2D(t.TEXTURE_2D,0,Se,xe,Pe,ae);g(v)&&S(Q),ge.__version=pe.version,v.onUpdate&&v.onUpdate(v)}T.__version=v.version}function Ye(T,v,k){if(v.image.length!==6)return;const Q=oe(T,v),ce=v.source;n.bindTexture(t.TEXTURE_CUBE_MAP,T.__webglTexture,t.TEXTURE0+k);const pe=i.get(ce);if(ce.version!==pe.__version||Q===!0){n.activeTexture(t.TEXTURE0+k);const ge=lt.getPrimaries(lt.workingColorSpace),Z=v.colorSpace===Ri?null:lt.getPrimaries(v.colorSpace),ae=v.colorSpace===Ri||ge===Z?t.NONE:t.BROWSER_DEFAULT_WEBGL;n.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,v.flipY),n.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),n.pixelStorei(t.UNPACK_ALIGNMENT,v.unpackAlignment),n.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,ae);const xe=v.isCompressedTexture||v.image[0].isCompressedTexture,Pe=v.image[0]&&v.image[0].isDataTexture,Se=[];for(let ue=0;ue<6;ue++)!xe&&!Pe?Se[ue]=_(v.image[ue],!0,s.maxCubemapSize):Se[ue]=Pe?v.image[ue].image:v.image[ue],Se[ue]=$(v,Se[ue]);const _e=Se[0],Qe=r.convert(v.format,v.colorSpace),st=r.convert(v.type),pt=b(v.internalFormat,Qe,st,v.normalized,v.colorSpace),F=v.isVideoTexture!==!0,be=pe.__version===void 0||Q===!0,ie=ce.dataReady;let Ne=w(v,_e);$e(t.TEXTURE_CUBE_MAP,v);let Te;if(xe){F&&be&&n.texStorage2D(t.TEXTURE_CUBE_MAP,Ne,pt,_e.width,_e.height);for(let ue=0;ue<6;ue++){Te=Se[ue].mipmaps;for(let He=0;He<Te.length;He++){const tt=Te[He];v.format!==An?Qe!==null?F?ie&&n.compressedTexSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ue,He,0,0,tt.width,tt.height,Qe,tt.data):n.compressedTexImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ue,He,pt,tt.width,tt.height,0,tt.data):Je("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):F?ie&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ue,He,0,0,tt.width,tt.height,Qe,st,tt.data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ue,He,pt,tt.width,tt.height,0,Qe,st,tt.data)}}}else{if(Te=v.mipmaps,F&&be){Te.length>0&&Ne++;const ue=Ue(Se[0]);n.texStorage2D(t.TEXTURE_CUBE_MAP,Ne,pt,ue.width,ue.height)}for(let ue=0;ue<6;ue++)if(Pe){F?ie&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ue,0,0,0,Se[ue].width,Se[ue].height,Qe,st,Se[ue].data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ue,0,pt,Se[ue].width,Se[ue].height,0,Qe,st,Se[ue].data);for(let He=0;He<Te.length;He++){const It=Te[He].image[ue].image;F?ie&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ue,He+1,0,0,It.width,It.height,Qe,st,It.data):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ue,He+1,pt,It.width,It.height,0,Qe,st,It.data)}}else{F?ie&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ue,0,0,0,Qe,st,Se[ue]):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ue,0,pt,Qe,st,Se[ue]);for(let He=0;He<Te.length;He++){const tt=Te[He];F?ie&&n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ue,He+1,0,0,Qe,st,tt.image[ue]):n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+ue,He+1,pt,Qe,st,tt.image[ue])}}}g(v)&&S(t.TEXTURE_CUBE_MAP),pe.__version=ce.version,v.onUpdate&&v.onUpdate(v)}T.__version=v.version}function Ke(T,v,k,Q,ce,pe){const ge=r.convert(k.format,k.colorSpace),Z=r.convert(k.type),ae=b(k.internalFormat,ge,Z,k.normalized,k.colorSpace),xe=i.get(v),Pe=i.get(k);if(Pe.__renderTarget=v,!xe.__hasExternalTextures){const Se=Math.max(1,v.width>>pe),_e=Math.max(1,v.height>>pe);ce===t.TEXTURE_3D||ce===t.TEXTURE_2D_ARRAY?n.texImage3D(ce,pe,ae,Se,_e,v.depth,0,ge,Z,null):n.texImage2D(ce,pe,ae,Se,_e,0,ge,Z,null)}n.bindFramebuffer(t.FRAMEBUFFER,T),ve(v)?l.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,Q,ce,Pe.__webglTexture,0,re(v)):(ce===t.TEXTURE_2D||ce>=t.TEXTURE_CUBE_MAP_POSITIVE_X&&ce<=t.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&t.framebufferTexture2D(t.FRAMEBUFFER,Q,ce,Pe.__webglTexture,pe),n.bindFramebuffer(t.FRAMEBUFFER,null)}function I(T,v,k){if(t.bindRenderbuffer(t.RENDERBUFFER,T),v.depthBuffer){const Q=v.depthTexture,ce=Q&&Q.isDepthTexture?Q.type:null,pe=L(v.stencilBuffer,ce),ge=v.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;ve(v)?l.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,re(v),pe,v.width,v.height):k?t.renderbufferStorageMultisample(t.RENDERBUFFER,re(v),pe,v.width,v.height):t.renderbufferStorage(t.RENDERBUFFER,pe,v.width,v.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,ge,t.RENDERBUFFER,T)}else{const Q=v.textures;for(let ce=0;ce<Q.length;ce++){const pe=Q[ce],ge=r.convert(pe.format,pe.colorSpace),Z=r.convert(pe.type),ae=b(pe.internalFormat,ge,Z,pe.normalized,pe.colorSpace);ve(v)?l.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,re(v),ae,v.width,v.height):k?t.renderbufferStorageMultisample(t.RENDERBUFFER,re(v),ae,v.width,v.height):t.renderbufferStorage(t.RENDERBUFFER,ae,v.width,v.height)}}t.bindRenderbuffer(t.RENDERBUFFER,null)}function N(T,v,k){const Q=v.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(t.FRAMEBUFFER,T),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const ce=i.get(v.depthTexture);if(ce.__renderTarget=v,(!ce.__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),Q){if(ce.__webglInit===void 0&&(ce.__webglInit=!0,v.depthTexture.addEventListener("dispose",D)),ce.__webglTexture===void 0){ce.__webglTexture=t.createTexture(),n.bindTexture(t.TEXTURE_CUBE_MAP,ce.__webglTexture),$e(t.TEXTURE_CUBE_MAP,v.depthTexture);const xe=r.convert(v.depthTexture.format),Pe=r.convert(v.depthTexture.type);let Se;v.depthTexture.format===pi?Se=t.DEPTH_COMPONENT24:v.depthTexture.format===Qi&&(Se=t.DEPTH24_STENCIL8);for(let _e=0;_e<6;_e++)t.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,Se,v.width,v.height,0,xe,Pe,null)}}else te(v.depthTexture,0);const pe=ce.__webglTexture,ge=re(v),Z=Q?t.TEXTURE_CUBE_MAP_POSITIVE_X+k:t.TEXTURE_2D,ae=v.depthTexture.format===Qi?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;if(v.depthTexture.format===pi)ve(v)?l.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,ae,Z,pe,0,ge):t.framebufferTexture2D(t.FRAMEBUFFER,ae,Z,pe,0);else if(v.depthTexture.format===Qi)ve(v)?l.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,ae,Z,pe,0,ge):t.framebufferTexture2D(t.FRAMEBUFFER,ae,Z,pe,0);else throw new Error("Unknown depthTexture format")}function j(T){const v=i.get(T),k=T.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==T.depthTexture){const Q=T.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),Q){const ce=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,Q.removeEventListener("dispose",ce)};Q.addEventListener("dispose",ce),v.__depthDisposeCallback=ce}v.__boundDepthTexture=Q}if(T.depthTexture&&!v.__autoAllocateDepthBuffer)if(k)for(let Q=0;Q<6;Q++)N(v.__webglFramebuffer[Q],T,Q);else{const Q=T.texture.mipmaps;Q&&Q.length>0?N(v.__webglFramebuffer[0],T,0):N(v.__webglFramebuffer,T,0)}else if(k){v.__webglDepthbuffer=[];for(let Q=0;Q<6;Q++)if(n.bindFramebuffer(t.FRAMEBUFFER,v.__webglFramebuffer[Q]),v.__webglDepthbuffer[Q]===void 0)v.__webglDepthbuffer[Q]=t.createRenderbuffer(),I(v.__webglDepthbuffer[Q],T,!1);else{const ce=T.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,pe=v.__webglDepthbuffer[Q];t.bindRenderbuffer(t.RENDERBUFFER,pe),t.framebufferRenderbuffer(t.FRAMEBUFFER,ce,t.RENDERBUFFER,pe)}}else{const Q=T.texture.mipmaps;if(Q&&Q.length>0?n.bindFramebuffer(t.FRAMEBUFFER,v.__webglFramebuffer[0]):n.bindFramebuffer(t.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=t.createRenderbuffer(),I(v.__webglDepthbuffer,T,!1);else{const ce=T.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,pe=v.__webglDepthbuffer;t.bindRenderbuffer(t.RENDERBUFFER,pe),t.framebufferRenderbuffer(t.FRAMEBUFFER,ce,t.RENDERBUFFER,pe)}}n.bindFramebuffer(t.FRAMEBUFFER,null)}function ne(T,v,k){const Q=i.get(T);v!==void 0&&Ke(Q.__webglFramebuffer,T,T.texture,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,0),k!==void 0&&j(T)}function J(T){const v=T.texture,k=i.get(T),Q=i.get(v);T.addEventListener("dispose",x);const ce=T.textures,pe=T.isWebGLCubeRenderTarget===!0,ge=ce.length>1;if(ge||(Q.__webglTexture===void 0&&(Q.__webglTexture=t.createTexture()),Q.__version=v.version,a.memory.textures++),pe){k.__webglFramebuffer=[];for(let Z=0;Z<6;Z++)if(v.mipmaps&&v.mipmaps.length>0){k.__webglFramebuffer[Z]=[];for(let ae=0;ae<v.mipmaps.length;ae++)k.__webglFramebuffer[Z][ae]=t.createFramebuffer()}else k.__webglFramebuffer[Z]=t.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){k.__webglFramebuffer=[];for(let Z=0;Z<v.mipmaps.length;Z++)k.__webglFramebuffer[Z]=t.createFramebuffer()}else k.__webglFramebuffer=t.createFramebuffer();if(ge)for(let Z=0,ae=ce.length;Z<ae;Z++){const xe=i.get(ce[Z]);xe.__webglTexture===void 0&&(xe.__webglTexture=t.createTexture(),a.memory.textures++)}if(T.samples>0&&ve(T)===!1){k.__webglMultisampledFramebuffer=t.createFramebuffer(),k.__webglColorRenderbuffer=[],n.bindFramebuffer(t.FRAMEBUFFER,k.__webglMultisampledFramebuffer);for(let Z=0;Z<ce.length;Z++){const ae=ce[Z];k.__webglColorRenderbuffer[Z]=t.createRenderbuffer(),t.bindRenderbuffer(t.RENDERBUFFER,k.__webglColorRenderbuffer[Z]);const xe=r.convert(ae.format,ae.colorSpace),Pe=r.convert(ae.type),Se=b(ae.internalFormat,xe,Pe,ae.normalized,ae.colorSpace,T.isXRRenderTarget===!0),_e=re(T);t.renderbufferStorageMultisample(t.RENDERBUFFER,_e,Se,T.width,T.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+Z,t.RENDERBUFFER,k.__webglColorRenderbuffer[Z])}t.bindRenderbuffer(t.RENDERBUFFER,null),T.depthBuffer&&(k.__webglDepthRenderbuffer=t.createRenderbuffer(),I(k.__webglDepthRenderbuffer,T,!0)),n.bindFramebuffer(t.FRAMEBUFFER,null)}}if(pe){n.bindTexture(t.TEXTURE_CUBE_MAP,Q.__webglTexture),$e(t.TEXTURE_CUBE_MAP,v);for(let Z=0;Z<6;Z++)if(v.mipmaps&&v.mipmaps.length>0)for(let ae=0;ae<v.mipmaps.length;ae++)Ke(k.__webglFramebuffer[Z][ae],T,v,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ae);else Ke(k.__webglFramebuffer[Z],T,v,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0);g(v)&&S(t.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(ge){for(let Z=0,ae=ce.length;Z<ae;Z++){const xe=ce[Z],Pe=i.get(xe);let Se=t.TEXTURE_2D;(T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(Se=T.isWebGL3DRenderTarget?t.TEXTURE_3D:t.TEXTURE_2D_ARRAY),n.bindTexture(Se,Pe.__webglTexture),$e(Se,xe),Ke(k.__webglFramebuffer,T,xe,t.COLOR_ATTACHMENT0+Z,Se,0),g(xe)&&S(Se)}n.unbindTexture()}else{let Z=t.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(Z=T.isWebGL3DRenderTarget?t.TEXTURE_3D:t.TEXTURE_2D_ARRAY),n.bindTexture(Z,Q.__webglTexture),$e(Z,v),v.mipmaps&&v.mipmaps.length>0)for(let ae=0;ae<v.mipmaps.length;ae++)Ke(k.__webglFramebuffer[ae],T,v,t.COLOR_ATTACHMENT0,Z,ae);else Ke(k.__webglFramebuffer,T,v,t.COLOR_ATTACHMENT0,Z,0);g(v)&&S(Z),n.unbindTexture()}T.depthBuffer&&j(T)}function se(T){const v=T.textures;for(let k=0,Q=v.length;k<Q;k++){const ce=v[k];if(g(ce)){const pe=E(T),ge=i.get(ce).__webglTexture;n.bindTexture(pe,ge),S(pe),n.unbindTexture()}}}const fe=[],me=[];function C(T){if(T.samples>0){if(ve(T)===!1){const v=T.textures,k=T.width,Q=T.height;let ce=t.COLOR_BUFFER_BIT;const pe=T.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,ge=i.get(T),Z=v.length>1;if(Z)for(let xe=0;xe<v.length;xe++)n.bindFramebuffer(t.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+xe,t.RENDERBUFFER,null),n.bindFramebuffer(t.FRAMEBUFFER,ge.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+xe,t.TEXTURE_2D,null,0);n.bindFramebuffer(t.READ_FRAMEBUFFER,ge.__webglMultisampledFramebuffer);const ae=T.texture.mipmaps;ae&&ae.length>0?n.bindFramebuffer(t.DRAW_FRAMEBUFFER,ge.__webglFramebuffer[0]):n.bindFramebuffer(t.DRAW_FRAMEBUFFER,ge.__webglFramebuffer);for(let xe=0;xe<v.length;xe++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(ce|=t.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(ce|=t.STENCIL_BUFFER_BIT)),Z){t.framebufferRenderbuffer(t.READ_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.RENDERBUFFER,ge.__webglColorRenderbuffer[xe]);const Pe=i.get(v[xe]).__webglTexture;t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,Pe,0)}t.blitFramebuffer(0,0,k,Q,0,0,k,Q,ce,t.NEAREST),u===!0&&(fe.length=0,me.length=0,fe.push(t.COLOR_ATTACHMENT0+xe),T.depthBuffer&&T.resolveDepthBuffer===!1&&(fe.push(pe),me.push(pe),t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,me)),t.invalidateFramebuffer(t.READ_FRAMEBUFFER,fe))}if(n.bindFramebuffer(t.READ_FRAMEBUFFER,null),n.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),Z)for(let xe=0;xe<v.length;xe++){n.bindFramebuffer(t.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+xe,t.RENDERBUFFER,ge.__webglColorRenderbuffer[xe]);const Pe=i.get(v[xe]).__webglTexture;n.bindFramebuffer(t.FRAMEBUFFER,ge.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+xe,t.TEXTURE_2D,Pe,0)}n.bindFramebuffer(t.DRAW_FRAMEBUFFER,ge.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.resolveDepthBuffer===!1&&u){const v=T.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,[v])}}}function re(T){return Math.min(s.maxSamples,T.samples)}function ve(T){const v=i.get(T);return T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function he(T){const v=a.render.frame;f.get(T)!==v&&(f.set(T,v),T.update())}function $(T,v){const k=T.colorSpace,Q=T.format,ce=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||k!==Ta&&k!==Ri&&(lt.getTransfer(k)===_t?(Q!==An||ce!==mn)&&Je("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):ht("WebGLTextures: Unsupported texture color space:",k)),v}function Ue(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(d.width=T.naturalWidth||T.width,d.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(d.width=T.displayWidth,d.height=T.displayHeight):(d.width=T.width,d.height=T.height),d}this.allocateTextureUnit=q,this.resetTextureUnits=ee,this.getTextureUnits=le,this.setTextureUnits=V,this.setTexture2D=te,this.setTexture2DArray=de,this.setTexture3D=Ee,this.setTextureCube=De,this.rebindTextures=ne,this.setupRenderTarget=J,this.updateRenderTargetMipmap=se,this.updateMultisampleRenderTarget=C,this.setupDepthRenderbuffer=j,this.setupFrameBufferTexture=Ke,this.useMultisampledRTT=ve,this.isReversedDepthBuffer=function(){return n.buffers.depth.getReversed()}}function ab(t,e){function n(i,s=Ri){let r;const a=lt.getTransfer(s);if(i===mn)return t.UNSIGNED_BYTE;if(i===dc)return t.UNSIGNED_SHORT_4_4_4_4;if(i===fc)return t.UNSIGNED_SHORT_5_5_5_1;if(i===Hf)return t.UNSIGNED_INT_5_9_9_9_REV;if(i===Wf)return t.UNSIGNED_INT_10F_11F_11F_REV;if(i===zf)return t.BYTE;if(i===Gf)return t.SHORT;if(i===xr)return t.UNSIGNED_SHORT;if(i===uc)return t.INT;if(i===Xn)return t.UNSIGNED_INT;if(i===Vn)return t.FLOAT;if(i===hi)return t.HALF_FLOAT;if(i===qf)return t.ALPHA;if(i===Xf)return t.RGB;if(i===An)return t.RGBA;if(i===pi)return t.DEPTH_COMPONENT;if(i===Qi)return t.DEPTH_STENCIL;if(i===jf)return t.RED;if(i===hc)return t.RED_INTEGER;if(i===ss)return t.RG;if(i===pc)return t.RG_INTEGER;if(i===mc)return t.RGBA_INTEGER;if(i===ua||i===da||i===fa||i===ha)if(a===_t)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===ua)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===da)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===fa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===ha)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===ua)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===da)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===fa)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===ha)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===ll||i===cl||i===ul||i===dl)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===ll)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===cl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===ul)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===dl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===fl||i===hl||i===pl||i===ml||i===gl||i===ba||i===_l)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===fl||i===hl)return a===_t?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===pl)return a===_t?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===ml)return r.COMPRESSED_R11_EAC;if(i===gl)return r.COMPRESSED_SIGNED_R11_EAC;if(i===ba)return r.COMPRESSED_RG11_EAC;if(i===_l)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===vl||i===yl||i===xl||i===Sl||i===bl||i===Ml||i===Tl||i===El||i===wl||i===Al||i===Pl||i===Cl||i===Rl||i===Il)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===vl)return a===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===yl)return a===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===xl)return a===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Sl)return a===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===bl)return a===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Ml)return a===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Tl)return a===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===El)return a===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===wl)return a===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Al)return a===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Pl)return a===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Cl)return a===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Rl)return a===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Il)return a===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Ll||i===Dl||i===Nl)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===Ll)return a===_t?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Dl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Nl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Ul||i===Fl||i===Ma||i===kl)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===Ul)return r.COMPRESSED_RED_RGTC1_EXT;if(i===Fl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Ma)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===kl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Sr?t.UNSIGNED_INT_24_8:t[i]!==void 0?t[i]:null}return{convert:n}}const ob=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,lb=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class cb{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,n){if(this.texture===null){const i=new ih(e.texture);(e.depthNear!==n.depthNear||e.depthFar!==n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){const n=e.cameras[0].viewport,i=new jn({vertexShader:ob,fragmentShader:lb,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new _n(new Ga(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class ub extends as{constructor(e,n){super();const i=this;let s=null,r=1,a=null,l="local-floor",u=1,d=null,f=null,m=null,p=null,o=null,h=null;const y=typeof XRWebGLBinding<"u",_=new cb,g={},S=n.getContextAttributes();let E=null,b=null;const L=[],w=[],D=new dt;let x=null;const R=new pn;R.viewport=new Ct;const O=new pn;O.viewport=new Ct;const U=[R,O],W=new y0;let ee=null,le=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(oe){let Ae=L[oe];return Ae===void 0&&(Ae=new mo,L[oe]=Ae),Ae.getTargetRaySpace()},this.getControllerGrip=function(oe){let Ae=L[oe];return Ae===void 0&&(Ae=new mo,L[oe]=Ae),Ae.getGripSpace()},this.getHand=function(oe){let Ae=L[oe];return Ae===void 0&&(Ae=new mo,L[oe]=Ae),Ae.getHandSpace()};function V(oe){const Ae=w.indexOf(oe.inputSource);if(Ae===-1)return;const ye=L[Ae];ye!==void 0&&(ye.update(oe.inputSource,oe.frame,d||a),ye.dispatchEvent({type:oe.type,data:oe.inputSource}))}function q(){s.removeEventListener("select",V),s.removeEventListener("selectstart",V),s.removeEventListener("selectend",V),s.removeEventListener("squeeze",V),s.removeEventListener("squeezestart",V),s.removeEventListener("squeezeend",V),s.removeEventListener("end",q),s.removeEventListener("inputsourceschange",z);for(let oe=0;oe<L.length;oe++){const Ae=w[oe];Ae!==null&&(w[oe]=null,L[oe].disconnect(Ae))}ee=null,le=null,_.reset();for(const oe in g)delete g[oe];e.setRenderTarget(E),o=null,p=null,m=null,s=null,b=null,$e.stop(),i.isPresenting=!1,e.setPixelRatio(x),e.setSize(D.width,D.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(oe){r=oe,i.isPresenting===!0&&Je("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(oe){l=oe,i.isPresenting===!0&&Je("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return d||a},this.setReferenceSpace=function(oe){d=oe},this.getBaseLayer=function(){return p!==null?p:o},this.getBinding=function(){return m===null&&y&&(m=new XRWebGLBinding(s,n)),m},this.getFrame=function(){return h},this.getSession=function(){return s},this.setSession=async function(oe){if(s=oe,s!==null){if(E=e.getRenderTarget(),s.addEventListener("select",V),s.addEventListener("selectstart",V),s.addEventListener("selectend",V),s.addEventListener("squeeze",V),s.addEventListener("squeezestart",V),s.addEventListener("squeezeend",V),s.addEventListener("end",q),s.addEventListener("inputsourceschange",z),S.xrCompatible!==!0&&await n.makeXRCompatible(),x=e.getPixelRatio(),e.getSize(D),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let ye=null,Xe=null,Ye=null;S.depth&&(Ye=S.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,ye=S.stencil?Qi:pi,Xe=S.stencil?Sr:Xn);const Ke={colorFormat:n.RGBA8,depthFormat:Ye,scaleFactor:r};m=this.getBinding(),p=m.createProjectionLayer(Ke),s.updateRenderState({layers:[p]}),e.setPixelRatio(1),e.setSize(p.textureWidth,p.textureHeight,!1),b=new Wn(p.textureWidth,p.textureHeight,{format:An,type:mn,depthTexture:new ks(p.textureWidth,p.textureHeight,Xe,void 0,void 0,void 0,void 0,void 0,void 0,ye),stencilBuffer:S.stencil,colorSpace:e.outputColorSpace,samples:S.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}else{const ye={antialias:S.antialias,alpha:!0,depth:S.depth,stencil:S.stencil,framebufferScaleFactor:r};o=new XRWebGLLayer(s,n,ye),s.updateRenderState({baseLayer:o}),e.setPixelRatio(1),e.setSize(o.framebufferWidth,o.framebufferHeight,!1),b=new Wn(o.framebufferWidth,o.framebufferHeight,{format:An,type:mn,colorSpace:e.outputColorSpace,stencilBuffer:S.stencil,resolveDepthBuffer:o.ignoreDepthValues===!1,resolveStencilBuffer:o.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(u),d=null,a=await s.requestReferenceSpace(l),$e.setContext(s),$e.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function z(oe){for(let Ae=0;Ae<oe.removed.length;Ae++){const ye=oe.removed[Ae],Xe=w.indexOf(ye);Xe>=0&&(w[Xe]=null,L[Xe].disconnect(ye))}for(let Ae=0;Ae<oe.added.length;Ae++){const ye=oe.added[Ae];let Xe=w.indexOf(ye);if(Xe===-1){for(let Ke=0;Ke<L.length;Ke++)if(Ke>=w.length){w.push(ye),Xe=Ke;break}else if(w[Ke]===null){w[Ke]=ye,Xe=Ke;break}if(Xe===-1)break}const Ye=L[Xe];Ye&&Ye.connect(ye)}}const te=new H,de=new H;function Ee(oe,Ae,ye){te.setFromMatrixPosition(Ae.matrixWorld),de.setFromMatrixPosition(ye.matrixWorld);const Xe=te.distanceTo(de),Ye=Ae.projectionMatrix.elements,Ke=ye.projectionMatrix.elements,I=Ye[14]/(Ye[10]-1),N=Ye[14]/(Ye[10]+1),j=(Ye[9]+1)/Ye[5],ne=(Ye[9]-1)/Ye[5],J=(Ye[8]-1)/Ye[0],se=(Ke[8]+1)/Ke[0],fe=I*J,me=I*se,C=Xe/(-J+se),re=C*-J;if(Ae.matrixWorld.decompose(oe.position,oe.quaternion,oe.scale),oe.translateX(re),oe.translateZ(C),oe.matrixWorld.compose(oe.position,oe.quaternion,oe.scale),oe.matrixWorldInverse.copy(oe.matrixWorld).invert(),Ye[10]===-1)oe.projectionMatrix.copy(Ae.projectionMatrix),oe.projectionMatrixInverse.copy(Ae.projectionMatrixInverse);else{const ve=I+C,he=N+C,$=fe-re,Ue=me+(Xe-re),T=j*N/he*ve,v=ne*N/he*ve;oe.projectionMatrix.makePerspective($,Ue,T,v,ve,he),oe.projectionMatrixInverse.copy(oe.projectionMatrix).invert()}}function De(oe,Ae){Ae===null?oe.matrixWorld.copy(oe.matrix):oe.matrixWorld.multiplyMatrices(Ae.matrixWorld,oe.matrix),oe.matrixWorldInverse.copy(oe.matrixWorld).invert()}this.updateCamera=function(oe){if(s===null)return;let Ae=oe.near,ye=oe.far;_.texture!==null&&(_.depthNear>0&&(Ae=_.depthNear),_.depthFar>0&&(ye=_.depthFar)),W.near=O.near=R.near=Ae,W.far=O.far=R.far=ye,(ee!==W.near||le!==W.far)&&(s.updateRenderState({depthNear:W.near,depthFar:W.far}),ee=W.near,le=W.far),W.layers.mask=oe.layers.mask|6,R.layers.mask=W.layers.mask&-5,O.layers.mask=W.layers.mask&-3;const Xe=oe.parent,Ye=W.cameras;De(W,Xe);for(let Ke=0;Ke<Ye.length;Ke++)De(Ye[Ke],Xe);Ye.length===2?Ee(W,R,O):W.projectionMatrix.copy(R.projectionMatrix),Fe(oe,W,Xe)};function Fe(oe,Ae,ye){ye===null?oe.matrix.copy(Ae.matrixWorld):(oe.matrix.copy(ye.matrixWorld),oe.matrix.invert(),oe.matrix.multiply(Ae.matrixWorld)),oe.matrix.decompose(oe.position,oe.quaternion,oe.scale),oe.updateMatrixWorld(!0),oe.projectionMatrix.copy(Ae.projectionMatrix),oe.projectionMatrixInverse.copy(Ae.projectionMatrixInverse),oe.isPerspectiveCamera&&(oe.fov=Vl*2*Math.atan(1/oe.projectionMatrix.elements[5]),oe.zoom=1)}this.getCamera=function(){return W},this.getFoveation=function(){if(!(p===null&&o===null))return u},this.setFoveation=function(oe){u=oe,p!==null&&(p.fixedFoveation=oe),o!==null&&o.fixedFoveation!==void 0&&(o.fixedFoveation=oe)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(W)},this.getCameraTexture=function(oe){return g[oe]};let ot=null;function mt(oe,Ae){if(f=Ae.getViewerPose(d||a),h=Ae,f!==null){const ye=f.views;o!==null&&(e.setRenderTargetFramebuffer(b,o.framebuffer),e.setRenderTarget(b));let Xe=!1;ye.length!==W.cameras.length&&(W.cameras.length=0,Xe=!0);for(let N=0;N<ye.length;N++){const j=ye[N];let ne=null;if(o!==null)ne=o.getViewport(j);else{const se=m.getViewSubImage(p,j);ne=se.viewport,N===0&&(e.setRenderTargetTextures(b,se.colorTexture,se.depthStencilTexture),e.setRenderTarget(b))}let J=U[N];J===void 0&&(J=new pn,J.layers.enable(N),J.viewport=new Ct,U[N]=J),J.matrix.fromArray(j.transform.matrix),J.matrix.decompose(J.position,J.quaternion,J.scale),J.projectionMatrix.fromArray(j.projectionMatrix),J.projectionMatrixInverse.copy(J.projectionMatrix).invert(),J.viewport.set(ne.x,ne.y,ne.width,ne.height),N===0&&(W.matrix.copy(J.matrix),W.matrix.decompose(W.position,W.quaternion,W.scale)),Xe===!0&&W.cameras.push(J)}const Ye=s.enabledFeatures;if(Ye&&Ye.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&y){m=i.getBinding();const N=m.getDepthInformation(ye[0]);N&&N.isValid&&N.texture&&_.init(N,s.renderState)}if(Ye&&Ye.includes("camera-access")&&y){e.state.unbindTexture(),m=i.getBinding();for(let N=0;N<ye.length;N++){const j=ye[N].camera;if(j){let ne=g[j];ne||(ne=new ih,g[j]=ne);const J=m.getCameraImage(j);ne.sourceTexture=J}}}}for(let ye=0;ye<L.length;ye++){const Xe=w[ye],Ye=L[ye];Xe!==null&&Ye!==void 0&&Ye.update(Xe,Ae,d||a)}ot&&ot(oe,Ae),Ae.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:Ae}),h=null}const $e=new lh;$e.setAnimationLoop(mt),this.setAnimationLoop=function(oe){ot=oe},this.dispose=function(){}}}const db=new Rt,mh=new et;mh.set(-1,0,0,0,1,0,0,0,1);function fb(t,e){function n(_,g){_.matrixAutoUpdate===!0&&_.updateMatrix(),g.value.copy(_.matrix)}function i(_,g){g.color.getRGB(_.fogColor.value,sh(t)),g.isFog?(_.fogNear.value=g.near,_.fogFar.value=g.far):g.isFogExp2&&(_.fogDensity.value=g.density)}function s(_,g,S,E,b){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(_,g):g.isMeshLambertMaterial?(r(_,g),g.envMap&&(_.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(_,g),m(_,g)):g.isMeshPhongMaterial?(r(_,g),f(_,g),g.envMap&&(_.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(_,g),p(_,g),g.isMeshPhysicalMaterial&&o(_,g,b)):g.isMeshMatcapMaterial?(r(_,g),h(_,g)):g.isMeshDepthMaterial?r(_,g):g.isMeshDistanceMaterial?(r(_,g),y(_,g)):g.isMeshNormalMaterial?r(_,g):g.isLineBasicMaterial?(a(_,g),g.isLineDashedMaterial&&l(_,g)):g.isPointsMaterial?u(_,g,S,E):g.isSpriteMaterial?d(_,g):g.isShadowMaterial?(_.color.value.copy(g.color),_.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(_,g){_.opacity.value=g.opacity,g.color&&_.diffuse.value.copy(g.color),g.emissive&&_.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(_.map.value=g.map,n(g.map,_.mapTransform)),g.alphaMap&&(_.alphaMap.value=g.alphaMap,n(g.alphaMap,_.alphaMapTransform)),g.bumpMap&&(_.bumpMap.value=g.bumpMap,n(g.bumpMap,_.bumpMapTransform),_.bumpScale.value=g.bumpScale,g.side===an&&(_.bumpScale.value*=-1)),g.normalMap&&(_.normalMap.value=g.normalMap,n(g.normalMap,_.normalMapTransform),_.normalScale.value.copy(g.normalScale),g.side===an&&_.normalScale.value.negate()),g.displacementMap&&(_.displacementMap.value=g.displacementMap,n(g.displacementMap,_.displacementMapTransform),_.displacementScale.value=g.displacementScale,_.displacementBias.value=g.displacementBias),g.emissiveMap&&(_.emissiveMap.value=g.emissiveMap,n(g.emissiveMap,_.emissiveMapTransform)),g.specularMap&&(_.specularMap.value=g.specularMap,n(g.specularMap,_.specularMapTransform)),g.alphaTest>0&&(_.alphaTest.value=g.alphaTest);const S=e.get(g),E=S.envMap,b=S.envMapRotation;E&&(_.envMap.value=E,_.envMapRotation.value.setFromMatrix4(db.makeRotationFromEuler(b)).transpose(),E.isCubeTexture&&E.isRenderTargetTexture===!1&&_.envMapRotation.value.premultiply(mh),_.reflectivity.value=g.reflectivity,_.ior.value=g.ior,_.refractionRatio.value=g.refractionRatio),g.lightMap&&(_.lightMap.value=g.lightMap,_.lightMapIntensity.value=g.lightMapIntensity,n(g.lightMap,_.lightMapTransform)),g.aoMap&&(_.aoMap.value=g.aoMap,_.aoMapIntensity.value=g.aoMapIntensity,n(g.aoMap,_.aoMapTransform))}function a(_,g){_.diffuse.value.copy(g.color),_.opacity.value=g.opacity,g.map&&(_.map.value=g.map,n(g.map,_.mapTransform))}function l(_,g){_.dashSize.value=g.dashSize,_.totalSize.value=g.dashSize+g.gapSize,_.scale.value=g.scale}function u(_,g,S,E){_.diffuse.value.copy(g.color),_.opacity.value=g.opacity,_.size.value=g.size*S,_.scale.value=E*.5,g.map&&(_.map.value=g.map,n(g.map,_.uvTransform)),g.alphaMap&&(_.alphaMap.value=g.alphaMap,n(g.alphaMap,_.alphaMapTransform)),g.alphaTest>0&&(_.alphaTest.value=g.alphaTest)}function d(_,g){_.diffuse.value.copy(g.color),_.opacity.value=g.opacity,_.rotation.value=g.rotation,g.map&&(_.map.value=g.map,n(g.map,_.mapTransform)),g.alphaMap&&(_.alphaMap.value=g.alphaMap,n(g.alphaMap,_.alphaMapTransform)),g.alphaTest>0&&(_.alphaTest.value=g.alphaTest)}function f(_,g){_.specular.value.copy(g.specular),_.shininess.value=Math.max(g.shininess,1e-4)}function m(_,g){g.gradientMap&&(_.gradientMap.value=g.gradientMap)}function p(_,g){_.metalness.value=g.metalness,g.metalnessMap&&(_.metalnessMap.value=g.metalnessMap,n(g.metalnessMap,_.metalnessMapTransform)),_.roughness.value=g.roughness,g.roughnessMap&&(_.roughnessMap.value=g.roughnessMap,n(g.roughnessMap,_.roughnessMapTransform)),g.envMap&&(_.envMapIntensity.value=g.envMapIntensity)}function o(_,g,S){_.ior.value=g.ior,g.sheen>0&&(_.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),_.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(_.sheenColorMap.value=g.sheenColorMap,n(g.sheenColorMap,_.sheenColorMapTransform)),g.sheenRoughnessMap&&(_.sheenRoughnessMap.value=g.sheenRoughnessMap,n(g.sheenRoughnessMap,_.sheenRoughnessMapTransform))),g.clearcoat>0&&(_.clearcoat.value=g.clearcoat,_.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(_.clearcoatMap.value=g.clearcoatMap,n(g.clearcoatMap,_.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(_.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,n(g.clearcoatRoughnessMap,_.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(_.clearcoatNormalMap.value=g.clearcoatNormalMap,n(g.clearcoatNormalMap,_.clearcoatNormalMapTransform),_.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===an&&_.clearcoatNormalScale.value.negate())),g.dispersion>0&&(_.dispersion.value=g.dispersion),g.iridescence>0&&(_.iridescence.value=g.iridescence,_.iridescenceIOR.value=g.iridescenceIOR,_.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],_.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(_.iridescenceMap.value=g.iridescenceMap,n(g.iridescenceMap,_.iridescenceMapTransform)),g.iridescenceThicknessMap&&(_.iridescenceThicknessMap.value=g.iridescenceThicknessMap,n(g.iridescenceThicknessMap,_.iridescenceThicknessMapTransform))),g.transmission>0&&(_.transmission.value=g.transmission,_.transmissionSamplerMap.value=S.texture,_.transmissionSamplerSize.value.set(S.width,S.height),g.transmissionMap&&(_.transmissionMap.value=g.transmissionMap,n(g.transmissionMap,_.transmissionMapTransform)),_.thickness.value=g.thickness,g.thicknessMap&&(_.thicknessMap.value=g.thicknessMap,n(g.thicknessMap,_.thicknessMapTransform)),_.attenuationDistance.value=g.attenuationDistance,_.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(_.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(_.anisotropyMap.value=g.anisotropyMap,n(g.anisotropyMap,_.anisotropyMapTransform))),_.specularIntensity.value=g.specularIntensity,_.specularColor.value.copy(g.specularColor),g.specularColorMap&&(_.specularColorMap.value=g.specularColorMap,n(g.specularColorMap,_.specularColorMapTransform)),g.specularIntensityMap&&(_.specularIntensityMap.value=g.specularIntensityMap,n(g.specularIntensityMap,_.specularIntensityMapTransform))}function h(_,g){g.matcap&&(_.matcap.value=g.matcap)}function y(_,g){const S=e.get(g).light;_.referencePosition.value.setFromMatrixPosition(S.matrixWorld),_.nearDistance.value=S.shadow.camera.near,_.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function hb(t,e,n,i){let s={},r={},a=[];const l=t.getParameter(t.MAX_UNIFORM_BUFFER_BINDINGS);function u(S,E){const b=E.program;i.uniformBlockBinding(S,b)}function d(S,E){let b=s[S.id];b===void 0&&(h(S),b=f(S),s[S.id]=b,S.addEventListener("dispose",_));const L=E.program;i.updateUBOMapping(S,L);const w=e.render.frame;r[S.id]!==w&&(p(S),r[S.id]=w)}function f(S){const E=m();S.__bindingPointIndex=E;const b=t.createBuffer(),L=S.__size,w=S.usage;return t.bindBuffer(t.UNIFORM_BUFFER,b),t.bufferData(t.UNIFORM_BUFFER,L,w),t.bindBuffer(t.UNIFORM_BUFFER,null),t.bindBufferBase(t.UNIFORM_BUFFER,E,b),b}function m(){for(let S=0;S<l;S++)if(a.indexOf(S)===-1)return a.push(S),S;return ht("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(S){const E=s[S.id],b=S.uniforms,L=S.__cache;t.bindBuffer(t.UNIFORM_BUFFER,E);for(let w=0,D=b.length;w<D;w++){const x=Array.isArray(b[w])?b[w]:[b[w]];for(let R=0,O=x.length;R<O;R++){const U=x[R];if(o(U,w,R,L)===!0){const W=U.__offset,ee=Array.isArray(U.value)?U.value:[U.value];let le=0;for(let V=0;V<ee.length;V++){const q=ee[V],z=y(q);typeof q=="number"||typeof q=="boolean"?(U.__data[0]=q,t.bufferSubData(t.UNIFORM_BUFFER,W+le,U.__data)):q.isMatrix3?(U.__data[0]=q.elements[0],U.__data[1]=q.elements[1],U.__data[2]=q.elements[2],U.__data[3]=0,U.__data[4]=q.elements[3],U.__data[5]=q.elements[4],U.__data[6]=q.elements[5],U.__data[7]=0,U.__data[8]=q.elements[6],U.__data[9]=q.elements[7],U.__data[10]=q.elements[8],U.__data[11]=0):ArrayBuffer.isView(q)?U.__data.set(new q.constructor(q.buffer,q.byteOffset,U.__data.length)):(q.toArray(U.__data,le),le+=z.storage/Float32Array.BYTES_PER_ELEMENT)}t.bufferSubData(t.UNIFORM_BUFFER,W,U.__data)}}}t.bindBuffer(t.UNIFORM_BUFFER,null)}function o(S,E,b,L){const w=S.value,D=E+"_"+b;if(L[D]===void 0)return typeof w=="number"||typeof w=="boolean"?L[D]=w:ArrayBuffer.isView(w)?L[D]=w.slice():L[D]=w.clone(),!0;{const x=L[D];if(typeof w=="number"||typeof w=="boolean"){if(x!==w)return L[D]=w,!0}else{if(ArrayBuffer.isView(w))return!0;if(x.equals(w)===!1)return x.copy(w),!0}}return!1}function h(S){const E=S.uniforms;let b=0;const L=16;for(let D=0,x=E.length;D<x;D++){const R=Array.isArray(E[D])?E[D]:[E[D]];for(let O=0,U=R.length;O<U;O++){const W=R[O],ee=Array.isArray(W.value)?W.value:[W.value];for(let le=0,V=ee.length;le<V;le++){const q=ee[le],z=y(q),te=b%L,de=te%z.boundary,Ee=te+de;b+=de,Ee!==0&&L-Ee<z.storage&&(b+=L-Ee),W.__data=new Float32Array(z.storage/Float32Array.BYTES_PER_ELEMENT),W.__offset=b,b+=z.storage}}}const w=b%L;return w>0&&(b+=L-w),S.__size=b,S.__cache={},this}function y(S){const E={boundary:0,storage:0};return typeof S=="number"||typeof S=="boolean"?(E.boundary=4,E.storage=4):S.isVector2?(E.boundary=8,E.storage=8):S.isVector3||S.isColor?(E.boundary=16,E.storage=12):S.isVector4?(E.boundary=16,E.storage=16):S.isMatrix3?(E.boundary=48,E.storage=48):S.isMatrix4?(E.boundary=64,E.storage=64):S.isTexture?Je("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(S)?(E.boundary=16,E.storage=S.byteLength):Je("WebGLRenderer: Unsupported uniform value type.",S),E}function _(S){const E=S.target;E.removeEventListener("dispose",_);const b=a.indexOf(E.__bindingPointIndex);a.splice(b,1),t.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function g(){for(const S in s)t.deleteBuffer(s[S]);a=[],s={},r={}}return{bind:u,update:d,dispose:g}}const pb=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Fn=null;function mb(){return Fn===null&&(Fn=new t0(pb,16,16,ss,hi),Fn.name="DFG_LUT",Fn.minFilter=Kt,Fn.magFilter=Kt,Fn.wrapS=ai,Fn.wrapT=ai,Fn.generateMipmaps=!1,Fn.needsUpdate=!0),Fn}class gb{constructor(e={}){const{canvas:n=L_(),context:i=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:l=!1,premultipliedAlpha:u=!0,preserveDrawingBuffer:d=!1,powerPreference:f="default",failIfMajorPerformanceCaveat:m=!1,reversedDepthBuffer:p=!1,outputBufferType:o=mn}=e;this.isWebGLRenderer=!0;let h;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");h=i.getContextAttributes().alpha}else h=a;const y=o,_=new Set([mc,pc,hc]),g=new Set([mn,Xn,xr,Sr,dc,fc]),S=new Uint32Array(4),E=new Int32Array(4),b=new H;let L=null,w=null;const D=[],x=[];let R=null;this.domElement=n,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Hn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const O=this;let U=!1,W=null;this._outputColorSpace=xn;let ee=0,le=0,V=null,q=-1,z=null;const te=new Ct,de=new Ct;let Ee=null;const De=new ut(0);let Fe=0,ot=n.width,mt=n.height,$e=1,oe=null,Ae=null;const ye=new Ct(0,0,ot,mt),Xe=new Ct(0,0,ot,mt);let Ye=!1;const Ke=new yc;let I=!1,N=!1;const j=new Rt,ne=new H,J=new Ct,se={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let fe=!1;function me(){return V===null?$e:1}let C=i;function re(M,G){return n.getContext(M,G)}try{const M={alpha:!0,depth:s,stencil:r,antialias:l,premultipliedAlpha:u,preserveDrawingBuffer:d,powerPreference:f,failIfMajorPerformanceCaveat:m};if("setAttribute"in n&&n.setAttribute("data-engine",`three.js r${lc}`),n.addEventListener("webglcontextlost",ue,!1),n.addEventListener("webglcontextrestored",He,!1),n.addEventListener("webglcontextcreationerror",tt,!1),C===null){const G="webgl2";if(C=re(G,M),C===null)throw re(G)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(M){throw ht("WebGLRenderer: "+M.message),M}let ve,he,$,Ue,T,v,k,Q,ce,pe,ge,Z,ae,xe,Pe,Se,_e,Qe,st,pt,F,be,ie;function Ne(){ve=new mx(C),ve.init(),F=new ab(C,ve),he=new ox(C,ve,e,F),$=new sb(C,ve),he.reversedDepthBuffer&&p&&$.buffers.depth.setReversed(!0),Ue=new vx(C),T=new WS,v=new rb(C,ve,$,T,he,F,Ue),k=new px(O),Q=new b0(C),be=new rx(C,Q),ce=new gx(C,Q,Ue,be),pe=new xx(C,ce,Q,be,Ue),Qe=new yx(C,he,v),Pe=new lx(T),ge=new HS(O,k,ve,he,be,Pe),Z=new fb(O,T),ae=new XS,xe=new QS(ve),_e=new sx(O,k,$,pe,h,u),Se=new ib(O,pe,he),ie=new hb(C,Ue,he,$),st=new ax(C,ve,Ue),pt=new _x(C,ve,Ue),Ue.programs=ge.programs,O.capabilities=he,O.extensions=ve,O.properties=T,O.renderLists=ae,O.shadowMap=Se,O.state=$,O.info=Ue}Ne(),y!==mn&&(R=new bx(y,n.width,n.height,s,r));const Te=new ub(O,C);this.xr=Te,this.getContext=function(){return C},this.getContextAttributes=function(){return C.getContextAttributes()},this.forceContextLoss=function(){const M=ve.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){const M=ve.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return $e},this.setPixelRatio=function(M){M!==void 0&&($e=M,this.setSize(ot,mt,!1))},this.getSize=function(M){return M.set(ot,mt)},this.setSize=function(M,G,K=!0){if(Te.isPresenting){Je("WebGLRenderer: Can't change size while VR device is presenting.");return}ot=M,mt=G,n.width=Math.floor(M*$e),n.height=Math.floor(G*$e),K===!0&&(n.style.width=M+"px",n.style.height=G+"px"),R!==null&&R.setSize(n.width,n.height),this.setViewport(0,0,M,G)},this.getDrawingBufferSize=function(M){return M.set(ot*$e,mt*$e).floor()},this.setDrawingBufferSize=function(M,G,K){ot=M,mt=G,$e=K,n.width=Math.floor(M*K),n.height=Math.floor(G*K),this.setViewport(0,0,M,G)},this.setEffects=function(M){if(y===mn){ht("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(M){for(let G=0;G<M.length;G++)if(M[G].isOutputPass===!0){Je("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}R.setEffects(M||[])},this.getCurrentViewport=function(M){return M.copy(te)},this.getViewport=function(M){return M.copy(ye)},this.setViewport=function(M,G,K,X){M.isVector4?ye.set(M.x,M.y,M.z,M.w):ye.set(M,G,K,X),$.viewport(te.copy(ye).multiplyScalar($e).round())},this.getScissor=function(M){return M.copy(Xe)},this.setScissor=function(M,G,K,X){M.isVector4?Xe.set(M.x,M.y,M.z,M.w):Xe.set(M,G,K,X),$.scissor(de.copy(Xe).multiplyScalar($e).round())},this.getScissorTest=function(){return Ye},this.setScissorTest=function(M){$.setScissorTest(Ye=M)},this.setOpaqueSort=function(M){oe=M},this.setTransparentSort=function(M){Ae=M},this.getClearColor=function(M){return M.copy(_e.getClearColor())},this.setClearColor=function(){_e.setClearColor(...arguments)},this.getClearAlpha=function(){return _e.getClearAlpha()},this.setClearAlpha=function(){_e.setClearAlpha(...arguments)},this.clear=function(M=!0,G=!0,K=!0){let X=0;if(M){let Y=!1;if(V!==null){const Ie=V.texture.format;Y=_.has(Ie)}if(Y){const Ie=V.texture.type,Oe=g.has(Ie),Re=_e.getClearColor(),Ve=_e.getClearAlpha(),We=Re.r,nt=Re.g,at=Re.b;Oe?(S[0]=We,S[1]=nt,S[2]=at,S[3]=Ve,C.clearBufferuiv(C.COLOR,0,S)):(E[0]=We,E[1]=nt,E[2]=at,E[3]=Ve,C.clearBufferiv(C.COLOR,0,E))}else X|=C.COLOR_BUFFER_BIT}G&&(X|=C.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),K&&(X|=C.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),X!==0&&C.clear(X)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(M){M.setRenderer(this),W=M},this.dispose=function(){n.removeEventListener("webglcontextlost",ue,!1),n.removeEventListener("webglcontextrestored",He,!1),n.removeEventListener("webglcontextcreationerror",tt,!1),_e.dispose(),ae.dispose(),xe.dispose(),T.dispose(),k.dispose(),pe.dispose(),be.dispose(),ie.dispose(),ge.dispose(),Te.dispose(),Te.removeEventListener("sessionstart",Pc),Te.removeEventListener("sessionend",Cc),ki.stop()};function ue(M){M.preventDefault(),Pu("WebGLRenderer: Context Lost."),U=!0}function He(){Pu("WebGLRenderer: Context Restored."),U=!1;const M=Ue.autoReset,G=Se.enabled,K=Se.autoUpdate,X=Se.needsUpdate,Y=Se.type;Ne(),Ue.autoReset=M,Se.enabled=G,Se.autoUpdate=K,Se.needsUpdate=X,Se.type=Y}function tt(M){ht("WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function It(M){const G=M.target;G.removeEventListener("dispose",It),vt(G)}function vt(M){Yn(M),T.remove(M)}function Yn(M){const G=T.get(M).programs;G!==void 0&&(G.forEach(function(K){ge.releaseProgram(K)}),M.isShaderMaterial&&ge.releaseShaderCache(M))}this.renderBufferDirect=function(M,G,K,X,Y,Ie){G===null&&(G=se);const Oe=Y.isMesh&&Y.matrixWorld.determinant()<0,Re=vh(M,G,K,X,Y);$.setMaterial(X,Oe);let Ve=K.index,We=1;if(X.wireframe===!0){if(Ve=ce.getWireframeAttribute(K),Ve===void 0)return;We=2}const nt=K.drawRange,at=K.attributes.position;let qe=nt.start*We,yt=(nt.start+nt.count)*We;Ie!==null&&(qe=Math.max(qe,Ie.start*We),yt=Math.min(yt,(Ie.start+Ie.count)*We)),Ve!==null?(qe=Math.max(qe,0),yt=Math.min(yt,Ve.count)):at!=null&&(qe=Math.max(qe,0),yt=Math.min(yt,at.count));const Lt=yt-qe;if(Lt<0||Lt===1/0)return;be.setup(Y,X,Re,K,Ve);let At,St=st;if(Ve!==null&&(At=Q.get(Ve),St=pt,St.setIndex(At)),Y.isMesh)X.wireframe===!0?($.setLineWidth(X.wireframeLinewidth*me()),St.setMode(C.LINES)):St.setMode(C.TRIANGLES);else if(Y.isLine){let Ht=X.linewidth;Ht===void 0&&(Ht=1),$.setLineWidth(Ht*me()),Y.isLineSegments?St.setMode(C.LINES):Y.isLineLoop?St.setMode(C.LINE_LOOP):St.setMode(C.LINE_STRIP)}else Y.isPoints?St.setMode(C.POINTS):Y.isSprite&&St.setMode(C.TRIANGLES);if(Y.isBatchedMesh)if(ve.get("WEBGL_multi_draw"))St.renderMultiDraw(Y._multiDrawStarts,Y._multiDrawCounts,Y._multiDrawCount);else{const Ht=Y._multiDrawStarts,ke=Y._multiDrawCounts,ln=Y._multiDrawCount,ft=Ve?Q.get(Ve).bytesPerElement:1,vn=T.get(X).currentProgram.getUniforms();for(let Dn=0;Dn<ln;Dn++)vn.setValue(C,"_gl_DrawID",Dn),St.render(Ht[Dn]/ft,ke[Dn])}else if(Y.isInstancedMesh)St.renderInstances(qe,Lt,Y.count);else if(K.isInstancedBufferGeometry){const Ht=K._maxInstanceCount!==void 0?K._maxInstanceCount:1/0,ke=Math.min(K.instanceCount,Ht);St.renderInstances(qe,Lt,ke)}else St.render(qe,Lt)};function Ln(M,G,K){M.transparent===!0&&M.side===ri&&M.forceSinglePass===!1?(M.side=an,M.needsUpdate=!0,Rr(M,G,K),M.side=Ni,M.needsUpdate=!0,Rr(M,G,K),M.side=ri):Rr(M,G,K)}this.compile=function(M,G,K=null){K===null&&(K=M),w=xe.get(K),w.init(G),x.push(w),K.traverseVisible(function(Y){Y.isLight&&Y.layers.test(G.layers)&&(w.pushLight(Y),Y.castShadow&&w.pushShadow(Y))}),M!==K&&M.traverseVisible(function(Y){Y.isLight&&Y.layers.test(G.layers)&&(w.pushLight(Y),Y.castShadow&&w.pushShadow(Y))}),w.setupLights();const X=new Set;return M.traverse(function(Y){if(!(Y.isMesh||Y.isPoints||Y.isLine||Y.isSprite))return;const Ie=Y.material;if(Ie)if(Array.isArray(Ie))for(let Oe=0;Oe<Ie.length;Oe++){const Re=Ie[Oe];Ln(Re,K,Y),X.add(Re)}else Ln(Ie,K,Y),X.add(Ie)}),w=x.pop(),X},this.compileAsync=function(M,G,K=null){const X=this.compile(M,G,K);return new Promise(Y=>{function Ie(){if(X.forEach(function(Oe){T.get(Oe).currentProgram.isReady()&&X.delete(Oe)}),X.size===0){Y(M);return}setTimeout(Ie,10)}ve.get("KHR_parallel_shader_compile")!==null?Ie():setTimeout(Ie,10)})};let qa=null;function gh(M){qa&&qa(M)}function Pc(){ki.stop()}function Cc(){ki.start()}const ki=new lh;ki.setAnimationLoop(gh),typeof self<"u"&&ki.setContext(self),this.setAnimationLoop=function(M){qa=M,Te.setAnimationLoop(M),M===null?ki.stop():ki.start()},Te.addEventListener("sessionstart",Pc),Te.addEventListener("sessionend",Cc),this.render=function(M,G){if(G!==void 0&&G.isCamera!==!0){ht("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(U===!0)return;W!==null&&W.renderStart(M,G);const K=Te.enabled===!0&&Te.isPresenting===!0,X=R!==null&&(V===null||K)&&R.begin(O,V);if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),G.parent===null&&G.matrixWorldAutoUpdate===!0&&G.updateMatrixWorld(),Te.enabled===!0&&Te.isPresenting===!0&&(R===null||R.isCompositing()===!1)&&(Te.cameraAutoUpdate===!0&&Te.updateCamera(G),G=Te.getCamera()),M.isScene===!0&&M.onBeforeRender(O,M,G,V),w=xe.get(M,x.length),w.init(G),w.state.textureUnits=v.getTextureUnits(),x.push(w),j.multiplyMatrices(G.projectionMatrix,G.matrixWorldInverse),Ke.setFromProjectionMatrix(j,zn,G.reversedDepth),N=this.localClippingEnabled,I=Pe.init(this.clippingPlanes,N),L=ae.get(M,D.length),L.init(),D.push(L),Te.enabled===!0&&Te.isPresenting===!0){const Oe=O.xr.getDepthSensingMesh();Oe!==null&&Xa(Oe,G,-1/0,O.sortObjects)}Xa(M,G,0,O.sortObjects),L.finish(),O.sortObjects===!0&&L.sort(oe,Ae),fe=Te.enabled===!1||Te.isPresenting===!1||Te.hasDepthSensing()===!1,fe&&_e.addToRenderList(L,M),this.info.render.frame++,I===!0&&Pe.beginShadows();const Y=w.state.shadowsArray;if(Se.render(Y,M,G),I===!0&&Pe.endShadows(),this.info.autoReset===!0&&this.info.reset(),(X&&R.hasRenderPass())===!1){const Oe=L.opaque,Re=L.transmissive;if(w.setupLights(),G.isArrayCamera){const Ve=G.cameras;if(Re.length>0)for(let We=0,nt=Ve.length;We<nt;We++){const at=Ve[We];Ic(Oe,Re,M,at)}fe&&_e.render(M);for(let We=0,nt=Ve.length;We<nt;We++){const at=Ve[We];Rc(L,M,at,at.viewport)}}else Re.length>0&&Ic(Oe,Re,M,G),fe&&_e.render(M),Rc(L,M,G)}V!==null&&le===0&&(v.updateMultisampleRenderTarget(V),v.updateRenderTargetMipmap(V)),X&&R.end(O),M.isScene===!0&&M.onAfterRender(O,M,G),be.resetDefaultState(),q=-1,z=null,x.pop(),x.length>0?(w=x[x.length-1],v.setTextureUnits(w.state.textureUnits),I===!0&&Pe.setGlobalState(O.clippingPlanes,w.state.camera)):w=null,D.pop(),D.length>0?L=D[D.length-1]:L=null,W!==null&&W.renderEnd()};function Xa(M,G,K,X){if(M.visible===!1)return;if(M.layers.test(G.layers)){if(M.isGroup)K=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(G);else if(M.isLightProbeGrid)w.pushLightProbeGrid(M);else if(M.isLight)w.pushLight(M),M.castShadow&&w.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||Ke.intersectsSprite(M)){X&&J.setFromMatrixPosition(M.matrixWorld).applyMatrix4(j);const Oe=pe.update(M),Re=M.material;Re.visible&&L.push(M,Oe,Re,K,J.z,null)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||Ke.intersectsObject(M))){const Oe=pe.update(M),Re=M.material;if(X&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),J.copy(M.boundingSphere.center)):(Oe.boundingSphere===null&&Oe.computeBoundingSphere(),J.copy(Oe.boundingSphere.center)),J.applyMatrix4(M.matrixWorld).applyMatrix4(j)),Array.isArray(Re)){const Ve=Oe.groups;for(let We=0,nt=Ve.length;We<nt;We++){const at=Ve[We],qe=Re[at.materialIndex];qe&&qe.visible&&L.push(M,Oe,qe,K,J.z,at)}}else Re.visible&&L.push(M,Oe,Re,K,J.z,null)}}const Ie=M.children;for(let Oe=0,Re=Ie.length;Oe<Re;Oe++)Xa(Ie[Oe],G,K,X)}function Rc(M,G,K,X){const{opaque:Y,transmissive:Ie,transparent:Oe}=M;w.setupLightsView(K),I===!0&&Pe.setGlobalState(O.clippingPlanes,K),X&&$.viewport(te.copy(X)),Y.length>0&&Cr(Y,G,K),Ie.length>0&&Cr(Ie,G,K),Oe.length>0&&Cr(Oe,G,K),$.buffers.depth.setTest(!0),$.buffers.depth.setMask(!0),$.buffers.color.setMask(!0),$.setPolygonOffset(!1)}function Ic(M,G,K,X){if((K.isScene===!0?K.overrideMaterial:null)!==null)return;if(w.state.transmissionRenderTarget[X.id]===void 0){const qe=ve.has("EXT_color_buffer_half_float")||ve.has("EXT_color_buffer_float");w.state.transmissionRenderTarget[X.id]=new Wn(1,1,{generateMipmaps:!0,type:qe?hi:mn,minFilter:Zi,samples:Math.max(4,he.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:lt.workingColorSpace})}const Ie=w.state.transmissionRenderTarget[X.id],Oe=X.viewport||te;Ie.setSize(Oe.z*O.transmissionResolutionScale,Oe.w*O.transmissionResolutionScale);const Re=O.getRenderTarget(),Ve=O.getActiveCubeFace(),We=O.getActiveMipmapLevel();O.setRenderTarget(Ie),O.getClearColor(De),Fe=O.getClearAlpha(),Fe<1&&O.setClearColor(16777215,.5),O.clear(),fe&&_e.render(K);const nt=O.toneMapping;O.toneMapping=Hn;const at=X.viewport;if(X.viewport!==void 0&&(X.viewport=void 0),w.setupLightsView(X),I===!0&&Pe.setGlobalState(O.clippingPlanes,X),Cr(M,K,X),v.updateMultisampleRenderTarget(Ie),v.updateRenderTargetMipmap(Ie),ve.has("WEBGL_multisampled_render_to_texture")===!1){let qe=!1;for(let yt=0,Lt=G.length;yt<Lt;yt++){const At=G[yt],{object:St,geometry:Ht,material:ke,group:ln}=At;if(ke.side===ri&&St.layers.test(X.layers)){const ft=ke.side;ke.side=an,ke.needsUpdate=!0,Lc(St,K,X,Ht,ke,ln),ke.side=ft,ke.needsUpdate=!0,qe=!0}}qe===!0&&(v.updateMultisampleRenderTarget(Ie),v.updateRenderTargetMipmap(Ie))}O.setRenderTarget(Re,Ve,We),O.setClearColor(De,Fe),at!==void 0&&(X.viewport=at),O.toneMapping=nt}function Cr(M,G,K){const X=G.isScene===!0?G.overrideMaterial:null;for(let Y=0,Ie=M.length;Y<Ie;Y++){const Oe=M[Y],{object:Re,geometry:Ve,group:We}=Oe;let nt=Oe.material;nt.allowOverride===!0&&X!==null&&(nt=X),Re.layers.test(K.layers)&&Lc(Re,G,K,Ve,nt,We)}}function Lc(M,G,K,X,Y,Ie){M.onBeforeRender(O,G,K,X,Y,Ie),M.modelViewMatrix.multiplyMatrices(K.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),Y.onBeforeRender(O,G,K,X,M,Ie),Y.transparent===!0&&Y.side===ri&&Y.forceSinglePass===!1?(Y.side=an,Y.needsUpdate=!0,O.renderBufferDirect(K,G,X,Y,M,Ie),Y.side=Ni,Y.needsUpdate=!0,O.renderBufferDirect(K,G,X,Y,M,Ie),Y.side=ri):O.renderBufferDirect(K,G,X,Y,M,Ie),M.onAfterRender(O,G,K,X,Y,Ie)}function Rr(M,G,K){G.isScene!==!0&&(G=se);const X=T.get(M),Y=w.state.lights,Ie=w.state.shadowsArray,Oe=Y.state.version,Re=ge.getParameters(M,Y.state,Ie,G,K,w.state.lightProbeGridArray),Ve=ge.getProgramCacheKey(Re);let We=X.programs;X.environment=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?G.environment:null,X.fog=G.fog;const nt=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap;X.envMap=k.get(M.envMap||X.environment,nt),X.envMapRotation=X.environment!==null&&M.envMap===null?G.environmentRotation:M.envMapRotation,We===void 0&&(M.addEventListener("dispose",It),We=new Map,X.programs=We);let at=We.get(Ve);if(at!==void 0){if(X.currentProgram===at&&X.lightsStateVersion===Oe)return Nc(M,Re),at}else Re.uniforms=ge.getUniforms(M),W!==null&&M.isNodeMaterial&&W.build(M,K,Re),M.onBeforeCompile(Re,O),at=ge.acquireProgram(Re,Ve),We.set(Ve,at),X.uniforms=Re.uniforms;const qe=X.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(qe.clippingPlanes=Pe.uniform),Nc(M,Re),X.needsLights=xh(M),X.lightsStateVersion=Oe,X.needsLights&&(qe.ambientLightColor.value=Y.state.ambient,qe.lightProbe.value=Y.state.probe,qe.directionalLights.value=Y.state.directional,qe.directionalLightShadows.value=Y.state.directionalShadow,qe.spotLights.value=Y.state.spot,qe.spotLightShadows.value=Y.state.spotShadow,qe.rectAreaLights.value=Y.state.rectArea,qe.ltc_1.value=Y.state.rectAreaLTC1,qe.ltc_2.value=Y.state.rectAreaLTC2,qe.pointLights.value=Y.state.point,qe.pointLightShadows.value=Y.state.pointShadow,qe.hemisphereLights.value=Y.state.hemi,qe.directionalShadowMatrix.value=Y.state.directionalShadowMatrix,qe.spotLightMatrix.value=Y.state.spotLightMatrix,qe.spotLightMap.value=Y.state.spotLightMap,qe.pointShadowMatrix.value=Y.state.pointShadowMatrix),X.lightProbeGrid=w.state.lightProbeGridArray.length>0,X.currentProgram=at,X.uniformsList=null,at}function Dc(M){if(M.uniformsList===null){const G=M.currentProgram.getUniforms();M.uniformsList=pa.seqWithValue(G.seq,M.uniforms)}return M.uniformsList}function Nc(M,G){const K=T.get(M);K.outputColorSpace=G.outputColorSpace,K.batching=G.batching,K.batchingColor=G.batchingColor,K.instancing=G.instancing,K.instancingColor=G.instancingColor,K.instancingMorph=G.instancingMorph,K.skinning=G.skinning,K.morphTargets=G.morphTargets,K.morphNormals=G.morphNormals,K.morphColors=G.morphColors,K.morphTargetsCount=G.morphTargetsCount,K.numClippingPlanes=G.numClippingPlanes,K.numIntersection=G.numClipIntersection,K.vertexAlphas=G.vertexAlphas,K.vertexTangents=G.vertexTangents,K.toneMapping=G.toneMapping}function _h(M,G){if(M.length===0)return null;if(M.length===1)return M[0].texture!==null?M[0]:null;b.setFromMatrixPosition(G.matrixWorld);for(let K=0,X=M.length;K<X;K++){const Y=M[K];if(Y.texture!==null&&Y.boundingBox.containsPoint(b))return Y}return null}function vh(M,G,K,X,Y){G.isScene!==!0&&(G=se),v.resetTextureUnits();const Ie=G.fog,Oe=X.isMeshStandardMaterial||X.isMeshLambertMaterial||X.isMeshPhongMaterial?G.environment:null,Re=V===null?O.outputColorSpace:V.isXRRenderTarget===!0?V.texture.colorSpace:lt.workingColorSpace,Ve=X.isMeshStandardMaterial||X.isMeshLambertMaterial&&!X.envMap||X.isMeshPhongMaterial&&!X.envMap,We=k.get(X.envMap||Oe,Ve),nt=X.vertexColors===!0&&!!K.attributes.color&&K.attributes.color.itemSize===4,at=!!K.attributes.tangent&&(!!X.normalMap||X.anisotropy>0),qe=!!K.morphAttributes.position,yt=!!K.morphAttributes.normal,Lt=!!K.morphAttributes.color;let At=Hn;X.toneMapped&&(V===null||V.isXRRenderTarget===!0)&&(At=O.toneMapping);const St=K.morphAttributes.position||K.morphAttributes.normal||K.morphAttributes.color,Ht=St!==void 0?St.length:0,ke=T.get(X),ln=w.state.lights;if(I===!0&&(N===!0||M!==z)){const Tt=M===z&&X.id===q;Pe.setState(X,M,Tt)}let ft=!1;X.version===ke.__version?(ke.needsLights&&ke.lightsStateVersion!==ln.state.version||ke.outputColorSpace!==Re||Y.isBatchedMesh&&ke.batching===!1||!Y.isBatchedMesh&&ke.batching===!0||Y.isBatchedMesh&&ke.batchingColor===!0&&Y.colorTexture===null||Y.isBatchedMesh&&ke.batchingColor===!1&&Y.colorTexture!==null||Y.isInstancedMesh&&ke.instancing===!1||!Y.isInstancedMesh&&ke.instancing===!0||Y.isSkinnedMesh&&ke.skinning===!1||!Y.isSkinnedMesh&&ke.skinning===!0||Y.isInstancedMesh&&ke.instancingColor===!0&&Y.instanceColor===null||Y.isInstancedMesh&&ke.instancingColor===!1&&Y.instanceColor!==null||Y.isInstancedMesh&&ke.instancingMorph===!0&&Y.morphTexture===null||Y.isInstancedMesh&&ke.instancingMorph===!1&&Y.morphTexture!==null||ke.envMap!==We||X.fog===!0&&ke.fog!==Ie||ke.numClippingPlanes!==void 0&&(ke.numClippingPlanes!==Pe.numPlanes||ke.numIntersection!==Pe.numIntersection)||ke.vertexAlphas!==nt||ke.vertexTangents!==at||ke.morphTargets!==qe||ke.morphNormals!==yt||ke.morphColors!==Lt||ke.toneMapping!==At||ke.morphTargetsCount!==Ht||!!ke.lightProbeGrid!=w.state.lightProbeGridArray.length>0)&&(ft=!0):(ft=!0,ke.__version=X.version);let vn=ke.currentProgram;ft===!0&&(vn=Rr(X,G,Y),W&&X.isNodeMaterial&&W.onUpdateProgram(X,vn,ke));let Dn=!1,gi=!1,os=!1;const bt=vn.getUniforms(),Dt=ke.uniforms;if($.useProgram(vn.program)&&(Dn=!0,gi=!0,os=!0),X.id!==q&&(q=X.id,gi=!0),ke.needsLights){const Tt=_h(w.state.lightProbeGridArray,Y);ke.lightProbeGrid!==Tt&&(ke.lightProbeGrid=Tt,gi=!0)}if(Dn||z!==M){$.buffers.depth.getReversed()&&M.reversedDepth!==!0&&(M._reversedDepth=!0,M.updateProjectionMatrix()),bt.setValue(C,"projectionMatrix",M.projectionMatrix),bt.setValue(C,"viewMatrix",M.matrixWorldInverse);const vi=bt.map.cameraPosition;vi!==void 0&&vi.setValue(C,ne.setFromMatrixPosition(M.matrixWorld)),he.logarithmicDepthBuffer&&bt.setValue(C,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(X.isMeshPhongMaterial||X.isMeshToonMaterial||X.isMeshLambertMaterial||X.isMeshBasicMaterial||X.isMeshStandardMaterial||X.isShaderMaterial)&&bt.setValue(C,"isOrthographic",M.isOrthographicCamera===!0),z!==M&&(z=M,gi=!0,os=!0)}if(ke.needsLights&&(ln.state.directionalShadowMap.length>0&&bt.setValue(C,"directionalShadowMap",ln.state.directionalShadowMap,v),ln.state.spotShadowMap.length>0&&bt.setValue(C,"spotShadowMap",ln.state.spotShadowMap,v),ln.state.pointShadowMap.length>0&&bt.setValue(C,"pointShadowMap",ln.state.pointShadowMap,v)),Y.isSkinnedMesh){bt.setOptional(C,Y,"bindMatrix"),bt.setOptional(C,Y,"bindMatrixInverse");const Tt=Y.skeleton;Tt&&(Tt.boneTexture===null&&Tt.computeBoneTexture(),bt.setValue(C,"boneTexture",Tt.boneTexture,v))}Y.isBatchedMesh&&(bt.setOptional(C,Y,"batchingTexture"),bt.setValue(C,"batchingTexture",Y._matricesTexture,v),bt.setOptional(C,Y,"batchingIdTexture"),bt.setValue(C,"batchingIdTexture",Y._indirectTexture,v),bt.setOptional(C,Y,"batchingColorTexture"),Y._colorsTexture!==null&&bt.setValue(C,"batchingColorTexture",Y._colorsTexture,v));const _i=K.morphAttributes;if((_i.position!==void 0||_i.normal!==void 0||_i.color!==void 0)&&Qe.update(Y,K,vn),(gi||ke.receiveShadow!==Y.receiveShadow)&&(ke.receiveShadow=Y.receiveShadow,bt.setValue(C,"receiveShadow",Y.receiveShadow)),(X.isMeshStandardMaterial||X.isMeshLambertMaterial||X.isMeshPhongMaterial)&&X.envMap===null&&G.environment!==null&&(Dt.envMapIntensity.value=G.environmentIntensity),Dt.dfgLUT!==void 0&&(Dt.dfgLUT.value=mb()),gi){if(bt.setValue(C,"toneMappingExposure",O.toneMappingExposure),ke.needsLights&&yh(Dt,os),Ie&&X.fog===!0&&Z.refreshFogUniforms(Dt,Ie),Z.refreshMaterialUniforms(Dt,X,$e,mt,w.state.transmissionRenderTarget[M.id]),ke.needsLights&&ke.lightProbeGrid){const Tt=ke.lightProbeGrid;Dt.probesSH.value=Tt.texture,Dt.probesMin.value.copy(Tt.boundingBox.min),Dt.probesMax.value.copy(Tt.boundingBox.max),Dt.probesResolution.value.copy(Tt.resolution)}pa.upload(C,Dc(ke),Dt,v)}if(X.isShaderMaterial&&X.uniformsNeedUpdate===!0&&(pa.upload(C,Dc(ke),Dt,v),X.uniformsNeedUpdate=!1),X.isSpriteMaterial&&bt.setValue(C,"center",Y.center),bt.setValue(C,"modelViewMatrix",Y.modelViewMatrix),bt.setValue(C,"normalMatrix",Y.normalMatrix),bt.setValue(C,"modelMatrix",Y.matrixWorld),X.uniformsGroups!==void 0){const Tt=X.uniformsGroups;for(let vi=0,ls=Tt.length;vi<ls;vi++){const Uc=Tt[vi];ie.update(Uc,vn),ie.bind(Uc,vn)}}return vn}function yh(M,G){M.ambientLightColor.needsUpdate=G,M.lightProbe.needsUpdate=G,M.directionalLights.needsUpdate=G,M.directionalLightShadows.needsUpdate=G,M.pointLights.needsUpdate=G,M.pointLightShadows.needsUpdate=G,M.spotLights.needsUpdate=G,M.spotLightShadows.needsUpdate=G,M.rectAreaLights.needsUpdate=G,M.hemisphereLights.needsUpdate=G}function xh(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return ee},this.getActiveMipmapLevel=function(){return le},this.getRenderTarget=function(){return V},this.setRenderTargetTextures=function(M,G,K){const X=T.get(M);X.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,X.__autoAllocateDepthBuffer===!1&&(X.__useRenderToTexture=!1),T.get(M.texture).__webglTexture=G,T.get(M.depthTexture).__webglTexture=X.__autoAllocateDepthBuffer?void 0:K,X.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,G){const K=T.get(M);K.__webglFramebuffer=G,K.__useDefaultFramebuffer=G===void 0};const Sh=C.createFramebuffer();this.setRenderTarget=function(M,G=0,K=0){V=M,ee=G,le=K;let X=null,Y=!1,Ie=!1;if(M){const Re=T.get(M);if(Re.__useDefaultFramebuffer!==void 0){$.bindFramebuffer(C.FRAMEBUFFER,Re.__webglFramebuffer),te.copy(M.viewport),de.copy(M.scissor),Ee=M.scissorTest,$.viewport(te),$.scissor(de),$.setScissorTest(Ee),q=-1;return}else if(Re.__webglFramebuffer===void 0)v.setupRenderTarget(M);else if(Re.__hasExternalTextures)v.rebindTextures(M,T.get(M.texture).__webglTexture,T.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){const nt=M.depthTexture;if(Re.__boundDepthTexture!==nt){if(nt!==null&&T.has(nt)&&(M.width!==nt.image.width||M.height!==nt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");v.setupDepthRenderbuffer(M)}}const Ve=M.texture;(Ve.isData3DTexture||Ve.isDataArrayTexture||Ve.isCompressedArrayTexture)&&(Ie=!0);const We=T.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(We[G])?X=We[G][K]:X=We[G],Y=!0):M.samples>0&&v.useMultisampledRTT(M)===!1?X=T.get(M).__webglMultisampledFramebuffer:Array.isArray(We)?X=We[K]:X=We,te.copy(M.viewport),de.copy(M.scissor),Ee=M.scissorTest}else te.copy(ye).multiplyScalar($e).floor(),de.copy(Xe).multiplyScalar($e).floor(),Ee=Ye;if(K!==0&&(X=Sh),$.bindFramebuffer(C.FRAMEBUFFER,X)&&$.drawBuffers(M,X),$.viewport(te),$.scissor(de),$.setScissorTest(Ee),Y){const Re=T.get(M.texture);C.framebufferTexture2D(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_CUBE_MAP_POSITIVE_X+G,Re.__webglTexture,K)}else if(Ie){const Re=G;for(let Ve=0;Ve<M.textures.length;Ve++){const We=T.get(M.textures[Ve]);C.framebufferTextureLayer(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0+Ve,We.__webglTexture,K,Re)}}else if(M!==null&&K!==0){const Re=T.get(M.texture);C.framebufferTexture2D(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_2D,Re.__webglTexture,K)}q=-1},this.readRenderTargetPixels=function(M,G,K,X,Y,Ie,Oe,Re=0){if(!(M&&M.isWebGLRenderTarget)){ht("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ve=T.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Oe!==void 0&&(Ve=Ve[Oe]),Ve){$.bindFramebuffer(C.FRAMEBUFFER,Ve);try{const We=M.textures[Re],nt=We.format,at=We.type;if(M.textures.length>1&&C.readBuffer(C.COLOR_ATTACHMENT0+Re),!he.textureFormatReadable(nt)){ht("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!he.textureTypeReadable(at)){ht("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}G>=0&&G<=M.width-X&&K>=0&&K<=M.height-Y&&C.readPixels(G,K,X,Y,F.convert(nt),F.convert(at),Ie)}finally{const We=V!==null?T.get(V).__webglFramebuffer:null;$.bindFramebuffer(C.FRAMEBUFFER,We)}}},this.readRenderTargetPixelsAsync=async function(M,G,K,X,Y,Ie,Oe,Re=0){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ve=T.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Oe!==void 0&&(Ve=Ve[Oe]),Ve)if(G>=0&&G<=M.width-X&&K>=0&&K<=M.height-Y){$.bindFramebuffer(C.FRAMEBUFFER,Ve);const We=M.textures[Re],nt=We.format,at=We.type;if(M.textures.length>1&&C.readBuffer(C.COLOR_ATTACHMENT0+Re),!he.textureFormatReadable(nt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!he.textureTypeReadable(at))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const qe=C.createBuffer();C.bindBuffer(C.PIXEL_PACK_BUFFER,qe),C.bufferData(C.PIXEL_PACK_BUFFER,Ie.byteLength,C.STREAM_READ),C.readPixels(G,K,X,Y,F.convert(nt),F.convert(at),0);const yt=V!==null?T.get(V).__webglFramebuffer:null;$.bindFramebuffer(C.FRAMEBUFFER,yt);const Lt=C.fenceSync(C.SYNC_GPU_COMMANDS_COMPLETE,0);return C.flush(),await D_(C,Lt,4),C.bindBuffer(C.PIXEL_PACK_BUFFER,qe),C.getBufferSubData(C.PIXEL_PACK_BUFFER,0,Ie),C.deleteBuffer(qe),C.deleteSync(Lt),Ie}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,G=null,K=0){const X=Math.pow(2,-K),Y=Math.floor(M.image.width*X),Ie=Math.floor(M.image.height*X),Oe=G!==null?G.x:0,Re=G!==null?G.y:0;v.setTexture2D(M,0),C.copyTexSubImage2D(C.TEXTURE_2D,K,0,0,Oe,Re,Y,Ie),$.unbindTexture()};const bh=C.createFramebuffer(),Mh=C.createFramebuffer();this.copyTextureToTexture=function(M,G,K=null,X=null,Y=0,Ie=0){let Oe,Re,Ve,We,nt,at,qe,yt,Lt;const At=M.isCompressedTexture?M.mipmaps[Ie]:M.image;if(K!==null)Oe=K.max.x-K.min.x,Re=K.max.y-K.min.y,Ve=K.isBox3?K.max.z-K.min.z:1,We=K.min.x,nt=K.min.y,at=K.isBox3?K.min.z:0;else{const Dt=Math.pow(2,-Y);Oe=Math.floor(At.width*Dt),Re=Math.floor(At.height*Dt),M.isDataArrayTexture?Ve=At.depth:M.isData3DTexture?Ve=Math.floor(At.depth*Dt):Ve=1,We=0,nt=0,at=0}X!==null?(qe=X.x,yt=X.y,Lt=X.z):(qe=0,yt=0,Lt=0);const St=F.convert(G.format),Ht=F.convert(G.type);let ke;G.isData3DTexture?(v.setTexture3D(G,0),ke=C.TEXTURE_3D):G.isDataArrayTexture||G.isCompressedArrayTexture?(v.setTexture2DArray(G,0),ke=C.TEXTURE_2D_ARRAY):(v.setTexture2D(G,0),ke=C.TEXTURE_2D),$.activeTexture(C.TEXTURE0),$.pixelStorei(C.UNPACK_FLIP_Y_WEBGL,G.flipY),$.pixelStorei(C.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),$.pixelStorei(C.UNPACK_ALIGNMENT,G.unpackAlignment);const ln=$.getParameter(C.UNPACK_ROW_LENGTH),ft=$.getParameter(C.UNPACK_IMAGE_HEIGHT),vn=$.getParameter(C.UNPACK_SKIP_PIXELS),Dn=$.getParameter(C.UNPACK_SKIP_ROWS),gi=$.getParameter(C.UNPACK_SKIP_IMAGES);$.pixelStorei(C.UNPACK_ROW_LENGTH,At.width),$.pixelStorei(C.UNPACK_IMAGE_HEIGHT,At.height),$.pixelStorei(C.UNPACK_SKIP_PIXELS,We),$.pixelStorei(C.UNPACK_SKIP_ROWS,nt),$.pixelStorei(C.UNPACK_SKIP_IMAGES,at);const os=M.isDataArrayTexture||M.isData3DTexture,bt=G.isDataArrayTexture||G.isData3DTexture;if(M.isDepthTexture){const Dt=T.get(M),_i=T.get(G),Tt=T.get(Dt.__renderTarget),vi=T.get(_i.__renderTarget);$.bindFramebuffer(C.READ_FRAMEBUFFER,Tt.__webglFramebuffer),$.bindFramebuffer(C.DRAW_FRAMEBUFFER,vi.__webglFramebuffer);for(let ls=0;ls<Ve;ls++)os&&(C.framebufferTextureLayer(C.READ_FRAMEBUFFER,C.COLOR_ATTACHMENT0,T.get(M).__webglTexture,Y,at+ls),C.framebufferTextureLayer(C.DRAW_FRAMEBUFFER,C.COLOR_ATTACHMENT0,T.get(G).__webglTexture,Ie,Lt+ls)),C.blitFramebuffer(We,nt,Oe,Re,qe,yt,Oe,Re,C.DEPTH_BUFFER_BIT,C.NEAREST);$.bindFramebuffer(C.READ_FRAMEBUFFER,null),$.bindFramebuffer(C.DRAW_FRAMEBUFFER,null)}else if(Y!==0||M.isRenderTargetTexture||T.has(M)){const Dt=T.get(M),_i=T.get(G);$.bindFramebuffer(C.READ_FRAMEBUFFER,bh),$.bindFramebuffer(C.DRAW_FRAMEBUFFER,Mh);for(let Tt=0;Tt<Ve;Tt++)os?C.framebufferTextureLayer(C.READ_FRAMEBUFFER,C.COLOR_ATTACHMENT0,Dt.__webglTexture,Y,at+Tt):C.framebufferTexture2D(C.READ_FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_2D,Dt.__webglTexture,Y),bt?C.framebufferTextureLayer(C.DRAW_FRAMEBUFFER,C.COLOR_ATTACHMENT0,_i.__webglTexture,Ie,Lt+Tt):C.framebufferTexture2D(C.DRAW_FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_2D,_i.__webglTexture,Ie),Y!==0?C.blitFramebuffer(We,nt,Oe,Re,qe,yt,Oe,Re,C.COLOR_BUFFER_BIT,C.NEAREST):bt?C.copyTexSubImage3D(ke,Ie,qe,yt,Lt+Tt,We,nt,Oe,Re):C.copyTexSubImage2D(ke,Ie,qe,yt,We,nt,Oe,Re);$.bindFramebuffer(C.READ_FRAMEBUFFER,null),$.bindFramebuffer(C.DRAW_FRAMEBUFFER,null)}else bt?M.isDataTexture||M.isData3DTexture?C.texSubImage3D(ke,Ie,qe,yt,Lt,Oe,Re,Ve,St,Ht,At.data):G.isCompressedArrayTexture?C.compressedTexSubImage3D(ke,Ie,qe,yt,Lt,Oe,Re,Ve,St,At.data):C.texSubImage3D(ke,Ie,qe,yt,Lt,Oe,Re,Ve,St,Ht,At):M.isDataTexture?C.texSubImage2D(C.TEXTURE_2D,Ie,qe,yt,Oe,Re,St,Ht,At.data):M.isCompressedTexture?C.compressedTexSubImage2D(C.TEXTURE_2D,Ie,qe,yt,At.width,At.height,St,At.data):C.texSubImage2D(C.TEXTURE_2D,Ie,qe,yt,Oe,Re,St,Ht,At);$.pixelStorei(C.UNPACK_ROW_LENGTH,ln),$.pixelStorei(C.UNPACK_IMAGE_HEIGHT,ft),$.pixelStorei(C.UNPACK_SKIP_PIXELS,vn),$.pixelStorei(C.UNPACK_SKIP_ROWS,Dn),$.pixelStorei(C.UNPACK_SKIP_IMAGES,gi),Ie===0&&G.generateMipmaps&&C.generateMipmap(ke),$.unbindTexture()},this.initRenderTarget=function(M){T.get(M).__webglFramebuffer===void 0&&v.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?v.setTextureCube(M,0):M.isData3DTexture?v.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?v.setTexture2DArray(M,0):v.setTexture2D(M,0),$.unbindTexture()},this.resetState=function(){ee=0,le=0,V=null,$.reset(),be.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return zn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const n=this.getContext();n.drawingBufferColorSpace=lt._getDrawingBufferColorSpace(e),n.unpackColorSpace=lt._getUnpackColorSpace()}}const bd=["#7f77dd","#2de2ff","#ef9f27","#e879b0","#1d9e75","#cecbf6"];function qi(t){const e=Number(t);return Number.isFinite(e)?Math.max(0,Math.min(1,e)):0}const _b={name:"ThreeBackground",props:{lfos:{type:Array,default:()=>[]},audioMetrics:{type:Object,default:()=>({active:!1,level:0,bass:0,mid:0,treble:0,pulse:0})},activeTab:{type:String,default:"LIVE"},morph:{type:Number,default:.5}},data(){return{renderer:null,scene:null,camera:null,clock:null,rafId:null,particleSystem:null,particleBase:null,haloMesh:null,lfoGroups:[]}},mounted(){typeof window>"u"||!this.$refs.host||this.initScene()},beforeUnmount(){this.teardownScene()},methods:{initScene(){const t=this.$refs.host;if(!t)return;this.scene=new K_,this.clock=new x0,this.camera=new pn(45,1,.1,100),this.camera.position.set(0,0,18),this.renderer=new gb({antialias:!0,alpha:!0,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5)),this.renderer.setClearColor(0,0),t.appendChild(this.renderer.domElement),this.scene.add(new _0(16777215,.35));const e=new Ju(8353757,1.8,60);e.position.set(6,5,14),this.scene.add(e);const n=new Ju(3007231,1.2,60);n.position.set(-6,-4,12),this.scene.add(n),this.createParticles(),this.createHalo(),this.createLfoGroups(),this.handleResize(),window.addEventListener("resize",this.handleResize),this.animate()},createParticles(){const e=new Float32Array(2700);this.particleBase=new Float32Array(900*3);for(let s=0;s<900;s+=1){const r=8+Math.random()*16,a=Math.random()*Math.PI*2,l=Math.acos(2*Math.random()-1),u=r*Math.sin(l)*Math.cos(a),d=r*Math.sin(l)*Math.sin(a),f=(Math.random()-.5)*16;e[s*3]=u,e[s*3+1]=d,e[s*3+2]=f,this.particleBase[s*3]=u,this.particleBase[s*3+1]=d,this.particleBase[s*3+2]=f}const n=new on;n.setAttribute("position",new Rn(e,3));const i=new th({color:12175103,size:.075,transparent:!0,opacity:.42,blending:Jo,depthWrite:!1});this.particleSystem=new r0(n,i),this.scene.add(this.particleSystem)},createHalo(){const t=new Sc(4.8,1),e=new hr({color:8353757,wireframe:!0,transparent:!0,opacity:.1});this.haloMesh=new _n(t,e),this.scene.add(this.haloMesh)},createLfoGroups(){this.lfoGroups=Array.from({length:6}).map((t,e)=>{const n=new ut(bd[e%bd.length]),i=new sr,s=new _n(new bc(.8,.08,16,72),new f0({color:n,emissive:n.clone().multiplyScalar(.55),transparent:!0,opacity:.5}));i.add(s);const r=new _n(new Aa(.22,20,20),new hr({color:n,transparent:!0,opacity:.95}));i.add(r);const a=new _n(new Aa(.58,18,18),new hr({color:n,transparent:!0,opacity:.14}));return i.add(a),i.userData={ring:s,core:r,aura:a,color:n},i.visible=!1,this.scene.add(i),i})},handleResize(){if(!this.renderer||!this.camera)return;const t=window.innerWidth||1,e=window.innerHeight||1;this.camera.aspect=t/e,this.camera.updateProjectionMatrix(),this.renderer.setSize(t,e,!1)},shapeSample(t,e){const n=e%(Math.PI*2);return t==="Square"?Math.sin(n)>=0?1:-1:t==="Saw"?n/Math.PI-1:t==="Triangle"?2*Math.asin(Math.sin(n))/Math.PI:Math.sin(n)},updateParticles(t,e,n){if(!this.particleSystem||!this.particleBase)return;const i=this.particleSystem.geometry.getAttribute("position"),s=i.array,r=.08+e*.5+n*.25;for(let a=0;a<s.length;a+=3){const l=this.particleBase[a],u=this.particleBase[a+1],d=this.particleBase[a+2],f=t*.18+a*8e-4;s[a]=l+Math.sin(f+d*.12)*r,s[a+1]=u+Math.cos(f*1.2+l*.08)*r,s[a+2]=d+Math.sin(f*.8+u*.05)*r*.6}i.needsUpdate=!0,this.particleSystem.rotation.z=t*(.02+e*.05),this.particleSystem.rotation.x=Math.sin(t*.12)*.18,this.particleSystem.material.opacity=.2+e*.25+n*.15},updateHalo(t,e,n,i){if(!this.haloMesh)return;const s=1+n*.18+i*.05;this.haloMesh.scale.setScalar(s),this.haloMesh.rotation.x=t*(.08+i*.04),this.haloMesh.rotation.y=t*(.12+e*.08),this.haloMesh.material.opacity=.06+e*.14+n*.1},updateLfoGroups(t,e,n,i,s){const r=Array.isArray(this.lfos)?this.lfos:[];this.lfoGroups.forEach((a,l)=>{const u=r[l],d=!!(u&&u.on);if(a.visible=d,!d)return;const f=Math.max(.1,Number(u.speed)||1),m=qi(u.depth==null?.2:u.depth),p=Number(u.phase)||0,o=t*(.35+f*.25),h=p+o,y=2.4+l*.78+m*1.6+e*.35,_=this.shapeSample(u.shape,h)*(.35+m*1.2+s*.25);a.position.set(Math.cos(h+l*.65)*y*.88,_+Math.sin(h*.45)*(.25+n*.2),Math.sin(h*.8+l)*(1.1+i*1.1)),a.rotation.x+=.005+f*.0025,a.rotation.y+=.008+f*.003,a.rotation.z=h*.75;const{ring:g,core:S,aura:E,color:b}=a.userData,L=.75+m*1.8+e*.6,w=.65+m*.8+n*.9,D=1.15+m*1.4+s*.8;g.scale.setScalar(L),S.scale.setScalar(w),E.scale.setScalar(D),g.material.opacity=.28+m*.35+e*.2,E.material.opacity=.08+e*.18+s*.1,S.material.opacity=.7+n*.25,g.material.emissive.copy(b).multiplyScalar(.4+e*.8)})},animate(){if(!this.renderer||!this.scene||!this.camera||!this.clock)return;const t=()=>{const e=this.clock.getElapsedTime(),n=this.audioMetrics||{},i=qi(n.level),s=qi(n.bass),r=qi(n.mid),a=qi(n.treble),l=qi(n.pulse),u=qi(this.morph),d=this.activeTab==="LIVE"?1:.65;this.updateParticles(e,i*d,l),this.updateHalo(e,i*d,s,u),this.updateLfoGroups(e,i*d,s,r,a),this.renderer.render(this.scene,this.camera),this.rafId=requestAnimationFrame(t)};this.rafId=requestAnimationFrame(t)},teardownScene(){if(typeof window<"u"&&window.removeEventListener("resize",this.handleResize),this.rafId!=null&&typeof cancelAnimationFrame=="function"&&cancelAnimationFrame(this.rafId),this.rafId=null,this.scene&&this.scene.traverse(t=>{t.geometry&&typeof t.geometry.dispose=="function"&&t.geometry.dispose(),t.material&&(Array.isArray(t.material)?t.material:[t.material]).forEach(n=>{n&&typeof n.dispose=="function"&&n.dispose()})}),this.renderer){this.renderer.dispose();const t=this.renderer.domElement;t&&t.parentNode&&t.parentNode.removeChild(t)}this.renderer=null,this.scene=null,this.camera=null,this.clock=null,this.particleSystem=null,this.particleBase=null,this.haloMesh=null,this.lfoGroups=[]}}},vb={ref:"host",class:"three-background"};function yb(t,e,n,i,s,r){return A(),P("div",vb,null,512)}const xb=Fi(_b,[["render",yb],["__scopeId","data-v-74a5255d"]]);var Xi={};const Sb={name:"App",components:{StatusStrip:hg,GlassPanel:vg,Crossfader:Ig,LiveParamRow:Bg,Waveform:Wg,TargetCell:Qg,ThreeBackground:xb},data(){return{showFrames:!0,isPlaying:!1,isRecording:!1,deforumPlaying:!1,previewGenerating:!1,previewDebounceTimer:null,framesRefreshBackoffMs:5e3,apiHealthBackoffMs:15e3,paramPanelOpen:!1,deforumPanelOpen:!1,deforumSettings:{...io},deforumFieldGroups:eg,deforumSectionOpen:{},deforumAdvancedOpen:!1,deforumSettingsJson:"",deforumSettingsJsonError:"",deforumSettingsStatus:"",deforumSaveTimer:null,deforumPreviewTimer:null,crossfadeSlotTypes:$m,performance:{genericPrompt:"",crossfader:.5,newSlotType:"prompt",slots:[],status:"",lastPreviewPath:null},forge:{host:typeof process<"u"&&Xi&&Xi.SD_FORGE_HOST?Xi.SD_FORGE_HOST:"192.168.2.102",port:typeof process<"u"&&Xi&&Xi.SD_FORGE_PORT?Xi.SD_FORGE_PORT:"7860",available:!1,loading:!1,switching:!1,models:[],modelsSource:"",currentModel:"",selectedModel:"",lastModel:"",modelInfo:null,samplers:[],schedulers:[],vaeList:[],options:{}},streamUrl:"",lfoOn:!0,beatMacroOn:!0,apiHealth:{sdForge:null},forgeHost:Xi.SD_FORGE_HOST||"192.168.2.102",availablePresets:[],currentPreset:null,newPresetName:"",presetStatus:"",sharedPresets:[],sharedPresetName:"",sharedPresetBy:"",sharedPresetsStatus:"",collab:{userId:null,userName:typeof localStorage<"u"&&localStorage.getItem("defora_user_name")||"Performer",users:[],locks:{},recording:!1,recordings:[],status:""},gpuPool:{enabled:!1,strategy:"round_robin",healthyNodes:0,nodes:[],loading:!1,status:"",draft:{url:"",name:"",backend:"sd-forge",priority:1},editId:null,editDraft:{name:"",url:"",backend:"sd-forge",priority:1}},generator:{theme:"",stylePreset:"Masterpiece, Realistic",customStyle:"",isGenerating:!1,status:"",lastPath:null},session:"clown_set_01",tabs:[{id:"LIVE",label:"LIVE"},{id:"PROMPTS",label:"PROMPTS"},{id:"MOTION",label:"MOTION"},{id:"MODULATION",label:"MODULATION"},{id:"AUDIO",label:"AUDIO"},{id:"RUNS",label:"RUNS"},{id:"SETTINGS",label:"SETTINGS"},{id:"GENERATE",label:"GENERATE"}],currentTab:"LIVE",currentSubTab:{PROMPTS:"PROMPTS",SETTINGS:"ENGINE"},stats:{fps:27,lat:120},hud:{seed:42490527},timecode:"00:00.00",liveVibe:[{key:"cfg",label:"Vibe (CFG)",val:.63,min:0,max:1.5,step:.01},{key:"strength",label:"Strength",val:.78,min:0,max:1.5,step:.01},{key:"noise",label:"Noise/Glitch",val:.2,min:0,max:1,step:.01},{key:"cfgscale",label:"CFG scale",val:5,min:0,max:15,step:.1}],liveCam:[{key:"zoom",label:"Zoom",val:.8,min:-5,max:5,step:.05,sourceable:!0},{key:"panx",label:"Pan X",val:.1,min:-1,max:1,step:.05,sourceable:!1},{key:"pany",label:"Pan Y",val:0,min:-1,max:1,step:.05,sourceable:!1},{key:"tilt",label:"Tilt / Rotate",val:0,min:-180,max:180,step:.5,sourceable:!1}],paramSources:{cfg:"Manual",strength:"Manual",noise:"Beat",cfgscale:"Manual",zoom:"Beat"},pinnedParams:(()=>{try{const t=typeof localStorage<"u"&&localStorage.getItem("defora_pinned_params");return t?JSON.parse(t):[]}catch{return[]}})(),prompts:{pos:"",neg:"",morphOn:!0,crossfaderValue:.5,morphBlend:.5},img2img:{show:!1,dataUrl:null,maskDataUrl:null,maskBlur:4,inpaintingFill:1,inpaintFullRes:!0,denoisingStrength:.55,width:960,height:540,status:"",lastPath:null},pluginsRegistry:[],morphSlots:[{id:1,on:!0,name:"clean → mad",a:"clean evil",b:"mad clown",range:"0.40–1.00",weight:1},{id:2,on:!0,name:"box → tunnel",a:"small box",b:"neon tunnel",range:"0.00–0.60",weight:1},{id:3,on:!1,name:"style fade",a:"photographic",b:"anime render",range:"0.20–0.80",weight:1}],loras:{available:[],groupA:[],groupB:[],source:"unknown"},motionPresets:{Static:{translation_z:0,translation_x:0,translation_y:0,rotation_z:0,rotation_y:0},Orbit:{translation_z:2,rotation_y:15,translation_x:0,translation_y:0,rotation_z:0},Tunnel:{translation_z:5,translation_x:0,translation_y:0,rotation_z:0,rotation_y:0},Handheld:{translation_z:.5,translation_x:.2,translation_y:.1,rotation_z:2,rotation_y:0},Chaos:{translation_z:1.5,translation_x:.5,translation_y:.3,rotation_z:5,rotation_y:10}},motionStyles:["Calm","Travel","Spin","Handheld","Chaos"],motionStylesSaved:{},xyPad:{x:0,y:0,dragging:!1,padSize:140},audio:{track:"",bpm:114.8,uploadedFile:null,objectUrl:null},audioSpectrogramDataUrl:null,audioSpectrogramStatus:"",_spectrogramGen:0,avSyncEnabled:!1,avSyncLeadSec:4,audioStatus:"Idle",backgroundAudioMetrics:{active:!1,level:0,bass:0,mid:0,treble:0,pulse:0},audioMappings:[{param:"strength",freq_min:20,freq_max:300,out_min:0,out_max:1.5},{param:"cfg",freq_min:300,freq_max:1200,out_min:0,out_max:30},{param:"translation_z",freq_min:1200,freq_max:3e3,out_min:-5,out_max:5}],audioBandPresets:{sub:{label:"Sub",freq_min:20,freq_max:60},bass:{label:"Bass",freq_min:60,freq_max:250},lowmid:{label:"Lo-mid",freq_min:250,freq_max:500},mid:{label:"Mid",freq_min:500,freq_max:2e3},high:{label:"High",freq_min:2e3,freq_max:8e3},air:{label:"Air",freq_min:8e3,freq_max:16e3}},lfoBpm:120,lfoTargets:[{key:"cfg",label:"Vibe (CFG)",min:0,max:30,default:6,group:"Style"},{key:"strength",label:"Strength",min:0,max:1.5,default:.7,group:"Style"},{key:"noise_multiplier",label:"Noise/Glitch",min:0,max:3,default:1,group:"Style"},{key:"translation_z",label:"Zoom",min:-10,max:10,default:0,group:"Camera"},{key:"translation_x",label:"Pan X",min:-10,max:10,default:0,group:"Camera"},{key:"translation_y",label:"Pan Y",min:-10,max:10,default:0,group:"Camera"},{key:"rotation_y",label:"Rotate Y",min:-180,max:180,default:0,group:"Camera"},{key:"rotation_z",label:"Tilt",min:-180,max:180,default:0,group:"Camera"},{key:"fov",label:"FOV",min:1,max:180,default:70,group:"Camera"},{key:"cn_CN1_weight",label:"CN1 Weight",min:0,max:2,default:.4,group:"ControlNet"},{key:"cn_CN2_weight",label:"CN2 Weight",min:0,max:2,default:.4,group:"ControlNet"},{key:"cn_CN3_weight",label:"CN3 Weight",min:0,max:2,default:.4,group:"ControlNet"},{key:"cn_CN1_start",label:"CN1 Start",min:0,max:1,default:0,group:"ControlNet"},{key:"cn_CN2_start",label:"CN2 Start",min:0,max:1,default:0,group:"ControlNet"},{key:"cn_CN1_end",label:"CN1 End",min:0,max:1,default:.9,group:"ControlNet"},{key:"cn_CN2_end",label:"CN2 End",min:0,max:1,default:.9,group:"ControlNet"}],lfoShapes:["Sine","Triangle","Saw","Square"],lfos:Array.from({length:6}).map((t,e)=>({id:e+1,on:e===0,targets:e===0?["cfg"]:[],shape:"Sine",bpm:120,speed:1,depth:.1,base:null,phase:0})),macrosRack:[{id:"macro-0",on:!0,target:"cfg",shape:"Sine",bpm:120,depth:.7,offset:.1,show:!0},{id:"macro-1",on:!0,target:"translation_z",shape:"Saw",bpm:90,depth:.6,offset:.2,show:!1},{id:"macro-2",on:!1,target:"noise_multiplier",shape:"Noise",bpm:140,depth:.3,offset:0,show:!1}],framesync:{presets:["Basic Strength Schedule","Basic Noise Schedule","Basic Init"],factoryPresets:["Basic Strength Schedule","Basic Noise Schedule","Basic Init"],selectedPreset:"Basic Strength Schedule",primaryWave:"Cosine",waveShapes:["Cosine","Sine","Saw","Triangle","Square","Noise"],amplitude:1,shift:0,bend:1,noise:0,fps:24,frameCount:120,bpm:120,shiftFrames:0,syncRates:["1","1/2","1/4","1/8","1/16","1/32","2","4","8"],syncRate:"1/4",decimals:2,metrics:[{label:"Max",value:"1.00",sub:"32bars"},{label:"Min",value:"-1.00",sub:"16bars"},{label:"Avg",value:"0.00",sub:"4bars"},{label:"Abs Avg",value:"0.63",sub:"1bar"},{label:"Duration",value:"5.00s",sub:"1/2"}],timingTable:[{label:"32bar",time:"58.0s",frames:"1392.0"},{label:"16bar",time:"28.0s",frames:"768.0"},{label:"8bar",time:"16.0s",frames:"384.0"},{label:"4bar",time:"8.0s",frames:"192.0"},{label:"2bar",time:"4.0s",frames:"96.0"},{label:"1bar",time:"2.0s",frames:"48.0"},{label:"1/2",time:"1.0s",frames:"24.0"}],featureCoverage:["Wave presets","LFO modulation","Audio-driven sync","Tempo & shift","Metrics + timing table","Preset import/export"]},cn:{slots:[{id:"CN1",label:"CN1",model:"Canny",weight:.4,start:0,end:.9,enabled:!1,imageSource:"file"},{id:"CN2",label:"CN2 •",model:"Depth",weight:.4,start:0,end:.9,enabled:!0,imageSource:"file"},{id:"CN3",label:"CN3",model:"Pose",weight:.4,start:0,end:.9,enabled:!1,imageSource:"file"},{id:"CN4",label:"CN4",model:"Tile",weight:.4,start:0,end:.9,enabled:!1,imageSource:"file"},{id:"CN5",label:"CN5",model:"Control",weight:.4,start:0,end:.9,enabled:!1,imageSource:"file"}],active:"CN2",availableModels:[],source:"unknown",webcamActive:!1,webcamStream:null,webcamVideo:null,webcamCanvas:null,webcamCaptureInterval:null},webcamCaptureRate:500,midi:{supported:typeof navigator<"u"&&!!navigator.requestMIDIAccess,devices:[],selected:null,mappings:[{control:"LaunchControl CC21",cc:21,key:"cfg"},{control:"LaunchControl CC22",cc:22,key:"strength"},{control:"LaunchControl CC23",cc:23,key:"cfgscale"}]},keyBindings:{translation_z:"w",translation_x:"a",translation_y:"s",rotation_y:"d",rotation_z:"q",fov:"e",cfg:"z",strength:"x",noise_multiplier:"c"},bindingLearnMode:!1,bindingTargetKey:null,bindingLearnTimeout:null,midiStatus:"Ready",ws:null,wsStatus:"disconnected",streamSrc:"/hls/live/deforum.m3u8",thumbs:[],framesTimer:null,playerEl:null,timeHandler:null,hls:null,liveParamTimers:{},liveParamPending:{},lastParamSent:{},controlDelayMs:75,errorHandler:null,playbackTimer:null,lfoTimer:null,lastLfoTick:null,beatTimer:null,lastBeatTime:null,beatCount:0,beatPhase:0,lastMacroTrigger:{},sequencer:{version:1,durationSec:8,fps:24,loop:!0,tracks:[],markers:[],bpmSync:!1,bpm:120,bars:4,beatsPerBar:4},sequencerPlayhead:0,sequencerPlaying:!1,sequencerTimer:null,sequencerSaveName:"default_clip",sequencerLoadPick:"",sequencerList:[],sequencerStatus:"",sequencerNewParam:"translation_x",sequencerKeyframeVal:0,sequencerMarkerName:"Scene",sequencerSelectedTrackId:null,timelineHoverTime:null,timelineHoverPercent:0,timelineCanvasCtx:null,lfoTargetPick:{},avSyncCollapsed:!0,morphCollapsed:!0,forgeAdvancedCollapsed:!0,storyResultCollapsed:!1,lfoCanvasRefs:{},_lfoAnimFrame:null,runsAll:[],runsFiltered:[],runsFilter:{search:"",status:"",tag:"",model:""},runsSort:{field:"started_at",order:"desc"},runsSelected:[],runsCompareFields:["status","model","frame_count","seed","steps","strength","cfg","tag","prompt_positive","prompt_negative","notes"],runsDetailView:null,runsStatus:"",genData:{defaultThemes:["A journey through light","Neon cathedral","Ocean depths"],sceneDescriptors:{opening:["ethereal","quiet"],buildup:["rising","vivid"],climax:["intense","surreal"],closing:["soft","fading"]},environments:[["forest","meadow"],["city","alley"],["space","nebula"]],lighting:["golden hour","neon rim light","moonlit"],quality:["masterpiece","best quality"],techSpecs:["8k","sharp focus"],artists:{default:["artgerm","greg rutkowski"],"Masterpiece, Realistic":["photorealistic"]},negatives:["blurry","low quality"],cameraBehaviors:["STATIC","ORBIT","TUNNEL"]}}},computed:{modelStatusKind(){return this.forge.switching||this.forge.loading?"loading":this.forge.available||this.apiHealth.sdForge&&this.apiHealth.sdForge.available?"ready":"offline"},modelStatusLabel(){return this.modelStatusKind==="loading"?"Loading":this.modelStatusKind==="ready"?"Ready":"Offline"},paramPanelGroups(){return[{label:"Style",items:this.liveVibe},{label:"Camera",items:this.liveCam}]},pinnedParamItems(){const t=[...this.liveVibe,...this.liveCam];return this.pinnedParams.map(e=>t.find(n=>n.key===e)).filter(Boolean)},liveModulating(){const t={};[...this.liveVibe,...this.liveCam].forEach(n=>{t[n.key]=n}),this.lfoTargets.forEach(n=>{t[n.key]||(t[n.key]={key:n.key,label:n.label,val:n.default||0,min:n.min||0,max:n.max||1})});const e={};return this.lfos.filter(n=>n.on&&n.targets.length).forEach(n=>{n.targets.forEach(i=>{e[i]||(e[i]={key:i,sources:[]}),e[i].sources.push(`LFO ${n.id}`)})}),this.macrosRack.filter(n=>n.on&&n.target).forEach(n=>{const i=n.target;e[i]||(e[i]={key:i,sources:[]}),e[i].sources.push("Macro")}),Object.values(e).map(n=>({...t[n.key]||{key:n.key,label:n.key,val:0,min:0,max:1},source:n.sources.join(" + ")}))},recentRunsRail(){return(this.runsAll||[]).slice(0,6)},contextRailCopy(){return this.currentTab==="LIVE"?"Stay on the performance surface while jumping back into recent output.":this.currentTab==="RUNS"?"Recent output stays docked while you inspect details and compare runs.":this.currentTab==="SETTINGS"?"Keep the latest output in view while tuning engine and node configuration.":this.currentTab==="GENERATE"?"Review recent output while shaping timelines, scenes, and prompts.":"Recent output stays one click away while you tune this surface."},contextSummaryChips(){var t,e;switch(this.currentTab){case"LIVE":return[`Model ${this.modelStatusLabel}`,`Morph ${this.performance.crossfader.toFixed(2)}`,`Pinned ${this.pinnedParamItems.length}`,`Modulating ${this.liveModulating.length}`];case"PROMPTS":return this.currentSubTab.PROMPTS==="LORA"?[`LoRA A ${this.loras.groupA.length}`,`LoRA B ${this.loras.groupB.length}`,`Morph ${this.prompts.crossfaderValue.toFixed(2)}`]:this.currentSubTab.PROMPTS==="CONTROLNET"?[`ControlNet ${this.cn.active||"idle"}`,`Slots ${this.cn.slots.length}`,`Webcam ${this.cn.webcamActive?"on":"off"}`]:[`Morph ${this.prompts.morphOn?"on":"off"}`,`Slots ${this.morphSlots.length}`,`Blend ${this.prompts.crossfaderValue.toFixed(2)}`];case"MOTION":return[`Tracks ${this.sequencer.tracks.length}`,`Markers ${((t=this.sequencer.markers)==null?void 0:t.length)||0}`,`FPS ${this.sequencer.fps}`];case"MODULATION":return[`LFOs ${this.lfos.filter(n=>n.on).length}/${this.lfos.length}`,`Macros ${this.macrosRack.filter(n=>n.on).length}/${this.macrosRack.length}`,`Live ${this.liveModulating.length}`];case"AUDIO":return[this.audio.uploadedFile?`File ${this.audio.uploadedFile}`:"No audio loaded",`BPM ${this.audio.bpm}`,`Mappings ${this.audioMappings.length}`];case"RUNS":return[`Filtered ${this.runsFiltered.length}`,`Selected ${this.runsSelected.length}`,`Sort ${this.runsSort.field}`];case"SETTINGS":return[`Section ${this.currentSubTab.SETTINGS}`,`GPU nodes ${this.gpuPool.nodes.length}`,`API ${this.apiHealth.sdForge&&this.apiHealth.sdForge.available?"online":"offline"}`];case"GENERATE":return[`Tracks ${this.sequencer.tracks.length}`,`Markers ${((e=this.sequencer.markers)==null?void 0:e.length)||0}`,`Theme ${this.generator.theme||"—"}`];default:return[]}},targetOwners(){const t={};return this.lfos.forEach(e=>{e.on&&e.targets.forEach(n=>{t[n]||(t[n]=[]),t[n].push(`LFO ${e.id}`)})}),this.macrosRack.forEach((e,n)=>{!e.on||!e.target||(t[e.target]||(t[e.target]=[]),t[e.target].push(`Macro ${n+1}`))}),t},activeSlot(){return this.cn.slots.find(t=>t.id===this.cn.active)||this.cn.slots[0]},lfoTargetGroups(){const t={};return this.lfoTargets.forEach(e=>{const n=e.group||"Other";t[n]||(t[n]=[]),t[n].push(e)}),Object.entries(t).map(([e,n])=>({label:e,items:n}))},sequencerParamOptions(){const t=this.lfoTargets.map(e=>({key:e.key,label:e.label}));return this.cn.slots.forEach(e=>{t.push({key:`cn_${e.id}_weight`,label:`CN ${e.id} Weight`,group:"ControlNet"}),t.push({key:`cn_${e.id}_start`,label:`CN ${e.id} Start`,group:"ControlNet"}),t.push({key:`cn_${e.id}_end`,label:`CN ${e.id} End`,group:"ControlNet"})}),t},audioBandChips(){return Object.entries(this.audioBandPresets).map(([t,e])=>({key:t,label:e.label,freq_min:e.freq_min,freq_max:e.freq_max}))},sortedSequencerMarkers(){return[...this.sequencer&&this.sequencer.markers||[]].sort((e,n)=>e.t-n.t)},sequencerCalculatedDuration(){if(!this.sequencer.bpmSync)return"—";const t=Math.max(1,this.sequencer.bpm||120);return((this.sequencer.bars||4)*(this.sequencer.beatsPerBar||4)/t*60).toFixed(2)},bindingGroups(){const t={};return this.lfoTargets.forEach(e=>{const n=e.group||"Other";t[n]||(t[n]=[]),t[n].push(e)}),Object.entries(t).map(([e,n])=>({label:e,items:n}))}},watch:{sequencer:{handler(){this.$nextTick(()=>this.drawTimeline())},deep:!0},sequencerPlayhead(){this.$nextTick(()=>this.drawTimeline())},"performance.crossfader"(){this.applyCrossfadeMorph(),this.saveSessionState()},session(){this.saveSessionState()}},mounted(){if(this.loadSessionState(),this.applyCrossfadeMorph(),this.loadMotionStyles(),this.loadBindings(),this.refreshPresets(),this.refreshSharedPresets(),this.refreshGpuPool(!1),this.refreshLoras(),this.loadControlNetModels(),this.refreshPlugins(),this.syncDeforumSettingsJson(),this.loadDeforumSettings(),this.refreshForgeAll().then(()=>{this.restoreLastModel(),this.deforumPlaying||this.schedulePreviewFrame()}),this.scanMidi(),this.connectWebSocket(),this.initHls(),typeof fetch=="function"){const t=()=>{this.refreshFrames().finally(()=>{this.framesTimer=setTimeout(t,this.framesRefreshBackoffMs||5e3)})};t();const e=()=>{this.refreshApiHealth().finally(()=>{this.apiStatusTimer=setTimeout(e,this.apiHealthBackoffMs||15e3)})};e()}this.playbackTimer=setInterval(()=>this.ensureLivePlayback(),4e3),this.lfoTimer=setInterval(()=>this.runLfos(),120),this.beatTimer=setInterval(()=>this.processBeat(),50),this.startLfoAnimation(),this.setupKeyboardShortcuts(),this.refreshRuns(),this.$nextTick(()=>{this.refreshSequencerList(),setTimeout(()=>this.drawTimeline(),200)})},beforeUnmount(){this.disposeLiveAudioAnalyser(),this.stopSequencerPlayback(),this.framesTimer&&clearTimeout(this.framesTimer),this.apiStatusTimer&&clearTimeout(this.apiStatusTimer),this.playbackTimer&&clearInterval(this.playbackTimer),this.lfoTimer&&clearInterval(this.lfoTimer),this.beatTimer&&clearInterval(this.beatTimer),this.previewDebounceTimer&&clearTimeout(this.previewDebounceTimer),this.stopLfoAnimation(),this.playerEl&&this.timeHandler&&this.playerEl.removeEventListener("timeupdate",this.timeHandler),this.playerEl&&this.errorHandler&&this.playerEl.removeEventListener("error",this.errorHandler),typeof document<"u"&&document.removeEventListener("keydown",this._keyHandler)},methods:{async refreshApiHealth(){if(typeof fetch=="function")try{const t=await fetch("/api/status");if(!t.ok){this.apiHealthBackoffMs=Math.min(12e4,(this.apiHealthBackoffMs||15e3)*2);return}const e=await t.json();e&&e.sdForge&&(this.apiHealth={sdForge:{...e.sdForge}},this.forge.available=!!e.sdForge.available),this.apiHealthBackoffMs=15e3}catch{this.apiHealthBackoffMs=Math.min(12e4,(this.apiHealthBackoffMs||15e3)*2)}},async refreshRuns(){if(typeof fetch=="function")try{const t=await fetch("/api/runs");if(!t.ok)return;const e=await t.json();this.runsAll=e.runs||[],this.applyRunsFilters()}catch{this.runsStatus="Failed to load runs"}},applyRunsFilters(){let t=[...this.runsAll];const{search:e,status:n,tag:i,model:s}=this.runsFilter;if(n&&(t=t.filter(l=>l.status===n)),i&&(t=t.filter(l=>(l.tag||"").toLowerCase().includes(i.toLowerCase()))),s&&(t=t.filter(l=>(l.model||"").toLowerCase().includes(s.toLowerCase()))),e){const l=e.toLowerCase();t=t.filter(u=>(u.run_id||"").toLowerCase().includes(l)||(u.tag||"").toLowerCase().includes(l)||(u.model||"").toLowerCase().includes(l)||(u.prompt_positive||"").toLowerCase().includes(l)||(u.notes||"").toLowerCase().includes(l))}const{field:r,order:a}=this.runsSort;t.sort((l,u)=>{let d=l[r]||"",f=u[r]||"";return typeof d=="number"&&typeof f=="number"?a==="desc"?f-d:d-f:(d=String(d).toLowerCase(),f=String(f).toLowerCase(),a==="desc"?f.localeCompare(d):d.localeCompare(f))}),this.runsFiltered=t},toggleRunSelect(t){const e=this.runsSelected.indexOf(t);e>=0?this.runsSelected.splice(e,1):this.runsSelected.push(t)},async showRunDetails(t){if(typeof fetch=="function")try{const e=await fetch(`/api/runs/${t.run_id}`);if(!e.ok)return;this.runsDetailView=await e.json()}catch{this.runsStatus="Failed to load run details"}},async rerunRun(t){if(typeof fetch=="function"&&confirm(`Rerun ${t.run_id}?`))try{const n=await(await fetch(`/api/runs/${t.run_id}/rerun`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({overrides:{}})})).json();this.runsStatus=n.success?`Rerun request saved for ${t.run_id}`:n.error}catch{this.runsStatus="Failed to submit rerun"}},async deleteRun(t){if(typeof fetch=="function"&&confirm(`Delete ${t.run_id}? This cannot be undone.`))try{const n=await(await fetch(`/api/runs/${t.run_id}`,{method:"DELETE"})).json();n.success?(await this.refreshRuns(),this.runsStatus=`Deleted ${t.run_id}`):this.runsStatus=n.error}catch{this.runsStatus="Failed to delete run"}},async saveRunNotes(t){if(typeof fetch=="function")try{const n=await(await fetch(`/api/runs/${t.run_id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({notes:t.notes})})).json();this.runsStatus=n.success?"Notes saved":n.error}catch{this.runsStatus="Failed to save notes"}},async exportRuns(t){if(typeof fetch=="function")try{const e=await fetch(`/api/runs/export?format=${t}`);if(!e.ok)return;const n=await e.blob(),i=URL.createObjectURL(n),s=document.createElement("a");s.href=i,s.download=`runs_export.${t}`,s.click(),URL.revokeObjectURL(i)}catch{this.runsStatus="Failed to export"}},getRunProp(t,e){const n=this.runsAll.find(s=>s.run_id===t);if(!n)return"-";const i=n[e];return i==null||i===""?"-":(e==="prompt_positive"||e==="prompt_negative")&&String(i).length>80?String(i).slice(0,80)+"…":i},async exportRunComparison(t){if(this.runsSelected.length<2){this.runsStatus="Select at least 2 runs to compare";return}try{const e=await fetch("/api/runs/compare",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({run_ids:this.runsSelected,format:t})});if(!e.ok){const n=await e.json().catch(()=>({}));throw new Error(n.error||`HTTP ${e.status}`)}if(t==="csv"){const n=await e.blob(),i=URL.createObjectURL(n),s=document.createElement("a");s.href=i,s.download="runs_comparison.csv",s.click(),URL.revokeObjectURL(i)}else{const n=await e.json(),i=new Blob([JSON.stringify(n.comparison,null,2)],{type:"application/json"}),s=URL.createObjectURL(i),r=document.createElement("a");r.href=s,r.download="runs_comparison.json",r.click(),URL.revokeObjectURL(s)}this.runsStatus=`Exported comparison (${this.runsSelected.length} runs)`}catch(e){this.runsStatus=e.message||"Compare export failed"}},formatDate(t){if(!t)return"-";try{const e=new Date(t);return e.toLocaleDateString()+" "+e.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}catch{return t}},runRailSummary(t){const e=t&&(t.tag||t.notes||""),n=String(e||"").trim();return n?n.length>72?`${n.slice(0,71)}…`:n:""},averageByteRange(t,e,n){if(!t||!t.length)return 0;const i=Math.max(0,Math.min(t.length,e|0)),s=Math.max(i+1,Math.min(t.length,n|0));let r=0;for(let a=i;a<s;a+=1)r+=t[a];return r/(s-i)},updateBackgroundAudioMetrics(t){const e=this.backgroundAudioMetrics||{};if(!t||!t.length){this.backgroundAudioMetrics={active:!1,level:(e.level||0)*.82,bass:(e.bass||0)*.82,mid:(e.mid||0)*.82,treble:(e.treble||0)*.82,pulse:(e.pulse||0)*.88};return}const n=Math.max(1,Math.floor(t.length*.08)),i=Math.max(n+1,Math.floor(t.length*.32)),s=Math.max(i+1,Math.floor(t.length*.8)),r=this.averageByteRange(t,0,n)/255,a=this.averageByteRange(t,n,i)/255,l=this.averageByteRange(t,i,s)/255,u=Math.min(1,r*.42+a*.35+l*.23);this.backgroundAudioMetrics={active:u>.015,level:(e.level||0)*.68+u*.32,bass:(e.bass||0)*.7+r*.3,mid:(e.mid||0)*.7+a*.3,treble:(e.treble||0)*.7+l*.3,pulse:Math.min(1,(e.pulse||0)*.72+u*.6+r*.12)}},async openRunFromRail(t){this.switchTab("RUNS"),this.runsSelected=[t.run_id],await this.showRunDetails(t)},switchTab(t){this.currentTab=t;try{typeof window<"u"&&window.localStorage&&window.localStorage.setItem("defora_tab",t)}catch{}},switchSubTab(t,e){this.currentSubTab[t]=e;try{typeof window<"u"&&window.localStorage&&window.localStorage.setItem("defora_subtab_"+t,e)}catch{}},togglePlayPause(){this.toggleDeforumPlay()},stopVideo(){this.stopDeforumPlay()},toggleDeforumPlay(){this.deforumPlaying?this.pauseDeforumAnimation():this.startDeforumAnimation()},startDeforumAnimation(){var e;this.applyCrossfadeMorph();const t=this.parseFrameNumber((e=this.thumbs[0])==null?void 0:e.name)||0;this.sendControl("liveParam",{start_frame:t,should_resume:1}),this.deforumPlaying=!0,this.performance.status="Deforum animation playing",this.isPlaying=!0},pauseDeforumAnimation(){this.sendControl("liveParam",{is_paused_rendering:1}),this.deforumPlaying=!1,this.performance.status="Animation paused — parameter changes update preview",this.isPlaying=!1},stopDeforumPlay(){this.sendControl("liveParam",{is_paused_rendering:1,should_resume:0}),this.deforumPlaying=!1,this.performance.status="",this.isPlaying=!1;const t=this.playerEl||document.getElementById("player");t&&(t.pause(),t.currentTime=0)},async toggleStreamRecord(){if(this.isRecording){this.isRecording=!1;try{const e=await(await fetch("/api/stream/stop-record",{method:"POST"})).json();this.performance.status=e.success?"Recording stopped":e.error||"Stop failed"}catch{this.performance.status="Stop record failed"}}else{this.isRecording=!0;const t=`/tmp/defora_rec_${Date.now()}.mp4`;try{const n=await(await fetch("/api/stream/record",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({output:t,fps:24})})).json();this.performance.status=n.success?`Recording → ${t}`:n.error||"Record failed",n.success||(this.isRecording=!1)}catch{this.isRecording=!1,this.performance.status="Record failed"}}},async toggleRecord(){return this.toggleStreamRecord()},attachPlayer(){const t=document.getElementById("player");if(!t)return;this.playerEl&&this.timeHandler&&this.playerEl.removeEventListener("timeupdate",this.timeHandler),this.playerEl&&this.errorHandler&&this.playerEl.removeEventListener("error",this.errorHandler),this.playerEl=t;const e=this.streamSrc.includes("?")?this.streamSrc+"&t="+Date.now():this.streamSrc+"?t="+Date.now();if(this.hls&&this.hls.destroy&&(this.hls.destroy(),this.hls=null),t.canPlayType("application/vnd.apple.mpegurl"))t.src=e,t.load(),this.autoplayVideo(t);else if(typeof Hls<"u"&&Hls.isSupported&&Hls.isSupported()){const n=Hls&&Hls.Events||{MANIFEST_PARSED:"manifest_parsed",ERROR:"error"};this.hls=new Hls({liveSyncDurationCount:3}),this.hls.loadSource(e),this.hls.attachMedia(t),this.hls.on&&(this.hls.on(n.MANIFEST_PARSED,()=>this.autoplayVideo(t)),this.hls.on(n.ERROR,()=>{setTimeout(()=>this.attachPlayer(),800)}))}else t.src=e;this.timeHandler=()=>{if(!isNaN(t.currentTime)){const n=t.currentTime,i=Math.floor(n/60),s=(n%60).toFixed(2).padStart(5,"0");this.timecode=`${String(i).padStart(2,"0")}:${s}`}this.syncReferenceAudioToVideo(t)},this.errorHandler=()=>{setTimeout(()=>this.attachPlayer(),800)},t.addEventListener("timeupdate",this.timeHandler),t.addEventListener("error",this.errorHandler),t.addEventListener("play",()=>{this.isPlaying=!0,this.syncAvAudioPlayState(!0,t)}),t.addEventListener("pause",()=>{this.isPlaying=!1,this.syncAvAudioPlayState(!1,t)}),this.autoplayVideo(t)},syncReferenceAudioToVideo(t){if(!this.avSyncEnabled||!this.audio.objectUrl)return;const e=t||this.playerEl,n=this.$refs.avSyncAudio;if(!e||!n||e.paused)return;const i=Number(this.avSyncLeadSec),s=Number.isFinite(i)&&i>=0?i:4,r=Math.max(0,e.currentTime-s);if(Math.abs(n.currentTime-r)>.12)try{n.currentTime=r}catch{}n.paused&&n.play().catch(()=>{})},syncAvAudioPlayState(t,e){const n=this.$refs.avSyncAudio;if(!n||!this.avSyncEnabled||!this.audio.objectUrl)return;const i=e||this.playerEl;t&&i?(this.syncReferenceAudioToVideo(i),n.play().catch(()=>{})):n.pause()},autoplayVideo(t){const e=t||this.playerEl;if(!e||typeof e.play!="function")return;const n=e.play();n&&typeof n.catch=="function"&&n.then(()=>{this.isPlaying=!0}).catch(()=>{this.isPlaying=!1})},ensureLivePlayback(){this.playerEl&&(this.playerEl.paused||this.playerEl.readyState<2)&&this.autoplayVideo(this.playerEl)},lfoTarget(t){return!t||!t.target?null:this.lfoTargets.find(e=>e.key===t.target)||null},initLfoBase(t){const e=this.lfoTarget(t);e&&(t.base===null||t.base===void 0?t.base=e.default!=null?e.default:(e.min+e.max)/2:t.base=this.clampVal(t.base,e.min,e.max))},shapeValue(t,e){const n=e%(Math.PI*2);return t==="Square"?Math.sin(n)>=0?1:-1:t==="Saw"?n/Math.PI-1:t==="Triangle"?2*Math.asin(Math.sin(n))/Math.PI:Math.sin(n)},clampVal(t,e,n){return t==null||Number.isNaN(t)?e:Math.min(n,Math.max(e,t))},getNow(){return typeof performance<"u"&&performance.now?performance.now():Date.now()},runLfos(t=this.getNow()){if(this.audio.track)return;if(this.lastLfoTick===null){this.lastLfoTick=t;return}const e=(t-this.lastLfoTick)/1e3;if(this.lastLfoTick=t,e<=0)return;const n={},i={};this.lfos.forEach(s=>{if(!s.on||!s.targets.length)return;const r=s.bpm||this.lfoBpm||120,a=this.clampVal(s.depth??0,0,1),l=s.speed||1,u=e*(r/60)*Math.PI*2*l,d=(s.phase||0)+u;s.phase=d%(Math.PI*2);const f=this.shapeValue(s.shape,s.phase);s.targets.forEach(m=>{const p=this.lfoTargets.find(_=>_.key===m);if(!p)return;const o=s.base==null?p.default??(p.min+p.max)/2:this.clampVal(s.base,p.min,p.max);s.base===null&&(s.base=o);const h=a*(p.max-p.min)/2,y=this.clampVal(o+f*h,p.min,p.max);if(m.startsWith("cn_")){const _=m.split("_"),g=_[1],S=_[2],E=this.cn.slots.find(b=>b.id===g);E&&(S==="weight"?E.weight=y:S==="start"?E.start=y:S==="end"&&(E.end=y),i[g]=E)}else n[m]=y})}),Object.keys(n).length&&this.sendControl("liveParam",n),Object.values(i).forEach(s=>this.updateControlNet(s))},startLfoAnimation(){this.stopLfoAnimation();const t=e=>{this.lfos.forEach(n=>{const i=this.lfoCanvasRefs[n.id];!i||!i.getContext||this.drawLfoPreview(i,n,e)}),this._lfoAnimFrame=requestAnimationFrame(t)};this._lfoAnimFrame=requestAnimationFrame(t)},stopLfoAnimation(){this._lfoAnimFrame!=null&&typeof cancelAnimationFrame=="function"&&(cancelAnimationFrame(this._lfoAnimFrame),this._lfoAnimFrame=null)},drawLfoPreview(t,e,n){const i=t.getContext("2d");if(!i)return;const s=t.width,r=t.height,a=r/2,l=(r/2-4)*(e.depth||.2);i.fillStyle="#031b2d",i.fillRect(0,0,s,r),i.strokeStyle="rgba(12, 48, 72, 0.5)",i.lineWidth=.5,i.beginPath(),i.moveTo(0,a),i.lineTo(s,a),i.stroke();const u=(e.speed||1)*.002,d=(n||0)*u;i.strokeStyle=e.on?"#ff8a1a":"#444",i.lineWidth=2,i.beginPath();const f=2;for(let m=0;m<s;m++){const p=m/s*f*Math.PI*2+d;let o;const h=p%(Math.PI*2);e.shape==="Sine"?o=a+Math.sin(h)*l:e.shape==="Triangle"?o=a+2*Math.asin(Math.sin(h))/Math.PI*l:e.shape==="Saw"?o=a+(h/Math.PI-1)*l:o=a+(Math.sin(h)>=0?1:-1)*l,m===0?i.moveTo(m,o):i.lineTo(m,o)}if(i.stroke(),e.on){i.strokeStyle="rgba(255, 138, 26, 0.15)",i.lineWidth=6,i.beginPath();for(let m=0;m<s;m++){const o=(m/s*f*Math.PI*2+d)%(Math.PI*2);let h;e.shape==="Sine"?h=a+Math.sin(o)*l:e.shape==="Triangle"?h=a+2*Math.asin(Math.sin(o))/Math.PI*l:e.shape==="Saw"?h=a+(o/Math.PI-1)*l:h=a+(Math.sin(o)>=0?1:-1)*l,m===0?i.moveTo(m,h):i.lineTo(m,h)}i.stroke()}},processBeat(){const t=this.getNow(),n=60/(this.audio.bpm||120)*1e3;if(this.lastBeatTime===null){this.lastBeatTime=t,this.beatCount=0,this.beatPhase=0;return}const i=t-this.lastBeatTime;i>=n&&(this.lastBeatTime=t,this.beatCount++,this.triggerBeatMacros(t)),this.beatPhase=i/n%1},triggerBeatMacros(t=this.getNow()){const e={},n={};this.macrosRack.filter(s=>s.on).forEach(s=>{const r=this.lfoTargets.find(p=>p.key===s.target);if(!r||!this.shouldMacroTrigger(s,t))return;const l=r.default??(r.min+r.max)/2,u=this.clampVal(s.depth??.5,0,1),d=this.clampVal(s.offset??0,-1,1);let f;if(s.shape==="Noise")f=l+(Math.random()*2-1)*u*(r.max-r.min)/2;else{const p=this.beatPhase*Math.PI*2,o=this.shapeValue(s.shape||"Sine",p);f=l+(o+d)*u*(r.max-r.min)/2}const m=this.clampVal(f,r.min,r.max);if(s.target.startsWith("cn_")){const p=s.target.split("_"),o=p[1],h=p[2],y=this.cn.slots.find(_=>_.id===o);y&&(h==="weight"?y.weight=m:h==="start"?y.start=m:h==="end"&&(y.end=m),n[o]=y)}else e[s.target]=m}),Object.keys(e).length&&this.sendControl("liveParam",e),Object.values(n).forEach(s=>this.updateControlNet(s))},shouldMacroTrigger(t,e){const n=Number(t.bpm||0);if(n>0){const i=60/n*1e3,s=this.lastMacroTrigger[t.id]||0;return e-s>=i?(this.lastMacroTrigger[t.id]=e,!0):!1}return!0},connectWebSocket(){const t=(location.protocol==="https:"?"wss://":"ws://")+location.host+"/ws",e=()=>{this.ws=new WebSocket(t),this.ws.onopen=()=>{this.wsStatus="connected",this.collabIdentify()},this.ws.onclose=()=>{this.wsStatus="disconnected",this.collab.userId=null,setTimeout(e,1e3)},this.ws.onmessage=n=>{try{const i=JSON.parse(n.data);this.handleWsMessage(i)}catch{}}};e()},handleWsMessage(t){if(t.type==="hello"&&t.userId&&(this.collab.userId=t.userId,this.collabIdentify()),t.type==="presence"&&Array.isArray(t.users)){this.collab.users=t.users;const e={};t.users.forEach(n=>{(n.lockedParams||[]).forEach(i=>{e[i]=n.name})}),this.collab.locks=e}t.type==="shared_preset"&&(this.sharedPresetsStatus=`Shared preset ${t.action}: ${t.name}`,this.refreshSharedPresets(),setTimeout(()=>{this.sharedPresetsStatus=""},3e3)),t.type==="recording"&&(this.collab.recording=t.status==="started",this.collab.status=t.status==="started"?"Session recording…":"Recording saved on server"),t.type==="recordings"&&Array.isArray(t.files)&&(this.collab.recordings=t.files),t.type==="playback"&&(this.collab.status=`Playback started (${t.events||0} events)`),t.type==="error"&&(console.error("[Defora WS]",t.msg||t,t.locked||""),this.collab.status=t.msg||"WebSocket error"),t.type==="event"&&t.msg&&console.log("[Defora event]",t.msg),t.type==="stream"&&t.src&&(this.streamSrc=t.src+"?t="+Date.now(),this.attachPlayer()),t.type==="frame"&&this.refreshFrames()},collabIdentify(){!this.ws||this.ws.readyState!==1||this.wsSend({type:"identify",name:this.collab.userName||"Performer"})},saveCollabUserName(){try{localStorage.setItem("defora_user_name",this.collab.userName||"Performer")}catch{}},wsSend(t){!this.ws||this.ws.readyState!==1||this.ws.send(JSON.stringify(t))},modelSourceLabel(t){return ag(t)},isParamLocked(t){return!!this.collab.locks[t]},isParamLockedByMe(t){const e=this.collab.locks[t];return e&&e===(this.collab.userName||"Performer")},paramLockTitle(t){return this.collab.locks[t]?this.isParamLockedByMe(t)?"Unlock (you hold this lock)":`Locked by ${this.collab.locks[t]}`:"Lock parameter for collaboration"},toggleParamLock(t){this.isParamLockedByMe(t)?this.unlockParam(t):this.isParamLocked(t)?this.collab.status=`${t} is locked by ${this.collab.locks[t]}`:this.wsSend({type:"lock_param",param:t})},isParamPinned(t){return this.pinnedParams.includes(t)},toggleParamPin(t){const e=this.pinnedParams.indexOf(t);e===-1?this.pinnedParams.push(t):this.pinnedParams.splice(e,1);try{typeof localStorage<"u"&&localStorage.setItem("defora_pinned_params",JSON.stringify(this.pinnedParams))}catch{}},unlockParam(t){this.wsSend({type:"unlock_param",param:t})},toggleSessionRecording(){this.collab.recording?this.wsSend({type:"stop_recording"}):this.wsSend({type:"start_recording"})},listSessionRecordings(){this.wsSend({type:"list_recordings"})},playbackSessionRecording(t){this.wsSend({type:"playback_recording",recordingFile:t})},async refreshSharedPresets(){try{const{data:t}=await Wt("/api/shared-presets",{},"shared-presets list");this.sharedPresets=t.presets||[]}catch(t){this.sharedPresetsStatus=t.message}},async shareCurrentPreset(){const t=(this.sharedPresetName||this.newPresetName||this.currentPreset||"shared").replace(/[^a-zA-Z0-9_-]/g,"")||"shared",e={liveVibe:this.liveVibe,liveCam:this.liveCam,audio:{bpm:this.audio.bpm,track:this.audio.track},cn:{slots:this.cn.slots,active:this.cn.active},loras:{groupA:this.loras.groupA,groupB:this.loras.groupB},prompts:{pos:this.prompts.pos,neg:this.prompts.neg,morphOn:this.prompts.morphOn,crossfaderValue:this.prompts.crossfaderValue},lfos:this.lfos,macrosRack:this.macrosRack,paramSources:this.paramSources};try{await Wt("/api/shared-presets",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:t,preset:e,sharedBy:this.collab.userName||"anonymous",description:"Shared from web UI"})},"share preset"),this.sharedPresetsStatus=`Shared as ${t}`,this.sharedPresetName=t,await this.refreshSharedPresets()}catch(n){this.sharedPresetsStatus=n.message}},async loadSharedPreset(t){try{const{data:e}=await Wt(`/api/shared-presets/${encodeURIComponent(t)}`,{},"load shared preset"),n=e.preset||e;n.liveVibe&&(this.liveVibe=n.liveVibe),n.liveCam&&(this.liveCam=n.liveCam),n.audio&&Object.assign(this.audio,n.audio),n.cn&&Object.assign(this.cn,n.cn),n.lfos&&(this.lfos=n.lfos),n.macrosRack&&(this.macrosRack=n.macrosRack),n.prompts&&Object.assign(this.prompts,n.prompts),n.loras&&(this.loras.groupA=n.loras.groupA||[],this.loras.groupB=n.loras.groupB||[],await this.refreshLoras()),this.sharedPresetsStatus=`Loaded shared preset: ${t}`,setTimeout(()=>{this.sharedPresetsStatus=""},3e3)}catch(e){this.sharedPresetsStatus=e.message}},async deleteSharedPreset(t){if(confirm(`Delete shared preset "${t}"?`))try{await Wt(`/api/shared-presets/${encodeURIComponent(t)}`,{method:"DELETE"},"delete shared preset"),await this.refreshSharedPresets(),this.sharedPresetsStatus=`Deleted ${t}`}catch(e){this.sharedPresetsStatus=e.message}},async refreshGpuPool(t=!1){this.gpuPool.loading=!0;try{t&&await Wt("/api/gpu-pool/refresh",{method:"POST"},"gpu pool refresh");const{data:e}=await Wt("/api/gpu-pool",{},"gpu pool status");this.gpuPool.enabled=!!e.enabled,this.gpuPool.strategy=e.strategy||"round_robin",this.gpuPool.healthyNodes=e.healthyNodes??0,this.gpuPool.nodes=e.nodes||[]}catch(e){this.gpuPool.status=e.message}finally{this.gpuPool.loading=!1}},async saveGpuPoolSettings(){try{await Wt("/api/gpu-pool",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({enabled:this.gpuPool.enabled,strategy:this.gpuPool.strategy})},"gpu pool settings"),this.gpuPool.status=this.gpuPool.enabled?"Load balancing enabled":"Load balancing disabled"}catch(t){this.gpuPool.status=t.message}},async addGpuNode(){const t=(this.gpuPool.draft.url||"").trim();if(t)try{await Wt("/api/gpu-pool/nodes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:t,name:this.gpuPool.draft.name||t,backend:this.gpuPool.draft.backend,enabled:!1,priority:this.gpuPool.draft.priority||1})},"add gpu node"),this.gpuPool.draft={url:"",name:"",backend:"sd-forge",priority:1},await this.refreshGpuPool(!1),this.gpuPool.status="Instance added (disabled). Edit if needed, then enable."}catch(e){this.gpuPool.status=e.message}},startEditGpuNode(t){if(t.enabled){this.gpuPool.status="Disable the node before editing.";return}this.gpuPool.editId=t.id,this.gpuPool.editDraft={name:t.name,url:t.url,backend:t.backend,priority:t.priority||1}},async saveGpuNodeEdit(t){try{await Wt(`/api/gpu-pool/nodes/${encodeURIComponent(t.id)}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(this.gpuPool.editDraft)},"edit gpu node"),this.gpuPool.editId=null,await this.refreshGpuPool(!1),this.gpuPool.status="Node updated."}catch(e){this.gpuPool.status=e.message}},async disableGpuNode(t){try{await Wt(`/api/gpu-pool/nodes/${encodeURIComponent(t.id)}/disable`,{method:"POST"},"disable gpu"),await this.refreshGpuPool(!1)}catch(e){this.gpuPool.status=e.message}},async enableGpuNode(t){try{await Wt(`/api/gpu-pool/nodes/${encodeURIComponent(t.id)}/enable`,{method:"POST"},"enable gpu"),await this.refreshGpuPool(!0),this.gpuPool.status=`${t.name} enabled.`}catch(e){this.gpuPool.status=e.message}},async removeGpuNode(t){if(confirm(`Remove GPU instance "${t.name}"?`))try{await Wt(`/api/gpu-pool/nodes/${encodeURIComponent(t.id)}`,{method:"DELETE"},"remove gpu"),await this.refreshGpuPool(!1),this.gpuPool.status="Node removed."}catch(e){this.gpuPool.status=e.message}},formatGpuMemory(t){if(t.memoryUsedMb==null&&t.memoryTotalMb==null)return"—";const e=t.memoryUsedMb!=null?`${t.memoryUsedMb}`:"?",n=t.memoryTotalMb!=null?`${t.memoryTotalMb}`:"?";return`${e} / ${n} MB`},sendControl(t,e){if(!this.ws||this.ws.readyState!==1)return;const n=If(),i=n?{type:"control",controlType:t,payload:e,token:n}:{type:"control",controlType:t,payload:e};this.ws.send(JSON.stringify(i))},updateParam(t,e){if(this.isParamLocked(t.key)&&!this.isParamLockedByMe(t.key)){console.warn(`[Defora] Parameter "${t.key}" is locked by ${this.collab.locks[t.key]}`);return}const n=parseFloat(e.target.value);t.val=n,this.queueLiveParam(t.key,n),this.deforumPlaying||this.schedulePreviewFrame()},setSource(t,e){this.paramSources[t]=e,this.sendControl("paramSource",{key:t,source:e})},sourceTip(t){const e=this.paramSources[t.key];return e==="Beat"?"Beat/LFO":e==="MIDI"?"MIDI mapping":"Manual"},sendPreset(t){const e=this.motionPresets[t];e&&(this.sendControl("liveParam",e),console.log(`Applied motion preset: ${t}`,e))},resetVibeParams(){const t={cfg:6,strength:.65,noise:1,cfgscale:5};this.liveVibe.forEach(e=>{t[e.key]!==void 0&&(e.val=t[e.key],this.queueLiveParam(e.key,t[e.key]))})},resetCameraParams(){const t={zoom:.8,panx:0,pany:0,tilt:0};this.liveCam.forEach(e=>{t[e.key]!==void 0&&(e.val=t[e.key],this.queueLiveParam(e.key,t[e.key]))}),this.sendControl("liveParam",this.motionPresets.Static)},setupKeyboardShortcuts(){if(typeof document>"u")return;const t=this;this._keyHandler=e=>{if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA"||e.ctrlKey||e.metaKey||e.altKey)return;if(t.bindingLearnMode&&t.bindingTargetKey){const i=e.key.toLowerCase();if(i.length===1||["arrowup","arrowdown","arrowleft","arrowright","space","enter","tab"].includes(i)){t.keyBindings[t.bindingTargetKey]=i,t.saveBindings(),t.status=`Bound "${t.bindingTargetKey}" → ${i}`,t.bindingTargetKey=null,e.preventDefault();return}}const n=Object.entries(t.keyBindings).find(([,i])=>i===e.key.toLowerCase());if(n){const[i]=n,s=t.lfoTargets.find(r=>r.key===i);if(s){const r=t.getParamValue(i),a=(s.max-s.min)*.05;t.queueLiveParam(i,Math.min(s.max,Math.max(s.min,r+a))),e.preventDefault();return}}switch(e.key){case"1":case"2":case"3":case"4":case"5":case"6":case"7":const i=["LIVE","PROMPTS","MOTION","MODULATION","AUDIO","SETTINGS","GENERATE"];t.currentTab=i[parseInt(e.key)-1],e.preventDefault();break;case" ":(t.currentTab==="LIVE"||t.currentTab==="GENERATE")&&(t.generatePreviewFrame(),e.preventDefault());break;case"r":t.currentTab==="LIVE"&&(t.resetVibeParams(),t.resetCameraParams(),e.preventDefault());break;case"m":t.currentTab==="PROMPTS"&&(t.prompts.morphOn=!t.prompts.morphOn,t.setMorph(t.prompts.morphOn),e.preventDefault());break;case"l":t.currentTab==="MODULATION"&&(t.lfoOn=!t.lfoOn,e.preventDefault());break;case"b":t.currentTab==="MODULATION"&&(t.beatMacroOn=!t.beatMacroOn,e.preventDefault());break}},document.addEventListener("keydown",this._keyHandler)},midiTarget(t){return this.lfoTargets.find(e=>e.key===t)||null},updateMidiMapping(t){return t},setMorph(t){this.prompts.morphOn=t,this.sendControl("prompts",{morphOn:t}),t&&this.applyPromptMorphing()},parseMorphRange(t){const e=String(t||"0–1").match(/([0-9.]+)\s*[–\-]\s*([0-9.]+)/);if(!e)return{min:0,max:1};const n=Math.min(parseFloat(e[1]),parseFloat(e[2])),i=Math.max(parseFloat(e[1]),parseFloat(e[2]));return{min:n,max:i}},morphSlotInRange(t){const{min:e,max:n}=this.parseMorphRange(t.range),i=this.prompts.morphBlend??.5;return i>=e&&i<=n},morphBlendInSlotRange(t){const{min:e,max:n}=this.parseMorphRange(t.range),i=this.prompts.morphBlend??.5;return n<=e?i:Math.max(0,Math.min(1,(i-e)/(n-e)))},morphSlotPreview(t){if(!t.on||!this.morphSlotInRange(t))return"—";const e=js({type:"prompt",valueA:t.a,valueB:t.b},this.morphBlendInSlotRange(t));if(!e)return"—";const n=t.weight!=null?t.weight:1;return n<.99?`${e} ×${n.toFixed(2)}`:e},onPromptMorphBlendInput(){this.applyPromptMorphing(),this.deforumPlaying||this.schedulePreviewFrame()},onMorphSlotWeightInput(t){this.applyPromptMorphing(),this.deforumPlaying||this.schedulePreviewFrame()},applyPromptMorphing(){if(!this.prompts.morphOn)return;const t=(this.prompts.pos||"").trim(),e=t?[t]:[];for(const i of this.morphSlots){if(!i.on||!this.morphSlotInRange(i))continue;const s=js({type:"prompt",valueA:i.a,valueB:i.b},this.morphBlendInSlotRange(i));if(!s)continue;const r=Math.max(0,Math.min(1,i.weight!=null?i.weight:1));r>=.99?e.push(s):e.push(`(${s}:${r.toFixed(2)})`)}const n=e.join(", ").trim();n&&(this.prompts.pos=n,this.sendControl("prompt",{positive:n,negative:this.prompts.neg,morphBlend:this.prompts.morphBlend}))},sendPrompts(){this.sendControl("prompt",{positive:this.prompts.pos,negative:this.prompts.neg}),this.prompts.morphOn&&this.applyPromptMorphing()},addMacro(){if(this.macrosRack.length>=6)return;const t=`macro-${Date.now()}-${Math.random().toString(36).substring(2,11)}`;this.macrosRack.push({id:t,on:!0,target:"cfg",shape:"Sine",bpm:120,depth:.5,offset:0,show:!1})},removeMacro(t){this.macrosRack.length<=1||this.macrosRack.splice(t,1)},addAudioMapping(){this.audioMappings.push({param:"",freq_min:60,freq_max:500,out_min:0,out_max:1})},removeAudioMapping(t){this.audioMappings.splice(t,1)},applyAudioBandPreset(t,e){const n=this.audioBandPresets[e],i=this.audioMappings[t];!n||!i||(i.freq_min=n.freq_min,i.freq_max=n.freq_max)},handleImg2imgFile(t){const e=t.target.files&&t.target.files[0];if(!e)return;const n=new FileReader;n.onload=()=>{this.img2img.dataUrl=n.result,this.img2img.status="Init image loaded"},n.onerror=()=>{this.img2img.status="Could not read file"},n.readAsDataURL(e)},handleImg2imgMask(t){const e=t.target.files&&t.target.files[0];if(!e)return;const n=new FileReader;n.onload=()=>{this.img2img.maskDataUrl=n.result,this.img2img.status="Mask loaded (inpaint)"},n.onerror=()=>{this.img2img.status="Could not read mask file"},n.readAsDataURL(e)},clearImg2imgMask(){this.img2img.maskDataUrl=null,this.img2img.status="Mask cleared"},async refreshPlugins(){if(typeof fetch=="function")try{const t=await fetch("/api/plugins");if(!t.ok)return;const e=await t.json();this.pluginsRegistry=Array.isArray(e.plugins)?e.plugins:[]}catch{this.pluginsRegistry=[]}},async submitImg2img(){if(!this.img2img.dataUrl){this.img2img.status="Choose an init image first";return}this.img2img.status="Submitting…";try{const t={init_image:this.img2img.dataUrl,prompt:this.prompts.pos,negative_prompt:this.prompts.neg,denoising_strength:this.img2img.denoisingStrength,width:this.img2img.width,height:this.img2img.height};this.img2img.maskDataUrl&&(t.mask_image=this.img2img.maskDataUrl,t.mask_blur=this.img2img.maskBlur,t.inpainting_fill=this.img2img.inpaintingFill,t.inpaint_full_res=this.img2img.inpaintFullRes);const e=await fetch("/api/img2img",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),n=await e.json();if(!e.ok)throw new Error(n.error||n.detail||e.statusText);this.img2img.lastPath=n.path||null,this.img2img.status=n.path?`OK → ${n.path}`:"OK"}catch(t){this.img2img.status=String(t.message||t)}},addLfo(){const t=this.lfos.length?Math.max(...this.lfos.map(e=>e.id))+1:1;this.lfos.push({id:t,on:!0,targets:[],shape:"Sine",bpm:this.lfoBpm||120,speed:1,depth:.2,base:null,phase:0})},removeLfo(t){this.lfos.length<=1||this.lfos.splice(t,1)},resetLfo(t){const e=this.lfos[t];e&&(e.targets=[],e.shape="Sine",e.bpm=this.lfoBpm||120,e.speed=1,e.depth=.2,e.base=null,e.phase=0,e.on=!1)},addLfoTarget(t){const e=this.lfoTargetPick[t];if(!e)return;const n=this.lfos[t];if(!n||n.targets.includes(e)){this.$set?this.$set(this.lfoTargetPick,t,""):this.lfoTargetPick[t]="";return}if(n.targets.push(e),n.base===null){const i=this.lfoTargets.find(s=>s.key===e);i&&(n.base=i.default??(i.min+i.max)/2)}this.lfoTargetPick[t]=""},removeLfoTarget(t,e){const n=this.lfos[t];n&&n.targets.splice(e,1)},saveCurrentMotionStyle(){const t=prompt("Enter style name:");if(!t||!t.trim())return;const e={translation_z:.8,rotation_z:0,rotation_y:0,translation_x:0,translation_y:0};this.motionStylesSaved[t.trim()]=e;try{typeof window<"u"&&window.localStorage&&window.localStorage.setItem("defora_motion_styles",JSON.stringify(this.motionStylesSaved))}catch{}},loadMotionStyles(){try{if(typeof window<"u"&&window.localStorage){const t=window.localStorage.getItem("defora_motion_styles");if(t){const e=JSON.parse(t);e&&typeof e=="object"&&(this.motionStylesSaved=e)}}}catch{}},deleteSavedMotionStyle(t){if(confirm(`Delete saved style "${t}"?`)){delete this.motionStylesSaved[t];try{typeof window<"u"&&window.localStorage&&window.localStorage.setItem("defora_motion_styles",JSON.stringify(this.motionStylesSaved))}catch{}}},applySavedMotionStyle(t){const e=this.motionStylesSaved[t];e&&this.sendControl("liveParam",e)},applyMotionPreset(t){const e=this.motionPresets[t];e&&this.sendControl("liveParam",e)},queueLiveParam(t,e){const n=this.getNow(),i=this.lastParamSent[t]||0;if(this.liveParamPending[t]=e,n-i>this.controlDelayMs){this.lastParamSent[t]=n,this.sendControl("liveParam",{[t]:e});return}clearTimeout(this.liveParamTimers[t]),this.liveParamTimers[t]=setTimeout(()=>{const s=this.liveParamPending[t];delete this.liveParamPending[t],this.lastParamSent[t]=this.getNow(),this.sendControl("liveParam",{[t]:s})},this.controlDelayMs)},async refreshFrames(){if(typeof fetch=="function")try{const t=await fetch("/api/frames?limit=10",{cache:"no-store"});if(!t.ok){this.framesRefreshBackoffMs=Math.min(6e4,(this.framesRefreshBackoffMs||5e3)*2);return}const e=await t.json();Array.isArray(e.items)&&(this.thumbs=e.items.map(n=>{if(typeof n=="string")return{src:n,name:n.split("/").pop(),frame:this.parseFrameNumber(n)};const i=n.src||n.url||n.path||"",s=n.name||i.split("/").pop(),r=n.frame!=null?n.frame:this.parseFrameNumber(s||i);return{src:i,name:s,frame:r}})),this.framesRefreshBackoffMs=5e3}catch(t){console.warn("frames fetch failed",t),this.framesRefreshBackoffMs=Math.min(6e4,(this.framesRefreshBackoffMs||5e3)*2)}},parseFrameNumber(t){if(!t)return null;const e=String(t).match(/(\d{3,})/);return e?parseInt(e.pop(),10):null},async runAudioMod(){if(!this.audio.track){this.audioStatus="Set audio file first";return}const t=this.audioMappings.filter(e=>e.param&&!Number.isNaN(e.freq_min)&&!Number.isNaN(e.freq_max)).map(e=>({param:e.param,freq_min:e.freq_min,freq_max:e.freq_max,out_min:e.out_min??0,out_max:e.out_max??1}));if(!t.length){this.audioStatus="Add at least one mapping";return}try{const e=await fetch("/api/audio-map",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({audioPath:this.audio.track,fps:this.stats.fps||24,mappings:t,live:!0})}),n=await e.json();!e.ok||n.error?this.audioStatus=n.error||"Audio processing failed":this.audioStatus=n.ok?"Audio sent to mediator":"Audio processing finished with errors"}catch(e){this.audioStatus=String(e)}},frameLabel(t){return t?t.frame!=null&&!isNaN(t.frame)?t.frame:t.name?t.name.replace(/\.[^.]+$/,""):t.src||"?":"?"},async scanMidi(){if(!navigator.requestMIDIAccess){this.midi.supported=!1;return}try{const t=await navigator.requestMIDIAccess({sysex:!1}),e=[];t.inputs.forEach(n=>{e.push({id:n.id,name:n.name}),n.onmidimessage=i=>this.handleMidi(n,i)}),this.midi.devices=e,!this.midi.selected&&e.length&&(this.midi.selected=e[0].id),this.loadMidiMappings()}catch{this.midiStatus="MIDI not available"}},loadMidiMappings(){const t=typeof window<"u"&&window.localStorage||typeof global<"u"&&global.window&&global.window.localStorage;if(t)try{const e=t.getItem("defora_midi_mappings");if(e){const n=JSON.parse(e);Array.isArray(n)&&n.length>0&&(this.midi.mappings=n,console.log("Loaded MIDI mappings from localStorage",n))}}catch(e){console.error("Failed to load MIDI mappings",e)}},saveMidiMappings(){const t=typeof window<"u"&&window.localStorage||typeof global<"u"&&global.window&&global.window.localStorage;if(!t)return!1;try{return t.setItem("defora_midi_mappings",JSON.stringify(this.midi.mappings)),console.log("Saved MIDI mappings to localStorage",this.midi.mappings),!0}catch(e){return console.error("Failed to save MIDI mappings",e),!1}},addMidiMapping(){this.midi.mappings.push({control:"New Mapping",cc:0,key:""}),this.saveMidiMappings()},deleteMidiMapping(t){this.midi.mappings.splice(t,1),this.saveMidiMappings()},updateMidiMapping(t){return this.saveMidiMappings(),t},loadBindings(){try{const t=typeof window<"u"&&window.localStorage||null;if(!t)return;const e=t.getItem("defora_key_bindings");if(e){const n=JSON.parse(e);n&&typeof n=="object"&&(this.keyBindings={...this.keyBindings,...n})}}catch{}},saveBindings(){try{const t=typeof window<"u"&&window.localStorage||null;if(!t)return;t.setItem("defora_key_bindings",JSON.stringify(this.keyBindings))}catch{}},toggleBindingLearn(){this.bindingLearnMode=!this.bindingLearnMode,this.bindingTargetKey=null,this.bindingLearnMode?this.status="Learn mode: press key or move MIDI CC, then click a parameter":this.status="Learn mode disabled"},resetBindings(){confirm("Reset all bindings to defaults?")&&(this.keyBindings={translation_z:"w",translation_x:"a",translation_y:"s",rotation_y:"d",rotation_z:"q",fov:"e",cfg:"z",strength:"x",noise_multiplier:"c"},this.saveBindings(),this.status="Bindings reset to defaults")},getKeyBinding(t){return this.keyBindings[t]||null},clearKeyBinding(t){delete this.keyBindings[t],this.saveBindings()},getMidiBinding(t){const e=this.midi.mappings.find(n=>n.key===t);return e?e.cc:null},clearMidiBinding(t){const e=this.midi.mappings.findIndex(n=>n.key===t);e>=0&&(this.midi.mappings.splice(e,1),this.saveMidiMappings())},getParamValue(t){const n=[...this.liveVibe,...this.liveCam].find(i=>i.key===t);return n?n.val:0},queueLiveParam(t,e){const i=[...this.liveVibe,...this.liveCam].find(s=>s.key===t);i&&(i.val=e,this.sendControl("liveParam",{[t]:e}))},async refreshPresets(){try{const{data:t}=await Wt("/api/presets",{},"presets list");this.availablePresets=t.presets||[]}catch{}},async loadPreset(t){try{const n=await(await fetch(`/api/presets/${t}`)).json();n.preset&&(n.preset.liveVibe&&(this.liveVibe=n.preset.liveVibe),n.preset.liveCam&&(this.liveCam=n.preset.liveCam),n.preset.audio&&Object.assign(this.audio,n.preset.audio),n.preset.cn&&Object.assign(this.cn,n.preset.cn),n.preset.lfos&&(this.lfos=n.preset.lfos),n.preset.macrosRack&&(this.macrosRack=n.preset.macrosRack),n.preset.loras&&(this.loras.groupA=n.preset.loras.groupA||[],this.loras.groupB=n.preset.loras.groupB||[],await this.refreshLoras()),n.preset.prompts&&Object.assign(this.prompts,n.preset.prompts),this.currentPreset=t,this.presetStatus=`Loaded preset: ${t}`,setTimeout(()=>{this.presetStatus=""},3e3))}catch(e){console.error("Failed to load preset",e),this.presetStatus=`Error loading preset: ${e.message}`}},async saveCurrentPreset(){const t=this.newPresetName||"untitled",e={liveVibe:this.liveVibe,liveCam:this.liveCam,audio:{bpm:this.audio.bpm,track:this.audio.track},cn:{slots:this.cn.slots,active:this.cn.active},loras:{groupA:this.loras.groupA,groupB:this.loras.groupB},prompts:{pos:this.prompts.pos,neg:this.prompts.neg,morphOn:this.prompts.morphOn,crossfaderValue:this.prompts.crossfaderValue},lfos:this.lfos,macrosRack:this.macrosRack,paramSources:this.paramSources};try{(await(await fetch(`/api/presets/${t}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})).json()).ok&&(this.currentPreset=t,this.presetStatus=`Saved preset: ${t}`,this.newPresetName="",await this.refreshPresets(),setTimeout(()=>{this.presetStatus=""},3e3))}catch(n){console.error("Failed to save preset",n),this.presetStatus=`Error saving preset: ${n.message}`}},async deletePreset(t){if(confirm(`Delete preset "${t}"?`))try{await fetch(`/api/presets/${t}`,{method:"DELETE"}),this.currentPreset=null,this.presetStatus=`Deleted preset: ${t}`,await this.refreshPresets(),setTimeout(()=>{this.presetStatus=""},3e3)}catch(e){console.error("Failed to delete preset",e),this.presetStatus=`Error deleting preset: ${e.message}`}},invalidateAudioSpectrogram(){this._spectrogramGen=(this._spectrogramGen||0)+1,this.audioSpectrogramDataUrl=null,this.audioSpectrogramStatus=""},buildSpectrogramRgba(t,e){t.sampleRate,t.numberOfChannels;const n=t.length,i=t.getChannelData(0),s=n>=8192?1024:Math.max(256,Math.pow(2,Math.floor(Math.log2(n/4)))),r=s/2,a=Math.max(1,Math.floor((n-s)/r)+1),l=s/2,u=Math.max(64,a),d=Math.max(32,Math.min(l,128)),f=new Uint8ClampedArray(u*d*4),m=Math.max(1,a/u);for(let p=0;p<u;p++){const h=Math.floor(p*m)*r;for(let y=0;y<d;y++){let _=0,g=0;for(let L=0;L<s;L++){const w=h+L;if(w>=n)break;const D=.5*(1-Math.cos(2*Math.PI*L/(s-1))),x=i[w]*D,R=2*Math.PI*y*L/s;_+=x*Math.cos(R),g-=x*Math.sin(R)}const S=Math.sqrt(_*_+g*g)/s,E=Math.min(1,S*10),b=(y*u+p)*4;E<.25?(f[b]=0,f[b+1]=Math.floor(E*4*255),f[b+2]=255):E<.5?(f[b]=0,f[b+1]=255,f[b+2]=Math.floor((1-(E-.25)*4)*255)):E<.75?(f[b]=Math.floor((E-.5)*4*255),f[b+1]=255,f[b+2]=0):(f[b]=255,f[b+1]=Math.floor((1-(E-.75)*4)*255),f[b+2]=0),f[b+3]=255}}return{width:u,height:d,data:f}},spectrogramRgbaToDataUrl(t){if(typeof OffscreenCanvas<"u"){const e=new OffscreenCanvas(t.width,t.height),n=e.getContext("2d"),i=n.createImageData(t.width,t.height);return i.data.set(t.data),n.putImageData(i,0,0),e.toDataURL("image/png")}if(typeof document<"u"){const e=document.createElement("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d"),i=n.createImageData(t.width,t.height);return i.data.set(t.data),n.putImageData(i,0,0),e.toDataURL("image/png")}return null},scheduleAudioSpectrogramDecode(t){typeof setTimeout=="function"&&setTimeout(()=>{this.runAudioSpectrogramFromObjectUrl(t).catch(()=>{})},0)},async runAudioSpectrogramFromObjectUrl(t){const e=typeof AudioContext<"u"?AudioContext:typeof webkitAudioContext<"u"?webkitAudioContext:null;if(!e||!this.audio.objectUrl||typeof fetch!="function"){t===this._spectrogramGen&&(this.audioSpectrogramStatus="");return}if(t!==this._spectrogramGen)return;let n=null;try{const s=await(await fetch(this.audio.objectUrl)).arrayBuffer();if(t!==this._spectrogramGen)return;n=new e;const r=await n.decodeAudioData(s.slice(0));if(t!==this._spectrogramGen)return;const a=this.buildSpectrogramRgba(r,{});if(!a){this.audioSpectrogramStatus="";return}const l=this.spectrogramRgbaToDataUrl(a);if(t!==this._spectrogramGen)return;this.audioSpectrogramDataUrl=l,this.audioSpectrogramStatus=""}catch{t===this._spectrogramGen&&(this.audioSpectrogramStatus="")}finally{try{n&&typeof n.close=="function"&&await n.close()}catch{}}},spectrogramFromAudioBuffer(t,e){return this.buildSpectrogramRgba(t,e||{})},disposeLiveAudioAnalyser(){this._liveSpecRaf!=null&&typeof cancelAnimationFrame=="function"&&cancelAnimationFrame(this._liveSpecRaf),this._liveSpecRaf=null;const t=this.$refs&&this.$refs.avSyncAudio;if(t&&this._liveSpecMediaHandlers){const n=this._liveSpecMediaHandlers;n.play&&t.removeEventListener("play",n.play),n.pause&&t.removeEventListener("pause",n.pause),this._liveSpecMediaHandlers=null}try{this._liveSpecSource&&typeof this._liveSpecSource.disconnect=="function"&&this._liveSpecSource.disconnect()}catch{}try{this._liveSpecAnalyser&&typeof this._liveSpecAnalyser.disconnect=="function"&&this._liveSpecAnalyser.disconnect()}catch{}try{this._liveSpecGain&&typeof this._liveSpecGain.disconnect=="function"&&this._liveSpecGain.disconnect()}catch{}const e=this._liveSpecCtx;if(this._liveSpecCtx=null,this._liveSpecSource=null,this._liveSpecAnalyser=null,this._liveSpecGain=null,this._liveSpecFreqBuf=null,this.updateBackgroundAudioMetrics(null),e&&typeof e.close=="function")try{e.close()}catch{}},setupLiveAudioAnalyser(){const t=typeof AudioContext<"u"?AudioContext:typeof webkitAudioContext<"u"?webkitAudioContext:null;if(!t)return;this.disposeLiveAudioAnalyser();const e=this.$refs&&this.$refs.avSyncAudio;if(!(!e||!this.audio.objectUrl))try{const n=new t,i=n.createMediaElementSource(e),s=n.createAnalyser();s.fftSize=1024,s.smoothingTimeConstant=.78;const r=n.createGain();r.gain.value=1,i.connect(s),s.connect(r),r.connect(n.destination),this._liveSpecCtx=n,this._liveSpecSource=i,this._liveSpecAnalyser=s,this._liveSpecGain=r,this._liveSpecFreqBuf=new Uint8Array(s.frequencyBinCount);const a=()=>this.onLiveAudioPlay(),l=()=>this.onLiveAudioPause();e.addEventListener("play",a),e.addEventListener("pause",l),this._liveSpecMediaHandlers={play:a,pause:l},e.paused||this.onLiveAudioPlay()}catch{this.disposeLiveAudioAnalyser()}},onLiveAudioPlay(){try{this._liveSpecCtx&&this._liveSpecCtx.state==="suspended"&&typeof this._liveSpecCtx.resume=="function"&&this._liveSpecCtx.resume()}catch{}this.scheduleLiveSpectrumFrame()},onLiveAudioPause(){this._liveSpecRaf!=null&&typeof cancelAnimationFrame=="function"&&cancelAnimationFrame(this._liveSpecRaf),this._liveSpecRaf=null,this.paintLiveSpectrumCanvases(null),this.updateBackgroundAudioMetrics(null)},scheduleLiveSpectrumFrame(){this._liveSpecRaf==null&&typeof requestAnimationFrame=="function"&&(this._liveSpecRaf=requestAnimationFrame(()=>{this._liveSpecRaf=null;const t=this.$refs&&this.$refs.avSyncAudio,e=this._liveSpecAnalyser,n=this._liveSpecFreqBuf;!e||!n||(t&&!t.paused&&!t.ended?(e.getByteFrequencyData(n),this.paintLiveSpectrumCanvases(n),this.scheduleLiveSpectrumFrame()):this.paintLiveSpectrumCanvases(null))}))},paintLiveSpectrumCanvases(t){this.updateBackgroundAudioMetrics(t);const e=[this.$refs.liveSpectrumCanvas,this.$refs.liveSpectrumCanvasStrip].filter(Boolean);for(const n of e){if(!n||!n.getContext)continue;const i=n.getContext("2d");if(!i)continue;const s=n.width||280,r=n.height||56;if(!t||!t.length){i.fillStyle="#031b2d",i.fillRect(0,0,s,r);continue}paintLiveSpectrumBandBars(i,t,s,r)}},async handleAudioUpload(t){const e=t.target.files[0];if(!e)return;this.disposeLiveAudioAnalyser(),this.invalidateAudioSpectrogram();const n=50*1024*1024;if(e.size!=null&&e.size>n){this.audioStatus="Audio file is too large. Maximum supported size is 50MB.",t&&t.target&&(t.target.value="");return}if(this.audio.objectUrl){try{URL.revokeObjectURL(this.audio.objectUrl)}catch{}this.audio.objectUrl=null}if(typeof URL<"u"&&typeof URL.createObjectURL=="function"&&typeof Blob<"u"&&e instanceof Blob)try{this.audio.objectUrl=URL.createObjectURL(e)}catch{this.audio.objectUrl=null}this.audioStatus="Uploading audio…";try{const i=await new Promise((u,d)=>{const f=new FileReader;f.onload=()=>u(f.result),f.onerror=()=>d(f.error||new Error("Failed to read audio file. Ensure the file is under 50MB and try again.")),f.readAsDataURL(e)}),s=await fetch("/api/audio-upload",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:e.name,data:i})}),r=await s.json();if(!s.ok||r.error)throw new Error(r.error||"Upload failed");this.audio.uploadedFile=e.name,this.audio.track=r.path||e.name,this.audioStatus="Audio uploaded";const a=this._spectrogramGen;this.audio.objectUrl&&(this.audioSpectrogramStatus="Analyzing…",this.scheduleAudioSpectrogramDecode(a));const l=()=>{try{this.setupLiveAudioAnalyser()}catch{}};typeof this.$nextTick=="function"?this.$nextTick(l):setTimeout(l,0)}catch(i){if(this.audio.objectUrl){try{URL.revokeObjectURL(this.audio.objectUrl)}catch{}this.audio.objectUrl=null}this.audioStatus=String(i&&i.message?i.message:i),console.error("Audio upload failed:",i),this.invalidateAudioSpectrogram(),this.disposeLiveAudioAnalyser()}},clearAudioFile(){if(this.disposeLiveAudioAnalyser(),this.invalidateAudioSpectrogram(),this.audio.uploadedFile=null,this.audio.track="",this.audio.objectUrl){try{URL.revokeObjectURL(this.audio.objectUrl)}catch{}this.audio.objectUrl=null}this.avSyncEnabled=!1;const t=this.$refs.avSyncAudio;if(t)try{typeof t.pause=="function"&&t.pause()}catch{}this.audioStatus="Idle",this.$refs.audioFileInput&&(this.$refs.audioFileInput.value="")},async loadControlNetModels(){try{const{data:t}=await Wt("/api/controlnet/models",{},"controlnet models");this.cn.availableModels=t.models||[],this.cn.source=t.source||"unknown"}catch{}},updateControlNet(t){const e={controlnet_slot:t.id,controlnet_model:t.model,controlnet_weight:t.weight,controlnet_start:t.start,controlnet_end:t.end,controlnet_enabled:t.enabled};this.sendControl("controlNet",e),console.log("Updated ControlNet slot:",t.id,e)},uploadControlNetImage(t){this.cn.active=t.id;const e=this.$refs.cnImageInput;e&&e.click()},onControlNetFileSelected(t){const e=t.target.files&&t.target.files[0];if(!e)return;const n=new FormData;n.append("image",e),n.append("slot",this.cn.active),fetch("/api/controlnet/upload-image",{method:"POST",body:n}).then(i=>i.json()).then(i=>{i.error&&console.error("ControlNet upload:",i.error)}).catch(i=>console.error("ControlNet upload failed",i)),t.target.value=""},async toggleWebcam(){this.cn.webcamActive?this.stopWebcam():await this.startWebcam()},async startWebcam(){try{const t=await navigator.mediaDevices.getUserMedia({video:{width:512,height:512,facingMode:"user"}});this.cn.webcamStream=t,this.cn.webcamActive=!0;const e=this.$refs.webcamVideo;e&&(e.srcObject=t,e.style.display="block",this.cn.webcamVideo=e);const n=this.$refs.webcamCanvas;n&&(this.cn.webcamCanvas=n,n.width=512,n.height=512),this.cn.webcamCaptureInterval=setInterval(()=>this.captureWebcamFrame(),this.webcamCaptureRate)}catch(t){console.error("Failed to start webcam:",t),alert("Could not access webcam. Check browser permissions.")}},stopWebcam(){this.cn.webcamCaptureInterval&&(clearInterval(this.cn.webcamCaptureInterval),this.cn.webcamCaptureInterval=null),this.cn.webcamStream&&(this.cn.webcamStream.getTracks().forEach(e=>e.stop()),this.cn.webcamStream=null);const t=this.$refs.webcamVideo;t&&(t.style.display="none",t.srcObject=null),this.cn.webcamActive=!1},captureWebcamFrame(){const t=this.cn.webcamVideo,e=this.cn.webcamCanvas;if(!t||!e||t.readyState<2)return;e.getContext("2d").drawImage(t,0,0,512,512),e.toBlob(async i=>{if(!i)return;const s=this.cn.slots.find(a=>a.id===this.cn.active);if(!s||s.imageSource!=="webcam")return;const r=new FormData;r.append("image",i,"webcam_frame.png"),r.append("slot",this.cn.active);try{await fetch("/api/controlnet/upload-image",{method:"POST",body:r})}catch(a){console.error("Webcam frame upload failed:",a)}},"image/png")},async startScreenCapture(){try{const t=await navigator.mediaDevices.getDisplayMedia({video:{width:512,height:512}}),e=document.createElement("video");e.srcObject=t,e.autoplay=!0,e.playsInline=!0;const n=document.createElement("canvas");n.width=512,n.height=512;const i=setInterval(()=>{e.readyState<2||(n.getContext("2d").drawImage(e,0,0,512,512),n.toBlob(async s=>{if(!s)return;const r=this.cn.slots.find(l=>l.id===this.cn.active);if(!r||r.imageSource!=="screen")return;const a=new FormData;a.append("image",s,"screen_capture.png"),a.append("slot",this.cn.active);try{await fetch("/api/controlnet/upload-image",{method:"POST",body:a})}catch(l){console.error("Screen capture upload failed:",l)}},"image/png"))},this.webcamCaptureRate);t.getVideoTracks()[0].onended=()=>clearInterval(i)}catch(t){console.error("Failed to start screen capture:",t),alert("Could not start screen capture. Check browser permissions.")}},handleMidi(t,e){const[n,i,s]=e.data;if(!((n&240)===176))return;const a=this.midi.mappings.find(u=>u.cc===i),l=s/127;if(a&&a.key){const u=this.midiTarget(a.key);if(u){const d=u.min+l*(u.max-u.min);this.sendControl("liveParam",{[u.key]:d})}else this.sendControl("liveParam",{[a.key]:l})}},sortedKeyframes(t){return[...t.keyframes||[]].sort((e,n)=>e.t-n.t)},setKeyframeEasing(t,e){t&&(t.easing=e==="linear"?void 0:e)},sequencerEaseT(t,e){const n=Math.min(1,Math.max(0,t)),i=e||"linear";return i==="easeIn"?n*n*n:i==="easeOut"?1-(1-n)**3:i==="easeInOut"?n<.5?4*n*n*n:1-(-2*n+2)**3/2:n},sequencerPayload(){const t=Array.isArray(this.sequencer.markers)?[...this.sequencer.markers].map(e=>({t:Number(e.t),name:String(e.name||"").trim(),action:e.action||"jump",target:e.target||""})).filter(e=>e.name&&Number.isFinite(e.t)).sort((e,n)=>e.t-n.t):[];return{version:1,durationSec:Number(this.sequencer.durationSec),fps:Number(this.sequencer.fps),loop:!!this.sequencer.loop,markers:t,tracks:this.sequencer.tracks.map(e=>({id:e.id,param:e.param,keyframes:[...e.keyframes].sort((n,i)=>n.t-i.t)}))}},clampSequencerMarkers(){const t=Number(this.sequencer.durationSec)||0,e=this.sequencer.markers;if(Array.isArray(e))for(const n of e)!n||typeof n.t!="number"||(n.t<0&&(n.t=0),n.t>t&&(n.t=t))},clampSequencerPlayhead(){const t=Number(this.sequencer.durationSec)||0;this.sequencerPlayhead<0&&(this.sequencerPlayhead=0),this.sequencerPlayhead>t&&(this.sequencerPlayhead=t),this.clampSequencerMarkers()},addSequencerMarker(){this.clampSequencerPlayhead();const t=Number(this.sequencer.durationSec)||0;let e=(this.sequencerMarkerName||"").trim()||"Scene";if(e.length>48&&(e=e.slice(0,48)),!/^[a-zA-Z0-9_ \-.]+$/.test(e)){this.sequencerStatus="Marker label: letters, digits, space, underscore, hyphen, dot only";return}if(Array.isArray(this.sequencer.markers)||(this.sequencer.markers=[]),this.sequencer.markers.length>=64){this.sequencerStatus="Maximum 64 markers";return}const n=Math.min(Math.max(0,this.sequencerPlayhead),t);this.sequencer.markers.push({t:n,name:e,action:"jump",target:""}),this.sequencerStatus=""},removeSequencerMarker(t){const n=this.sortedSequencerMarkers[t];if(!n||!Array.isArray(this.sequencer.markers))return;const i=this.sequencer.markers.indexOf(n);i>=0&&this.sequencer.markers.splice(i,1)},jumpToSequencerMarker(t){if(!t||typeof t.t!="number")return;const e=Number(this.sequencer.durationSec)||0;this.sequencerPlayhead=Math.min(Math.max(0,t.t),e),this.previewSequencerFrame()},setMarkerAction(t,e){t&&(t.action=e,(e==="jump"||e==="generate"||e==="pause")&&(t.target=""))},setMarkerTarget(t,e){t&&(t.target=e)},markerActionPlaceholder(t){switch(t){case"preset":return"Preset name";case"morph":return"Slot #";case"param":return'{"param": value}';default:return""}},markerActionTitle(t){switch(t){case"preset":return"Name of a motion preset (e.g. Orbit, Zoom)";case"morph":return"Morph slot number to toggle (1, 2, 3...)";case"param":return'JSON object of params to apply (e.g. {"zoom": 1.5})';default:return""}},interpolateTrack(t,e){const n=Number(this.sequencer.durationSec)||0,i=Math.min(Math.max(0,e),n),s=this.sortedKeyframes(t);if(!s.length)return null;if(i<=s[0].t)return s[0].v;if(i>=s[s.length-1].t)return s[s.length-1].v;let r=0;for(;r<s.length-1&&s[r+1].t<i;)r+=1;const a=s[r],l=s[r+1];if(!l)return a.v;const u=l.t-a.t;if(u<=0)return a.v;const d=(i-a.t)/u;if(a.hIn!==void 0||a.hOut!==void 0||l.hIn!==void 0||l.hOut!==void 0){a.hOut!=null&&a.hOut,l.hIn!=null&&l.hIn;const p=a.hOutV!=null?a.hOutV:a.v+(l.v-a.v)*.33,o=l.hInV!=null?l.hInV:a.v+(l.v-a.v)*.67;return this.cubicBezier(d,a.v,p,o,l.v)}const f=a.easing||"linear",m=this.sequencerEaseT(d,f);return a.v+m*(l.v-a.v)},cubicBezier(t,e,n,i,s){const r=1-t;return r*r*r*e+3*r*r*t*n+3*r*t*t*i+t*t*t*s},applySequencerAt(t){const e={},n={};for(const i of this.sequencer.tracks){const s=this.interpolateTrack(i,t);if(!(s===null||!Number.isFinite(s)))if(i.param.startsWith("cn_")){const r=i.param.split("_"),a=r[1],l=r[2],u=this.cn.slots.find(d=>d.id===a);u&&(l==="weight"?u.weight=Math.min(2,Math.max(0,s)):l==="start"?u.start=Math.min(1,Math.max(0,s)):l==="end"&&(u.end=Math.min(1,Math.max(0,s))),n[a]||(n[a]=u))}else e[i.param]=s}Object.keys(e).length&&this.sendControl("liveParam",e),Object.values(n).forEach(i=>this.updateControlNet(i))},previewSequencerFrame(){this.clampSequencerPlayhead(),!(!this.ws||this.ws.readyState!==1)&&this.applySequencerAt(this.sequencerPlayhead)},tickSequencer(){const t=Number(this.sequencer.durationSec)||0,e=1/Math.max(1,Number(this.sequencer.fps)||24);let n=this.sequencerPlayhead+e;const i=this.sequencerPlayhead;if(n>=t-1e-9)if(this.sequencer.loop)n=0;else{this.sequencerPlayhead=t,this.applySequencerAt(this.sequencerPlayhead),this.stopSequencerPlayback();return}this.sequencerPlayhead=n,this.applySequencerAt(this.sequencerPlayhead);const s=this.sequencer.markers||[];for(const r of s)r.t>i&&r.t<=n&&this.triggerMarkerAction(r)},triggerMarkerAction(t){if(!(!t||!t.action))switch(t.action){case"jump":this.sequencerPlayhead=t.t,this.previewSequencerFrame();break;case"preset":t.target&&this.motionPresets[t.target]&&(this.sendPreset(t.target),this.sequencerStatus=`Marker: applied preset "${t.target}"`);break;case"generate":this.generateStory(),this.sequencerStatus="Marker: triggered generation";break;case"morph":if(t.target){const e=parseInt(t.target)-1;e>=0&&e<this.morphSlots.length&&(this.morphSlots[e].on=!this.morphSlots[e].on,this.applyPromptMorphing(),this.sequencerStatus=`Marker: toggled morph slot ${t.target}`)}break;case"param":try{const e=JSON.parse(t.target||"{}");this.sendControl("liveParam",e),this.sequencerStatus="Marker: applied params"}catch{this.sequencerStatus="Marker: invalid param JSON"}break;case"pause":this.stopSequencerPlayback(),this.sequencerStatus=`Marker: paused at "${t.name}"`;break}},toggleSequencerPlayback(){if(this.sequencerPlaying){this.stopSequencerPlayback();return}if(!this.ws||this.ws.readyState!==1){this.sequencerStatus="WebSocket not connected";return}if(!this.sequencer.tracks.length){this.sequencerStatus="Add at least one track with keyframes";return}if(!this.sequencer.tracks.some(n=>n.keyframes&&n.keyframes.length)){this.sequencerStatus="Add keyframes to play";return}this.sequencerPlaying=!0,this.sequencerStatus="";const e=Math.max(16,Math.round(1e3/Math.max(1,Number(this.sequencer.fps)||24)));this.sequencerTimer=setInterval(()=>this.tickSequencer(),e)},stopSequencerPlayback(){this.sequencerPlaying=!1,this.sequencerTimer&&(clearInterval(this.sequencerTimer),this.sequencerTimer=null)},addSequencerTrack(){const t=this.sequencerNewParam;if(this.sequencer.tracks.some(n=>n.param===t)){this.sequencerStatus="Track already exists for "+t;return}const e="tr-"+Date.now()+"-"+Math.random().toString(36).slice(2,7);this.sequencer.tracks.push({id:e,param:t,keyframes:[]}),this.sequencerSelectedTrackId=e,this.sequencerStatus=""},removeSequencerTrack(t){this.sequencer.tracks=this.sequencer.tracks.filter(e=>e.id!==t),this.sequencerSelectedTrackId===t&&(this.sequencerSelectedTrackId=null)},addSequencerKeyframe(){const t=this.sequencerSelectedTrackId||this.sequencer.tracks[0]&&this.sequencer.tracks[0].id,e=this.sequencer.tracks.find(s=>s.id===t);if(!e){this.sequencerStatus="Add a track first";return}this.clampSequencerPlayhead();const n=Math.min(Math.max(0,this.sequencerPlayhead),Number(this.sequencer.durationSec)||0),i=Number(this.sequencerKeyframeVal);if(Number.isNaN(i)){this.sequencerStatus="Invalid keyframe value";return}e.keyframes.push({t:n,v:i}),this.sequencerStatus=""},removeSequencerKeyframe(t,e){const n=this.sequencer.tracks.find(a=>a.id===t);if(!n)return;const s=this.sortedKeyframes(n)[e];if(!s)return;const r=n.keyframes.indexOf(s);r>=0&&n.keyframes.splice(r,1)},async refreshSequencerList(){if(typeof fetch=="function")try{const e=await(await fetch("/api/sequencer")).json();Array.isArray(e.timelines)&&(this.sequencerList=e.timelines)}catch{}},async saveSequencerTimeline(){const e=(this.sequencerSaveName||"timeline").trim().replace(/[^a-zA-Z0-9_-]/g,"");if(!e){this.sequencerStatus="Invalid save name";return}try{const n=await fetch("/api/sequencer/"+encodeURIComponent(e),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(this.sequencerPayload())}),i=await n.json();if(!n.ok)throw new Error(i.error||n.statusText);this.sequencerStatus="Saved "+e,await this.refreshSequencerList()}catch(n){this.sequencerStatus=String(n.message||n)}},async loadSequencerTimeline(){const t=this.sequencerLoadPick;if(t)try{const e=await fetch("/api/sequencer/"+encodeURIComponent(t)),n=await e.json();if(!e.ok||!n.timeline)throw new Error(n.error||"load failed");const i=n.timeline;i.durationSec!=null&&(this.sequencer.durationSec=i.durationSec),i.fps!=null&&(this.sequencer.fps=i.fps),this.sequencer.loop=i.loop!==!1,this.sequencer.markers=Array.isArray(i.markers)?i.markers.map(s=>({t:Number(s.t),name:String(s.name||"").trim(),action:s.action||"jump",target:s.target||""})).filter(s=>s.name&&Number.isFinite(s.t)):[],this.sequencer.tracks=Array.isArray(i.tracks)?i.tracks.map(s=>({id:s.id||"tr-"+Math.random().toString(36).slice(2),param:s.param,keyframes:Array.isArray(s.keyframes)?s.keyframes.slice():[]})):[],this.sequencerSaveName=t,this.sequencerSelectedTrackId=this.sequencer.tracks[0]?this.sequencer.tracks[0].id:null,this.clampSequencerPlayhead(),this.sequencerStatus="Loaded "+t}catch(e){this.sequencerStatus=String(e.message||e)}},exportSequencerDownload(){const t=JSON.stringify(this.sequencerPayload(),null,2),e=new Blob([t],{type:"application/json"}),n=(this.sequencerSaveName||"sequencer").replace(/[^a-zA-Z0-9_-]/g,"")||"sequencer",i=document.createElement("a");i.href=URL.createObjectURL(e),i.download=n+".json",i.click(),URL.revokeObjectURL(i.href)},getTrackValueAt(t,e){const n=this.sortedKeyframes(t);if(!n.length)return 0;if(e<=n[0].t)return n[0].v;if(e>=n[n.length-1].t)return n[n.length-1].v;for(let i=0;i<n.length-1;i++)if(e>=n[i].t&&e<=n[i+1].t){const s=n[i+1].t-n[i].t,r=s>0?(e-n[i].t)/s:0,a=n[i],l=n[i+1];if(a.hIn!==void 0||a.hOut!==void 0||l.hIn!==void 0||l.hOut!==void 0){a.hOut!=null&&a.hOut,l.hIn!=null&&l.hIn;const d=a.hOutV!=null?a.hOutV:a.v+(l.v-a.v)*.33,f=l.hInV!=null?l.hInV:a.v+(l.v-a.v)*.67;return this.cubicBezier(r,a.v,d,f,l.v)}const u=this.sequencerEaseT(r,a.easing);return a.v+(l.v-a.v)*u}return n[n.length-1].v},drawTimeline(){const t=this.$refs.timelineCanvas;if(!t||!this.sequencer.tracks.length)return;const e=t.getContext("2d"),n=window.devicePixelRatio||1,i=t.getBoundingClientRect();t.width=i.width*n,t.height=Math.max(120,this.sequencer.tracks.length*40+20)*n,e.scale(n,n);const s=i.width,r=i.height,a=Math.max(.01,Number(this.sequencer.durationSec)||8),l=(r-20)/Math.max(1,this.sequencer.tracks.length),u=["#2de2ff","#ff53d9","#5af2a9","#ff8a1a","#a78bfa","#f472b6","#34d399","#fbbf24"];e.clearRect(0,0,s,r),e.fillStyle="#031b2d",e.fillRect(0,0,s,r),this.sequencer.tracks.forEach((m,p)=>{const o=20+p*l,h=this.sortedKeyframes(m);if(!h.length){e.strokeStyle="#1a3a52",e.lineWidth=1,e.setLineDash([4,4]),e.beginPath(),e.moveTo(0,o+l/2),e.lineTo(s,o+l/2),e.stroke(),e.setLineDash([]),e.fillStyle="#3a5a78",e.font="10px monospace",e.fillText(m.param+" (no keyframes)",6,o+l/2+3);return}let y=Math.min(...h.map(b=>b.v)),_=Math.max(...h.map(b=>b.v));const g=_-y||1;y-=g*.15,_+=g*.15;const S=u[p%u.length];e.strokeStyle="#0c3048",e.lineWidth=1,e.strokeRect(0,o,s,l),e.fillStyle=S+"20",e.fillRect(0,o,s,l),e.strokeStyle=S,e.lineWidth=2,e.beginPath();const E=Math.max(s,100);for(let b=0;b<=E;b++){const L=b/E*a,w=this.getTrackValueAt(m,L),D=L/a*s,x=o+l-(w-y)/(_-y)*l;b===0?e.moveTo(D,x):e.lineTo(D,x)}e.stroke(),h.forEach((b,L)=>{const w=b.t/a*s,D=b.v,x=o+l-(D-y)/(_-y)*l;if(L<h.length-1){const R=h[L+1],O=b.hOut!=null?b.hOut:.33,U=R.hIn!=null?R.hIn:.67,W=b.hOutV!=null?b.hOutV:D+(R.v-D)*.33,ee=R.hInV!=null?R.hInV:D+(R.v-D)*.67;if(b.hIn!==void 0||b.hOut!==void 0||R.hIn!==void 0||R.hOut!==void 0){const V=(b.t+O*(R.t-b.t))/a*s,q=o+l-(W-y)/(_-y)*l,z=(R.t-(1-U)*(R.t-b.t))/a*s,te=o+l-(ee-y)/(_-y)*l;e.strokeStyle=S+"60",e.lineWidth=1,e.setLineDash([2,2]),e.beginPath(),e.moveTo(w,x),e.lineTo(V,q),e.stroke(),e.beginPath(),e.moveTo(R.t/a*s,o+l-(R.v-y)/(_-y)*l),e.lineTo(z,te),e.stroke(),e.setLineDash([]),e.fillStyle="#fff",e.beginPath(),e.arc(V,q,3,0,Math.PI*2),e.fill(),e.beginPath(),e.arc(z,te,3,0,Math.PI*2),e.fill()}}e.fillStyle=S,e.beginPath(),e.arc(w,x,4,0,Math.PI*2),e.fill(),e.fillStyle="#fff",e.beginPath(),e.arc(w,x,2,0,Math.PI*2),e.fill()}),e.fillStyle="#5a8fb8",e.font="9px monospace",e.fillText(m.param,4,o+11)}),(this.sequencer.markers||[]).forEach(m=>{const p=m.t/a*s;e.strokeStyle="#ff4d6d80",e.lineWidth=1,e.setLineDash([2,3]),e.beginPath(),e.moveTo(p,20),e.lineTo(p,r),e.stroke(),e.setLineDash([]),e.fillStyle="#ff4d6d",e.font="8px monospace",e.fillText(m.name,p+3,14)});const f=this.sequencerPlayhead/a*s;e.strokeStyle="#fff",e.lineWidth=2,e.beginPath(),e.moveTo(f,20),e.lineTo(f,r),e.stroke(),e.fillStyle="#fff",e.beginPath(),e.moveTo(f-5,20),e.lineTo(f+5,20),e.lineTo(f,26),e.closePath(),e.fill();for(let m=0;m<=4;m++){const p=a/4*m,o=p/a*s;e.fillStyle="#3a5a78",e.font="8px monospace",e.fillText(p.toFixed(1)+"s",o+2,r-2)}},seekTimeline(t){const e=this.$refs.timelineCanvas;if(!e)return;const n=e.getBoundingClientRect(),i=t.clientX-n.left,s=Math.max(.01,Number(this.sequencer.durationSec)||8);this.sequencerPlayhead=Math.max(0,Math.min(s,i/n.width*s)),this.drawTimeline()},hoverTimeline(t){const e=this.$refs.timelineCanvas;if(!e)return;const n=e.getBoundingClientRect(),i=t.clientX-n.left,s=Math.max(.01,Number(this.sequencer.durationSec)||8);this.timelineHoverTime=Math.max(0,Math.min(s,i/n.width*s)),this.timelineHoverPercent=i/n.width*100},xyPadMouseDown(t){this.xyPad.dragging=!0,this.updateXyPad(t),t.preventDefault()},xyPadMouseMove(t){this.xyPad.dragging&&(this.updateXyPad(t),t.preventDefault())},xyPadMouseUp(){this.xyPad.dragging=!1},updateXyPad(t){const n=t.currentTarget.getBoundingClientRect();let i,s;t.touches&&t.touches.length>0?(i=t.touches[0].clientX,s=t.touches[0].clientY):(i=t.clientX,s=t.clientY);const r=Math.max(0,Math.min(this.xyPad.padSize,i-n.left)),a=Math.max(0,Math.min(this.xyPad.padSize,s-n.top));this.xyPad.x=r,this.xyPad.y=a;const l=r/this.xyPad.padSize*2-1,u=1-a/this.xyPad.padSize*2,d=10,f=l*d,m=u*d;this.queueLiveParam("translation_x",f),this.queueLiveParam("translation_y",m),this.deforumPlaying||this.schedulePreviewFrame()},async refreshLoras(){try{const{data:t}=await Wt("/api/loras",{},"loras list");if(t.loras){this.loras.available=t.loras.map(n=>({id:n.id||n.name,name:n.name,path:n.path||"",thumbnail:n.thumbnail||null,strength:n.strength||1,selected:!1,group:null})),this.loras.source=t.source||"unknown";const e=new Map(this.loras.available.map(n=>[n.id,n]));this.loras.groupA.forEach(n=>{const i=e.get(n.id);i&&(i.selected=!0,i.group="A",i.strength=n.strength)}),this.loras.groupB.forEach(n=>{const i=e.get(n.id);i&&(i.selected=!0,i.group="B",i.strength=n.strength)})}}catch(t){console.error("Failed to load LoRAs",t)}},toggleLoraSelection(t){t.selected?this.removeLoraSelection(t):(t.selected=!0,t.group="A",this.assignLoraToGroup(t,"A"))},assignLoraToGroup(t,e){if(e!=="A"&&e!=="B")return;this.loras.groupA=this.loras.groupA.filter(i=>i.id!==t.id),this.loras.groupB=this.loras.groupB.filter(i=>i.id!==t.id),t.group=e,t.selected=!0;const n={id:t.id,name:t.name,path:t.path,strength:t.strength,thumbnail:t.thumbnail};e==="A"?this.loras.groupA.push(n):this.loras.groupB.push(n)},removeLoraSelection(t){t.selected=!1,t.group=null,this.loras.groupA=this.loras.groupA.filter(e=>e.id!==t.id),this.loras.groupB=this.loras.groupB.filter(e=>e.id!==t.id)},updateLoraStrength(t){const e=this.loras.groupA.find(i=>i.id===t.id);e&&(e.strength=t.strength);const n=this.loras.groupB.find(i=>i.id===t.id);n&&(n.strength=t.strength)},updateCrossfader(){this.sendControl("crossfader",{value:this.prompts.crossfaderValue,groupA:this.loras.groupA.map(t=>({...t,effectiveStrength:t.strength*(1-this.prompts.crossfaderValue)})),groupB:this.loras.groupB.map(t=>({...t,effectiveStrength:t.strength*this.prompts.crossfaderValue}))})},applyLoras(){const t={groupA:this.loras.groupA.map(e=>({name:e.name,path:e.path,strength:e.strength*(1-this.prompts.crossfaderValue)})),groupB:this.loras.groupB.map(e=>({name:e.name,path:e.path,strength:e.strength*this.prompts.crossfaderValue})),crossfaderValue:this.prompts.crossfaderValue};this.sendControl("loras",t),console.log("Applied LoRAs with crossfader",t)},clearAllLoras(){this.loras.available.forEach(t=>{t.selected=!1,t.group=null}),this.loras.groupA=[],this.loras.groupB=[],this.sendControl("loras",{groupA:[],groupB:[],crossfaderValue:this.prompts.crossfaderValue})},_genRnd(t){return t[Math.floor(Math.random()*t.length)]},_buildScene(t,e,n,i){const s=g=>this._genRnd(g),r=this.genData,a=n===0?"opening":n>=i-1?"closing":n<Math.ceil(i/2)?"buildup":"climax",l=s(r.sceneDescriptors[a]),u=r.environments[n%r.environments.length],d=s(u),f=s(r.lighting),m=s(r.quality),p=s(r.techSpecs),o=r.artists[e]||r.artists.default,h=s(o);let y=s(o);for(let g=0;g<5&&y===h&&o.length>1;g++)y=s(o);const _=s(r.negatives);return`A ${l} scene from ${t} — ${d}, ${f}. ${m}, ${p}, inspired by ${h} and ${y} --neg ${_}`},_buildMotion(t,e,n){const i=this.genData,s=Math.random.bind(Math),r=i.cameraBehaviors,a=[];let l=null;for(let S=0;S<t;S++){let E,b=0;do E=r[Math.floor(s()*r.length)],b++;while(E===l&&r.length>1&&b<10);a.push(E),l=E}const u=[],d=[],f=[],m=[],p=[];let o=null,h=null,y=null,_=null;for(let S=0;S<t;S++){const E=S*e,b=a[S],L=b.zoom==="BREATHE"?`1.0025+0.002*sin(1.25*3.14*t/${e})`:b.zoom;u.push(`${E}:(${L})`),b.tx!==o&&(d.push(`${E}:(${b.tx})`),o=b.tx),b.ty!==h&&(f.push(`${E}:(${b.ty})`),h=b.ty);const w=Math.round((.3+s()*.4)*10)/10,D=Math.round((.3+s()*.4)*10)/10;w!==y&&(m.push(`${E}:(${w})`),y=w),D!==_&&(p.push(`${E}:(${D})`),_=D)}u.push(`${n}:(1.0)`),o!==0&&d.push(`${n}:(0)`),h!==0&&f.push(`${n}:(0)`);const g={Zoom:u.join(", ")};return d.length&&(g["Translation X"]=d.join(", ")),f.length&&(g["Translation Y"]=f.join(", ")),m.length>1&&(g["Transform Center X"]=m.join(", ")),p.length>1&&(g["Transform Center Y"]=p.join(", ")),g},generateStory(){const t=this.generator,e=this.genData;t.isGenerating=!0,t.status="Generating…",t.result=null,setTimeout(()=>{try{const n=t.theme.trim()||this._genRnd(e.defaultThemes),i=t.stylePreset==="custom"?t.customStyle.trim()||"Masterpiece, Realistic":t.stylePreset,s=t.fps,[r,a]=t.resolution.split("x").map(Number),l=t.totalFrames,u=t.numScenes,d=Math.floor(l/u),f={};for(let o=0;o<u;o++)f[String(o*d)]=this._buildScene(n,i,o,u);const m=this._buildMotion(u,d,l),p=[`Theme: ${n}`,`Style: ${i}`,`Resolution: ${r}x${a}`,`FPS: ${s}`,`Total frames: ${l}`,"",JSON.stringify(f,null,2),"","Motion Settings:"];for(const[o,h]of Object.entries(m))p.push(`${o}: ${h}`);t.result={theme:n,style:i,width:r,height:a,fps:s,totalFrames:l,scenes:f,motion:m,formatted:p.join(`
`)},t.status="Story ready — review and approve below!"}catch(n){t.status=`Error: ${n.message}`}finally{t.isGenerating=!1,setTimeout(()=>{t.status=""},4e3)}},30)},approveStory(){if(!this.generator.result)return;const{scenes:t,motion:e}=this.generator.result;this.prompts.pos=JSON.stringify(t,null,2),this.sendPrompts(),this.sendControl("motionSettings",e),this.generator.result=null,this.generator.status="Applied!",this.currentTab="PROMPTS",setTimeout(()=>{this.generator.status=""},3e3)},rejectStory(){this.generator.result=null,this.generator.status="Discarded.",setTimeout(()=>{this.generator.status=""},2e3)},async refreshGeneratorPresets(){try{const e=await(await fetch("/api/presets")).json();this.generatorPresets=(e.presets||[]).filter(n=>n.startsWith("gen-"))}catch(t){console.error("Failed to load generator presets",t)}},async loadGeneratorPreset(t){try{const n=await(await fetch(`/api/presets/${t}`)).json();n.preset&&n.preset.generator&&(Object.assign(this.generator,n.preset.generator),this.generator.result=null,this.currentGeneratorPreset=t,this.generatorPresetStatus=`Loaded: ${t}`,setTimeout(()=>{this.generatorPresetStatus=""},3e3))}catch(e){this.generatorPresetStatus=`Error: ${e.message}`}},async saveGeneratorPreset(){const e=`gen-${(this.newGeneratorPresetName||"default").replace(/[^a-zA-Z0-9_-]/g,"-")}`,n={generator:{theme:this.generator.theme,stylePreset:this.generator.stylePreset,customStyle:this.generator.customStyle,fps:this.generator.fps,resolution:this.generator.resolution,totalFrames:this.generator.totalFrames,numScenes:this.generator.numScenes}};try{(await(await fetch(`/api/presets/${e}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(n)})).json()).ok&&(this.currentGeneratorPreset=e,this.newGeneratorPresetName="",this.generatorPresetStatus=`Saved: ${e}`,await this.refreshGeneratorPresets(),setTimeout(()=>{this.generatorPresetStatus=""},3e3))}catch(i){this.generatorPresetStatus=`Error: ${i.message}`}},async deleteGeneratorPreset(t){if(confirm(`Delete preset "${t}"?`))try{await fetch(`/api/presets/${t}`,{method:"DELETE"}),this.currentGeneratorPreset=null,this.generatorPresetStatus=`Deleted: ${t}`,await this.refreshGeneratorPresets(),setTimeout(()=>{this.generatorPresetStatus=""},3e3)}catch(e){this.generatorPresetStatus=`Error: ${e.message}`}},sessionStorageKey(){return`defora_session_${this.session||"default"}`},loadSessionState(){try{const t=window.localStorage&&window.localStorage.getItem(this.sessionStorageKey());if(!t)return;const e=JSON.parse(t);typeof e.crossfader=="number"&&(this.performance.crossfader=e.crossfader),typeof e.genericPrompt=="string"&&(this.performance.genericPrompt=e.genericPrompt),Array.isArray(e.slots)&&(this.performance.slots=e.slots),typeof e.paramPanelOpen=="boolean"&&(this.paramPanelOpen=e.paramPanelOpen),typeof e.deforumPanelOpen=="boolean"&&(this.deforumPanelOpen=e.deforumPanelOpen),e.deforumSettings&&typeof e.deforumSettings=="object"&&(this.deforumSettings=vu({...io},e.deforumSettings),this.syncDeforumSettingsJson()),e.lastModel&&(this.forge.lastModel=e.lastModel,this.forge.selectedModel=e.lastModel),e.prompts&&Object.assign(this.prompts,e.prompts)}catch{}},saveSessionState(){try{if(!window.localStorage)return;const t={crossfader:this.performance.crossfader,genericPrompt:this.performance.genericPrompt,slots:this.performance.slots,paramPanelOpen:this.paramPanelOpen,deforumPanelOpen:this.deforumPanelOpen,deforumSettings:this.deforumSettings,lastModel:this.forge.lastModel||this.forge.currentModel||this.forge.selectedModel,prompts:{pos:this.prompts.pos,neg:this.prompts.neg}};window.localStorage.setItem(this.sessionStorageKey(),JSON.stringify(t))}catch{}},restoreLastModel(){const t=this.forge.lastModel||this.forge.selectedModel;!t||this.forge.switching||this.forge.currentModel&&this.forge.currentModel===t||(this.forge.selectedModel=t,this.switchForgeModel())},async onModelSelectChange(){await this.switchForgeModel(),this.saveSessionState()},slotTypeLabel(t){const e=this.crossfadeSlotTypes.find(n=>n.id===t);return e?e.label:t},newSlotId(){return`slot_${Date.now()}_${Math.random().toString(36).slice(2,7)}`},addCrossfadeSlot(){const t=this.performance.newSlotType||"prompt",e={id:this.newSlotId(),type:t,valueA:t==="param"?0:t==="prompt"?"":null,valueB:t==="param"?0:t==="prompt"?"":null,paramKey:"cfg",loraStrengthA:1,loraStrengthB:1,cnSlotId:this.cn.active||"CN1"};this.performance.slots.push(e),this.applyCrossfadeMorph(),this.saveSessionState()},removeCrossfadeSlot(t){this.performance.slots=this.performance.slots.filter(e=>e.id!==t),this.applyCrossfadeMorph(),this.saveSessionState()},slotMorphedPreview(t){return js(this.normalizeSlotForMorph(t),this.performance.crossfader)},formatMorphedPreview(t){const e=this.slotMorphedPreview(t);if(e==null)return"—";if(typeof e=="object")return JSON.stringify(e);if(typeof e=="number")return Number(e).toFixed(3);const n=String(e);return n.length>48?n.slice(0,48)+"…":n},normalizeSlotForMorph(t){if(t.type==="lora"){const e=(n,i)=>n?{name:n,strength:Number(i)||1}:null;return{...t,valueA:e(t.valueA,t.loraStrengthA),valueB:e(t.valueB,t.loraStrengthB)}}if(t.type==="controlnet"){const e=n=>({slotId:t.cnSlotId,weight:Number(n),start:0,end:.9,enabled:!0});return{...t,valueA:t.valueA!=null&&t.valueA!==""?e(t.valueA):null,valueB:t.valueB!=null&&t.valueB!==""?e(t.valueB):null}}return t.type==="param"?{...t,valueA:t.valueA,valueB:t.valueB}:t},buildMorphedPrompt(){const t=[],e=(this.performance.genericPrompt||"").trim();e&&t.push(e);for(const i of this.performance.slots){if(i.type!=="prompt")continue;const s=js(this.normalizeSlotForMorph(i),this.performance.crossfader);s&&t.push(String(s))}const n=t.join(", ").trim();return n||(this.prompts.pos||"").trim()},applyCrossfadeMorph(){const t=this.performance.crossfader,e={},n=[],i=[];for(const a of this.performance.slots){const l=this.normalizeSlotForMorph(a),u=js(l,t);if(u!=null&&a.type!=="prompt"){if(a.type==="param"&&a.paramKey){e[a.paramKey]=u;const d=this.liveVibe.find(f=>f.key===a.paramKey)||this.liveCam.find(f=>f.key===a.paramKey);d&&(d.val=u)}else if(a.type==="lora"&&u&&u.name){const d={name:u.name,path:u.name,strength:u.strength??1};Vs(t)<.5?n.push(d):i.push(d)}else if(a.type==="controlnet"&&u){const d=this.cn.slots.find(f=>f.id===u.slotId);d&&(d.weight=u.weight,d.start=u.start,d.end=u.end,d.enabled=u.enabled,this.updateControlNet(d))}}}const s=this.buildMorphedPrompt(),r=(this.prompts.neg||"").trim();this.prompts.pos=s,this.sendControl("prompt",{positive:s,negative:r}),Object.keys(e).length&&this.sendControl("liveParam",e),(n.length||i.length)&&this.sendControl("loras",{groupA:n,groupB:i,crossfaderValue:t}),this.prompts.crossfaderValue=t},onCrossfaderInput(){this.applyCrossfadeMorph(),this.saveSessionState(),this.deforumPlaying||this.schedulePreviewFrame()},onPerformanceInput(){this.applyCrossfadeMorph(),this.saveSessionState(),this.deforumPlaying||this.schedulePreviewFrame()},schedulePreviewFrame(){this.deforumPlaying||(clearTimeout(this.previewDebounceTimer),this.previewDebounceTimer=setTimeout(()=>this.generatePreviewFrame(),900))},scheduleDeforumPreview(){this.deforumPlaying||(clearTimeout(this.deforumPreviewTimer),this.deforumPreviewTimer=setTimeout(()=>this.generateDeforumPreviewFrame(),1200))},getDeforumField(t){return _u(this.deforumSettings,t)},onDeforumSectionToggle(t,e){this.deforumSectionOpen[t]=e.target.open},onDeforumFieldInput(t,e,n){let i=e;if(n==="number"){const s=parseFloat(e);i=Number.isFinite(s)?s:0}else n==="bool"?i=!!e:t==="init_image"&&e===""&&(i=null);if(tg(this.deforumSettings,t,i),t==="prompts.0"){const s=String(i||""),r=s.split(/\s+--neg\s+/i);r.length>1?(this.prompts.pos=r[0].trim(),this.prompts.neg=r.slice(1).join(" --neg ").trim()):this.prompts.pos=s.trim()}t==="negative_prompts"&&(this.prompts.neg=String(i||"")),t==="seed"&&Number.isFinite(i)&&(this.hud.seed=i),this.syncDeforumSettingsJson(),this.pushDeforumLivePatch(t,i),this.queueDeforumSettingsSave(),this.deforumPlaying||this.scheduleDeforumPreview()},pushDeforumLivePatch(t,e){const n=ng(t,e);this.sendControl("liveParam",n)},syncDeforumSettingsJson(){try{this.deforumSettingsJson=JSON.stringify(this.deforumSettings,null,2),this.deforumSettingsJsonError=""}catch(t){this.deforumSettingsJsonError=String(t.message||t)}},applyDeforumSettingsJson(){try{const t=JSON.parse(this.deforumSettingsJson);if(!t||typeof t!="object")throw new Error("JSON must be an object");this.deforumSettings=t,this.deforumSettingsJsonError="",this.queueDeforumSettingsSave(),this.deforumPlaying||this.scheduleDeforumPreview()}catch(t){this.deforumSettingsJsonError=String(t.message||t)}},async loadDeforumSettings(){try{const e=await(await fetch("/api/deforum/settings")).json();e.settings&&typeof e.settings=="object"&&(this.deforumSettings=vu({...io},e.settings)),this.syncDeforumSettingsJson(),this.deforumSettingsStatus="Loaded"}catch(t){this.deforumSettingsStatus="Load failed",console.error("loadDeforumSettings",t)}},queueDeforumSettingsSave(){clearTimeout(this.deforumSaveTimer),this.deforumSaveTimer=setTimeout(()=>this.saveDeforumSettings(),800)},async saveDeforumSettings(){try{const t=await fetch("/api/deforum/settings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({settings:this.deforumSettings})}),e=await t.json();if(!t.ok||e.error){this.deforumSettingsStatus=e.error||"Save failed";return}this.deforumSettingsStatus="Saved"}catch{this.deforumSettingsStatus="Save failed"}},async generateDeforumPreviewFrame(){if(this.deforumPlaying)return this.performance.status="Stop animation to preview single frames",!1;if(this.previewGenerating)return!1;this.applyCrossfadeMorph(),this.previewGenerating=!0,this.performance.status="Rendering Deforum frame…",this.deforumSettingsStatus="Rendering…";try{const t=await fetch("/api/deforum/preview",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({settings:this.deforumSettings})}),e=await t.json();return!t.ok||e.error?(this.performance.status=e.error||"Deforum preview failed",this.deforumSettingsStatus="Preview failed",!1):(this.performance.lastPreviewPath=e.path,this.generator.lastPath=e.path,this.performance.status="Deforum frame ready",this.deforumSettingsStatus="Frame ready",this.refreshFrames(),!0)}catch(t){return this.performance.status=String(t.message||t),this.deforumSettingsStatus="Preview failed",!1}finally{this.previewGenerating=!1}},async generatePreviewFrame(){this.deforumPanelOpen?await this.generateDeforumPreviewFrame()||await this.generateImage():await this.generateImage()},async generateImage(){if(this.deforumPlaying){this.performance.status="Stop animation to preview single frames";return}if(this.previewGenerating)return;this.applyCrossfadeMorph(),this.previewGenerating=!0,this.performance.status="Generating preview frame…";const t=this.liveVibe.find(u=>u.key==="cfgscale")||this.liveVibe.find(u=>u.key==="cfg");this.liveVibe.find(u=>u.key==="strength");const e=Math.min(960,Math.max(64,Number(this.deforumSettings.W)||960)),n=Math.min(540,Math.max(64,Number(this.deforumSettings.H)||540)),i=this.deforumSettings.steps||12,s=this.deforumSettings.seed!=null?this.deforumSettings.seed:this.hud.seed,r=this.deforumSettings.sampler||"Euler a",a=this.deforumSettings.negative_prompts||this.prompts.neg||"",l=_u(this.deforumSettings,"prompts.0")||this.buildMorphedPrompt();try{const u=await fetch("/api/txt2img",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:l,negative_prompt:a,steps:i,cfg_scale:t?t.val:7,width:e,height:n,seed:s,sampler_name:r})}),d=await u.json();if(!u.ok||d.error){this.performance.status=d.error||"Preview failed";return}this.performance.lastPreviewPath=d.path,this.generator.lastPath=d.path,this.performance.status="Preview frame ready",this.refreshFrames()}catch(u){this.performance.status=String(u.message||u)}finally{this.previewGenerating=!1}},forgeUrl(){return`http://${this.forge.host}:${this.forge.port}`},async refreshForgeStatus(){this.forge.loading=!0;try{const e=await(await fetch("/api/status")).json();e.sdForge?this.forge.available=e.sdForge.available:this.forge.available=!1}catch{this.forge.available=!1}finally{this.forge.loading=!1}},async saveForgeConnection(){try{await(await fetch("/api/forge/options",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({})})).json(),await this.refreshForgeStatus()}catch(t){console.error("Failed to save connection",t)}},async refreshForgeModels(){try{const{data:t}=await Wt("/api/sd-models",{},"sd-models list");this.forge.models=t.models||[],this.forge.modelsSource=t.source||""}catch{this.forge.modelsSource=""}},async switchForgeModel(){if(this.forge.selectedModel){this.forge.switching=!0;try{const e=await(await fetch("/api/sd-models/switch",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model_name:this.forge.selectedModel})})).json();e.success&&(this.forge.currentModel=this.forge.selectedModel,this.forge.lastModel=this.forge.selectedModel,e.model&&e.model.metadata&&(this.forge.modelInfo=e.model.metadata),this.saveSessionState(),this.deforumPlaying||this.schedulePreviewFrame())}catch(t){console.error("Failed to switch model",t)}finally{this.forge.switching=!1}}},async refreshForgeOptions(){try{const[t,e,n,i,s]=await Promise.all([fetch("/api/forge/options"),fetch("/api/forge/samplers"),fetch("/api/forge/schedulers"),fetch("/api/forge/vae"),fetch("/api/sd-models/current")]),r=await t.json(),a=await e.json(),l=await n.json(),u=await i.json(),d=await s.json();this.forge.available=r.available,this.forge.samplers=a.samplers||[],this.forge.schedulers=l.schedulers||[],this.forge.vaeList=u.vae||[],d.model&&(this.forge.currentModel=d.model.model_name||d.model.title||"");const f=r.options||{},m=["sampler_name","scheduler","steps","cfg_scale","width","height","batch_size","sd_vae","clip_skip","eta_ddim","eta_ancestral","sigma_churn","enable_emphasis","use_old_sampling","do_not_add_watermark"];for(const p of m)f[p]!==void 0&&(this.forge.options[p]=f[p])}catch(t){console.error("Failed to load forge options",t)}},async applyForgeOptions(){const t=["sampler_name","scheduler","steps","cfg_scale","width","height","batch_size","sd_vae","clip_skip","eta_ddim","eta_ancestral","sigma_churn","enable_emphasis","use_old_sampling","do_not_add_watermark"],e={};for(const n of t)e[n]=this.forge.options[n];try{const i=await(await fetch("/api/forge/options",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)})).json();i.success||console.error("Failed to apply options",i)}catch(n){console.error("Failed to apply forge options",n)}},async refreshForgeAll(){await Promise.all([this.refreshForgeStatus(),this.refreshForgeModels(),this.refreshForgeOptions()])}}},bb={id:"app"},Mb={class:"tabs"},Tb=["onClick"],Eb={class:"layout"},wb={class:"preview"},Ab={class:"video-wrap"},Pb={id:"player",ref:"videoEl",autoplay:"",muted:"",playsinline:""},Cb={class:"overlay"},Rb={class:"timecode"},Ib={style:{"font-size":"11px",color:"var(--text-secondary)"}},Lb={style:{"text-align":"right"}},Db={style:{"font-size":"11px",color:"var(--text-secondary)"}},Nb=["src"],Ub={class:"timeline",style:{"margin-top":"4px"}},Fb={key:0,class:"thumbs"},kb=["src","alt"],Ob={class:"thumb-label"},Bb={key:1,class:"thumbs"},Vb={class:"preview-bar-container"},zb={class:"preview-bar-header"},Gb=["src","alt"],Hb={class:"thumb-label"},Wb={key:0,class:"thumb-card"},qb={class:"video-controls-panel"},Xb={class:"video-controls"},jb=["disabled"],Yb={key:0,class:"live-hud-strip"},Kb={key:0,class:"live-hud-empty"},Jb={key:0},Zb={class:"rack performance-deck"},Qb={class:"framesync-panel"},$b={class:"framesync-header"},eM={class:"framesync-stack",style:{"margin-top":"10px"}},tM={class:"crossfade-deck",style:{"margin-top":"14px"}},nM={class:"crossfade-deck-head"},iM=["value"],sM={key:0,class:"crossfade-empty"},rM={class:"crossfade-side crossfade-side-a"},aM=["onUpdate:modelValue"],oM=["onUpdate:modelValue"],lM=["value"],cM=["onUpdate:modelValue"],uM=["onUpdate:modelValue"],dM=["value"],fM=["onUpdate:modelValue"],hM=["onUpdate:modelValue"],pM=["value"],mM=["onUpdate:modelValue"],gM={class:"crossfade-slot-meta"},_M={class:"crossfade-type-pill"},vM=["onClick"],yM={class:"crossfade-side crossfade-side-b"},xM=["onUpdate:modelValue"],SM=["onUpdate:modelValue"],bM=["onUpdate:modelValue"],MM=["value"],TM=["onUpdate:modelValue"],EM=["onUpdate:modelValue"],wM={key:0,class:"crossfade-morphed"},AM={class:"crossfade-morphed-val"},PM={class:"crossfade-center",style:{"margin-top":"16px"}},CM={class:"crossfade-labels"},RM={key:0,class:"framesync-subtitle",style:{"margin-top":"10px","text-align":"center",color:"var(--success)"}},IM={key:1,style:{"margin-top":"8px"}},LM=["src"],DM={class:"rack param-drawer"},NM=["title"],UM={class:"param-drawer-body"},FM={class:"model-bar"},kM=["disabled"],OM=["value"],BM=["title"],VM={key:1,class:"model-loading"},zM={key:2,class:"model-last"},GM={key:0,class:"param-group param-group--pinned"},HM={class:"param-group-grid"},WM={class:"framesync-subtitle",style:{"font-size":"10px",display:"flex","align-items":"center",gap:"4px"}},qM=["onClick"],XM=["title","onClick"],jM=["min","max","step","value","disabled","onInput"],YM={class:"framesync-subtitle"},KM={class:"param-group-grid"},JM={class:"framesync-subtitle",style:{"font-size":"10px",display:"flex","align-items":"center",gap:"4px"}},ZM=["onClick"],QM=["title","onClick"],$M=["min","max","step","value","disabled","onInput"],e1={class:"framesync-footer",style:{"margin-top":"10px"}},t1={class:"rack param-drawer deforum-settings-drawer","data-testid":"deforum-settings-panel"},n1={class:"deforum-settings-hint"},i1={class:"param-drawer-body deforum-settings-body"},s1={class:"deforum-settings-toolbar"},r1=["disabled"],a1={class:"deforum-advanced-toggle"},o1={key:0,class:"deforum-advanced-json"},l1={key:0,class:"deforum-json-error"},c1={key:1,class:"deforum-settings-groups"},u1=["open","onToggle"],d1={class:"deforum-settings-group-title"},f1={class:"deforum-settings-grid"},h1={class:"deforum-field-label"},p1=["min","max","step","value","onInput"],m1=["checked","onChange"],g1=["rows","value","onInput"],_1=["value","onInput"],v1={key:1},y1={class:"sub-pills"},x1={key:0},S1={class:"rack"},b1={class:"framesync-panel"},M1={class:"framesync-header"},T1={style:{display:"flex",gap:"8px","align-items":"center"}},E1={key:0},w1={class:"morph-blend-bar",style:{"margin-top":"14px"}},A1={class:"morph-blend-labels"},P1={key:0,class:"morph-slot-weights",style:{"margin-top":"12px"}},C1={class:"morph-slot-weight-name"},R1=["onUpdate:modelValue"],I1={class:"morph-slot-range"},L1=["onUpdate:modelValue","disabled","onInput"],D1={class:"morph-slot-preview"},N1={style:{"margin-top":"20px",display:"grid","grid-template-columns":"1fr 2fr 1fr",gap:"16px","align-items":"stretch"}},U1={class:"framesync-stack"},F1={style:{"font-size":"12px",color:"var(--text-primary)","font-weight":"600"}},k1=["value","onInput"],O1={style:{"font-size":"10px",color:"var(--text-dim)","margin-top":"2px"}},B1={key:0,style:{flex:"1",display:"flex","align-items":"center","justify-content":"center",color:"var(--text-dim)","font-size":"11px","text-align":"center"}},V1={key:1,style:{"font-size":"10px",color:"var(--text-secondary)","text-align":"center",padding:"4px"}},z1={class:"framesync-stack"},G1=["value"],H1={style:{display:"flex","justify-content":"space-between","font-size":"10px",color:"var(--text-dim)","margin-top":"4px"}},W1={class:"framesync-stack"},q1={style:{"font-size":"12px",color:"var(--text-primary)","font-weight":"600"}},X1=["value","onInput"],j1={style:{"font-size":"10px",color:"var(--text-dim)","margin-top":"2px"}},Y1={key:0,style:{flex:"1",display:"flex","align-items":"center","justify-content":"center",color:"var(--text-dim)","font-size":"11px","text-align":"center"}},K1={key:1,style:{"font-size":"10px",color:"var(--text-secondary)","text-align":"center",padding:"4px"}},J1={class:"rack"},Z1={class:"framesync-panel"},Q1={class:"framesync-header"},$1={key:0},eT={class:"framesync-row",style:{"grid-template-columns":"1fr 1fr",gap:"10px","margin-top":"12px"}},tT={class:"framesync-stack"},nT={class:"framesync-stack"},iT={class:"framesync-row",style:{"grid-template-columns":"1fr 1fr 1fr",gap:"10px","margin-top":"10px"}},sT={class:"framesync-stack"},rT={class:"framesync-stack"},aT={class:"framesync-stack"},oT={class:"framesync-footer",style:{"margin-top":"10px"}},lT={key:0,class:"framesync-subtitle",style:{"margin-top":"8px","text-align":"center"}},cT={key:1,class:"framesync-subtitle",style:{"margin-top":"4px","text-align":"center"}},uT=["href"],dT={class:"rack"},fT={class:"framesync-panel"},hT={class:"framesync-header"},pT={key:0,class:"framesync-list",style:{"margin-top":"4px","font-size":"11px","padding-left":"16px"}},mT={key:0},gT={key:1},_T={class:"rack"},vT={class:"framesync-panel"},yT={class:"framesync-header"},xT={style:{display:"flex",gap:"8px","align-items":"center"}},ST={key:0,class:"source",style:{"font-size":"10px"}},bT={key:0,style:{color:"var(--success)"}},MT={key:1,style:{color:"var(--warn)"}},TT={key:2,style:{color:"var(--error)"}},ET={key:3,style:{color:"var(--text-dim)"}},wT={style:{"margin-top":"12px",display:"grid","grid-template-columns":"repeat(auto-fill, minmax(200px, 1fr))",gap:"12px","max-height":"400px","overflow-y":"auto"}},AT=["onClick"],PT={style:{position:"relative",width:"100%",height:"180px",background:"var(--bg-0)"}},CT=["src","alt"],RT={key:1,style:{display:"flex","align-items":"center","justify-content":"center",height:"100%",color:"var(--text-dim)"}},IT={viewBox:"0 0 24 24",style:{width:"48px",height:"48px",opacity:"0.3"},fill:"none",xmlns:"http://www.w3.org/2000/svg"},LT={key:2,style:{position:"absolute",top:"8px",right:"8px",background:"rgba(0,0,0,0.8)",border:"1px solid var(--warn)","border-radius":"4px",padding:"4px 8px","font-size":"10px",color:"var(--warn)","font-weight":"700"}},DT={style:{padding:"10px"}},NT={style:{"font-size":"13px",color:"var(--text-primary)","font-weight":"600","margin-bottom":"6px","white-space":"nowrap",overflow:"hidden","text-overflow":"ellipsis"}},UT={style:{"font-size":"10px",color:"var(--text-dim)","margin-bottom":"8px"}},FT={class:"framesync-stack"},kT=["value","onInput"],OT={style:{"font-size":"10px",color:"var(--text-dim)","margin-top":"2px"}},BT={class:"framesync-footer",style:{"margin-top":"8px"}},VT=["onClick"],zT=["onClick"],GT=["onClick"],HT={key:0,style:{"margin-top":"20px","text-align":"center",color:"var(--text-dim)","font-size":"12px"}},WT={class:"rack"},qT={class:"framesync-panel"},XT={style:{display:"grid","grid-template-columns":"1fr 1fr",gap:"12px","margin-top":"12px"}},jT={style:{"font-size":"12px",color:"var(--success)","margin-bottom":"8px","font-weight":"600"}},YT={style:{background:"var(--bg-0)",border:"1px solid var(--border)","border-radius":"8px",padding:"8px"}},KT={style:{"font-size":"12px",color:"var(--text-primary)"}},JT={style:{"font-size":"10px",color:"var(--text-dim)"}},ZT={key:0,style:{"font-size":"11px",color:"var(--text-dim)",padding:"8px","text-align":"center"}},QT={style:{"font-size":"12px",color:"var(--accent-text)","margin-bottom":"8px","font-weight":"600"}},$T={style:{background:"var(--bg-0)",border:"1px solid var(--border)","border-radius":"8px",padding:"8px"}},eE={style:{"font-size":"12px",color:"var(--text-primary)"}},tE={style:{"font-size":"10px",color:"var(--text-dim)"}},nE={key:0,style:{"font-size":"11px",color:"var(--text-dim)",padding:"8px","text-align":"center"}},iE={class:"framesync-footer",style:{"margin-top":"12px"}},sE={key:2},rE={class:"rack"},aE={class:"framesync-panel"},oE={class:"framesync-header"},lE={style:{display:"flex",gap:"8px","align-items":"center"}},cE={key:0,class:"source",style:{"font-size":"10px"}},uE={key:0,style:{color:"var(--success)"}},dE={key:1,style:{color:"var(--warn)"}},fE={key:2,style:{color:"var(--error)"}},hE={key:3,style:{color:"var(--text-dim)"}},pE={class:"framesync-footer",style:{"margin-top":"12px"}},mE=["onClick"],gE={class:"rack"},_E={class:"framesync-panel"},vE={class:"framesync-header"},yE={class:"framesync-title"},xE={class:"framesync-accent"},SE={class:"framesync-stack",style:{"margin-top":"12px"}},bE=["value"],ME={class:"framesync-stack",style:{"margin-top":"12px"}},TE={style:{display:"flex",gap:"8px","flex-wrap":"wrap"}},EE={key:0,class:"framesync-stack",style:{"margin-top":"12px"}},wE={ref:"webcamVideo",autoplay:"",playsinline:"",style:{width:"100%","max-width":"320px","border-radius":"6px",border:"1px solid var(--border)",display:"none"}},AE={ref:"webcamCanvas",style:{display:"none"}},PE={style:{display:"flex",gap:"8px","margin-top":"8px"}},CE={key:1,class:"framesync-stack",style:{"margin-top":"12px"}},RE={class:"framesync-footer",style:{"margin-top":"10px"}},IE={class:"framesync-stack",style:{"margin-top":"12px"}},LE={style:{display:"flex","justify-content":"space-between","align-items":"center"}},DE={style:{color:"var(--text-primary)","font-size":"12px"}},NE={class:"framesync-stack",style:{"margin-top":"12px"}},UE={style:{display:"flex","justify-content":"space-between","align-items":"center"}},FE={style:{color:"var(--text-primary)","font-size":"12px"}},kE={class:"framesync-stack",style:{"margin-top":"12px"}},OE={style:{display:"flex","justify-content":"space-between","align-items":"center"}},BE={style:{color:"var(--text-primary)","font-size":"12px"}},VE={key:2},zE={class:"rack"},GE={class:"framesync-panel"},HE={class:"framesync-footer",style:{"margin-top":"12px"}},WE=["onClick"],qE={class:"rack"},XE={class:"framesync-panel"},jE={key:3},YE={class:"rack"},KE={class:"framesync-panel"},JE={class:"framesync-header"},ZE={style:{display:"flex",gap:"8px","align-items":"center"}},QE={class:"lfo-grid",style:{"margin-top":"12px"}},$E={class:"lfo-card-head"},ew={class:"switch"},tw=["onUpdate:modelValue"],nw={style:{display:"grid","grid-template-columns":"1fr 1fr",gap:"6px","margin-top":"6px"}},iw=["onUpdate:modelValue"],sw=["value"],rw=["onUpdate:modelValue"],aw=["onUpdate:modelValue"],ow=["onUpdate:modelValue"],lw={style:{"margin-top":"8px"}},cw={class:"lfo-target-grid"},uw={class:"rack"},dw={class:"framesync-panel"},fw={class:"framesync-header"},hw={style:{display:"flex",gap:"8px","align-items":"center"}},pw={class:"lfo-grid",style:{"margin-top":"12px"}},mw={class:"lfo-card-head"},gw={class:"switch"},_w=["onUpdate:modelValue"],vw={style:{display:"grid","grid-template-columns":"1fr 1fr",gap:"6px","margin-top":"6px"}},yw=["onUpdate:modelValue"],xw=["value"],Sw=["onUpdate:modelValue"],bw=["value"],Mw=["onUpdate:modelValue"],Tw=["onUpdate:modelValue"],Ew={key:4},ww={class:"rack"},Aw={class:"framesync-panel"},Pw={class:"framesync-header"},Cw={key:0},Rw={class:"framesync-row",style:{"grid-template-columns":"1fr 1fr",gap:"10px","margin-top":"12px"}},Iw={class:"framesync-stack"},Lw={class:"framesync-stack"},Dw={class:"framesync-checkbox",style:{"margin-top":"6px"}},Nw=["disabled"],Uw={class:"rack"},Fw={class:"framesync-panel"},kw={class:"framesync-header"},Ow={class:"audio-map-grid",style:{"margin-top":"12px"}},Bw={style:{display:"flex","align-items":"center","justify-content":"space-between","margin-bottom":"6px"}},Vw={class:"framesync-subtitle",style:{margin:"0"}},zw=["onClick"],Gw={style:{display:"grid",gap:"6px"}},Hw={style:{display:"grid","grid-template-columns":"1fr 1fr",gap:"6px"}},Ww=["onUpdate:modelValue"],qw=["onUpdate:modelValue"],Xw={style:{display:"grid","grid-template-columns":"1fr 1fr",gap:"6px"}},jw=["onUpdate:modelValue"],Yw=["onUpdate:modelValue"],Kw={class:"framesync-footer",style:{"margin-top":"10px"}},Jw={style:{display:"flex","flex-wrap":"wrap",gap:"4px"}},Zw=["onClick"],Qw={key:5},$w={class:"rack"},eA={class:"framesync-panel"},tA={class:"framesync-header"},nA={style:{display:"flex",gap:"8px","align-items":"center"}},iA={style:{"font-size":"11px",color:"var(--text-dim)"}},sA={style:{"margin-top":"12px",display:"grid","grid-template-columns":"2fr 1fr 1fr 1fr",gap:"8px"}},rA={style:{"margin-top":"8px",display:"flex",gap:"8px","align-items":"center"}},aA={style:{"margin-top":"12px","max-height":"500px","overflow-y":"auto",border:"1px solid var(--border)","border-radius":"8px"}},oA={style:{width:"100%","border-collapse":"collapse","font-size":"11px"}},lA=["onClick"],cA={style:{padding:"6px"}},uA=["src"],dA={key:1,style:{width:"48px",height:"48px",background:"var(--border)","border-radius":"4px",display:"flex","align-items":"center","justify-content":"center",color:"var(--text-dim)","font-size":"10px"}},fA={style:{padding:"6px","font-family":"monospace","font-size":"10px"}},hA={style:{padding:"6px"}},pA={style:{padding:"6px","font-size":"10px"}},mA={style:{padding:"6px","font-size":"10px"}},gA={style:{padding:"6px","font-family":"monospace","font-size":"10px"}},_A={style:{padding:"6px","font-size":"10px"}},vA={style:{padding:"6px","font-size":"10px",color:"var(--text-dim)"}},yA={style:{padding:"6px"}},xA=["onClick"],SA=["onClick"],bA=["onClick"],MA={key:0},TA={key:0,style:{"margin-top":"12px",border:"1px solid var(--border)","border-radius":"8px",background:"var(--bg-1)",padding:"16px"}},EA={style:{display:"flex","justify-content":"space-between","align-items":"center","margin-bottom":"12px"}},wA={class:"framesync-title"},AA={style:{"font-family":"monospace","font-size":"12px"}},PA={style:{display:"grid","grid-template-columns":"1fr 1fr",gap:"12px","font-size":"11px"}},CA={style:{"font-family":"monospace"}},RA={style:{"grid-column":"span 2"}},IA={style:{"max-height":"80px","overflow-y":"auto","font-size":"10px",color:"var(--text-primary)"}},LA={style:{"grid-column":"span 2"}},DA={style:{"max-height":"80px","overflow-y":"auto","font-size":"10px",color:"var(--text-primary)"}},NA={style:{"grid-column":"span 2"}},UA={key:0,style:{"margin-top":"12px"}},FA={class:"framesync-subtitle"},kA={style:{display:"flex","flex-wrap":"wrap",gap:"4px","max-height":"200px","overflow-y":"auto"}},OA=["src","alt"],BA={key:1,style:{"margin-top":"12px",border:"1px solid var(--border)","border-radius":"8px",background:"var(--bg-1)",padding:"16px"}},VA={style:{display:"flex","justify-content":"space-between","align-items":"center","margin-bottom":"12px","flex-wrap":"wrap",gap:"8px"}},zA={class:"framesync-title"},GA={style:{display:"flex",gap:"6px"}},HA={style:{"overflow-x":"auto"}},WA={style:{width:"100%","border-collapse":"collapse","font-size":"10px"}},qA={style:{"border-bottom":"1px solid var(--border)"}},XA={style:{padding:"4px",color:"var(--text-dim)"}},jA={key:6},YA={class:"sub-pills"},KA={key:0},JA={key:1},ZA={class:"rack"},QA={class:"framesync-panel"},$A={key:0,style:{color:"var(--text-secondary)","margin-top":"12px","font-size":"12px"}},e2={key:1},t2={class:"framesync-footer",style:{"margin-top":"12px"}},n2=["onClick"],i2={class:"framesync-footer",style:{"margin-top":"8px"}},s2={class:"framesync-button"},r2={style:{"margin-top":"12px",background:"var(--bg-0)",border:"1px solid var(--border)","border-radius":"8px",overflow:"hidden"}},a2={class:"table"},o2=["onUpdate:modelValue"],l2=["onUpdate:modelValue"],c2=["onUpdate:modelValue"],u2=["value"],d2=["onClick"],f2={key:2},h2={class:"rack"},p2={class:"framesync-panel"},m2={class:"framesync-header"},g2={style:{display:"flex",gap:"8px","align-items":"center"}},_2={key:0,style:{"margin-top":"8px",padding:"8px 12px",background:"rgba(127,119,221,0.08)",border:"1px solid var(--accent)","border-radius":"6px","font-size":"12px",color:"var(--accent-text)"}},v2={class:"framesync-row",style:{"grid-template-columns":"repeat(2, 1fr)",gap:"10px","margin-top":"12px"}},y2={class:"framesync-subtitle"},x2={style:{background:"var(--bg-0)",border:"1px solid var(--border)","border-radius":"6px",overflow:"hidden"}},S2={style:{width:"100%","font-size":"11px","border-collapse":"collapse"}},b2={style:{padding:"4px 8px",color:"var(--text-primary)"}},M2={style:{padding:"4px 8px"}},T2={key:0,style:{display:"inline-flex","align-items":"center",gap:"4px"}},E2={style:{background:"var(--bg-2)",border:"1px solid var(--border-strong)","border-radius":"3px",padding:"2px 6px","font-family":"monospace","font-size":"10px",color:"var(--success)"}},w2=["onClick"],A2={key:1,style:{color:"var(--text-dim)"}},P2={style:{padding:"4px 8px"}},C2={key:0,style:{display:"inline-flex","align-items":"center",gap:"4px"}},R2={style:{background:"var(--bg-2)",border:"1px solid var(--border-strong)","border-radius":"3px",padding:"2px 6px","font-size":"10px",color:"var(--warn)"}},I2=["onClick"],L2={key:1,style:{color:"var(--text-dim)"}},D2={style:{padding:"4px 8px","text-align":"center"}},N2=["onClick"],U2={key:3},F2={class:"rack"},k2={class:"framesync-panel"},O2={class:"framesync-footer",style:{"margin-top":"12px"}},B2=["onClick"],V2={class:"framesync-stack",style:{"margin-top":"12px"}},z2={class:"framesync-footer",style:{"margin-top":"10px"}},G2={key:0,class:"framesync-subtitle",style:{"margin-top":"8px","text-align":"center"}},H2={class:"framesync-header",style:{"margin-top":"20px","padding-top":"12px","border-top":"1px solid var(--border)"}},W2={class:"framesync-row",style:{"grid-template-columns":"1fr 1fr",gap:"10px","margin-top":"10px"}},q2={class:"framesync-stack"},X2={class:"framesync-stack"},j2={class:"framesync-footer",style:{"margin-top":"8px"}},Y2={key:1,class:"framesync-list",style:{"margin-top":"10px","font-size":"11px","padding-left":"16px"}},K2={style:{color:"var(--text-dim)"}},J2=["onClick"],Z2=["onClick"],Q2={key:2,style:{"margin-top":"10px","font-size":"11px",color:"var(--text-dim)"}},$2={key:3,class:"framesync-subtitle",style:{"margin-top":"8px"}},eP={key:4},tP={class:"rack"},nP={class:"framesync-panel","data-testid":"gpu-pool-panel"},iP={class:"framesync-header"},sP={class:"gpu-pool-enable"},rP={class:"framesync-row",style:{"grid-template-columns":"1fr 1fr 1fr",gap:"10px","margin-top":"12px"}},aP={class:"framesync-stack"},oP=["disabled"],lP={class:"framesync-stack"},cP={style:{"font-size":"13px",color:"var(--success)",padding:"6px 0"}},uP={class:"framesync-stack",style:{"justify-content":"flex-end"}},dP=["disabled"],fP={class:"gpu-pool-add",style:{"margin-top":"14px",padding:"12px",border:"1px solid var(--border)","border-radius":"10px"}},hP={class:"framesync-row",style:{"grid-template-columns":"2fr 1fr 1fr",gap:"8px","margin-top":"8px"}},pP=["disabled"],mP=["disabled"],gP=["disabled"],_P={class:"framesync-footer",style:{"margin-top":"8px"}},vP=["disabled"],yP={key:0,class:"gpu-pool-table-wrap",style:{"margin-top":"14px"}},xP={class:"gpu-pool-table"},SP={style:{"font-size":"9px",color:"var(--text-dim)","word-break":"break-all"}},bP={key:1},MP=["title"],TP={class:"framesync-footer",style:{"flex-wrap":"wrap",gap:"4px"}},EP=["onClick"],wP=["onClick"],AP=["onClick"],PP=["onClick"],CP=["onClick"],RP={key:1,style:{"margin-top":"14px","font-size":"12px",color:"var(--text-dim)"}},IP={key:2,class:"framesync-subtitle",style:{"margin-top":"10px"}},LP={key:5},DP={class:"rack"},NP={class:"framesync-panel"},UP={class:"framesync-header"},FP={class:"framesync-row",style:{"grid-template-columns":"1fr 1fr",gap:"10px","margin-top":"12px"}},kP={class:"framesync-stack"},OP={class:"framesync-stack"},BP=["value"],VP={class:"framesync-subtitle",style:{"margin-top":"14px"}},zP={key:0,class:"framesync-list",style:{"font-size":"11px","padding-left":"16px","margin-top":"6px"}},GP={key:0,style:{color:"var(--warn)"}},HP={key:1,style:{"font-size":"11px",color:"var(--text-dim)","margin-top":"6px"}},WP={class:"framesync-footer",style:{"margin-top":"8px"}},qP={key:2,class:"framesync-list",style:{"margin-top":"8px","font-size":"11px","padding-left":"16px"}},XP=["onClick"],jP={key:3,class:"framesync-subtitle",style:{"margin-top":"10px",color:"var(--success)"}},YP={key:4,style:{"font-size":"11px","margin-top":"6px"}},KP=["onClick"],JP={key:5,style:{"font-size":"11px",color:"var(--text-dim)","margin-top":"6px"}},ZP={key:6},QP={key:7},$P={class:"rack"},eC={class:"framesync-panel"},tC={class:"framesync-header"},nC={class:"framesync-row",style:{"grid-template-columns":"repeat(4, 1fr)",gap:"10px","margin-top":"12px","align-items":"end"}},iC={class:"framesync-stack"},sC={class:"framesync-stack"},rC={class:"framesync-stack"},aC={class:"framesync-list",style:{display:"flex","align-items":"center",gap:"8px","margin-top":"6px"}},oC={class:"framesync-stack"},lC={class:"framesync-list",style:{display:"flex","align-items":"center",gap:"8px","margin-top":"6px"}},cC={key:0,class:"framesync-row",style:{"grid-template-columns":"repeat(4, 1fr)",gap:"10px","margin-top":"8px","align-items":"end"}},uC={class:"framesync-stack"},dC={class:"framesync-stack"},fC={class:"framesync-stack"},hC={class:"framesync-stack"},pC={style:{"font-size":"12px",color:"var(--success)",padding:"6px 0"}},mC=["max"],gC={key:1,style:{position:"relative","min-height":"40px","margin-top":"8px","border-radius":"6px",background:"var(--bg-0)",border:"1px solid var(--border)",overflow:"visible"},title:"Scene markers (click to jump)"},_C=["onClick"],vC={key:0,style:{position:"absolute",inset:"0",display:"flex","align-items":"center","justify-content":"center",color:"var(--text-dim)","font-size":"11px"}},yC={style:{display:"flex",gap:"8px","flex-wrap":"wrap","align-items":"center","margin-bottom":"6px"}},xC={key:2,style:{"font-size":"11px",color:"var(--text-dim)"}},SC=["onClick"],bC=["value","onChange"],MC=["value","placeholder","onChange","title"],TC={key:1,style:{"font-size":"9px",color:"var(--text-dim)"}},EC={key:2,style:{"font-size":"9px",color:"var(--text-dim)"}},wC={key:3,style:{"font-size":"9px",color:"var(--text-dim)"}},AC=["onClick"],PC={key:3,class:"framesync-list",style:{"font-size":"11px","font-style":"italic"}},CC={style:{display:"flex",gap:"8px","flex-wrap":"wrap","margin-top":"10px"}},RC=["value"],IC={key:4,style:{"margin-top":"8px",border:"1px solid var(--border)","border-radius":"8px",background:"var(--bg-0)",overflow:"hidden"}},LC={style:{padding:"6px 10px","font-size":"10px",color:"var(--text-dim)","border-bottom":"1px solid var(--border)",display:"flex","justify-content":"space-between","align-items":"center"}},DC={style:{position:"relative"},ref:"timelineContainer"},NC={style:{display:"flex",gap:"8px","flex-wrap":"wrap","align-items":"center","margin-bottom":"8px"}},UC=["value"],FC={style:{display:"flex","justify-content":"space-between","align-items":"center",gap:"8px","flex-wrap":"wrap"}},kC={style:{color:"var(--warn)","font-size":"13px"}},OC={style:{"font-size":"11px",color:"var(--text-secondary)"}},BC=["value"],VC=["onClick"],zC={style:{"font-size":"11px",color:"var(--text-dim)","margin-top":"6px"}},GC=["value","onChange"],HC=["onClick"],WC={key:0,style:{"font-style":"italic"}},qC={key:5,class:"framesync-list",style:{"margin-top":"8px",color:"var(--success)"}},XC={class:"rack"},jC={class:"framesync-panel"},YC={class:"framesync-header"},KC=["disabled"],JC={class:"framesync-stack",style:{"margin-top":"12px"}},ZC={style:{display:"grid","grid-template-columns":"1fr 1fr",gap:"10px","margin-top":"10px"}},QC={class:"framesync-stack"},$C={key:0,class:"framesync-stack"},eR={class:"framesync-footer",style:{"margin-top":"12px"}},tR={key:0,class:"framesync-subtitle",style:{"margin-top":"8px","text-align":"center"}},nR={class:"framesync-header",style:{"margin-bottom":"8px"}},iR={key:0},sR=["src"],rR={class:"context context--rail"},aR={class:"context-rail-header"},oR={class:"context-rail-copy"},lR={class:"context-rail-actions"},cR={class:"pill"},uR={key:0,class:"context-summary-chips"},dR={key:1,class:"context-rail-status"},fR={key:2,class:"recent-runs-rail"},hR=["onClick"],pR={class:"recent-runs-thumb-wrap"},mR=["src","alt"],gR={key:1,class:"recent-runs-thumb recent-runs-thumb--empty"},_R={class:"recent-runs-meta"},vR={class:"recent-runs-id"},yR={class:"recent-runs-model"},xR={class:"recent-runs-subline"},SR={key:0,class:"recent-runs-note"},bR={key:3,class:"recent-runs-empty"};function MR(t,e,n,i,s,r){const a=Bi("ThreeBackground"),l=Bi("StatusStrip"),u=Bi("Crossfader"),d=Bi("GlassPanel"),f=Bi("LiveParamRow"),m=Bi("Waveform"),p=Bi("TargetCell");return A(),P("div",bb,[Bt(a,{lfos:s.lfos,"audio-metrics":s.backgroundAudioMetrics,"active-tab":s.currentTab,morph:s.performance.crossfader},null,8,["lfos","audio-metrics","active-tab","morph"]),c("header",null,[c("div",Mb,[(A(!0),P(we,null,ze(s.tabs,o=>(A(),P("button",{class:Be(["tab",{active:s.currentTab===o.id}]),key:o.id,onClick:h=>r.switchTab(o.id)},B(o.label),11,Tb))),128))]),Bt(l,{playing:s.deforumPlaying,recording:s.isRecording,"api-health":s.apiHealth,"midi-supported":s.midi.supported,"midi-selected":s.midi.selected,"ws-status":s.wsStatus,session:s.session,onTogglePlay:r.toggleDeforumPlay,onStopPlay:r.stopDeforumPlay,onToggleRecord:r.toggleStreamRecord},null,8,["playing","recording","api-health","midi-supported","midi-selected","ws-status","session","onTogglePlay","onStopPlay","onToggleRecord"])]),c("div",Eb,[c("div",wb,[c("div",Ab,[c("video",Pb,null,512),c("div",Cb,[c("div",null,[c("div",Rb,B(s.timecode),1),c("div",Ib,"Seed "+B(s.hud.seed),1)]),c("div",Lb,[c("div",null,B(s.stats.fps)+" fps",1),c("div",Db,"lat "+B(s.stats.lat)+"ms",1)])])]),c("audio",{ref:"avSyncAudio","data-testid":"av-sync-audio",src:s.audio.objectUrl||void 0,preload:"auto",style:{display:"none"}},null,8,Nb),c("div",Ub,[s.audio.objectUrl?(A(),P("div",Fb,[(A(!0),P(we,null,ze(s.thumbs.slice(0,12),o=>(A(),P("div",{class:"thumb-card",key:o.name},[c("img",{class:"thumb",src:o.url,alt:o.name},null,8,kb),c("div",Ob,B(o.name),1)]))),128))])):(A(),P("div",Bb,[(A(),P(we,null,ze(6,o=>c("div",{class:"thumb-card",key:o},[...e[184]||(e[184]=[yi('<div class="thumb-placeholder"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" stroke="currentColor" stroke-width="2" rx="2"></rect><circle cx="8" cy="8" r="2" fill="currentColor"></circle><path d="M3 15 L8 10 L12 14 L17 9 L21 13 V21 H3 Z" fill="currentColor" opacity="0.5"></path></svg></div>',1)])])),64))]))]),c("div",Vb,[c("div",zb,[e[185]||(e[185]=c("span",{class:"preview-bar-title"},"Frames",-1)),c("button",{class:"preview-bar-toggle",onClick:e[0]||(e[0]=o=>s.showFrames=!s.showFrames)},B(s.showFrames?"▲":"▼"),1)]),c("div",{class:Be(["preview-bar",{collapsed:!s.showFrames}])},[(A(!0),P(we,null,ze(s.thumbs,o=>(A(),P("div",{class:"thumb-card",key:"bar-"+o.name},[c("img",{class:"thumb",src:o.url,alt:o.name},null,8,Gb),c("div",Hb,B(o.name),1)]))),128)),s.thumbs.length?Le("",!0):(A(),P("div",Wb,[...e[186]||(e[186]=[yi('<div class="thumb-placeholder"><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" stroke="currentColor" stroke-width="2" rx="2"></rect><circle cx="8" cy="8" r="2" fill="currentColor"></circle><path d="M3 15 L8 10 L12 14 L17 9 L21 13 V21 H3 Z" fill="currentColor" opacity="0.5"></path></svg></div>',1)])]))],2)]),c("div",qb,[c("div",Xb,[c("button",{class:Be(["control-btn",{playing:s.deforumPlaying}]),onClick:e[1]||(e[1]=(...o)=>r.toggleDeforumPlay&&r.toggleDeforumPlay(...o)),"data-testid":"deforum-play"},B(s.deforumPlaying?"⏸ Pause":"▶ Play"),3),c("button",{class:"control-btn",onClick:e[2]||(e[2]=(...o)=>r.generatePreviewFrame&&r.generatePreviewFrame(...o)),disabled:s.previewGenerating||s.deforumPlaying,"data-testid":"preview-frame"},B(s.previewGenerating?"⏳ Frame…":"🖼 Frame"),9,jb),c("button",{class:Be(["control-btn",{recording:s.isRecording}]),onClick:e[3]||(e[3]=(...o)=>r.toggleStreamRecord&&r.toggleStreamRecord(...o)),"data-testid":"stream-record"},B(s.isRecording?"⏹ Stop Rec":"● Record"),3),c("span",{class:Be(["perf-mode-badge",s.deforumPlaying?"mode-animate":"mode-preview"])},B(s.deforumPlaying?"Animating":"Preview"),3)]),e[187]||(e[187]=c("div",{class:"stream-link"},[c("a",{href:"/hls/live/deforum.m3u8",target:"_blank"},"📡 HLS Stream"),c("span",{style:{color:"var(--text-dim)"}},"|"),c("a",{href:"rtmp://localhost:1935/live/deforum",target:"_blank"},"📡 RTMP")],-1))]),s.currentTab==="LIVE"?(A(),P("div",Yb,[Bt(d,{size:"sm",class:"live-hud-morph"},{header:tr(()=>[...e[188]||(e[188]=[Ge("Morph",-1)])]),default:tr(()=>[Bt(u,{"model-value":s.performance.crossfader,"onUpdate:modelValue":e[4]||(e[4]=o=>{s.performance.crossfader=o,r.onCrossfaderInput()})},null,8,["model-value"])]),_:1}),Bt(d,{size:"sm",class:"live-hud-modulating"},{header:tr(()=>[...e[189]||(e[189]=[Ge("Modulating now",-1)])]),default:tr(()=>[r.liveModulating.length?Le("",!0):(A(),P("div",Kb,"No active modulators")),(A(!0),P(we,null,ze(r.liveModulating,o=>(A(),vr(f,{key:o.key,label:o.label,"param-key":o.key,value:o.val,min:o.min,max:o.max,source:o.source,modulated:!0},null,8,["label","param-key","value","min","max","source"]))),128))]),_:1})])):Le("",!0)]),c("div",null,[s.currentTab==="LIVE"?(A(),P("div",Jb,[c("div",Zb,[c("div",Qb,[c("div",$b,[e[190]||(e[190]=c("div",{class:"framesync-title"},[Ge("🎛 "),c("span",{class:"framesync-accent"},"Performance")],-1)),c("span",{class:Be(["perf-mode-badge",s.deforumPlaying?"mode-animate":"mode-preview"])},B(s.deforumPlaying?"Deforum playing":"Single-frame preview"),3)]),c("div",eM,[e[191]||(e[191]=c("div",{class:"framesync-subtitle"},"Generic prompt",-1)),Me(c("textarea",{class:"framesync-input","onUpdate:modelValue":e[5]||(e[5]=o=>s.performance.genericPrompt=o),rows:"2",placeholder:"Base prompt for this session…",onInput:e[6]||(e[6]=(...o)=>r.onPerformanceInput&&r.onPerformanceInput(...o))},null,544),[[je,s.performance.genericPrompt]])]),c("div",tM,[c("div",nM,[e[192]||(e[192]=c("span",{class:"framesync-subtitle",style:{margin:"0"}},"Morph slots",-1)),Me(c("select",{class:"framesync-select",style:{"max-width":"140px"},"onUpdate:modelValue":e[7]||(e[7]=o=>s.performance.newSlotType=o)},[(A(!0),P(we,null,ze(s.crossfadeSlotTypes,o=>(A(),P("option",{key:o.id,value:o.id},B(o.label),9,iM))),128))],512),[[Pt,s.performance.newSlotType]]),c("button",{type:"button",class:"framesync-button",onClick:e[8]||(e[8]=(...o)=>r.addCrossfadeSlot&&r.addCrossfadeSlot(...o))},"+ Add")]),s.performance.slots.length?Le("",!0):(A(),P("div",sM,"Add prompts, parameters, LoRAs, or ControlNet values on side A and/or B.")),(A(!0),P(we,null,ze(s.performance.slots,o=>(A(),P("div",{key:o.id,class:"crossfade-slot-row"},[c("div",rM,[e[194]||(e[194]=c("span",{class:"crossfade-side-label"},"A",-1)),o.type==="prompt"?Me((A(),P("input",{key:0,class:"framesync-input","onUpdate:modelValue":h=>o.valueA=h,placeholder:"Prompt A (optional)",onInput:e[9]||(e[9]=(...h)=>r.onPerformanceInput&&r.onPerformanceInput(...h))},null,40,aM)),[[je,o.valueA]]):o.type==="param"?(A(),P(we,{key:1},[Me(c("select",{class:"framesync-select","onUpdate:modelValue":h=>o.paramKey=h,onChange:e[10]||(e[10]=(...h)=>r.onPerformanceInput&&r.onPerformanceInput(...h))},[(A(!0),P(we,null,ze(s.lfoTargets,h=>(A(),P("option",{key:"a-"+o.id+h.key,value:h.key},B(h.label),9,lM))),128))],40,oM),[[Pt,o.paramKey]]),Me(c("input",{type:"number",class:"framesync-input","onUpdate:modelValue":h=>o.valueA=h,step:"any",placeholder:"Value A",onInput:e[11]||(e[11]=(...h)=>r.onPerformanceInput&&r.onPerformanceInput(...h))},null,40,cM),[[je,o.valueA,void 0,{number:!0}]])],64)):o.type==="lora"?(A(),P(we,{key:2},[Me(c("select",{class:"framesync-select","onUpdate:modelValue":h=>o.valueA=h,onChange:e[12]||(e[12]=(...h)=>r.onPerformanceInput&&r.onPerformanceInput(...h))},[e[193]||(e[193]=c("option",{value:null},"— none —",-1)),(A(!0),P(we,null,ze(s.loras.available,h=>(A(),P("option",{key:"la-"+o.id+h.id,value:h.name},B(h.name),9,dM))),128))],40,uM),[[Pt,o.valueA]]),Me(c("input",{type:"number",class:"framesync-input","onUpdate:modelValue":h=>o.loraStrengthA=h,min:"0",max:"2",step:"0.01",placeholder:"Str A",onInput:e[13]||(e[13]=(...h)=>r.onPerformanceInput&&r.onPerformanceInput(...h))},null,40,fM),[[je,o.loraStrengthA,void 0,{number:!0}]])],64)):o.type==="controlnet"?(A(),P(we,{key:3},[Me(c("select",{class:"framesync-select","onUpdate:modelValue":h=>o.cnSlotId=h,onChange:e[14]||(e[14]=(...h)=>r.onPerformanceInput&&r.onPerformanceInput(...h))},[(A(!0),P(we,null,ze(s.cn.slots,h=>(A(),P("option",{key:"cna-"+o.id+h.id,value:h.id},B(h.label),9,pM))),128))],40,hM),[[Pt,o.cnSlotId]]),Me(c("input",{type:"number",class:"framesync-input","onUpdate:modelValue":h=>o.valueA=h,min:"0",max:"2",step:"0.01",placeholder:"Weight A",onInput:e[15]||(e[15]=(...h)=>r.onPerformanceInput&&r.onPerformanceInput(...h))},null,40,mM),[[je,o.valueA,void 0,{number:!0}]])],64)):Le("",!0)]),c("div",gM,[c("span",_M,B(r.slotTypeLabel(o.type)),1),c("button",{type:"button",class:"framesync-button",style:{padding:"2px 6px"},onClick:h=>r.removeCrossfadeSlot(o.id)},"✕",8,vM)]),c("div",yM,[e[196]||(e[196]=c("span",{class:"crossfade-side-label"},"B",-1)),o.type==="prompt"?Me((A(),P("input",{key:0,class:"framesync-input","onUpdate:modelValue":h=>o.valueB=h,placeholder:"Prompt B (optional)",onInput:e[16]||(e[16]=(...h)=>r.onPerformanceInput&&r.onPerformanceInput(...h))},null,40,xM)),[[je,o.valueB]]):o.type==="param"?Me((A(),P("input",{key:1,type:"number",class:"framesync-input","onUpdate:modelValue":h=>o.valueB=h,step:"any",placeholder:"Value B",onInput:e[17]||(e[17]=(...h)=>r.onPerformanceInput&&r.onPerformanceInput(...h))},null,40,SM)),[[je,o.valueB,void 0,{number:!0}]]):o.type==="lora"?(A(),P(we,{key:2},[Me(c("select",{class:"framesync-select","onUpdate:modelValue":h=>o.valueB=h,onChange:e[18]||(e[18]=(...h)=>r.onPerformanceInput&&r.onPerformanceInput(...h))},[e[195]||(e[195]=c("option",{value:null},"— none —",-1)),(A(!0),P(we,null,ze(s.loras.available,h=>(A(),P("option",{key:"lb-"+o.id+h.id,value:h.name},B(h.name),9,MM))),128))],40,bM),[[Pt,o.valueB]]),Me(c("input",{type:"number",class:"framesync-input","onUpdate:modelValue":h=>o.loraStrengthB=h,min:"0",max:"2",step:"0.01",placeholder:"Str B",onInput:e[19]||(e[19]=(...h)=>r.onPerformanceInput&&r.onPerformanceInput(...h))},null,40,TM),[[je,o.loraStrengthB,void 0,{number:!0}]])],64)):o.type==="controlnet"?Me((A(),P("input",{key:3,type:"number",class:"framesync-input","onUpdate:modelValue":h=>o.valueB=h,min:"0",max:"2",step:"0.01",placeholder:"Weight B",onInput:e[20]||(e[20]=(...h)=>r.onPerformanceInput&&r.onPerformanceInput(...h))},null,40,EM)),[[je,o.valueB,void 0,{number:!0}]]):Le("",!0)]),r.slotMorphedPreview(o)!==null?(A(),P("div",wM,[e[197]||(e[197]=c("span",{class:"framesync-subtitle",style:{margin:"0","font-size":"9px"}},"→",-1)),c("code",AM,B(r.formatMorphedPreview(o)),1)])):Le("",!0)]))),128)),c("div",PM,[e[198]||(e[198]=c("div",{class:"framesync-subtitle",style:{"text-align":"center"}},"Crossfader",-1)),e[199]||(e[199]=c("div",{class:"framesync-gradient-bar"},null,-1)),Me(c("input",{type:"range",min:"0",max:"1",step:"0.01","onUpdate:modelValue":e[21]||(e[21]=o=>s.performance.crossfader=o),class:"framesync-input","data-testid":"performance-crossfader",onInput:e[22]||(e[22]=(...o)=>r.onCrossfaderInput&&r.onCrossfaderInput(...o))},null,544),[[je,s.performance.crossfader,void 0,{number:!0}]]),c("div",CM,[c("span",null,"A "+B(((1-s.performance.crossfader)*100).toFixed(0))+"%",1),c("span",null,"B "+B((s.performance.crossfader*100).toFixed(0))+"%",1)])])]),s.performance.status?(A(),P("div",RM,B(s.performance.status),1)):Le("",!0),s.performance.lastPreviewPath?(A(),P("div",IM,[c("img",{src:s.performance.lastPreviewPath,alt:"Last preview frame",class:"preview-frame-thumb"},null,8,LM)])):Le("",!0)])]),c("div",DM,[c("button",{type:"button",class:"param-drawer-toggle",onClick:e[23]||(e[23]=o=>{s.paramPanelOpen=!s.paramPanelOpen,r.saveSessionState()})},[e[201]||(e[201]=c("span",null,"⚙️ Parameters",-1)),c("span",{class:Be(["model-status-pill","model-"+r.modelStatusKind]),title:r.modelStatusLabel},[e[200]||(e[200]=c("span",{class:"model-status-dot"},null,-1)),Ge(" "+B(r.modelStatusLabel),1)],10,NM),c("span",null,B(s.paramPanelOpen?"▲":"▼"),1)]),Me(c("div",UM,[c("div",FM,[e[203]||(e[203]=c("label",{class:"framesync-subtitle"},"Checkpoint",-1)),Me(c("select",{class:"framesync-select","onUpdate:modelValue":e[24]||(e[24]=o=>s.forge.selectedModel=o),disabled:s.forge.switching||r.modelStatusKind==="offline",onChange:e[25]||(e[25]=(...o)=>r.onModelSelectChange&&r.onModelSelectChange(...o))},[e[202]||(e[202]=c("option",{value:""},"— select model —",-1)),(A(!0),P(we,null,ze(s.forge.models,o=>(A(),P("option",{key:o.model_name||o.title,value:o.model_name||o.title},B(o.title||o.model_name),9,OM))),128))],40,kM),[[Pt,s.forge.selectedModel]]),s.forge.modelsSource?(A(),P("span",{key:0,class:Be(["model-source-pill","src-"+s.forge.modelsSource]),title:"Model list from "+s.forge.modelsSource}," ● "+B(r.modelSourceLabel(s.forge.modelsSource)),11,BM)):Le("",!0),s.forge.switching?(A(),P("span",VM,"Loading model…")):s.forge.lastModel?(A(),P("span",zM,"Last: "+B(s.forge.lastModel),1)):Le("",!0)]),r.pinnedParamItems.length?(A(),P("div",GM,[e[204]||(e[204]=c("div",{class:"framesync-subtitle"},"📌 Pinned",-1)),c("div",HM,[(A(!0),P(we,null,ze(r.pinnedParamItems,o=>(A(),P("div",{class:Be(["framesync-stack",{"param-locked":r.isParamLocked(o.key)}]),key:"pin-"+o.key},[c("div",WM,[c("span",null,B(o.label),1),c("button",{type:"button",class:"param-pin-btn active",title:"Unpin",onClick:cn(h=>r.toggleParamPin(o.key),["stop"])},"📌",8,qM),c("button",{type:"button",class:Be(["param-lock-btn",{active:r.isParamLockedByMe(o.key)}]),title:r.paramLockTitle(o.key),onClick:cn(h=>r.toggleParamLock(o.key),["stop"])},"🔒",10,XM)]),c("input",{type:"range",min:o.min,max:o.max,step:o.step,value:o.val,disabled:r.isParamLocked(o.key)&&!r.isParamLockedByMe(o.key),onInput:h=>r.updateParam(o,h),class:"framesync-input"},null,40,jM)],2))),128))])])):Le("",!0),(A(!0),P(we,null,ze(r.paramPanelGroups,o=>(A(),P("div",{key:o.label,class:"param-group"},[c("div",YM,B(o.label),1),c("div",KM,[(A(!0),P(we,null,ze(o.items,h=>(A(),P("div",{class:Be(["framesync-stack",{"param-locked":r.isParamLocked(h.key)}]),key:h.key},[c("div",JM,[c("span",null,B(h.label),1),c("button",{type:"button",class:Be(["param-pin-btn",{active:r.isParamPinned(h.key)}]),title:"Pin to top",onClick:cn(y=>r.toggleParamPin(h.key),["stop"])},"📌",10,ZM),c("button",{type:"button",class:Be(["param-lock-btn",{active:r.isParamLockedByMe(h.key)}]),title:r.paramLockTitle(h.key),onClick:cn(y=>r.toggleParamLock(h.key),["stop"])},"🔒",10,QM)]),c("input",{type:"range",min:h.min,max:h.max,step:h.step,value:h.val,disabled:r.isParamLocked(h.key)&&!r.isParamLockedByMe(h.key),onInput:y=>r.updateParam(h,y),class:"framesync-input"},null,40,$M)],2))),128))])]))),128)),c("div",e1,[c("button",{class:"framesync-button",onClick:e[26]||(e[26]=(...o)=>r.resetVibeParams&&r.resetVibeParams(...o))},"↺ Reset vibe"),c("button",{class:"framesync-button",onClick:e[27]||(e[27]=(...o)=>r.resetCameraParams&&r.resetCameraParams(...o))},"↺ Reset camera")])],512),[[iu,s.paramPanelOpen]])]),c("div",t1,[c("button",{type:"button",class:"param-drawer-toggle",onClick:e[28]||(e[28]=o=>{s.deforumPanelOpen=!s.deforumPanelOpen,r.saveSessionState()})},[e[205]||(e[205]=c("span",null,"🎬 Deforum settings",-1)),c("span",n1,B(s.deforumSettingsStatus||"Hidden panel"),1),c("span",null,B(s.deforumPanelOpen?"▲":"▼"),1)]),Me(c("div",i1,[c("div",s1,[c("button",{type:"button",class:"framesync-button",onClick:e[29]||(e[29]=(...o)=>r.loadDeforumSettings&&r.loadDeforumSettings(...o))},"↻ Reload"),c("button",{type:"button",class:"framesync-button",onClick:e[30]||(e[30]=(...o)=>r.saveDeforumSettings&&r.saveDeforumSettings(...o))},"💾 Save"),c("button",{type:"button",class:"framesync-button",disabled:s.previewGenerating,onClick:e[31]||(e[31]=(...o)=>r.generateDeforumPreviewFrame&&r.generateDeforumPreviewFrame(...o))},"🖼 Regenerate frame",8,r1),c("label",a1,[Me(c("input",{type:"checkbox","onUpdate:modelValue":e[32]||(e[32]=o=>s.deforumAdvancedOpen=o)},null,512),[[xi,s.deforumAdvancedOpen]]),e[206]||(e[206]=Ge(" JSON ",-1))])]),s.deforumAdvancedOpen?(A(),P("div",o1,[Me(c("textarea",{class:"framesync-input deforum-json-editor","onUpdate:modelValue":e[33]||(e[33]=o=>s.deforumSettingsJson=o),rows:"12",spellcheck:"false",onBlur:e[34]||(e[34]=(...o)=>r.applyDeforumSettingsJson&&r.applyDeforumSettingsJson(...o))},null,544),[[je,s.deforumSettingsJson]]),s.deforumSettingsJsonError?(A(),P("p",l1,B(s.deforumSettingsJsonError),1)):Le("",!0)])):(A(),P("div",c1,[(A(!0),P(we,null,ze(s.deforumFieldGroups,o=>(A(),P("details",{key:o.id,class:"deforum-settings-group",open:s.deforumSectionOpen[o.id]!==!1,onToggle:h=>r.onDeforumSectionToggle(o.id,h)},[c("summary",d1,B(o.label),1),c("div",f1,[(A(!0),P(we,null,ze(o.fields,h=>(A(),P("label",{key:h.key,class:Be(["deforum-field","deforum-field-"+(h.type||"text")])},[c("span",h1,B(h.label),1),h.type==="number"?(A(),P("input",{key:0,type:"number",class:"framesync-input",min:h.min,max:h.max,step:h.step||1,value:r.getDeforumField(h.key),onInput:y=>r.onDeforumFieldInput(h.key,y.target.value,"number")},null,40,p1)):h.type==="bool"?(A(),P("input",{key:1,type:"checkbox",checked:!!r.getDeforumField(h.key),onChange:y=>r.onDeforumFieldInput(h.key,y.target.checked,"bool")},null,40,m1)):h.type==="textarea"?(A(),P("textarea",{key:2,class:"framesync-input",rows:h.rows||3,value:r.getDeforumField(h.key)??"",onInput:y=>r.onDeforumFieldInput(h.key,y.target.value,"text")},null,40,g1)):(A(),P("input",{key:3,type:"text",class:"framesync-input",value:r.getDeforumField(h.key)??"",onInput:y=>r.onDeforumFieldInput(h.key,y.target.value,"text")},null,40,_1))],2))),128))])],40,u1))),128))]))],512),[[iu,s.deforumPanelOpen]])])])):s.currentTab==="PROMPTS"?(A(),P("div",v1,[c("div",y1,[c("button",{class:Be(["sub-pill",{active:s.currentSubTab.PROMPTS==="PROMPTS"}]),onClick:e[35]||(e[35]=o=>r.switchSubTab("PROMPTS","PROMPTS"))},"PROMPTS",2),c("button",{class:Be(["sub-pill",{active:s.currentSubTab.PROMPTS==="LORA"}]),onClick:e[36]||(e[36]=o=>r.switchSubTab("PROMPTS","LORA"))},"LORA",2),c("button",{class:Be(["sub-pill",{active:s.currentSubTab.PROMPTS==="CONTROLNET"}]),onClick:e[37]||(e[37]=o=>r.switchSubTab("PROMPTS","CONTROLNET"))},"CONTROLNET",2)]),s.currentSubTab.PROMPTS==="PROMPTS"?(A(),P("div",x1,[c("div",S1,[c("div",b1,[c("div",M1,[e[207]||(e[207]=c("div",{class:"framesync-title"},[Ge("✍️ Prompt "),c("span",{class:"framesync-accent"},"Morphing")],-1)),c("div",T1,[c("button",{class:Be(["framesync-button",{active:s.prompts.morphOn}]),onClick:e[38]||(e[38]=o=>r.setMorph(!0))},"☑ Enabled",2),c("button",{class:Be(["framesync-button",{active:!s.prompts.morphOn}]),onClick:e[39]||(e[39]=o=>r.setMorph(!1))},"☐ Disabled",2),c("button",{class:"framesync-button",onClick:e[40]||(e[40]=o=>s.morphCollapsed=!s.morphCollapsed)},B(s.morphCollapsed?"▼ Show":"▲ Hide"),1),c("button",{class:"framesync-button",onClick:e[41]||(e[41]=(...o)=>r.applyLoras&&r.applyLoras(...o)),style:{padding:"6px 16px"}},"✓ Apply All")])]),s.morphCollapsed?Le("",!0):(A(),P("div",E1,[c("div",w1,[e[208]||(e[208]=c("div",{class:"framesync-subtitle"},"Prompt morph blend",-1)),e[209]||(e[209]=c("div",{class:"framesync-gradient-bar"},null,-1)),Me(c("input",{type:"range",min:"0",max:"1",step:"0.01","onUpdate:modelValue":e[42]||(e[42]=o=>s.prompts.morphBlend=o),class:"framesync-input","data-testid":"prompt-morph-blend",onInput:e[43]||(e[43]=(...o)=>r.onPromptMorphBlendInput&&r.onPromptMorphBlendInput(...o))},null,544),[[je,s.prompts.morphBlend,void 0,{number:!0}]]),c("div",A1,[c("span",null,"A "+B(((1-s.prompts.morphBlend)*100).toFixed(0))+"%",1),c("span",null,"B "+B((s.prompts.morphBlend*100).toFixed(0))+"%",1)])]),s.prompts.morphOn?(A(),P("div",P1,[(A(!0),P(we,null,ze(s.morphSlots,o=>(A(),P("div",{key:"mw-"+o.id,class:Be(["morph-slot-weight-row",{inactive:!o.on||!r.morphSlotInRange(o)}])},[c("label",C1,[Me(c("input",{type:"checkbox","onUpdate:modelValue":h=>o.on=h,onChange:e[44]||(e[44]=(...h)=>r.applyPromptMorphing&&r.applyPromptMorphing(...h))},null,40,R1),[[xi,o.on]]),Ge(" "+B(o.name),1)]),c("span",I1,B(o.range),1),Me(c("input",{type:"range",min:"0",max:"1",step:"0.01","onUpdate:modelValue":h=>o.weight=h,class:"framesync-input morph-slot-weight-slider",disabled:!o.on,onInput:h=>r.onMorphSlotWeightInput(o)},null,40,L1),[[je,o.weight,void 0,{number:!0}]]),c("code",D1,B(r.morphSlotPreview(o)),1)],2))),128))])):Le("",!0),c("div",N1,[c("div",U1,[e[210]||(e[210]=c("div",{class:"framesync-subtitle"},"A Group",-1)),(A(!0),P(we,null,ze(s.loras.groupA.slice(0,3),o=>(A(),P("div",{key:"a-"+o.id,style:{background:"var(--bg-1)",border:"1px solid var(--border)","border-radius":"8px",padding:"8px","margin-bottom":"6px"}},[c("div",F1,B(o.name),1),c("input",{type:"range",min:"0",max:"2",step:"0.01",value:o.strength,onInput:h=>o.strength=parseFloat(h.target.value),class:"framesync-input",style:{"margin-top":"4px"}},null,40,k1),c("div",O1,B(o.strength.toFixed(2)),1)]))),128)),s.loras.groupA.length===0?(A(),P("div",B1," No LoRAs in A group ")):s.loras.groupA.length>3?(A(),P("div",V1," +"+B(s.loras.groupA.length-3)+" more ",1)):Le("",!0)]),c("div",z1,[e[211]||(e[211]=c("div",{class:"framesync-subtitle"},"Crossfader",-1)),e[212]||(e[212]=c("div",{class:"framesync-gradient-bar"},null,-1)),c("input",{type:"range",min:"0",max:"1",step:"0.01",value:s.prompts.crossfaderValue,onInput:e[45]||(e[45]=o=>s.prompts.crossfaderValue=parseFloat(o.target.value)),class:"framesync-input",style:{"margin-top":"8px"}},null,40,G1),c("div",H1,[c("span",null,"A: "+B(((1-s.prompts.crossfaderValue)*100).toFixed(0))+"%",1),c("span",null,"B: "+B((s.prompts.crossfaderValue*100).toFixed(0))+"%",1)])]),c("div",W1,[e[213]||(e[213]=c("div",{class:"framesync-subtitle"},"B Group",-1)),(A(!0),P(we,null,ze(s.loras.groupB.slice(0,3),o=>(A(),P("div",{key:"b-"+o.id,style:{background:"var(--bg-1)",border:"1px solid var(--border)","border-radius":"8px",padding:"8px","margin-bottom":"6px"}},[c("div",q1,B(o.name),1),c("input",{type:"range",min:"0",max:"2",step:"0.01",value:o.strength,onInput:h=>o.strength=parseFloat(h.target.value),class:"framesync-input",style:{"margin-top":"4px"}},null,40,X1),c("div",j1,B(o.strength.toFixed(2)),1)]))),128)),s.loras.groupB.length===0?(A(),P("div",Y1," No LoRAs in B group ")):s.loras.groupB.length>3?(A(),P("div",K1," +"+B(s.loras.groupB.length-3)+" more ",1)):Le("",!0)])])]))])]),c("div",J1,[c("div",Z1,[c("div",Q1,[e[214]||(e[214]=c("div",{class:"framesync-title"},[Ge("🖼 img2img "),c("span",{class:"framesync-accent"},"(Forge)")],-1)),c("button",{class:"framesync-button",onClick:e[46]||(e[46]=o=>s.img2img.show=!s.img2img.show)},B(s.img2img.show?"▲ Hide":"▼ Show"),1)]),s.img2img.show?(A(),P("div",$1,[e[222]||(e[222]=c("div",{class:"framesync-subtitle",style:{"margin-top":"8px"}},[Ge(" Reference image → "),c("code",null,"/api/img2img"),Ge(" (SD-Forge). Optional "),c("strong",null,"mask"),Ge(" enables inpainting (white = repaint, black = keep). Output under "),c("code",null,"/uploads/"),Ge(". ")],-1)),c("div",eT,[c("div",tT,[e[215]||(e[215]=c("div",{class:"framesync-subtitle"},"Reference image",-1)),c("input",{type:"file",accept:"image/*",onChange:e[47]||(e[47]=(...o)=>t.onImg2imgFile&&t.onImg2imgFile(...o)),class:"framesync-input"},null,32)]),c("div",nT,[e[216]||(e[216]=c("div",{class:"framesync-subtitle"},"Mask image (optional)",-1)),c("input",{type:"file",accept:"image/*",onChange:e[48]||(e[48]=(...o)=>t.onImg2imgMaskFile&&t.onImg2imgMaskFile(...o)),class:"framesync-input"},null,32)])]),c("div",iT,[c("div",sT,[e[217]||(e[217]=c("div",{class:"framesync-subtitle"},"Mask blur",-1)),Me(c("input",{type:"number",class:"framesync-input","onUpdate:modelValue":e[49]||(e[49]=o=>s.img2img.maskBlur=o),min:"0",max:"64"},null,512),[[je,s.img2img.maskBlur,void 0,{number:!0}]])]),c("div",rT,[e[219]||(e[219]=c("div",{class:"framesync-subtitle"},"Inpainting fill",-1)),Me(c("select",{class:"framesync-select","onUpdate:modelValue":e[50]||(e[50]=o=>s.img2img.inpaintingFill=o)},[...e[218]||(e[218]=[c("option",{value:"0"},"Fill",-1),c("option",{value:"1"},"Original",-1),c("option",{value:"2"},"Latent noise",-1),c("option",{value:"3"},"Latent nothing",-1)])],512),[[Pt,s.img2img.inpaintingFill,void 0,{number:!0}]])]),c("div",aT,[e[220]||(e[220]=c("div",{class:"framesync-subtitle"},"Denoising strength",-1)),Me(c("input",{type:"number",class:"framesync-input","onUpdate:modelValue":e[51]||(e[51]=o=>s.img2img.denoisingStrength=o),min:"0",max:"1",step:"0.01"},null,512),[[je,s.img2img.denoisingStrength,void 0,{number:!0}]])])]),c("div",oT,[c("button",{class:"framesync-button",onClick:e[52]||(e[52]=(...o)=>t.runImg2img&&t.runImg2img(...o))},"🚀 Run img2img")]),s.img2img.status?(A(),P("div",lT,B(s.img2img.status),1)):Le("",!0),s.img2img.lastPath?(A(),P("div",cT,[e[221]||(e[221]=Ge(" Output: ",-1)),c("a",{href:s.img2img.lastPath,target:"_blank",style:{color:"var(--warn)"}},B(s.img2img.lastPath),9,uT)])):Le("",!0)])):Le("",!0)])]),c("div",dT,[c("div",fT,[c("div",hT,[e[223]||(e[223]=c("div",{class:"framesync-title"},[Ge("📚 Plugins "),c("span",{class:"framesync-accent"},"Registry")],-1)),c("button",{class:"framesync-button",onClick:e[53]||(e[53]=(...o)=>r.refreshPlugins&&r.refreshPlugins(...o))},"🔄 Refresh")]),s.pluginsRegistry.length?(A(),P("ul",pT,[(A(!0),P(we,null,ze(s.pluginsRegistry,o=>(A(),P("li",{key:o.id||o.name},[Ge(B(o.name||o.id),1),o.description?(A(),P("span",mT," — "+B(o.description),1)):Le("",!0)]))),128))])):Le("",!0)])])])):s.currentSubTab.PROMPTS==="LORA"?(A(),P("div",gT,[c("div",_T,[c("div",vT,[c("div",yT,[e[224]||(e[224]=c("div",{class:"framesync-title"},[Ge("📚 LoRA "),c("span",{class:"framesync-accent"},"Browser")],-1)),c("div",xT,[s.loras.source?(A(),P("span",ST,[s.loras.source==="sd-forge"?(A(),P("span",bT,"● Forge")):s.loras.source==="cache"?(A(),P("span",MT,"● Cache")):s.loras.source==="placeholder"?(A(),P("span",TT,"● Placeholder")):(A(),P("span",ET,"● "+B(s.loras.source),1))])):Le("",!0),c("button",{class:"framesync-button",onClick:e[54]||(e[54]=(...o)=>r.refreshLoras&&r.refreshLoras(...o))},"🔄 Refresh")])]),c("div",wT,[(A(!0),P(we,null,ze(s.loras.available,o=>(A(),P("div",{key:o.id,style:{background:"var(--bg-1)",border:"1px solid var(--border)","border-radius":"10px",overflow:"hidden",cursor:"pointer"},onClick:h=>r.toggleLoraSelection(o)},[c("div",PT,[o.thumbnail?(A(),P("img",{key:0,src:o.thumbnail,style:{width:"100%",height:"100%","object-fit":"cover"},alt:o.name},null,8,CT)):(A(),P("div",RT,[(A(),P("svg",IT,[...e[225]||(e[225]=[c("rect",{x:"3",y:"3",width:"18",height:"18",stroke:"currentColor","stroke-width":"2",rx:"2"},null,-1),c("circle",{cx:"8",cy:"8",r:"2",fill:"currentColor"},null,-1),c("path",{d:"M3 15 L8 10 L12 14 L17 9 L21 13 V21 H3 Z",fill:"currentColor",opacity:"0.5"},null,-1)])]))])),o.selected?(A(),P("div",LT," ✓ "+B(o.group),1)):Le("",!0)]),c("div",DT,[c("div",NT,B(o.name),1),c("div",UT,B(o.path),1),c("div",FT,[e[226]||(e[226]=c("div",{class:"framesync-subtitle"},"Strength",-1)),c("input",{type:"range",min:"0",max:"2",step:"0.01",value:o.strength,onInput:h=>o.strength=parseFloat(h.target.value),class:"framesync-input"},null,40,kT),c("div",OT,B(o.strength.toFixed(2)),1)]),c("div",BT,[c("button",{class:Be(["framesync-button",{active:o.group==="A"}]),onClick:cn(h=>r.assignLoraToGroup(o,"A"),["stop"])},"A",10,VT),c("button",{class:Be(["framesync-button",{active:o.group==="B"}]),onClick:cn(h=>r.assignLoraToGroup(o,"B"),["stop"])},"B",10,zT),o.group?(A(),P("button",{key:0,class:"framesync-button",onClick:cn(h=>t.unassignLora(o),["stop"])},"✕",8,GT)):Le("",!0)])])],8,AT))),128))]),s.loras.available.length===0?(A(),P("div",HT," No LoRA models found. Refresh or check SD-Forge connection. ")):Le("",!0)])]),c("div",WT,[c("div",qT,[e[227]||(e[227]=c("div",{class:"framesync-header"},[c("div",{class:"framesync-title"},[Ge("🎛 Active "),c("span",{class:"framesync-accent"},"LoRAs")])],-1)),c("div",XT,[c("div",null,[c("div",jT,"A GROUP ("+B(s.loras.groupA.length)+")",1),c("div",YT,[(A(!0),P(we,null,ze(s.loras.groupA,o=>(A(),P("div",{key:o.id,style:{display:"flex","justify-content":"space-between","align-items":"center",padding:"6px 0","border-bottom":"1px solid var(--border)"}},[c("span",KT,B(o.name),1),c("span",JT,B(o.strength.toFixed(2)),1)]))),128)),s.loras.groupA.length===0?(A(),P("div",ZT," No LoRAs in A group ")):Le("",!0)])]),c("div",null,[c("div",QT,"B GROUP ("+B(s.loras.groupB.length)+")",1),c("div",$T,[(A(!0),P(we,null,ze(s.loras.groupB,o=>(A(),P("div",{key:o.id,style:{display:"flex","justify-content":"space-between","align-items":"center",padding:"6px 0","border-bottom":"1px solid var(--border)"}},[c("span",eE,B(o.name),1),c("span",tE,B(o.strength.toFixed(2)),1)]))),128)),s.loras.groupB.length===0?(A(),P("div",nE," No LoRAs in B group ")):Le("",!0)])])]),c("div",iE,[c("button",{class:"framesync-button",onClick:e[55]||(e[55]=(...o)=>r.applyLoras&&r.applyLoras(...o))},"✓ Apply LoRAs"),c("button",{class:"framesync-button",onClick:e[56]||(e[56]=(...o)=>t.exportLoraPreset&&t.exportLoraPreset(...o))},"💾 Export preset")])])])])):s.currentSubTab.PROMPTS==="CONTROLNET"?(A(),P("div",sE,[c("div",rE,[c("div",aE,[c("div",oE,[e[228]||(e[228]=c("div",{class:"framesync-title"},[Ge("🎯 ControlNet "),c("span",{class:"framesync-accent"},"Slots")],-1)),c("div",lE,[s.cn.source?(A(),P("span",cE,[s.cn.source==="sd-forge"?(A(),P("span",uE,"● Forge")):s.cn.source==="cache"?(A(),P("span",dE,"● Cache")):s.cn.source==="placeholder"?(A(),P("span",fE,"● Placeholder")):(A(),P("span",hE,"● "+B(s.cn.source),1))])):Le("",!0),c("button",{class:"framesync-button",onClick:e[57]||(e[57]=(...o)=>r.loadControlNetModels&&r.loadControlNetModels(...o))},"🔄 Refresh")])]),c("div",pE,[(A(!0),P(we,null,ze(s.cn.slots,o=>(A(),P("button",{class:Be(["framesync-button",{active:s.cn.active===o.id}]),key:o.id,onClick:h=>s.cn.active=o.id},B(o.label),11,mE))),128))])])]),c("div",gE,[c("div",_E,[c("div",vE,[c("div",yE,[e[229]||(e[229]=Ge("⚙️ ",-1)),c("span",xE,B(r.activeSlot.label),1),e[230]||(e[230]=Ge(" Settings",-1))])]),c("div",SE,[e[231]||(e[231]=c("div",{class:"framesync-subtitle"},"Model",-1)),Me(c("select",{class:"framesync-select","onUpdate:modelValue":e[58]||(e[58]=o=>r.activeSlot.model=o),onChange:e[59]||(e[59]=o=>r.updateControlNet(r.activeSlot))},[(A(!0),P(we,null,ze(s.cn.availableModels,o=>(A(),P("option",{key:o.id,value:o.name},B(o.name),9,bE))),128))],544),[[Pt,r.activeSlot.model]])]),c("div",ME,[e[232]||(e[232]=c("div",{class:"framesync-subtitle"},"Image source",-1)),c("div",TE,[c("button",{type:"button",class:Be(["framesync-button",{active:r.activeSlot.imageSource==="file"}]),onClick:e[60]||(e[60]=o=>r.activeSlot.imageSource="file")},"📁 File",2),c("button",{type:"button",class:Be(["framesync-button",{active:r.activeSlot.imageSource==="webcam"}]),onClick:e[61]||(e[61]=o=>r.activeSlot.imageSource="webcam")},"📷 Webcam",2),c("button",{type:"button",class:Be(["framesync-button",{active:r.activeSlot.imageSource==="screen"}]),onClick:e[62]||(e[62]=o=>r.activeSlot.imageSource="screen")},"🖥️ Screen",2)]),c("input",{ref:"cnImageInput",type:"file",accept:"image/*",style:{display:"none"},onChange:e[63]||(e[63]=(...o)=>r.onControlNetFileSelected&&r.onControlNetFileSelected(...o))},null,544)]),r.activeSlot.imageSource==="webcam"?(A(),P("div",EE,[e[234]||(e[234]=c("div",{class:"framesync-subtitle"},"Webcam input",-1)),c("video",wE,null,512),c("canvas",AE,null,512),c("div",PE,[c("button",{type:"button",class:Be(["framesync-button",{active:s.cn.webcamActive}]),onClick:e[64]||(e[64]=(...o)=>r.toggleWebcam&&r.toggleWebcam(...o))},B(s.cn.webcamActive?"⏹ Stop":"▶ Start")+" Webcam",3),Me(c("select",{class:"framesync-input","onUpdate:modelValue":e[65]||(e[65]=o=>s.webcamCaptureRate=o),style:{"max-width":"120px","font-size":"11px"}},[...e[233]||(e[233]=[c("option",{value:1e3},"1 fps",-1),c("option",{value:500},"2 fps",-1),c("option",{value:200},"5 fps",-1),c("option",{value:100},"10 fps",-1)])],512),[[Pt,s.webcamCaptureRate,void 0,{number:!0}]])])])):Le("",!0),r.activeSlot.imageSource==="screen"?(A(),P("div",CE,[e[235]||(e[235]=c("div",{class:"framesync-subtitle"},"Screen capture",-1)),c("button",{type:"button",class:"framesync-button",onClick:e[66]||(e[66]=(...o)=>r.startScreenCapture&&r.startScreenCapture(...o))},"🖥️ Start screen capture")])):Le("",!0),c("div",RE,[c("button",{type:"button",class:"framesync-button",onClick:e[67]||(e[67]=o=>r.uploadControlNetImage(r.activeSlot))},"📁 Upload image"),c("button",{type:"button",class:Be(["framesync-button",{active:r.activeSlot.enabled}]),onClick:e[68]||(e[68]=o=>{r.activeSlot.enabled=!r.activeSlot.enabled,r.updateControlNet(r.activeSlot)})},B(r.activeSlot.enabled?"Enabled":"Disabled"),3)]),c("div",IE,[c("div",LE,[e[236]||(e[236]=c("div",{class:"framesync-subtitle"},"Weight",-1)),c("span",DE,B(r.activeSlot.weight.toFixed(2)),1)]),Me(c("input",{type:"range",min:"0",max:"2",step:"0.01","onUpdate:modelValue":e[69]||(e[69]=o=>r.activeSlot.weight=o),onInput:e[70]||(e[70]=o=>r.updateControlNet(r.activeSlot)),class:"framesync-input"},null,544),[[je,r.activeSlot.weight,void 0,{number:!0}]])]),c("div",NE,[c("div",UE,[e[237]||(e[237]=c("div",{class:"framesync-subtitle"},"Start step",-1)),c("span",FE,B(r.activeSlot.start.toFixed(2)),1)]),Me(c("input",{type:"range",min:"0",max:"1",step:"0.01","onUpdate:modelValue":e[71]||(e[71]=o=>r.activeSlot.start=o),onInput:e[72]||(e[72]=o=>r.updateControlNet(r.activeSlot)),class:"framesync-input"},null,544),[[je,r.activeSlot.start,void 0,{number:!0}]])]),c("div",kE,[c("div",OE,[e[238]||(e[238]=c("div",{class:"framesync-subtitle"},"End step",-1)),c("span",BE,B(r.activeSlot.end.toFixed(2)),1)]),Me(c("input",{type:"range",min:"0",max:"1",step:"0.01","onUpdate:modelValue":e[73]||(e[73]=o=>r.activeSlot.end=o),onInput:e[74]||(e[74]=o=>r.updateControlNet(r.activeSlot)),class:"framesync-input"},null,544),[[je,r.activeSlot.end,void 0,{number:!0}]])])])])])):Le("",!0)])):s.currentTab==="MOTION"?(A(),P("div",VE,[c("div",zE,[c("div",GE,[e[239]||(e[239]=c("div",{class:"framesync-header"},[c("div",{class:"framesync-title"},[Ge("📐 Motion "),c("span",{class:"framesync-accent"},"Presets")])],-1)),c("div",HE,[(A(!0),P(we,null,ze(Object.keys(s.motionPresets),o=>(A(),P("button",{class:"framesync-button",key:o,onClick:h=>r.sendPreset(o)},B(o),9,WE))),128))])])]),c("div",qE,[c("div",XE,[e[240]||(e[240]=c("div",{class:"framesync-header"},[c("div",{class:"framesync-title"},[Ge("🎮 XY "),c("span",{class:"framesync-accent"},"Pad")]),c("span",{style:{"font-size":"10px",color:"var(--text-dim)"}},"Pan X / Pan Y")],-1)),c("div",{class:"xy-pad",style:hn({width:s.xyPad.padSize+"px",height:s.xyPad.padSize+"px"}),onMousedown:e[75]||(e[75]=(...o)=>r.xyPadMouseDown&&r.xyPadMouseDown(...o)),onMousemove:e[76]||(e[76]=(...o)=>r.xyPadMouseMove&&r.xyPadMouseMove(...o)),onMouseup:e[77]||(e[77]=(...o)=>r.xyPadMouseUp&&r.xyPadMouseUp(...o)),onMouseleave:e[78]||(e[78]=(...o)=>r.xyPadMouseUp&&r.xyPadMouseUp(...o)),onTouchstart:e[79]||(e[79]=cn((...o)=>r.xyPadMouseDown&&r.xyPadMouseDown(...o),["prevent"])),onTouchmove:e[80]||(e[80]=cn((...o)=>r.xyPadMouseMove&&r.xyPadMouseMove(...o),["prevent"])),onTouchend:e[81]||(e[81]=cn((...o)=>r.xyPadMouseUp&&r.xyPadMouseUp(...o),["prevent"]))},[c("div",{class:"xy-dot framesync",style:hn({left:s.xyPad.x-6+"px",top:s.xyPad.y-6+"px"})},null,4)],36)])])])):s.currentTab==="MODULATION"?(A(),P("div",jE,[c("div",YE,[c("div",KE,[c("div",JE,[e[241]||(e[241]=c("div",{class:"framesync-title"},[Ge("🌊 LFO "),c("span",{class:"framesync-accent"},"Modulators")],-1)),c("div",ZE,[c("button",{class:Be(["framesync-button",{active:s.lfoOn}]),onClick:e[82]||(e[82]=o=>s.lfoOn=!s.lfoOn)},B(s.lfoOn?"ON":"OFF"),3),c("button",{class:"framesync-button",onClick:e[83]||(e[83]=(...o)=>t.resetLfos&&t.resetLfos(...o))},"↺ Reset")])]),c("div",QE,[(A(!0),P(we,null,ze(s.lfos,o=>(A(),P("div",{class:"lfo-card",key:"lfo-"+o.id},[c("div",$E,[c("label",ew,[Me(c("input",{type:"checkbox","onUpdate:modelValue":h=>o.on=h},null,8,tw),[[xi,o.on]]),Ge(" LFO "+B(o.id),1)]),Bt(m,{shape:o.shape,depth:o.depth,active:o.on,width:160,height:40,class:"lfo-waveform"},null,8,["shape","depth","active"])]),c("div",nw,[c("div",null,[e[242]||(e[242]=c("div",{class:"framesync-subtitle"},"Shape",-1)),Me(c("select",{class:"framesync-select","onUpdate:modelValue":h=>o.shape=h},[(A(!0),P(we,null,ze(s.lfoShapes,h=>(A(),P("option",{key:h,value:h},B(h),9,sw))),128))],8,iw),[[Pt,o.shape]])]),c("div",null,[e[243]||(e[243]=c("div",{class:"framesync-subtitle"},"BPM",-1)),Me(c("input",{type:"number",class:"framesync-input","onUpdate:modelValue":h=>o.bpm=h,min:"20",max:"300"},null,8,rw),[[je,o.bpm,void 0,{number:!0}]])]),c("div",null,[e[244]||(e[244]=c("div",{class:"framesync-subtitle"},"Speed",-1)),Me(c("input",{type:"number",class:"framesync-input","onUpdate:modelValue":h=>o.speed=h,min:"0.1",max:"10",step:"0.1"},null,8,aw),[[je,o.speed,void 0,{number:!0}]])]),c("div",null,[e[245]||(e[245]=c("div",{class:"framesync-subtitle"},"Depth",-1)),Me(c("input",{type:"number",class:"framesync-input","onUpdate:modelValue":h=>o.depth=h,min:"0",max:"1",step:"0.01"},null,8,ow),[[je,o.depth,void 0,{number:!0}]])])]),c("div",lw,[e[246]||(e[246]=c("div",{class:"framesync-subtitle"},"Targets",-1)),c("div",cw,[(A(!0),P(we,null,ze(s.lfoTargets,h=>(A(),vr(p,{key:"tc-"+o.id+h.key,label:h.label,"param-key":h.key,selected:o.targets.includes(h.key),owners:r.targetOwners[h.key]||[],onToggle:y=>t.toggleLfoTarget(o,h.key)},null,8,["label","param-key","selected","owners","onToggle"]))),128))])])]))),128))])])]),c("div",uw,[c("div",dw,[c("div",fw,[e[247]||(e[247]=c("div",{class:"framesync-title"},[Ge("🥁 Beat "),c("span",{class:"framesync-accent"},"Macros")],-1)),c("div",hw,[c("button",{class:Be(["framesync-button",{active:s.beatMacroOn}]),onClick:e[84]||(e[84]=o=>s.beatMacroOn=!s.beatMacroOn)},B(s.beatMacroOn?"ON":"OFF"),3)])]),c("div",pw,[(A(!0),P(we,null,ze(s.macrosRack,(o,h)=>(A(),P("div",{class:"lfo-card",key:"mac"+h},[c("div",mw,[c("label",gw,[Me(c("input",{type:"checkbox","onUpdate:modelValue":y=>o.on=y},null,8,_w),[[xi,o.on]]),Ge(" Macro "+B(h+1),1)]),Bt(m,{shape:o.shape,depth:o.depth,active:o.on,width:100,height:36,class:"lfo-waveform"},null,8,["shape","depth","active"])]),c("div",vw,[c("div",null,[e[249]||(e[249]=c("div",{class:"framesync-subtitle"},"Target",-1)),Me(c("select",{class:"framesync-select","onUpdate:modelValue":y=>o.target=y},[e[248]||(e[248]=c("option",{value:""},"None",-1)),(A(!0),P(we,null,ze(s.lfoTargets,y=>(A(),P("option",{key:"mac"+y.key,value:y.key},B(y.label),9,xw))),128))],8,yw),[[Pt,o.target]])]),c("div",null,[e[250]||(e[250]=c("div",{class:"framesync-subtitle"},"Shape",-1)),Me(c("select",{class:"framesync-select","onUpdate:modelValue":y=>o.shape=y},[(A(!0),P(we,null,ze([...s.lfoShapes,"Noise"],y=>(A(),P("option",{key:y,value:y},B(y),9,bw))),128))],8,Sw),[[Pt,o.shape]])]),c("div",null,[e[251]||(e[251]=c("div",{class:"framesync-subtitle"},"BPM",-1)),Me(c("input",{type:"number",class:"framesync-input","onUpdate:modelValue":y=>o.bpm=y,min:"20",max:"300",style:{"font-size":"11px",padding:"4px"}},null,8,Mw),[[je,o.bpm,void 0,{number:!0}]])]),c("div",null,[e[252]||(e[252]=c("div",{class:"framesync-subtitle"},"Depth",-1)),Me(c("input",{type:"number",class:"framesync-input","onUpdate:modelValue":y=>o.depth=y,min:"0",max:"1",step:"0.01",style:{"font-size":"11px",padding:"4px"}},null,8,Tw),[[je,o.depth,void 0,{number:!0}]])])])]))),128)),s.macrosRack.length<6?(A(),P("button",{key:0,class:"framesync-button",onClick:e[85]||(e[85]=(...o)=>r.addMacro&&r.addMacro(...o))},"➕ Add Macro")):Le("",!0)])])])])):s.currentTab==="AUDIO"?(A(),P("div",Ew,[c("div",ww,[c("div",Aw,[c("div",Pw,[e[253]||(e[253]=c("div",{class:"framesync-title"},[Ge("🔊 Reference "),c("span",{class:"framesync-accent"},"A/V sync")],-1)),c("button",{class:"framesync-button",onClick:e[86]||(e[86]=o=>s.avSyncCollapsed=!s.avSyncCollapsed)},B(s.avSyncCollapsed?"▼ Show":"▲ Hide"),1)]),s.avSyncCollapsed?Le("",!0):(A(),P("div",Cw,[e[258]||(e[258]=c("div",{class:"framesync-subtitle",style:{"margin-top":"8px"}},[Ge(" Play the same track you use for modulation, locked to the HLS clock. If the music feels "),c("em",null,"ahead"),Ge(" of the pictures (normal for live HLS + encoder delay), raise "),c("strong",null,"Video lead"),Ge(" until it lines up. ")],-1)),c("div",Rw,[c("div",Iw,[e[254]||(e[254]=c("div",{class:"framesync-subtitle"},"Upload track",-1)),c("input",{type:"file",accept:"audio/*",ref:"audioFileInput",onChange:e[87]||(e[87]=(...o)=>t.onAudioUpload&&t.onAudioUpload(...o)),class:"framesync-input"},null,544)]),c("div",Lw,[e[256]||(e[256]=c("div",{class:"framesync-subtitle"},"Video lead (sec)",-1)),c("label",Dw,[Me(c("input",{type:"checkbox","data-testid":"av-sync-enable","onUpdate:modelValue":e[88]||(e[88]=o=>s.avSyncEnabled=o),disabled:!s.audio.objectUrl},null,8,Nw),[[xi,s.avSyncEnabled]]),e[255]||(e[255]=Ge(" Enable sync (needs uploaded audio) ",-1))]),Me(c("input",{type:"number","data-testid":"av-sync-lead",class:"framesync-input","onUpdate:modelValue":e[89]||(e[89]=o=>s.avSyncLeadSec=o),min:"0",max:"120",step:"0.25",style:{"max-width":"120px"}},null,512),[[je,s.avSyncLeadSec,void 0,{number:!0}]]),e[257]||(e[257]=c("div",{class:"framesync-subtitle",style:{"margin-top":"4px","font-size":"10px"}},"≈ encoder buffer + HLS fragments (often 2–10s).",-1))])])]))])]),c("div",Uw,[c("div",Fw,[c("div",kw,[e[259]||(e[259]=c("div",{class:"framesync-title"},[Ge("🎵 Audio "),c("span",{class:"framesync-accent"},"Reactive")],-1)),c("button",{class:"framesync-button",onClick:e[90]||(e[90]=(...o)=>t.startAudioStream&&t.startAudioStream(...o))},B(s.audioStatus==="Streaming"?"⏹ Stop":"▶ Start"),1)]),e[263]||(e[263]=c("div",{class:"framesync-subtitle",style:{"margin-top":"8px"}}," Map frequency bands to parameters. Live audio from mic/system → frequency analysis → parameter modulation. ",-1)),c("div",Ow,[(A(!0),P(we,null,ze(s.audioMappings,(o,h)=>(A(),P("div",{class:"audio-map-card",key:"amap-"+h},[c("div",Bw,[c("div",Vw,B(o.param||"unassigned"),1),c("button",{class:"framesync-button",style:{padding:"2px 6px","font-size":"9px"},onClick:y=>s.audioMappings.splice(h,1)},"✕",8,zw)]),c("div",Gw,[e[260]||(e[260]=c("div",{class:"framesync-subtitle"},"Freq range",-1)),c("div",Hw,[Me(c("input",{type:"number",class:"framesync-input","onUpdate:modelValue":y=>o.freq_min=y,min:"20",max:"20000",style:{"font-size":"10px",padding:"4px"}},null,8,Ww),[[je,o.freq_min,void 0,{number:!0}]]),Me(c("input",{type:"number",class:"framesync-input","onUpdate:modelValue":y=>o.freq_max=y,min:"20",max:"20000",style:{"font-size":"10px",padding:"4px"}},null,8,qw),[[je,o.freq_max,void 0,{number:!0}]])]),e[261]||(e[261]=c("div",{class:"framesync-subtitle"},"Output range",-1)),c("div",Xw,[Me(c("input",{type:"number",class:"framesync-input","onUpdate:modelValue":y=>o.out_min=y,step:"any",style:{"font-size":"10px",padding:"4px"}},null,8,jw),[[je,o.out_min,void 0,{number:!0}]]),Me(c("input",{type:"number",class:"framesync-input","onUpdate:modelValue":y=>o.out_max=y,step:"any",style:{"font-size":"10px",padding:"4px"}},null,8,Yw),[[je,o.out_max,void 0,{number:!0}]])])])]))),128)),c("button",{class:"framesync-button",onClick:e[91]||(e[91]=o=>s.audioMappings.push({param:"",freq_min:20,freq_max:200,out_min:0,out_max:1}))},"+ Add mapping")]),c("div",Kw,[e[262]||(e[262]=c("div",{class:"framesync-subtitle"},"Quick band presets",-1)),c("div",Jw,[(A(!0),P(we,null,ze(r.audioBandChips,o=>(A(),P("button",{class:"framesync-button",key:o.key,onClick:h=>r.applyAudioBandPreset(o),style:{padding:"2px 6px","font-size":"9px"}},B(o.label),9,Zw))),128))])])])])])):s.currentTab==="RUNS"?(A(),P("div",Qw,[c("div",$w,[c("div",eA,[c("div",tA,[e[264]||(e[264]=c("div",{class:"framesync-title"},[Ge("📁 Runs "),c("span",{class:"framesync-accent"},"Browser")],-1)),c("div",nA,[c("span",iA,B(s.runsFiltered.length)+" / "+B(s.runsAll.length),1),c("button",{class:"framesync-button",onClick:e[92]||(e[92]=(...o)=>r.refreshRuns&&r.refreshRuns(...o))},"🔄 Refresh")])]),c("div",sA,[Me(c("input",{type:"text",class:"framesync-input","onUpdate:modelValue":e[93]||(e[93]=o=>s.runsFilter.search=o),placeholder:"Search (id, tag, model, prompt, notes)",onInput:e[94]||(e[94]=(...o)=>r.applyRunsFilters&&r.applyRunsFilters(...o))},null,544),[[je,s.runsFilter.search,void 0,{trim:!0}]]),Me(c("select",{class:"framesync-select","onUpdate:modelValue":e[95]||(e[95]=o=>s.runsFilter.status=o),onChange:e[96]||(e[96]=(...o)=>r.applyRunsFilters&&r.applyRunsFilters(...o))},[...e[265]||(e[265]=[yi('<option value="">All Status</option><option value="completed">Completed</option><option value="failed">Failed</option><option value="running">Running</option><option value="queued">Queued</option>',5)])],544),[[Pt,s.runsFilter.status]]),Me(c("input",{type:"text",class:"framesync-input","onUpdate:modelValue":e[97]||(e[97]=o=>s.runsFilter.tag=o),placeholder:"Filter by tag",onInput:e[98]||(e[98]=(...o)=>r.applyRunsFilters&&r.applyRunsFilters(...o))},null,544),[[je,s.runsFilter.tag,void 0,{trim:!0}]]),Me(c("input",{type:"text",class:"framesync-input","onUpdate:modelValue":e[99]||(e[99]=o=>s.runsFilter.model=o),placeholder:"Filter by model",onInput:e[100]||(e[100]=(...o)=>r.applyRunsFilters&&r.applyRunsFilters(...o))},null,544),[[je,s.runsFilter.model,void 0,{trim:!0}]])]),c("div",rA,[e[267]||(e[267]=c("span",{style:{"font-size":"11px",color:"var(--text-dim)"}},"Sort:",-1)),Me(c("select",{class:"framesync-select","onUpdate:modelValue":e[101]||(e[101]=o=>s.runsSort.field=o),onChange:e[102]||(e[102]=(...o)=>r.applyRunsFilters&&r.applyRunsFilters(...o)),style:{"max-width":"140px"}},[...e[266]||(e[266]=[yi('<option value="started_at">Date</option><option value="run_id">Run ID</option><option value="model">Model</option><option value="frame_count">Frames</option><option value="status">Status</option><option value="tag">Tag</option>',6)])],544),[[Pt,s.runsSort.field]]),c("button",{class:"framesync-button",onClick:e[103]||(e[103]=o=>{s.runsSort.order=s.runsSort.order==="desc"?"asc":"desc",r.applyRunsFilters()}),style:{padding:"4px 10px"}},B(s.runsSort.order==="desc"?"↓ Desc":"↑ Asc"),1),e[268]||(e[268]=c("div",{style:{flex:"1"}},null,-1)),c("button",{class:"framesync-button",onClick:e[104]||(e[104]=o=>r.exportRuns("json")),style:{padding:"4px 10px"}},"📥 JSON"),c("button",{class:"framesync-button",onClick:e[105]||(e[105]=o=>r.exportRuns("csv")),style:{padding:"4px 10px"}},"📥 CSV")]),c("div",aA,[c("table",oA,[e[270]||(e[270]=c("thead",{style:{position:"sticky",top:"0",background:"var(--bg-1)","z-index":"1"}},[c("tr",{style:{"border-bottom":"1px solid var(--border)"}},[c("th",{style:{padding:"8px","text-align":"left",color:"var(--text-dim)","font-weight":"600"}},"Thumb"),c("th",{style:{padding:"8px","text-align":"left",color:"var(--text-dim)","font-weight":"600"}},"Run ID"),c("th",{style:{padding:"8px","text-align":"left",color:"var(--text-dim)","font-weight":"600"}},"Status"),c("th",{style:{padding:"8px","text-align":"left",color:"var(--text-dim)","font-weight":"600"}},"Model"),c("th",{style:{padding:"8px","text-align":"left",color:"var(--text-dim)","font-weight":"600"}},"Frames"),c("th",{style:{padding:"8px","text-align":"left",color:"var(--text-dim)","font-weight":"600"}},"Seed"),c("th",{style:{padding:"8px","text-align":"left",color:"var(--text-dim)","font-weight":"600"}},"Tag"),c("th",{style:{padding:"8px","text-align":"left",color:"var(--text-dim)","font-weight":"600"}},"Date"),c("th",{style:{padding:"8px","text-align":"left",color:"var(--text-dim)","font-weight":"600"}},"Actions")])],-1)),c("tbody",null,[(A(!0),P(we,null,ze(s.runsFiltered,o=>(A(),P("tr",{key:o.run_id,style:{"border-bottom":"1px solid var(--border)"},class:Be({"runs-row-selected":s.runsSelected.includes(o.run_id)}),onClick:h=>r.toggleRunSelect(o.run_id)},[c("td",cA,[o.has_thumbnail?(A(),P("img",{key:0,src:`/api/runs/${o.run_id}/thumb`,style:{width:"48px",height:"48px","object-fit":"cover","border-radius":"4px"},alt:""},null,8,uA)):(A(),P("div",dA,"No img"))]),c("td",fA,B(o.run_id),1),c("td",hA,[c("span",{class:Be(["status-chip","status-"+o.status])},B(o.status),3)]),c("td",pA,B(o.model||"-"),1),c("td",mA,B(o.frame_count||o.length_frames||"-"),1),c("td",gA,B(o.seed||"-"),1),c("td",_A,B(o.tag||"-"),1),c("td",vA,B(r.formatDate(o.started_at)),1),c("td",yA,[c("button",{class:"framesync-button",style:{padding:"2px 6px","font-size":"9px"},onClick:cn(h=>r.showRunDetails(o),["stop"]),title:"Details"},"👁",8,xA),c("button",{class:"framesync-button",style:{padding:"2px 6px","font-size":"9px"},onClick:cn(h=>r.rerunRun(o),["stop"]),title:"Rerun"},"🔄",8,SA),c("button",{class:"framesync-button",style:{padding:"2px 6px","font-size":"9px"},onClick:cn(h=>r.deleteRun(o),["stop"]),title:"Delete"},"🗑",8,bA)])],10,lA))),128)),s.runsFiltered.length===0?(A(),P("tr",MA,[...e[269]||(e[269]=[c("td",{colspan:"9",style:{padding:"20px","text-align":"center",color:"var(--text-dim)","font-size":"12px"}}," No runs found. Adjust filters or refresh. ",-1)])])):Le("",!0)])])])])]),s.runsDetailView?(A(),P("div",TA,[c("div",EA,[c("div",wA,[e[271]||(e[271]=Ge("📋 Run Details: ",-1)),c("span",AA,B(s.runsDetailView.run_id),1)]),c("button",{class:"framesync-button",onClick:e[106]||(e[106]=o=>s.runsDetailView=null)},"✕ Close")]),c("div",PA,[c("div",null,[e[272]||(e[272]=c("div",{class:"framesync-subtitle"},"Status",-1)),c("span",{class:Be(["status-chip","status-"+s.runsDetailView.status])},B(s.runsDetailView.status),3)]),c("div",null,[e[273]||(e[273]=c("div",{class:"framesync-subtitle"},"Model",-1)),c("div",null,B(s.runsDetailView.model||"-"),1)]),c("div",null,[e[274]||(e[274]=c("div",{class:"framesync-subtitle"},"Frames",-1)),c("div",null,B(s.runsDetailView.frame_count||s.runsDetailView.length_frames||"-"),1)]),c("div",null,[e[275]||(e[275]=c("div",{class:"framesync-subtitle"},"Seed",-1)),c("div",CA,B(s.runsDetailView.seed||"-"),1)]),c("div",null,[e[276]||(e[276]=c("div",{class:"framesync-subtitle"},"Steps",-1)),c("div",null,B(s.runsDetailView.steps||"-"),1)]),c("div",null,[e[277]||(e[277]=c("div",{class:"framesync-subtitle"},"Strength",-1)),c("div",null,B(s.runsDetailView.strength||"-"),1)]),c("div",null,[e[278]||(e[278]=c("div",{class:"framesync-subtitle"},"CFG",-1)),c("div",null,B(s.runsDetailView.cfg||"-"),1)]),c("div",null,[e[279]||(e[279]=c("div",{class:"framesync-subtitle"},"Tag",-1)),c("div",null,B(s.runsDetailView.tag||"-"),1)]),c("div",RA,[e[280]||(e[280]=c("div",{class:"framesync-subtitle"},"Positive Prompt",-1)),c("div",IA,B(s.runsDetailView.prompt_positive||"-"),1)]),c("div",LA,[e[281]||(e[281]=c("div",{class:"framesync-subtitle"},"Negative Prompt",-1)),c("div",DA,B(s.runsDetailView.prompt_negative||"-"),1)]),c("div",NA,[e[282]||(e[282]=c("div",{class:"framesync-subtitle"},"Notes",-1)),Me(c("textarea",{class:"framesync-input","onUpdate:modelValue":e[107]||(e[107]=o=>s.runsDetailView.notes=o),style:{"min-height":"60px","font-size":"10px"},placeholder:"Add notes..."},null,512),[[je,s.runsDetailView.notes]]),c("button",{class:"framesync-button",style:{"margin-top":"6px",padding:"4px 12px"},onClick:e[108]||(e[108]=o=>r.saveRunNotes(s.runsDetailView))},"💾 Save Notes")])]),s.runsDetailView.frames&&s.runsDetailView.frames.length?(A(),P("div",UA,[c("div",FA,"Frames ("+B(s.runsDetailView.frames.length)+")",1),c("div",kA,[(A(!0),P(we,null,ze(s.runsDetailView.frames.slice(0,50),o=>(A(),P("img",{key:o,src:`/api/runs/${s.runsDetailView.run_id}/frames/${o}`,style:{width:"64px",height:"64px","object-fit":"cover","border-radius":"4px",border:"1px solid var(--border)"},alt:o},null,8,OA))),128))])])):Le("",!0)])):Le("",!0),s.runsSelected.length>=2?(A(),P("div",BA,[c("div",VA,[c("div",zA,"⚖️ Compare Runs ("+B(s.runsSelected.length)+")",1),c("div",GA,[c("button",{class:"framesync-button",style:{padding:"4px 10px","font-size":"10px"},onClick:e[109]||(e[109]=o=>r.exportRunComparison("json"))},"📥 JSON"),c("button",{class:"framesync-button",style:{padding:"4px 10px","font-size":"10px"},onClick:e[110]||(e[110]=o=>r.exportRunComparison("csv"))},"📥 CSV"),c("button",{class:"framesync-button",onClick:e[111]||(e[111]=o=>s.runsSelected=[])},"✕ Clear")])]),c("div",HA,[c("table",WA,[c("thead",null,[c("tr",qA,[e[283]||(e[283]=c("th",{style:{padding:"6px","text-align":"left",color:"var(--text-dim)"}},"Property",-1)),(A(!0),P(we,null,ze(s.runsSelected,o=>(A(),P("th",{key:o,style:{padding:"6px","text-align":"left",color:"var(--text-dim)","font-family":"monospace"}},B(o),1))),128))])]),c("tbody",null,[(A(!0),P(we,null,ze(s.runsCompareFields,o=>(A(),P("tr",{key:o,style:{"border-bottom":"1px solid var(--border)"}},[c("td",XA,B(o),1),(A(!0),P(we,null,ze(s.runsSelected,h=>(A(),P("td",{key:h,style:{padding:"4px","font-family":"monospace"}},B(r.getRunProp(h,o)),1))),128))]))),128))])])])])):Le("",!0)])):s.currentTab==="SETTINGS"?(A(),P("div",jA,[c("div",YA,[c("button",{class:Be(["sub-pill",{active:s.currentSubTab.SETTINGS==="ENGINE"}]),onClick:e[112]||(e[112]=o=>r.switchSubTab("SETTINGS","ENGINE"))},"ENGINE",2),c("button",{class:Be(["sub-pill",{active:s.currentSubTab.SETTINGS==="MIDI"}]),onClick:e[113]||(e[113]=o=>r.switchSubTab("SETTINGS","MIDI"))},"MIDI",2),c("button",{class:Be(["sub-pill",{active:s.currentSubTab.SETTINGS==="BINDINGS"}]),onClick:e[114]||(e[114]=o=>r.switchSubTab("SETTINGS","BINDINGS"))},"🔗 BINDINGS",2),c("button",{class:Be(["sub-pill",{active:s.currentSubTab.SETTINGS==="PRESETS"}]),onClick:e[115]||(e[115]=o=>r.switchSubTab("SETTINGS","PRESETS"))},"PRESETS",2),c("button",{class:Be(["sub-pill",{active:s.currentSubTab.SETTINGS==="GPUS"}]),onClick:e[116]||(e[116]=o=>r.switchSubTab("SETTINGS","GPUS"))},"🖥️ GPUS",2),c("button",{class:Be(["sub-pill",{active:s.currentSubTab.SETTINGS==="COLLAB"}]),onClick:e[117]||(e[117]=o=>r.switchSubTab("SETTINGS","COLLAB"))},"👥 COLLAB",2),c("button",{class:Be(["sub-pill",{active:s.currentSubTab.SETTINGS==="KEYS"}]),onClick:e[118]||(e[118]=o=>r.switchSubTab("SETTINGS","KEYS"))},"⌨️ KEYS",2)]),s.currentSubTab.SETTINGS==="ENGINE"?(A(),P("div",KA,[...e[284]||(e[284]=[yi('<div class="rack"><div class="framesync-panel"><div class="framesync-header"><div class="framesync-title">⚙️ <span class="framesync-accent">Engine</span></div></div><div class="framesync-row" style="grid-template-columns:repeat(3, 1fr);gap:10px;margin-top:12px;"><div class="framesync-stack"><div class="framesync-subtitle">Resolution</div><select class="framesync-select"><option>960x540</option><option>1280x720</option></select></div><div class="framesync-stack"><div class="framesync-subtitle">FPS</div><select class="framesync-select"><option>5</option><option selected>12</option><option>25</option></select></div><div class="framesync-stack"><div class="framesync-subtitle">Steps</div><select class="framesync-select"><option>24</option><option>30</option><option>40</option></select></div></div><div class="framesync-footer" style="margin-top:12px;"><button class="framesync-button">Seed: 42490527</button><button class="framesync-button">Sampler: DPM++ 2M Karras</button></div></div></div>',1)])])):s.currentSubTab.SETTINGS==="MIDI"?(A(),P("div",JA,[c("div",ZA,[c("div",QA,[e[288]||(e[288]=c("div",{class:"framesync-header"},[c("div",{class:"framesync-title"},[Ge("🎹 Controllers "),c("span",{class:"framesync-accent"},"(WebMIDI)")])],-1)),s.midi.supported?(A(),P("div",e2,[c("div",t2,[(A(!0),P(we,null,ze(s.midi.devices,o=>(A(),P("button",{class:Be(["framesync-button",{active:s.midi.selected===o.id}]),key:o.id,onClick:h=>s.midi.selected=o.id},B(o.name),11,n2))),128)),c("button",{class:"framesync-button",onClick:e[119]||(e[119]=o=>r.scanMidi())},"Rescan")]),c("div",i2,[e[285]||(e[285]=c("button",{class:"framesync-button"},"Learn mode",-1)),c("button",{class:"framesync-button",onClick:e[120]||(e[120]=(...o)=>r.addMidiMapping&&r.addMidiMapping(...o))},"+ Add Mapping"),c("button",s2,"Status: "+B(s.midiStatus),1)]),c("div",r2,[c("table",a2,[e[287]||(e[287]=c("thead",null,[c("tr",null,[c("th",null,"Control"),c("th",null,"CC"),c("th",null,"Target"),c("th",null,"Actions")])],-1)),c("tbody",null,[(A(!0),P(we,null,ze(s.midi.mappings,(o,h)=>(A(),P("tr",{key:"midi"+h},[c("td",null,[Me(c("input",{class:"framesync-input","onUpdate:modelValue":y=>o.control=y,onChange:e[121]||(e[121]=(...y)=>r.saveMidiMappings&&r.saveMidiMappings(...y)),style:{width:"100px",padding:"4px"}},null,40,o2),[[je,o.control]])]),c("td",null,[Me(c("input",{class:"framesync-input",type:"number","onUpdate:modelValue":y=>o.cc=y,onChange:e[122]||(e[122]=(...y)=>r.saveMidiMappings&&r.saveMidiMappings(...y)),style:{width:"60px",padding:"4px"}},null,40,l2),[[je,o.cc,void 0,{number:!0}]])]),c("td",null,[Me(c("select",{class:"framesync-select","onUpdate:modelValue":y=>o.key=y,onChange:e[123]||(e[123]=(...y)=>r.saveMidiMappings&&r.saveMidiMappings(...y)),style:{width:"120px",padding:"4px"}},[e[286]||(e[286]=c("option",{value:""},"None",-1)),(A(!0),P(we,null,ze(s.lfoTargets,y=>(A(),P("option",{key:"mopt"+y.key,value:y.key},B(y.label),9,u2))),128))],40,c2),[[Pt,o.key]])]),c("td",null,[c("button",{class:"framesync-button",onClick:y=>r.deleteMidiMapping(h),style:{padding:"4px 8px",cursor:"pointer"}},"Delete",8,d2)])]))),128))])])])])):(A(),P("div",$A,"WebMIDI not supported or not enabled."))])])])):s.currentSubTab.SETTINGS==="BINDINGS"?(A(),P("div",f2,[c("div",h2,[c("div",p2,[c("div",m2,[e[289]||(e[289]=c("div",{class:"framesync-title"},[Ge("🔗 Parameter "),c("span",{class:"framesync-accent"},"Bindings")],-1)),c("div",g2,[c("button",{class:Be(["framesync-button",{active:s.bindingLearnMode}]),onClick:e[124]||(e[124]=(...o)=>r.toggleBindingLearn&&r.toggleBindingLearn(...o))},B(s.bindingLearnMode?"🔴 Stop Learn":"🎯 Learn"),3),c("button",{class:"framesync-button",onClick:e[125]||(e[125]=(...o)=>r.resetBindings&&r.resetBindings(...o))},"↺ Defaults")])]),s.bindingLearnMode?(A(),P("div",_2," Learn mode active. Press a key or move a MIDI controller, then click a parameter to bind. ")):Le("",!0),c("div",v2,[(A(!0),P(we,null,ze(r.bindingGroups,o=>(A(),P("div",{class:"framesync-stack",key:o.label},[c("div",y2,B(o.label),1),c("div",x2,[c("table",S2,[e[290]||(e[290]=c("thead",null,[c("tr",{style:{color:"var(--text-dim)","border-bottom":"1px solid var(--border)"}},[c("th",{style:{"text-align":"left",padding:"4px 8px"}},"Parameter"),c("th",{style:{"text-align":"left",padding:"4px 8px"}},"Key"),c("th",{style:{"text-align":"left",padding:"4px 8px"}},"MIDI CC"),c("th",{style:{padding:"4px 8px"}},"Actions")])],-1)),c("tbody",null,[(A(!0),P(we,null,ze(o.items,h=>(A(),P("tr",{key:h.key,style:{"border-bottom":"1px solid var(--border)"}},[c("td",b2,B(h.label),1),c("td",M2,[r.getKeyBinding(h.key)?(A(),P("span",T2,[c("kbd",E2,B(r.getKeyBinding(h.key)),1),c("button",{style:{border:"none",background:"transparent",color:"var(--error)",cursor:"pointer",padding:"0","font-size":"9px"},onClick:y=>r.clearKeyBinding(h.key)},"✕",8,w2)])):(A(),P("span",A2,"—"))]),c("td",P2,[r.getMidiBinding(h.key)?(A(),P("span",C2,[c("span",R2,"CC "+B(r.getMidiBinding(h.key)),1),c("button",{style:{border:"none",background:"transparent",color:"var(--error)",cursor:"pointer",padding:"0","font-size":"9px"},onClick:y=>r.clearMidiBinding(h.key)},"✕",8,I2)])):(A(),P("span",L2,"—"))]),c("td",D2,[s.bindingLearnMode?(A(),P("button",{key:0,class:"framesync-button",style:{padding:"2px 6px","font-size":"9px"},onClick:y=>s.bindingTargetKey=h.key},"Bind here",8,N2)):Le("",!0)])]))),128))])])])]))),128))])])])])):s.currentSubTab.SETTINGS==="PRESETS"?(A(),P("div",U2,[c("div",F2,[c("div",k2,[e[295]||(e[295]=c("div",{class:"framesync-header"},[c("div",{class:"framesync-title"},[Ge("💾 Preset "),c("span",{class:"framesync-accent"},"Management")])],-1)),c("div",O2,[(A(!0),P(we,null,ze(s.availablePresets,o=>(A(),P("button",{class:Be(["framesync-button",{active:s.currentPreset===o}]),key:o,onClick:h=>r.loadPreset(o)},B(o),11,B2))),128)),c("button",{class:"framesync-button",onClick:e[126]||(e[126]=(...o)=>r.refreshPresets&&r.refreshPresets(...o))},"🔄 Refresh")]),c("div",V2,[e[291]||(e[291]=c("div",{class:"framesync-subtitle"},"New preset name",-1)),Me(c("input",{class:"framesync-input","onUpdate:modelValue":e[127]||(e[127]=o=>s.newPresetName=o),placeholder:"my-preset"},null,512),[[je,s.newPresetName]])]),c("div",z2,[c("button",{class:"framesync-button",onClick:e[128]||(e[128]=(...o)=>r.saveCurrentPreset&&r.saveCurrentPreset(...o))},"💾 Save current as preset"),s.currentPreset?(A(),P("button",{key:0,class:"framesync-button",onClick:e[129]||(e[129]=o=>r.deletePreset(s.currentPreset)),style:{"border-color":"var(--error)",color:"var(--error)"}},"🗑 Delete "+B(s.currentPreset),1)):Le("",!0)]),s.presetStatus?(A(),P("div",G2,B(s.presetStatus),1)):Le("",!0),c("div",H2,[e[292]||(e[292]=c("div",{class:"framesync-title"},[Ge("🌐 Shared "),c("span",{class:"framesync-accent"},"Presets")],-1)),c("button",{class:"framesync-button",onClick:e[130]||(e[130]=(...o)=>r.refreshSharedPresets&&r.refreshSharedPresets(...o))},"🔄 Refresh")]),c("div",W2,[c("div",q2,[e[293]||(e[293]=c("div",{class:"framesync-subtitle"},"Share as",-1)),Me(c("input",{class:"framesync-input","onUpdate:modelValue":e[131]||(e[131]=o=>s.sharedPresetName=o),placeholder:"shared-preset-name"},null,512),[[je,s.sharedPresetName]])]),c("div",X2,[e[294]||(e[294]=c("div",{class:"framesync-subtitle"},"Your name",-1)),Me(c("input",{class:"framesync-input","onUpdate:modelValue":e[132]||(e[132]=o=>s.collab.userName=o),placeholder:"Performer",onChange:e[133]||(e[133]=(...o)=>r.saveCollabUserName&&r.saveCollabUserName(...o))},null,544),[[je,s.collab.userName]])])]),c("div",j2,[c("button",{class:"framesync-button",onClick:e[134]||(e[134]=(...o)=>r.shareCurrentPreset&&r.shareCurrentPreset(...o))},"📤 Share current state")]),s.sharedPresets.length?(A(),P("ul",Y2,[(A(!0),P(we,null,ze(s.sharedPresets,o=>(A(),P("li",{key:o.name,style:{"margin-bottom":"6px",display:"flex","flex-wrap":"wrap",gap:"6px","align-items":"center"}},[c("strong",null,B(o.name),1),c("span",K2,"by "+B(o.sharedBy),1),c("button",{class:"framesync-button",style:{padding:"2px 8px","font-size":"10px"},onClick:h=>r.loadSharedPreset(o.name)},"Load",8,J2),c("button",{class:"framesync-button",style:{padding:"2px 8px","font-size":"10px","border-color":"var(--error)",color:"var(--error)"},onClick:h=>r.deleteSharedPreset(o.name)},"Delete",8,Z2)]))),128))])):(A(),P("div",Q2,"No shared presets yet.")),s.sharedPresetsStatus?(A(),P("div",$2,B(s.sharedPresetsStatus),1)):Le("",!0)])])])):s.currentSubTab.SETTINGS==="GPUS"?(A(),P("div",eP,[c("div",tP,[c("div",nP,[c("div",iP,[e[297]||(e[297]=c("div",{class:"framesync-title"},[Ge("🖥️ GPU "),c("span",{class:"framesync-accent"},"Pool")],-1)),c("label",sP,[Me(c("input",{type:"checkbox","onUpdate:modelValue":e[135]||(e[135]=o=>s.gpuPool.enabled=o),onChange:e[136]||(e[136]=(...o)=>r.saveGpuPoolSettings&&r.saveGpuPoolSettings(...o))},null,544),[[xi,s.gpuPool.enabled]]),e[296]||(e[296]=Ge(" Load balancing ",-1))])]),c("div",rP,[c("div",aP,[e[299]||(e[299]=c("div",{class:"framesync-subtitle"},"Strategy",-1)),Me(c("select",{class:"framesync-select","onUpdate:modelValue":e[137]||(e[137]=o=>s.gpuPool.strategy=o),onChange:e[138]||(e[138]=(...o)=>r.saveGpuPoolSettings&&r.saveGpuPoolSettings(...o)),disabled:s.gpuPool.loading},[...e[298]||(e[298]=[c("option",{value:"round_robin"},"Round robin",-1),c("option",{value:"least_busy"},"Least busy",-1),c("option",{value:"priority"},"Priority",-1),c("option",{value:"random"},"Random",-1)])],40,oP),[[Pt,s.gpuPool.strategy]])]),c("div",lP,[e[300]||(e[300]=c("div",{class:"framesync-subtitle"},"Healthy / total",-1)),c("div",cP,B(s.gpuPool.healthyNodes)+" / "+B(s.gpuPool.nodes.length),1)]),c("div",uP,[c("button",{class:"framesync-button",onClick:e[139]||(e[139]=o=>r.refreshGpuPool(!0)),disabled:s.gpuPool.loading},"🔄 Refresh stats",8,dP)])]),e[305]||(e[305]=c("p",{style:{"font-size":"11px",color:"var(--text-dim)",margin:"12px 0 0"}},[Ge(" Add SD-Forge (A1111 API) or ComfyUI instances. Disable a node to edit or remove it. Generation load balancing uses enabled "),c("strong",null,"SD-Forge"),Ge(" nodes for img2img/txt2img/Deforum. ")],-1)),c("div",fP,[e[302]||(e[302]=c("div",{class:"framesync-subtitle"},"Add instance (saved disabled — enable after editing)",-1)),c("div",hP,[Me(c("input",{class:"framesync-input","onUpdate:modelValue":e[140]||(e[140]=o=>s.gpuPool.draft.url=o),placeholder:"http://host:7860 or :8188",disabled:s.gpuPool.loading},null,8,pP),[[je,s.gpuPool.draft.url]]),Me(c("input",{class:"framesync-input","onUpdate:modelValue":e[141]||(e[141]=o=>s.gpuPool.draft.name=o),placeholder:"Name",disabled:s.gpuPool.loading},null,8,mP),[[je,s.gpuPool.draft.name]]),Me(c("select",{class:"framesync-select","onUpdate:modelValue":e[142]||(e[142]=o=>s.gpuPool.draft.backend=o),disabled:s.gpuPool.loading},[...e[301]||(e[301]=[c("option",{value:"sd-forge"},"SD-Forge",-1),c("option",{value:"comfyui"},"ComfyUI",-1)])],8,gP),[[Pt,s.gpuPool.draft.backend]])]),c("div",_P,[c("button",{class:"framesync-button",onClick:e[143]||(e[143]=(...o)=>r.addGpuNode&&r.addGpuNode(...o)),disabled:s.gpuPool.loading||!s.gpuPool.draft.url},"+ Add instance",8,vP)])]),s.gpuPool.nodes.length?(A(),P("div",yP,[c("table",xP,[e[304]||(e[304]=c("thead",null,[c("tr",null,[c("th",null,"Name"),c("th",null,"Backend"),c("th",null,"Status"),c("th",null,"Model"),c("th",null,"VRAM"),c("th",null,"GPU %"),c("th",null,"Jobs"),c("th",null,"Actions")])],-1)),c("tbody",null,[(A(!0),P(we,null,ze(s.gpuPool.nodes,o=>(A(),P("tr",{key:o.id,class:Be({"gpu-row-disabled":!o.enabled})},[c("td",null,[s.gpuPool.editId===o.id?(A(),P(we,{key:0},[Me(c("input",{class:"framesync-input","onUpdate:modelValue":e[144]||(e[144]=h=>s.gpuPool.editDraft.name=h),style:{"font-size":"11px","margin-bottom":"4px"}},null,512),[[je,s.gpuPool.editDraft.name]]),Me(c("input",{class:"framesync-input","onUpdate:modelValue":e[145]||(e[145]=h=>s.gpuPool.editDraft.url=h),style:{"font-size":"10px"}},null,512),[[je,s.gpuPool.editDraft.url]])],64)):(A(),P(we,{key:1},[Ge(B(o.name),1)],64)),c("div",SP,B(o.url),1)]),c("td",null,[s.gpuPool.editId===o.id?Me((A(),P("select",{key:0,class:"framesync-select","onUpdate:modelValue":e[146]||(e[146]=h=>s.gpuPool.editDraft.backend=h),style:{"font-size":"11px"}},[...e[303]||(e[303]=[c("option",{value:"sd-forge"},"SD-Forge",-1),c("option",{value:"comfyui"},"ComfyUI",-1)])],512)),[[Pt,s.gpuPool.editDraft.backend]]):(A(),P("span",bP,B(o.backend),1))]),c("td",null,[c("span",{class:Be(["gpu-status-pill","st-"+(o.enabled?o.status:"disabled")])},B(o.enabled?o.status:"disabled"),3)]),c("td",{style:{"max-width":"140px",overflow:"hidden","text-overflow":"ellipsis"},title:o.currentModel||""},B(o.currentModel||"—"),9,MP),c("td",null,B(r.formatGpuMemory(o)),1),c("td",null,B(o.gpuUtilization!=null?o.gpuUtilization+"%":"—"),1),c("td",null,B(o.activeJobs),1),c("td",null,[c("div",TP,[o.enabled?(A(),P("button",{key:0,class:"framesync-button",style:{padding:"2px 8px","font-size":"10px"},onClick:h=>r.disableGpuNode(o)},"Disable",8,EP)):(A(),P(we,{key:1},[c("button",{class:"framesync-button",style:{padding:"2px 8px","font-size":"10px"},onClick:h=>r.enableGpuNode(o)},"Enable",8,wP),s.gpuPool.editId!==o.id?(A(),P("button",{key:0,class:"framesync-button",style:{padding:"2px 8px","font-size":"10px"},onClick:h=>r.startEditGpuNode(o)},"Edit",8,AP)):(A(),P("button",{key:1,class:"framesync-button",style:{padding:"2px 8px","font-size":"10px"},onClick:h=>r.saveGpuNodeEdit(o)},"Save",8,PP)),c("button",{class:"framesync-button",style:{padding:"2px 8px","font-size":"10px","border-color":"var(--error)",color:"var(--error)"},onClick:h=>r.removeGpuNode(o)},"Remove",8,CP)],64))])])],2))),128))])])])):(A(),P("div",RP,"No GPU instances configured.")),s.gpuPool.status?(A(),P("div",IP,B(s.gpuPool.status),1)):Le("",!0)])])])):s.currentSubTab.SETTINGS==="COLLAB"?(A(),P("div",LP,[c("div",DP,[c("div",NP,[c("div",UP,[e[306]||(e[306]=c("div",{class:"framesync-title"},[Ge("👥 "),c("span",{class:"framesync-accent"},"Collaboration")],-1)),c("span",{class:"pill",style:hn(s.wsStatus==="connected"?{color:"var(--success)",borderColor:"rgba(90,242,169,0.4)"}:{})},B(s.wsStatus==="connected"?"WS connected":"WS "+s.wsStatus),5)]),c("div",FP,[c("div",kP,[e[307]||(e[307]=c("div",{class:"framesync-subtitle"},"Display name",-1)),Me(c("input",{class:"framesync-input","onUpdate:modelValue":e[147]||(e[147]=o=>s.collab.userName=o),onChange:e[148]||(e[148]=o=>{r.saveCollabUserName,r.collabIdentify()})},null,544),[[je,s.collab.userName]])]),c("div",OP,[e[308]||(e[308]=c("div",{class:"framesync-subtitle"},"Your session ID",-1)),c("input",{class:"framesync-input",value:s.collab.userId||"—",readonly:""},null,8,BP)])]),c("div",VP,"Connected users ("+B(s.collab.users.length)+")",1),s.collab.users.length?(A(),P("ul",zP,[(A(!0),P(we,null,ze(s.collab.users,o=>(A(),P("li",{key:o.id},[Ge(B(o.name)+" ",1),o.lockedParams&&o.lockedParams.length?(A(),P("span",GP," — locks: "+B(o.lockedParams.join(", ")),1)):Le("",!0)]))),128))])):(A(),P("div",HP,"Only you (open another browser tab to test multi-user).")),e[309]||(e[309]=c("div",{class:"framesync-subtitle",style:{"margin-top":"14px"}},"Session recording",-1)),c("div",WP,[c("button",{class:Be(["framesync-button",{active:s.collab.recording}]),onClick:e[149]||(e[149]=(...o)=>r.toggleSessionRecording&&r.toggleSessionRecording(...o))},B(s.collab.recording?"⏹ Stop recording":"● Start recording"),3),c("button",{class:"framesync-button",onClick:e[150]||(e[150]=(...o)=>r.listSessionRecordings&&r.listSessionRecordings(...o))},"📂 List recordings")]),s.collab.recordings.length?(A(),P("ul",qP,[(A(!0),P(we,null,ze(s.collab.recordings,o=>(A(),P("li",{key:o.filename,style:{display:"flex",gap:"8px","align-items":"center"}},[Ge(B(o.filename)+" ",1),c("button",{class:"framesync-button",style:{padding:"2px 8px","font-size":"10px"},onClick:h=>r.playbackSessionRecording(o.filename)},"Play",8,XP)]))),128))])):Le("",!0),s.collab.status?(A(),P("div",jP,B(s.collab.status),1)):Le("",!0),e[310]||(e[310]=c("div",{class:"framesync-subtitle",style:{"margin-top":"14px"}},"Parameter locks (click param label in LIVE drawer)",-1)),Object.keys(s.collab.locks).length?(A(),P("div",YP,[(A(!0),P(we,null,ze(s.collab.locks,(o,h)=>(A(),P("span",{key:h,class:"pill",style:{margin:"2px 4px 2px 0"}},[Ge(B(h)+" → "+B(o)+" ",1),c("button",{type:"button",style:{border:"none",background:"transparent",color:"var(--error)",cursor:"pointer","margin-left":"4px"},onClick:y=>r.unlockParam(h)},"✕",8,KP)]))),128))])):(A(),P("div",JP,"No active locks."))])])])):s.currentSubTab.SETTINGS==="KEYS"?(A(),P("div",ZP,[...e[311]||(e[311]=[yi('<div class="rack"><div class="framesync-panel"><div class="framesync-header"><div class="framesync-title">⌨️ <span class="framesync-accent">Keyboard Shortcuts</span></div></div><div class="framesync-row" style="grid-template-columns:repeat(2, 1fr);gap:10px;margin-top:12px;"><div class="framesync-stack"><div class="framesync-subtitle">Navigation</div><div style="font-size:12px;color:var(--text-secondary);line-height:1.8;"><div><kbd>1</kbd>–<kbd>7</kbd> Switch tabs (LIVE→GENERATE)</div></div></div><div class="framesync-stack"><div class="framesync-subtitle">LIVE Tab</div><div style="font-size:12px;color:var(--text-secondary);line-height:1.8;"><div><kbd>Space</kbd> Generate image</div><div><kbd>R</kbd> Reset Vibe &amp; Camera params</div></div></div><div class="framesync-stack"><div class="framesync-subtitle">PROMPTS Tab</div><div style="font-size:12px;color:var(--text-secondary);line-height:1.8;"><div><kbd>M</kbd> Toggle prompt morphing</div></div></div><div class="framesync-stack"><div class="framesync-subtitle">MODULATION Tab</div><div style="font-size:12px;color:var(--text-secondary);line-height:1.8;"><div><kbd>L</kbd> Toggle LFO</div><div><kbd>B</kbd> Toggle Beat Macro</div></div></div></div></div></div>',1)])])):Le("",!0)])):s.currentTab==="GENERATE"?(A(),P("div",QP,[c("div",$P,[c("div",eC,[c("div",tC,[e[313]||(e[313]=c("div",{class:"framesync-title"},[Ge("⏱ Animation "),c("span",{class:"framesync-accent"},"Sequencer")],-1)),c("div",{class:Be(["pill",{danger:s.sequencerPlaying}])},[e[312]||(e[312]=c("span",{class:"dot"},null,-1)),Ge(B(s.sequencerPlaying?"Playing":"Stopped"),1)],2)]),c("div",nC,[c("div",iC,[e[314]||(e[314]=c("div",{class:"framesync-subtitle"},"Duration (s)",-1)),Me(c("input",{type:"number",class:"framesync-input","onUpdate:modelValue":e[151]||(e[151]=o=>s.sequencer.durationSec=o),min:"0.5",max:"600",step:"0.5",onChange:e[152]||(e[152]=(...o)=>r.clampSequencerPlayhead&&r.clampSequencerPlayhead(...o))},null,544),[[je,s.sequencer.durationSec,void 0,{number:!0}]])]),c("div",sC,[e[315]||(e[315]=c("div",{class:"framesync-subtitle"},"FPS",-1)),Me(c("input",{type:"number",class:"framesync-input","onUpdate:modelValue":e[153]||(e[153]=o=>s.sequencer.fps=o),min:"5",max:"25",step:"1"},null,512),[[je,s.sequencer.fps,void 0,{number:!0}]])]),c("div",rC,[e[317]||(e[317]=c("div",{class:"framesync-subtitle"},"Loop",-1)),c("label",aC,[Me(c("input",{type:"checkbox","onUpdate:modelValue":e[154]||(e[154]=o=>s.sequencer.loop=o)},null,512),[[xi,s.sequencer.loop]]),e[316]||(e[316]=Ge(" Repeat timeline",-1))])]),c("div",oC,[e[319]||(e[319]=c("div",{class:"framesync-subtitle"},"BPM Sync",-1)),c("label",lC,[Me(c("input",{type:"checkbox","onUpdate:modelValue":e[155]||(e[155]=o=>s.sequencer.bpmSync=o)},null,512),[[xi,s.sequencer.bpmSync]]),e[318]||(e[318]=Ge(" Sync to audio BPM",-1))])])]),s.sequencer.bpmSync?(A(),P("div",cC,[c("div",uC,[e[320]||(e[320]=c("div",{class:"framesync-subtitle"},"BPM",-1)),Me(c("input",{type:"number",class:"framesync-input","onUpdate:modelValue":e[156]||(e[156]=o=>s.sequencer.bpm=o),min:"20",max:"300",step:"0.1"},null,512),[[je,s.sequencer.bpm,void 0,{number:!0}]])]),c("div",dC,[e[321]||(e[321]=c("div",{class:"framesync-subtitle"},"Bars",-1)),Me(c("input",{type:"number",class:"framesync-input","onUpdate:modelValue":e[157]||(e[157]=o=>s.sequencer.bars=o),min:"1",max:"128",step:"1"},null,512),[[je,s.sequencer.bars,void 0,{number:!0}]])]),c("div",fC,[e[323]||(e[323]=c("div",{class:"framesync-subtitle"},"Beats/Bar",-1)),Me(c("select",{class:"framesync-select","onUpdate:modelValue":e[158]||(e[158]=o=>s.sequencer.beatsPerBar=o)},[...e[322]||(e[322]=[c("option",{value:"4"},"4/4",-1),c("option",{value:"3"},"3/4",-1),c("option",{value:"6"},"6/8",-1)])],512),[[Pt,s.sequencer.beatsPerBar,void 0,{number:!0}]])]),c("div",hC,[e[324]||(e[324]=c("div",{class:"framesync-subtitle"},"Calculated",-1)),c("div",pC,B(r.sequencerCalculatedDuration)+"s",1)])])):Le("",!0),e[332]||(e[332]=c("div",{class:"framesync-subtitle",style:{"margin-top":"12px"}},"Playhead (s)",-1)),Me(c("input",{type:"range",class:"framesync-input",style:{width:"100%"},min:"0",max:Math.max(.01,s.sequencer.durationSec),step:"0.01","onUpdate:modelValue":e[159]||(e[159]=o=>s.sequencerPlayhead=o),onInput:e[160]||(e[160]=(...o)=>r.previewSequencerFrame&&r.previewSequencerFrame(...o))},null,40,mC),[[je,s.sequencerPlayhead,void 0,{number:!0}]]),Number(s.sequencer.durationSec)>0?(A(),P("div",gC,[e[325]||(e[325]=c("div",{style:{position:"absolute",inset:"0","border-radius":"6px",background:"linear-gradient(90deg, rgba(45,226,255,0.06), rgba(255,83,217,0.06))","pointer-events":"none"}},null,-1)),(A(!0),P(we,null,ze(r.sortedSequencerMarkers,(o,h)=>(A(),P("div",{key:"mk-"+h+"-"+(o.t||0),style:hn([{position:"absolute",top:"4px",bottom:"4px",width:"0",transform:"translateX(-50%)","z-index":"2"},{left:100*(o.t/Math.max(1e-6,Number(s.sequencer.durationSec)))+"%"}])},[c("button",{type:"button",class:"framesync-button",style:{padding:"2px 6px","font-size":"9px","white-space":"nowrap"},onClick:y=>r.jumpToSequencerMarker(o)},B(o.name),9,_C)],4))),128)),r.sortedSequencerMarkers.length===0?(A(),P("div",vC," No markers yet ")):Le("",!0),c("div",{style:hn([{position:"absolute",top:"0",bottom:"0",width:"2px",background:"#fff","z-index":"3","pointer-events":"none"},{left:100*(s.sequencerPlayhead/Math.max(1e-6,Number(s.sequencer.durationSec)))+"%"}])},null,4)])):Le("",!0),e[333]||(e[333]=c("div",{class:"framesync-subtitle",style:{"margin-top":"12px"}},"Scene markers",-1)),c("div",yC,[Me(c("input",{type:"text",class:"framesync-input",style:{"max-width":"160px","font-size":"11px"},"onUpdate:modelValue":e[161]||(e[161]=o=>s.sequencerMarkerName=o),maxlength:"48",placeholder:"Label",title:"1–48 chars: letters, digits, space, _ - ."},null,512),[[je,s.sequencerMarkerName,void 0,{trim:!0}]]),c("button",{type:"button",class:"framesync-button",onClick:e[162]||(e[162]=(...o)=>r.addSequencerMarker&&r.addSequencerMarker(...o))},"+ Marker @ playhead")]),r.sortedSequencerMarkers.length?(A(),P("div",xC,[(A(!0),P(we,null,ze(r.sortedSequencerMarkers,(o,h)=>(A(),P("div",{key:"mrow-"+h+"-"+(o.t||0),style:{display:"flex","align-items":"center",gap:"6px","margin-bottom":"4px","flex-wrap":"wrap",padding:"4px 6px",background:"var(--bg-0)","border-radius":"4px"}},[c("button",{type:"button",class:"framesync-button",style:{"font-size":"10px",padding:"2px 6px"},onClick:y=>r.jumpToSequencerMarker(o)},B(o.name)+" @ "+B(o.t.toFixed(2))+"s",9,SC),c("select",{class:"framesync-input",style:{"font-size":"10px","max-width":"100px",padding:"2px 4px"},value:o.action||"jump",onChange:y=>r.setMarkerAction(o,y.target.value)},[...e[326]||(e[326]=[yi('<option value="jump">↦ Jump</option><option value="preset">🎨 Preset</option><option value="generate">⏱ Generate</option><option value="morph">🔄 Morph</option><option value="param">🎛 Params</option><option value="pause">⏸ Pause</option>',6)])],40,bC),o.action&&o.action!=="jump"&&o.action!=="generate"&&o.action!=="pause"?(A(),P("input",{key:0,type:"text",class:"framesync-input",style:{"font-size":"10px","max-width":"140px",padding:"2px 4px"},value:o.target||"",placeholder:r.markerActionPlaceholder(o.action),onChange:y=>r.setMarkerTarget(o,y.target.value),title:r.markerActionTitle(o.action)},null,40,MC)):Le("",!0),o.action==="jump"?(A(),P("span",TC,"jump to time")):Le("",!0),o.action==="generate"?(A(),P("span",EC,"trigger generation")):Le("",!0),o.action==="pause"?(A(),P("span",wC,"pause playback")):Le("",!0),c("button",{type:"button",style:{border:"none",background:"transparent",color:"var(--error)",cursor:"pointer",padding:"0"},title:"Remove",onClick:y=>r.removeSequencerMarker(h)},"✕",8,AC)]))),128))])):(A(),P("div",PC,"No markers yet")),c("div",CC,[c("button",{type:"button",class:"framesync-button",onClick:e[163]||(e[163]=(...o)=>r.toggleSequencerPlayback&&r.toggleSequencerPlayback(...o))},B(s.sequencerPlaying?"⏹ Stop":"▶ Play"),1),c("button",{type:"button",class:"framesync-button",onClick:e[164]||(e[164]=(...o)=>r.previewSequencerFrame&&r.previewSequencerFrame(...o))},"Preview frame"),c("button",{type:"button",class:"framesync-button",onClick:e[165]||(e[165]=(...o)=>r.saveSequencerTimeline&&r.saveSequencerTimeline(...o))},"💾 Save"),c("button",{type:"button",class:"framesync-button",onClick:e[166]||(e[166]=(...o)=>r.exportSequencerDownload&&r.exportSequencerDownload(...o))},"⬇ Export JSON"),Me(c("select",{class:"framesync-input",style:{"max-width":"160px","font-size":"11px"},"onUpdate:modelValue":e[167]||(e[167]=o=>s.sequencerLoadPick=o),onChange:e[168]||(e[168]=(...o)=>r.loadSequencerTimeline&&r.loadSequencerTimeline(...o))},[e[327]||(e[327]=c("option",{value:""},"Load saved…",-1)),(A(!0),P(we,null,ze(s.sequencerList,o=>(A(),P("option",{key:"seq-"+o,value:o},B(o),9,RC))),128))],544),[[Pt,s.sequencerLoadPick]])]),e[334]||(e[334]=c("div",{class:"framesync-subtitle",style:{"margin-top":"14px"}},"Tracks",-1)),s.sequencer.tracks.length?(A(),P("div",IC,[c("div",LC,[e[328]||(e[328]=c("span",null,"TIMELINE",-1)),c("span",null,B(s.sequencer.tracks.length)+" track"+B(s.sequencer.tracks.length>1?"s":"")+" · "+B(s.sequencer.durationSec)+"s",1)]),c("div",DC,[c("canvas",{ref:"timelineCanvas",style:{width:"100%",display:"block",cursor:"pointer"},onClick:e[169]||(e[169]=(...o)=>r.seekTimeline&&r.seekTimeline(...o)),onMousemove:e[170]||(e[170]=(...o)=>r.hoverTimeline&&r.hoverTimeline(...o))},null,544),s.timelineHoverTime!==null?(A(),P("div",{key:0,style:hn([{position:"absolute",top:"0",bottom:"0",width:"1px",background:"rgba(255,255,255,0.3)","pointer-events":"none","z-index":"3"},{left:s.timelineHoverPercent+"%"}])},null,4)):Le("",!0)],512)])):Le("",!0),c("div",NC,[Me(c("select",{class:"framesync-input",style:{"min-width":"140px","font-size":"11px"},"onUpdate:modelValue":e[171]||(e[171]=o=>s.sequencerNewParam=o)},[(A(!0),P(we,null,ze(r.sequencerParamOptions,o=>(A(),P("option",{key:"sp-"+o.key,value:o.key},B(o.label),9,UC))),128))],512),[[Pt,s.sequencerNewParam]]),c("button",{type:"button",class:"framesync-button",onClick:e[172]||(e[172]=(...o)=>r.addSequencerTrack&&r.addSequencerTrack(...o))},"+ Track"),e[329]||(e[329]=c("span",{class:"framesync-list",style:{"font-size":"11px"}},"Keyframe value",-1)),Me(c("input",{type:"number",class:"framesync-input",style:{width:"100px","font-size":"11px"},"onUpdate:modelValue":e[173]||(e[173]=o=>s.sequencerKeyframeVal=o),step:"any"},null,512),[[je,s.sequencerKeyframeVal,void 0,{number:!0}]]),c("button",{type:"button",class:"framesync-button",onClick:e[174]||(e[174]=(...o)=>r.addSequencerKeyframe&&r.addSequencerKeyframe(...o))},"+ Keyframe @ playhead")]),(A(!0),P(we,null,ze(s.sequencer.tracks,o=>(A(),P("div",{key:o.id,style:{border:"1px solid var(--border)","border-radius":"8px",padding:"10px","margin-bottom":"8px",background:"var(--bg-0)"}},[c("div",FC,[c("strong",kC,B(o.param),1),c("label",OC,[Me(c("input",{type:"radio",value:o.id,"onUpdate:modelValue":e[175]||(e[175]=h=>s.sequencerSelectedTrackId=h)},null,8,BC),[[zm,s.sequencerSelectedTrackId]]),e[330]||(e[330]=Ge(" edit ",-1))]),c("button",{type:"button",class:"framesync-button",style:{padding:"4px 8px","font-size":"10px"},onClick:h=>r.removeSequencerTrack(o.id)},"Remove track",8,VC)]),c("div",zC,[(A(!0),P(we,null,ze(r.sortedKeyframes(o),(h,y)=>(A(),P("span",{key:o.id+"-"+y+"-"+(h.t||0),style:{display:"inline-flex","align-items":"center",gap:"4px","margin-right":"10px","flex-wrap":"wrap"}},[Ge(" t="+B(h.t.toFixed(2))+" → "+B(h.v.toFixed(3))+" ",1),c("select",{class:"framesync-input",style:{"font-size":"10px","max-width":"110px",padding:"2px 4px"},value:h.easing||"linear",title:"Easing to next keyframe",onChange:_=>r.setKeyframeEasing(h,_.target.value)},[...e[331]||(e[331]=[c("option",{value:"linear"},"linear",-1),c("option",{value:"easeIn"},"easeIn",-1),c("option",{value:"easeOut"},"easeOut",-1),c("option",{value:"easeInOut"},"easeInOut",-1)])],40,GC),c("button",{type:"button",style:{border:"none",background:"transparent",color:"var(--error)",cursor:"pointer",padding:"0"},title:"Remove",onClick:_=>r.removeSequencerKeyframe(o.id,y)},"✕",8,HC)]))),128)),o.keyframes.length?Le("",!0):(A(),P("span",WC,"No keyframes"))])]))),128)),s.sequencerStatus?(A(),P("div",qC,B(s.sequencerStatus),1)):Le("",!0)])]),c("div",XC,[c("div",jC,[c("div",YC,[e[335]||(e[335]=c("div",{class:"framesync-title"},[Ge("✨ Story "),c("span",{class:"framesync-accent"},"Generator")],-1)),c("button",{class:"framesync-button",disabled:s.generator.isGenerating,onClick:e[176]||(e[176]=(...o)=>r.generateStory&&r.generateStory(...o)),style:{"min-width":"120px"}},B(s.generator.isGenerating?"⏳ Generating…":"▶ Generate"),9,KC)]),c("div",JC,[e[336]||(e[336]=c("div",{class:"framesync-subtitle"},"Theme / Story concept",-1)),Me(c("input",{class:"framesync-input","onUpdate:modelValue":e[177]||(e[177]=o=>s.generator.theme=o),placeholder:"e.g. A Space Traveler, Ancient Forest, Cyberpunk City…",style:{width:"100%"}},null,512),[[je,s.generator.theme]])]),c("div",ZC,[c("div",QC,[e[338]||(e[338]=c("div",{class:"framesync-subtitle"},"Style preset",-1)),Me(c("select",{class:"framesync-select","onUpdate:modelValue":e[178]||(e[178]=o=>s.generator.stylePreset=o)},[...e[337]||(e[337]=[yi('<option value="Masterpiece, Realistic">Masterpiece Realistic</option><option value="Masterpiece, Cinematic">Cinematic</option><option value="Masterpiece, best quality, anime">Anime</option><option value="oil painting, impressionism">Oil Painting</option><option value="digital art, concept art, surrealistic">Surrealist</option><option value="watercolor, illustration">Watercolor</option><option value="custom">Custom…</option>',7)])],512),[[Pt,s.generator.stylePreset]])]),s.generator.stylePreset==="custom"?(A(),P("div",$C,[e[339]||(e[339]=c("div",{class:"framesync-subtitle"},"Custom style",-1)),Me(c("input",{class:"framesync-input","onUpdate:modelValue":e[179]||(e[179]=o=>s.generator.customStyle=o),placeholder:"your style keywords"},null,512),[[je,s.generator.customStyle]])])):Le("",!0)]),c("div",eR,[c("button",{class:"framesync-button",onClick:e[180]||(e[180]=(...o)=>r.generateStory&&r.generateStory(...o))},"▶ Generate Story"),c("button",{class:"framesync-button",onClick:e[181]||(e[181]=(...o)=>r.generateImage&&r.generateImage(...o))},"🖼 Generate Image")]),s.generator.status?(A(),P("div",tR,B(s.generator.status),1)):Le("",!0),s.generator.lastPath?(A(),P("div",{key:1,style:hn(s.storyResultCollapsed?"":"margin-top:12px;")},[c("div",nR,[e[340]||(e[340]=c("div",{class:"framesync-subtitle",style:{margin:"0"}},"Result",-1)),c("button",{class:"framesync-button",onClick:e[182]||(e[182]=o=>s.storyResultCollapsed=!s.storyResultCollapsed)},B(s.storyResultCollapsed?"▼ Show":"▲ Hide"),1)]),s.storyResultCollapsed?Le("",!0):(A(),P("div",iR,[s.generator.lastPath?(A(),P("img",{key:0,src:s.generator.lastPath,style:{width:"100%","border-radius":"8px",border:"1px solid var(--border)"}},null,8,sR)):Le("",!0)]))],4)):Le("",!0)])])])):Le("",!0)])]),c("div",rR,[c("div",aR,[c("div",null,[e[341]||(e[341]=c("h4",null,"Recent Runs",-1)),c("p",oR,B(r.contextRailCopy),1)]),c("div",lR,[c("span",cR,[e[342]||(e[342]=c("span",{class:"dot"},null,-1)),Ge(B(r.recentRunsRail.length)+" loaded",1)]),c("button",{class:"framesync-button",onClick:e[183]||(e[183]=(...o)=>r.refreshRuns&&r.refreshRuns(...o))},"🔄 Refresh")])]),r.contextSummaryChips.length?(A(),P("div",uR,[(A(!0),P(we,null,ze(r.contextSummaryChips,o=>(A(),P("span",{key:o,class:"chip chip--context"},B(o),1))),128))])):Le("",!0),s.runsStatus?(A(),P("div",dR,B(s.runsStatus),1)):Le("",!0),r.recentRunsRail.length?(A(),P("div",fR,[(A(!0),P(we,null,ze(r.recentRunsRail,o=>(A(),P("button",{key:"rail-"+o.run_id,type:"button",class:Be(["recent-runs-card",{"recent-runs-card--active":s.runsDetailView&&s.runsDetailView.run_id===o.run_id}]),onClick:h=>r.openRunFromRail(o)},[c("div",pR,[o.has_thumbnail?(A(),P("img",{key:0,src:`/api/runs/${o.run_id}/thumb`,alt:o.run_id,class:"recent-runs-thumb"},null,8,mR)):(A(),P("div",gR,"No preview")),c("span",{class:Be(["status-chip recent-runs-status","status-"+(o.status||"queued")])},B(o.status||"queued"),3)]),c("div",_R,[c("div",vR,B(o.run_id),1),c("div",yR,B(o.model||"Unknown model"),1),c("div",xR,[c("span",null,B(r.formatDate(o.started_at)),1),c("span",null,B(o.frame_count||o.length_frames||0)+"f",1)]),r.runRailSummary(o)?(A(),P("div",SR,B(r.runRailSummary(o)),1)):Le("",!0)])],10,hR))),128))])):(A(),P("div",bR," No recent runs yet. Render something and refresh this rail to populate it. "))])])}const TR=Fi(Sb,[["render",MR]]);rg();Xm(TR).mount("#app");
