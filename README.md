# TypedArray.js [![Build Status](https://travis-ci.org/uupaa/TypedArray.js.png)](http://travis-ci.org/uupaa/TypedArray.js)

[![npm](https://nodei.co/npm/uupaa.typedarray.js.png?downloads=true&stars=true)](https://nodei.co/npm/uupaa.typedarray.js/)

TypedArray utility functions.

## Document

- [TypedArray.js wiki](https://github.com/uupaa/TypedArray.js/wiki/TypedArray)
- [WebModule](https://github.com/uupaa/WebModule)
    - [Slide](http://uupaa.github.io/Slide/slide/WebModule/index.html)
    - [Development](https://github.com/uupaa/WebModule/wiki/Development)

## Run on

### Browser and node-webkit

```js
<script src="lib/TypedArray.js"></script>
<script>

console.log( TypedArray.BIG_ENDIAN );                           // false (in Intel Mac)
console.log( TypedArray.hton16( new Uint8Array([1,2]) ) );      // [2, 1]
console.log( TypedArray.ntoh16( new Uint8Array([1,2]) ) );      // [2, 1]
console.log( TypedArray.hton16( TypedArray.ntoh16( new Uint8Array([1,2]) ) ) ); // [1, 2]
console.log( TypedArray.toString( new Uint8Array([0x33, 0x34, 0x35, 0x36]) ) ); // "3456"
console.log( TypedArray.fromString("Hello") );                  // [72, 101, 108, 108, 111]
console.log( TypedArray.fromString("あいう") );                 // [66, 68, 70]
console.log( TypedArray.fromString("あいう", Uint16Array) );    // [12354, 12356, 12358]

TypedArray.toArrayBuffer("http://example.com/404.png", function(arrayBuffer) {
    //
});
</script>
```

`TypedArray.hexDump( TypedArray.fromString("あいうえお", Uint32Array) );`

```
ADRESS  0 1 2 3  4 5 6 7  8 9 A B  C D E F
------ -------- -------- -------- --------
000000 00003042 00003044 00003046 00003048
000004 0000304a
```

`TypedArray.hexDump( TypedArray.fromString("あいうえお", Uint16Array) );`

```
ADRESS  0 1 2 3  4 5 6 7  8 9 A B  C D E F
------ -------- -------- -------- --------
000000 30423044 30463048 304a
```

`TypedArray.hexDump( TypedArray.fromString("あいうえお", Uint8Array));`

```
ADRESS  0 1 2 3  4 5 6 7  8 9 A B  C D E F
------ -------- -------- -------- --------
000000 42444648 4a
```


### WebWorkers

```js
importScripts("lib/TypedArray.js");

```

### Node.js

```js
require("lib/TypedArray.js");

```

