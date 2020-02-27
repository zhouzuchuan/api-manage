"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports["default"] = void 0;

var _urijs = _interopRequireDefault(require("urijs"));

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _slicedToArray(arr, i) {
    return (
        _arrayWithHoles(arr) ||
        _iterableToArrayLimit(arr, i) ||
        _nonIterableRest()
    );
}

function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function _iterableToArrayLimit(arr, i) {
    if (
        !(
            Symbol.iterator in Object(arr) ||
            Object.prototype.toString.call(arr) === "[object Arguments]"
        )
    ) {
        return;
    }
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;
    try {
        for (
            var _i = arr[Symbol.iterator](), _s;
            !(_n = (_s = _i.next()).done);
            _n = true
        ) {
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally {
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally {
            if (_d) throw _e;
        }
    }
    return _arr;
}

function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
}

function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose(source, excluded);
    var key, i;
    if (Object.getOwnPropertySymbols) {
        var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
        for (i = 0; i < sourceSymbolKeys.length; i++) {
            key = sourceSymbolKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            if (!Object.prototype.propertyIsEnumerable.call(source, key))
                continue;
            target[key] = source[key];
        }
    }
    return target;
}

function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for (i = 0; i < sourceKeys.length; i++) {
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
    }
    return target;
}

function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly)
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        keys.push.apply(keys, symbols);
    }
    return keys;
}

function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i] != null ? arguments[i] : {};
        if (i % 2) {
            ownKeys(Object(source), true).forEach(function(key) {
                _defineProperty(target, key, source[key]);
            });
        } else if (Object.getOwnPropertyDescriptors) {
            Object.defineProperties(
                target,
                Object.getOwnPropertyDescriptors(source)
            );
        } else {
            ownKeys(Object(source)).forEach(function(key) {
                Object.defineProperty(
                    target,
                    key,
                    Object.getOwnPropertyDescriptor(source, key)
                );
            });
        }
    }
    return target;
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}

function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}

function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}

var getType = function getType(obj) {
    return Object.prototype.toString
        .call(obj)
        .slice(8, -1)
        .toLowerCase();
};

var isFunction = function isFunction(o) {
    return getType(o) === "function";
};

var isObject = function isObject(o) {
    return getType(o) === "object";
};

var ApiManage =
    /*#__PURE__*/
    (function() {
        /**
         * 将多个api清单文件 合并成一个
         *
         * @param {any[]} fns api清单集合
         * @param {*} params api如果是函数 则为参数传入该函数中
         * @returns {Record<string, Record<string, string>>}
         */

        /**
         * 计算中断函数唯一token
         *
         * @param {*} requestParams 请求参数
         * @param {boolean} [isCalcFullPath=true]  是否计算全路径（只要用来区别相同请求地址，不同参数间是否进行取消操作）
         * @returns
         */

        /**
         * 路径模板 根据 `:` 来匹配
         *
         * @param {*} template
         * @param {*} [data=[]]
         * @returns {string}
         */

        /**
         * 将api清单数据 拍平 成键值对映射（api名称 对应 其路径以及方法类型）
         *
         * @param {object} data
         * @returns {Record<string, { path: string; method: string }>}
         *
         *
         */

        /**
         * 替换字符串开头的字符串
         *
         * @param {*} apiName 需要替换的字符串
         * @param {*} matchStr 被替换的字符
         * @param {*} replaceStr 替换成的字符
         */

        /**
         *  serveFn 列表
         * */

        /**
         *  中断函数 列表
         */
        function ApiManage(options) {
            var _this = this;

            _classCallCheck(this, ApiManage);

            _defineProperty(this, "serveMap", {});

            _defineProperty(this, "cancelList", {});

            var defaultRequest = require("axios")["default"];

            var list = options.list,
                _options$matchStr = options.matchStr,
                matchStr =
                    _options$matchStr === void 0 ? "api" : _options$matchStr,
                _options$replaceStr = options.replaceStr,
                replaceStr =
                    _options$replaceStr === void 0
                        ? "serve"
                        : _options$replaceStr,
                _options$hooks = options.hooks,
                hooks = _options$hooks === void 0 ? {} : _options$hooks,
                _options$limitRespons = options.limitResponse,
                limitResponse =
                    _options$limitRespons === void 0
                        ? function(a) {
                              return a;
                          }
                        : _options$limitRespons,
                _options$request = options.request,
                request =
                    _options$request === void 0
                        ? defaultRequest
                        : _options$request,
                _options$CancelToken = options.CancelToken,
                CancelToken =
                    _options$CancelToken === void 0
                        ? defaultRequest.CancelToken
                        : _options$CancelToken,
                _options$customize = options.customize,
                customize =
                    _options$customize === void 0 ? {} : _options$customize,
                _options$validate = options.validate,
                validate =
                    _options$validate === void 0
                        ? function() {
                              return true;
                          }
                        : _options$validate;
            var _ref = hooks,
                hooksStart = _ref.start,
                hooksResolve = _ref.resolve,
                hooksReject = _ref.reject,
                hooksFinally = _ref["finally"]; // 中断构造函数

            var CancelTokenFn;

            if (CancelToken) {
                CancelTokenFn = CancelToken;
            } else if (request.CancelToken) {
                CancelTokenFn = request.CancelToken;
            }

            var methodAction = _objectSpread(
                {},
                ["get", "post", "delete", "put"]
                    .filter(function(type) {
                        return typeof request[type] === "function";
                    })
                    .reduce(function(r, method) {
                        return _objectSpread(
                            {},
                            r,
                            _defineProperty({}, method, function(
                                path,
                                serveName
                            ) {
                                return function(params) {
                                    var _ref2 =
                                        arguments.length > 1 &&
                                        arguments[1] !== undefined
                                            ? arguments[1]
                                            : {};

                                    var _ref2$tplData = _ref2.tplData,
                                        tplData =
                                            _ref2$tplData === void 0
                                                ? {}
                                                : _ref2$tplData,
                                        _ref2$cancelParams = _ref2.cancelParams,
                                        cancelParams =
                                            _ref2$cancelParams === void 0
                                                ? {}
                                                : _ref2$cancelParams,
                                        config = _objectWithoutProperties(
                                            _ref2,
                                            ["tplData", "cancelParams"]
                                        );

                                    var _cancelParams$isCalcF =
                                            cancelParams.isCalcFullPath,
                                        isCalcFullPath =
                                            _cancelParams$isCalcF === void 0
                                                ? true
                                                : _cancelParams$isCalcF;

                                    var requestParams = _defineProperty(
                                        {
                                            method: method,
                                            url: ApiManage.template(
                                                path,
                                                tplData
                                            )
                                        },
                                        method === "get" ? "params" : "data",
                                        params
                                    );

                                    var requestToken = ""; // 如果存在取消请求函数 则 执行以及初始化 取消请求

                                    if (CancelTokenFn) {
                                        requestToken = ApiManage.createCancelToken(
                                            requestParams,
                                            isCalcFullPath
                                        ); // 中断 同一个 token

                                        if (_this.cancelList[requestToken]) {
                                            _this.cancelList[requestToken][0](
                                                "取消重复请求"
                                            );

                                            Reflect.deleteProperty(
                                                _this.cancelList,
                                                requestToken
                                            );
                                        }

                                        config.cancelToken = new CancelTokenFn(
                                            function(cancleFn) {
                                                Reflect.set(
                                                    _this.cancelList,
                                                    requestToken,
                                                    [cancleFn, serveName]
                                                );
                                            }
                                        );
                                    }

                                    return new Promise(function(
                                        resolve,
                                        reject
                                    ) {
                                        // 生成时间戳
                                        var timestamp = "".concat(
                                            new Date().getTime()
                                        );

                                        if (hooksStart) {
                                            hooksStart(serveName, timestamp);
                                        }

                                        request(
                                            _objectSpread(
                                                {},
                                                config,
                                                {},
                                                requestParams
                                            )
                                        )
                                            .then(function(res) {
                                                if (validate(res, serveName)) {
                                                    // 如果存在 取消函数 则取消该函数记录
                                                    if (!!requestToken) {
                                                        // 请求成功 删除取消函数
                                                        Reflect.deleteProperty(
                                                            _this.cancelList,
                                                            requestToken
                                                        );
                                                    }

                                                    if (hooksResolve) {
                                                        hooksResolve(
                                                            serveName,
                                                            timestamp
                                                        );
                                                    }

                                                    resolve(limitResponse(res));
                                                } else {
                                                    reject({
                                                        error:
                                                            "api-manage validate false",
                                                        response: res
                                                    });
                                                }
                                            })
                                            ["catch"](reject)
                                            ["finally"](function() {
                                                if (hooksFinally) {
                                                    hooksFinally(
                                                        serveName,
                                                        timestamp
                                                    );
                                                }
                                            });
                                    })["catch"](hooksReject);
                                };
                            })
                        );
                    }, {}),
                {},
                customize
            );

            var apiList = ApiManage.flatApi(list);
            this.serveMap = Object.entries(apiList).reduce(function(
                result,
                _ref3
            ) {
                var _ref4 = _slicedToArray(_ref3, 2),
                    apiName = _ref4[0],
                    _ref4$ = _ref4[1],
                    path = _ref4$.path,
                    method = _ref4$.method;

                if (typeof methodAction[method] !== "function") {
                    return result;
                }

                var serveName = ApiManage.replaceFnName(
                    apiName,
                    matchStr,
                    replaceStr
                );
                var serveFn = methodAction[method](path, serveName); // 设置请求函数名称

                Reflect.defineProperty(serveFn, "name", {
                    value: serveName
                });

                var serveFnOptions = _objectSpread(
                    {
                        resolve: function resolve() {
                            var data =
                                arguments.length > 0 &&
                                arguments[0] !== undefined
                                    ? arguments[0]
                                    : {};
                            var tplData =
                                arguments.length > 1 &&
                                arguments[1] !== undefined
                                    ? arguments[1]
                                    : {};
                            var splitPath = (0, _urijs["default"])(
                                ApiManage.template(path, tplData)
                            );
                            var dealURI =
                                method === "get"
                                    ? splitPath.addQuery(data)
                                    : splitPath;
                            var _dealURI$_parts = dealURI._parts,
                                hostname = _dealURI$_parts.hostname,
                                port = _dealURI$_parts.port,
                                protocol = _dealURI$_parts.protocol,
                                query = _dealURI$_parts.query;
                            return {
                                url: path,
                                name: serveName,
                                method: method,
                                hostname: hostname,
                                port: port,
                                protocol: protocol,
                                query: query,
                                requestUrl: dealURI.toString()
                            };
                        }
                    },
                    CancelTokenFn && {
                        // 中断请求（通过serveName 来匹配, 会中断多个参数不同但serveFn相同的函数）
                        abort: function abort() {
                            Object.entries(_this.cancelList).forEach(function(
                                _ref5
                            ) {
                                var _ref6 = _slicedToArray(_ref5, 2),
                                    cancelToken = _ref6[0],
                                    _ref6$ = _slicedToArray(_ref6[1], 2),
                                    cancelFn = _ref6$[0],
                                    oldServeName = _ref6$[1];

                                if (oldServeName === serveName) {
                                    cancelFn("取消重复请求");
                                    Reflect.deleteProperty(
                                        _this.cancelList,
                                        cancelToken
                                    );
                                }
                            });
                        }
                    },
                    {
                        bind: Function.prototype.bind,
                        call: Function.prototype.call,
                        apply: Function.prototype.apply
                    }
                ); // 设置原型

                Object.setPrototypeOf(serveFn, serveFnOptions);
                return _objectSpread(
                    {},
                    result,
                    _defineProperty({}, serveName, {
                        serveFn: serveFn,
                        path: path,
                        method: method
                    })
                );
            },
            {});
        }
        /**
         * 解析请求地址
         *
         * @param {string} serveName 指定的请求名称
         * @returns {TResolveFn}
         * @memberof ApiManage
         */

        _createClass(ApiManage, [
            {
                key: "resolve",
                value: function resolve(serveName) {
                    var serveFn = this.serveMap[serveName].serveFn;

                    if (serveFn) {
                        return serveFn.resolve;
                    }

                    return function() {
                        return null;
                    };
                }
                /**
                 * 中断骑牛
                 *
                 * @param {string} serveName 指定的请求名称
                 * @returns {void}
                 * @memberof ApiManage
                 */
            },
            {
                key: "abort",
                value: function abort(serveName) {
                    var serveFn = this.serveMap[serveName].serveFn;

                    if (serveFn) {
                        return serveFn.abort();
                    }
                }
                /**
                 * 获取所有 api 请求函数
                 *
                 * @returns {Record<string, any>}
                 * @memberof ApiManage
                 */
            },
            {
                key: "getService",
                value: function getService() {
                    return Object.entries(this.serveMap).reduce(function(
                        r,
                        _ref7
                    ) {
                        var _ref8 = _slicedToArray(_ref7, 2),
                            k = _ref8[0],
                            items = _ref8[1];

                        return _objectSpread(
                            {},
                            r,
                            _defineProperty({}, k, items.serveFn)
                        );
                    },
                    {});
                }
            }
        ]);

        return ApiManage;
    })();

_defineProperty(ApiManage, "bindApi", function(fns, params) {
    return (Array.isArray(fns) ? fns : [fns]).reduce(function(r, v) {
        // 如果不是函数以及键值对 则过滤
        if (!(isFunction(v) || isObject(v))) return r; // 如果是函数 则执行并将params传入参数

        var result = isFunction(v) ? v(params) : v; // 如果返回的不是对象键值对 则过滤

        if (!isObject(result)) return r;
        return Object.entries(result).reduce(function(r2, _ref9) {
            var _ref10 = _slicedToArray(_ref9, 2),
                n = _ref10[0],
                m = _ref10[1];

            return _objectSpread(
                {},
                r2,
                {},
                isObject(m) &&
                    _defineProperty(
                        {},
                        n,
                        _objectSpread({}, r2[n] || {}, {}, m)
                    )
            );
        }, r);
    }, {});
});

_defineProperty(ApiManage, "createCancelToken", function(requestParams) {
    var isCalcFullPath =
        arguments.length > 1 && arguments[1] !== undefined
            ? arguments[1]
            : true;
    var method = requestParams.method,
        url = requestParams.url,
        _requestParams$params = requestParams.params,
        params = _requestParams$params === void 0 ? {} : _requestParams$params,
        _requestParams$data = requestParams.data,
        data = _requestParams$data === void 0 ? {} : _requestParams$data;
    return isCalcFullPath
        ? encodeURIComponent(
              url +
                  JSON.stringify(
                      method === "get"
                          ? {
                                params: params
                            }
                          : {
                                data: data
                            }
                  )
          )
        : url;
});

_defineProperty(ApiManage, "template", function(template) {
    var data =
        arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var tmp = 0;
    var isA = Array.isArray(data);
    var isO =
        Object.prototype.toString
            .call(data)
            .slice(8, -1)
            .toLowerCase() === "object";
    var dealData = !isO && !isA ? [data] : data;
    return template
        .split("/")
        .map(function(v) {
            var result = v;

            if (v.startsWith(":")) {
                var d = dealData[isO ? v.slice(1) : tmp++];
                if (typeof d !== "undefined") result = "".concat(d);
            }

            return result;
        })
        .join("/");
});

_defineProperty(ApiManage, "flatApi", function(data) {
    return Object.entries(data).reduce(function(result, _ref12) {
        var _ref13 = _slicedToArray(_ref12, 2),
            method = _ref13[0],
            items = _ref13[1];

        return _objectSpread(
            {},
            result,
            {},
            Object.entries(items).reduce(function(r, _ref14) {
                var _ref15 = _slicedToArray(_ref14, 2),
                    apiName = _ref15[0],
                    path = _ref15[1];

                return _objectSpread(
                    {},
                    r,
                    _defineProperty({}, apiName, {
                        path: path,
                        method: method
                    })
                );
            }, {})
        );
    }, {});
});

_defineProperty(ApiManage, "replaceFnName", function(
    apiName,
    matchStr,
    replaceStr
) {
    return matchStr
        ? apiName.replace(RegExp("^" + matchStr), replaceStr)
        : apiName;
});

var _default = ApiManage;
exports["default"] = _default;
module.exports = exports.default;
