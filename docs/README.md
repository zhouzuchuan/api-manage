# api-manage 3.0.0

`api-manage` 用一份 API 清单生成统一请求函数，帮助应用把接口地址、请求逻辑、返回处理和 TypeScript 类型集中管理。

3.0.0 推荐使用类型化 API 清单：

```ts
defineApi<RawResult, Params, LimitedResult>(url)
```

-   `RawResult`：接口原始完整响应类型
-   `Params`：请求参数类型
-   `LimitedResult`：经过 `limitResponse` 处理后的业务数据类型，默认是 `LimitResult<RawResult>`

## 安装

```bash
npm install api-manage
```

## 推荐用法

```ts
import ApiManage, { defineApi } from "api-manage";

type ApiResponse<T> = {
    code: number;
    message: string;
    data: T;
};

type UserInfo = {
    id: number;
    name: string;
};

type GetUserParams = {
    id: number;
};

const apiList = {
    get: {
        apiGetUser: defineApi<ApiResponse<UserInfo>, GetUserParams>("/user"),
    },
} as const;

const apiManage = ApiManage.create<typeof apiList>()({
    list: apiList,
    request: (url, method, context, extraOptions) =>
        axios({
            ...extraOptions,
            url,
            method,
            [method === "get" ? "params" : "data"]: context.params,
        }),
    validate: (res) => res.code === 0,
    limitResponse: (res) => res.data,
});

const apis = apiManage.getService();

const user = await apis.serveGetUser({ id: 1 });
// user: UserInfo

const raw = await apis.serveGetUser({ id: 1 }, { isLimit: false });
// raw: ApiResponse<UserInfo>
```

## 命名约定

默认会把清单里的 `apiXxx` 转成请求函数 `serveXxx`：

```ts
apiGetUser -> serveGetUser
apiFile_Upload -> serveFile_Upload
```

可以通过 `matchStr` 和 `replaceStr` 修改这个规则。

## 请求流程

一个请求会按下面的顺序执行：

```text
serveXxx(params, options)
  -> hooks.start
  -> request
  -> validate
  -> hooks.resolve
  -> limitResponse / raw response
  -> hooks.finally
```

失败时会触发 `hooks.reject`，然后继续触发 `hooks.finally`。

## API 清单格式

### 类型化清单

```ts
const apiList = {
    post: {
        apiCreateUser: defineApi<ApiResponse<UserInfo>, { name: string }>(
            "/user",
        ),
    },
} as const;
```

### 函数式清单

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

### 兼容旧字符串清单

```ts
const apiList = {
    get: {
        apiGetUser: "/user",
    },
} as const;
```

旧清单仍可通过 `getService<ResultMap, ParamsMap>()` 补充类型，详见[类型系统](/deep/types.md)。

请求函数第二个参数可通过 `ExtraOptions` 扩展。声明后会进入白名单模式，只允许内置字段和业务显式声明的字段；`headers` 是默认内置字段：

```ts
type ApiRequestOptions = {
    timeout?: number;
};

const apiManage = new ApiManage<typeof apiList, ApiRequestOptions>({
    list: apiList,
    request: (url, method, context, extraOptions) =>
        axios({
            ...extraOptions,
            url,
            method,
            [method === "get" ? "params" : "data"]: context.params,
        }),
});

const apis = apiManage.getService<ResultMap, ParamsMap>();
```

## 路径模板

路径中以 `:` 开头的片段会从 `tplData` 中取值：

```ts
const apiList = {
    get: {
        apiGetUser: defineApi<ApiResponse<UserInfo>, { keyword: string }>(
            "/user/:id",
        ),
    },
} as const;

await apis.serveGetUser(
    { keyword: "tom" },
    { tplData: { id: 1 } },
);
```

`tplData` 类型是 `TemplateData`：`string | number | Array<string | number> | Record<string, string | number>`。

## 动态请求

运行时才拿到的地址，不需要塞回 `list`：

```ts
const data = await apiManage.call<UserInfo>({
    url: "/runtime/:id/detail",
    method: "post",
    params: { userId: 1 },
    tplData: { id: "abc" },
    serveName: "runtimeDetail",
});
```

## Demo

```bash
npm run demo
npm run start:playground
```

可视化示例见[可视化 Playground](/demo/playground.md)。

## 深入阅读

-   [API 参考](/api.md)
-   [类型系统](/deep/types.md)
-   [运行时流程](/deep/runtime.md)
-   [版本更新](/deep/version.md)
