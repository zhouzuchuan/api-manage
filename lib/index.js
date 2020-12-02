"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// interface methods {
//     get: "GET";
//     post: "POST";
//     put: "PUT";
//     delete: "DELETE";
//     options: "OPTIONS";
//     head: "HEAD";
//     trace: "TRACE";
//     connect: "CONNECT";
// }
var getType = function getType(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
};

var isFunction = function isFunction(o) {
  return getType(o) === "function";
};

var isObject = function isObject(o) {
  return getType(o) === "object";
};

var ApiManage = /*#__PURE__*/function () {
  _createClass(ApiManage, [{
    key: "mergeOptions",

    /**
     * 将多个api清单文件 合并成一个
     *
     * @param {any[]} fns api清单集合
     * @param {*} params api如果是函数 则为参数传入该函数中
     * @returns {ApiList}
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
     * @param {string} template
     * @param {object|array} [data=[]]
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

    /**
     * 合并 参数
     *
     * @private
     * @template T
     * @param {T} op
     * @returns {UnPartial<T>}
     * @memberof ApiManage
     */
    value: function mergeOptions(op) {
      var defaultOptions = {
        matchStr: "api",
        replaceStr: "serve",
        hooks: {},
        limitResponse: function limitResponse(result) {
          return result;
        },
        defaultMethodNames: ["get", "post", "put", "delete"],
        methodsForDataKeyNames: {
          get: "params"
        },
        customize: {},
        validate: function validate() {
          return true;
        }
      };
      return _objectSpread(_objectSpread({}, defaultOptions), op);
    }
    /**
     * 合并 query 参数
     *
     * @private
     * @param {string} [str]
     * @param {Record<string, any>} [data={}]
     * @returns {string}
     * @memberof ApiManage
     */

  }, {
    key: "mergeQuery",
    value: function mergeQuery(str) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return [].concat(_toConsumableArray(typeof str === "string" && str.trim() ? str.trim().replace("?", "").split("&").map(function (item) {
        return item.split("=");
      }) : []), _toConsumableArray(Object.entries(data))).map(function (item) {
        return item.join("=");
      }).join("&");
    }
  }]);

  function ApiManage(options) {
    var _this = this;

    _classCallCheck(this, ApiManage);

    _defineProperty(this, "serveMap", {});

    _defineProperty(this, "cancelList", {});

    var _this$mergeOptions = this.mergeOptions(options),
        list = _this$mergeOptions.list,
        matchStr = _this$mergeOptions.matchStr,
        replaceStr = _this$mergeOptions.replaceStr,
        _this$mergeOptions$ho = _this$mergeOptions.hooks,
        hooks = _this$mergeOptions$ho === void 0 ? {} : _this$mergeOptions$ho,
        limitResponse = _this$mergeOptions.limitResponse,
        defaultMethodNames = _this$mergeOptions.defaultMethodNames,
        request = _this$mergeOptions.request,
        CancelRequest = _this$mergeOptions.CancelRequest,
        methodsForDataKeyNames = _this$mergeOptions.methodsForDataKeyNames,
        customize = _this$mergeOptions.customize,
        validate = _this$mergeOptions.validate;

    if (typeof request !== "function") {
      throw Error("apiManage: request must required!");
    }

    var methodAction = _objectSpread(_objectSpread({}, defaultMethodNames.reduce(function (r, method) {
      return _objectSpread(_objectSpread({}, r), {}, _defineProperty({}, method, function (path, serveName) {
        return function (params) {
          var _methodsForDataKeyNam, _cancelParams$open;

          var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

          var _ref$tplData = _ref.tplData,
              tplData = _ref$tplData === void 0 ? {} : _ref$tplData,
              _ref$cancelParams = _ref.cancelParams,
              cancelParams = _ref$cancelParams === void 0 ? {} : _ref$cancelParams,
              config = _objectWithoutProperties(_ref, ["tplData", "cancelParams"]);

          var requestParams = _defineProperty({
            method: method,
            url: ApiManage.template(path, tplData)
          }, (_methodsForDataKeyNam = methodsForDataKeyNames[method]) !== null && _methodsForDataKeyNam !== void 0 ? _methodsForDataKeyNam : "data", params);

          var requestToken = ""; // 如果存在取消请求函数 则 执行以及初始化 取消请求

          if (CancelRequest && ((_cancelParams$open = cancelParams === null || cancelParams === void 0 ? void 0 : cancelParams.open) !== null && _cancelParams$open !== void 0 ? _cancelParams$open : true)) {
            requestToken = ApiManage.createCancelToken(requestParams, cancelParams); // 中断 同一个 token

            if (_this.cancelList[requestToken]) {
              _this.cancelList[requestToken][0]("取消重复请求");

              Reflect.deleteProperty(_this.cancelList, requestToken);
            }

            try {
              config.cancelToken = new CancelRequest(function (cancleFn) {
                Reflect.set(_this.cancelList, requestToken, [cancleFn, serveName]);
              });
            } catch (err) {
              console.error(err);
            }
          }

          return new Promise(function (resolve, reject) {
            var _hooks$start;

            // 生成时间戳
            var timestamp = "".concat(new Date().getTime());
            hooks === null || hooks === void 0 ? void 0 : (_hooks$start = hooks.start) === null || _hooks$start === void 0 ? void 0 : _hooks$start.call(hooks, serveName, timestamp);
            request(_objectSpread(_objectSpread({}, config), requestParams)).then(function (res) {
              if (validate(res, serveName)) {
                var _hooks$resolve;

                // 如果存在 取消函数 则取消该函数记录
                if (!!requestToken) {
                  // 请求成功 删除取消函数
                  Reflect.deleteProperty(_this.cancelList, requestToken);
                }

                hooks === null || hooks === void 0 ? void 0 : (_hooks$resolve = hooks.resolve) === null || _hooks$resolve === void 0 ? void 0 : _hooks$resolve.call(hooks, serveName, timestamp);
                resolve(limitResponse(res, serveName));
              } else {
                reject({
                  error: "api-manage validate false",
                  response: res
                });
              }
            })["catch"](reject)["finally"](function () {
              var _hooks$finally;

              hooks === null || hooks === void 0 ? void 0 : (_hooks$finally = hooks["finally"]) === null || _hooks$finally === void 0 ? void 0 : _hooks$finally.call(hooks, serveName, timestamp);
            });
          })["catch"](hooks === null || hooks === void 0 ? void 0 : hooks.reject);
        };
      }));
    }, {})), customize);

    var apiList = ApiManage.flatApi(list);
    this.serveMap = Object.entries(apiList).reduce(function (result, _ref2) {
      var _methodAction$method;

      var _ref3 = _slicedToArray(_ref2, 2),
          apiName = _ref3[0],
          _ref3$ = _ref3[1],
          path = _ref3$.path,
          method = _ref3$.method;

      if (typeof methodAction[method] !== "function") {
        return result;
      }

      var serveName = ApiManage.replaceFnName(apiName, matchStr, replaceStr);
      var serveFn = methodAction === null || methodAction === void 0 ? void 0 : (_methodAction$method = methodAction[method]) === null || _methodAction$method === void 0 ? void 0 : _methodAction$method.call(methodAction, path, serveName); // 设置请求函数名称

      Reflect.defineProperty(serveFn, "name", {
        value: serveName
      }); // 设置原型

      Reflect.setPrototypeOf(serveFn, Object.create(_objectSpread(_objectSpread({
        resolve: function resolve() {
          var _query;

          var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var tplData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

          var _this$parseLocation = _this.parseLocation(ApiManage.template(path, tplData)),
              protocol = _this$parseLocation.protocol,
              hostname = _this$parseLocation.hostname,
              port = _this$parseLocation.port,
              pathname = _this$parseLocation.pathname,
              query = _this$parseLocation.query,
              hash = _this$parseLocation.hash;

          query = method === "get" ? _this.mergeQuery(query, data) : ((_query = query) !== null && _query !== void 0 ? _query : "").trim().replace("?", "");

          if (typeof protocol === "string") {
            protocol = protocol.replace(":", "");
          }

          return {
            url: path,
            name: serveName,
            method: method,
            hostname: hostname,
            pathname: pathname,
            port: port,
            hash: hash,
            protocol: protocol,
            query: query,
            requestUrl: "".concat(protocol ? "".concat(protocol, "://") : "").concat(hostname || "").concat(port ? ":".concat(port) : "").concat(pathname || "").concat(query ? "?".concat(query) : "").concat(hash || "")
          };
        }
      }, CancelRequest && {
        // 中断请求（通过serveName 来匹配, 会中断多个参数不同但serveFn相同的函数）
        abort: function abort() {
          Object.entries(_this.cancelList).forEach(function (_ref4) {
            var _ref5 = _slicedToArray(_ref4, 2),
                cancelToken = _ref5[0],
                _ref5$ = _slicedToArray(_ref5[1], 2),
                cancelFn = _ref5$[0],
                oldServeName = _ref5$[1];

            if (oldServeName === serveName) {
              cancelFn("取消重复请求");
              Reflect.deleteProperty(_this.cancelList, cancelToken);
            }
          });
        }
      }), {}, {
        bind: Function.prototype.bind,
        call: Function.prototype.call,
        apply: Function.prototype.apply
      })));
      return _objectSpread(_objectSpread({}, result), {}, _defineProperty({}, serveName, {
        serveFn: serveFn,
        path: path,
        method: method
      }));
    }, {});
  }
  /**
   * 解析 请求地址
   *
   * @param {string} urlStr
   * @returns
   * @memberof ApiManage
   */


  _createClass(ApiManage, [{
    key: "parseLocation",
    value: function parseLocation(urlStr) {
      var regex = /^(?:(https?:)\/\/)?([^:/]*)(?::([^/]*))?([^?#]*)(\?[^#]+)?(#.+)?/;

      var _match$slice = urlStr.match(regex).slice(1),
          _match$slice2 = _slicedToArray(_match$slice, 6),
          protocol = _match$slice2[0],
          hostname = _match$slice2[1],
          port = _match$slice2[2],
          pathname = _match$slice2[3],
          query = _match$slice2[4],
          hash = _match$slice2[5];

      return {
        protocol: protocol,
        hostname: hostname,
        port: port,
        pathname: pathname,
        query: query,
        hash: hash
      };
    }
    /**
     * 解析请求地址
     *
     * @param {string} serveName 指定的请求名称
     * @returns {TResolveFn}
     * @memberof ApiManage
     */

  }, {
    key: "resolve",
    value: function resolve(serveName) {
      var _this$serveMap, _this$serveMap$serveN, _this$serveMap$serveN2;

      return (_this$serveMap = this.serveMap) === null || _this$serveMap === void 0 ? void 0 : (_this$serveMap$serveN = _this$serveMap[serveName]) === null || _this$serveMap$serveN === void 0 ? void 0 : (_this$serveMap$serveN2 = _this$serveMap$serveN.serveFn) === null || _this$serveMap$serveN2 === void 0 ? void 0 : _this$serveMap$serveN2.resolve;
    }
    /**
     * 中断请求
     *
     * @param {string} serveName 指定的请求名称
     * @returns {void}
     * @memberof ApiManage
     */

  }, {
    key: "abort",
    value: function abort(serveName) {
      var _this$serveMap2, _this$serveMap2$serve, _this$serveMap2$serve2, _this$serveMap2$serve3;

      return (_this$serveMap2 = this.serveMap) === null || _this$serveMap2 === void 0 ? void 0 : (_this$serveMap2$serve = _this$serveMap2[serveName]) === null || _this$serveMap2$serve === void 0 ? void 0 : (_this$serveMap2$serve2 = _this$serveMap2$serve.serveFn) === null || _this$serveMap2$serve2 === void 0 ? void 0 : (_this$serveMap2$serve3 = _this$serveMap2$serve2.abort) === null || _this$serveMap2$serve3 === void 0 ? void 0 : _this$serveMap2$serve3.call(_this$serveMap2$serve2);
    }
    /**
     * 获取所有 api 请求函数
     *
     * @returns {Record<string, any>}
     * @memberof ApiManage
     */

  }, {
    key: "getService",
    value: function getService() {
      return Object.entries(this.serveMap).reduce(function (r, _ref6) {
        var _ref7 = _slicedToArray(_ref6, 2),
            k = _ref7[0],
            items = _ref7[1];

        return _objectSpread(_objectSpread({}, r), {}, _defineProperty({}, k, items.serveFn));
      }, {});
    }
  }]);

  return ApiManage;
}();

_defineProperty(ApiManage, "bindApi", function (fns, params) {
  return (Array.isArray(fns) ? fns : [fns]).reduce(function (r, v) {
    // 如果不是函数以及键值对 则过滤
    if (!(isFunction(v) || isObject(v))) return r; // 如果是函数 则执行并将params传入参数

    var result = isFunction(v) ? v(params) : v; // 如果返回的不是对象键值对 则过滤

    if (!isObject(result)) return r;
    return Object.entries(result).reduce(function (r2, _ref8) {
      var _ref9 = _slicedToArray(_ref8, 2),
          n = _ref9[0],
          m = _ref9[1];

      return _objectSpread(_objectSpread({}, r2), isObject(m) && _defineProperty({}, n, _objectSpread(_objectSpread({}, r2[n] || {}), m)));
    }, r);
  }, {});
});

_defineProperty(ApiManage, "createCancelToken", function (requestParams, cancelParams) {
  var _cancelParams$isCalcF;

  var method = requestParams.method,
      url = requestParams.url,
      _requestParams$params = requestParams.params,
      params = _requestParams$params === void 0 ? {} : _requestParams$params,
      _requestParams$data = requestParams.data,
      data = _requestParams$data === void 0 ? {} : _requestParams$data;
  return ((_cancelParams$isCalcF = cancelParams === null || cancelParams === void 0 ? void 0 : cancelParams.isCalcFullPath) !== null && _cancelParams$isCalcF !== void 0 ? _cancelParams$isCalcF : true) ? encodeURIComponent(url + JSON.stringify(method === "get" ? {
    params: params
  } : {
    data: data
  })) : url;
});

_defineProperty(ApiManage, "template", function (template) {
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
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
});

_defineProperty(ApiManage, "flatApi", function (data) {
  return Object.entries(data).reduce(function (result, _ref11) {
    var _ref12 = _slicedToArray(_ref11, 2),
        method = _ref12[0],
        items = _ref12[1];

    return _objectSpread(_objectSpread({}, result), Object.entries(items).reduce(function (r, _ref13) {
      var _ref14 = _slicedToArray(_ref13, 2),
          apiName = _ref14[0],
          path = _ref14[1];

      return _objectSpread(_objectSpread({}, r), {}, _defineProperty({}, apiName, {
        path: path,
        method: method
      }));
    }, {}));
  }, {});
});

_defineProperty(ApiManage, "replaceFnName", function (apiName, matchStr, replaceStr) {
  return matchStr ? apiName.replace(RegExp("^" + matchStr), replaceStr) : apiName;
});

var _default = ApiManage;
exports["default"] = _default;
module.exports = exports.default;