'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

var defineProperty = function (obj, key, value) {
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
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var slicedToArray = function () {
  function sliceIterator(arr, i) {
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
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var init = (function (_ref) {
    var _ref$request = _ref.request,
        request = _ref$request === undefined ? require('axios').default : _ref$request,
        list = _ref.list,
        _ref$matchStr = _ref.matchStr,
        matchStr = _ref$matchStr === undefined ? 'api' : _ref$matchStr,
        _ref$replaceStr = _ref.replaceStr,
        replaceStr = _ref$replaceStr === undefined ? 'serve' : _ref$replaceStr,
        _ref$validate = _ref.validate,
        validate = _ref$validate === undefined ? function () {
        return true;
    } : _ref$validate,
        _ref$customize = _ref.customize,
        customize = _ref$customize === undefined ? {} : _ref$customize;

    var serviceList = Object.entries(list).reduce(function (r, _ref2) {
        var _ref3 = slicedToArray(_ref2, 2),
            method = _ref3[0],
            api = _ref3[1];

        return _extends({}, r, Object.entries(api).reduce(function (r2, _ref4) {
            var _ref5 = slicedToArray(_ref4, 2),
                name = _ref5[0],
                requestPath = _ref5[1];

            var apiFun = customize[method] || function (params, tplData) {
                return new Promise(function (resolve) {
                    request(defineProperty({
                        method: method,
                        url: template(requestPath, tplData)
                    }, method === 'get' ? 'params' : 'data', params)).then(function (res) {
                        if (validate(res)) {
                            resolve(res);
                        }
                    });
                });

                // return request({
                //     method,
                //     url: template(requestPath, tplData),
                //     [method === 'get' ? 'params' : 'data']: params,
                // });
            };
            var funName = name.replace(RegExp('^' + matchStr), replaceStr);
            Reflect.defineProperty(apiFun, 'name', { value: funName });
            return _extends({}, r2, defineProperty({}, funName, apiFun));
        }, {}));
    }, {});
    apiManage.serviceList = serviceList;
    return serviceList;
});

var getService = (function () {
  return apiManage.serviceList;
});

var extractApi = (function (data) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    return Object.entries(data).reduce(function (r, _ref) {
        var _ref2 = slicedToArray(_ref, 2),
            key = _ref2[0],
            apis = _ref2[1];

        return _extends({}, r, Object.entries(apis).reduce(function (r1, _ref3) {
            var _ref4 = slicedToArray(_ref3, 2),
                name = _ref4[0],
                path = _ref4[1];

            return _extends({}, r1, defineProperty({}, name, '' + (type ? '' : key + ' ') + path));
        }, {}));
    }, {});
});

var bindApi = (function (fns, params) {
    return (isArray(fns) ? fns : [fns]).reduce(function (r, v) {
        if (!(isFunction(v) || isObject(v))) return r;
        var result = isFunction(v) ? v(params) : v;
        if (!isObject(result)) return r;
        return Object.entries(result).reduce(function (r2, _ref) {
            var _ref2 = slicedToArray(_ref, 2),
                n = _ref2[0],
                m = _ref2[1];

            return _extends({}, r2, isObject(m) && defineProperty({}, n, _extends({}, r2[n] || {}, m)));
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
