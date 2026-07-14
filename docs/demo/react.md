# React 使用案例

React 项目中建议封装一个 `useService`，避免在组件里重复创建 `ApiManage` 实例。

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
import React from "react";
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

export const useService = () =>
    React.useMemo(() => apiManage.getService(), []);
```

```tsx
import React from "react";
import { useService } from "./service";

export default function Login() {
    const { serveGetToken } = useService();

    React.useEffect(() => {
        serveGetToken({ code: "login-code" }).then((token) => {
            console.log(token.token);
        });
    }, [serveGetToken]);

    return <div>Login</div>;
}
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
