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

const apiManage = ApiManage.create<typeof apiList>()({
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

## 请求函数名类型

请求函数名会从 `List` 自动推导，默认规则是 `apiXxx -> serveXxx`。`getService()`、`abort()`、`resolve()`、hooks、`validate()`、`limitResponse()` 使用同一组 service name 类型。

```ts
apiManage.abort("serveGetUser");
apiManage.resolve("serveGetUser");

// resolve(data) 会复用接口 params 类型
apis.serveGetUser.resolve({ id: 1 });
```

自定义 `matchStr / replaceStr` 时，需要传入字面量泛型：

```ts
const apiManage = new ApiManage<
    typeof apiList,
    {},
    unknown,
    "api",
    "request"
>({
    request,
    list: apiList,
    matchStr: "api",
    replaceStr: "request",
});

const apis = apiManage.getService();
apis.requestGetUser({ id: 1 });
```

## 扩展请求 options 类型

`api-manage` 默认内置通用 `headers` 字段。其他请求库字段或业务字段可以通过 `ExtraOptions` 泛型扩展；声明后会进入白名单模式：

```ts
type ApiRequestOptions = {
    responseType?: "json" | "blob" | "arraybuffer";
    timeout?: number;
};

const apiList = ApiManage.bindApi(Object.values(apiFiles), serverParams);

const apiManage = new ApiManage<typeof apiList, ApiRequestOptions>({
    list: apiList,
    request: (url, method, context, extraOptions) =>
        service({
            ...extraOptions,
            url,
            method,
            [method === "get" ? "params" : "data"]: context.params,
        }),
});

const apis = apiManage.getService();

await apis.serveGetUser(
    { id: 1 },
    {
        headers: { jsonContent: true },
        timeout: 10000,
        cancelParams: { includeConfigKeys: ["headers"] },
    },
);
```

需要补充旧字符串清单的返回和参数类型时，仍然在 `getService` 上声明 `ResultMap`、`ParamsMap`：

```ts
const apis = apiManage.getService<ResultMap, ParamsMap>();
```

`headers` 会自动合并到请求 options 中；业务想传新的请求配置字段时，只需要把新增字段显式加入 `ApiRequestOptions`。

项目也可以通过 declaration merging 全局扩展默认字段，适合 `noEncrypt`、`contentTypeJson` 这类业务约定：

```ts
declare module "api-manage" {
    interface ApiManageDefaultExtraOptions {
        contentTypeJson?: boolean;
        noEncrypt?: boolean;
        deepEncrypt?: boolean;
    }
}
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
const apiFiles = {
    userApi,
    fileApi,
};

const apiList = ApiManage.bindApi(Object.values(apiFiles), serverParams);

const apiManage = ApiManage.create<typeof apiList>()({
    list: apiList,
    request: (url, method, context, extraOptions) =>
        service({
            ...extraOptions,
            url,
            method,
            [method === "get" ? "params" : "data"]: context.params,
        }),
});

const apis = apiManage.getService();
```

## 常用导出类型

```ts
import type {
    ApiDefine,
    ApiFilesServiceMap,
    ApiList,
    ApiServiceMap,
    ApiRequestContextByList,
    DynamicRequestOptions,
    LimitResult,
    RequestContext,
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
-   `RequestContext`：`request` 第三个参数的基础上下文类型
-   `ApiRequestContextByList`：根据清单推导出来的请求上下文 union
-   `ServeFunction`：请求函数类型
-   `ServeFnOptions<ExtraOptions>`：请求函数第二个参数类型
-   `TemplateData`：路径模板数据类型
-   `DynamicRequestOptions`：`call` 接收的参数类型
-   `ResolvedRequest`：`resolve` 返回的解析结果类型
