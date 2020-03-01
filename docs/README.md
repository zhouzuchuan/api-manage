# api-manage

[![download](https://img.shields.io/npm/dm/api-manage.svg)](https://www.npmjs.com/search?q=api-manage)
[![npm](https://img.shields.io/npm/v/api-manage.svg)](https://www.npmjs.com/search?q=api-manage)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/zhouzuchuan/data-mock/master/LICENSE)

## 它是什么

-   本着约定大于配置的原则来管理应用 API 服务的解决方案
-   减少 API 服务积累带来的样板代码
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

这里主要是区别两者的含义

可以通过参数来自定义规则，[点击这里](/api?id=matchstr)

### API 清单

是用来管理应用程序的请求 api 地址，统一管理 既方便使用也方便修改和查找

api 清单格式目前分为以下两种形式

-   `键值对形式`

    ```js
    export default {
        post: {
            apiHome_GetToken: "/getToken"
        },
        get: {
            apiHome_GetInfo: "/getUserInfo"
        },
        delete: {
            apiHome_DeleteInfo: "/deleteInfo"
        }
        // 其他方法(put,...)
    };
    ```

-   `函数形式`

    ```js
    export default ({ server }) => ({
        post: {
            apiHome_GetToken: `${server}/getToken`
        },
        get: {
            apiHome_GetInfo: `${server}/getUserInfo`
        },
        delete: {
            apiHome_DeleteInfo: `${server}/deleteInfo`
        }
        // 其他方法(put,...)
    });
    ```

建议采用 `函数形式` ，可以通过穿值方式来给不同 api 添加前缀，

```
PS： 切换不同开发环境也非常实用（生产环境、开发环境、mock环境等）
```

## 使用

```js
// apiList.js

export default {
    post: {
        apiHome_GetToken: `${server}/getToken`
    },
    get: {
        apiHome_GetInfo: `${server}/getUserInfo`
    },
    delete: {
        apiHome_DeleteInfo: `${server}/deleteInfo`
    }
};
```

```js
import ApiManage from "api-manage";
import apiList from "./apiList.js";

const apiManage = new ApiManage({
    list: apiList
});

// 取到所有请求函数
const service = apiManage.getService();

// 使用
service.serveHome_GetToken();
```

这里面的 `serveHome_GetToken` 是处理后的 请求函数名称。默认将 `^api` 替换成了 `^serve` ，主要是区分 api 和请求函数，也可以通过设置来抹平这种区别

## License

[MIT](https://tldrlegal.com/license/mit-license)
