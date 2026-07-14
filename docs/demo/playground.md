# 可视化 Playground

这个页面使用本地 mock request 演示 `api-manage` 的核心流程：接口选择、路径模板解析、请求参数分发、`limitResponse`、`isLimit` 返回切换、动态 URL 和重复请求取消。

页面中的 type note 对应 3.0.0 推荐写法：

```ts
defineApi<RawResult, Params, LimitedResult>(url)
```

-   `isLimit` 开启：返回 `LimitedResult`
-   `isLimit` 关闭：返回 `RawResult`

```bash
npm run start:playground
```

启动后可以访问 `http://127.0.0.1:3000/#/demo/playground`，也可以直接打开 `http://127.0.0.1:3000/demo/playground.html`。

<iframe
    src="./demo/playground.html"
    title="api-manage Playground"
    style="width: 100%; height: 860px; border: 1px solid #d8e0ea; border-radius: 6px; background: #f6f8fb;"
></iframe>
