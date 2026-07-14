# 运行时流程

本文说明请求在运行时怎样执行。

## 请求链路

```text
serveXxx(params, options)
  -> 计算 URL 和 params/data
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

## 参数分发

默认规则：

-   `get`：请求参数进入 `params`
-   其他 method：请求参数进入 `data`

```ts
await apis.serveGetUser({ id: 1 });
// request({ method: "get", url: "/user", params: { id: 1 } })

await apis.serveCreateUser({ name: "Tom" });
// request({ method: "post", url: "/user", data: { name: "Tom" } })
```

可以通过 `methodsForDataKeyNames` 修改：

```ts
methodsForDataKeyNames: {
    get: "params",
    post: "body",
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
{
    method: "get",
    url: "/user/1",
    params: { keyword: "tom" },
}
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
    data: { userId: 1 },
    tplData: { id: "abc" },
    serveName: "runtimeDetail",
    config: {
        headers: { noEncrypt: true },
    },
});
```

它会复用同一套 `request`、`validate`、`limitResponse`、hooks 和取消请求逻辑。

## 取消重复请求

当配置了 `CancelRequest` 时，默认会取消相同 URL 和参数的上一个请求，只保留最后一个。

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
