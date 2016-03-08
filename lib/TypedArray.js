(function moduleExporter(name, closure) {
"use strict";

var entity = GLOBAL["WebModule"]["exports"](name, closure);

if (typeof module !== "undefined") {
    module["exports"] = entity;
}
return entity;

})("TypedArray", function moduleClosure(global) {
"use strict";

// --- dependency modules ----------------------------------
// --- define / local variables ----------------------------
var VERIFY  = global["WebModule"]["verify"]  || false;
var VERBOSE = global["WebModule"]["verbose"] || false;

// --- class / interfaces ----------------------------------
var TypedArray = {
    "BIG_ENDIAN":   !new Uint8Array(new Uint16Array([1]).buffer)[0],

    // hton (convert host-byte-order to network-byte-order)
    "hton2":        TypedArray_swap2,           // TypedArray.hton2(source:TypedArray|Array):Array
    "hton4":        TypedArray_swap4,           // TypedArray.hton4(source:TypedArray|Array):Array
    "hton8":        TypedArray_swap8,           // TypedArray.hton8(source:TypedArray|Array):Array

    // ntoh (convert network-byte-order to host-byte-order)
    "ntoh2":        TypedArray_swap2,           // TypedArray.ntoh2(source:TypedArray|Array):Array
    "ntoh4":        TypedArray_swap4,           // TypedArray.ntoh4(source:TypedArray|Array):Array
    "ntoh8":        TypedArray_swap8,           // TypedArray.ntoh8(source:TypedArray|Array):Array

    // expand buffer
    "expand":       TypedArray_expand,          // TypedArray.expand(source:TypedArray):TypedArray

    // read bytes (big-endian)
    "read1":        TypedArray_read1,           // TypedArray.read1(view:Object):UINT32
    "read2":        TypedArray_read2,           // TypedArray.read2(view:Object):UINT32
    "read3":        TypedArray_read3,           // TypedArray.read3(view:Object):UINT32
    "read4":        TypedArray_read4,           // TypedArray.read4(view:Object):UINT32

    // read bytes (little-endian)
    "read2LE":      TypedArray_read2LE,         // TypedArray.read2LE(view:Object):UINT32
    "read3LE":      TypedArray_read3LE,         // TypedArray.read3LE(view:Object):UINT32
    "read4LE":      TypedArray_read4LE,         // TypedArray.read4LE(view:Object):UINT32

    // convert TypedArray to/from String
    "toString":     TypedArray_toString,        // TypedArray.toString(source:TypedArray|Array = null):BinaryString
    "fromString":   TypedArray_fromString,      // TypedArray.fromString(source:BinaryString, type:Function = Uint8Array):TypedArray

    // concat buffer
    "concat":       TypedArray_concat,          // TypedArray.concat(...:TypedArray):TypedArray

    "repository":   "https://github.com/uupaa/TypedArray.js", // GitHub repository URL. http://git.io/Help
};

// --- implements ------------------------------------------
function TypedArray_swap2(source) { // @arg TypedArray|Array
                                    // @ret Array
    return TypedArray["BIG_ENDIAN"] ? [ source[0], source[1] ]  // [0,1] -> [0,1]
                                    : [ source[1], source[0] ]; // [0,1] -> [1,0]
}

function TypedArray_swap4(source) { // @arg TypedArray|Array
                                    // @ret Array
    return TypedArray["BIG_ENDIAN"] ? [ source[0], source[1], source[2], source[3] ]  // [0,1,2,3] -> [0,1,2,3]
                                    : [ source[3], source[2], source[1], source[0] ]; // [0,1,2,3] -> [3,2,1,0]
}

function TypedArray_swap8(source) { // @arg TypedArray|Array
                                    // @ret Array
    return TypedArray["BIG_ENDIAN"] ? [ source[0], source[1], source[2], source[3],   // [0,1,2,3,4,5,6,7] -> [0,1,2,3,4,5,6,7]
                                        source[4], source[5], source[6], source[7] ]
                                    : [ source[7], source[6], source[5], source[4],   // [0,1,2,3,4,5,6,7] -> [7,6,5,4,3,2,1,0]
                                        source[3], source[2], source[1], source[0] ];
}

function TypedArray_read1(view) { // @arg Object - { source:TypedArray, cursor:UINT32 }
                                  // @ret UINT32
    return view.source[view.cursor++] >>> 0;
}

function TypedArray_read2(view) { // @arg Object - { source:TypedArray, cursor:UINT32 }
                                  // @ret UINT32
    // [0x12, 0x34] -> 0x12 << 8 | 0x34
    return ((view.source[view.cursor++]  <<  8) |
             view.source[view.cursor++]) >>> 0;
}

function TypedArray_read3(view) { // @arg Object - { source:TypedArray, cursor:UINT32 }
                                  // @ret UINT32
    // [0x12, 0x34, 0x56] -> 0x12 << 16 | 0x34 << 8 | 0x56
    return ((view.source[view.cursor++]  << 16) |
            (view.source[view.cursor++]  <<  8) |
             view.source[view.cursor++]) >>> 0;
}

function TypedArray_read4(view) { // @arg Object - { source:TypedArray, cursor:UINT32 }
                                  // @ret UINT32
    // [0x12, 0x34, 0x56, 0x78] -> 0x12 << 24 | 0x34 << 16 | 0x56 << 8 | 0x78
    return ((view.source[view.cursor++]  << 24) |
            (view.source[view.cursor++]  << 16) |
            (view.source[view.cursor++]  <<  8) |
             view.source[view.cursor++]) >>> 0;
}

function TypedArray_read2LE(view) { // @arg Object - { source:TypedArray, cursor:UINT32 }
                                    // @ret UINT32
    // [0x34, 0x12] -> 0x34 | 0x12 << 8 = 0x1234
    return ((view.source[view.cursor++]) |
             view.source[view.cursor++] << 8) >>> 0;
}

function TypedArray_read3LE(view) { // @arg Object - { source:TypedArray, cursor:UINT32 }
                                    // @ret UINT32
    // [0x56, 0x34, 0x12] -> 0x56 | 0x34 << 8 | 0x12 << 16 = 0x123456
    return ((view.source[view.cursor++]) |
            (view.source[view.cursor++] << 8) |
             view.source[view.cursor++] << 16) >>> 0;
}

function TypedArray_read4LE(view) { // @arg Object - { source:TypedArray, cursor:UINT32 }
                                    // @ret UINT32
    // [0x78, 0x56, 0x34, 0x12] -> 0x78 | 0x56 << 8 | 0x34 << 16 | 0x12 << 23 = 0x12345678
    return ((view.source[view.cursor++]) |
            (view.source[view.cursor++] << 8)  |
            (view.source[view.cursor++] << 16) |
             view.source[view.cursor++] << 24) >>> 0;
}

function TypedArray_expand(source) { // @arg TypedArray - Uint[n]Array, Int[n]Array, Float[n]Array
                                     // @ret TypedArray
    var constructor = source.constructor.name;
    var result = new global[constructor](source.length * 2);

    result.set(source);
    return result;
}

function TypedArray_toString(source) { // @arg TypedArray|Array = null
                                       // @ret BinaryString
                                       // @desc TypedArray to String
//{@dev
    if (!global["BENCHMARK"]) {
        $valid($type(source, "TypedArray|Array|omit"), TypedArray_toString, "source");
    }
//}@dev

    if (!source) { return ""; }

    var result = [], i = 0, iz = source.length, bulkSize = 24000;
    var method = Array.isArray(source) ? "slice" : "subarray";

    if (iz < bulkSize) {
        return String.fromCharCode.apply(null, source);
    }
    // avoid String.fromCharCode.apply(null, BigArray) exception.
    for (; i < iz; i += bulkSize) {
        result.push( String.fromCharCode.apply(null, source[method](i, i + bulkSize)) );
    }
    return result.join("");
}

function TypedArray_fromString(source, // @arg BinaryString
                               type) { // @arg Function = Uint8Array - constructor
                                       // @ret TypedArray
//{@dev
    if (!global["BENCHMARK"]) {
        $valid($type(source, "BinaryString"),  TypedArray_fromString, "source");
        $valid($type(type,   "Function|omit"), TypedArray_fromString, "type");
    }
//}@dev

    type = type || Uint8Array;

    var result = new type(source.length);
    for (var i = 0, iz = source.length; i < iz; ++i) {
        result[i] = source.charCodeAt(i);
    }
    return result;
}

function TypedArray_concat(/* ... */) { // @var_args TypedArray - [TypedArray, ...]
                                        // @ret TypdeArray
    var arrayBuffer = new ArrayBuffer( _getByteLength(arguments) );
    var typedBuffer = new global[arguments[0].constructor.name](arrayBuffer);

    for (var i = 0, iz = arguments.length, cursor = 0; i < iz; ++i) {
        typedBuffer.set(arguments[i], cursor);
        cursor += arguments[i].length;
    }
    return typedBuffer;
}

function _getByteLength(source) { // @arg TypedArrayArray - [TypdeArray, ...]
                                  // @ret UINT32 - total byte length
    var byteLength = 0;

    for (var i = 0, iz = source.length; i < iz; ++i) {
        byteLength += source[i].byteLength;
    }
    return byteLength;
}

return TypedArray; // return entity

});

