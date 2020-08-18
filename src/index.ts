export interface ApiManageOptions
    extends Partial<{
        matchStr: string;
        replaceStr: string;
    }> {
    /** api清单 */
    list: Record<string, Record<string, string>>;
    /** 请求函数 */
    request: (options: RequestOptions) => any;

    /** 处理 response 的数据格式 */
    limitResponse?: (res: any) => any;

    /** 验证请求结果是否通过 */
    validate?: (response?: any, serveName?: string) => boolean;

    /** 自定义请求 函数处理 */
    customize?: Record<
        string,
        (path?: string, serveName?: string) => ServeFunction
    >;
    /** 请求构造函数 */
    CancelRequest?: new (fn: (cancelFn: () => void) => void) => void;

    /** 钩子函数 */
    hooks?: {
        /** 请求前 */
        start?: (serveName?: string, timestamp?: string) => void;
        /** 请求成功 触发 */
        resolve?: (serveName?: string, timestamp?: string) => void;
        /** 请求失败 触发 */
        reject?: (serveName?: string, timestamp?: string) => void;
        /** 请求成功和失败 都触发 */
        finally?: (serveName?: string, timestamp?: string) => void;
    };
    /** 默认支持的请求方法 */
    defaultMethodNames?: string[];

    /** 不同方法 对应传递参数的 key 集合 默认的传参 key 为 data */
    methodsForDataKeyNames?: Partial<Record<keyof methods, string>> &
        Record<string, string>;
}

interface methods {
    get: "GET";
    post: "POST";
    put: "PUT";
    delete: "DELETE";
    options: "OPTIONS";
    head: "HEAD";
    trace: "TRACE";
    connect: "CONNECT";
}

type RequestOptions = {
    /** 开发者服务器接口地址 */
    url: string;
    /** HTTP 请求方法 */
    method: keyof methods;
    /** 请求的参数 */
    data?: any;
} & Record<string, any>;

type ServeFnOptions = {
    /** 模板数据 */
    tplData?: Record<string, any>;
    /** 取消函数请求配置 */
    cancelParams?: {
        /** 是否是计算全部路径 */
        isCalcFullPath?: boolean;
    };
} & { [p in string]: any };

type ApiList = Record<string, Record<string, string>>;

type UnPartial<T> = {
    [P in keyof T]-?: T[P];
};

type TServeFn = (data?: any, options?: ServeFnOptions) => Promise<any>;

interface ServeFunction extends TServeFn {
    resolve?: (
        data?: Record<string, any>,
        tplData?: ServeFnOptions["tplData"]
    ) => void | {
        url?: string;
        name?: string;
        method?: string;
        hostname?: string;
        pathname?: string;
        hash?: string;
        port?: string;
        protocol?: string;
        query?: string;
        requestUrl: string;
    };
    abort?: (key?: string) => void;
}

const getType = (obj: any) =>
    Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
const isFunction = (o: any) => getType(o) === "function";
const isObject = (o: any) => getType(o) === "object";

class ApiManage {
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
            if (!(isFunction(v) || isObject(v))) return r;
            // 如果是函数 则执行并将params传入参数
            const result = isFunction(v) ? v(params) : v;

            // 如果返回的不是对象键值对 则过滤
            if (!isObject(result)) return r;

            return Object.entries(result).reduce(
                (r2, [n, m]: any) => ({
                    ...r2,
                    ...(isObject(m) && { [n]: { ...(r2[n] || {}), ...m } }),
                }),
                r
            );
        }, {});

    /**
     * 计算中断函数唯一token
     *
     * @param {*} requestParams 请求参数
     * @param {boolean} [isCalcFullPath=true]  是否计算全路径（只要用来区别相同请求地址，不同参数间是否进行取消操作）
     * @returns
     */
    static createCancelToken = (
        requestParams: RequestOptions,
        cancelParams: ServeFnOptions
    ): string => {
        let { method, url, params = {}, data = {} } = requestParams;

        return cancelParams?.isCalcFullPath ?? true
            ? encodeURIComponent(
                  url + JSON.stringify(method === "get" ? { params } : { data })
              )
            : url;
    };

    /**
     * 路径模板 根据 `:` 来匹配
     *
     * @param {string} template
     * @param {object|array} [data=[]]
     * @returns {string}
     */
    static template = (
        template: string,
        data: Record<string, any> = []
    ): string => {
        let tmp = 0;
        const isA = Array.isArray(data);
        const isO =
            Object.prototype.toString.call(data).slice(8, -1).toLowerCase() ===
            "object";
        const dealData = !isO && !isA ? [data] : data;
        return template
            .split("/")
            .map((v: string) => {
                let result = v;
                if (v.startsWith(":")) {
                    let d = dealData[isO ? v.slice(1) : tmp++];
                    if (typeof d !== "undefined") result = `${d}`;
                }
                return result;
            })
            .join("/");
    };

    /**
     * 将api清单数据 拍平 成键值对映射（api名称 对应 其路径以及方法类型）
     *
     * @param {object} data
     * @returns {Record<string, { path: string; method: string }>}
     *
     *
     */
    static flatApi = (
        data: ApiList
    ): Record<string, { path: string; method: string }> =>
        Object.entries(data).reduce(
            (result: any, [method, items]) => ({
                ...result,
                ...Object.entries(items).reduce(
                    (r, [apiName, path]) => ({
                        ...r,
                        [apiName]: {
                            path,
                            method,
                        },
                    }),
                    {}
                ),
            }),
            {}
        );

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
        replaceStr: string
    ): string =>
        matchStr
            ? apiName.replace(RegExp("^" + matchStr), replaceStr)
            : apiName;

    /**
     *  serveFn 列表
     * */
    private serveMap: Record<
        string,
        {
            path: string;
            method: string;
            serveFn: ServeFunction;
        }
    > = {};

    /**
     *  中断函数 列表
     */
    private cancelList: Record<string, any> = {};

    /**
     * 合并 参数
     *
     * @private
     * @template T
     * @param {T} op
     * @returns {UnPartial<T>}
     * @memberof ApiManage
     */
    private mergeOptions<T>(op: T): UnPartial<T> {
        const defaultOptions: Partial<ApiManageOptions> = {
            matchStr: "api",
            replaceStr: "serve",
            hooks: {},
            limitResponse: (result: any) => result,
            defaultMethodNames: [
                "get",
                "post",
                "put",
                "delete",
                "options",
                "head",
                "trace",
                "connect",
            ],
            methodsForDataKeyNames: {
                get: "params",
            },
            customize: {},
            validate: () => true,
        };

        return {
            ...defaultOptions,
            ...(op as any),
        };
    }
    /**
     * 合并 query 参数
     *
     * @private
     * @param {string} [str]
     * @param {Record<string, any>} [data={}]
     * @returns {string}
     * @memberof ApiManage
     */
    private mergeQuery(str: string, data: Record<string, any> = {}): string {
        return [
            ...(typeof str === "string" && str.trim()
                ? str
                      .trim()
                      .replace("?", "")
                      .split("&")
                      .map((item: string) => item.split("="))
                : []),
            ...Object.entries(data),
        ]
            .map((item) => item.join("="))
            .join("&");
    }

    constructor(options: ApiManageOptions) {
        const {
            list,
            matchStr,
            replaceStr,
            hooks = {},
            limitResponse,
            defaultMethodNames,
            request,
            CancelRequest,
            methodsForDataKeyNames,
            customize,
            validate,
        } = this.mergeOptions<ApiManageOptions>(options);

        if (typeof request !== "function") {
            throw Error("apiManage: request must required!");
        }

        const methodAction: ApiManageOptions["customize"] = {
            ...defaultMethodNames.reduce((r, method) => {
                return {
                    ...r,
                    [method]: (path: string, serveName: string) => (
                        params: any,
                        { tplData = {}, cancelParams = {}, ...config }: any = {}
                    ) => {
                        const requestParams = {
                            method,
                            url: ApiManage.template(path, tplData),
                            [methodsForDataKeyNames[method] ?? "data"]: params,
                        };

                        let requestToken = "";
                        // 如果存在取消请求函数 则 执行以及初始化 取消请求
                        if (CancelRequest) {
                            requestToken = ApiManage.createCancelToken(
                                requestParams as any,
                                cancelParams
                            );

                            // 中断 同一个 token
                            if (this.cancelList[requestToken]) {
                                this.cancelList[requestToken][0](
                                    "取消重复请求"
                                );
                                Reflect.deleteProperty(
                                    this.cancelList,
                                    requestToken
                                );
                            }

                            try {
                                config.cancelToken = new CancelRequest(
                                    (cancleFn) => {
                                        Reflect.set(
                                            this.cancelList,
                                            requestToken,
                                            [cancleFn, serveName]
                                        );
                                    }
                                );
                            } catch (err) {
                                console.error(err);
                            }
                        }

                        return new Promise((resolve, reject) => {
                            // 生成时间戳
                            const timestamp = `${new Date().getTime()}`;

                            hooks?.start?.(serveName, timestamp);

                            request({
                                ...config,
                                ...requestParams,
                            })
                                .then((res: any) => {
                                    if (validate(res, serveName)) {
                                        // 如果存在 取消函数 则取消该函数记录
                                        if (!!requestToken) {
                                            // 请求成功 删除取消函数
                                            Reflect.deleteProperty(
                                                this.cancelList,
                                                requestToken
                                            );
                                        }

                                        hooks?.resolve?.(serveName, timestamp);
                                        resolve(limitResponse(res));
                                    } else {
                                        reject({
                                            error: "api-manage validate false",
                                            response: res,
                                        });
                                    }
                                })
                                .catch(reject)
                                .finally(() => {
                                    hooks?.finally?.(serveName, timestamp);
                                });
                        }).catch(hooks?.reject);
                    },
                };
            }, {}),
            ...customize,
        };

        const apiList = ApiManage.flatApi(list);

        this.serveMap = Object.entries(apiList).reduce(
            (result: any, [apiName, { path, method }]: [string, any]) => {
                if (typeof methodAction[method] !== "function") {
                    return result;
                }

                const serveName: string = ApiManage.replaceFnName(
                    apiName,
                    matchStr,
                    replaceStr
                );

                const serveFn: ServeFunction = methodAction?.[method]?.(
                    path,
                    serveName
                );

                // 设置请求函数名称
                Reflect.defineProperty(serveFn, "name", {
                    value: serveName,
                });

                // 设置原型
                Reflect.setPrototypeOf(
                    serveFn,
                    Object.create({
                        resolve: (data = {}, tplData = {}) => {
                            let {
                                protocol,
                                hostname,
                                port,
                                pathname,
                                query,
                                hash,
                            } = this.parseLocation(
                                ApiManage.template(path, tplData)
                            );

                            query =
                                method === "get"
                                    ? this.mergeQuery(query, data)
                                    : (query ?? "").tirm().replace("?", "");

                            if (typeof protocol === "string") {
                                protocol = protocol.replace(":", "");
                            }

                            return {
                                url: path,
                                name: serveName,
                                method: method,
                                hostname,
                                pathname,
                                port,
                                hash,
                                protocol,
                                query,
                                requestUrl: `${
                                    protocol ? `${protocol}://` : ""
                                }${hostname || ""}${port ? `:${port}` : ""}${
                                    pathname || ""
                                }${query ? `?${query}` : ""}${hash || ""}`,
                            };
                        },

                        ...(CancelRequest && {
                            // 中断请求（通过serveName 来匹配, 会中断多个参数不同但serveFn相同的函数）
                            abort: () => {
                                Object.entries(this.cancelList).forEach(
                                    ([
                                        cancelToken,
                                        [cancelFn, oldServeName],
                                    ]) => {
                                        if (oldServeName === serveName) {
                                            cancelFn("取消重复请求");

                                            Reflect.deleteProperty(
                                                this.cancelList,
                                                cancelToken
                                            );
                                        }
                                    }
                                );
                            },
                        }),

                        bind: Function.prototype.bind,
                        call: Function.prototype.call,
                        apply: Function.prototype.apply,
                    })
                );

                return {
                    ...result,
                    [serveName]: {
                        serveFn,
                        path,
                        method,
                    },
                };
            },
            {}
        );
    }
    /**
     * 解析 请求地址
     *
     * @param {string} urlStr
     * @returns
     * @memberof ApiManage
     */
    public parseLocation(urlStr: string) {
        const regex = /^(?:(https?:)\/\/)?([^:/]*)(?::([^/]*))?([^?#]*)(\?[^#]+)?(#.+)?/;
        const [
            protocol,
            hostname,
            port,
            pathname,
            query,
            hash,
        ] = (urlStr as any).match(regex).slice(1);

        return {
            protocol,
            hostname,
            port,
            pathname,
            query,
            hash,
        };
    }

    /**
     * 解析请求地址
     *
     * @param {string} serveName 指定的请求名称
     * @returns {TResolveFn}
     * @memberof ApiManage
     */
    public resolve(serveName: string): ServeFunction["resolve"] {
        return this.serveMap?.[serveName]?.serveFn?.resolve;
    }

    /**
     * 中断请求
     *
     * @param {string} serveName 指定的请求名称
     * @returns {void}
     * @memberof ApiManage
     */
    public abort(serveName: string): void {
        return this.serveMap?.[serveName]?.serveFn?.abort?.();
    }
    /**
     * 获取所有 api 请求函数
     *
     * @returns {Record<string, any>}
     * @memberof ApiManage
     */
    public getService(): Record<string, ServeFunction> {
        return Object.entries(this.serveMap).reduce(
            (r, [k, items]) => ({
                ...r,
                [k]: items.serveFn,
            }),
            {}
        );
    }
}

export default ApiManage;
