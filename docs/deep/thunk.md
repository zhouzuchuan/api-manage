# 清单拆分

大型应用通常会按业务模块拆分 API 清单，例如 `publicApi`、`menuApi`、`userApi`。

## 推荐拆分方式

```ts
// api/public.ts
import { defineApi } from "api-manage";

type ApiResponse<T> = {
    code: number;
    data: T;
};

export default ({ server }: { server: string }) =>
    ({
        get: {
            apiPublic_GetVerifyToken: defineApi<
                ApiResponse<{ token: string }>,
                void
            >(`${server}/get_verify_token`),
        },
    }) as const;
```

```ts
// api/user.ts
import { defineApi } from "api-manage";

export default ({ server }: { server: string }) =>
    ({
        get: {
            apiUser_QueryList: defineApi<
                ApiResponse<{ list: Array<{ id: number; name: string }> }>,
                { page: number }
            >(`${server}/user/list`),
        },
        post: {
            apiUser_AddUser: defineApi<
                ApiResponse<{ id: number }>,
                { name: string }
            >(`${server}/user/add`),
        },
    }) as const;
```

使用时先执行函数式清单，再合并对象。这样可以尽量保留 TypeScript 字面量信息：

```ts
import ApiManage from "api-manage";
import publicApi from "./api/public";
import userApi from "./api/user";
import request from "./request";

const publicList = publicApi({ server: "/api" });
const userList = userApi({ server: "/api" });

const apiList = {
    get: {
        ...publicList.get,
        ...userList.get,
    },
    post: {
        ...userList.post,
    },
} as const;

const apiManage = new ApiManage<typeof apiList>({
    list: apiList,
    request,
    validate: (res) => res.code === 0,
    limitResponse: (res) => res.data,
});

const service = apiManage.getService();

service.servePublic_GetVerifyToken();
service.serveUser_QueryList({ page: 1 });
```

## 多文件类型

多文件清单可以先通过 `bindApi` 合并，再让 `getService()` 自动推导 service 类型：

```ts
const apiFiles = {
    publicList,
    userList,
};

const apiList = ApiManage.bindApi(Object.values(apiFiles), serverParams);

const apiManage = new ApiManage<typeof apiList>({
    request,
    list: apiList,
});

const service = apiManage.getService();
```

## 兼容 `bindApi`

`ApiManage.bindApi` 仍然可以合并对象清单或函数式清单：

```ts
const apiList = ApiManage.bindApi([publicApi, userApi], {
    server: "/api",
});
```

但它的返回类型是宽泛的 `ApiList`，会丢失部分 `defineApi` 精确推导。3.0.0 中如果你希望完整保留类型，优先使用上面的对象展开方式。
