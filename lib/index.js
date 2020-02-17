"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _urijs = _interopRequireDefault(require("urijs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var getType = function getType(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
};

var isFunction = function isFunction(o) {
  return getType(o) === "function";
};

var isObject = function isObject(o) {
  return getType(o) === "object";
};

var utils = {
  bindApi: function bindApi(fns, params) {
    return (Array.isArray(fns) ? fns : [fns]).reduce(function (r, v) {
      if (!(isFunction(v) || isObject(v))) return r;
      var result = isFunction(v) ? v(params) : v;
      if (!isObject(result)) return r;
      return Object.entries(result).reduce(function (r2, _ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            n = _ref2[0],
            m = _ref2[1];

        return _objectSpread({}, r2, {}, isObject(m) && _defineProperty({}, n, _objectSpread({}, r2[n] || {}, {}, m)));
      }, r);
    }, {});
  },
  template: function (_template) {
    function template(_x, _x2) {
      return _template.apply(this, arguments);
    }

    template.toString = function () {
      return _template.toString();
    };

    return template;
  }(function (template, data) {
    var tmp = 0;
    var isA = Array.isArray(data);
    var isO = Object.prototype.toString.call(data).slice(8, -1).toLowerCase() === "object";
    var dealData = !isO && !isA ? [data] : data;
    return template.split("/").map(function (v) {
      var result = v;

      if (v.startsWith(":")) {
        var d = dealData[isO ? v.slice(1) : tmp++];
        if (typeof d !== "undefined") result = "".concat(d);
      }

      return result;
    }).join("/");
  }),
  flatApi: function flatApi(data) {
    return Object.entries(data).reduce(function (result, _ref4) {
      var _ref5 = _slicedToArray(_ref4, 2),
          method = _ref5[0],
          items = _ref5[1];

      return _objectSpread({}, result, {}, Object.entries(items).reduce(function (r, _ref6) {
        var _ref7 = _slicedToArray(_ref6, 2),
            apiName = _ref7[0],
            path = _ref7[1];

        return _objectSpread({}, r, _defineProperty({}, apiName, {
          path: path,
          method: method
        }));
      }, {}));
    }, {});
  },
  replaceFnName: function replaceFnName(apiName, matchStr, replaceStr) {
    return apiName.replace(RegExp("^" + matchStr), replaceStr);
  }
};
var defaultOptions = {
  matchStr: "api",
  replaceStr: "serve"
};

var ApiManage =
/*#__PURE__*/
function () {
  _createClass(ApiManage, [{
    key: "validate",
    // 索引 请求函数名与其生成的请求token组 映射
    // private serveCancelTokenMap: Record<string, string[]> = {}
    value: function validate(response, serveName) {
      return true;
    }
  }, {
    key: "createMethodService",
    value: function createMethodService(otherCustomizeMethod, request, CancelToken) {
      var _this = this;

      var public2 = function public2(method, path, serveName) {
        return function (params) {
          var _ref8 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

          var _ref8$tplData = _ref8.tplData,
              tplData = _ref8$tplData === void 0 ? {} : _ref8$tplData,
              config = _objectWithoutProperties(_ref8, ["tplData"]);

          var requestParams = _defineProperty({
            method: method,
            url: utils.template(path, tplData)
          }, method === "get" ? "params" : "data", params); // // 发送请求之前，拦截重复请求(即当前正在进行的相同请求)
          // let requestToken = getRequestIdentify(requestParams, true)


          var requestToken = ""; // 如果存在取消请求函数 则 执行以及初始化 取消请求

          if (CancelToken) {
            requestToken = _this.createCancelToken(requestParams);

            _this.abort(serveName)(requestToken);

            config.cancelToken = new CancelToken(function (cancleFn) {
              Reflect.set(_this.cancelList, requestToken, [cancleFn, serveName]);
            });
          }

          var _ref9 = _this.hooks,
              start = _ref9.start,
              resolve = _ref9.resolve,
              reject = _ref9.reject,
              hooksFinally = _ref9["finally"];
          return new Promise(function (resolvep, rejectp) {
            // 生成时间戳
            var timestamp = "".concat(new Date().getTime());

            if (start) {
              start(serveName, timestamp);
            }

            request(_objectSpread({}, config, {}, requestParams)).then(function (res) {
              if (_this.validate(res, serveName)) {
                if (CancelToken) {
                  // 请求成功 删除取消函数
                  Reflect.deleteProperty(_this.cancelList, requestToken);
                }

                if (resolve) {
                  resolve(serveName, timestamp);
                }

                resolvep(_this.limitResponse(res));
              } else {
                rejectp({
                  error: "api-manage validate false",
                  response: res
                });
              }
            })["catch"](rejectp)["finally"](function () {
              if (hooksFinally) {
                hooksFinally(serveName, timestamp);
              }
            });
          });
        };
      };

      this.methodAction = ["get", "post", "delete", "put"].filter(function (type) {
        return typeof request[type] === "function";
      }).reduce(function (r, type) {
        return _objectSpread({}, r, _defineProperty({}, type, public2.bind(_this, type)));
      }, _objectSpread({}, otherCustomizeMethod));
    }
  }]);

  function ApiManage(options) {
    var _this2 = this;

    _classCallCheck(this, ApiManage);

    _defineProperty(this, "serveMap", {});

    _defineProperty(this, "hooks", {});

    _defineProperty(this, "methodAction", {});

    _defineProperty(this, "limitResponse", function (a) {
      return a;
    });

    _defineProperty(this, "enumName", {});

    _defineProperty(this, "cancelList", {});

    var _defaultOptions$optio = _objectSpread({}, defaultOptions, {}, options),
        list = _defaultOptions$optio.list,
        matchStr = _defaultOptions$optio.matchStr,
        replaceStr = _defaultOptions$optio.replaceStr,
        hooks = _defaultOptions$optio.hooks,
        limitResponse = _defaultOptions$optio.limitResponse,
        _defaultOptions$optio2 = _defaultOptions$optio.request,
        request = _defaultOptions$optio2 === void 0 ? require("axios")["default"] : _defaultOptions$optio2,
        _defaultOptions$optio3 = _defaultOptions$optio.cancelToken,
        cancelToken = _defaultOptions$optio3 === void 0 ? require("axios")["default"].CancelToken : _defaultOptions$optio3;

    this.validate = options.validate;
    this.limitResponse = limitResponse;
    this.hooks = hooks;
    var CancelToken;

    if (cancelToken) {
      CancelToken = cancelToken;
    } else if (request.CancelToken) {
      CancelToken = request.CancelToken;
    }

    this.createMethodService(options.customize, request, CancelToken);
    var apiList = utils.flatApi(list);
    this.serveMap = Object.entries(apiList).reduce(function (result, _ref10) {
      var _ref11 = _slicedToArray(_ref10, 2),
          apiName = _ref11[0],
          _ref11$ = _ref11[1],
          path = _ref11$.path,
          method = _ref11$.method;

      if (typeof _this2.methodAction[method] !== "function") {
        return result;
      }

      var serveName = utils.replaceFnName(apiName, matchStr, replaceStr);
      Reflect.set(_this2.enumName, apiName, serveName);
      Reflect.set(_this2.enumName, serveName, apiName);

      var serveFn = _this2.methodAction[method](path, serveName); // 设置请求函数名称


      Reflect.defineProperty(serveFn, "name", {
        value: serveName
      });
      Object.setPrototypeOf(serveFn, _objectSpread({
        resolve: function resolve() {
          var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var tplData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          var splitPath = (0, _urijs["default"])(utils.template(path, tplData));
          var dealURI = method === "get" ? splitPath.addQuery(data) : splitPath;
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
      }, CancelToken && {
        abort: function abort(key) {
          if (_this2.cancelList[key]) {
            _this2.cancelList[key][0]("取消重复请求");
          }

          Reflect.deleteProperty(_this2.cancelList, key);
        },
        abort2: function abort2(serveName) {
          Object.values(_this2.cancelList).forEach(function (_ref12) {
            var _ref13 = _slicedToArray(_ref12, 2),
                cancelFn = _ref13[0],
                oldServeName = _ref13[1];

            if (oldServeName === serveName) {
              cancelFn("取消重复请求");
            }
          });
        }
      }, {
        bind: Function.prototype.bind,
        call: Function.prototype.call,
        apply: Function.prototype.apply
      }));
      return _objectSpread({}, result, _defineProperty({}, serveName, {
        serveFn: serveFn,
        path: path,
        method: method
      }));
    }, {});
  }

  _createClass(ApiManage, [{
    key: "resolve",
    value: function resolve(serveName) {
      var serveFn = this.serveMap[serveName].serveFn;

      if (serveFn) {
        return serveFn.resolve;
      }

      return function () {
        return null;
      };
    }
  }, {
    key: "abort",
    value: function abort(serveName) {
      var serveFn = this.serveMap[serveName].serveFn;

      if (serveFn) {
        return serveFn.abort;
      }

      return function () {
        return null;
      };
    }
  }, {
    key: "getService",
    value: function getService() {
      return Object.entries(this.serveMap).reduce(function (r, _ref14) {
        var _ref15 = _slicedToArray(_ref14, 2),
            k = _ref15[0],
            items = _ref15[1];

        return _objectSpread({}, r, _defineProperty({}, k, items.serveFn));
      }, {});
    }
  }, {
    key: "createCancelToken",
    value: function createCancelToken(config) {
      var requestParams = config; // 发送请求之前，拦截重复请求(即当前正在进行的相同请求)

      return getRequestIdentify(requestParams, true);
    }
  }]);

  return ApiManage;
}();
/**
 * config: 请求数据
 * isReuest: 请求拦截器中 config.url = '/users', 响应拦截器中 config.url = 'http://localhost:3000/users'，所以加上一个标识来计算请求的全路径
 */


_defineProperty(ApiManage, "bindApi", utils.bindApi);

var getRequestIdentify = function getRequestIdentify(config) {
  var isReuest = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var url = config.url; // if (isReuest) {
  //     url = config.baseURL + config.url.substring(1, config.url.length)
  // }

  return config.method === "get" ? encodeURIComponent(url + JSON.stringify(config.params)) : encodeURIComponent(config.url + JSON.stringify(config.data));
};

var _default = ApiManage;
exports["default"] = _default;
module.exports = exports.default;