var ModuleTestTypedArray = (function(global) {

global["BENCHMARK"] = false;

var test = new Test("TypedArray", {
        disable:    false, // disable all tests.
        browser:    true,  // enable browser test.
        worker:     true,  // enable worker test.
        node:       true,  // enable node test.
        nw:         true,  // enable nw.js test.
        el:         true,  // enable Electron test.
        button:     true,  // show button.
        both:       true,  // test the primary and secondary modules.
        ignoreError:false, // ignore error.
        callback:   function() {
        },
        errorback:  function(error) {
        }
    }).add([
        testTypedArray_basic,
        testTypedArray_hton,
        testTypedArray_ntoh,
        testTypedArray_expand,
        testTypedArray_read,
        testTypedArray_toString,
        testTypedArray_fromString,
        testTypedArray_dump,
        testTypedArray_dumpMarkup,
        testTypedArray_dumpOverflow,
    ]);

if (IN_BROWSER || IN_NW) {
    test.add([
        testTypedArray_toArrayBuffer_xhr404,
    ]);
} else if (IN_WORKER) {
    test.add([
        // worker test
    ]);
} else if (IN_NODE) {
    test.add([
        // node.js and io.js test
    ]);
}
if (global["Blob"]) {
    test.add([
        testTypedArray_toArrayBuffer_blob,
    ]);
}

// --- test cases ------------------------------------------
function testTypedArray_basic(test, pass, miss) {
    //
    // 1. ArrayBuffer.slice() は新たにメモリを確保し、配列の一部をコピーする
    //
    //
    // 2. TypedArray#subarray は ArrayBuffer の View を作成するだけで、メモリは共有する
    //    subarrayは低コストだが、引数で渡された ArrayBuffer を使いまわす場合は、
    //    破壊的な動作になるので注意が必要

    // ArrayBuffer を共有する2つのView(u8,u32)を作成し、
    // ArrayBuffer が正しく共有されている事を確認します。
    var ab  = new ArrayBuffer(8);           // ab  = [00,00,00,00,00,00,00,00]
    var u8  = new Uint8Array(ab);           // u8  = [00,00,00,00,00,00,00,00]
    var u32 = new Uint32Array(ab);          // u32 = [00000000,   00000000]

    // u8 と u32 は ArrayBuffer を共有しているため、
    // u8[n] に値を設定すると u32[n] の値も変化します
    u8.set([0, 1, 2, 3, 4, 5, 6, 7]);       // u8  = [00,01,02,03,04,05,06,07]

    if ( _likeArray(u8, [0, 1, 2, 3, 4, 5, 6, 7]) ) {
        console.log( _toHex(u8), _toHex(u32) );
    } else {
        console.log( _toHex(u8) );
        test.done(miss());
    }
    if ( _likeArray(u32, WebModule.TypedArray.BIG_ENDIAN ? [0x00010203, 0x04050607]
                                                         : [0x03020100, 0x07060504]) ) {
        console.log( _toHex(u8), _toHex(u32) );
    } else {
        console.log( _toHex(u32) );
        test.done(miss());
    }

    // ArrayBuffer#slice を行い
    // u8 と cu8 でバッファが共有されていない事を確認します
    var cu8 = new Uint8Array(ab.slice(0));  // ArrayBufferのコピーを作成する

  //u8                                      // u8  = [00,01,02,03,04,05,06,07]
    cu8[0] = 0xFF;                          // cu8 = [FF,01,02,03,04,05,06,07]

    if ( !_likeArray(u8, cu8) ) { // 違うはず
        console.log( _toHex(u8), _toHex(cu8) );
    } else {
        console.log( _toHex(u8), _toHex(cu8) );
        test.done(miss());
    }
    cu8 = null;

    // u82 = u8.subarray(2, 6) は
    //       [00,01,02,03,04,05,06,07] から
    //             [02,03,04,05] な view を作ります。length は 4 です

    var u82 = u8.subarray(2, 6);
    if (u82.length === 4) {
        // OK
    } else {
        test.done(miss());
    }

    // u82とu8は1つのArrayBufferを共有しているため
    // u82[0] = 0x22 を行うと、
    // u8[2] も 0x22 になります。

    u82[0] = 0x22;
    if (u8[2] === 0x22) {
        // OK
    } else {
        test.done(miss());
    }
    console.log( _toHex(u8), _toHex(u82) );

    // u82 の length は 4 しかないため、u82[5] = 0x00 は無効です。
    // また u82[5] に相当する u8[7] の値も変化せず 0x07 のままです

    u82[5] = 0x00;

    if (u82[5] === undefined && u8[7] === 0x07) {
        // OK
    } else {
        test.done(miss());
    }

    // u82.set([0xFF,0xEE,0xDD,0xCC]) を行うと
    // u8 は [00,01,FF,EE,DD,CC,06,07] になります
    u82.set([0xFF,0xEE,0xDD,0xCC]);

    if (u8[0] === 0x00 &&
        u8[1] === 0x01 &&
        u8[2] === 0xFF &&
        u8[3] === 0xEE &&
        u8[4] === 0xDD &&
        u8[5] === 0xCC &&
        u8[6] === 0x06 &&
        u8[7] === 0x07) {
        // OK
    } else {
        test.done(miss());
    }

    // u82 をループでダンプしてみます
    // 0xFF,0xEE,0xDD,0xCC がダンプされます
    for (var i = 0, iz = u82.length; i < iz; ++i) {
        console.log(u82[i]);
    }

    // ArrayBuffer.slice が内部的に行っている事をfor文で書いてみる
    (function() {
        var ab1 = new ArrayBuffer(8);
        var u81 = new Uint8Array(ab1);
        u81.set([0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07]);
        var ab2 = ab1.slice(1,7); // 6bytes
        var u82 = new Uint8Array(ab2);

        var ab3 = new ArrayBuffer(8);
        var u83 = new Uint8Array(ab3);
        u83.set([0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07]);
        var ab4 = new ArrayBuffer(6);
        var u84 = new Uint8Array(ab4); // ArrayBufferのバイトデータに直接アクセスできないためViewを作成する

        // ループでバイトコピー
        for (var dest = 0, src = 1; src < 7;) {
            u84[dest++] = u83[src++];
        }

        if (_likeArray(u81, u83) &&
            _likeArray(u82, u84)) {
            // OK
        } else {
            console.log( _toHex(u81), _toHex(u83) );
            console.log( _toHex(u82), _toHex(u84) );
            test.done(miss());
        }
    })();

    test.done(pass());
}

function _likeArray(a,             // @arg TypedArray|Array
                    b,             // @arg TypedArray|Array
                    fixedDigits) { // @arg Integer = 0 - floatingNumber.toFixed(fixedDigits)
                                   // @ret Boolean
    fixedDigits = fixedDigits || 0;
    if (a.length !== b.length) {
        return false;
    }
    for (var i = 0, iz = a.length; i < iz; ++i) {
        if (fixedDigits) {
            if ( a[i].toFixed(fixedDigits) !== b[i].toFixed(fixedDigits) ) {
                return false;
            }
        } else {
            if ( a[i] !== b[i] ) {
                return false;
            }
        }
    }
    return true;
}

function _toHex(a,             // @arg TypedArray|Array
                fixedDigits) { // @arg Integer = 0 - floatingNumber.toFixed(fixedDigits)
                               // @arg NumberStringArray - ["00", "01"]                  (Uint8Array)
                               //                          ["0000", "0001", ...]         (Uint16Array)
                               //                          ["00000000", "00000001", ...] (Uint32Array)
                               //                          ["12.3", "0.1", ...]          (Float64Array)
    var fix    = fixedDigits || 0;
    var type   = Array.isArray(a) ? "Array" : Object.prototype.toString.call(a);
    var result = [], i = 0, iz = a.length;
    var bytes  = /8/.test(type) ? 2 : /32/.test(type) ? 8 : 4;

    if (/float/.test(type)) {
        for (; i < iz; ++i) {
            result.push( (0x100000000 + a[i]).toString(16).slice(-bytes) );
        }
    } else {
        for (; i < iz; ++i) {
            result.push( fix ? a[i].toFixed(fix) : a[i] );
        }
    }
    return result;
}

function testTypedArray_hton(test, pass, miss) {
    var defaultEndian = TypedArray.BIG_ENDIAN;

    var a = new Uint8Array([1,2,3,4,5,6,7,8]);

    TypedArray.BIG_ENDIAN = true;
    var result1 = {
        1: TypedArray.hton2(a).join() === [1,2].join(),
        2: TypedArray.hton4(a).join() === [1,2,3,4].join(),
        3: TypedArray.hton8(a).join() === [1,2,3,4,5,6,7,8].join(),
    };

    TypedArray.BIG_ENDIAN = false;
    var result2 = {
        1: TypedArray.hton2(a).join() === [2,1].join(),
        2: TypedArray.hton4(a).join() === [4,3,2,1].join(),
        3: TypedArray.hton8(a).join() === [8,7,6,5,4,3,2,1].join(),
    };

    TypedArray.BIG_ENDIAN = defaultEndian;

    if ( /false/.test(JSON.stringify(result1)) ||
         /false/.test(JSON.stringify(result2)) ) {
        test.done(miss());
    } else {
        test.done(pass());
    }
}

function testTypedArray_ntoh(test, pass, miss) {
    var defaultEndian = TypedArray.BIG_ENDIAN;

    var a = new Uint8Array([1,2,3,4,5,6,7,8]);

    TypedArray.BIG_ENDIAN = true;
    var result1 = {
        1: TypedArray.ntoh2(a).join() === [1,2].join(),
        2: TypedArray.ntoh4(a).join() === [1,2,3,4].join(),
        3: TypedArray.ntoh8(a).join() === [1,2,3,4,5,6,7,8].join(),
    };

    TypedArray.BIG_ENDIAN = false;
    var result2 = {
        1: TypedArray.ntoh2(a).join() === [2,1].join(),
        2: TypedArray.ntoh4(a).join() === [4,3,2,1].join(),
        3: TypedArray.ntoh8(a).join() === [8,7,6,5,4,3,2,1].join(),
    };

    TypedArray.BIG_ENDIAN = defaultEndian;

    if ( /false/.test(JSON.stringify(result1)) ||
         /false/.test(JSON.stringify(result2)) ) {
        test.done(miss());
    } else {
        test.done(pass());
    }
}

function testTypedArray_read(test, pass, miss) {
    var a = [1,2,3,4,5,6,7,8,9,10];
    var view1 = { source: new Uint8Array(a), cursor: 0 };
    var view2 = { source: new Uint8Array(a), cursor: 0 };

    var result = {
        1: TypedArray.read1(view1) === 1,
        2: TypedArray.read2(view1) === (2 << 8) + 3,
        3: TypedArray.read3(view1) === (4 << 16) + (5 << 8) + 6,
        4: TypedArray.read4(view1) === (7 << 24) + (8 << 16) + (9 << 8) + 10,

        5: TypedArray.read1(view2) === 1,
        6: TypedArray.read2LE(view2) === (3 << 8) + 2,
        7: TypedArray.read3LE(view2) === (6 << 16) + (5 << 8) + 4,
        8: TypedArray.read4LE(view2) === (10 << 24) + (9 << 16) + (8 << 8) + 7,
    };

    if ( /false/.test(JSON.stringify(result)) ) {
        test.done(miss());
    } else {
        test.done(pass());
    }
}

function testTypedArray_expand(test, pass, miss) {
    var u8a = new Uint8Array([1,2,3]);
    var u8b = TypedArray.expand(u8a);
    var u16a = new Uint16Array([1,2,3]);
    var u16b = TypedArray.expand(u16a);

    if (u8b[0] === 1 && u8b[1] === 2 && u8b[2] === 3 &&
        u8b[3] === 0 && u8b[4] === 0 && u8b[5] === 0 &&
        u8b.length === u8a.length * 2) {
        if (u16b[0] === 1 && u16b[1] === 2 && u16b[2] === 3 &&
            u16b[3] === 0 && u16b[4] === 0 && u16b[5] === 0 &&
            u16b.length === u16a.length * 2) {
            test.done(pass());
            return;
        }
    }
    test.done(miss());
}

function testTypedArray_toString(test, pass, miss) {
    var a = new Uint8Array(32000);
    var b = TypedArray.toString(a);

    if (a.length === b.length) {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testTypedArray_fromString(test, pass, miss) {
    var a = TypedArray.fromString("hello", Uint16Array);
    var b = TypedArray.toString(a);

    if (b === "hello") {
        test.done(pass());
    } else {
        test.done(miss());
    }
}

function testTypedArray_toArrayBuffer_xhr404(test, pass, miss) {
    var source = "./404.png";

    var success = function(result, source) {
        test.done(miss());
    };

    var error = function(error, source) {
        if (error instanceof Error) {
            test.done(pass());
            return;
        }
        test.done(miss());
    };

    TypedArray.toArrayBuffer(source, success, error);
}

function testTypedArray_toArrayBuffer_blob(test, pass, miss) {
    var source = new Blob(["hello"], { type: "text/plain" });

    var success = function(result, source) {
        if (result && result.byteLength === 5) {
            var text = String.fromCharCode.apply(null, new Uint8Array(result));
            if (text === "hello") {
                test.done(pass());
                return;
            }
        }
        test.done(miss());
    };
    var error = function(error, source) {
        test.done(miss());
    };

    WebModule.TypedArray.toArrayBuffer(source, success, error);
}

function _makeRndomValue(length) {
    var result = [];
    var random = new Random();
    for (var i = 0, iz = length; i < iz; ++i) {
        result.push( random.next() );
    }
    return result;
}

function testTypedArray_dump(test, pass, miss) {
    var src8  = _makeRndomValue(60).map(function(v) { return v & 0xff });
    var src16 = _makeRndomValue(60).map(function(v) { return v & 0xffff });
    var src32 = _makeRndomValue(60).map(function(v) { return v & 0xffffffff });

    TypedArray.dump(new Uint8Array(src8),    0, 0, 16);
    TypedArray.dump(new Uint16Array(src16),  0, 0, 16);
    TypedArray.dump(new Uint32Array(src32),  0, 0, 16);
    TypedArray.dump(new Uint8Array(src8),    0, 0, 10);
    TypedArray.dump(new Uint16Array(src16),  0, 0, 10);
    TypedArray.dump(new Uint32Array(src32),  0, 0, 10);
    TypedArray.dump(new Uint8Array(src8),    0, 0,  2);
    TypedArray.dump(new Uint16Array(src16),  0, 0,  2);
    TypedArray.dump(new Uint32Array(src32),  0, 0,  2);

    test.done(pass());
}

function testTypedArray_dumpMarkup(test, pass, miss) {
    var src8  = _makeRndomValue(60).map(function(v) { return v & 0xff });
    var src16 = _makeRndomValue(60).map(function(v) { return v & 0xffff });
    var src32 = _makeRndomValue(60).map(function(v) { return v & 0xffffffff });
    var markupObject = { min: 0x00, max: 0x80, 0xea: "blue", 0xe6: "green" };
    var markupArray = [0x45ea, 0x16e6];
    var markupFunction = function(index, num, markup) {
        var rand = (Math.random() * 10) | 0;
        switch (rand) {
        case 0: return "color:black";
        case 1: return "color:red";
        case 2: return "color:blue";
        case 3: return "color:green";
        case 4: return "color:navy";
        case 5: return "color:lime";
        case 6: return "color:pink";
        case 7: return "color:tomato";
        case 8: return "color:skyblue";
        case 9: return "color:gold";
        }
        return "white";
    };

    TypedArray.dump(new Uint8Array(src8),    0, 0, 16, markupObject);
    TypedArray.dump(new Uint16Array(src16),  0, 0, 16, markupArray);
    TypedArray.dump(new Uint32Array(src32),  0, 0, 16, markupFunction);

    test.done(pass());
}

function testTypedArray_dumpOverflow(test, pass, miss) {
    try {
        TypedArray.dump([1,2,3], 0, 1000, 16);
        test.done(pass());
    } catch (error) {
        test.done(miss());
    }
}

return test.run();

})(GLOBAL);

