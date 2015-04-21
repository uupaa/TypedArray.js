var ModuleTestTypedArray = (function(global) {

var _isNodeOrNodeWebKit = !!global.global;
var _runOnNodeWebKit =  _isNodeOrNodeWebKit &&  /native/.test(setTimeout);
var _runOnNode       =  _isNodeOrNodeWebKit && !/native/.test(setTimeout);
var _runOnWorker     = !_isNodeOrNodeWebKit && "WorkerLocation" in global;
var _runOnBrowser    = !_isNodeOrNodeWebKit && "document" in global;

global["BENCHMARK"] = false;

if (console) {
    if (!console.table) {
        console.table = console.dir;
    }
}

var test = new Test("TypedArray", {
        disable:    false, // disable all tests.
        browser:    true,  // enable browser test.
        worker:     true,  // enable worker test.
        node:       true,  // enable node test.
        nw:         true,  // enable nw.js test.
        button:     true,  // show button.
        both:       true,  // test the primary and secondary modules.
        ignoreError:false, // ignore error.
    }).add([
        testTypedArrayAndArrayBuffer,
    ]);

if (_runOnWorker || _runOnBrowser) {
    test.add([
        testToArrayBufferXHRError,
    ]);
}
if (global["Blob"]) {
    test.add([
        testToArrayBufferFileReader,
    ]);
}

// --- test cases ------------------------------------------
function testToArrayBufferXHRError(test, pass, miss) {
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

function testToArrayBufferFileReader(test, pass, miss) {
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

    TypedArray.toArrayBuffer(source, success, error);
}

function testTypedArrayAndArrayBuffer(test, pass, miss) {
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

    if ( Test.likeArray(u8, [0, 1, 2, 3, 4, 5, 6, 7]) ) {
        console.log( Test.toHex(u8), Test.toHex(u32) );
    } else {
        console.log( Test.toHex(u8) );
        test.done(miss());
    }
    if ( Test.likeArray(u32, TypedArray.BIG_ENDIAN ? [0x00010203, 0x04050607]
                                                   : [0x03020100, 0x07060504]) ) {
        console.log( Test.toHex(u8), Test.toHex(u32) );
    } else {
        console.log( Test.toHex(u32) );
        test.done(miss());
    }

    // ArrayBuffer#slice を行い
    // u8 と cu8 でバッファが共有されていない事を確認します
    var cu8 = new Uint8Array(ab.slice(0));  // ArrayBufferのコピーを作成する

  //u8                                      // u8  = [00,01,02,03,04,05,06,07]
    cu8[0] = 0xFF;                          // cu8 = [FF,01,02,03,04,05,06,07]

    if ( !Test.likeArray(u8, cu8) ) { // 違うはず
        console.log( Test.toHex(u8), Test.toHex(cu8) );
    } else {
        console.log( Test.toHex(u8), Test.toHex(cu8) );
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
    console.log( Test.toHex(u8), Test.toHex(u82) );

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

        if (Test.likeArray(u81, u83) &&
            Test.likeArray(u82, u84)) {
            // OK
        } else {
            console.log( Test.toHex(u81), Test.toHex(u83) );
            console.log( Test.toHex(u82), Test.toHex(u84) );
            test.done(miss());
        }
    })();

    test.done(pass());
}

return test.run().clone();

})((this || 0).self || global);

