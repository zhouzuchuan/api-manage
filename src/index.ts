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

export interface ApiManageDefaultExtraOptions {
    headers?: Record<string, string | number | boolean | null | undefined>
}

export type ApiManageExtraOptions<
    ExtraOptions extends Record<string, any> = {},
> = Omit<ApiManageDefaultExtraOptions, keyof ExtraOptions> & ExtraOptions

export type ApiManageRequestExtraOptions<
    ExtraOptions extends Record<string, any> = {},
    CancelExtraOptions extends Record<string, any> = {},
> = ApiManageExtraOptions<ExtraOptions> & CancelExtraOptions

export type CancelAdapterResult<ExtraOptions extends Record<string, any>> =
    | {
          cancel: (message?: any) => void
          extraOptions?: Partial<ExtraOptions>
      }
    | void

export type CancelAdapterInjectedResult<
    ExtraOptions extends Record<string, any>,
> = {
    cancel: (message?: any) => void
    extraOptions: ExtraOptions
}

type CancelExtraOptionsMarker<ExtraOptions extends Record<string, any>> = {
    readonly __apiManageCancelExtraOptions?: ExtraOptions
}

export type CancelAdapterWithExtraOptions<
    ExtraOptions extends Record<string, any>,
> = ((...args: any[]) => CancelAdapterInjectedResult<ExtraOptions>) &
    CancelExtraOptionsMarker<ExtraOptions>

export type AxiosCancelLike<CancelToken = unknown> = {
    CancelToken: new (
        executor: (cancel: (message?: any) => void) => void,
    ) => CancelToken
}

export type AbortControllerLike<Signal = unknown> = {
    signal: Signal
    abort: (reason?: any) => void
}

export type AbortControllerConstructor<Signal = unknown> = new () => AbortControllerLike<Signal>

type MaybePromise<T> = T | PromiseLike<T>
type AnyFunction = (...args: any[]) => any
type NoInferType<T> = [T][T extends any ? 0 : never]
type AwaitedRequestResult<T> = T extends PromiseLike<infer R>
    ? AwaitedRequestResult<R>
    : T
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

type ApiFileInput = ApiList | AnyFunction
type ApiFileToList<T> = T extends AnyFunction ? ReturnType<T> : T
type BindApiList<Input> = UnionToIntersection<
    Extract<
        ApiFileToList<Input extends readonly (infer Item)[] ? Item : Input>,
        ApiList
    >
>
type ApiServeName<
    List extends ApiList,
    MatchStr extends string = 'api',
    ReplaceStr extends string = 'serve',
> = ApiToServeName<UnionKeys<List[keyof List]>, MatchStr, ReplaceStr>
type ApiMethodName<List extends ApiList> = Extract<keyof List, string>
type RequestContextByApiName<
    List extends ApiList,
    Name extends PropertyKey,
    MatchStr extends string,
    ReplaceStr extends string,
    ExtraOptions extends Record<string, any>,
> = ApiToServeName<Name, MatchStr, ReplaceStr> extends infer ServeName
    ? ServeName extends string
        ? RequestContext<
              ApiItemByName<List, Name> extends ApiDefine<any, infer P, any>
                  ? P
                  : any,
              ServeName,
              ExtraOptions
          >
        : never
    : never
type CancelParams<
    ExtraOptions extends Record<string, any> = ApiManageDefaultExtraOptions,
> = {
    /** 是否是计算全部路径 */
    isCalcFullPath?: boolean
    /** 当前函数是否开启取消重复请求功能 */
    open?: boolean
    /** 参与取消 token 计算的请求配置 key，例如 headers */
    includeConfigKeys?: Array<
        Extract<keyof ApiManageExtraOptions<ExtraOptions>, string>
    >
}

export type ApiManageControlOptions<
    ExtraOptions extends Record<string, any> = ApiManageDefaultExtraOptions,
> = {
    /** 模板数据 */
    tplData?: TemplateData
    /** 取消函数请求配置 */
    cancelParams?: CancelParams<ExtraOptions>
    /** 当前函数是否开启数据截取功能 */
    isLimit?: boolean
}

export type ServeFnOptions<
    ExtraOptions extends Record<string, any> = ApiManageDefaultExtraOptions,
> = {
    /** 模板数据 */
    tplData?: TemplateData
    /** 取消函数请求配置 */
    cancelParams?: CancelParams<ExtraOptions>
    /** 当前函数是否开启数据截取功能 */
    isLimit?: boolean
} & ApiManageExtraOptions<ExtraOptions>

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
    ExtraOptions extends Record<string, any> = ApiManageDefaultExtraOptions,
> = {
    (
        data?: Params,
        options?: ServeFnOptions<ExtraOptions> & { isLimit?: true },
    ): Promise<LimitedResult>
    (
        data: Params | undefined,
        options: ServeFnOptions<ExtraOptions> & { isLimit: false },
    ): Promise<RawResult>
    <R = LimitedResult>(
        data?: Params,
        options?: ServeFnOptions<ExtraOptions>,
    ): Promise<R>
    resolve: (data?: Params, tplData?: TemplateData) => ResolvedRequest
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
    ExtraOptions extends Record<string, any> = ApiManageDefaultExtraOptions,
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
        >,
        ExtraOptions
    >
}

type ApiFileServiceMap<
    T,
    Result,
    ResultMap,
    ParamsMap,
    ExtraOptions extends Record<string, any>,
    MatchStr extends string,
    ReplaceStr extends string,
> =
    T extends ApiList | AnyFunction
        ? ApiServiceMap<
              Extract<ApiFileToList<T>, ApiList>,
              Result,
              any,
              MatchStr,
              ReplaceStr,
              Extract<ResultMap, Record<string, any>>,
              Extract<ParamsMap, Record<string, any>>,
              ExtraOptions
          >
    : never

export type ApiFilesServiceMap<
    Files extends Record<string, ApiList | AnyFunction>,
    Result = unknown,
    ResultMap extends Record<string, any> = {},
    ParamsMap extends Record<string, any> = {},
    ExtraOptions extends Record<string, any> = ApiManageDefaultExtraOptions,
    MatchStr extends string = 'api',
    ReplaceStr extends string = 'serve',
> = UnionToIntersection<
    ApiFileServiceMap<
        Files[keyof Files],
        Result,
        ResultMap,
        ParamsMap,
        ExtraOptions,
        MatchStr,
        ReplaceStr
    >
>

export type RequestContext<
    Params = unknown,
    ServeName extends string = string,
    ExtraOptions extends Record<string, any> = ApiManageDefaultExtraOptions,
> = {
    serveName: ServeName
    params?: Params
    controlOptions: ApiManageControlOptions<ExtraOptions>
}

export type ApiRequestContextByList<
    List extends ApiList,
    MatchStr extends string = 'api',
    ReplaceStr extends string = 'serve',
    ExtraOptions extends Record<string, any> = ApiManageDefaultExtraOptions,
> = UnionKeys<List[keyof List]> extends infer Name
    ? Name extends PropertyKey
        ? RequestContextByApiName<
              List,
              Name,
              MatchStr,
              ReplaceStr,
              ExtraOptions
          >
        : never
    : never

export type DynamicRequestOptions<
    ExtraOptions extends Record<string, any> = ApiManageDefaultExtraOptions,
> = {
    url: string
    method?: string
    params?: any
    tplData?: TemplateData
    serveName?: string
    isLimit?: boolean
    cancelParams?: CancelParams<ExtraOptions>
    extraOptions?: ApiManageExtraOptions<ExtraOptions>
}

type CancelResult<ExtraOptions extends Record<string, any>> =
    CancelAdapterResult<ExtraOptions>
type CancelResultWithExtraOptions<
    ExtraOptions extends Record<string, any>,
> = CancelAdapterInjectedResult<ExtraOptions>
type CancelResultWithoutExtraOptions =
    | {
          cancel: (message?: any) => void
          extraOptions?: undefined
      }
    | void

type CancelTokenOptions<ExtraOptions extends Record<string, any>> = {
    url: string
    method?: string
    context: Pick<RequestContext<any, string, ExtraOptions>, 'serveName' | 'params'> &
        Partial<Pick<RequestContext<any, string, ExtraOptions>, 'controlOptions'>>
    extraOptions?: ApiManageExtraOptions<ExtraOptions>
}

type Hooks<ServeName extends string = string> = {
    /** 请求前 */
    start?: (serveName?: ServeName, timestamp?: string) => MaybePromise<void>
    /** 请求成功 触发 */
    resolve?: (serveName?: ServeName, timestamp?: string) => MaybePromise<void>
    /** 请求失败 触发 */
    reject?: (
        serveName?: ServeName,
        timestamp?: string,
        error?: any,
    ) => MaybePromise<void>
    /** 请求成功和失败 都触发 */
    finally?: (serveName?: ServeName, timestamp?: string) => MaybePromise<void>
}

export interface ApiManageOptions<
    List extends ApiList = ApiList,
    ExtraOptions extends Record<string, any> = ApiManageDefaultExtraOptions,
    MatchStr extends string = 'api',
    ReplaceStr extends string = 'serve',
    RequestResult = any,
>
    extends Partial<{
        matchStr: MatchStr
        replaceStr: ReplaceStr
    }> {
    /** api清单 */
    list: List
    /** 请求函数 */
    request: (
        url: string,
        method: ApiMethodName<List>,
        context: ApiRequestContextByList<
            List,
            MatchStr,
            ReplaceStr,
            ExtraOptions
        >,
        extraOptions?: ApiManageExtraOptions<ExtraOptions>,
    ) => RequestResult
    /** 处理 response 的数据格式 */
    limitResponse?: (
        res: AwaitedRequestResult<RequestResult>,
        serveName?: ApiServeName<List, MatchStr, ReplaceStr>,
    ) => any
    /** 验证请求结果是否通过 */
    validate?: (
        response: AwaitedRequestResult<RequestResult>,
        serveName?: ApiServeName<List, MatchStr, ReplaceStr>,
    ) => MaybePromise<boolean>
    /** 自定义请求 函数处理 */
    customize?: Partial<
        Record<
            ApiMethodName<List>,
            (
                path?: string,
                serveName?: ApiServeName<List, MatchStr, ReplaceStr>,
            ) => ServeFunction<any, any, any, ExtraOptions>
        >
    >
    /** 创建通用取消请求处理 */
    cancel?: (
        url: string,
        method: ApiMethodName<List>,
        context: ApiRequestContextByList<
            List,
            MatchStr,
            ReplaceStr,
            ExtraOptions
        >,
        extraOptions?: ApiManageExtraOptions<ExtraOptions>,
    ) => CancelResult<Record<string, any>>
    /** 钩子函数 */
    hooks?: Hooks<ApiServeName<List, MatchStr, ReplaceStr>>
}

export interface ApiManageCreateOptions<
    List extends ApiList = ApiList,
    ExtraOptions extends Record<string, any> = ApiManageDefaultExtraOptions,
    CancelExtraOptions extends Record<string, any> = {},
    MatchStr extends string = 'api',
    ReplaceStr extends string = 'serve',
    RequestResult = any,
>
    extends Omit<
        ApiManageOptions<
            List,
            ExtraOptions,
            MatchStr,
            ReplaceStr,
            RequestResult
        >,
        'request' | 'cancel'
    > {
    /** 请求函数。配置 cancel 时，extraOptions 会额外合并 cancel adapter 注入的字段。 */
    request: (
        url: string,
        method: ApiMethodName<List>,
        context: ApiRequestContextByList<
            List,
            MatchStr,
            ReplaceStr,
            ExtraOptions
        >,
        extraOptions?: ApiManageRequestExtraOptions<
            ExtraOptions,
            NoInferType<CancelExtraOptions>
        >,
    ) => RequestResult
    /** 创建通用取消请求处理 */
    cancel?: (
        url: string,
        method: ApiMethodName<List>,
        context: ApiRequestContextByList<
            List,
            MatchStr,
            ReplaceStr,
            ExtraOptions
        >,
        extraOptions?: ApiManageExtraOptions<ExtraOptions>,
    ) => CancelResult<CancelExtraOptions>
}

type ApiManageCreateCancelFunction<
    List extends ApiList,
    ExtraOptions extends Record<string, any>,
    MatchStr extends string,
    ReplaceStr extends string,
> = (
    url: string,
    method: ApiMethodName<List>,
    context: ApiRequestContextByList<List, MatchStr, ReplaceStr, ExtraOptions>,
    extraOptions?: ApiManageExtraOptions<ExtraOptions>,
) => CancelResultWithoutExtraOptions

type ApiManageCreateOptionsWithInjectedCancel<
    List extends ApiList,
    ExtraOptions extends Record<string, any>,
    CancelExtraOptions extends Record<string, any>,
    MatchStr extends string,
    ReplaceStr extends string,
    RequestResult,
> = Omit<
    ApiManageOptions<
        List,
        ExtraOptions,
        MatchStr,
        ReplaceStr,
        RequestResult
    >,
    'request' | 'cancel'
> & {
    request: (
        url: string,
        method: ApiMethodName<List>,
        context: ApiRequestContextByList<
            List,
            MatchStr,
            ReplaceStr,
            ExtraOptions
        >,
        extraOptions?: ApiManageRequestExtraOptions<
            ExtraOptions,
            NoInferType<CancelExtraOptions>
        >,
    ) => RequestResult
    cancel: ((
        url: string,
        method: ApiMethodName<List>,
        context: ApiRequestContextByList<
            List,
            MatchStr,
            ReplaceStr,
            ExtraOptions
        >,
        extraOptions?: ApiManageExtraOptions<ExtraOptions>,
    ) => CancelResultWithExtraOptions<CancelExtraOptions>) &
        CancelExtraOptionsMarker<CancelExtraOptions>
}

type FullApiManageOptions<
    List extends ApiList,
    ExtraOptions extends Record<string, any>,
    MatchStr extends string,
    ReplaceStr extends string,
    RequestResult,
> = Required<
    Omit<
        ApiManageOptions<
            List,
            ExtraOptions,
            MatchStr,
            ReplaceStr,
            RequestResult
        >,
        'cancel' | 'hooks' | 'customize' | 'limitResponse' | 'validate'
    >
> & {
    cancel?: ApiManageOptions<
        List,
        ExtraOptions,
        MatchStr,
        ReplaceStr,
        RequestResult
    >['cancel']
    hooks: Hooks<ApiServeName<List, MatchStr, ReplaceStr>>
    customize: NonNullable<
        ApiManageOptions<
            List,
            ExtraOptions,
            MatchStr,
            ReplaceStr,
            RequestResult
        >['customize']
    >
    limitResponse: NonNullable<
        ApiManageOptions<
            List,
            ExtraOptions,
            MatchStr,
            ReplaceStr,
            RequestResult
        >['limitResponse']
    >
    validate: NonNullable<
        ApiManageOptions<
            List,
            ExtraOptions,
            MatchStr,
            ReplaceStr,
            RequestResult
        >['validate']
    >
}

type ExecuteRequestParams<ExtraOptions extends Record<string, any>> = {
    method: string
    path: string
    serveName: string
    params?: any
    tplData?: TemplateData
    cancelParams?: CancelParams<ExtraOptions>
    isLimit?: boolean
    extraOptions?: ApiManageExtraOptions<ExtraOptions>
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

export const createAxiosCancel =
    <CancelToken = unknown>(
        axios: AxiosCancelLike<CancelToken>,
    ): CancelAdapterWithExtraOptions<{
        cancelToken?: CancelToken
    }> =>
    (() => {
        let cancel!: (message?: any) => void
        const cancelToken = new axios.CancelToken((fn) => {
            cancel = fn
        })

        return {
            cancel,
            extraOptions: { cancelToken },
        }
    }) as CancelAdapterWithExtraOptions<{ cancelToken?: CancelToken }>

export const createAbortCancel =
    <Signal = unknown>(
        AbortControllerClass?: AbortControllerConstructor<Signal>,
    ): CancelAdapterWithExtraOptions<{
        signal?: Signal
    }> =>
    (() => {
        const Controller =
            AbortControllerClass || (globalThis as any).AbortController

        if (!Controller) {
            throw new Error(
                'api-manage: AbortController is not available, please pass a compatible constructor to createAbortCancel.',
            )
        }

        const controller = new Controller()

        return {
            cancel: (message?: any) => controller.abort(message),
            extraOptions: { signal: controller.signal },
        }
    }) as CancelAdapterWithExtraOptions<{ signal?: Signal }>

class ApiManage<
    List extends ApiList = ApiList,
    ExtraOptions extends Record<string, any> = ApiManageDefaultExtraOptions,
    Result = unknown,
    MatchStr extends string = 'api',
    ReplaceStr extends string = 'serve',
    RequestResult = any,
> {
    /**
     * 将多个api清单文件 合并成一个
     *
     * @param {any[]} fns api清单集合
     * @param {*} params api如果是函数 则为参数传入该函数中
     * @returns {ApiList}
     */
    static bindApi = <Input extends ApiFileInput | readonly ApiFileInput[]>(
        fns: Input,
        params?: any,
    ): BindApiList<Input> =>
        ((Array.isArray(fns) ? fns : [fns]) as ApiFileInput[]).reduce(
            (r: ApiList, v) => {
                // 如果不是函数以及键值对 则过滤
                if (!(isFunction(v) || isObject(v))) return r
                // 如果是函数 则执行并将params传入参数
                const result = isFunction(v) ? (v as AnyFunction)(params) : v

                // 如果返回的不是对象键值对 则过滤
                if (!isObject(result)) return r

                return Object.entries(result).reduce(
                    (r2, [n, m]: any) => ({
                        ...r2,
                        ...(isObject(m) && {
                            [n]: { ...(r2[n] || {}), ...m },
                        }),
                    }),
                    r,
                )
            },
            {},
        ) as BindApiList<Input>

    /**
     * 计算中断函数唯一token
     *
     * @param {*} requestParams 请求参数
     * @param {*} cancelParams 取消请求配置
     * @returns
     */
    static createCancelToken = <
        ExtraOptions extends Record<string, any> = Record<string, any>,
    >(
        requestParams: CancelTokenOptions<ExtraOptions>,
        cancelParams: CancelParams<ExtraOptions> | boolean = {},
    ): string => {
        const {
            method,
            url,
            context,
            extraOptions = {} as ApiManageExtraOptions<ExtraOptions>,
        } = requestParams
        const isCalcFullPath =
            typeof cancelParams === 'boolean'
                ? true
                : cancelParams?.isCalcFullPath ?? true
        const includeConfigKeys =
            typeof cancelParams === 'boolean'
                ? []
                : cancelParams?.includeConfigKeys ?? []
        const includedConfig = includeConfigKeys.reduce(
            (result: Record<string, any>, key) => {
                if (Reflect.has(extraOptions, key)) {
                    result[key] = ApiManage.sortValue(extraOptions[key])
                }
                return result
            },
            {},
        )

        return isCalcFullPath
            ? encodeURIComponent(
                  url +
                      JSON.stringify(
                          {
                              method,
                              params: ApiManage.sortValue(
                                  context?.params ?? {},
                              ),
                              ...includedConfig,
                          },
                      ),
              )
            : url
    }

    static create<
        List extends ApiList = ApiList,
        ExtraOptions extends Record<string, any> = ApiManageDefaultExtraOptions,
        Result = unknown,
    >(): {
        <
            CancelExtraOptions extends Record<string, any>,
            RequestResult,
            MatchStr extends string = 'api',
            ReplaceStr extends string = 'serve',
        >(
            options: ApiManageCreateOptionsWithInjectedCancel<
                List,
                ExtraOptions,
                CancelExtraOptions,
                MatchStr,
                ReplaceStr,
                RequestResult
            >,
        ): ApiManage<
            List,
            ExtraOptions,
            Result,
            MatchStr,
            ReplaceStr,
            RequestResult
        >
        <
            RequestResult,
            MatchStr extends string = 'api',
            ReplaceStr extends string = 'serve',
        >(
            options: ApiManageCreateOptions<
                List,
                ExtraOptions,
                {},
                MatchStr,
                ReplaceStr,
                RequestResult
            > & {
                cancel: ApiManageCreateCancelFunction<
                    List,
                    ExtraOptions,
                    MatchStr,
                    ReplaceStr
                >
            },
        ): ApiManage<
            List,
            ExtraOptions,
            Result,
            MatchStr,
            ReplaceStr,
            RequestResult
        >
        <
            RequestResult,
            MatchStr extends string = 'api',
            ReplaceStr extends string = 'serve',
        >(
            options: ApiManageCreateOptions<
                List,
                ExtraOptions,
                {},
                MatchStr,
                ReplaceStr,
                RequestResult
            > & { cancel?: undefined },
        ): ApiManage<
            List,
            ExtraOptions,
            Result,
            MatchStr,
            ReplaceStr,
            RequestResult
        >
    }
    static create<
        List extends ApiList = ApiList,
        ExtraOptions extends Record<string, any> = ApiManageDefaultExtraOptions,
        CancelExtraOptions extends Record<string, any> = {},
        Result = unknown,
        MatchStr extends string = 'api',
        ReplaceStr extends string = 'serve',
        RequestResult = any,
    >(
        options: ApiManageCreateOptions<
            List,
            ExtraOptions,
            CancelExtraOptions,
            MatchStr,
            ReplaceStr,
            RequestResult
        >,
    ): ApiManage<
        List,
        ExtraOptions,
        Result,
        MatchStr,
        ReplaceStr,
        RequestResult
    >
    static create(
        options?: ApiManageCreateOptions<any, any, any, any, any, any>,
    ): any {
        const createInstance = (
            nextOptions: ApiManageCreateOptions<any, any, any, any, any, any>,
        ) =>
            new ApiManage(
                nextOptions as unknown as ApiManageOptions<
                    any,
                    any,
                    any,
                    any,
                    any
                >,
            )

        if (!options) {
            return createInstance
        }

        return createInstance(options)
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
            serveFn: ServeFunction<any, any, any, ExtraOptions>
        }
    > = {}

    /**
     *  中断函数 列表
     */
    private cancelList: Record<
        string,
        [(message?: any) => void, string]
    > = {}

    private options: FullApiManageOptions<
        List,
        ExtraOptions,
        MatchStr,
        ReplaceStr,
        RequestResult
    >

    constructor(
        options: ApiManageOptions<
            List,
            ExtraOptions,
            MatchStr,
            ReplaceStr,
            RequestResult
        >,
    ) {
        this.options = this.mergeOptions(options)

        if (typeof this.options.request !== 'function') {
            throw Error('apiManage: request must required!')
        }

        if (!isObject(this.options.list)) {
            throw Error('apiManage: list must be object!')
        }

        const customize: Record<
            string,
            (
                path?: string,
                serveName?: ApiServeName<List, MatchStr, ReplaceStr>,
            ) => ServeFunction<any, any, any, ExtraOptions>
        > = this.options.customize as Record<string, any>

        const apiList = ApiManage.flatApi(this.options.list)

        this.serveMap = Object.entries(apiList).reduce(
            (result: any, [apiName, { path, method }]: [string, any]) => {
                const serveName = ApiManage.replaceFnName(
                    apiName,
                    this.options.matchStr,
                    this.options.replaceStr,
                ) as ApiServeName<List, MatchStr, ReplaceStr>

                const serveFn =
                    typeof customize[method] === 'function'
                        ? customize[method](path, serveName)
                        : this.createServeFunction(path, method, serveName)

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
        params,
        tplData = {},
        serveName = 'dynamicRequest',
        isLimit = true,
        cancelParams = {},
        extraOptions = {} as ApiManageExtraOptions<ExtraOptions>,
    }: DynamicRequestOptions<ExtraOptions>): Promise<R> {
        return this.executeRequest<R>({
            method,
            path: url,
            params,
            tplData,
            serveName,
            isLimit,
            cancelParams,
            extraOptions,
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
    public resolve(
        serveName: ApiServeName<List, MatchStr, ReplaceStr>,
    ): ServeFunction<any, any, any, ExtraOptions>['resolve'] {
        return this.serveMap?.[serveName]?.serveFn?.resolve
    }

    /**
     * 中断请求
     *
     * @param {string} serveName 指定的请求名称
     * @returns {void}
     * @memberof ApiManage
     */
    public abort(serveName: ApiServeName<List, MatchStr, ReplaceStr>): void {
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
        MatchStr,
        ReplaceStr,
        ResultMap,
        ParamsMap,
        ExtraOptions
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
            MatchStr,
            ReplaceStr,
            ResultMap,
            ParamsMap,
            ExtraOptions
        >
    }

    private mergeOptions(
        options: ApiManageOptions<
            List,
            ExtraOptions,
            MatchStr,
            ReplaceStr,
            RequestResult
        >,
    ): FullApiManageOptions<
        List,
        ExtraOptions,
        MatchStr,
        ReplaceStr,
        RequestResult
    > {
        const defaultOptions: Omit<
            FullApiManageOptions<
                List,
                ExtraOptions,
                MatchStr,
                ReplaceStr,
                RequestResult
            >,
            'list' | 'request'
        > = {
            matchStr: 'api' as MatchStr,
            replaceStr: 'serve' as ReplaceStr,
            hooks: {},
            limitResponse: (result) => result,
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
    ): ServeFunction<any, any, any, ExtraOptions> {
        return ((params: any, options = {} as ServeFnOptions<ExtraOptions>) => {
            const {
                tplData = {},
                cancelParams = {},
                isLimit = true,
                ...config
            } = options

            return this.executeRequest({
                method,
                path,
                serveName,
                params,
                tplData: tplData as TemplateData,
                cancelParams: cancelParams as CancelParams<ExtraOptions>,
                isLimit,
                extraOptions: config as ApiManageExtraOptions<ExtraOptions>,
            })
        }) as ServeFunction<any, any, any, ExtraOptions>
    }

    private attachServeFunctionMethods(
        serveFn: ServeFunction<any, any, any, ExtraOptions>,
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
        tplData: TemplateData = {},
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
        extraOptions = {} as ApiManageExtraOptions<ExtraOptions>,
    }: ExecuteRequestParams<ExtraOptions>): Promise<R> {
        const normalizedMethod = method || 'get'
        const url = ApiManage.template(path, tplData)
        let requestToken = ''
        let cancelFnRef: ((message?: any) => void) | undefined
        const timestamp = `${Date.now()}`
        let requestExtraOptions = {
            ...extraOptions,
        } as ApiManageExtraOptions<ExtraOptions>
        const typedServeName = serveName as ApiServeName<
            List,
            MatchStr,
            ReplaceStr
        >
        const methodName = normalizedMethod as ApiMethodName<List>
        const requestContext = {
            serveName: typedServeName,
            params,
            controlOptions: {
                tplData,
                cancelParams,
                isLimit,
            },
        } as ApiRequestContextByList<List, MatchStr, ReplaceStr, ExtraOptions>
        const clearCurrentCancelToken = () => {
            if (
                requestToken &&
                cancelFnRef &&
                this.cancelList[requestToken]?.[0] === cancelFnRef
            ) {
                Reflect.deleteProperty(this.cancelList, requestToken)
            }
        }

        if (
            this.options.cancel &&
            (cancelParams?.open ?? true)
        ) {
            requestToken = ApiManage.createCancelToken(
                {
                    url,
                    method: normalizedMethod,
                    context: requestContext,
                    extraOptions: requestExtraOptions,
                },
                cancelParams,
            )

            if (this.cancelList[requestToken]) {
                this.cancelList[requestToken][0]('取消重复请求')
                Reflect.deleteProperty(this.cancelList, requestToken)
            }

            try {
                const cancelResult = this.options.cancel(
                    url,
                    methodName,
                    requestContext,
                    requestExtraOptions,
                )

                if (cancelResult?.cancel) {
                    cancelFnRef = cancelResult.cancel
                    requestExtraOptions = {
                        ...requestExtraOptions,
                        ...cancelResult.extraOptions,
                    }
                    Reflect.set(this.cancelList, requestToken, [
                        cancelResult.cancel,
                        serveName,
                    ])
                }
            } catch (err) {
                console.error(err)
            }
        }

        return Promise.resolve()
            .then(() => this.options.hooks.start?.(typedServeName, timestamp))
            .then(() =>
                this.options.request(
                    url,
                    methodName,
                    requestContext,
                    requestExtraOptions,
                ),
            )
            .then((res) => {
                const response = res as AwaitedRequestResult<RequestResult>

                return Promise.resolve(
                    this.options.validate(response, typedServeName),
                ).then(
                    (isValid) => {
                        if (!isValid) {
                            throw {
                                error: 'api-manage validate false',
                                response,
                            }
                        }

                        clearCurrentCancelToken()

                        return Promise.resolve(
                            this.options.hooks.resolve?.(
                                typedServeName,
                                timestamp,
                            ),
                        ).then(() =>
                            isLimit
                                ? this.options.limitResponse(
                                      response,
                                      typedServeName,
                                  )
                                : response,
                        )
                    },
                )
            })
            .then(
                (value) =>
                    Promise.resolve(
                        this.options.hooks.finally?.(
                            typedServeName,
                            timestamp,
                        ),
                    ).then(() => value as R),
                (error) =>
                    Promise.resolve(
                        this.options.hooks.reject?.(
                            typedServeName,
                            timestamp,
                            error,
                        ),
                    )
                        .catch(() => undefined)
                        .then(() =>
                            Promise.resolve(
                                this.options.hooks.finally?.(
                                    typedServeName,
                                    timestamp,
                                ),
                            ),
                        )
                        .catch(() => undefined)
                        .then(() => clearCurrentCancelToken())
                        .then(() => {
                            throw error
                        }),
            )
    }
}

export default ApiManage
