// TypedArray test

require("../../lib/WebModule.js");

// publish to global
WebModule.publish = true;

require("../../node_modules/uupaa.random.js/lib/Random.js");
require("../wmtools.js");
require("../../lib/TypedArray.js");
require("../../release/TypedArray.n.min.js");
require("../testcase.js");

