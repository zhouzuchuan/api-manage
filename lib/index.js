"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.defineApi = void 0;

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var getType = function getType(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
};

var isFunction = function isFunction(o) {
  return getType(o) === 'function';
};

var isObject = function isObject(o) {
  return getType(o) === 'object';
};

var defineApi = function defineApi(url) {
  return {
    url: url
  };
};

exports.defineApi = defineApi;

var ApiManage = /*#__PURE__*/function () {
  _createClass(ApiManage, null, [{
    key: "sortValue",

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
     * @param {*} cancelParams 取消请求配置
     * @returns
     */

    /**
     * 路径模板 根据 `:` 来匹配
     *
     * @param {string} template
     * @param {object|array|string|number} [data=[]]
     * @returns {string}
     */

    /**
     * 将api清单数据 拍平 成键值对映射（api名称 对应 其路径以及方法类型）
     *
     * @param {object} data
     * @returns {Record<string, { path: string; method: string }>}
     */

    /**
     * 替换字符串开头的字符串
     *
     * @param {*} apiName 需要替换的字符串
     * @param {*} matchStr 被替换的字符
     * @param {*} replaceStr 替换成的字符
     */
    value: function sortValue(value) {
      if (Array.isArray(value)) {
        return value.map(function (item) {
          return ApiManage.sortValue(item);
        });
      }

      if (!isObject(value)) return value;
      return Object.keys(value).sort().reduce(function (result, key) {
        result[key] = ApiManage.sortValue(value[key]);
        return result;
      }, {});
    }
    /**
     *  serveFn 列表
     * */

  }]);

  function ApiManage(options) {
    var _this = this;

    _classCallCheck(this, ApiManage);

    _defineProperty(this, "serveMap", {});

    _defineProperty(this, "cancelList", {});

    _defineProperty(this, "options", void 0);

    this.options = this.mergeOptions(options);

    if (typeof this.options.request !== 'function') {
      throw Error('apiManage: request must required!');
    }

    if (!isObject(this.options.list)) {
      throw Error('apiManage: list must be object!');
    }

    var customize = this.options.customize;
    var apiList = ApiManage.flatApi(this.options.list);
    this.serveMap = Object.entries(apiList).reduce(function (result, _ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          apiName = _ref2[0],
          _ref2$ = _ref2[1],
          path = _ref2$.path,
          method = _ref2$.method;

      var serveName = ApiManage.replaceFnName(apiName, _this.options.matchStr, _this.options.replaceStr);
      var serveFn = typeof customize[method] === 'function' ? customize[method](path, serveName) : _this.createServeFunction(path, method, serveName);

      if (typeof serveFn !== 'function') {
        throw Error("apiManage: customize.".concat(method, " must return function!"));
      }

      _this.attachServeFunctionMethods(serveFn, path, method, serveName);

      return _objectSpread(_objectSpread({}, result), {}, _defineProperty({}, serveName, {
        serveFn: serveFn,
        path: path,
        method: method
      }));
    }, {});
  }
  /**
   * 运行时动态请求。用于请求初始化时未知、运行时才拿到的接口地址。
   */


  _createClass(ApiManage, [{
    key: "call",
    value: function call(_ref3) {
      var url = _ref3.url,
          _ref3$method = _ref3.method,
          method = _ref3$method === void 0 ? 'get' : _ref3$method,
          params = _ref3.params,
          _ref3$tplData = _ref3.tplData,
          tplData = _ref3$tplData === void 0 ? {} : _ref3$tplData,
          _ref3$serveName = _ref3.serveName,
          serveName = _ref3$serveName === void 0 ? 'dynamicRequest' : _ref3$serveName,
          _ref3$isLimit = _ref3.isLimit,
          isLimit = _ref3$isLimit === void 0 ? true : _ref3$isLimit,
          _ref3$cancelParams = _ref3.cancelParams,
          cancelParams = _ref3$cancelParams === void 0 ? {} : _ref3$cancelParams,
          _ref3$extraOptions = _ref3.extraOptions,
          extraOptions = _ref3$extraOptions === void 0 ? {} : _ref3$extraOptions;
      return this.executeRequest({
        method: method,
        path: url,
        params: params,
        tplData: tplData,
        serveName: serveName,
        isLimit: isLimit,
        cancelParams: cancelParams,
        extraOptions: extraOptions
      });
    }
    /**
     * 合并 query 参数
     *
     * @param {string} [str]
     * @param {Record<string, any>} [data={}]
     * @returns {string}
     * @memberof ApiManage
     */

  }, {
    key: "mergeQuery",
    value: function mergeQuery() {
      var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return [].concat(_toConsumableArray(typeof str === 'string' && str.trim() ? str.trim().replace('?', '').split('&').map(function (item) {
        return item.split('=');
      }) : []), _toConsumableArray(Object.entries(data || {}))).map(function (item) {
        return item.join('=');
      }).join('&');
    }
    /**
     * 解析 请求地址
     *
     * @param {string} urlStr
     * @returns
     * @memberof ApiManage
     */

  }, {
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
      return Object.entries(this.serveMap).reduce(function (r, _ref4) {
        var _ref5 = _slicedToArray(_ref4, 2),
            k = _ref5[0],
            items = _ref5[1];

        return _objectSpread(_objectSpread({}, r), {}, _defineProperty({}, k, items.serveFn));
      }, {});
    }
  }, {
    key: "mergeOptions",
    value: function mergeOptions(options) {
      var defaultOptions = {
        matchStr: 'api',
        replaceStr: 'serve',
        hooks: {},
        limitResponse: function limitResponse(result) {
          return result;
        },
        customize: {},
        validate: function validate() {
          return true;
        }
      };
      return _objectSpread(_objectSpread({}, defaultOptions), options);
    }
  }, {
    key: "createServeFunction",
    value: function createServeFunction(path, method, serveName) {
      var _this2 = this;

      return function (params) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        var _options$tplData = options.tplData,
            tplData = _options$tplData === void 0 ? {} : _options$tplData,
            _options$cancelParams = options.cancelParams,
            cancelParams = _options$cancelParams === void 0 ? {} : _options$cancelParams,
            _options$isLimit = options.isLimit,
            isLimit = _options$isLimit === void 0 ? true : _options$isLimit,
            config = _objectWithoutProperties(options, ["tplData", "cancelParams", "isLimit"]);

        return _this2.executeRequest({
          method: method,
          path: path,
          serveName: serveName,
          params: params,
          tplData: tplData,
          cancelParams: cancelParams,
          isLimit: isLimit,
          extraOptions: config
        });
      };
    }
  }, {
    key: "attachServeFunctionMethods",
    value: function attachServeFunctionMethods(serveFn, path, method, serveName) {
      var _this3 = this;

      Reflect.defineProperty(serveFn, 'name', {
        value: serveName
      });

      serveFn.resolve = function () {
        var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var tplData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        return _this3.resolveRequest(path, method, serveName, data, tplData);
      };

      serveFn.abort = function () {
        Object.entries(_this3.cancelList).forEach(function (_ref6) {
          var _ref7 = _slicedToArray(_ref6, 2),
              cancelToken = _ref7[0],
              _ref7$ = _slicedToArray(_ref7[1], 2),
              cancelFn = _ref7$[0],
              oldServeName = _ref7$[1];

          if (oldServeName === serveName) {
            cancelFn('取消重复请求');
            Reflect.deleteProperty(_this3.cancelList, cancelToken);
          }
        });
      };
    }
  }, {
    key: "resolveRequest",
    value: function resolveRequest(path, method, serveName) {
      var _query;

      var data = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
      var tplData = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

      var _this$parseLocation = this.parseLocation(ApiManage.template(path, tplData)),
          protocol = _this$parseLocation.protocol,
          hostname = _this$parseLocation.hostname,
          port = _this$parseLocation.port,
          pathname = _this$parseLocation.pathname,
          query = _this$parseLocation.query,
          hash = _this$parseLocation.hash;

      query = method === 'get' ? this.mergeQuery(query, data) : ((_query = query) !== null && _query !== void 0 ? _query : '').trim().replace('?', '');

      if (typeof protocol === 'string') {
        protocol = protocol.replace(':', '');
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
        requestUrl: "".concat(protocol ? "".concat(protocol, "://") : '').concat(hostname || '').concat(port ? ":".concat(port) : '').concat(pathname || '').concat(query ? "?".concat(query) : '').concat(hash || '')
      };
    }
  }, {
    key: "executeRequest",
    value: function executeRequest(_ref8) {
      var _this4 = this,
          _cancelParams$open;

      var method = _ref8.method,
          path = _ref8.path,
          serveName = _ref8.serveName,
          params = _ref8.params,
          _ref8$tplData = _ref8.tplData,
          tplData = _ref8$tplData === void 0 ? {} : _ref8$tplData,
          _ref8$cancelParams = _ref8.cancelParams,
          cancelParams = _ref8$cancelParams === void 0 ? {} : _ref8$cancelParams,
          _ref8$isLimit = _ref8.isLimit,
          isLimit = _ref8$isLimit === void 0 ? true : _ref8$isLimit,
          _ref8$extraOptions = _ref8.extraOptions,
          extraOptions = _ref8$extraOptions === void 0 ? {} : _ref8$extraOptions;
      var normalizedMethod = method || 'get';
      var url = ApiManage.template(path, tplData);
      var requestToken = '';
      var cancelFnRef;
      var timestamp = "".concat(Date.now());

      var requestExtraOptions = _objectSpread({}, extraOptions);

      var typedServeName = serveName;
      var methodName = normalizedMethod;
      var requestContext = {
        serveName: typedServeName,
        params: params
      };

      var clearCurrentCancelToken = function clearCurrentCancelToken() {
        var _this4$cancelList$req;

        if (requestToken && cancelFnRef && ((_this4$cancelList$req = _this4.cancelList[requestToken]) === null || _this4$cancelList$req === void 0 ? void 0 : _this4$cancelList$req[0]) === cancelFnRef) {
          Reflect.deleteProperty(_this4.cancelList, requestToken);
        }
      };

      if (this.options.cancel && ((_cancelParams$open = cancelParams === null || cancelParams === void 0 ? void 0 : cancelParams.open) !== null && _cancelParams$open !== void 0 ? _cancelParams$open : true)) {
        requestToken = ApiManage.createCancelToken({
          url: url,
          method: normalizedMethod,
          context: requestContext,
          extraOptions: requestExtraOptions
        }, cancelParams);

        if (this.cancelList[requestToken]) {
          this.cancelList[requestToken][0]('取消重复请求');
          Reflect.deleteProperty(this.cancelList, requestToken);
        }

        try {
          var cancelResult = this.options.cancel(url, methodName, requestContext, requestExtraOptions);

          if (cancelResult === null || cancelResult === void 0 ? void 0 : cancelResult.cancel) {
            cancelFnRef = cancelResult.cancel;
            requestExtraOptions = _objectSpread(_objectSpread({}, requestExtraOptions), cancelResult.extraOptions);
            Reflect.set(this.cancelList, requestToken, [cancelResult.cancel, serveName]);
          }
        } catch (err) {
          console.error(err);
        }
      }

      return Promise.resolve().then(function () {
        var _this4$options$hooks$, _this4$options$hooks;

        return (_this4$options$hooks$ = (_this4$options$hooks = _this4.options.hooks).start) === null || _this4$options$hooks$ === void 0 ? void 0 : _this4$options$hooks$.call(_this4$options$hooks, typedServeName, timestamp);
      }).then(function () {
        return _this4.options.request(url, methodName, requestContext, requestExtraOptions);
      }).then(function (res) {
        return Promise.resolve(_this4.options.validate(res, typedServeName)).then(function (isValid) {
          var _this4$options$hooks$2, _this4$options$hooks2;

          if (!isValid) {
            throw {
              error: 'api-manage validate false',
              response: res
            };
          }

          clearCurrentCancelToken();
          return Promise.resolve((_this4$options$hooks$2 = (_this4$options$hooks2 = _this4.options.hooks).resolve) === null || _this4$options$hooks$2 === void 0 ? void 0 : _this4$options$hooks$2.call(_this4$options$hooks2, typedServeName, timestamp)).then(function () {
            return isLimit ? _this4.options.limitResponse(res, typedServeName) : res;
          });
        });
      }).then(function (value) {
        var _this4$options$hooks$3, _this4$options$hooks3;

        return Promise.resolve((_this4$options$hooks$3 = (_this4$options$hooks3 = _this4.options.hooks)["finally"]) === null || _this4$options$hooks$3 === void 0 ? void 0 : _this4$options$hooks$3.call(_this4$options$hooks3, typedServeName, timestamp)).then(function () {
          return value;
        });
      }, function (error) {
        var _this4$options$hooks$4, _this4$options$hooks4;

        return Promise.resolve((_this4$options$hooks$4 = (_this4$options$hooks4 = _this4.options.hooks).reject) === null || _this4$options$hooks$4 === void 0 ? void 0 : _this4$options$hooks$4.call(_this4$options$hooks4, typedServeName, timestamp, error))["catch"](function () {
          return undefined;
        }).then(function () {
          var _this4$options$hooks$5, _this4$options$hooks5;

          return Promise.resolve((_this4$options$hooks$5 = (_this4$options$hooks5 = _this4.options.hooks)["finally"]) === null || _this4$options$hooks$5 === void 0 ? void 0 : _this4$options$hooks$5.call(_this4$options$hooks5, typedServeName, timestamp));
        })["catch"](function () {
          return undefined;
        }).then(function () {
          return clearCurrentCancelToken();
        }).then(function () {
          throw error;
        });
      });
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
    return Object.entries(result).reduce(function (r2, _ref9) {
      var _ref10 = _slicedToArray(_ref9, 2),
          n = _ref10[0],
          m = _ref10[1];

      return _objectSpread(_objectSpread({}, r2), isObject(m) && _defineProperty({}, n, _objectSpread(_objectSpread({}, r2[n] || {}), m)));
    }, r);
  }, {});
});

_defineProperty(ApiManage, "createCancelToken", function (requestParams) {
  var _cancelParams$isCalcF, _cancelParams$include, _context$params;

  var cancelParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var method = requestParams.method,
      url = requestParams.url,
      context = requestParams.context,
      _requestParams$extraO = requestParams.extraOptions,
      extraOptions = _requestParams$extraO === void 0 ? {} : _requestParams$extraO;
  var isCalcFullPath = typeof cancelParams === 'boolean' ? true : (_cancelParams$isCalcF = cancelParams === null || cancelParams === void 0 ? void 0 : cancelParams.isCalcFullPath) !== null && _cancelParams$isCalcF !== void 0 ? _cancelParams$isCalcF : true;
  var includeConfigKeys = typeof cancelParams === 'boolean' ? [] : (_cancelParams$include = cancelParams === null || cancelParams === void 0 ? void 0 : cancelParams.includeConfigKeys) !== null && _cancelParams$include !== void 0 ? _cancelParams$include : [];
  var includedConfig = includeConfigKeys.reduce(function (result, key) {
    if (Reflect.has(extraOptions, key)) {
      result[key] = ApiManage.sortValue(extraOptions[key]);
    }

    return result;
  }, {});
  return isCalcFullPath ? encodeURIComponent(url + JSON.stringify(_objectSpread({
    method: method,
    params: ApiManage.sortValue((_context$params = context === null || context === void 0 ? void 0 : context.params) !== null && _context$params !== void 0 ? _context$params : {})
  }, includedConfig))) : url;
});

_defineProperty(ApiManage, "template", function (template) {
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var tmp = 0;
  var isA = Array.isArray(data);
  var isO = Object.prototype.toString.call(data).slice(8, -1).toLowerCase() === 'object';
  var dealData = !isO && !isA ? [data] : data;
  return template.split('/').map(function (v) {
    var result = v;

    if (v.startsWith(':')) {
      var d = dealData[isO ? v.slice(1) : tmp++];
      if (typeof d !== 'undefined') result = "".concat(d);
    }

    return result;
  }).join('/');
});

_defineProperty(ApiManage, "flatApi", function (data) {
  return Object.entries(data).reduce(function (result, _ref12) {
    var _ref13 = _slicedToArray(_ref12, 2),
        method = _ref13[0],
        items = _ref13[1];

    return _objectSpread(_objectSpread({}, result), Object.entries(items).reduce(function (r, _ref14) {
      var _ref15 = _slicedToArray(_ref14, 2),
          apiName = _ref15[0],
          item = _ref15[1];

      var path = typeof item === 'string' ? item : item.url;
      return _objectSpread(_objectSpread({}, r), {}, _defineProperty({}, apiName, {
        path: path,
        method: method
      }));
    }, {}));
  }, {});
});

_defineProperty(ApiManage, "replaceFnName", function (apiName, matchStr, replaceStr) {
  return matchStr ? apiName.replace(RegExp('^' + matchStr), replaceStr) : apiName;
});

var _default = ApiManage;
exports["default"] = _default;
