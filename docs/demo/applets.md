# 小程序使用案例

这里以 Taro / 微信小程序为例。小程序中不能直接使用 axios，可以把请求库封装成 `api-manage` 需要的 `request(options)` 形式。

## request 封装

```ts
// request.ts
import Fly from "flyio/dist/npm/wx";

const fly = new Fly();

export const request = ({ method = "get", url, data, params, ...config }) => {
    const body = method === "get" ? params : data;
    return fly[method](url, body, config);
};
```

## 推荐写法

```ts
// api.ts
import { defineApi } from "api-manage";

type ApiResponse<T> = {
    code: number;
    data: T;
};

type TokenInfo = {
    token: string;
};

export default ({ server }: { server: string }) =>
    ({
        post: {
            apiGetToken: defineApi<ApiResponse<TokenInfo>, { code: string }>(
                `${server}/getToken`,
            ),
        },
    }) as const;
```

```ts
// service.ts
import ApiManage from "api-manage";
import apiList from "./api";
import { request } from "./request";

const list = apiList({ server: "/api" });

const apiManage = new ApiManage<typeof list>({
    request,
    list,
    validate: (res) => res.code === 0,
    limitResponse: (res) => res.data,
});

export const service = apiManage.getService();
```

```ts
const token = await service.serveGetToken({ code: "login-code" });
```

## 兼容旧字符串清单

```ts
export default ({ server }: { server: string }) => ({
    post: {
        apiGetToken: `${server}/getToken`,
    },
});
```

多个旧字符串清单需要运行时合并时，可以继续使用 `ApiManage.bindApi`。
