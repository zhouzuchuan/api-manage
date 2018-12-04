# api-manage

[![download](https://img.shields.io/npm/dm/api-manage.svg)](https://www.npmjs.com/search?q=api-manage)
[![npm](https://img.shields.io/npm/v/api-manage.svg)](https://www.npmjs.com/search?q=api-manage)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/zhouzuchuan/data-mock/master/LICENSE)

## 它是什么

-   本着约定大于配置的原则来管理应用 API 服务的解决方案
-   基于[axios](https://github.com/axios/axios) 请求库，对其方法浅封装（未对方法主体封装）

## 下载

```bash
# 安装
npm install api-manage

# 安装
yarn add api-manage
```

## 核心

### 约定

在 API 清单中的定义的 api 名，如 `apiGetToken`，在经过 api-manage 注入后的服务名则为`serveGetToken`。及将`api`替换成`serve`。

这么做有两点考虑

-   避免在组件内命名冲突（出现两种都用， `extractApi`会提到应用场景）

-   直观的理解该命名代表的是啥

### API 清单

应用接口管理，格式如下：

```js
const server = '';
module.exports = {
    post: {
        apiGetToken: `${server}/getToken`
    },
    get: {
        apiGetInfo: `${server}/getUserInfo`
    },
    delete: {
        apiDeleteInfo: `${server}/deleteInfo`
    }
    // 其他方法(put,...)
};
```

### init({[request,] list, matchStr, replaceStr})

```
request： 默认采用 axios，可以指定封装后的 axios

list：清单列表

matchStr：匹配的字符标识，默认为'api'

replaceStr：替换的字符标识，默认为'serve'
```

```
PS: 默认在 api 清单中申明的变量 "apiGetToken" 则在组件内调动使用 "serveGetToken"

```

#### 初始化

```js
import apiManage from 'api-manage';
import apiList from '../api'; // 引入清单
import axios from 'axios';

// 可以自定义axios对象
const service = axios.create({
    timeout: 2000
});

// 更多其他操作...

const serviceList = apiManage.init({
    request: service,
    list: apiList
});
```

#### 调用

封装后的函数支持两个参数： [请求需要的参数、路径匹配参数]

支持复杂接口匹配，调用，如： '/base/:id/:name'

```js
// api清单
{
    get: {
        apiGetToken: `/getToken/:id/:name`
    },
}
// 调用
serveGetToken({name: 'api-manage'}, {id: '1', name: 'api-manage'})

```

上面代码表示：在`serveGetToken`中 需要想后端传递参数 `{name: 'api-manage'}`，路径需要匹配的 `{id: '1', name: 'api-manage'}`。 由于上面定义的是 `GET` 方法，所以请求接口是 `/getToken/1/api-manage?name=api-manage`。这样可以满足定义路径格式

支持两种方式简写

如果需要匹配的数据大于等于 2 个，下面两种方法相同

```js

// api清单
{
    get: {
        apiGetToken: `/getToken/:id/:name`
    },
}

serveGetToken({name: 'api-manage'}, {id: '1', name: 'api-manage'})
// 或者
serveGetToken({name: 'api-manage'}, ['1', 'api-manage'])

```

如果需要匹配的数据就 1 个，下面三种种方法相同

```js

// api清单
{
    get: {
        apiGetToken: `/getToken/:id`
    },
}


serveGetToken({name: 'api-manage'}, {id: '1'})
// 或者
serveGetToken({name: 'api-manage'}, ['1'])
// 或者
serveGetToken({name: 'api-manage'}, '1')

```

```
PS: 如果后端不需要参数，但是接口需要匹配参数 则第一个参数需要传递 "{}", 如 serveGetToke({}, '1')
```

### getService

获取注入 API 清单之后的服务列表

```js
// 子组件
import apiManage from 'api-manage';

// 获取服务列表
const serviceList = apiManage.getService();
```

    注意：API清单注入需要在应用入口中

### extractApi(apiList [, type = false])

提取 API，主要用于 [data-mock](https://github.com/zhouzuchuan/dataMock) 的配合使用，以及应用中需要用到 API 的场景（上传等）

```
apiList: API清单

type: 获取api类型，默认为false，返回包括请求类型
```

```js
import apiManage from 'api-manage';
import apiList from '../api';

// apiGetToken 获取的值为 'post /getToken' (用于dataMock)
const { apiGetToken } = apiManage.extractApi(apiList);

//  apiGetToken 获取的值为 '/getToken' (用于应用中 如：上传等)
const { apiGetToken } = apiManage.extractApi(apiList, true);
```

### bindApi(fns [, params])

组合 API，提供 api 清单，用来组织大型项目大量的 api，方便管理以及调试

```js
// a.js
module.exports = ({ server }) => ({
    get: {
        apiLogin: `${server}/login`,
        apiGetInfo: `${server}/info`
    }
});
```

```js
// b.js
module.exports = ({ server }) => ({
    get: {
        apiGetList: `${server}/order/list`
    },
    put: {
        apiChangeInfo: `${server}/info`
    }
});
```

```js
// index.js
const { bindApi } = require('api-manage');

module.exports = bindApi([require('./a'), require('./b')], {
    server: ''
});

// 导出的格式如下
// get: {
//     apiLogin: `${server}/login`,
//     apiGetInfo: `${server}/info`
//     apiGetList: `${server}/order/list`
// },
// put: {
//     apiChangeInfo: `${server}/info`
// }
```

## Vue 使用

```js
// api清单
const server = '';
module.exports = {
    post: {
        apiGetToken: `${server}/getToken`
    }
};

// 入口 index.js
import Vue from 'vue';
import apiManage from 'api-manage';
import axios from 'axios';

const service = axios.create({
    timeout: 2000
});

// 注入api清单
Vue.prototype.$service = apiManage.init({
    request: service,
    list: require('../api')
});

// 子组件中方法调用
this.$service.serveGetToken(); // 调用方法
```

## React 使用

持续更新中。。。

## License

[MIT](https://tldrlegal.com/license/mit-license)

#### 🎉🎉🎉🎉 如果您觉的还可以，求点个 star 🎉🎉🎉🎉
