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

    // convert BLOB/URL/TypedArray to ArrayBuffer
    "toArrayBuffer":TypedArray_toArrayBuffer,   // TypedArray.toArrayBuffer(source:BlobURLString|URLString|Blob|File|TypedArray|ArrayBuffer,
                                                //                          callback:Function, errorback:Function = null):void
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

function TypedArray_toArrayBuffer(source,      // @arg BlobURLString|URLString|Blob|File|TypedArray|ArrayBuffer
                                  callback,    // @arg Function - callback(result:ArrayBuffer, source:Any):void
                                  errorback) { // @arg Function = null - errorback(err:Error, source:Any):void
                                               // @desc convert source to ArrayBuffer
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
        // if ((IN_NW || IN_EL) && typeof require === "function") {
        //     if (typeof source === "string" && _isLocalFile(source)) { // BlobURLString or URLString
        //         try {
        //             // fs.readFileSync(source)
        //             var result = new Uint8Array(require("fs")["readFileSync"](source));
        //             callback(result.buffer, source);
        //         } catch ( o__o ) {
        //             if (errorback) {
        //                 errorback(o__o, source);
        //             }
        //         }
        //         return;
        //     }
        // }
        if (global["XMLHttpRequest"]) {
            // http://www.w3.org/TR/2008/WD-XMLHttpRequest2-20080225/
            if (typeof source === "string") { // BlobURLString or URLString

                var xhr = new XMLHttpRequest();

                xhr["responseType"] = "arraybuffer";
                xhr["onload"] = function() {
                    if ((IN_NW || IN_EL) && xhr.status === 0) {
                        callback(xhr["response"], source);
                    } else if (xhr.status >= 200 && xhr.status < 300) {
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

    // function _isLocalFile(url) {
    //     return !/^(https?|wss?):/.test(url);
    // }
}

return TypedArray; // return entity

});

