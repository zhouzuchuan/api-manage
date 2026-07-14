# Vue 使用案例

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
import request from "./request";

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
// 组件中使用
import { service } from "./service";

export default {
    async created() {
        const token = await service.serveGetToken({ code: "login-code" });
        console.log(token.token);
    },
};
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
