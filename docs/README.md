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

### init({[request,] list})

```
 request： 默认采用 axios，可以指定封装后的 axios
 list：清单列表
```

```js
import apiManage from 'api-manage';
import apiList from '../api'; // 引入清单
import axios from 'axios';

const service = axios.create({
    timeout: 2000
});

// 更多其他操作...

const serviceList = apiManage.init({
    request: service,
    list: apiList
});
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

提取 API，主要用于 dataMock 的配合使用，以及应用中需要用到 API 的场景（上传等）

    apiList: API清单
    type: 获取api类型，默认为false，返回包括请求类型

```js
import apiManage from 'api-manage';
import apiList from '../api';

// apiGetToken 获取的值为 'post /getToken' (用于dataMock)
const { apiGetToken } = apiManage.extractApi(apiList);

//  apiGetToken 获取的值为 '/getToken' (用于应用中 如：上传等)
const { apiGetToken } = apiManage.extractApi(apiList, true);
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
