# API 参考

本文档对应 `api-manage@3.0.0`。

## 构造函数

```ts
const apiManage = new ApiManage({
    list,
    request,
    limitResponse,
    validate,
    hooks,
    CancelRequest,
});
```

### `list` 必填

API 清单。外层 key 是请求方法，内层 key 是接口名。

推荐使用 `defineApi`：

```ts
import { defineApi } from "api-manage";

const apiList = {
    get: {
        apiGetUser: defineApi<ApiResponse<UserInfo>, { id: number }>("/user"),
    },
    post: {
        apiCreateUser: defineApi<ApiResponse<UserInfo>, { name: string }>(
            "/user",
        ),
    },
} as const;
```

兼容旧字符串清单：

```ts
const apiList = {
    get: {
        apiGetUser: "/user",
    },
} as const;
```

函数式清单适合注入环境前缀：

```ts
export default ({ server }: { server: string }) =>
    ({
        get: {
            apiGetUser: defineApi<ApiResponse<UserInfo>, { id: number }>(
                `${server}/user`,
            ),
        },
    }) as const;
```

### `request` 必填

真正执行请求的函数。它必须接受一个对象，至少包含 `url`、`method`，并按方法接收 `params` 或 `data`。

```ts
const apiManage = new ApiManage<typeof apiList>({
    list: apiList,
    request: (options) => axios(options),
});
```

GET 默认把参数放到 `params`，其他方法默认放到 `data`：

```ts
serveGetUser({ id: 1 });
// request({ method: "get", url: "/user", params: { id: 1 } })

serveCreateUser({ name: "Tom" });
// request({ method: "post", url: "/user", data: { name: "Tom" } })
```

### `limitResponse`

处理请求成功后的返回值。默认返回原始响应。

```ts
const apiManage = new ApiManage<typeof apiList>({
    list: apiList,
    request,
    limitResponse: (res, serveName) => res.data,
});
```

请求函数默认返回 `limitResponse` 后的数据；传入 `{ isLimit: false }` 时返回原始响应。

```ts
const data = await apis.serveGetUser({ id: 1 });
const raw = await apis.serveGetUser({ id: 1 }, { isLimit: false });
```

类型层默认使用 `LimitResult<T>` 推导处理后类型。如果运行时不是 `res => res.data`，用 `defineApi` 第三个泛型指定：

```ts
apiGetUser: defineApi<RetResponse<UserInfo>, { id: number }, UserInfo>(
    "/user",
);
```

### `validate`

在 `limitResponse` 前执行，支持同步或异步。返回 `false` 时请求会 reject。

```ts
validate: async (res, serveName) => {
    return res.code === 0;
}
```

### `hooks`

请求生命周期钩子。

```ts
hooks: {
    start: (serveName, timestamp) => {},
    resolve: (serveName, timestamp) => {},
    reject: (serveName, timestamp, error) => {},
    finally: (serveName, timestamp) => {},
}
```

-   `start`：请求发起前
-   `resolve`：`validate` 通过后
-   `reject`：请求失败或 `validate` 返回 `false`
-   `finally`：成功或失败都会触发

### `CancelRequest`

取消请求构造函数。常见场景是接入 axios CancelToken，用于取消重复请求。

```ts
const apiManage = new ApiManage({
    list,
    request: axios,
    CancelRequest: axios.CancelToken,
});
```

默认会按 `url + params/data` 计算取消 token。可以通过 `cancelParams` 调整。

### `matchStr` / `replaceStr`

控制接口名到请求函数名的转换。

```ts
new ApiManage({
    list,
    request,
    matchStr: "api",
    replaceStr: "serve",
});
```

默认转换：

```text
apiGetUser -> serveGetUser
```

### `defaultMethodNames`

默认支持的 HTTP 方法：

```ts
["get", "post", "put", "delete"]
```

如果需要支持更多方法：

```ts
defaultMethodNames: ["get", "post", "patch", "delete"];
```

### `methodsForDataKeyNames`

配置不同方法的参数字段名。

```ts
methodsForDataKeyNames: {
    get: "params",
    post: "data",
}
```

默认只有 `get` 使用 `params`，其他方法使用 `data`。

### `customize`

为某个 method 自定义请求函数生成逻辑。

```ts
customize: {
    upload: (path, serveName) => {
        const fn = ((data) => request({ method: "post", url: path, data })) as ServeFunction;
        fn.resolve = () => ({ requestUrl: path || "" });
        fn.abort = () => {};
        return fn;
    },
}
```

## 实例方法

### `getService<ResultMap, ParamsMap>()`

返回所有生成后的请求函数。

```ts
const apis = apiManage.getService();
await apis.serveGetUser({ id: 1 });
```

旧字符串清单可以通过泛型补充类型：

```ts
type ResultMap = {
    serveGetUser: ApiResponse<UserInfo>;
};

type ParamsMap = {
    serveGetUser: { id: number };
};

const apis = apiManage.getService<ResultMap, ParamsMap>();
```

### `call<R>()`

运行时动态请求。适合接口地址不是初始化时已知的场景。

```ts
const result = await apiManage.call<UserInfo>({
    url: "/runtime/:id/detail",
    method: "post",
    data: { userId: 1 },
    tplData: { id: "abc" },
    serveName: "runtimeDetail",
    config: {
        headers: { noEncrypt: true },
    },
});
```

`call` 会复用 `request`、`validate`、`limitResponse`、`hooks` 和取消重复请求逻辑。

### `resolve(serveName)`

获取某个请求函数的地址解析方法。

```ts
const resolveGetUser = apiManage.resolve("serveGetUser");
const data = resolveGetUser({ keyword: "tom" }, { id: 1 });

console.log(data.requestUrl);
```

### `abort(serveName)`

取消指定请求函数下的所有 pending 请求。

```ts
apiManage.abort("serveGetUser");
```

### `mergeQuery(str, data)`

合并 URL query 字符串和对象。

```ts
apiManage.mergeQuery("?a=1", { b: 2 });
// "a=1&b=2"
```

### `parseLocation(url)`

解析 URL。

```ts
apiManage.parseLocation("https://example.com:8080/a?b=1#hash");
```

## 静态方法

### `ApiManage.bindApi(fns, params)`

合并多个 API 清单。

```ts
const list = ApiManage.bindApi([userApi, fileApi], {
    server: "/api",
});
```

支持对象清单和函数清单。

### `ApiManage.template(template, data)`

解析路径模板。

```ts
ApiManage.template("/user/:id", { id: 1 });
// "/user/1"

ApiManage.template("/user/:0/:1", [1, "profile"]);
// "/user/1/profile"
```

`data` 类型为 `TemplateData`：`string | number | Array<string | number> | Record<string, string | number>`。

### `ApiManage.flatApi(list)`

把按 method 分组的清单拍平成：

```ts
{
    apiGetUser: {
        path: "/user",
        method: "get",
    },
}
```

### `ApiManage.replaceFnName(apiName, matchStr, replaceStr)`

替换接口名前缀。

```ts
ApiManage.replaceFnName("apiGetUser", "api", "serve");
// "serveGetUser"
```

### `ApiManage.createCancelToken(requestParams, cancelParams)`

生成重复请求取消 token。

```ts
ApiManage.createCancelToken({
    method: "get",
    url: "/user",
    params: { id: 1 },
});
```

## 请求函数

### `serveXxx(params, options)`

```ts
await apis.serveGetUser({ id: 1 });
```

`options` 支持：

```ts
type ServeFnOptions = {
    tplData?: TemplateData;
    cancelParams?: {
        isCalcFullPath?: boolean;
        open?: boolean;
    };
    isLimit?: boolean;
} & Record<string, any>;
```

-   `tplData`：路径模板数据
-   `cancelParams.open`：是否开启重复请求取消，默认 `true`
-   `cancelParams.isCalcFullPath`：取消 token 是否包含参数，默认 `true`
-   `isLimit`：是否返回 `limitResponse` 后的数据，默认 `true`
-   其他字段会透传到 `request`，例如 `headers`

### `serveXxx.resolve(params, tplData)`

只解析真实请求地址，不发请求。

```ts
apis.serveGetUser.resolve({ keyword: "tom" }, { id: 1 }).requestUrl;
```

### `serveXxx.abort()`

取消当前请求函数所有 pending 请求。

```ts
apis.serveGetUser.abort();
```
