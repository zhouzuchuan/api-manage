export type LimitResult<T> = T extends { data: infer D } ? D : T

export type ApiDefine<
    RawResult = unknown,
    Params = any,
    LimitedResult = LimitResult<RawResult>,
> = {
    url: string
    __result?: RawResult
    __params?: Params
    __limitedResult?: LimitedResult
}

export type ApiItem = string | ApiDefine<any, any, any>
export type ApiList = Record<string, Record<string, ApiItem>>
export type TemplateValue = string | number
export type TemplateData =
    | TemplateValue
    | TemplateValue[]
    | Record<string, TemplateValue>

type MaybePromise<T> = T | PromiseLike<T>
type AnyFunction = (...args: any[]) => any
type UnionKeys<T> = T extends T ? keyof T : never
type UnionToIntersection<T> = (
    T extends any ? (value: T) => void : never
) extends (value: infer R) => void
    ? R
    : never
type ApiItemByName<List extends ApiList, Name extends PropertyKey> =
    List[keyof List] extends infer MethodItems
        ? MethodItems extends Record<PropertyKey, any>
            ? Name extends keyof MethodItems
                ? MethodItems[Name]
                : never
            : never
        : never
type MappedValue<Map, Name, Fallback> = Name extends keyof Map
    ? Map[Name]
    : Fallback
type ApiItemRawResult<Item, ServeName, Result, ResultMap> = MappedValue<
    ResultMap,
    ServeName,
    Item extends ApiDefine<infer R, any, any> ? R : Result
>
type ApiItemLimitedResult<Item, RawResult> = Item extends ApiDefine<
    any,
    any,
    infer LimitedResult
>
    ? LimitedResult
    : LimitResult<RawResult>
type ApiItemParams<Item, ServeName, Params, ParamsMap> = MappedValue<
    ParamsMap,
    ServeName,
    Item extends ApiDefine<any, infer P, any> ? P : Params
>
type ServeRawResult<
    List extends ApiList,
    Name extends PropertyKey,
    ServeName,
    Result,
    ResultMap,
> = ApiItemRawResult<ApiItemByName<List, Name>, ServeName, Result, ResultMap>
type ServeLimitedResult<
    List extends ApiList,
    Name extends PropertyKey,
    ServeName,
    Result,
    ResultMap,
> = ApiItemLimitedResult<
    ApiItemByName<List, Name>,
    ServeRawResult<List, Name, ServeName, Result, ResultMap>
>
type ServeParams<
    List extends ApiList,
    Name extends PropertyKey,
    ServeName,
    Params,
    ParamsMap,
> = MappedValue<
    ParamsMap,
    ServeName,
    ApiItemByName<List, Name> extends ApiDefine<any, infer P, any>
        ? P
        : Params
>

export type ApiToServeName<
    Name,
    MatchStr extends string = 'api',
    ReplaceStr extends string = 'serve',
> = Name extends string
    ? Name extends `${MatchStr}${infer Rest}`
        ? `${ReplaceStr}${Rest}`
        : never
    : never

export type ServeFnOptions = {
    /** 模板数据 */
    tplData?: TemplateData
    /** 取消函数请求配置 */
    cancelParams?: {
        /** 是否是计算全部路径 */
        isCalcFullPath?: boolean
        /** 当前函数是否开启取消重复请求功能 */
        open?: boolean
    }
    /** 当前函数是否开启数据截取功能 */
    isLimit?: boolean
} & Record<string, any>

export type ResolvedRequest = {
    url?: string
    name?: string
    method?: string
    hostname?: string
    pathname?: string
    hash?: string
    port?: string
    protocol?: string
    query?: string
    requestUrl: string
}

export type ServeFunction<
    RawResult = unknown,
    Params = any,
    LimitedResult = LimitResult<RawResult>,
> = {
    (
        data?: Params,
        options?: ServeFnOptions & { isLimit?: true },
    ): Promise<LimitedResult>
    (
        data: Params | undefined,
        options: ServeFnOptions & { isLimit: false },
    ): Promise<RawResult>
    <R = LimitedResult>(data?: Params, options?: ServeFnOptions): Promise<R>
    resolve: (
        data?: Record<string, any>,
        tplData?: ServeFnOptions['tplData'],
    ) => ResolvedRequest
    abort: () => void
}

export type ApiServiceMap<
    List extends ApiList,
    Result = unknown,
    Params = any,
    MatchStr extends string = 'api',
    ReplaceStr extends string = 'serve',
    ResultMap extends Record<string, any> = {},
    ParamsMap extends Record<string, any> = {},
> = {
    [Name in UnionKeys<List[keyof List]> as ApiToServeName<
        Name,
        MatchStr,
        ReplaceStr
    >]: ServeFunction<
        ServeRawResult<
            List,
            Name,
            ApiToServeName<Name, MatchStr, ReplaceStr>,
            Result,
            ResultMap
        >,
        ServeParams<
            List,
            Name,
            ApiToServeName<Name, MatchStr, ReplaceStr>,
            Params,
            ParamsMap
        >,
        ServeLimitedResult<
            List,
            Name,
            ApiToServeName<Name, MatchStr, ReplaceStr>,
            Result,
            ResultMap
        >
    >
}

type ApiFileToList<T> = T extends AnyFunction ? ReturnType<T> : T
type ApiFileServiceMap<T, Result, ResultMap, ParamsMap> =
    T extends ApiList | AnyFunction
        ? ApiServiceMap<
              Extract<ApiFileToList<T>, ApiList>,
              Result,
              any,
              'api',
              'serve',
              Extract<ResultMap, Record<string, any>>,
              Extract<ParamsMap, Record<string, any>>
          >
    : never

export type ApiFilesServiceMap<
    Files extends Record<string, ApiList | AnyFunction>,
    Result = unknown,
    ResultMap extends Record<string, any> = {},
    ParamsMap extends Record<string, any> = {},
> = UnionToIntersection<
    ApiFileServiceMap<Files[keyof Files], Result, ResultMap, ParamsMap>
>

export type RequestOptions = {
    /** 开发者服务器接口地址 */
    url: string
    /** HTTP 请求方法 */
    method?: string
    /** 请求的参数 */
    data?: any
} & Record<string, any>

export type DynamicRequestOptions = {
    url: string
    method?: string
    data?: any
    tplData?: TemplateData
    serveName?: string
    isLimit?: boolean
    cancelParams?: ServeFnOptions['cancelParams']
    config?: Record<string, any>
}

type Hooks = {
    /** 请求前 */
    start?: (serveName?: string, timestamp?: string) => MaybePromise<void>
    /** 请求成功 触发 */
    resolve?: (serveName?: string, timestamp?: string) => MaybePromise<void>
    /** 请求失败 触发 */
    reject?: (
        serveName?: string,
        timestamp?: string,
        error?: any,
    ) => MaybePromise<void>
    /** 请求成功和失败 都触发 */
    finally?: (serveName?: string, timestamp?: string) => MaybePromise<void>
}

export interface ApiManageOptions<List extends ApiList = ApiList>
    extends Partial<{
        matchStr: string
        replaceStr: string
    }> {
    /** api清单 */
    list: List
    /** 请求函数 */
    request: (options: RequestOptions) => any
    /** 处理 response 的数据格式 */
    limitResponse?: (res: any, serveName?: string) => any
    /** 验证请求结果是否通过 */
    validate?: (response?: any, serveName?: string) => MaybePromise<boolean>
    /** 自定义请求 函数处理 */
    customize?: Record<
        string,
        (path?: string, serveName?: string) => ServeFunction
    >
    /** 取消请求构造函数 */
    CancelRequest?: new (
        fn: (cancelFn: (message?: any) => void) => void,
    ) => any
    /** 钩子函数 */
    hooks?: Hooks
    /** 默认支持的请求方法 */
    defaultMethodNames?: string[]
    /** 不同方法 对应传递参数的 key 集合 默认的传参 key 为 data */
    methodsForDataKeyNames?: Record<string, string>
}

type FullApiManageOptions<List extends ApiList> = Required<
    Omit<
        ApiManageOptions<List>,
        'CancelRequest' | 'hooks' | 'customize' | 'limitResponse' | 'validate'
    >
> & {
    CancelRequest?: ApiManageOptions<List>['CancelRequest']
    hooks: Hooks
    customize: NonNullable<ApiManageOptions<List>['customize']>
    limitResponse: NonNullable<ApiManageOptions<List>['limitResponse']>
    validate: NonNullable<ApiManageOptions<List>['validate']>
}

type ExecuteRequestParams = {
    method: string
    path: string
    serveName: string
    params?: any
    tplData?: ServeFnOptions['tplData']
    cancelParams?: ServeFnOptions['cancelParams']
    isLimit?: boolean
    config?: Record<string, any>
}

const getType = (obj: any) =>
    Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
const isFunction = (o: any) => getType(o) === 'function'
const isObject = (o: any) => getType(o) === 'object'

export const defineApi = <
    RawResult = unknown,
    Params = any,
    LimitedResult = LimitResult<RawResult>,
>(
    url: string,
): ApiDefine<RawResult, Params, LimitedResult> => ({ url })

class ApiManage<List extends ApiList = ApiList, Result = unknown> {
    /**
     * 将多个api清单文件 合并成一个
     *
     * @param {any[]} fns api清单集合
     * @param {*} params api如果是函数 则为参数传入该函数中
     * @returns {ApiList}
     */
    static bindApi = (fns: any[], params?: any): ApiList =>
        (Array.isArray(fns) ? fns : [fns]).reduce((r, v) => {
            // 如果不是函数以及键值对 则过滤
            if (!(isFunction(v) || isObject(v))) return r
            // 如果是函数 则执行并将params传入参数
            const result = isFunction(v) ? v(params) : v

            // 如果返回的不是对象键值对 则过滤
            if (!isObject(result)) return r

            return Object.entries(result).reduce(
                (r2, [n, m]: any) => ({
                    ...r2,
                    ...(isObject(m) && { [n]: { ...(r2[n] || {}), ...m } }),
                }),
                r,
            )
        }, {})

    /**
     * 计算中断函数唯一token
     *
     * @param {*} requestParams 请求参数
     * @param {*} cancelParams 取消请求配置
     * @returns
     */
    static createCancelToken = (
        requestParams: RequestOptions,
        cancelParams: ServeFnOptions['cancelParams'] | boolean = {},
    ): string => {
        const { method, url, params = {}, data = {} } = requestParams
        const isCalcFullPath =
            typeof cancelParams === 'boolean'
                ? true
                : cancelParams?.isCalcFullPath ?? true

        return isCalcFullPath
            ? encodeURIComponent(
                  url +
                      JSON.stringify(
                          method === 'get'
                              ? { params: ApiManage.sortValue(params) }
                              : { data: ApiManage.sortValue(data) },
                      ),
              )
            : url
    }

    /**
     * 路径模板 根据 `:` 来匹配
     *
     * @param {string} template
     * @param {object|array|string|number} [data=[]]
     * @returns {string}
     */
    static template = (
        template: string,
        data: TemplateData = [],
    ): string => {
        let tmp = 0
        const isA = Array.isArray(data)
        const isO =
            Object.prototype.toString.call(data).slice(8, -1).toLowerCase() ===
            'object'
        const dealData = !isO && !isA ? [data] : data
        return template
            .split('/')
            .map((v: string) => {
                let result = v
                if (v.startsWith(':')) {
                    const d = (dealData as any)[isO ? v.slice(1) : tmp++]
                    if (typeof d !== 'undefined') result = `${d}`
                }
                return result
            })
            .join('/')
    }

    /**
     * 将api清单数据 拍平 成键值对映射（api名称 对应 其路径以及方法类型）
     *
     * @param {object} data
     * @returns {Record<string, { path: string; method: string }>}
     */
    static flatApi = (
        data: ApiList,
    ): Record<string, { path: string; method: string }> =>
        Object.entries(data).reduce(
            (result: any, [method, items]) => ({
                ...result,
                ...Object.entries(items).reduce(
                    (r, [apiName, item]) => {
                        const path =
                            typeof item === 'string' ? item : item.url

                        return {
                            ...r,
                            [apiName]: {
                                path,
                                method,
                            },
                        }
                    },
                    {},
                ),
            }),
            {},
        )

    /**
     * 替换字符串开头的字符串
     *
     * @param {*} apiName 需要替换的字符串
     * @param {*} matchStr 被替换的字符
     * @param {*} replaceStr 替换成的字符
     */
    static replaceFnName = (
        apiName: string,
        matchStr: string,
        replaceStr: string,
    ): string =>
        matchStr ? apiName.replace(RegExp('^' + matchStr), replaceStr) : apiName

    private static sortValue(value: any): any {
        if (Array.isArray(value)) {
            return value.map((item) => ApiManage.sortValue(item))
        }

        if (!isObject(value)) return value

        return Object.keys(value)
            .sort()
            .reduce((result: Record<string, any>, key) => {
                result[key] = ApiManage.sortValue(value[key])
                return result
            }, {})
    }

    /**
     *  serveFn 列表
     * */
    private serveMap: Record<
        string,
        {
            path: string
            method: string
            serveFn: ServeFunction
        }
    > = {}

    /**
     *  中断函数 列表
     */
    private cancelList: Record<
        string,
        [(message?: any) => void, string]
    > = {}

    private options: FullApiManageOptions<List>

    constructor(options: ApiManageOptions<List>) {
        this.options = this.mergeOptions(options)

        if (typeof this.options.request !== 'function') {
            throw Error('apiManage: request must required!')
        }

        if (!isObject(this.options.list)) {
            throw Error('apiManage: list must be object!')
        }

        const methodAction: NonNullable<ApiManageOptions<List>['customize']> = {
            ...this.options.defaultMethodNames.reduce((r, method) => {
                return {
                    ...r,
                    [method]: (path: string, serveName: string) =>
                        this.createServeFunction(path, method, serveName),
                }
            }, {}),
            ...this.options.customize,
        }

        const apiList = ApiManage.flatApi(this.options.list)

        this.serveMap = Object.entries(apiList).reduce(
            (result: any, [apiName, { path, method }]: [string, any]) => {
                if (typeof methodAction[method] !== 'function') {
                    return result
                }

                const serveName: string = ApiManage.replaceFnName(
                    apiName,
                    this.options.matchStr,
                    this.options.replaceStr,
                )

                const serveFn = methodAction[method](path, serveName)

                if (typeof serveFn !== 'function') {
                    throw Error(
                        `apiManage: customize.${method} must return function!`,
                    )
                }

                this.attachServeFunctionMethods(serveFn, path, method, serveName)

                return {
                    ...result,
                    [serveName]: {
                        serveFn,
                        path,
                        method,
                    },
                }
            },
            {},
        )
    }

    /**
     * 运行时动态请求。用于请求初始化时未知、运行时才拿到的接口地址。
     */
    public call<R = Result>({
        url,
        method = 'get',
        data,
        tplData = {},
        serveName = 'dynamicRequest',
        isLimit = true,
        cancelParams = {},
        config = {},
    }: DynamicRequestOptions): Promise<R> {
        return this.executeRequest<R>({
            method,
            path: url,
            params: data,
            tplData,
            serveName,
            isLimit,
            cancelParams,
            config,
        })
    }

    /**
     * 合并 query 参数
     *
     * @param {string} [str]
     * @param {Record<string, any>} [data={}]
     * @returns {string}
     * @memberof ApiManage
     */
    public mergeQuery(str: string = '', data: Record<string, any> = {}): string {
        return [
            ...(typeof str === 'string' && str.trim()
                ? str
                      .trim()
                      .replace('?', '')
                      .split('&')
                      .map((item: string) => item.split('='))
                : []),
            ...Object.entries(data || {}),
        ]
            .map((item) => item.join('='))
            .join('&')
    }

    /**
     * 解析 请求地址
     *
     * @param {string} urlStr
     * @returns
     * @memberof ApiManage
     */
    public parseLocation(urlStr: string) {
        const regex =
            /^(?:(https?:)\/\/)?([^:/]*)(?::([^/]*))?([^?#]*)(\?[^#]+)?(#.+)?/
        const [protocol, hostname, port, pathname, query, hash] = (
            urlStr as any
        )
            .match(regex)
            .slice(1)

        return {
            protocol,
            hostname,
            port,
            pathname,
            query,
            hash,
        }
    }

    /**
     * 解析请求地址
     *
     * @param {string} serveName 指定的请求名称
     * @returns {TResolveFn}
     * @memberof ApiManage
     */
    public resolve(serveName: string): ServeFunction['resolve'] {
        return this.serveMap?.[serveName]?.serveFn?.resolve
    }

    /**
     * 中断请求
     *
     * @param {string} serveName 指定的请求名称
     * @returns {void}
     * @memberof ApiManage
     */
    public abort(serveName: string): void {
        return this.serveMap?.[serveName]?.serveFn?.abort?.()
    }

    /**
     * 获取所有 api 请求函数
     *
     * @returns {Record<string, any>}
     * @memberof ApiManage
     */
    public getService<
        ResultMap extends Record<string, any> = {},
        ParamsMap extends Record<string, any> = {},
    >(): ApiServiceMap<
        List,
        Result,
        any,
        'api',
        'serve',
        ResultMap,
        ParamsMap
    > {
        return Object.entries(this.serveMap).reduce(
            (r, [k, items]) => ({
                ...r,
                [k]: items.serveFn,
            }),
            {},
        ) as ApiServiceMap<
            List,
            Result,
            any,
            'api',
            'serve',
            ResultMap,
            ParamsMap
        >
    }

    private mergeOptions(options: ApiManageOptions<List>): FullApiManageOptions<List> {
        const defaultOptions: Omit<
            FullApiManageOptions<List>,
            'list' | 'request'
        > = {
            matchStr: 'api',
            replaceStr: 'serve',
            hooks: {},
            limitResponse: (result) => result,
            defaultMethodNames: ['get', 'post', 'put', 'delete'],
            methodsForDataKeyNames: {
                get: 'params',
            },
            customize: {},
            validate: () => true,
        }

        return {
            ...defaultOptions,
            ...(options as any),
        }
    }

    private createServeFunction(
        path: string,
        method: string,
        serveName: string,
    ): ServeFunction {
        return ((
            params: any,
            {
                tplData = {},
                cancelParams = {},
                isLimit = true,
                ...config
            }: ServeFnOptions = {},
        ) =>
            this.executeRequest({
                method,
                path,
                serveName,
                params,
                tplData,
                cancelParams,
                isLimit,
                config,
            })) as ServeFunction
    }

    private attachServeFunctionMethods(
        serveFn: ServeFunction,
        path: string,
        method: string,
        serveName: string,
    ): void {
        Reflect.defineProperty(serveFn, 'name', {
            value: serveName,
        })

        serveFn.resolve = (data = {}, tplData = {}) =>
            this.resolveRequest(path, method, serveName, data, tplData)

        serveFn.abort = () => {
            Object.entries(this.cancelList).forEach(
                ([cancelToken, [cancelFn, oldServeName]]) => {
                    if (oldServeName === serveName) {
                        cancelFn('取消重复请求')
                        Reflect.deleteProperty(this.cancelList, cancelToken)
                    }
                },
            )
        }
    }

    private resolveRequest(
        path: string,
        method: string,
        serveName: string,
        data: Record<string, any> = {},
        tplData: ServeFnOptions['tplData'] = {},
    ): ResolvedRequest {
        let { protocol, hostname, port, pathname, query, hash } =
            this.parseLocation(ApiManage.template(path, tplData))

        query =
            method === 'get'
                ? this.mergeQuery(query, data)
                : (query ?? '').trim().replace('?', '')

        if (typeof protocol === 'string') {
            protocol = protocol.replace(':', '')
        }

        return {
            url: path,
            name: serveName,
            method,
            hostname,
            pathname,
            port,
            hash,
            protocol,
            query,
            requestUrl: `${protocol ? `${protocol}://` : ''}${
                hostname || ''
            }${port ? `:${port}` : ''}${pathname || ''}${
                query ? `?${query}` : ''
            }${hash || ''}`,
        }
    }

    private executeRequest<R = Result>({
        method,
        path,
        serveName,
        params,
        tplData = {},
        cancelParams = {},
        isLimit = true,
        config = {},
    }: ExecuteRequestParams): Promise<R> {
        const normalizedMethod = method || 'get'
        const requestParams = {
            method: normalizedMethod,
            url: ApiManage.template(path, tplData),
            [this.options.methodsForDataKeyNames[normalizedMethod] ?? 'data']:
                params,
        }
        let requestToken = ''
        const timestamp = `${Date.now()}`
        const requestConfig = {
            ...config,
        }

        if (
            this.options.CancelRequest &&
            (cancelParams?.open ?? true)
        ) {
            requestToken = ApiManage.createCancelToken(
                requestParams as RequestOptions,
                cancelParams,
            )

            if (this.cancelList[requestToken]) {
                this.cancelList[requestToken][0]('取消重复请求')
                Reflect.deleteProperty(this.cancelList, requestToken)
            }

            try {
                requestConfig.cancelToken = new this.options.CancelRequest(
                    (cancelFn) => {
                        Reflect.set(this.cancelList, requestToken, [
                            cancelFn,
                            serveName,
                        ])
                    },
                )
            } catch (err) {
                console.error(err)
            }
        }

        return Promise.resolve()
            .then(() => this.options.hooks.start?.(serveName, timestamp))
            .then(() =>
                this.options.request({
                    ...requestConfig,
                    ...requestParams,
                }),
            )
            .then((res) =>
                Promise.resolve(this.options.validate(res, serveName)).then(
                    (isValid) => {
                        if (!isValid) {
                            throw {
                                error: 'api-manage validate false',
                                response: res,
                            }
                        }

                        if (requestToken) {
                            Reflect.deleteProperty(
                                this.cancelList,
                                requestToken,
                            )
                        }

                        return Promise.resolve(
                            this.options.hooks.resolve?.(
                                serveName,
                                timestamp,
                            ),
                        ).then(() =>
                            isLimit
                                ? this.options.limitResponse(res, serveName)
                                : res,
                        )
                    },
                ),
            )
            .then(
                (value) =>
                    Promise.resolve(
                        this.options.hooks.finally?.(serveName, timestamp),
                    ).then(() => value as R),
                (error) =>
                    Promise.resolve(
                        this.options.hooks.reject?.(
                            serveName,
                            timestamp,
                            error,
                        ),
                    )
                        .catch(() => undefined)
                        .then(() =>
                            Promise.resolve(
                                this.options.hooks.finally?.(
                                    serveName,
                                    timestamp,
                                ),
                            ),
                        )
                        .catch(() => undefined)
                        .then(() => {
                            throw error
                        }),
            )
    }
}

export default ApiManage
