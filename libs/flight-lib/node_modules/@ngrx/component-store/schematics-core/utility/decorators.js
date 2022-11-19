"use strict";
exports.__esModule = true;
exports.getNodeDecorators = void 0;
var ts = require("typescript");
/**
 * In TS 4.8 the `decorators` are combined with the `modifiers` array.
 * Once we drop support for older versions, we can remove this function
 * and use `ts.getDecorators`.
 */
function getNodeDecorators(node) {
    var _a, _b;
    return ((_b = (_a = ts).getDecorators) === null || _b === void 0 ? void 0 : _b.call(_a, node)) || node.decorators;
}
exports.getNodeDecorators = getNodeDecorators;
//# sourceMappingURL=decorators.js.map