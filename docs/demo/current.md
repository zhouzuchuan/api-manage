# 当前能力 Demo

这个 Demo 不依赖真实后端，使用本地 `mockRequest` 演示 3.0.0 的主要能力：

-   `defineApi<Raw, Params, Limited>` 类型化清单
-   `apiXxx -> serveXxx`
-   `tplData` 替换路径参数
-   GET 参数进入 `params`，POST 参数进入 `data`
-   `validate`、`limitResponse`、`hooks` 统一处理
-   `isLimit` 切换处理后数据和原始响应
-   `resolve` 解析真实请求地址
-   `call` 请求运行时动态 URL
-   重复请求取消

## 运行

```bash
npm run demo
```

如果想在浏览器里切换接口、编辑 JSON 参数、查看返回结果，可以启动文档服务后打开[可视化 Playground](/demo/playground.md)。

```bash
npm run start:playground
```

## 推荐写法

```ts
import ApiManage, { defineApi } from "api-manage";

type DemoPayload = {
    method: string;
    url: string;
    params?: unknown;
    data?: unknown;
    headers?: unknown;
};

type DemoResponse<T> = {
    data: {
        code: number;
        ret: T;
    };
};

const apiList = {
    get: {
        apiGetUser: defineApi<
            DemoResponse<DemoPayload>,
            { keyword: string },
            DemoPayload
        >("/users/:id"),
    },
    post: {
        apiCreateUser: defineApi<
            DemoResponse<DemoPayload>,
            { name: string },
            DemoPayload
        >("/users"),
    },
} as const;

const apiManage = ApiManage.create<typeof apiList>()({
    list: apiList,
    request: service,
    validate: async (res) => res.data.code === 200,
    limitResponse: async (res) => res.data.ret,
});

const apis = apiManage.getService();

const user = await apis.serveGetUser(
    { keyword: "tom" },
    { tplData: { id: 1 } },
);
// user: DemoPayload

const rawUser = await apis.serveGetUser(
    { keyword: "tom" },
    { tplData: { id: 1 }, isLimit: false },
);
// rawUser: DemoResponse<DemoPayload>
```

## 动态 URL

运行时拿到的新接口地址，不需要临时塞进 `list`，直接用 `call`：

```ts
const data = await apiManage.call<DemoPayload>({
    url: "/runtime/:id/detail",
    method: "post",
    params: { userId: 1 },
    tplData: { id: "abc" },
    serveName: "runtimeDetail",
    extraOptions: {
        headers: {
            noEncrypt: true,
        },
    },
});
```

## 兼容旧写法

旧字符串清单仍然可以使用，只是不再作为 3.0.0 的主要推荐写法。

```ts
const apiList = {
    get: {
        apiGetUser: "/users/:id",
    },
} as const;

type ResultMap = {
    serveGetUser: DemoResponse<DemoPayload>;
};

type ParamsMap = {
    serveGetUser: { keyword: string };
};

const apis = apiManage.getService<ResultMap, ParamsMap>();
```

## 多 API 文件类型

```ts
const apiFiles = {
    userApi,
    teamApi,
    fileApi,
};

type ApiRequestOptions = {
    responseType?: "json" | "blob" | "arraybuffer";
    timeout?: number;
};

const apiList = ApiManage.bindApi(Object.values(apiFiles), serverParams);

export const apiManage = new ApiManage<
    typeof apiList,
    ApiRequestOptions
>({
    list: apiList,
    request: (url, method, context, extraOptions) =>
        service({
            ...extraOptions,
            url,
            method,
            [method === "get" ? "params" : "data"]: context.params,
        }),
});

export const useApis = () => apiManage.getService();
```
