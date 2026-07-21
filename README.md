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

## 请求函数名类型推导

请求函数名会从 API 清单自动推导，默认规则是 `apiXxx -> serveXxx`。`abort()`、`resolve()`、`validate()`、`limitResponse()` 和 hooks 里的 `serveName` 也会获得同一组类型提示。

```ts
apiManage.abort("serveGetUser");
apiManage.resolve("serveGetUser");
apis.serveGetUser.resolve({ id: 1 });
```

如果使用自定义命名规则，需要把字面量类型传给 `ApiManage`：

```ts
const apiManage = new ApiManage<
    typeof apiList,
    {},
    unknown,
    "api",
    "request"
>({
    list: apiList,
    request,
    matchStr: "api",
    replaceStr: "request",
});

const apis = apiManage.getService();
await apis.requestGetUser({ id: 1 });
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

const apiManage = ApiManage.create<typeof apiList>()({
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

## 扩展请求 options 类型

`serveXxx(params, options)` 的第二个参数采用白名单模式，只允许内置字段和业务通过 `ExtraOptions` 显式声明的字段。`headers` 是默认内置字段，`includeConfigKeys` 也只能填写已声明的 key。

```ts
type ApiRequestOptions = {
    responseType?: "json" | "blob" | "arraybuffer";
    timeout?: number;
};

const apiList = ApiManage.bindApi(Object.values(apiFiles), serverParams);

const apiManage = ApiManage.create<typeof apiList, ApiRequestOptions>()({
    list: apiList,
    request: (url, method, context, extraOptions) =>
        axios({
            ...extraOptions,
            url,
            method,
            [method === "get" ? "params" : "data"]: context.params,
        }),
});

export const useApis = () => apiManage.getService();

await useApis().serveGetUser(
    { id: 1 },
    {
        headers: { jsonContent: true },
        timeout: 10000,
        cancelParams: { includeConfigKeys: ["headers"] },
    },
);
```

项目可以通过 declaration merging 扩展默认字段，适合 `noEncrypt`、`contentTypeJson` 这类业务约定：

```ts
declare module "api-manage" {
    interface ApiManageDefaultExtraOptions {
        contentTypeJson?: boolean;
        noEncrypt?: boolean;
        deepEncrypt?: boolean;
    }
}
```

## 请求 adapter 与取消请求

`api-manage` 只传递通用请求信息，不绑定 axios、fetch 或其他请求库。`request` 会收到四个参数：

```ts
request: (url, method, context, extraOptions) => {
    // context.serveName 可以收窄 context.params 类型
    return axios({
        ...extraOptions,
        url,
        method,
        [method === "get" ? "params" : "data"]: context.params,
    });
}
```

重复请求取消通过通用 `cancel` adapter 接入。`cancel` 返回的 `extraOptions` 会合并到 `request` 第四个参数里，所以 `request` 里要把 `extraOptions` 传给真实请求库。

axios `CancelToken` 可以直接使用内置 helper：

```ts
import ApiManage, { createAxiosCancel } from "api-manage";

const apiManage = ApiManage.create<typeof apiList>()({
    list: apiList,
    request: (url, method, context, extraOptions) =>
        axios({
            ...extraOptions,
            url,
            method,
            [method === "get" ? "params" : "data"]: context.params,
        }),
    cancel: createAxiosCancel(axios),
});
```

fetch、现代 axios、ky、ofetch 等支持 `AbortController.signal` 的请求库，可以使用：

```ts
import ApiManage, { createAbortCancel } from "api-manage";

const apiManage = ApiManage.create<typeof apiList>()({
    list: apiList,
    request: (url, method, context, extraOptions) =>
        fetch(url, {
            ...extraOptions,
            method,
            body: method === "get" ? undefined : JSON.stringify(context.params),
        }),
    cancel: createAbortCancel(),
});
```

其他请求库可以自己实现同样的最小协议：`cancel` 给 `api-manage` 下次重复请求时调用，`extraOptions` 传给真实请求库。

`ApiManage.create(options)` 和 `new ApiManage(options)` 旧用法仍然兼容；需要从 `cancel().extraOptions` 自动推导 `request.extraOptions` 时，推荐使用 `ApiManage.create<List, ExtraOptions>()({...})`。

```ts
cancel: () => {
    const task = createRequestTaskSomehow();

    return {
        cancel: (message) => task.abort(message),
        extraOptions: { task },
    };
};
```

如果把 cancel adapter 抽成复用函数，可以标注注入字段类型：

```ts
import type { CancelAdapterInjectedResult } from "api-manage";

const createTaskCancel = (): CancelAdapterInjectedResult<{ task: Task }> => {
    const task = createRequestTaskSomehow();

    return {
        cancel: (message) => task.abort(message),
        extraOptions: { task },
    };
};
```

类型声明建议业务项目使用 TypeScript 4.1 及以上版本；库类型只使用 TS 4.1-4.9 的稳定能力，不依赖 TS5-only 语法。

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

# 发布 beta 预发布版本，会自动把版本升级为 x.y.z-beta.n，并使用 beta tag
npm run release -- --beta

# 发布其他预发布版本，例如 alpha / rc
npm run release -- --pre alpha
npm run release -- --pre rc

# 使用指定 tag 或 OTP
npm run release -- --tag beta
npm run release -- --otp 123456

# 临时指定 npm registry，适合本机默认 registry 是镜像源的情况
npm run release -- --beta --registry https://registry.npmjs.org/

# 跳过测试，仅执行 build / pack / publish
npm run release -- --skip-tests
```

`release` 脚本会依次执行 `type-check`、`test`、`build`、`npm pack --dry-run`。如果当前未登录 npm，会自动进入 `npm login --auth-type=legacy`，按提示输入账号、密码和 OTP 即可。发布到 npm 官方源时，建议显式加上 `--registry https://registry.npmjs.org/`，避免本机默认镜像源不支持登录或发布。

参数说明：

| 参数 | 说明 |
| --- | --- |
| `--dry-run` | 只做校验、构建和 `npm pack --dry-run`，不执行 `npm publish` |
| `--skip-tests` | 跳过 `type-check` 和 `test`，适合已手动验证过的发布 |
| `--tag <tag>` | 指定 npm dist-tag，默认 `latest` |
| `--beta` | 等价于 `--pre beta`，会执行 `npm version prerelease --preid beta --no-git-tag-version`，并默认使用 `beta` tag |
| `--pre <id>` | 发布预发布版本，例如 `--pre alpha`、`--pre rc` |
| `--preid <id>` | `--pre` 的 npm 术语别名，保留给熟悉 npm 的用法 |
| `--prerelease <id>` | `--pre` 的别名 |
| `--otp <code>` | npm 双因素验证码 |
| `--registry <url>` | 临时指定本次发布使用的 npm registry，例如 `https://registry.npmjs.org/` |

注意：`--beta` / `--pre <id>` 会修改 `package.json` 里的 `version`，但不会自动提交，也不会创建 git tag。`--dry-run` 也会改版本号，因为它验证的是即将发布的真实包版本。

## License

[MIT](https://tldrlegal.com/license/mit-license)
