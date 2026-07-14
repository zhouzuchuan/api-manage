# 类型系统

3.0.0 的核心变化是把 API 定义和类型绑定在一起。

## `defineApi`

```ts
defineApi<RawResult, Params, LimitedResult = LimitResult<RawResult>>(url)
```

-   `RawResult`：接口原始完整响应类型
-   `Params`：请求参数类型
-   `LimitedResult`：经过 `limitResponse` 处理后的返回类型

```ts
type ApiResponse<T> = {
    code: number;
    message: string;
    data: T;
};

type UserInfo = {
    id: number;
    name: string;
};

const apiList = {
    get: {
        apiGetUser: defineApi<ApiResponse<UserInfo>, { id: number }>("/user"),
    },
} as const;
```

## `LimitResult`

默认处理后类型会取一层 `data`：

```ts
type LimitResult<T> = T extends { data: infer D } ? D : T;
```

所以下面请求默认返回 `UserInfo`：

```ts
const user = await apis.serveGetUser({ id: 1 });
```

关闭 limit 时返回完整响应：

```ts
const raw = await apis.serveGetUser({ id: 1 }, { isLimit: false });
// raw: ApiResponse<UserInfo>
```

## 自定义处理后类型

如果你的 `limitResponse` 不是 `res => res.data`，显式传第三个泛型。

```ts
type RetResponse<T> = {
    code: number;
    ret: T;
};

const apiList = {
    get: {
        apiGetUser: defineApi<
            RetResponse<UserInfo>,
            { id: number },
            UserInfo
        >("/user"),
    },
} as const;

const apiManage = new ApiManage<typeof apiList>({
    list: apiList,
    request,
    limitResponse: (res) => res.ret,
});
```

## `isLimit` 重载

请求函数根据 `isLimit` 自动切换返回类型：

```ts
apis.serveGetUser({ id: 1 });
// Promise<UserInfo>

apis.serveGetUser({ id: 1 }, { isLimit: true });
// Promise<UserInfo>

apis.serveGetUser({ id: 1 }, { isLimit: false });
// Promise<ApiResponse<UserInfo>>
```

如果 options 被提前声明成宽泛的 `ServeFnOptions`，TypeScript 可能无法判断 `isLimit` 字面量分支。此时可以保持字面量写法，或使用显式泛型。

```ts
apis.serveGetUser<ApiResponse<UserInfo>>({ id: 1 }, options);
```

## 旧字符串清单类型

旧清单仍支持：

```ts
const apiList = {
    get: {
        apiGetUser: "/user",
    },
} as const;
```

用 `getService<ResultMap, ParamsMap>()` 绑定类型：

```ts
type ResultMap = {
    serveGetUser: ApiResponse<UserInfo>;
};

type ParamsMap = {
    serveGetUser: { id: number };
};

const apis = apiManage.getService<ResultMap, ParamsMap>();
```

注意 key 使用转换后的请求函数名，例如 `serveGetUser`。

## 多文件类型

```ts
import type { ApiFilesServiceMap } from "api-manage";

const apiFiles = {
    userApi,
    fileApi,
};

type Services = ApiFilesServiceMap<typeof apiFiles>;

const apis = apiManage.getService() as Services;
```

## 常用导出类型

```ts
import type {
    ApiDefine,
    ApiFilesServiceMap,
    ApiList,
    ApiServiceMap,
    DynamicRequestOptions,
    LimitResult,
    RequestOptions,
    ResolvedRequest,
    ServeFnOptions,
    ServeFunction,
    TemplateData,
} from "api-manage";
```

-   `ApiDefine`：`defineApi` 返回的对象类型
-   `ApiList`：API 清单类型
-   `ApiServiceMap`：单个清单生成的 service map 类型
-   `ApiFilesServiceMap`：多个清单合并后的 service map 类型
-   `ServeFunction`：请求函数类型
-   `ServeFnOptions`：请求函数第二个参数类型
-   `TemplateData`：路径模板数据类型
-   `RequestOptions`：`request` 接收的参数类型
-   `DynamicRequestOptions`：`call` 接收的参数类型
-   `ResolvedRequest`：`resolve` 返回的解析结果类型
