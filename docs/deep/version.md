# 更新日志

## 3.0.0

### 新增

-   新增 `defineApi<Raw, Params, Limited>()`，支持在 API 清单中绑定原始响应、请求参数和处理后返回类型。
-   新增 `LimitResult<T>`，默认从原始响应中取一层 `data` 作为处理后类型。
-   请求函数根据 `isLimit` 自动切换返回类型。
-   支持对象形式 API 清单：`apiXxx: defineApi(...)`。
-   新增 `TemplateData` 类型，收窄 `tplData` 为路径模板可替换值。
-   新增可视化 Playground。
-   新增 `call` 动态请求文档和 CLI demo 启动脚本。

### 兼容

-   旧字符串清单继续可用。
-   旧清单可以通过 `getService<ResultMap, ParamsMap>()` 补充类型。
-   手动调用泛型 `serveXxx<CustomResult>()` 继续可用。

### 需要注意

-   `defineApi` 第一个泛型现在表示接口原始完整响应类型，不是业务数据类型。
-   如果 `limitResponse` 不是 `res => res.data`，需要使用 `defineApi` 第三个泛型指定处理后类型。
-   `tplData` 类型收窄为 `string | number | Array<string | number> | Record<string, string | number>`。

## 2.3.0

-   函数参数添加 `isLimit` 配置。

## 2.2.0

-   `limitResponse` 新增第二个参数 `serveName`。
