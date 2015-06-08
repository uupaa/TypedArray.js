# TypedArray.js [![Build Status](https://travis-ci.org/uupaa/TypedArray.js.svg)](https://travis-ci.org/uupaa/TypedArray.js)

[![npm](https://nodei.co/npm/uupaa.typedarray.js.svg?downloads=true&stars=true)](https://nodei.co/npm/uupaa.typedarray.js/)



- TypedArray.js made of [WebModule](https://github.com/uupaa/WebModule).
- [Spec](https://github.com/uupaa/TypedArray.js/wiki/TypedArray)

## Browser and NW.js(node-webkit)

```js
<script src="<module-dir>/lib/WebModule.js"></script>
<script src="<module-dir>/lib/TypedArray.js"></script>
<script>

console.log( WebModule.TypedArray.BIG_ENDIAN );                           // false (in Intel Mac)
console.log( WebModule.TypedArray.hton16( new Uint8Array([1,2]) ) );      // [2, 1]
console.log( WebModule.TypedArray.ntoh16( new Uint8Array([1,2]) ) );      // [2, 1]
console.log( WebModule.TypedArray.hton16( WebModule.TypedArray.ntoh16( new Uint8Array([1,2]) ) ) ); // [1, 2]
console.log( WebModule.TypedArray.toString( new Uint8Array([0x33, 0x34, 0x35, 0x36]) ) ); // "3456"
console.log( WebModule.TypedArray.fromString("Hello") );                  // [72, 101, 108, 108, 111]
console.log( WebModule.TypedArray.fromString("あいう") );                 // [66, 68, 70]
console.log( WebModule.TypedArray.fromString("あいう", Uint16Array) );    // [12354, 12356, 12358]

WebModule.TypedArray.toArrayBuffer("http://example.com/404.png", function(arrayBuffer) {
    //
});
</script>
```

`WebModule.TypedArray.hexDump( WebModule.TypedArray.fromString("あいうえお", Uint32Array) );`

```
ADRESS  0 1 2 3  4 5 6 7  8 9 A B  C D E F
------ -------- -------- -------- --------
000000 00003042 00003044 00003046 00003048
000004 0000304a
```

`WebModule.TypedArray.hexDump( WebModule.TypedArray.fromString("あいうえお", Uint16Array) );`

```
ADRESS  0 1 2 3  4 5 6 7  8 9 A B  C D E F
------ -------- -------- -------- --------
000000 30423044 30463048 304a
```

`WebModule.TypedArray.hexDump( WebModule.TypedArray.fromString("あいうえお", Uint8Array));`

```
ADRESS  0 1 2 3  4 5 6 7  8 9 A B  C D E F
------ -------- -------- -------- --------
000000 42444648 4a
```


## WebWorkers

```js
importScripts("<module-dir>lib/WebModule.js");
importScripts("<module-dir>lib/TypedArray.js");

```

## Node.js

```js
require("<module-dir>lib/WebModule.js");
require("<module-dir>lib/TypedArray.js");

```

