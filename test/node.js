// TypedArray test

require("../lib/WebModule.js");

// publish to global
WebModule.publish = true;


require("./wmtools.js");
require("../lib/TypedArray.js");
require("../release/TypedArray.n.min.js");
require("./testcase.js");

