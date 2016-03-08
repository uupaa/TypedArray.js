# TypedArray.js [![Build Status](https://travis-ci.org/uupaa/TypedArray.js.svg)](https://travis-ci.org/uupaa/TypedArray.js)

[![npm](https://nodei.co/npm/uupaa.typedarray.js.svg?downloads=true&stars=true)](https://nodei.co/npm/uupaa.typedarray.js/)

TypedArray utility functions.


This module made of [WebModule](https://github.com/uupaa/WebModule).

## Documentation
- [Spec](https://github.com/uupaa/TypedArray.js/wiki/)
- [API Spec](https://github.com/uupaa/TypedArray.js/wiki/TypedArray)

## Browser, NW.js and Electron

```js
<script src="<module-dir>/lib/WebModule.js"></script>
<script src="<module-dir>/lib/TypedArray.js"></script>
<script>

TypedArray.BIG_ENDIAN                           // -> false (ARM, Intel CPU)
TypedArray.hton16( new Uint8Array([1,2]) )      // -> [2, 1]
TypedArray.ntoh16( new Uint8Array([1,2]) )      // -> [2, 1]
TypedArray.hton16( TypedArray.ntoh16( new Uint8Array([1,2]) ) ) // -> [1, 2]
TypedArray.expand( new Uint32Array([1,2,3]) )   // -> Uint32Array([1,2,3,0,0,0])

TypedArray.toString( new Uint8Array([0x33, 0x34, 0x35, 0x36]) ) // -> "3456"
TypedArray.fromString("Hello")                  // -> [72, 101, 108, 108, 111]
TypedArray.fromString("あいう")                 // -> [66, 68, 70]
TypedArray.fromString("あいう", Uint16Array)    // -> [12354, 12356, 12358]

TypedArray.concat(new Uint8Array(10), new Uint8Array(20)) // -> new Uint8Array(30)
</script>
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

