# 更新日志

## 3.0.0

### 新增

-   新增 `defineApi<Raw, Params, Limited>()`，支持在 API 清单中绑定原始响应、请求参数和处理后返回类型。
-   新增 `LimitResult<T>`，默认从原始响应中取一层 `data` 作为处理后类型。
-   请求函数根据 `isLimit` 自动切换返回类型。
-   支持对象形式 API 清单：`apiXxx: defineApi(...)`。
-   新增 `TemplateData` 类型，收窄 `tplData` 为路径模板可替换值。
-   `ServeFnOptions`、`ServeFunction`、`ApiFilesServiceMap` 支持 `ExtraOptions` 泛型，用于业务侧扩展请求函数第二参。
-   `ApiManage<List, ExtraOptions, Result>` 支持在实例上声明请求函数第二参扩展类型，`getService()` 可自动继承该类型。
-   `bindApi` 增强类型返回，多个 API 文件合并后仍可推导 service 类型。
-   `ApiManage<List, ExtraOptions, Result, MatchStr, ReplaceStr>` 支持把自定义命名规则带入 `getService()` 类型推导。
-   `abort()`、`resolve()`、hooks、`validate()`、`limitResponse()` 的 `serveName` 支持从 API 清单推导。
-   `serveXxx.resolve(data)` 的 `data` 支持复用接口参数类型。
-   `cancelParams.includeConfigKeys` 支持按需把 `headers` 等请求配置加入取消 token，并跟随 `ExtraOptions` key 做类型约束。
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
-   请求函数第二参采用白名单模式；要传 `headers`、`timeout` 等业务配置，需要显式声明 `ExtraOptions`。
-   类型推导建议业务项目使用 TypeScript 4.1 及以上版本；声明文件不使用 TS5-only 语法。

## 2.3.0

-   函数参数添加 `isLimit` 配置。

## 2.2.0

-   `limitResponse` 新增第二个参数 `serveName`。
