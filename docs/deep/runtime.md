# 运行时流程

本文说明请求在运行时怎样执行。

## 请求链路

```text
serveXxx(params, options)
  -> 计算 URL 和 context
  -> 计算取消 token
  -> hooks.start
  -> request
  -> validate
  -> hooks.resolve
  -> limitResponse 或原始响应
  -> hooks.finally
```

失败链路：

```text
request/validate 失败
  -> hooks.reject
  -> hooks.finally
  -> throw error
```

## 请求 adapter

`api-manage` 不再内置 axios 风格的 `params/data` 分发。请求函数会收到：

```ts
request(url, method, context, extraOptions)
```

业务 adapter 自己决定如何把 `context.params` 映射给请求库：

```ts
request: (url, method, context, extraOptions) => {
    return service({
        ...extraOptions,
        url,
        method,
        [method === "get" ? "params" : "data"]: context.params,
    });
}
```

## 路径模板

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

`request` 最终收到：

```ts
request(
    "/user/1",
    "get",
    {
        serveName: "serveGetUser",
        params: { keyword: "tom" },
    },
    extraOptions,
);
```

## `validate` 与 `limitResponse`

`validate` 在 `limitResponse` 之前执行。

```ts
const apiManage = new ApiManage({
    list,
    request,
    validate: (res) => res.code === 0,
    limitResponse: (res) => res.data,
});
```

默认请求返回 `limitResponse` 后的数据：

```ts
const data = await apis.serveGetUser({ id: 1 });
```

关闭 limit 返回原始响应：

```ts
const raw = await apis.serveGetUser({ id: 1 }, { isLimit: false });
```

## 动态请求

`call` 适合运行时才拿到 URL 的场景：

```ts
const data = await apiManage.call<UserInfo>({
    url: "/runtime/:id/detail",
    method: "post",
    params: { userId: 1 },
    tplData: { id: "abc" },
    serveName: "runtimeDetail",
    extraOptions: {
        headers: { noEncrypt: true },
    },
});
```

它会复用同一套 `request`、`validate`、`limitResponse`、hooks 和取消请求逻辑。

## 取消重复请求

当配置了 `cancel` 时，默认会取消相同 URL、method 和参数的上一个请求，只保留最后一个。

```ts
cancel: () => {
    const controller = new AbortController();

    return {
        cancel: () => controller.abort(),
        extraOptions: { signal: controller.signal },
    };
}
```

```ts
const first = apis.serveGetUser({ id: 1 });
const second = apis.serveGetUser({ id: 1 });
```

也可以手动取消：

```ts
apis.serveGetUser.abort();
apiManage.abort("serveGetUser");
```

`cancelParams`：

```ts
apis.serveGetUser(
    { id: 1 },
    {
        cancelParams: {
            open: true,
            isCalcFullPath: false,
        },
    },
);
```

-   `open`：是否开启当前请求函数的取消能力
-   `isCalcFullPath`：是否把参数纳入取消 token

## Hooks 日志示例

```ts
hooks: {
    start: (serveName) => console.log("start", serveName),
    resolve: (serveName) => console.log("resolve", serveName),
    reject: (serveName, timestamp, error) => console.log("reject", error),
    finally: (serveName) => console.log("finally", serveName),
}
```

可视化演示见[可视化 Playground](/demo/playground.md)。
