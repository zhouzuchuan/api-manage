'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var URI = _interopDefault(require('urijs'));

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

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
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

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var apiManage = {
  apiList: {},
  serviceList: {}
};

var getType = function getType(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
};
var isFunction = function isFunction(o) {
  return getType(o) === 'function';
};
var isObject = function isObject(o) {
  return getType(o) === 'object';
};
var isArray = function isArray(o) {
  return getType(o) === 'array';
};

var template = (function (template, data) {
  var tmp = 0;
  var isA = isArray(data);
  var isO = isObject(data);
  var dealData = !isO && !isA ? [data] : data;
  return template.split('/').map(function (v) {
    var result = v;

    if (v.startsWith(':')) {
      var d = dealData[isO ? v.slice(1) : tmp++];
      if (d) result = d;
    }

    return result;
  }).join('/');
});

var init = (function (_ref) {
  var _ref$request = _ref.request,
      request = _ref$request === void 0 ? require('axios')["default"] : _ref$request,
      list = _ref.list,
      _ref$matchStr = _ref.matchStr,
      matchStr = _ref$matchStr === void 0 ? 'api' : _ref$matchStr,
      _ref$replaceStr = _ref.replaceStr,
      replaceStr = _ref$replaceStr === void 0 ? 'serve' : _ref$replaceStr,
      _ref$validate = _ref.validate,
      validate = _ref$validate === void 0 ? function () {
    return true;
  } : _ref$validate,
      _ref$customize = _ref.customize,
      customize = _ref$customize === void 0 ? {} : _ref$customize;
  var filterArr = [];
  var serviceList = Object.entries(list).reduce(function (r, _ref2) {
    var _ref3 = _slicedToArray(_ref2, 2),
        method = _ref3[0],
        apis = _ref3[1];

    return _objectSpread({}, r, Object.entries(apis).reduce(function (r2, _ref4) {
      var _ref5 = _slicedToArray(_ref4, 2),
          name = _ref5[0],
          requestPath = _ref5[1];

      var apiFun = function apiFun() {
        return null;
      };

      var funName = name.replace(RegExp('^' + matchStr), replaceStr); //是否有自定义

      if (customize[method]) {
        apiFun = customize[method].bind(requestPath);
      } else {
        apiFun = function apiFun(params, tplData) {
          return new Promise(function (resolve, reject) {
            request(_defineProperty({
              method: method,
              url: template(requestPath, tplData)
            }, method === 'get' ? 'params' : 'data', params)).then(function (res) {
              if (validate(res)) {
                resolve(res);
              } else {
                reject({
                  error: 'api-manage validate false',
                  response: res
                });
              }
            })["catch"](reject);
          });
        }; // 设置请求函数名称


        Reflect.defineProperty(apiFun, 'name', {
          value: funName
        });
        Object.setPrototypeOf(apiFun, {
          resolve: function resolve(params, tplData) {
            var splitPath = URI(template(requestPath, tplData));
            return {
              fn: apiFun(params, tplData),
              api: requestPath,
              name: name,
              method: method,
              fullApi: method === 'get' ? splitPath.query(params) : splitPath
            };
          }
        });
      } // 设置请求函数名称


      Reflect.defineProperty(apiFun, 'name', {
        value: funName
      }); // 是否有前缀与设置不一样的清单名称

      if (!name.startsWith(matchStr)) {
        filterArr.push(name);
        return r2;
      }

      return _objectSpread({}, r2, _defineProperty({}, funName, apiFun));
    }, {}));
  }, {});

  if (filterArr.length) {
    console.warn("\u4EE5\u4E0B\u6E05\u5355api\u4E0D\u7B26\u5408\u89C4\u8303\uFF0C\u5FC5\u987B\u5305\u542B\u524D\u7F00 \"".concat(matchStr, "\", \u5DF2\u8FC7\u6EE4!"), filterArr);
  }

  apiManage.serviceList = serviceList;
  return serviceList;
});

var getService = (function () {
  return apiManage.serviceList;
});

var extractApi = (function (data) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return Object.entries(data).reduce(function (r, _ref) {
    var _ref2 = _slicedToArray(_ref, 2),
        key = _ref2[0],
        apis = _ref2[1];

    return _objectSpread({}, r, Object.entries(apis).reduce(function (r1, _ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          name = _ref4[0],
          path = _ref4[1];

      return _objectSpread({}, r1, _defineProperty({}, name, "".concat(type ? '' : "".concat(key, " ")).concat(path)));
    }, {}));
  }, {});
});

var bindApi = (function (fns, params) {
  return (isArray(fns) ? fns : [fns]).reduce(function (r, v) {
    if (!(isFunction(v) || isObject(v))) return r;
    var result = isFunction(v) ? v(params) : v;
    if (!isObject(result)) return r;
    return Object.entries(result).reduce(function (r2, _ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          n = _ref2[0],
          m = _ref2[1];

      return _objectSpread({}, r2, isObject(m) && _defineProperty({}, n, _objectSpread({}, r2[n] || {}, m)));
    }, r);
  }, {});
});

var index = {
  init: init,
  getService: getService,
  extractApi: extractApi,
  bindApi: bindApi
};

exports.init = init;
exports.getService = getService;
exports.extractApi = extractApi;
exports.bindApi = bindApi;
exports.default = index;
