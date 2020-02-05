import axios from "axios";
import URI from "urijs";

interface Options
    extends Partial<{
        matchStr: string;
        replaceStr: string;
    }> {
    list: Record<string, Record<string, string>>;
    request?: any;
    validate?: () => boolean;
    customize?: Record<string, (path?: string, serveName?: string) => any>;
    hooks?: {
        start?: (serveName?: string, timestamp?: string) => void;
        resolve?: (serveName?: string, timestamp?: string) => void;
        reject?: (serveName?: string, timestamp?: string) => void;
        finally?: (serveName?: string, timestamp?: string) => void;
    };
}

const utils: {
    flatApi: (data: object) => Record<string, string>;
    replaceFnName: (
        apiName: string,
        matchStr: string,
        replaceStr: string
    ) => string;
    template: (template: any, data: any) => string;
} = {
    // bindApi: (data: object): any => {
    //     Object.entries(data).reduce(
    //         (r, [key, apis]) => ({
    //             ...r,
    //             ...Object.entries(apis).reduce(
    //                 (r1, [name, path]) => ({
    //                     ...r1,
    //                     [name]: `${key} ${path}`,
    //                 }),
    //                 {},
    //             ),
    //         }),
    //         {},
    //     )
    // },

    template: (template, data) => {
        let tmp = 0;
        const isA = Array.isArray(data);
        const isO =
            Object.prototype.toString
                .call(data)
                .slice(8, -1)
                .toLowerCase() === "object";
        const dealData = !isO && !isA ? [data] : data;
        return template
            .split("/")
            .map((v: string) => {
                let result = v;
                if (v.startsWith(":")) {
                    let d = dealData[isO ? v.slice(1) : tmp++];
                    if (d) result = d;
                }
                return result;
            })
            .join("/");
    },

    flatApi: data => {
        return Object.entries(data).reduce(
            (result: any, [method, items]: any) => ({
                ...result,
                ...Object.entries(items).reduce(
                    (r, [apiName, path]) => ({
                        ...r,
                        [apiName]: {
                            path,
                            method
                        }
                    }),
                    {}
                )
            }),
            {}
        );
    },

    replaceFnName: (apiName, matchStr, replaceStr) => {
        return apiName.replace(RegExp("^" + matchStr), replaceStr);
    }
};

const defaultOptions = {
    matchStr: "api",
    replaceStr: "serve"
};

class ApiManage {
    private serveMap: Record<
        string,
        {
            path: string;
            method: string;
            serveFn: any;
        }
    > = {};
    private hooks: Options["hooks"] = {};
    private methodAction: any = {};
    private enumName: Record<string, string> = {};

    private cancelList: Record<string, any> = {};

    // 索引 请求函数名与其生成的请求token组 映射
    // private serveCancelTokenMap: Record<string, string[]> = {}

    private validate(response: any, serveName: string): boolean {
        return true;
    }

    private createMethodService(otherCustomizeMethod: any, request: any) {
        const public2 = (method: string, path: string, serveName: string) => {
            return (params: any, { tplData = {}, ...config }: any = {}) => {
                const requestParams = {
                    method,
                    url: utils.template(path, tplData),
                    [method === "get" ? "params" : "data"]: params
                };

                // // 发送请求之前，拦截重复请求(即当前正在进行的相同请求)
                // let requestToken = getRequestIdentify(requestParams, true)

                let requestToken = this.createCancelToken(requestParams);

                this.abort(serveName)(requestToken);
                // removePending(requestData, true)

                config.cancelToken = new request.CancelToken(
                    (cancleFn: any) => {
                        Reflect.set(this.cancelList, requestToken, [
                            cancleFn,
                            serveName
                        ]);
                    }
                );

                const {
                    start,
                    resolve,
                    reject,
                    finally: hooksFinally
                } = this.hooks!;

                return new Promise((resolvep, rejectp) => {
                    // 生成时间戳
                    const timestamp = `${new Date().getTime()}`;
                    if (start) {
                        start(serveName, timestamp);
                    }
                    request({
                        ...config,
                        ...requestParams
                    })
                        .then((res: any) => {
                            if (this.validate(res, serveName)) {
                                // 请求成功 删除取消函数
                                Reflect.deleteProperty(
                                    this.cancelList,
                                    requestToken
                                );
                                if (resolve) {
                                    resolve(serveName, timestamp);
                                }
                                resolvep(res);
                            } else {
                                rejectp({
                                    error: "api-manage validate false",
                                    response: res
                                });
                            }
                        })
                        .catch(rejectp)
                        .finally(() => {
                            if (hooksFinally) {
                                hooksFinally(serveName, timestamp);
                            }
                        });
                });
            };
        };

        this.methodAction = (["get", "post", "delete", "put"] as string[])
            .filter(type => typeof request[type] === "function")
            .reduce(
                (r, type) => ({
                    ...r,
                    [type]: public2.bind(this, type)
                }),
                {
                    ...otherCustomizeMethod
                }
            );
    }

    constructor(options: Options) {
        const { list, matchStr, replaceStr, hooks } = {
            ...defaultOptions,
            ...options
        };

        this.validate = options.validate!;

        this.hooks = hooks;

        this.createMethodService(options.customize, axios);

        const apiList = utils.flatApi(list);

        this.serveMap = Object.entries(apiList).reduce(
            (result: any, [apiName, { path, method }]: [string, any]) => {
                if (typeof this.methodAction[method] !== "function") {
                    return result;
                }

                const serveName: string = utils.replaceFnName(
                    apiName,
                    matchStr,
                    replaceStr
                );

                Reflect.set(this.enumName, apiName, serveName);
                Reflect.set(this.enumName, serveName, apiName);

                const serveFn = this.methodAction[method](path, serveName);

                // 设置请求函数名称
                Reflect.defineProperty(serveFn, "name", {
                    value: serveName
                });

                Object.setPrototypeOf(serveFn, {
                    resolve: (data = {}, tplData = {}) => {
                        const splitPath = URI(utils.template(path, tplData));

                        const dealURI: any =
                            method === "get"
                                ? splitPath.addQuery(data)
                                : splitPath;

                        const {
                            hostname,
                            port,
                            protocol,
                            query
                        } = dealURI._parts;

                        return {
                            url: path,
                            name: serveName,
                            method: method,
                            hostname,
                            port,
                            protocol,
                            query,
                            requestUrl: dealURI.toString()
                        };
                    },
                    abort: (key: string) => {
                        if (this.cancelList[key]) {
                            this.cancelList[key][0]("取消重复请求");
                        }
                        Reflect.deleteProperty(this.cancelList, key);
                    },

                    abort2: (serveName: string) => {
                        Object.values(this.cancelList).forEach(
                            ([cancelFn, oldServeName]) => {
                                if (oldServeName === serveName) {
                                    cancelFn("取消重复请求");
                                }
                            }
                        );
                    },
                    bind: Function.prototype.bind,
                    call: Function.prototype.call,
                    apply: Function.prototype.apply
                });

                return {
                    ...result,
                    [serveName]: {
                        serveFn,
                        path,
                        method
                    }
                };
            },
            {}
        );
    }

    resolve(serveName: string) {
        const { serveFn } = this.serveMap[serveName];
        if (serveFn) {
            return serveFn.resolve;
        }
        return () => null;
    }

    abort(serveName: string) {
        const { serveFn } = this.serveMap[serveName];
        if (serveFn) {
            return serveFn.abort;
        }
        return () => null;
    }

    getService(): Record<string, any> {
        return Object.entries(this.serveMap).reduce(
            (r, [k, items]) => ({
                ...r,
                [k]: items.serveFn
            }),
            {}
        );
    }

    createCancelToken(config: any) {
        const requestParams = config;

        // 发送请求之前，拦截重复请求(即当前正在进行的相同请求)
        return getRequestIdentify(requestParams, true);
    }
}

/**
 * config: 请求数据
 * isReuest: 请求拦截器中 config.url = '/users', 响应拦截器中 config.url = 'http://localhost:3000/users'，所以加上一个标识来计算请求的全路径
 */
const getRequestIdentify = (config: any, isReuest: boolean = false) => {
    let url = config.url;
    // if (isReuest) {
    //     url = config.baseURL + config.url.substring(1, config.url.length)
    // }
    return config.method === "get"
        ? encodeURIComponent(url + JSON.stringify(config.params))
        : encodeURIComponent(config.url + JSON.stringify(config.data));
};

export default ApiManage;
