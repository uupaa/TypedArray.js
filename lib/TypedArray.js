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
var BIG_ENDIAN = !new Uint8Array(new Uint16Array([1]).buffer)[0];
var ENABLE_CONSOLE_STYLE = IN_BROWSER && /Chrome/.test(global["navigator"]["userAgent"]);
var DUMP_HEADER = {
    16: {
        4: "ADRESS        0        1        2        3\n" +
           "------ -------- -------- -------- --------\n",
        2: "ADRESS    0    1    2    3    4    5    6    7\n" +
           "------ ---- ---- ---- ---- ---- ---- ---- ----\n",
        1: "ADRESS  0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F\n" +
           "------ -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --\n",
    },
    10: {
        4: "ADRESS                    0                    1\n" +
           "------ -------------------- --------------------\n",
        2: "ADRESS           0           1           2           3\n" +
           "------ ----------- ----------- ----------- -----------\n",
        1: "ADRESS       0       1       2       3       4       5       6       7\n" +
           "------ ------- ------- ------- ------- ------- ------- ------- -------\n",
    },
    2: {
        4: "ADRESS                                          0                                          1\n" +
           "------ ------------------------------------------ ------------------------------------------\n",
        2: "ADRESS                      0                      1                      2                      3\n" +
           "------ ---------------------- ---------------------- ---------------------- ----------------------\n",
        1: "ADRESS            0            1            2            3            4            5            6            7\n" +
           "------ ------------ ------------ ------------ ------------ ------------ ------------ ------------ ------------\n",
    }
};

// --- class / interfaces ----------------------------------
var TypedArray = {
    // BIG_ENDIAN    (MC86000, SPARC)
    // LITTLE_ENDIAN (ARM, INTL, SMART PHONE)
    "BIG_ENDIAN":   BIG_ENDIAN,

    // hton (convert host byte order to network byte order)
    "hton16":       TypedArray_swap16,          // TypedArray.hton16(source:Uint8Array|Array):Array
    "hton32":       TypedArray_swap32,          // TypedArray.hton32(source:Uint8Array|Array):Array
    "hton64":       TypedArray_swap64,          // TypedArray.hton64(source:Uint8Array|Array):Array

    // ntoh (convert network byte order to host byte order)
    "ntoh16":       TypedArray_swap16,          // TypedArray.ntoh16(source:Uint8Array|Array):Array
    "ntoh32":       TypedArray_swap32,          // TypedArray.ntoh32(source:Uint8Array|Array):Array
    "ntoh64":       TypedArray_swap64,          // TypedArray.ntoh64(source:Uint8Array|Array):Array

    // expand buffer
    "expand":       TypedArray_expand,          // TypedArray.expand(source:TypedArray):TypedArray

    // read bytes
    "read8":        TypedArray_read8,           // TypedArray.read8(view:Object):UINT8
    "read16":       TypedArray_read16,          // TypedArray.read16(view:Object):UINT16
    "read24":       TypedArray_read24,          // TypedArray.read24(view:Object):UINT32
    "read32":       TypedArray_read32,          // TypedArray.read32(view:Object):UINT32
    "read16LE":     TypedArray_read16LE,        // TypedArray.read16LE(view:Object):UINT16 - LITTLE ENDIAN
    "read24LE":     TypedArray_read24LE,        // TypedArray.read24LE(view:Object):UINT32 - LITTLE ENDIAN
    "read32LE":     TypedArray_read32LE,        // TypedArray.read32LE(view:Object):UINT32 - LITTLE ENDIAN

    // convert TypedArray to/from String
    "toString":     TypedArray_toString,        // TypedArray.toString(source:TypedArray|Array = null):BinaryString
    "fromString":   TypedArray_fromString,      // TypedArray.fromString(source:BinaryString, type:Function = Uint8Array):TypedArray

    // convert BLOB/URL/TypedArray to ArrayBuffer
    "toArrayBuffer":TypedArray_toArrayBuffer,   // TypedArray.toArrayBuffer(source:BlobURLString|URLString|Blob|File|TypedArray|ArrayBuffer,
                                                //                          callback:Function, errorback:Function = null):void
    // debug
    "dump":         TypedArray_dump,            // TypedArray.dump(source:TypedArray|Array, begin:UINT32 = 0, end:UINT32 = source.length):void
    "hexDump":      TypedArray_hexDump,         // [DEPRECATED] TypedArray.hexDump(source:TypedArray|Array, begin:UINT32 = 0, end:UINT32 = source.length):void
    "repository":   "https://github.com/uupaa/TypedArray.js", // GitHub repository URL. http://git.io/Help
};

// --- implements ------------------------------------------
function TypedArray_swap16(source) { // @arg Uint8Array|Array
                                     // @ret Array
                                     // @desc hton16 - host to network byte order (16bit version)
    return TypedArray.BIG_ENDIAN ? [ source[0], source[1] ]  // [0,1] -> [0,1]
                                 : [ source[1], source[0] ]; // [0,1] -> [1,0]
}

function TypedArray_swap32(source) { // @arg Uint8Array|Array
                                     // @ret Array
                                     // @desc hton32 - host to network byte order (32bit version)
    return TypedArray.BIG_ENDIAN ? [ source[0], source[1], source[2], source[3] ]  // [0,1,2,3] -> [0,1,2,3]
                                 : [ source[3], source[2], source[1], source[0] ]; // [0,1,2,3] -> [3,2,1,0]
}

function TypedArray_swap64(source) { // @arg Uint8Array|Array
                                     // @ret Array
                                     // @desc hton64 - host to network byte order (64bit version)
    return TypedArray.BIG_ENDIAN ? [ source[0], source[1], source[2], source[3],   // [0,1,2,3,4,5,6,7] -> [0,1,2,3,4,5,6,7]
                                     source[4], source[5], source[6], source[7] ]
                                 : [ source[7], source[6], source[5], source[4],   // [0,1,2,3,4,5,6,7] -> [7,6,5,4,3,2,1,0]
                                     source[3], source[2], source[1], source[0] ];
}

function TypedArray_read8(view) { // @arg Object - { source, cursor }
                                  // @ret UINT8
    return view.source[view.cursor++] >>> 0;
}

function TypedArray_read16(view) { // @arg Object - { source, cursor }
                                   // @ret UINT16
    // [0x12, 0x34] -> 0x12 << 8 | 0x34
    return ((view.source[view.cursor++]  <<  8) |
             view.source[view.cursor++]) >>> 0;
}

function TypedArray_read24(view) { // @arg Object - { source, cursor }
                                   // @ret UINT32
    // [0x12, 0x34, 0x56] -> 0x12 << 16 | 0x34 << 8 | 0x56
    return ((view.source[view.cursor++]  << 16) |
            (view.source[view.cursor++]  <<  8) |
             view.source[view.cursor++]) >>> 0;
}

function TypedArray_read32(view) { // @arg Object - { source, cursor }
                                   // @ret UINT32
    // [0x12, 0x34, 0x56, 0x78] -> 0x12 << 24 | 0x34 << 16 | 0x56 << 8 | 0x78
    return ((view.source[view.cursor++]  << 24) |
            (view.source[view.cursor++]  << 16) |
            (view.source[view.cursor++]  <<  8) |
             view.source[view.cursor++]) >>> 0;
}

function TypedArray_read16LE(view) { // @arg Object - { source, cursor }
                                     // @ret UINT16
    // [0x34, 0x12] -> 0x34 | 0x12 << 8 = 0x1234
    return ((view.source[view.cursor++]) |
             view.source[view.cursor++] << 8) >>> 0;
}

function TypedArray_read24LE(view) { // @arg Object - { source, cursor }
                                     // @ret UINT32
    // [0x56, 0x34, 0x12] -> 0x56 | 0x34 << 8 | 0x12 << 16 = 0x123456
    return ((view.source[view.cursor++]) |
            (view.source[view.cursor++] << 8) |
             view.source[view.cursor++] << 16) >>> 0;
}

function TypedArray_read32LE(view) { // @arg Object - { source, cursor }
                                     // @ret UINT32
    // [0x78, 0x56, 0x34, 0x12] -> 0x78 | 0x56 << 8 | 0x34 << 16 | 0x12 << 23 = 0x12345678
    return ((view.source[view.cursor++]) |
            (view.source[view.cursor++] << 8)  |
            (view.source[view.cursor++] << 16) |
             view.source[view.cursor++] << 24) >>> 0;
}

function TypedArray_expand(source) { // @arg TypedArray
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

function TypedArray_toArrayBuffer(source,      // @arg BlobURLString|URLString|Blob|File|TypedArray|ArrayBuffer
                                  callback,    // @arg Function - callback(result:ArrayBuffer, source:Any):void
                                  errorback) { // @arg Function = null - errorback(err:Error, source:Any):void
                                               // @desc convert to ArrayBuffer
//{@dev
    if (!global["BENCHMARK"]) {
        $valid($type(source, "BlobURLString|URLString|Blob|File|TypedArray|ArrayBuffer"), TypedArray_toArrayBuffer, "source");
        $valid($type(callback, "Function"), TypedArray_toArrayBuffer, "callback");
        $valid($type(errorback, "Function|omit"), TypedArray_toArrayBuffer, "errorback");
    }
//}@dev

    if (source) {
        if (global["ArrayBuffer"]) {
            if (source instanceof ArrayBuffer) { // ArrayBuffer
                callback(source, source);
                return;
            }
            if (source["buffer"] instanceof ArrayBuffer) { // TypedArray
                callback(source["buffer"], source);
                return;
            }
        }
        if (global["XMLHttpRequest"]) {
            // http://www.w3.org/TR/2008/WD-XMLHttpRequest2-20080225/
            if (typeof source === "string") { // BlobURLString or URLString

                var xhr = new XMLHttpRequest();

                xhr["responseType"] = "arraybuffer";
                xhr["onload"] = function() {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        callback(xhr["response"], source);
                    } else if (errorback) {
                        errorback( new Error(xhr["statusText"] || "", source) );
                    }
                    xhr["onerror"] = null;
                    xhr["onload"] = null;
                    xhr = null;
                };
                xhr["onerror"] = function(event) {
                    errorback(event, source);
                    xhr["onerror"] = null;
                    xhr["onload"] = null;
                    xhr = null;
                };
                xhr.open("GET", source);
                xhr.send();
                return;
            }
        }
        if (global["Blob"] && global["FileReader"]) {
            if (source instanceof Blob) { // Blob or File

                var reader = new FileReader();

                reader["onload"] = function() {
                    callback(reader["result"], source);
                    reader["onerror"] = null;
                    reader["onload"] = null;
                    reader = null;
                };
                reader["onerror"] = function() {
                    if (errorback) {
                        errorback(reader["error"], source);
                    }
                    reader["onerror"] = null;
                    reader["onload"] = null;
                    reader = null;
                };
                reader["readAsArrayBuffer"](source);
                return;
            }
        }
    }
    throw new TypeError("Unknown source type");
}

function TypedArray_hexDump(source, begin, end) {
    console.warn("TypedArray_hexDump was DEPRECATED function");
    TypedArray_dump(source, begin, end);
}

function TypedArray_dump(source,   // @arg TypedArray|Array - [0x00, 0x41, 0x53, 0x43, 0x49, 0x49, 0xff, ...]
                         begin,    // @arg UINT32 = 0 - begin adress
                         end,      // @arg UINT32 = source.length - end address
                         radix,    // @arg UINT8 = 16 - radix. 16 or 10 or 2
                         markup) { // @arg Object = {} - { num: color, ... }
//{@dev
    if (!global["BENCHMARK"]) {
        $valid($type(source, "TypedArray|Array"), TypedArray_dump, "source");
        $valid($type(begin,  "UINT32|omit"),      TypedArray_dump, "begin");
        $valid($type(end,    "UINT32|omit"),      TypedArray_dump, "end");
        $valid($type(radix,  "UINT8|omit"),       TypedArray_dump, "radix");
        $valid($type(markup, "Object|omit"),      TypedArray_dump, "markup");
    }
//}@dev

    begin = begin || 0;
    end   = end   || source.length;
    radix = radix || 16;
    markup = markup || null;

    var SIZE = Array.isArray(source) ? 1 : source.byteLength / source.length; // 4,2,1
    var result = [];
    var color  = [];
    var digit  = { 10: { 1: 3, 2: 5, 4: 10 }, 2: { 1: 8, 2: 16, 4: 32 } };
    var maxDigit = { 16: 16, 10: 8, 2: 8 };
    var padding  = { 10: "        ", 2: "0000000000000000000000000000000" };

    result.push(DUMP_HEADER[radix][SIZE], _getHexAddress(begin), " ");

    for (var i = begin, iz = end, x = 0; i < iz; ++i, x += SIZE) {
        if (i !== begin) {
            if ( x % maxDigit[radix] === 0 ) {
                // make ADDRESS
                result.push("\n", _getHexAddress(i));
            }
            result.push(" ");
        }
        var v = source[i];
        var marked = false;

        if (ENABLE_CONSOLE_STYLE && markup && v in markup) {
            marked = true;
            result.push("%c");
            color.push("font-weight:bold;color:" + markup[v]);
        }
        result.push( ("0000000" + v.toString(16)).slice(-(SIZE * 2)) );
        if (radix === 10 || radix === 2) {
            result.push( "(" + (padding[radix] + v.toString(radix)).slice( -(digit[radix][SIZE]) ) + ")" );
        }
        if (marked) {
            result.push("%c");
            color.push("color:black");
        }
    }
    console.log.apply(console, [result.join("")].concat(color));

    function _getHexAddress(i) {
        return (0x1000000 + i).toString(16).slice(-6);
    }
}

return TypedArray; // return entity

});

