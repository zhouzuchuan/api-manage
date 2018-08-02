'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var axios = _interopDefault(require('axios'));

var apiManage = {
    request: axios,
    apiList: {},
    serviceList: {}
};

var template = (function (template, data) {
    return template.split('/').map(function (v) {
        return v.startsWith(':') && data[v.slice(1)] ? data[v.slice(1)] : v;
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
        request = _ref$request === undefined ? apiManage.request : _ref$request,
        list = _ref.list;

    apiManage.serviceList = Object.entries(list).reduce(function (r, _ref2) {
        var _ref3 = slicedToArray(_ref2, 2),
            method = _ref3[0],
            api = _ref3[1];

        return _extends({}, r, Object.entries(api).reduce(function (r2, _ref4) {
            var _ref5 = slicedToArray(_ref4, 2),
                name = _ref5[0],
                requestPath = _ref5[1];

            return _extends({}, r2, defineProperty({}, name.replace(/^api/, 'serve'), function (params, data) {
                return request(defineProperty({
                    method: method,
                    url: template(requestPath, data)
                }, method === 'get' ? 'params' : 'data', params));
            }));
        }, {}));
    }, {});
});

var getService = (function () {
  return apiManage.serviceList;
});

var apiManage$1 = {
    init: init,
    getService: getService
};

module.exports = apiManage$1;
