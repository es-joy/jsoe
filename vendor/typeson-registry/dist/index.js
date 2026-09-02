class TypesonPromise{constructor(e){this.p=new Promise(e);}}TypesonPromise.__typeson__type__="TypesonPromise","undefined"!=typeof Symbol&&Object.defineProperty(TypesonPromise.prototype,Symbol.toStringTag,{get:()=>"TypesonPromise"}),TypesonPromise.prototype.then=function(e,t){return new TypesonPromise((n,r)=>{this.p.then(function(t){n(e?e(t):t);}).catch(function(e){return t?t(e):Promise.reject(e)}).then(n,r);})},TypesonPromise.prototype.catch=function(e){return this.then(void 0,e)},TypesonPromise.resolve=function(e){return new TypesonPromise(t=>{t(e);})},TypesonPromise.reject=function(e){return new TypesonPromise((t,n)=>{n(e);})},TypesonPromise.all=function(e){return new TypesonPromise(function(t,n){Promise.all(e.map(e=>e?.constructor&&"__typeson__type__"in e.constructor&&"TypesonPromise"===e.constructor.__typeson__type__?e.p:e)).then(t,n);})},TypesonPromise.race=function(e){return new TypesonPromise(function(t,n){Promise.race(e.map(e=>e?.constructor&&"__typeson__type__"in e.constructor&&"TypesonPromise"===e.constructor.__typeson__type__?e.p:e)).then(t,n);})},TypesonPromise.allSettled=function(e){return new TypesonPromise(function(t,n){Promise.allSettled(e.map(e=>e?.constructor&&"__typeson__type__"in e.constructor&&"TypesonPromise"===e.constructor.__typeson__type__?e.p:e)).then(t,n);})};const{hasOwn:e}=Object,t=Object.getPrototypeOf;function isThenable(e,t){return isObject(e)&&"function"==typeof e.then&&(!t||"function"==typeof e.catch)}function toStringTag(e){return Object.prototype.toString.call(e).slice(8,-1)}function hasConstructorOf(n,r){if(!n||"object"!=typeof n)return  false;const o=t(n);if(!o)return null===r;const s=e(o,"constructor")&&o.constructor;return "function"!=typeof s?null===r:r===s||(null!==r&&Function.prototype.toString.call(s)===Function.prototype.toString.call(r)||"function"==typeof r&&"string"==typeof s.__typeson__type__&&s.__typeson__type__===r.__typeson__type__)}function isPlainObject(e){if(!e||"Object"!==toStringTag(e))return  false;return !t(e)||hasConstructorOf(e,Object)}function isUserObject(e){if(!e||"Object"!==toStringTag(e))return  false;const n=t(e);return !n||(hasConstructorOf(e,Object)||isUserObject(n))}function isObject(e){return null!==e&&"object"==typeof e}function escapeKeyPathComponent(e){return e.replaceAll("''","''''").replace(/^$/u,"''").replaceAll("~","~0").replaceAll(".","~1")}function unescapeKeyPathComponent(e){return e.replaceAll("~1",".").replaceAll("~0","~").replace(/^''$/u,"").replaceAll("''''","''")}function getByKeyPath(t,n,r){if(""===n)return t;if(null===t||"object"!=typeof t)throw new TypeError("Unexpected non-object type");const o=n.indexOf("."),s=unescapeKeyPathComponent(-1===o?n:n.slice(0,o));if(!r||e(t,s)){if(-1!==o){const e=t[s];return void 0===e?void 0:getByKeyPath(e,n.slice(o+1),r)}return t[s]}}function setAtKeyPath(t,n,r,o){if(""===n)return r;let s=t,i=n;for(;;){if(!s||"object"!=typeof s)throw new TypeError("Unexpected non-object type");const n=i.indexOf("."),c=unescapeKeyPathComponent(-1===n?i:i.slice(0,n));if("__proto__"===c)throw new TypeError("Invalid property");if(-1===n)return s[c]=r,t;if(o&&!e(s,c))throw new TypeError("Invalid property");s=s[c],i=i.slice(n+1);}}function getJSONType(e){return null===e?"null":Array.isArray(e)?"array":typeof e}
/**
 * @file Typeson - JSON with types.
 * @license The MIT License (MIT)
 * @copyright (c) 2016-2018 David Fahlander, Brett Zamir
 */const{keys:n,hasOwn:r}=Object,{isArray:o}=Array,s=["type","replaced","iterateIn","iterateUnsetNumeric","iterateSymbols","addLength"];function setOwnEnumerable(e,t,n){Object.defineProperty(e,t,{configurable:true,enumerable:true,value:n,writable:true});}const i$1=["asyncIterator","hasInstance","isConcatSpreadable","iterator","match","matchAll","replace","search","species","split","toPrimitive","toStringTag","unscopables"];function nestedPathsFirst(e,t){if(""===e.keypath)return  -1;let n=e.keypath.match(/\./gu)??0,r=t.keypath.match(/\./gu)??0;return n&&(n=n.length),r&&(r=r.length),n>r?-1:n<r?1:e.keypath<t.keypath?-1:e.keypath>t.keypath?1:0}class Typeson{constructor(e){this.options=e,this.plainObjectReplacers=[],this.nonplainObjectReplacers=[],this.revivers={},this.types={},this.symbolsByName=Object.create(null),this.symbolsByValue=new Map;const t=e?.symbols;t&&Object.entries(t).forEach(([e,t])=>{if("symbol"!=typeof t)throw new TypeError("Non-symbol value supplied for `symbols` entry: "+e);this.symbolsByName[e]=t,this.symbolsByValue.set(t,e);});}stringify(e,t,n,r){r={...this.options,...r,stringification:true};const s=this.encapsulate(e,null,r);return o(s)?JSON.stringify(s[0],t,n):s.then(e=>JSON.stringify(e,t,n))}stringifySync(e,t,n,r){return this.stringify(e,t,n,{throwOnBadSyncType:true,...r,sync:true})}stringifyAsync(e,t,n,r){return this.stringify(e,t,n,{throwOnBadSyncType:true,...r,sync:false})}parse(e,t,n){return n={...this.options,...n,parse:true},this.revive(JSON.parse(e,t),n)}parseSync(e,t,n){return this.parse(e,t,{throwOnBadSyncType:true,...n,sync:true})}parseAsync(e,t,n){return this.parse(e,t,{throwOnBadSyncType:true,...n,sync:false})}specialTypeNames(e,t,n={}){return this.encapsulate(e,t,{...n,returnTypeNames:true})}rootTypeName(e,t,n={}){return this.encapsulate(e,t,{...n,iterateNone:true})}encapsulate(e,t,c){const a={sync:true,...this.options,...c},{sync:y}=a,l={},p={},u=[],h=[],f=[],b=!("cyclic"in a)||a.cyclic,{encapsulateObserver:d,encapsulateError:m}=a,finish=e=>{const t=Object.values(l);if(a.iterateNone)return t.length?t[0]:getJSONType(e);if(a.returnTypeNames)return !!t.length&&[...new Set(t)];const n=Object.keys(p).length>0,o=isObject(e)&&(r(e,"$types")||r(e,"$symbolKeys"));return n||t.length?(!o&&e&&isPlainObject(e)?t.length&&(e.$types=l):e={$:e,$types:{$:l}},n&&(e.$symbolKeys=p)):o&&(e={$:e,$types:true}),e},checkPromises=async(e,t)=>{const n=await Promise.all(t.map(e=>e[1].p));return await Promise.all(n.map(async function(n){const r=[],[o]=t.splice(0,1),[s,,i,c,a,y,l]=o,p=_encapsulate(s,n,i,c,r,true,l),u=hasConstructorOf(p,TypesonPromise);if(s&&u){return setOwnEnumerable(a,y,await p.p),checkPromises(e,r)}return s?setOwnEnumerable(a,y,p):e=u?p.p:p,checkPromises(e,r)})),e},_adaptBuiltinStateObjectProperties=(e,t,n)=>{Object.assign(e,t);const r=s.map(t=>{const n=e[t];return delete e[t],n});n(),s.forEach((t,n)=>{e[t]=r[n];});},_encapsulate=(e,t,s,c,y,f,b)=>{let v,O={};const w=d?function(n){const r=b??c.type??getJSONType(t);d(Object.assign(n??O,{keypath:e,value:t,cyclic:s,stateObj:c,promisesData:y,resolvingTypesonPromise:f,awaitingTypesonPromise:hasConstructorOf(t,TypesonPromise)},{type:r}));}:null,getEncapsulatedValue=(e,t,n)=>{try{return {value:_encapsulate(e,t[n],Boolean(s),c,y,f)}}catch(r){if(!m)throw r;const o=b??c.type??getJSONType(t),s=m({keypath:e,error:r,parent:t,key:n,stateObj:c,type:o});if(!s)throw r;if("substitute"in s)return {value:s.substitute,substitute:true};if(s.ignore)return;throw r}};if(["string","boolean","number","undefined"].includes(typeof t))return void 0===t||t===1/0||0===t||t===-1/0||Number.isNaN(t)?(v=c.replaced?t:replace(e,t,c,y,false,f,w),v!==t&&(O={replaced:v})):v=t,w&&w(),v;if(null===t)return w&&w(),t;if(s&&t&&"object"==typeof t&&!c.iterateIn&&!c.iterateUnsetNumeric){const n=u.indexOf(t);if(-1!==n)return l[e]="#",w&&w({cyclicKeypath:h[n]}),"#"+h[n];true===s&&(u.push(t),h.push(e));}const g=isPlainObject(t),T=o(t),P=(g||T)&&(!this.plainObjectReplacers.length||c.replaced)||c.iterateIn?t:replace(e,t,c,y,g||T,null,w);let j;if(P!==t?(v=P,O={replaced:P}):""===e&&hasConstructorOf(t,TypesonPromise)?(y.push([e,t,s,c,void 0,void 0,c.type]),v=t):T&&"object"!==c.iterateIn||"array"===c.iterateIn?(j=new Array(t.length),O={clone:j}):!g&&("object"!=typeof t||"toJSON"in t||hasConstructorOf(t,TypesonPromise)||hasConstructorOf(t,Promise)||hasConstructorOf(t,ArrayBuffer))&&"object"!==c.iterateIn?v=t:(j={},c.addLength&&(j.length=t.length),O={clone:j}),w&&w(),a.iterateNone)return j??v;if(!j)return v;if(c.iterateIn){for(const n in t){const o={ownKeys:r(t,n)};_adaptBuiltinStateObjectProperties(c,o,()=>{const r=e+(e?".":"")+escapeKeyPathComponent(n),o=getEncapsulatedValue(r,t,n),i=o&&o.value;hasConstructorOf(i,TypesonPromise)?y.push([r,i,Boolean(s),c,j,n,c.type]):o&&(void 0!==i||"substitute"in o)&&setOwnEnumerable(j,n,i);});}w&&w({endIterateIn:true,end:true});}else n(t).forEach(function(n){const r=e+(e?".":"")+escapeKeyPathComponent(n);_adaptBuiltinStateObjectProperties(c,{ownKeys:true},()=>{const e=getEncapsulatedValue(r,t,n),o=e&&e.value;hasConstructorOf(o,TypesonPromise)?y.push([r,o,Boolean(s),c,j,n,c.type]):e&&(void 0!==o||"substitute"in e)&&setOwnEnumerable(j,n,o);});}),w&&w({endIterateOwn:true,end:true}),(c.iterateSymbols||a.iterateSymbols)&&(Object.getOwnPropertySymbols(t).filter(e=>Object.prototype.propertyIsEnumerable.call(t,e)).forEach(n=>{const r=function resolveSymbolIdentity(e,t){const n=Symbol.keyFor(e);if(void 0!==n)return {for:n};const r=i$1.find(t=>Symbol[t]===e);if(r)return {wellKnown:r};const o=t.get(e);return void 0!==o?{registered:o}:null}(n,this.symbolsByValue);if(!r){if(a.throwOnUnregisteredSymbol)throw new TypeError("Cannot serialize a Symbol-keyed property whose Symbol has no portable identity (not global, not well-known, and not in the `symbols` option): "+String(n));return}const o=p[e]??=[],l={key:r};o.push(l);const u=o.length-1,h=`$symbolKeys.${escapeKeyPathComponent(e)}.${String(u)}.value`,f={value:t[n]};_adaptBuiltinStateObjectProperties(c,{ownKeys:true},()=>{const e=getEncapsulatedValue(h,f,"value"),t=e&&e.value;hasConstructorOf(t,TypesonPromise)?y.push([h,t,Boolean(s),c,l,"value",c.type]):e&&(void 0!==t||"substitute"in e)&&setOwnEnumerable(l,"value",t);});}),w&&w({endIterateSymbols:true,end:true}));if(c.iterateUnsetNumeric){const n=t.length;for(let r=0;r<n;r++){if(r in t)continue;const n=`${e}${e?".":""}${String(r)}`;_adaptBuiltinStateObjectProperties(c,{ownKeys:false},()=>{const e=_encapsulate(n,void 0,Boolean(s),c,y,f);hasConstructorOf(e,TypesonPromise)?y.push([n,e,Boolean(s),c,j,r,c.type]):void 0!==e&&setOwnEnumerable(j,r,e);});}w&&w({endIterateUnsetNumeric:true,end:true});}return j},replace=(e,t,n,r,o,s,i)=>{const c=o?this.plainObjectReplacers:this.nonplainObjectReplacers;let a=c.length;for(;a--;){const o=c[a];if(o.test(t,n)){const{type:c}=o;if(Object.hasOwn(this.revivers,c)){const t=l[e];l[e]=t?[c].concat(t):c;}if(Object.assign(n,{type:c,replaced:true}),(y||!o.replaceAsync)&&!o.replace)return i&&i({typeDetected:true}),_encapsulate(e,t,b&&"readonly",n,r,s,c);let a;if(i&&i({replacing:true}),y||!o.replaceAsync){if(void 0===o.replace)throw new TypeError("Missing replacer");a=o.replace(t,n);}else a=o.replaceAsync(t,n);return _encapsulate(e,a,b&&"readonly",n,r,s,c)}}return t},v=_encapsulate("",e,b,t??{},f);if(f.length)return y&&a.throwOnBadSyncType?(()=>{throw new TypeError("Sync method requested but async result obtained")})():Promise.resolve(checkPromises(v,f)).then(finish);if(!y&&a.throwOnBadSyncType)throw new TypeError("Async method requested but sync result obtained");return y&&a.stringification?[finish(v)]:y?finish(v):Promise.resolve(finish(v))}encapsulateSync(e,t,n){return this.encapsulate(e,t,{throwOnBadSyncType:true,...n,sync:true})}encapsulateAsync(e,t,n){return this.encapsulate(e,t,{throwOnBadSyncType:true,...n,sync:false})}revive(e,t){const s={sync:true,...this.options,...t},{sync:c}=s;function finishRevival(e){if(c)return e;if(s.throwOnBadSyncType)throw new TypeError("Async method requested but sync result obtained");return Promise.resolve(e)}if(!e||"object"!=typeof e||Array.isArray(e))return finishRevival(e);let a=e.$types;if(true===a)return finishRevival(e.$);const y=e.$symbolKeys;let l=void 0!==y;if(!a||"object"!=typeof a||Array.isArray(a)){if(!y)return finishRevival(e);a={};}const p=[],u=Object.create(null),h={};let f=true;a.$&&isPlainObject(a.$)&&(e=e.$,a=a.$,f=false,l=false,void 0!==y&&isObject(e)&&!r(e,"$symbolKeys")&&(e.$symbolKeys=y,l=true));const executeReviver=(e,t)=>{const[n]=this.revivers[e]??[];if(!n)throw new Error("Unregistered type: "+e);if(c&&!("revive"in n))return t;if(!c&&n.reviveAsync)return n.reviveAsync(t,h);if(n.revive)return n.revive(t,h);throw new Error("Missing reviver")},b=[];function checkUndefined(e){return hasConstructorOf(e,Undefined)?void 0:e}const reHomeSymbolKeys=e=>{if(!isObject(e))return;const t=l?e.$symbolKeys:y;t&&(Object.entries(t).forEach(([t,n])=>{const o=getByKeyPath(e,t,true);isObject(o)&&n.forEach(e=>{if(!r(e,"value"))return;const t=function resolveSymbolFromIdentity(e,t){if("for"in e)return Symbol.for(e.for);if("wellKnown"in e){const t=i$1.find(t=>t===e.wellKnown);if(!t)throw new Error("Unknown well-known Symbol: "+e.wellKnown);return Symbol[t]}if(!r(t,e.registered))throw new Error("Unregistered symbol: "+e.registered);return t[e.registered]}(e.key,this.symbolsByName),n=checkUndefined(e.value);e.descriptor?Object.defineProperty(o,t,{configurable:true,enumerable:true,writable:true,...e.descriptor,value:n}):o[t]=n;});}),l&&delete e.$symbolKeys);},d=(()=>{if(!a)throw new Error("Found bad `types`");const t=[];if(Object.entries(a).forEach(([e,n])=>{"#"!==n&&[].concat(n).forEach(n=>{const[,{plain:r}]=this.revivers[n]??[null,{}];r&&(t.push({keypath:e,type:n}),delete a[e]);});}),t.length)return t.sort(nestedPathsFirst),t.reduce(function reducer(t,{keypath:n,type:r}){if(isThenable(t))return t.then(e=>reducer(e,{keypath:n,type:r}));let o=getByKeyPath(e,n,true);if(o=executeReviver(r,o),hasConstructorOf(o,TypesonPromise))return o.then(t=>{const r=setAtKeyPath(e,n,t,true);r===t&&(e=r);});const s=setAtKeyPath(e,n,o,true);s===o&&(e=s);},void 0)})();let m;return hasConstructorOf(d,TypesonPromise)?m=d.then(()=>e):(m=function _revive(e,t,s,i,y){if(f&&"$types"===e)return;const l=b.length,h=r(a,e)?a[e]:void 0,d=o(t);if(d||isPlainObject(t)){const o=d?new Array(t.length):{};for(n(t).forEach(n=>{const r=_revive(e+(e?".":"")+escapeKeyPathComponent(n),t[n],s??o,o,n),set=e=>(hasConstructorOf(e,Undefined)?setOwnEnumerable(o,n,void 0):void 0!==e&&setOwnEnumerable(o,n,e),e);hasConstructorOf(r,TypesonPromise)?b.push(r.then(e=>set(e))):set(r);}),t=o;p.length;){const[[e,t,n,o]]=p,s=r(u,t),i=s?u[t]:getByKeyPath(e,t,true);if(!s&&void 0===i)break;setOwnEnumerable(n,o,i),p.shift();}}if(!h)return u[e]=t,t;if("#"===h){const e=t.slice(1),n=r(u,e),o=n?u[e]:getByKeyPath(s,e,true);return n||void 0!==o||p.push([s,e,i,y]),o}const applyType=t=>{const n=[].concat(h).reduce(function reducer(e,t){if(hasConstructorOf(e,TypesonPromise))return e.then(e=>reducer(e,t));if("string"!=typeof t)throw new TypeError("Bad type JSON");return executeReviver(t,e)},t);return hasConstructorOf(n,TypesonPromise)?n.then(t=>(u[e]=t,t)):(u[e]=n,n)};return !c&&b.length>l?TypesonPromise.all(b.slice(l)).then(()=>applyType(t)):applyType(t)}("",e,null),b.length&&(m=TypesonPromise.resolve(m).then(e=>TypesonPromise.all([e,...b])).then(([e])=>e))),y&&(isThenable(m)?m=m.then(e=>(reHomeSymbolKeys(e),e)):reHomeSymbolKeys(m)),isThenable(m)?c&&s.throwOnBadSyncType?(()=>{throw new TypeError("Sync method requested but async result obtained")})():hasConstructorOf(m,TypesonPromise)?m.p.then(checkUndefined):m:!c&&s.throwOnBadSyncType?(()=>{throw new TypeError("Async method requested but sync result obtained")})():c?checkUndefined(m):Promise.resolve(checkUndefined(m))}reviveSync(e,t){return this.revive(e,{throwOnBadSyncType:true,...t,sync:true})}reviveAsync(e,t){return this.revive(e,{throwOnBadSyncType:true,...t,sync:false})}register(e,t){const r=t??{},reg=e=>{o(e)?e.forEach(e=>{reg(e);}):n(e).forEach(t=>{if("#"===t)throw new TypeError("# cannot be used as a type name as it is reserved for cyclic objects");if(c.includes(t))throw new TypeError("Plain JSON object types are reserved as type names");let n=e[t];if([this.plainObjectReplacers,this.nonplainObjectReplacers].forEach(e=>{const n=e.findIndex(e=>e.type===t);-1!==n&&e.splice(n,1);}),delete this.revivers[t],delete this.types[t],"function"==typeof n){const e=n;n={test:t=>t&&t.constructor===e,replace:e=>({...e}),revive:t=>Object.assign(Object.create(e.prototype),t)};}else if(o(n)){const[e,t,r]=n;n={test:e,replace:t,revive:r};}if(!n?.test)return;const s={type:t,test:n.test.bind(n)};n.replace&&(s.replace=n.replace.bind(n)),n.replaceAsync&&(s.replaceAsync=n.replaceAsync.bind(n));const i="number"==typeof r.fallback?r.fallback:r.fallback?0:1/0;if(n.testPlainObjects?this.plainObjectReplacers.splice(i,0,s):this.nonplainObjectReplacers.splice(i,0,s),n.revive||n.reviveAsync){const e={};n.revive&&(e.revive=n.revive.bind(n)),n.reviveAsync&&(e.reviveAsync=n.reviveAsync.bind(n)),this.revivers[t]=[e,{plain:n.testPlainObjects}];}this.types[t]=n;});};return [].concat(e).forEach(e=>{reg(e);}),this}}class Undefined{}Undefined.__typeson__type__="TypesonUndefined";const c=["null","boolean","number","string","array","object"];

/*
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2017-2023 Brett Zamir, 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */

/**
 * @typedef {number} Integer
 */

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Use a lookup table to find the index.
var lookup = new Uint8Array(256);
for (var i = 0; i < chars.length; i++) {
  lookup[/** @type {number} */chars.codePointAt(i)] = i;
}

/**
 * @param {ArrayBuffer} arraybuffer
 * @param {Integer} [byteOffset]
 * @param {Integer} [lngth]
 * @returns {string}
 */
var encode = function encode(arraybuffer, byteOffset, lngth) {
  if (lngth === null || lngth === undefined) {
    lngth = arraybuffer.byteLength; // Needed for Safari
  }

  var bytes = new Uint8Array(arraybuffer, 0,
  // Default needed for Safari
  lngth);
  var len = bytes.length;
  var base64 = '';
  for (var _i = 0; _i < len; _i += 3) {
    base64 += chars[bytes[_i] >> 2];
    base64 += chars[(bytes[_i] & 3) << 4 | bytes[_i + 1] >> 4];
    base64 += chars[(bytes[_i + 1] & 15) << 2 | bytes[_i + 2] >> 6];
    base64 += chars[bytes[_i + 2] & 63];
  }
  if (len % 3 === 2) {
    base64 = base64.slice(0, -1) + '=';
  } else if (len % 3 === 1) {
    base64 = base64.slice(0, -2) + '==';
  }
  return base64;
};

/**
 * @param {string} base64
 * @param {{
 *   maxByteLength: number
 * }} [options]
 * @returns {ArrayBuffer}
 */
var decode = function decode(base64, options) {
  var len = base64.length;
  if (len % 4) {
    throw new Error('Bad base64 length: not divisible by four');
  }
  var bufferLength = base64.length * 0.75;
  var p = 0;
  var encoded1, encoded2, encoded3, encoded4;
  if (base64[base64.length - 1] === '=') {
    bufferLength--;
    if (base64[base64.length - 2] === '=') {
      bufferLength--;
    }
  }

  // @ts-expect-error Second argument is not yet standard
  var arraybuffer = new ArrayBuffer(bufferLength, options),
    bytes = new Uint8Array(arraybuffer);
  for (var _i2 = 0; _i2 < len; _i2 += 4) {
    // We know the result will not be undefined, as we have a text
    //   length divisible by four
    encoded1 = lookup[/** @type {number} */base64.codePointAt(_i2)];
    encoded2 = lookup[/** @type {number} */base64.codePointAt(_i2 + 1)];
    encoded3 = lookup[/** @type {number} */base64.codePointAt(_i2 + 2)];
    encoded4 = lookup[/** @type {number} */base64.codePointAt(_i2 + 3)];
    bytes[p++] = encoded1 << 2 | encoded2 >> 4;
    bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
    bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
  }
  return arraybuffer;
};

/**
 * @type {import('typeson').TypeSpecSet}
 */
const arraybuffer = {
    arraybuffer: {
        test (x) { return toStringTag(x) === 'ArrayBuffer'; },
        replace (
            b,
            /**
             * @type {import('typeson').StateObject &
             *   {buffers?: ArrayBuffer[]}}
             */
            stateObj
        ) {
            if (!stateObj.buffers) {
                stateObj.buffers = [];
            }
            const index = stateObj.buffers.indexOf(b);
            if (index !== -1) {
                return {index};
            }
            stateObj.buffers.push(b);
            return {
                s: encode(b),
                maxByteLength: b.maxByteLength,
                resizable: b.resizable
            };
        },
        revive (
            b64,
            /**
             * @type {import('typeson').StateObject &
             *   {buffers?: ArrayBuffer[]}}
             */
            stateObj
        ) {
            if (!stateObj.buffers) {
                stateObj.buffers = [];
            }
            if (Object.hasOwn(b64, 'index')) {
                return stateObj.buffers[
                    /**
                     * @type {{index: import('typeson').Integer}}
                     */
                    (b64).index
                ];
            }
            const buffer = decode(
                /** @type {string} */ (b64.s),
                b64.resizable
                    ? {maxByteLength: b64.maxByteLength}
                    : undefined
            );
            stateObj.buffers.push(buffer);
            return buffer;
        }
    }
};

// See also typed-arrays!

/* globals AudioData -- Polyfills */

/**
 * @type {import('typeson').TypeSpecSet}
 */
const audiodata = {
    audiodata: {
        test (x) {
            return toStringTag(x) === 'AudioData';
        },
        replace (audioData) {
            const {
                format, sampleRate, numberOfFrames, numberOfChannels,
                timestamp
            } = audioData;

            // 2. Determine plane layout based on audio format
            const isPlanar = format.endsWith('-planar');
            const numPlanes = isPlanar ? numberOfChannels : 1;

            // 3. Per the AudioData API, planes are laid out back-to-back
            //   within a single buffer, so compute their sizes up front
            const planeSizes = [];
            let totalSize = 0;
            for (let i = 0; i < numPlanes; i++) {
                const size = audioData.allocationSize({planeIndex: i});
                planeSizes.push(size);
                totalSize += size;
            }

            // 4. Copy the raw binary data out of each plane into its slot
            const data = new ArrayBuffer(totalSize);
            let offset = 0;
            for (let i = 0; i < numPlanes; i++) {
                const planeView = new Uint8Array(data, offset, planeSizes[i]);
                audioData.copyTo(planeView, {planeIndex: i});
                offset += planeSizes[i];
            }

            // 5. Return a clean, serializable manifest
            return {
                format, sampleRate, numberOfFrames, numberOfChannels,
                timestamp,
                data
            };
        },
        revive ({
            format, sampleRate, numberOfFrames, numberOfChannels,
            timestamp, data
        }) {
            return new AudioData({
                format, sampleRate, numberOfFrames, numberOfChannels,
                timestamp,
                data: new Uint8Array(data)
            });
        }
    }
};

/**
 * @type {import('typeson').TypeSpecSet}
 */
const bigintObject = {
    bigintObject: {
        test (x) {
            return typeof x === 'object' && hasConstructorOf(x, BigInt);
        },
        replace: String,
        revive (s) {
            return new Object(BigInt(/** @type {string} */ (s)));
        }
    }
};

/**
 * @type {import('typeson').TypeSpecSet}
 */
const bigint = {
    bigint: {
        test (x) {
            return typeof x === 'bigint';
        },
        replace: String,
        // eslint-disable-next-line @stylistic/max-len -- Long
        // eslint-disable-next-line unicorn/prefer-native-coercion-functions -- Clearer
        revive (s) {
            return BigInt(/** @type {string} */ (s));
        }
    }
};

/**
 * Not currently in use internally, but provided for parity.
 * @param {ArrayBuffer} buf
 * @returns {string}
 */
function arraybuffer2string (buf) {
    return new Uint8Array(buf).reduce(
        (s, byte) => s + String.fromCodePoint(byte), ''
    );
}

/**
 *
 * @param {string} str
 * @returns {ArrayBuffer}
 */
function string2arraybuffer (str) {
    /*
    // UTF-8 approaches
    const utf8 = unescape(encodeURIComponent(str));
    const arr = new Uint8Array(utf8.length);
    for (let i = 0; i < utf8.length; i++) {
        arr[i] = utf8.charCodeAt(i);
    }
    return arr.buffer;

    const utf8 = [];
    for (let i = 0; i < str.length; i++) {
        let charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6),
                0x80 | (charcode & 0x3f));
        } else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12),
                0x80 | ((charcode >> 6) & 0x3f),
                0x80 | (charcode & 0x3f));
        // surrogate pair
        } else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff) << 10) |
                (str.charCodeAt(i) & 0x3ff));
            utf8.push(0xf0 | (charcode >> 18),
                0x80 | ((charcode >> 12) & 0x3f),
                0x80 | ((charcode >> 6) & 0x3f),
                0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
    */
    /*
    // Working UTF-16 options (equivalents)
    const buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    const bufView = new Uint16Array(buf);
    for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
    */

    const array = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        // eslint-disable-next-line @stylistic/max-len -- Long
        // eslint-disable-next-line unicorn/prefer-code-point -- Iterating char. codes
        array[i] = str.charCodeAt(i); // & 0xff;
    }
    return array.buffer;
}

/* globals XMLHttpRequest, FileReader -- Polyfills */

/**
 * @type {import('typeson').TypeSpecSet}
 */
const blob = {
    blob: {
        test (x) { return toStringTag(x) === 'Blob'; },
        replace (b) { // Sync
            const req = new XMLHttpRequest();
            req.overrideMimeType('text/plain; charset=x-user-defined');
            req.open('GET', URL.createObjectURL(b), false); // Sync
            req.send();

            // Seems not feasible to accurately simulate
            /* c8 ignore next 3 */
            if (req.status !== 200 && req.status !== 0) {
                throw new Error('Bad Blob access: ' + req.status);
            }
            return {
                type: b.type,
                stringContents: req.responseText
            };
        },
        revive (obj) {
            const {
                type, stringContents
            } = /** @type {{type: string, stringContents: string}} */ (obj);
            return new Blob([string2arraybuffer(stringContents)], {type});
        },
        replaceAsync (b) {
            return new TypesonPromise((resolve, reject) => {
                /*
                if (b.isClosed) { // On MDN, but not in https://w3c.github.io/FileAPI/#dfn-Blob
                    reject(new Error('The Blob is closed'));
                    return;
                }
                */
                const reader = new FileReader();
                reader.addEventListener('load', () => {
                    resolve({
                        type: b.type,
                        stringContents: arraybuffer2string(
                            /** @type {ArrayBuffer} */ (reader.result)
                        )
                    });
                });
                // Seems not feasible to accurately simulate
                /* c8 ignore next 3 */
                reader.addEventListener('error', () => {
                    reject(reader.error);
                });
                // eslint-disable-next-line @stylistic/max-len -- Long
                // eslint-disable-next-line unicorn/prefer-blob-reading-methods -- Too new?
                reader.readAsArrayBuffer(b);
            });
        }
    }
};

/**
 * @todo We could use `import generateUUID from 'uuid/v4';` (but it needs
 *   crypto library, etc.; `rollup-plugin-node-builtins` doesn't recommend
 *   using its own version and though there is <https://www.npmjs.com/package/crypto-browserify>,
 *   it may be troublesome to bundle and not strongly needed)
 * @returns {string}
 */
function generateUUID () { //  Adapted from original: public domain/MIT: https://stackoverflow.com/a/8809472/271577
    /* c8 ignore next */
    let d = Date.now();

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replaceAll(/[xy]/gu, function (c) {
        /* eslint-disable no-bitwise, sonarjs/pseudo-random -- Convenient */
        const r = Math.trunc((d + (Math.random() * 16)) % 16);
        d = Math.floor(d / 16);
        return (c === 'x' ? r : ((r & 0x3) | 0x8)).toString(16);
        /* eslint-enable no-bitwise, sonarjs/pseudo-random -- Convenient */
    });
}

/**
 * @type {{[key: (symbol|string)]: any}}
 */
const cloneableObjectsByUUID = {};

/**
 * @type {import('typeson').TypeSpecSet}
 */
const cloneable = {
    cloneable: {
        test (x) {
            return x && typeof x === 'object' &&
                typeof x[Symbol.for('cloneEncapsulate')] === 'function';
        },
        replace (clonable) {
            const encapsulated = clonable[Symbol.for('cloneEncapsulate')]();
            const uuid = generateUUID();
            cloneableObjectsByUUID[uuid] = clonable;
            return {uuid, encapsulated};
        },
        revive (obj) {
            const {
                uuid, encapsulated
            } = /** @type {{uuid: string, encapsulated: any}} */ (obj);

            return cloneableObjectsByUUID[uuid][Symbol.for('cloneRevive')](
                encapsulated
            );
        }
    }
};

/**
 * @type {import('typeson').TypeSpecSet}
 */
const cryptokey = {
    cryptokey: {
        test (x) {
            return toStringTag(x) === 'CryptoKey' && x.extractable;
        },
        replaceAsync (
            /** @type {CryptoKey} */
            key
        ) {
            return new TypesonPromise(async (resolve, reject) => {
                /** @type {JsonWebKey} */
                let jwk;
                try {
                    jwk = await crypto.subtle.exportKey('jwk', key);
                // Our format should be valid and our key extractable
                /* c8 ignore next 4 */
                } catch (err) {
                    reject(err);
                    return;
                }
                resolve({
                    jwk,
                    algorithm: key.algorithm,
                    usages: key.usages
                });
            });
        },
        revive (obj) {
            const {
                jwk, algorithm, usages
            } = /**
                 * @type {{
                 *   jwk: JsonWebKey,
                 *   algorithm: KeyAlgorithm,
                 *   usages: KeyUsage[]
                 * }}
                 */ (obj);

            return crypto.subtle.importKey(
                'jwk', jwk, algorithm, true, usages
            );
        }
    }
};

/**
 * @type {import('typeson').TypeSpecSet}
 */
const dataview = {
    dataview: {
        test (x) { return toStringTag(x) === 'DataView'; },
        replace (
            {buffer, byteOffset, byteLength},
            /**
             * @type {import('typeson').StateObject & {
             *  buffers?: ArrayBuffer[]
             * }}
             */
            stateObj
        ) {
            if (!stateObj.buffers) {
                stateObj.buffers = [];
            }
            const index = stateObj.buffers.indexOf(buffer);
            if (index !== -1) {
                return {index, byteOffset, byteLength};
            }
            stateObj.buffers.push(buffer);
            return {
                encoded: encode(buffer),
                maxByteLength: buffer.maxByteLength,
                resizable: buffer.resizable,
                byteOffset,
                byteLength
            };
        },
        revive (
            b64Obj,
            /**
             * @type {import('typeson').StateObject & {
             *  buffers?: ArrayBuffer[]
             * }}
             */
            stateObj
        ) {
            if (!stateObj.buffers) {
                stateObj.buffers = [];
            }
            const {
                byteOffset, byteLength, encoded, index, maxByteLength,
                resizable
            } = b64Obj;
            let buffer;
            if ('index' in b64Obj) {
                buffer = stateObj.buffers[index];
            } else {
                buffer = decode(
                    encoded,
                    resizable
                        ? {maxByteLength}
                        : maxByteLength
                );
                stateObj.buffers.push(buffer);
            }
            return new DataView(buffer, byteOffset, byteLength);
        }
    }
};

/**
 * @type {import('typeson').TypeSpecSet}
 */
const date = {
    date: {
        test (x) { return toStringTag(x) === 'Date'; },
        replace (dt) {
            const time = dt.getTime();
            if (Number.isNaN(time)) {
                return 'NaN';
            }
            return time;
        },
        revive (time) {
            if (time === 'NaN') {
                return new Date(NaN);
            }
            return new Date(time);
        }
    }
};

/**
 * @type {import('typeson').TypeSpecSet}
 */
const domexception = {
    domexception: {
        test (x) { return toStringTag(x) === 'DOMException'; },
        replace (de) {
            // `code` is based on `name` and readonly, so no
            //   need to keep here
            return {
                name: de.name,
                message: de.message
            };
        },
        revive ({message, name}) {
            return new DOMException(message, name);
        }
    }
};

/* globals DOMMatrix, DOMMatrixReadOnly -- Polyfills */

/**
 * @type {import('typeson').TypeSpecSet}
 */
const dommatrix = {};

/* c8 ignore next */
if (typeof DOMMatrix !== 'undefined') {
    create$5(DOMMatrix);
}
/* c8 ignore next */
if (typeof DOMMatrixReadOnly !== 'undefined') {
    create$5(DOMMatrixReadOnly);
}

/**
 * @param {typeof DOMMatrix|typeof DOMMatrixReadOnly} Ctor
 * @returns {void}
 */
function create$5 (Ctor) {
    dommatrix[Ctor.name.toLowerCase()] = {
        test (x) { return toStringTag(x) === Ctor.name; },
        replace (dm) {
            if (dm.is2D) {
                return {
                    a: dm.a,
                    b: dm.b,
                    c: dm.c,
                    d: dm.d,
                    e: dm.e,
                    f: dm.f
                };
            }
            return {
                m11: dm.m11,
                m12: dm.m12,
                m13: dm.m13,
                m14: dm.m14,
                m21: dm.m21,
                m22: dm.m22,
                m23: dm.m23,
                m24: dm.m24,
                m31: dm.m31,
                m32: dm.m32,
                m33: dm.m33,
                m34: dm.m34,
                m41: dm.m41,
                m42: dm.m42,
                m43: dm.m43,
                m44: dm.m44
            };
        },
        revive (o) {
            if (Object.hasOwn(o, 'a')) {
                return new Ctor([o.a, o.b, o.c, o.d, o.e, o.f]);
            }
            return new Ctor([
                o.m11, o.m12, o.m13, o.m14,
                o.m21, o.m22, o.m23, o.m24,
                o.m31, o.m32, o.m33, o.m34,
                o.m41, o.m42, o.m43, o.m44
            ]);
        }
    };
}

/* globals DOMPoint, DOMPointReadOnly -- Polyfills */

/**
 * @type {import('typeson').TypeSpecSet}
 */
const dompoint = {};

/* c8 ignore next */
if (typeof DOMPoint !== 'undefined') {
    create$4(DOMPoint);
}
/* c8 ignore next */
if (typeof DOMPointReadOnly !== 'undefined') {
    create$4(DOMPointReadOnly);
}

/**
 * @param {typeof DOMPoint|typeof DOMPointReadOnly} Ctor
 * @returns {void}
 */
function create$4 (Ctor) {
    dompoint[Ctor.name.toLowerCase()] = {
        test (x) { return toStringTag(x) === Ctor.name; },
        replace (dp) {
            return {
                x: dp.x,
                y: dp.y,
                z: dp.z,
                w: dp.w
            };
        },
        revive ({x, y, z, w}) {
            return new Ctor(x, y, z, w);
        }
    };
}

/* globals DOMQuad -- Polyfills */

/**
 * @type {import('typeson').TypeSpecSet}
 */
const domquad = {
    domquad: {
        test (x) { return toStringTag(x) === 'DOMQuad'; },
        replace (dp) {
            return {
                p1: dp.p1,
                p2: dp.p2,
                p3: dp.p3,
                p4: dp.p4
            };
        },
        revive ({p1, p2, p3, p4}) {
            return new DOMQuad(p1, p2, p3, p4);
        }
    }
};

/* globals DOMRect, DOMRectReadOnly -- Polyfills */

/**
 * @type {import('typeson').TypeSpecSet}
 */
const domrect = {};

/* c8 ignore next */
if (typeof DOMRect !== 'undefined') {
    create$3(DOMRect);
}
/* c8 ignore next */
if (typeof DOMRectReadOnly !== 'undefined') {
    create$3(DOMRectReadOnly);
}

/**
 * @param {typeof DOMRect|typeof DOMRectReadOnly} Ctor
 * @returns {void}
 */
function create$3 (Ctor) {
    domrect[Ctor.name.toLowerCase()] = {
        test (x) { return toStringTag(x) === Ctor.name; },
        replace (dr) {
            return {
                x: dr.x,
                y: dr.y,
                width: dr.width,
                height: dr.height
            };
        },
        revive ({x, y, width, height}) {
            return new Ctor(x, y, width, height);
        }
    };
}

/* globals EncodedAudioChunk -- Polyfills */

/**
 * @type {import('typeson').TypeSpecSet}
 */
const encodedaudiochunk = {
    encodedaudiochunk: {
        test (x) {
            return toStringTag(x) === 'EncodedAudioChunk';
        },
        replace (chunk) {
            const {type, timestamp, duration, byteLength} = chunk;
            const data = new ArrayBuffer(byteLength);
            chunk.copyTo(data);
            return {type, timestamp, duration, data};
        },
        revive ({type, timestamp, duration, data}) {
            // A browser's `EncodedAudioChunkInit` has no `duration`
            //   default and coerces an explicit `null`/`undefined` to `0`,
            //   so only pass it through when the source chunk actually
            //   had one (otherwise `duration` must round-trip as `null`).
            /** @type {EncodedAudioChunkInit} */
            const init = {type, timestamp, data: new Uint8Array(data)};
            if (duration !== null && duration !== undefined) {
                init.duration = duration;
            }
            return new EncodedAudioChunk(init);
        }
    }
};

/* globals EncodedVideoChunk -- Polyfills */

/**
 * @type {import('typeson').TypeSpecSet}
 */
const encodedvideochunk = {
    encodedvideochunk: {
        test (x) {
            return toStringTag(x) === 'EncodedVideoChunk';
        },
        replace (chunk) {
            const {type, timestamp, duration, byteLength} = chunk;
            const data = new ArrayBuffer(byteLength);
            chunk.copyTo(data);
            return {type, timestamp, duration, data};
        },
        revive ({type, timestamp, duration, data}) {
            // A browser's `EncodedVideoChunkInit` has no `duration`
            //   default and coerces an explicit `null`/`undefined` to `0`,
            //   so only pass it through when the source chunk actually
            //   had one (otherwise `duration` must round-trip as `null`).
            /** @type {EncodedVideoChunkInit} */
            const init = {type, timestamp, data: new Uint8Array(data)};
            if (duration !== null && duration !== undefined) {
                init.duration = duration;
            }
            return new EncodedVideoChunk(init);
        }
    }
};

/**
 * @type {import('typeson').TypeSpecSet}
 */
const error = {
    error: {
        test (x) { return toStringTag(x) === 'Error'; },
        replace ({
            name, message, cause, stack, fileName, lineNumber, columnNumber
        }) {
            return {
                name, message, cause, stack, fileName, lineNumber, columnNumber
            };
        },
        revive (obj) {
            const e = /**
                       * @type {{
                       *   name: string,
                       *   cause: Error,
                       *   stack: string,
                       *   fileName?: string,
                       *   lineNumber?: import('typeson').Integer,
                       *   columnNumber?: import('typeson').Integer
                       * }}
                       */ (new Error(obj.message));
            /* eslint-disable unicorn/no-error-property-assignment -- Ok */
            e.name = obj.name;
            e.cause = obj.cause;
            e.stack = obj.stack;
            /* eslint-enable unicorn/no-error-property-assignment -- Ok */
            e.fileName = obj.fileName;
            e.lineNumber = obj.lineNumber;
            e.columnNumber = obj.columnNumber;

            return e;
        }
    }
};

/* globals InternalError -- Optional */

/**
 * @type {import('typeson').TypeSpecSet}
 */
const errors = {};

// JS standard
// eslint-disable-next-line unicorn/no-top-level-side-effects -- Too cumbersome
[
    TypeError, RangeError, SyntaxError, ReferenceError,
    EvalError, URIError
].forEach((error) => create$2(error));

/* c8 ignore next 3 */
if (typeof AggregateError !== 'undefined') {
    create$2(AggregateError);
}

/* c8 ignore next 5 */
// @ts-expect-error Non-standard
if (typeof InternalError === 'function') {
    // @ts-expect-error Non-standard
    create$2(InternalError);
}

/**
 * Non-standard.
 * @typedef {{
 *     new (message?: string, options?: ErrorOptions): EvalError;
 * (message?: string, options?: ErrorOptions): EvalError;
 * }} InternalErrorConstructor
 */

/**
 * Comprises all built-in errors.
 * @param {TypeErrorConstructor|RangeErrorConstructor
 *   |SyntaxErrorConstructor|ReferenceErrorConstructor
 *   |EvalErrorConstructor|URIErrorConstructor
 *   |AggregateErrorConstructor|InternalErrorConstructor
 * } Ctor
 * @returns {void}
 */
function create$2 (Ctor) {
    errors[Ctor.name.toLowerCase()] = {
        test (x) { return hasConstructorOf(x, Ctor); },
        replace ({
            name, message, cause, stack, fileName,
            lineNumber, columnNumber, errors: errs
        }) {
            return {
                name, message, cause, stack, fileName,
                lineNumber, columnNumber, errors: errs
            };
        },
        revive (obj) {
            const isAggregateError = typeof AggregateError !== 'undefined' &&
                Ctor === AggregateError;
            const e = /**
                       * @type {{
                       *   name: string,
                       *   cause: Error,
                       *   stack: string,
                       *   fileName?: string,
                       *   lineNumber?: import('typeson').Integer,
                       *   columnNumber?: import('typeson').Integer
                       * }}
                       */ (isAggregateError
                    ? new /** @type {AggregateErrorConstructor} */ (
                        Ctor
                    )(obj.errors, obj.message)
                    : new /**
                           * @type {TypeErrorConstructor|RangeErrorConstructor|
                           *   SyntaxErrorConstructor|ReferenceErrorConstructor|
                           *   EvalErrorConstructor|URIErrorConstructor|
                           *   InternalErrorConstructor}
                           */ (Ctor)(obj.message));

            e.name = obj.name;
            e.cause = obj.cause;
            e.stack = obj.stack;
            e.fileName = obj.fileName;
            e.lineNumber = obj.lineNumber;
            e.columnNumber = obj.columnNumber;

            return e;
        }
    };
}

/* globals XMLHttpRequest, FileReader -- Polyfills */

/**
 * @type {import('typeson').TypeSpecSet}
 */
const file = {
    file: {
        test (x) { return toStringTag(x) === 'File'; },
        replace (f) { // Sync
            const req = new XMLHttpRequest();
            req.overrideMimeType('text/plain; charset=x-user-defined');
            req.open('GET', URL.createObjectURL(f), false); // Sync
            req.send();

            // Seems not feasible to accurately simulate
            /* c8 ignore next 3 */
            if (req.status !== 200 && req.status !== 0) {
                throw new Error('Bad File access: ' + req.status);
            }
            return {
                type: f.type,
                stringContents: req.responseText,
                name: f.name,
                lastModified: f.lastModified
            };
        },
        revive ({name, type, stringContents, lastModified}) {
            return new File([string2arraybuffer(stringContents)], name, {
                type,
                lastModified
            });
        },
        replaceAsync (f) {
            return new TypesonPromise(function (resolve, reject) {
                /*
                if (f.isClosed) { // On MDN, but not in https://w3c.github.io/FileAPI/#dfn-Blob
                    reject(new Error('The File is closed'));
                    return;
                }
                */
                const reader = new FileReader();
                reader.addEventListener('load', function () {
                    resolve({
                        type: f.type,
                        stringContents: arraybuffer2string(
                            /** @type {ArrayBuffer} */ (reader.result)
                        ),
                        name: f.name,
                        lastModified: f.lastModified
                    });
                });
                // Seems not feasible to accurately simulate
                /* c8 ignore next 3 */
                reader.addEventListener('error', function () {
                    reject(reader.error);
                });
                // eslint-disable-next-line @stylistic/max-len -- Long
                // eslint-disable-next-line unicorn/prefer-blob-reading-methods -- Too new?
                reader.readAsArrayBuffer(f);
            });
        }
    }
};

/**
 * @type {import('typeson').TypeSpecSet}
 */
const filelist = {
    file: file.file,
    filelist: {
        test (x) { return toStringTag(x) === 'FileList'; },
        replace (fl) {
            const arr = [];
            for (let i = 0; i < fl.length; i++) {
                arr[i] = fl.item(i);
            }
            return arr;
        },
        revive (o) {
            /**
             * `FileList` polyfill.
             */
            class FileList {
                /**
                 * Set private properties and length.
                 */
                constructor () {
                    // eslint-disable-next-line prefer-rest-params -- API
                    this._files = arguments[0];
                    this.length = this._files.length;
                }
                /**
                 * @param {import('typeson').Integer} index
                 * @returns {File}
                 */
                item (index) {
                    return this._files[index];
                }
                /* eslint-disable class-methods-use-this -- Not needed */
                /**
                 * @returns {"FileList"}
                 */
                get [Symbol.toStringTag] () {
                    /* eslint-enable class-methods-use-this -- Not needed */
                    return 'FileList';
                }
            }

            // @ts-ignore Override API
            return new FileList(o);
        }
    }
};

/* globals document, OffscreenCanvas, createImageBitmap -- Polyfills */
// `ImageBitmap` is browser / DOM specific. It also can only work
//  same-domain (or CORS)


/**
 * @type {import('typeson').TypeSpecSet}
 */
const imagebitmap = {
    imagebitmap: {
        test (x) {
            return toStringTag(x) === 'ImageBitmap' ||
                // In Node, our polyfill sets the dataset on a canvas
                //  element as JSDom no longer allows overriding toStringTag
                (x && x.dataset && x.dataset.toStringTag === 'ImageBitmap');
        },
        replace (bm) {
            const canvas = document.createElement('canvas');
            const ctx = /** @type {CanvasRenderingContext2D} */ (
                canvas.getContext('2d')
            );
            ctx.drawImage(bm, 0, 0);
            return {
                width: bm.width, height: bm.height, dataURL: canvas.toDataURL()
            };
        },
        revive (o) {
            const canvas = typeof OffscreenCanvas === 'undefined'
                ? document.createElement('canvas')
                /* c8 ignore next -- Browser only */
                : new OffscreenCanvas(o.width, o.height);
            /*
            var req = new XMLHttpRequest();
            req.open('GET', o, false); // Sync
            if (req.status !== 200 && req.status !== 0) {
              throw new Error('Bad ImageBitmap access: ' + req.status);
            }
            req.send();
            return req.responseText;
            */
            const ctx = /** @type {CanvasRenderingContext2D} */ (
                canvas.getContext('2d')
            );
            const img = document.createElement('img');
            // The onload is needed by some browsers per https://stackoverflow.com/a/4776378/271577
            img.addEventListener('load', function () {
                ctx.drawImage(img, 0, 0);
            });
            img.src = o.dataURL;
            // Works in contexts allowing an `ImageBitmap` (We might use
            //   `OffscreenCanvas.transferToBitmap` when supported)
            return typeof OffscreenCanvas === 'undefined'
                ? canvas
                /* c8 ignore next 3 -- Browser only */
                : /** @type {OffscreenCanvas} */ (
                    canvas
                ).transferToImageBitmap();
        },
        reviveAsync (o) {
            const canvas = document.createElement('canvas');
            const ctx = /** @type {CanvasRenderingContext2D} */ (
                canvas.getContext('2d')
            );
            const img = document.createElement('img');
            // The onload is needed by some browsers per https://stackoverflow.com/a/4776378/271577
            img.addEventListener('load', function () {
                ctx.drawImage(img, 0, 0);
            });
            img.src = o.dataURL;

            return new TypesonPromise(async (resolve, reject) => {
                try {
                    const resp = await createImageBitmap(canvas);
                    resolve(resp);
                /* c8 ignore next 3 */
                } catch (err) {
                    reject(err);
                }
            });
        }
    }
};

/* globals ImageData -- Polyfills */
// `ImageData` is browser / DOM specific (though `node-canvas` has it
//   available on `Canvas`).


/**
 * @type {import('typeson').TypeSpecSet}
 */
const imagedata = {
    imagedata: {
        test (x) { return toStringTag(x) === 'ImageData'; },
        replace (d) {
            const pixelFormat = toStringTag(d.data) === 'Float16Array'
                /* c8 ignore next -- Not yet supported in `canvas` */
                ? 'rgba-float16'
                : 'rgba-unorm8';
            return {
                // Ensure `length` gets preserved for revival
                array: [...d.data],
                width: d.width,
                height: d.height,
                pixelFormat,
                colorSpace: d.colorSpace
            };
        },
        revive (o) {
            const {array, width, height, colorSpace, pixelFormat} = o;
            /* c8 ignore next 12 -- Not yet supported in `canvas` */
            if (pixelFormat === 'rgba-float16') {
                return new ImageData(
                    // @ts-expect-error -- Ok
                    new Float16Array(array),
                    width,
                    height,
                    {
                        colorSpace,
                        pixelFormat
                    }
                );
            }
            return new ImageData(
                new Uint8ClampedArray(array), width, height, {
                    colorSpace,
                    pixelFormat
                }
            );
        }
    }
};

/**
 * @type {import('typeson').TypeSpecSet}
 */
const infinity = {
    infinity: {
        test (x) { return x === Infinity; },
        replace (/* n */) { return 'Infinity'; },
        revive (/* s */) { return Infinity; }
    }
};

/**
 * @type {import('typeson').Spec}
 */
const IntlCollator = {
    test (x) { return hasConstructorOf(x, Intl.Collator); },
    replace (c) { return c.resolvedOptions(); },
    revive (options) { return new Intl.Collator(options.locale, options); }
};

/**
 * @type {import('typeson').Spec}
 */
const IntlDateTimeFormat = {
    test (x) { return hasConstructorOf(x, Intl.DateTimeFormat); },
    replace (dtf) { return dtf.resolvedOptions(); },
    revive (options) {
        return new Intl.DateTimeFormat(options.locale, options);
    }
};

/**
 * @type {import('typeson').Spec}
 */
const IntlNumberFormat = {
    test (x) { return hasConstructorOf(x, Intl.NumberFormat); },
    replace (nf) { return nf.resolvedOptions(); },
    revive (options) { return new Intl.NumberFormat(options.locale, options); }
};

const intlTypes = {
    IntlCollator,
    IntlDateTimeFormat,
    IntlNumberFormat
};

/**
 * @type {import('typeson').TypeSpecSet}
 */
const map = {
    map: {
        test (x) { return toStringTag(x) === 'Map'; },
        replace (mp) { return mp.entries().toArray(); },
        revive (entries) { return new Map(entries); }
    }
};

/**
 * @type {import('typeson').TypeSpecSet}
 */
const nan = {
    nan: {
        test (x) { return Number.isNaN(x); },
        replace (/* n */) { return 'NaN'; },
        revive (/* s */) { return NaN; }
    }
};

/**
 * @type {import('typeson').TypeSpecSet}
 */
const negativeInfinity = {
    negativeInfinity: {
        test (x) { return x === -Infinity; },
        replace (/* n */) { return '-Infinity'; },
        revive (/* s */) { return -Infinity; }
    }
};

/**
 * @type {import('typeson').TypeSpecSet}
 */
const negativeZero = {
    negativeZero: {
        test (x) {
            return Object.is(x, -0);
        },
        replace (/* n */) {
            // Just adding 0 here for minimized space; will still revive as -0
            return 0;
        },
        revive (/* s */) {
            return -0;
        }
    }
};

/**
 * @type {import('typeson').TypeSpecSet}
 */
const nonbuiltinIgnore = {
    nonbuiltinIgnore: {
        test (x) {
            return x && typeof x === 'object' && !Array.isArray(x) && ![
                'Object',
                // `Proxy` and `Reflect`, two other built-in objects, will also
                //   have a `toStringTag` of `Object`; we don't want built-in
                //   function objects, however
                'Boolean', 'Number', 'String',
                'Error', 'RegExp', 'Math', 'Date',
                'Map', 'Set',
                'JSON',
                'ArrayBuffer', 'SharedArrayBuffer', 'DataView',
                'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array',
                'Uint16Array', 'Int32Array', 'Uint32Array',
                'Float32Array', 'Float64Array',
                'Promise',
                'String Iterator', 'Array Iterator',
                'Map Iterator', 'Set Iterator',
                'WeakMap', 'WeakSet',
                'Atomics', 'Module'
            ].includes(toStringTag(x));
        },
        replace (/* rexp */) {
            // Not in use
        }
    }
};

// This module is for objectified primitives (such as `new Number(3)` or
//      `new String("foo")`)
/* eslint-disable no-new-wrappers, unicorn/new-for-builtins -- Deliberate */

/**
 * @type {import('typeson').TypeSpecSet}
 */
const primitiveObjects = {
    // String Object (not primitive string which need no type spec)
    StringObject: {
        test (x) {
            return toStringTag(x) === 'String' && typeof x === 'object';
        },
        replace: String, // convert to primitive string
        revive (s) { return new String(s); } // Revive to an objectified string
    },
    // Boolean Object (not primitive boolean which need no type spec)
    BooleanObject: {
        test (x) {
            return toStringTag(x) === 'Boolean' &&
                typeof x === 'object';
        },
        replace (o) {
            // convert to primitive boolean
            return o.valueOf();
        },
        revive (b) {
            // Revive to an objectified Boolean
            return new Boolean(b);
        }
    },
    // Number Object (not primitive number which need no type spec)
    NumberObject: {
        test (x) {
            return toStringTag(x) === 'Number' && typeof x === 'object';
        },
        // `_encapsulate`'s nested-replace guard (`_stateObj.replaced`)
        //   means a bare `NaN`/`Infinity`/`-Infinity`/`-0` returned here
        //   would skip the sentinel treatment the bare `nan`/`infinity`/
        //   `negativeZero` type specs normally give those values (since
        //   we're already inside this spec's own `replace()`) -- JSON
        //   can't represent them, so they'd otherwise silently become
        //   `null` (or lose their sign, for `-0`). Encode them the same
        //   way those specs do, directly, rather than relying on that
        //   nested pass.
        replace (o) {
            const n = o.valueOf();
            if (Number.isNaN(n)) {
                return 'NaN';
            }
            if (n === Infinity) {
                return 'Infinity';
            }
            if (n === -Infinity) {
                return '-Infinity';
            }
            if (Object.is(n, -0)) {
                // A plain `0` here would be indistinguishable from a
                //   genuine positive `0` once round-tripped through JSON
                //   (which can't represent the sign), so this needs its
                //   own sentinel too, same as the others above.
                return '-0';
            }
            return n;
        },
        // Revive to an objectified number
        revive (n) {
            if (n === 'NaN') {
                return new Number(NaN);
            }
            if (n === 'Infinity') {
                return new Number(Infinity);
            }
            if (n === '-Infinity') {
                return new Number(-Infinity);
            }
            if (n === '-0') {
                return new Number(-0);
            }
            return new Number(n);
        }
    }
};

/**
 * @type {import('typeson').TypeSpecSet}
 */
const promise = {
    promise: {
        test (x) {
            return toStringTag(x) === 'Promise';
        },
        replaceAsync (prom) {
            return new TypesonPromise(async (resolve) => {
                try {
                    resolve({
                        value: await prom
                    });
                } catch (error) {
                    resolve({
                        error
                    });
                }
            });
        },
        revive (o) {
            return o.error
                ? Promise.reject(o.error)
                : Promise.resolve(o.value);
        }
    }
};

/**
 * @type {import('typeson').TypeSpecSet}
 */
const quotaexceedederror = {
    quotaexceedederror: {
        test (x) { return toStringTag(x) === 'QuotaExceededError'; },
        replace ({message, quota, requested}) {
            return {message, quota, requested};
        },
        revive ({message, quota, requested}) {
            /** @type {{quota?: number, requested?: number}} */
            const options = {};
            if (quota !== null && quota !== undefined) {
                options.quota = quota;
            }
            if (requested !== null && requested !== undefined) {
                options.requested = requested;
            }
            return new QuotaExceededError(message, options);
        }
    }
};

/**
 * @type {import('typeson').TypeSpecSet}
 */
const regexp = {
    regexp: {
        test (x) { return toStringTag(x) === 'RegExp'; },
        replace (rexp) {
            return {
                source: rexp.source,
                flags: (rexp.global ? 'g' : '') +
                    (rexp.ignoreCase ? 'i' : '') +
                    (rexp.multiline ? 'm' : '') +
                    (rexp.sticky ? 'y' : '') +
                    (rexp.unicode ? 'u' : '') +
                    (rexp.unicodeSets ? 'v' : '') +
                    (rexp.hasIndices ? 'd' : '') +
                    (rexp.dotAll ? 's' : '')
            };
        },
        revive ({source, flags}) { return new RegExp(source, flags); }
    }
};

// Here we allow the exact same non-plain object, function, and symbol
//  instances to be resurrected (assuming the same session/environment);
//  plain objects are ignored by Typeson so not presently available and
//  we consciously exclude arrays


/**
 * @type {{[key: string]: any}}
 */
const resurrectableObjectsByUUID = {};

/**
 * @type {import('typeson').TypeSpecSet}
 */
const resurrectable = {
    resurrectable: {
        test (x) {
            return x &&
                !Array.isArray(x) &&
                ['object', 'function', 'symbol'].includes(typeof x);
        },
        replace (rsrrctble) {
            const uuid = generateUUID();
            resurrectableObjectsByUUID[uuid] = rsrrctble;
            return uuid;
        },
        revive (serializedResurrectable) {
            return resurrectableObjectsByUUID[serializedResurrectable];
        }
    }
};

/**
 * @type {import('typeson').TypeSpecSet}
 */
const set = {
    set: {
        test (x) { return toStringTag(x) === 'Set'; },
        replace (st) {
            return st.values().toArray();
        },
        revive (values) {
            return new Set(values);
        }
    }
};

/**
 * @type {import('typeson').TypeSpecSet}
 */
const symbol = {
    symbol: {
        test (x) {
            return typeof x === 'symbol';
        },
        replace (sym) {
            return {
                global: Symbol.keyFor(sym) !== undefined,
                sym: String(sym).slice(7, -1)
            };
        },
        revive (o) {
            return o.global ? Symbol.for(o.sym) : Symbol(o.sym);
        }
    }
};

// Support all kinds of typed arrays (views of ArrayBuffers)

/**
 * @type {import('typeson').TypeSpecSet}
 */
const typedArraysSocketIO = {};

/**
 * @param {Int8ArrayConstructor|Uint8ArrayConstructor
 *   |Uint8ClampedArrayConstructor|Int16ArrayConstructor
 *   |Uint16ArrayConstructor|Int32ArrayConstructor
 *   |Uint32ArrayConstructor|Float32ArrayConstructor
 *   |Float64ArrayConstructor|Float16ArrayConstructor
 *   |BigInt64ArrayConstructor|BigUint64ArrayConstructor
 * } TypedArray
 * @returns {void}
 */
function create$1 (TypedArray) {
    const typeName = TypedArray.name;
    typedArraysSocketIO[typeName.toLowerCase()] = {
        test (x) { return toStringTag(x) === typeName; },
        replace (a) {
            return (a.byteOffset === 0 &&
                a.byteLength === a.buffer.byteLength
                ? a
                // socket.io supports streaming ArrayBuffers.
                // If we have a typed array representing a portion
                //   of the buffer, we need to clone
                //   the buffer before leaving it to socket.io.
                : a.slice(0)).buffer;
        },
        revive (buf) {
            // One may configure socket.io to revive binary data as
            //    Buffer or Blob.
            // We should therefore not rely on that the instance we
            //   get here is an ArrayBuffer
            // If not, let's assume user wants to receive it as
            //   configured with socket.io.
            return toStringTag(buf) === 'ArrayBuffer'
                ? new TypedArray(buf)
                : buf;
        }
    };
}

if (typeof Int8Array === 'function') {
    // Those constructors are added in ES6 as a group.
    // If we have Int8Array, we can assume the rest also exists.

    [
        Int8Array,
        Uint8Array,
        Uint8ClampedArray,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
        Float32Array,
        Float64Array,
        ...(typeof BigInt64Array === 'function'
            ? [BigInt64Array, BigUint64Array]
            /* c8 ignore next */
            : []),
        ...(typeof Float16Array === 'function'
            ? [Float16Array]
            /* c8 ignore next */
            : [])
    ].forEach((TypedArray) => create$1(TypedArray));
}

/**
 * @type {import('typeson').TypeSpecSet}
 */
const typedArrays = {};

/**
 * @typedef {Int8ArrayConstructor|Uint8ArrayConstructor
 *   |Uint8ClampedArrayConstructor
 *   |Int16ArrayConstructor|Uint16ArrayConstructor
 *   |Int32ArrayConstructor|Uint32ArrayConstructor
 *   |Float32ArrayConstructor
 *   |Float64ArrayConstructor
 *   |BigInt64ArrayConstructor|BigUint64ArrayConstructor
 *   |Float16ArrayConstructor} TypedArrayConstructor
 */

/**
 * @param {TypedArrayConstructor} TypedArray
 * @returns {void}
 */
function create (TypedArray) {
    const typeName = TypedArray.name;

    typedArrays[typeName.toLowerCase()] = {
        test (x) { return toStringTag(x) === typeName; },
        replace (
            {buffer, byteOffset, length: l},
            /**
             * @type {import('typeson').StateObject & {
             *   buffers?: ArrayBuffer[]
             * }}
             */
            stateObj
        ) {
            if (!stateObj.buffers) {
                stateObj.buffers = [];
            }
            const index = stateObj.buffers.indexOf(buffer);
            if (index !== -1) {
                return {index, byteOffset, length: l};
            }
            stateObj.buffers.push(buffer);
            return {
                maxByteLength: buffer.maxByteLength,
                resizable: buffer.resizable,
                encoded: encode(buffer),
                byteOffset,
                length: l
            };
        },
        revive (
            b64Obj,
            /**
             * @type {import('typeson').StateObject & {
             *   buffers?: ArrayBuffer[]
             * }}
             */
            stateObj
        ) {
            if (!stateObj.buffers) {
                stateObj.buffers = [];
            }
            const {
                byteOffset, length: len, encoded, index, maxByteLength,
                resizable
            } = b64Obj;
            let buffer;
            if ('index' in b64Obj) {
                buffer = stateObj.buffers[index];
            } else {
                buffer = decode(
                    encoded,
                    resizable
                        ? {maxByteLength}
                        : undefined
                );
                stateObj.buffers.push(buffer);
            }

            return new TypedArray(buffer, byteOffset, len);
        }
    };
}

if (typeof Int8Array === 'function') {
    // Those constructors are added in ES6 as a group.
    // If we have Int8Array, we can assume the rest also exists.
    [
        Int8Array,
        Uint8Array,
        Uint8ClampedArray,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
        Float32Array,
        Float64Array,
        ...(typeof BigInt64Array === 'function'
            ? [BigInt64Array, BigUint64Array]
            /* c8 ignore next */
            : []),
        ...(typeof Float16Array === 'function'
            ? [Float16Array]
            /* c8 ignore next */
            : [])
    ].forEach((TypedArray) => create(TypedArray));
}

// This does not preserve `undefined` in sparse arrays; see the `undef`
//  or `sparse-undefined` preset

/**
 * @type {import('typeson').TypeSpecSet}
 */
const undef$1 = {
    undef: {
        test (x, stateObj) {
            return typeof x === 'undefined' &&
                (stateObj.ownKeys || !('ownKeys' in stateObj));
        },
        replace (/* n */) { return 0; },
        revive (/* s */) {
            // Will add `undefined` (returning `undefined` would instead
            //   avoid explicitly setting)
            return new Undefined();
        }
    }
};

/**
 * @type {import('typeson').TypeSpecSet}
 */
const userObject = {
    userObject: {
        test (x /* , stateObj */) { return isUserObject(x); },
        replace (n) { return {...n}; },
        revive (s) { return s; }
    }
};

/* globals VideoFrame -- Polyfills */

/**
 * @type {import('typeson').TypeSpecSet}
 */
const videoframe = {
    videoframe: {
        test (x) {
            return toStringTag(x) === 'VideoFrame';
        },
        replaceAsync (frame) {
            return new TypesonPromise(async (resolve, reject) => {
                try {
                    const {
                        format, codedWidth, codedHeight, timestamp, duration,
                        visibleRect, displayWidth, displayHeight, colorSpace
                    } = frame;

                    const data = new ArrayBuffer(frame.allocationSize());
                    await frame.copyTo(data);

                    resolve({
                        format, codedWidth, codedHeight, timestamp, duration,
                        visibleRect: {
                            x: visibleRect.x,
                            y: visibleRect.y,
                            width: visibleRect.width,
                            height: visibleRect.height
                        },
                        displayWidth, displayHeight,
                        colorSpace: {
                            primaries: colorSpace.primaries,
                            transfer: colorSpace.transfer,
                            matrix: colorSpace.matrix,
                            fullRange: colorSpace.fullRange
                        },
                        data
                    });
                /* c8 ignore next 3 -- How to simulate? */
                } catch (err) {
                    reject(err);
                }
            });
        },
        revive ({
            format, codedWidth, codedHeight, timestamp, duration,
            visibleRect, displayWidth, displayHeight, colorSpace, data
        }) {
            // A browser's `VideoFrameBufferInit` has no `duration` default
            //   and coerces an explicit `null`/`undefined` to `0`, so only
            //   pass it through when the source frame actually had one
            //   (otherwise `duration` must round-trip as `null`).
            /** @type {VideoFrameBufferInit} */
            const init = {
                format, codedWidth, codedHeight, timestamp,
                visibleRect, displayWidth, displayHeight, colorSpace
            };
            if (duration !== null && duration !== undefined) {
                init.duration = duration;
            }
            return new VideoFrame(new Uint8Array(data), init);
        }
    }
};

/* globals WebTransportError -- Newer API */

/**
 * @type {import('typeson').TypeSpecSet}
 */
const webtransporterror = {
    webtransporterror: {
        test (x) { return toStringTag(x) === 'WebTransportError'; },
        // Note that we can't support the `source` property (defaults
        //   to `stream` instead of `session`)
        replace ({message, streamErrorCode}) {
            return {message, streamErrorCode};
        },
        revive ({message, streamErrorCode}) {
            // TS lib still models the older two-argument
            //   `(message, options)` form; browsers implement a single
            //   `init` object (which also carries `message`).
            // @ts-expect-error - More recent API
            return new WebTransportError({message, streamErrorCode});
        }
    }
};

/**
 * @type {import('typeson').Preset}
 */
const arrayNonindexKeys = [
    {
        arrayNonindexKeys: {
            testPlainObjects: true,
            test (x, stateObj) {
                if (Array.isArray(x)) {
                    if (
                        // By avoiding serializing arrays into objects which
                        //  have only positive-integer keys, we reduce
                        //  size and improve revival performance; arrays with
                        //  non-index keys will be larger however
                        Object.keys(x).some((k) => {
                            //  No need to check for `isNaN` or
                            //   `isNaN(Number.parseInt())` as `NaN` will be
                            //   treated as a string.
                            //  No need to do check as
                            //   `Number.parseInt(Number())` since scientific
                            //   notation will be pre-resolved if a number
                            //   was given, and it will otherwise be a string
                            return String(Number(k)) !== k;
                        })
                    ) {
                        stateObj.iterateIn = 'object';
                        stateObj.addLength = true;
                    }
                    return true;
                }
                return false;
            },
            replace (a, stateObj) {
                // Catch sparse undefined
                stateObj.iterateUnsetNumeric = true;
                return a;
            },
            revive (o) {
                if (Array.isArray(o)) {
                    return o;
                }

                /**
                 * @type {{[key: string]: any}}
                 */
                const arr = [];
                // No map here as may be a sparse array (including
                //   with `length` set)
                Object.entries(o).forEach(([key, val]) => {
                    arr[key] = val;
                });
                return arr;
            }
        }
    },
    {
        sparseUndefined: {
            test (x, stateObj) {
                return typeof x === 'undefined' && stateObj.ownKeys === false;
            },
            replace (/* n */) { return 0; },
            revive (/* s */) { return undefined; } // Will avoid adding anything
        }
    }
];

/**
 * @type {import('typeson').Preset}
 */
const specialNumbers = [
    nan,
    infinity,
    negativeInfinity,
    negativeZero
];

/* This preset includes types that are built-in into the JavaScript
    language itself, this should work universally.

  Types that were added in ES6 or beyond will be checked before inclusion
   so that this module can be consumed by both ES5 and ES6 environments.

  Some types cannot be encapsulated because their inner state is private:
    `WeakMap`, `WeakSet`.

  The Function type is not included because their closures would not be
    serialized, so a revived Function that uses closures would not behave
    as expected.

  Symbols are similarly not included.
*/


/**
 * @type {import('typeson').Preset}
 */
const expObj$1 = [
    undef$1,
    // ES5
    arrayNonindexKeys, primitiveObjects, specialNumbers,
    date, error, errors, regexp
].concat(
    // ES2015 (ES6)
    /* c8 ignore next */
    typeof Map === 'function' ? map : [],
    /* c8 ignore next */
    typeof Set === 'function' ? set : [],
    /* c8 ignore next */
    typeof ArrayBuffer === 'function' ? arraybuffer : [],
    /* c8 ignore next */
    typeof Uint8Array === 'function' ? typedArrays : [],
    /* c8 ignore next */
    typeof DataView === 'function' ? dataview : [],
    /* c8 ignore next */
    typeof Intl !== 'undefined' ? intlTypes : [],

    /* c8 ignore next */
    typeof BigInt !== 'undefined' ? [bigint, bigintObject] : []
);

/*
When communicating via `postMessage()` (`Worker.postMessage()` or
`window.postMessage()`), the browser will use a similar algorithm as Typeson
does to encapsulate and revive all items in the structure (aka the structured
clone algorithm). This algorithm supports all built-in types as well as many
DOM types. Therefore, only types that are not included in the structured clone
algorithm need to be registered, which is:

* Error (now included in structured cloning)
* Specific Errors like SyntaxError, TypeError, etc. (now included in structured
*   cloning)
* Any custom type you want to send across window- or worker boundraries

This preset will only include the Error types and you can register your
custom types after having registered these.
*/


/**
 * @type {import('typeson').Preset}
 */
const postmessage = [
    error,
    errors
];

/**
 * @type {import('typeson').Preset}
 */
const socketio = [
    expObj$1,
    // Leave ArrayBuffer as is, and let socket.io stream it instead.
    {arraybuffer: null},
    // Encapsulate TypedArrays in ArrayBuffers instead of base64 strings.
    typedArraysSocketIO
];

/**
 * @type {import('typeson').Preset}
 */
const sparseUndefined = [
    {
        sparseArrays: {
            testPlainObjects: true,
            test (x) { return Array.isArray(x); },
            replace (a, stateObj) {
                stateObj.iterateUnsetNumeric = true;
                return a;
            }
        }
    },
    {
        sparseUndefined: {
            test (x, stateObj) {
                return typeof x === 'undefined' && stateObj.ownKeys === false;
            },
            replace (/* n */) { return 0; },
            revive (/* s */) { return undefined; } // Will avoid adding anything
        }
    }
];

/* This preset includes types for the Structured Cloning Algorithm. */


/**
 * @type {import('typeson').Preset}
 */
const expObj = [
    // ES5
    userObject, // Processed last (non-builtin)

    undef$1,
    arrayNonindexKeys, primitiveObjects, specialNumbers,
    date, regexp,

    // Non-built-ins
    imagedata,
    imagebitmap, // Async return
    file,
    filelist,
    blob,
    error,
    errors
].concat(
    // ES2015 (ES6)
    /* c8 ignore next */
    typeof Map === 'function' ? map : [],
    /* c8 ignore next */
    typeof Set === 'function' ? set : [],
    /* c8 ignore next */
    typeof ArrayBuffer === 'function' ? arraybuffer : [],
    /* c8 ignore next */
    typeof Uint8Array === 'function' ? typedArrays : [],
    /* c8 ignore next */
    typeof DataView === 'function' ? dataview : [],
    /* c8 ignore next */
    typeof crypto !== 'undefined' ? cryptokey : [],
    /* c8 ignore next */
    typeof BigInt !== 'undefined' ? [bigint, bigintObject] : [],
    /* c8 ignore next */
    typeof DOMException !== 'undefined' ? domexception : [],
    /* c8 ignore next */
    typeof QuotaExceededError !== 'undefined' ? quotaexceedederror : [],
    /* c8 ignore next */
    typeof WebTransportError !== 'undefined' ? webtransporterror : [],
    /* c8 ignore next */
    typeof DOMRect !== 'undefined' ? domrect : [],
    /* c8 ignore next */
    typeof DOMPoint !== 'undefined' ? dompoint : [],
    /* c8 ignore next */
    typeof DOMQuad !== 'undefined' ? domquad : [],
    /* c8 ignore next */
    typeof DOMMatrix !== 'undefined' ? dommatrix : [],
    /* c8 ignore next */
    typeof AudioData !== 'undefined' ? audiodata : [],
    /* c8 ignore next */
    typeof EncodedAudioChunk !== 'undefined' ? encodedaudiochunk : [],
    /* c8 ignore next */
    typeof EncodedVideoChunk !== 'undefined' ? encodedvideochunk : [],
    /* c8 ignore next */
    typeof VideoFrame !== 'undefined' ? videoframe : []
);

/**
 * @param {BufferSource} buffer
 * @returns {boolean}
 */
function isBufferDetached (buffer) {
    // Use the standard property if available
    // @ts-expect-error - More recent API
    if (typeof buffer.detached === 'boolean') {
        // @ts-expect-error - More recent API
        return buffer.detached;
    }
    /* c8 ignore next 14 -- Older browsers */

    // Fallback check via byteLength and constructor test
    if (buffer.byteLength !== 0) {
        return false;
    }

    try {
        // @ts-expect-error Ok
        // eslint-disable-next-line no-new -- Throwaway
        new Uint8Array(buffer);
        return false;
    } catch {
        return true;
    }
}

/**
 * @type {import('typeson').Preset}
 */
const structuredCloningThrowing = expObj.concat({
    checkDataCloneException: {
        test (val) {
            // Should also throw with:
            // 1. `IsCallable` (covered by `typeof === 'function'` or a
            //       function's `toStringTag`)
            // 2. internal slots besides [[Prototype]] or [[Extensible]] (e.g.,
            //        [[PromiseState]] or [[WeakMapData]])
            // 3. exotic object (e.g., `Proxy`) (unless an `%ObjectPrototype%`
            //      intrinsic object) (which does not have default
            //      behavior for one or more of the essential internal methods
            //      that are limited to the following for non-function objects
            //      (we auto-exclude functions):
            //      [[GetPrototypeOf]],[[SetPrototypeOf]],[[IsExtensible]],
            //      [[PreventExtensions]],[[GetOwnProperty]],
            //      [[DefineOwnProperty]],[[HasProperty]],
            //      [[Get]],[[Set]],[[Delete]],[[OwnPropertyKeys]]);
            //      except for the standard, built-in exotic objects, we'd need
            //      to know whether these methods had distinct behaviors
            // Note: There is no apparent way for us to detect a `Proxy` and
            //      reject (Chrome at least is not rejecting anyways)
            const stringTag = ({}.toString.call(val).slice(8, -1));
            if (
                [
                    // Symbol's `toStringTag` is only "Symbol" for its initial
                    //   value, so we check `typeof`
                    'symbol',
                    // All functions including bound function exotic objects
                    'function'
                ].includes(typeof val) ||
                [
                    // A non-array exotic object
                    'Arguments',
                    // A non-array exotic object
                    'Module',
                    // Promise instances have an extra slot ([[PromiseState]])
                    //    but not throwing in Chrome `postMessage`
                    'Promise',
                    // WeakMap instances have an extra slot ([[WeakMapData]])
                    //    but not throwing in Chrome `postMessage`
                    'WeakMap',
                    // WeakSet instances have an extra slot ([[WeakSetData]])
                    //    but not throwing in Chrome `postMessage`
                    'WeakSet',

                    // HTML-SPECIFIC
                    'Event',
                    // Also in Node `worker_threads` (currently experimental)
                    'MessageChannel',
                    'MessagePort'
                ].includes(stringTag) ||
                // Node's native `worker_threads` `MessageChannel`/
                //   `MessagePort` don't set `Symbol.toStringTag` per
                //      https://github.com/nodejs/node/issues/65527
                //   (verified directly:
                //   `{}.toString.call(new MessageChannel())` is
                //   `"[object Object]"`, and `.port1`'s is
                //   `"[object EventTarget]"`, its own base class), so the
                //   `stringTag` check above can't catch them there; a real
                //   browser's `MessagePort`/`MessageChannel` already match
                //   via `stringTag` (or, for `MessagePort`, would need its
                //   own `stringTag` entry if ever seen failing to match) --
                //   this is purely a fallback for environments (like Node)
                //   that don't set the tag.
                (val && val.constructor && [
                    'MessageChannel', 'MessagePort'
                ].includes(val.constructor.name)) ||
                // 1. `IsDetachedBuffer` (a process not called within the
                //      ECMAScript spec)
                ([
                    'ArrayBuffer',
                    'DataView',
                    'Int8Array',
                    'Uint8Array',
                    'Uint8ClampedArray',
                    'Int16Array',
                    'Uint16Array',
                    'Int32Array',
                    'Uint32Array',
                    'Float32Array',
                    'Float64Array',
                    'BigInt64Array',
                    'BigUint64Array'
                ].includes(stringTag) && isBufferDetached(val)) ||
                /*
                // isClosed is no longer documented
                ((stringTag === 'Blob' || stringTag === 'File') &&
                    val.isClosed) ||
                */
                (val && typeof val === 'object' &&
                    // Duck-type DOM node objects (non-array exotic?
                    //    objects which cannot be cloned by the SCA)
                    typeof val.nodeType === 'number' &&
                    typeof val.insertBefore === 'function')
            ) {
                throw new DOMException(
                    'The object cannot be cloned.', 'DataCloneError'
                );
            }
            return false;
        }
    }
});

/**
 * @type {import('typeson').Preset}
 */
const structuredCloningForStorage = structuredCloningThrowing.concat({
    checkSharedArrayBufferException: {
        test (val) {
            // Per https://webidl.spec.whatwg.org/#idl-SharedArrayBuffer ,
            //   `SharedArrayBuffer` is a structured-cloneable *transferable*
            //   type only for `postMessage`-style contexts (with
            //   `crossOriginIsolated`); storage-oriented consumers of the
            //   structured clone algorithm (e.g. IndexedDB) reject it
            //   outright instead, so this isn't part of the more general
            //   `structuredCloningThrowing` preset this one builds on.
            if (({}.toString.call(val).slice(8, -1)) === 'SharedArrayBuffer') {
                throw new DOMException(
                    'The object cannot be cloned.', 'DataCloneError'
                );
            }
            return false;
        }
    }
});

/**
 * @type {import('typeson').Preset}
 */
const undef = [
    sparseUndefined,
    undef$1
];

/**
 * @type {import('typeson').Preset}
 */
const universal = [
    expObj$1
    // TODO: Add types that are de-facto universal even though not
    //   built-in into ecmasript standard.
];

export { c as JSON_TYPES, Typeson, TypesonPromise, Undefined, arrayNonindexKeys, arraybuffer, audiodata, bigint, bigintObject, blob, expObj$1 as builtin, cloneable, cryptokey, dataview, date, domexception, dommatrix, dompoint, domquad, domrect, encodedaudiochunk, encodedvideochunk, error, errors, escapeKeyPathComponent, file, filelist, getByKeyPath, getJSONType, hasConstructorOf, imagebitmap, imagedata, infinity, intlTypes, isObject, isPlainObject, isThenable, isUserObject, map, nan, negativeInfinity, negativeZero, nonbuiltinIgnore, postmessage, primitiveObjects, promise, quotaexceedederror, regexp, resurrectable, set, setAtKeyPath, socketio, sparseUndefined, specialNumbers, expObj as structuredCloning, structuredCloningForStorage, structuredCloningThrowing, symbol, toStringTag, typedArrays, typedArraysSocketIO as typedArraysSocketio, undef$1 as undef, undef as undefPreset, unescapeKeyPathComponent, universal, userObject, videoframe, webtransporterror };
//# sourceMappingURL=index.js.map
