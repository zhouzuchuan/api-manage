# api-manage

[![download](https://img.shields.io/npm/dm/api-manage.svg)](https://www.npmjs.com/search?q=api-manage)
[![npm](https://img.shields.io/npm/v/api-manage.svg)](https://www.npmjs.com/search?q=api-manage)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/zhouzuchuan/data-mock/master/LICENSE)

`api-manage` 是一个按 API 清单生成请求函数的轻量工具。3.0.0 推荐使用类型化清单，把接口原始响应、请求参数和业务返回类型绑定在 API 定义上，让调用处自动获得 `serveXxx`、参数类型和返回类型。

## 安装

```bash
npm install api-manage
# or
yarn add api-manage
```

历史文档：

-   [2.x 文档](./README_v2.md)
-   [1.x 文档](./README_v1.md)

## 3.0.0 核心能力

-   `defineApi<Raw, Params, Limited>()` 绑定接口原始响应、请求参数和处理后返回类型
-   `apiXxx` 自动转换为 `serveXxx`
-   默认返回 `limitResponse` 后的数据，`{ isLimit: false }` 返回原始响应
-   支持旧字符串清单、函数式清单和多文件清单合并
-   支持动态请求 `call`
-   支持重复请求取消、hooks、validate、customize
-   提供 CLI demo 和浏览器 Playground

## 快速开始

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

const apiManage = new ApiManage<typeof apiList>({
    list: apiList,
    request: (options) => axios(options),
    validate: (res) => res.code === 0,
    limitResponse: (res) => res.data,
});

const apis = apiManage.getService();

const user = await apis.serveGetUser({ id: 1 });
// user: UserInfo

const raw = await apis.serveGetUser({ id: 1 }, { isLimit: false });
// raw: ApiResponse<UserInfo>
```

## 自定义 `limitResponse` 类型

默认类型解包规则是 `LimitResult<T>`，即从原始响应里取一层 `data`。如果你的运行时 `limitResponse` 不是 `res => res.data`，用 `defineApi` 第三个泛型指定处理后的类型。

```ts
type RetResponse<T> = {
    code: number;
    ret: T;
};

const apiList = {
    get: {
        apiGetUser: defineApi<RetResponse<UserInfo>, GetUserParams, UserInfo>(
            "/user",
        ),
    },
} as const;

const apiManage = new ApiManage<typeof apiList>({
    list: apiList,
    request,
    validate: (res) => res.code === 0,
    limitResponse: (res) => res.ret,
});
```

## 路径模板与 `tplData`

路径里的 `:id` 会从 `tplData` 中取值。`tplData` 类型为 `TemplateData`：

```ts
type TemplateData =
    | string
    | number
    | Array<string | number>
    | Record<string, string | number>;

await apis.serveGetUser(
    { keyword: "tom" },
    { tplData: { id: 1 } },
);

apis.serveGetUser.resolve({ keyword: "tom" }, { id: 1 }).requestUrl;
```

## 动态请求

运行时才拿到的地址可以直接使用 `call`，仍会复用统一的 `request`、`validate`、`limitResponse`、hooks 和取消逻辑。

```ts
const data = await apiManage.call<UserInfo>({
    url: "/runtime/:id/detail",
    method: "post",
    data: { userId: 1 },
    tplData: { id: "abc" },
    serveName: "runtimeDetail",
    config: {
        headers: {
            noEncrypt: true,
        },
    },
});
```

## 兼容旧清单

旧字符串清单仍然可用。需要固定返回和参数类型时，可以通过 `getService<ResultMap, ParamsMap>()` 绑定。

```ts
const apiList = {
    get: {
        apiGetUser: "/user",
    },
} as const;

type ResultMap = {
    serveGetUser: ApiResponse<UserInfo>;
};

type ParamsMap = {
    serveGetUser: GetUserParams;
};

const apis = apiManage.getService<ResultMap, ParamsMap>();

const user = await apis.serveGetUser({ id: 1 });
const raw = await apis.serveGetUser({ id: 1 }, { isLimit: false });
```

## Demo

```bash
# 启动文档站
npm start

# 启动可视化 Playground
npm run start:playground

# 运行命令行 demo
npm run demo
```

启动文档后访问：

-   `http://127.0.0.1:3000/#/`
-   `http://127.0.0.1:3000/#/demo/playground`
-   `http://127.0.0.1:3000/demo/playground.html`

## Release

```bash
# 发布前完整校验、打包预检并发布到 npm
npm run release

# 只检查发布流程，不真正发布
npm run release -- --dry-run

# 使用指定 tag 或 OTP
npm run release -- --tag beta
npm run release -- --otp 123456
```

`release` 脚本会依次执行 `type-check`、`test`、`build`、`npm pack --dry-run`。如果当前未登录 npm，会自动进入 `npm login --auth-type=legacy`，按提示输入账号、密码和 OTP 即可。

## License

[MIT](https://tldrlegal.com/license/mit-license)
