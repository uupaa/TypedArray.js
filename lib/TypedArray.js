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

// --- class / interfaces ----------------------------------
var TypedArray = {
    "BIG_ENDIAN":   BIG_ENDIAN,

    // hton (convert host to network byte order)
    "hton16":       hton16,         // TypedArray.hton16(source:Uint8Array|Array):Array
    "hton32":       hton32,         // TypedArray.hton32(source:Uint8Array|Array):Array
    "hton64":       hton64,         // TypedArray.hton64(source:Uint8Array|Array):Array

    // ntoh (convert network to host byte order)
    "ntoh16":       hton16,         // TypedArray.ntoh16(source:Uint8Array|Array):Array
    "ntoh32":       hton32,         // TypedArray.ntoh32(source:Uint8Array|Array):Array
    "ntoh64":       hton64,         // TypedArray.ntoh64(source:Uint8Array|Array):Array

    "expand":       expand,         // TypedArray.expand(source:TypedArray):TypedArray

    // convert TypedArray to/from String
    "toString":     toString,       // TypedArray.toString(source:TypedArray|Array = null):BinaryString
    "fromString":   fromString,     // TypedArray.fromString(source:BinaryString, type:Function = Uint8Array):TypedArray

    // convert TypedArray to/from Blob/URL
    "toArrayBuffer":toArrayBuffer,  // TypedArray.toArrayBuffer(source:BlobURLString|URLString|Blob|File|TypedArray|ArrayBuffer,
                                    //                          callback:Function, errorback:Function = null):void
    // debug
    "hexDump":      hexDump,        // TypedArray.hexDump(source:TypedArray|Array, begin:UINT32 = 0, end:UINT32 = source.length):void
    "repository":   "https://github.com/uupaa/TypedArray.js", // GitHub repository URL. http://git.io/Help
};

// --- implements ------------------------------------------
function hton16(source) { // @arg Uint8Array|Array
                          // @ret Array
                          // @desc hton16 - host to network byte order (16bit version)
    return BIG_ENDIAN ? [ source[0], source[1] ]
                      : [ source[1], source[0] ];
}
function hton32(source) { // @arg Uint8Array|Array
                          // @ret Array
                          // @desc hton32 - host to network byte order (32bit version)
    return BIG_ENDIAN ? [ source[0], source[1], source[2], source[3] ]
                      : [ source[3], source[2], source[1], source[0] ];
}
function hton64(source) { // @arg Uint8Array|Array
                          // @ret Array
                          // @desc hton64 - host to network byte order (64bit version)
    return BIG_ENDIAN ? [ source[0], source[1], source[2], source[3],
                          source[4], source[5], source[6], source[7] ]
                      : [ source[7], source[6], source[5], source[4],
                          source[3], source[2], source[1], source[0] ];
}

function expand(source) { // @arg TypedArray
                          // @ret TypedArray
    var constructor = source.constructor.name;
    var result = new global[constructor](source.length * 2);

    result.set(source);
    return result;
}

function toString(source) { // @arg TypedArray|Array = null
                            // @ret BinaryString
                            // @desc TypedArray to String
//{@dev
    if (!global["BENCHMARK"]) {
        $valid($type(source, "TypedArray|Array|omit"), toString, "source");
    }
//}@dev

    if (!source) { return ""; }

    var result = [], i = 0, iz = source.length, bulkSize = 24000;
    var method = Array.isArray(source) ? "slice" : "subarray";

    // avoid String.fromCharCode.apply(null, BigArray) exception.
    if (iz < bulkSize) {
        return String.fromCharCode.apply(null, source);
    }
    for (; i < iz; i += bulkSize) {
        result.push( String.fromCharCode.apply(null, source[method](i, i + bulkSize)) );
    }
    return result.join("");
}

function fromString(source, // @arg BinaryString
                    type) { // @arg Function = Uint8Array - constructor
                            // @ret TypedArray
//{@dev
    if (!global["BENCHMARK"]) {
        $valid($type(source, "BinaryString"),  fromString, "source");
        $valid($type(type,   "Function|omit"), fromString, "type");
    }
//}@dev

    type = type || Uint8Array;

    var result = new type(source.length);
    for (var i = 0, iz = source.length; i < iz; ++i) {
        result[i] = source.charCodeAt(i);
    }
    return result;
}

function toArrayBuffer(source,      // @arg BlobURLString|URLString|Blob|File|TypedArray|ArrayBuffer
                       callback,    // @arg Function - callback(result:ArrayBuffer, source:Any):void
                       errorback) { // @arg Function = null - errorback(err:Error, source:Any):void
                                    // @desc convert to ArrayBuffer
//{@dev
    if (!global["BENCHMARK"]) {
        $valid($type(source, "BlobURLString|URLString|Blob|File|TypedArray|ArrayBuffer"), toArrayBuffer, "source");
        $valid($type(callback, "Function"), toArrayBuffer, "callback");
        $valid($type(errorback, "Function|omit"), toArrayBuffer, "errorback");
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

function hexDump(source, // @arg TypedArray|Array - [0x00, 0x41, 0x53, 0x43, 0x49, 0x49, 0xff, ...]
                 begin,  // @arg UINT32 = 0 - begin adress
                 end) {  // @arg UINT32 = source.length - end address
//{@dev
    if (!global["BENCHMARK"]) {
        $valid($type(source, "TypedArray|Array"), hexDump, "source");
        $valid($type(begin,  "UINT32|omit"),      hexDump, "begin");
        $valid($type(end,    "UINT32|omit"),      hexDump, "end");
    }
//}@dev

    begin = begin || 0;
    end   = end   || source.length;

    var HEX = "0123456789abcdef";
    var SIZE = Array.isArray(source) ? 1 : source.byteLength / source.length; // 4,2,1
    var result = [];

    switch (SIZE) {
    case 4: result.push("ADRESS        0        1        2        3\n",
                        "------ -------- -------- -------- --------\n"); break;
    case 2: result.push("ADRESS    0    1    2    3    4    5    6    7\n",
                        "------ ---- ---- ---- ---- ---- ---- ---- ----\n"); break;
    case 1: result.push("ADRESS  0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F\n",
                        "------ -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --\n"); break;
    }
    result.push(_getAddress(begin), " ");

    for (var i = begin, iz = end, x = 0; i < iz; ++i, x += SIZE) {
        if (i !== begin) {
            if ( x % 16 === 0 ) {
                // make ADDRESS
                result.push("\n", _getAddress(i));
            }
            result.push(" ");
        }
        var v = source[i];

        switch (SIZE) {
        case 4: result.push( HEX[(v >>> 28) & 0xf] + HEX[(v >> 24) & 0xf],
                             HEX[(v >>  20) & 0xf] + HEX[(v >> 16) & 0xf],
                             HEX[(v >>  12) & 0xf] + HEX[(v >>  8) & 0xf],
                             HEX[(v >>   4) & 0xf] + HEX[(v >>  0) & 0xf] ); break;
        case 2: result.push( HEX[(v >>  12) & 0xf] + HEX[(v >>  8) & 0xf],
                             HEX[(v >>   4) & 0xf] + HEX[(v >>  0) & 0xf] ); break;
        case 1: result.push( HEX[(v >>   4) & 0xf] + HEX[(v >>  0) & 0xf] ); break;
        }
    }
    console.log(result.join(""));

    function _getAddress(i) {
        return (0x1000000 + i).toString(16).slice(-6);
    }
}

return TypedArray; // return entity

});

