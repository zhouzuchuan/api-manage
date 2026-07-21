import ApiManage, {
    ApiRequestContextByList,
    ApiFilesServiceMap,
    ApiList,
    CancelAdapterInjectedResult,
    ServeFnOptions,
    TemplateData,
    createAbortCancel,
    createAxiosCancel,
    defineApi,
} from "../src/index";

const userApi = {
    get: {
        apiGetUser: "/user/:id",
    },
    post: {
        apiCreateUser: "/user",
    },
} as const;

const otherApi = () =>
    ({
        get: {
            apiSearch: "/search",
        },
    }) as const;

const apiManage = new ApiManage<typeof userApi>({
    request: (options) => Promise.resolve(options),
    list: userApi,
});

const service = apiManage.getService();

service.serveGetUser<{ name: string }>({ id: 1 }).then((user) => {
    const name: string = user.name;
    return name;
});

service.serveCreateUser<boolean>({ name: "Tom" }).then((result) => {
    const ok: boolean = result;
    return ok;
});

apiManage.abort("serveGetUser");
apiManage.resolve("serveGetUser");

// @ts-expect-error abort should only accept inferred serve names.
apiManage.abort("serveMissing");

// @ts-expect-error resolve should only accept inferred serve names.
apiManage.resolve("serveMissing");

type UserResultMap = {
    serveGetUser: ApiResponse<{ name: string; age: number }>;
};

type UserParamsMap = {
    serveGetUser: { id: number };
};

const mappedService = apiManage.getService<UserResultMap, UserParamsMap>();
mappedService.serveGetUser({ id: 1 }).then((user) => {
    const age: number = user.age;
    return age;
});

mappedService.serveGetUser({ id: 1 }, { isLimit: false }).then((res) => {
    const age: number = res.data.age;
    const code: number = res.code;
    return code;
});

// @ts-expect-error mapped params should use the serve name key.
mappedService.serveGetUser({ id: "1" });

type ApiResponse<T> = {
    code: number;
    message: string;
    data: T;
};

type OcrResult = {
    status: "pending" | "success" | "fail";
    text?: string;
};

type OcrParams = {
    taskId: string;
};

const typedApi = {
    post: {
        apiBase_GetOcrResult: defineApi<ApiResponse<OcrResult>, OcrParams>(
            "/ocr/result",
        ),
    },
} as const;

const typedApiManage = new ApiManage<typeof typedApi>({
    request: (url, method, context) => {
        const requestUrl: string = url;
        const requestMethod: "post" = method;

        if (context.serveName === "serveBase_GetOcrResult") {
            const taskId: string = context.params?.taskId || "";
            // @ts-expect-error context params should follow serveName.
            const id: string | undefined = context.params?.id;
            void taskId;
            void id;
        }

        void requestUrl;
        void requestMethod;
        return Promise.resolve(context);
    },
    list: typedApi,
});

const typedService = typedApiManage.getService();
typedService.serveBase_GetOcrResult({ taskId: "task-1" }).then((result) => {
    const status: OcrResult["status"] = result.status;
    return status;
});

typedService
    .serveBase_GetOcrResult({ taskId: "task-1" }, { isLimit: true })
    .then((result) => {
        const status: OcrResult["status"] = result.status;
        return status;
    });

typedService
    .serveBase_GetOcrResult({ taskId: "task-1" }, { isLimit: false })
    .then((result) => {
        const status: OcrResult["status"] = result.data.status;
        const code: number = result.code;
        return code;
    });

typedService
    .serveBase_GetOcrResult<number>({ taskId: "task-1" })
    .then((value) => {
        const count: number = value;
        return count;
    });

typedService.serveBase_GetOcrResult.resolve({ taskId: "task-1" });

const typedRequestContext: ApiRequestContextByList<typeof typedApi> = {
    serveName: "serveBase_GetOcrResult",
    params: { taskId: "task-1" },
    controlOptions: {
        isLimit: true,
    },
};

const invalidTypedRequestContext: ApiRequestContextByList<typeof typedApi> = {
    serveName: "serveBase_GetOcrResult",
    // @ts-expect-error context params should follow defineApi params.
    params: { id: "task-1" },
    controlOptions: {},
};

// @ts-expect-error resolve params should follow defineApi params.
typedService.serveBase_GetOcrResult.resolve({ id: "task-1" });

// @ts-expect-error defineApi params should be inferred by serve function.
typedService.serveBase_GetOcrResult({ id: "task-1" });

type RetResponse<T> = {
    code: number;
    ret: T;
};

const customLimitApi = {
    post: {
        apiCustom_GetOcrResult: defineApi<
            RetResponse<OcrResult>,
            OcrParams,
            OcrResult
        >("/ocr/custom-result"),
    },
} as const;

const customLimitService = new ApiManage<typeof customLimitApi>({
    request: (options) => Promise.resolve(options),
    list: customLimitApi,
}).getService();

customLimitService
    .serveCustom_GetOcrResult({ taskId: "task-1" })
    .then((result) => {
        const status: OcrResult["status"] = result.status;
        return status;
    });

customLimitService
    .serveCustom_GetOcrResult({ taskId: "task-1" }, { isLimit: false })
    .then((result) => {
        const status: OcrResult["status"] = result.ret.status;
        return status;
    });

type TypedServices = ApiFilesServiceMap<{
    typedApi: typeof typedApi;
}>;

const typedServices = {} as TypedServices;
typedServices.serveBase_GetOcrResult({ taskId: "task-2" }).then((result) => {
    const status: OcrResult["status"] = result.status;
    return status;
});

// @ts-expect-error apiGetUser should become serveGetUser, not apiGetUser.
service.apiGetUser();

type Services = ApiFilesServiceMap<{
    userApi: typeof userApi;
    otherApi: typeof otherApi;
}>;

const services = {} as Services;
services.serveGetUser<{ id: number }>().then((value) => value.id);
services.serveSearch<string>({ keyword: "a" }).then((value) => value.toUpperCase());

const hooksApiManage = new ApiManage<typeof userApi>({
    request: (requestOptions) => Promise.resolve(requestOptions),
    list: userApi,
    hooks: {
        start: (serveName) => {
            const name: "serveGetUser" | "serveCreateUser" | undefined =
                serveName;
            void name;
        },
    },
    validate: (response, serveName) => {
        const name: "serveGetUser" | "serveCreateUser" | undefined =
            serveName;
        void response;
        return Boolean(name || true);
    },
    limitResponse: (response, serveName) => {
        const name: "serveGetUser" | "serveCreateUser" | undefined =
            serveName;
        void name;
        return response;
    },
});

const requestApiManage = new ApiManage<
    typeof userApi,
    {},
    unknown,
    "api",
    "request"
>({
    request: (requestOptions) => Promise.resolve(requestOptions),
    list: userApi,
    matchStr: "api",
    replaceStr: "request",
});

const requestService = requestApiManage.getService();
requestService.requestGetUser();
requestApiManage.abort("requestGetUser");

// @ts-expect-error custom replaceStr should change service names.
requestService.serveGetUser();

// @ts-expect-error abort should use custom service names.
requestApiManage.abort("serveGetUser");

const options: ServeFnOptions = {
    tplData: { id: 1 },
    cancelParams: { open: true, isCalcFullPath: false },
    isLimit: false,
};

const invalidDefaultOptions: ServeFnOptions = {
    // @ts-expect-error undeclared options should be rejected by default.
    customConfig: "legacy",
};

type ApiRequestOptions = {
    responseType?: "json" | "blob" | "arraybuffer";
    timeout?: number;
};

type ServicesWithOptions = ApiFilesServiceMap<
    {
        userApi: typeof userApi;
        otherApi: typeof otherApi;
    },
    unknown,
    {},
    {},
    ApiRequestOptions
>;

const servicesWithOptions = {} as ServicesWithOptions;
servicesWithOptions.serveGetUser(
    { id: 1 },
    {
        headers: {
            jsonContent: "true",
            noEncrypt: true,
        },
        responseType: "json",
        timeout: 1000,
        cancelParams: {
            includeConfigKeys: ["headers", "responseType", "timeout"],
        },
        isLimit: false,
    },
);

servicesWithOptions.serveGetUser({ id: 1 }, {
    // @ts-expect-error options should only accept declared extra keys.
    header: {
        jsonContent: "true",
    },
});

servicesWithOptions.serveGetUser({ id: 1 }, {
    // @ts-expect-error built-in option key should be isLimit.
    islimit: false,
});

servicesWithOptions.serveGetUser({ id: 1 }, {
    // @ts-expect-error timeoutMs is not declared in ApiRequestOptions.
    timeoutMs: 1000,
});

servicesWithOptions.serveGetUser({ id: 1 }, {
    cancelParams: {
        // @ts-expect-error includeConfigKeys should use declared extra keys.
        includeConfigKeys: ["header"],
    },
});

service.serveGetUser({ id: 1 }, { headers: { jsonContent: true } });

service.serveGetUser({ id: 1 }, {
    cancelParams: {
        includeConfigKeys: ["headers"],
    },
});

service.serveGetUser({ id: 1 }, {
    // @ts-expect-error business options should still be declared before use.
    noEncrypt: true,
});

const optionsWithHeaders: ServeFnOptions<ApiRequestOptions> = {
    headers: {
        jsonContent: true,
        noEncrypt: true,
        token: "demo-token",
    },
    responseType: "blob",
    timeout: 1000,
    cancelParams: {
        open: true,
        isCalcFullPath: false,
        includeConfigKeys: ["headers", "responseType", "timeout"],
    },
    isLimit: false,
};

const bindApiList = ApiManage.bindApi([userApi, otherApi]);
const bindApiService = new ApiManage<typeof bindApiList, ApiRequestOptions>({
    request: (requestOptions) => Promise.resolve(requestOptions),
    list: bindApiList,
}).getService();

bindApiService.serveGetUser(
    { id: 1 },
    {
        headers: { jsonContent: true },
        responseType: "json",
        timeout: 1000,
        cancelParams: {
            includeConfigKeys: ["headers"],
        },
    },
);

bindApiService.serveSearch<string>({ keyword: "a" }).then((value) => {
    const result: string = value.toUpperCase();
    return result;
});

const createApiManage = ApiManage.create<typeof userApi, ApiRequestOptions>()({
    request: (url, method, context, extraOptions) => {
        const headers = extraOptions?.headers;
        const timeout = extraOptions?.timeout;
        const isLimit = context.controlOptions.isLimit;
        const tplData = context.controlOptions.tplData;
        const cancelParams = context.controlOptions.cancelParams;
        cancelParams?.includeConfigKeys?.includes("timeout");
        // @ts-expect-error api-manage control options should stay on context.
        const extraIsLimit = extraOptions?.isLimit;
        // @ts-expect-error no cancel adapter means no injected cancelToken.
        const cancelToken = extraOptions?.cancelToken;
        void url;
        void method;
        void headers;
        void isLimit;
        void tplData;
        void extraIsLimit;
        void cancelToken;
        return Promise.resolve(timeout);
    },
    list: userApi,
});

const directCreateApiManage = ApiManage.create({
    request: (url, method, context, extraOptions) => {
        void url;
        void method;
        void context;
        return Promise.resolve(extraOptions);
    },
    list: userApi,
});

const createService = createApiManage.getService();
createService.serveGetUser(
    { id: 1 },
    {
        headers: { jsonContent: true },
        timeout: 1000,
        cancelParams: {
            includeConfigKeys: ["headers", "timeout"],
        },
    },
);

createService.serveGetUser({ id: 1 }, {
    // @ts-expect-error cancel adapter fields should not be caller-provided.
    cancelToken: "token",
});

type RequestResponse = {
    data: {
        code: number;
        message: string;
    };
    headers: Record<string, string>;
};

const requestResultApiManage = ApiManage.create<typeof userApi>()({
    request: () =>
        Promise.resolve({
            data: {
                code: 200,
                message: "ok",
            },
            headers: {
                requestId: "request-id",
            },
        }),
    validate: (res) => {
        const code: number = res.data.code;
        const requestId: string = res.headers.requestId;
        // @ts-expect-error request result should not expose missing fields.
        const missing = res.missing;
        void requestId;
        void missing;
        return code === 200;
    },
    limitResponse: (res) => {
        const message: string = res.data.message;
        const headers: Record<string, string> = res.headers;
        void headers;
        return message;
    },
    list: userApi,
});

const syncRequestResultApiManage = ApiManage.create<typeof userApi>()({
    request: (): RequestResponse => ({
        data: {
            code: 200,
            message: "ok",
        },
        headers: {
            requestId: "request-id",
        },
    }),
    validate: (res) => {
        const code: number = res.data.code;
        return code === 200;
    },
    limitResponse: (res) => {
        const requestId: string = res.headers.requestId;
        return requestId;
    },
    list: userApi,
});

const anyRequestResult: any = {};
const anyRequestResultApiManage = ApiManage.create<typeof userApi>()({
    request: () => anyRequestResult,
    validate: (res) => Boolean(res.missing.deep.value),
    limitResponse: (res) => res.missing.deep.value,
    list: userApi,
});

const createRequestNameApiManage = ApiManage.create<typeof userApi>()({
    request: (url, method, context, extraOptions) => {
        void url;
        void method;
        void context;
        return Promise.resolve(extraOptions);
    },
    list: userApi,
    matchStr: "api",
    replaceStr: "request",
});

const createRequestNameService = createRequestNameApiManage.getService();
createRequestNameService.requestGetUser({ id: 1 });
// @ts-expect-error replaceStr should rename serveGetUser to requestGetUser.
createRequestNameService.serveGetUser({ id: 1 });

const cancelVoidApiManage = ApiManage.create<
    typeof userApi,
    ApiRequestOptions
>()({
    request: (url, method, context, extraOptions) => {
        // @ts-expect-error cancel returns no extraOptions, so cancelToken is not injected.
        const cancelToken = extraOptions?.cancelToken;
        void url;
        void method;
        void context;
        return Promise.resolve(cancelToken);
    },
    cancel: () => undefined,
    list: userApi,
});

const cancelOnlyApiManage = ApiManage.create<
    typeof userApi,
    ApiRequestOptions
>()({
    request: (url, method, context, extraOptions) => {
        // @ts-expect-error cancel returns no extraOptions, so cancelToken is not injected.
        const cancelToken = extraOptions?.cancelToken;
        void url;
        void method;
        void context;
        return Promise.resolve(cancelToken);
    },
    cancel: () => ({
        cancel: (message?: any) => void message,
    }),
    list: userApi,
});

const cancelApiManage = new ApiManage<typeof userApi, ApiRequestOptions>({
    request: (url, method, context, extraOptions) => {
        const headers = extraOptions?.headers;
        const timeout = extraOptions?.timeout;
        void url;
        void method;
        void context;
        void timeout;
        return Promise.resolve(headers);
    },
    cancel: (
        url,
        method,
        context,
        extraOptions,
    ): {
        cancel: (message?: any) => void;
        extraOptions?: Partial<ApiRequestOptions>;
    } => {
        const headers = extraOptions?.headers;
        void url;
        void method;
        void context;
        void headers;

        return {
            cancel: (message?: any) => void message,
            extraOptions: {
                timeout: 1000,
                // @ts-expect-error cancel extraOptions should use declared keys.
                timeoutMs: 1000,
            },
        };
    },
    list: userApi,
});

type MockCancelToken = {
    canceled?: boolean;
};

const axiosCancelApiManage = new ApiManage<
    typeof userApi,
    ApiRequestOptions & { cancelToken?: MockCancelToken }
>({
    request: (url, method, context, extraOptions) => {
        const cancelToken = extraOptions?.cancelToken;
        void url;
        void method;
        void context;
        return Promise.resolve(cancelToken);
    },
    cancel: createAxiosCancel({
        CancelToken: class {
            canceled?: boolean;

            constructor(fn: (cancel: (message?: any) => void) => void) {
                fn(() => {
                    this.canceled = true;
                });
            }
        },
    }),
    list: userApi,
});

const createAxiosCancelApiManage = ApiManage.create<
    typeof userApi,
    ApiRequestOptions
>()({
    request: (url, method, context, extraOptions) => {
        const headers = extraOptions?.headers;
        const timeout = extraOptions?.timeout;
        const cancelToken = extraOptions?.cancelToken;
        const isLimit = context.controlOptions.isLimit;
        // @ts-expect-error api-manage control options should stay on context.
        const extraIsLimit = extraOptions?.isLimit;
        void url;
        void method;
        void headers;
        void timeout;
        void isLimit;
        void extraIsLimit;
        return Promise.resolve(cancelToken);
    },
    cancel: createAxiosCancel({
        CancelToken: class {
            canceled?: boolean;

            constructor(fn: (cancel: (message?: any) => void) => void) {
                fn(() => {
                    this.canceled = true;
                });
            }
        },
    }),
    list: userApi,
});

const createAxiosCancelService = createAxiosCancelApiManage.getService();
createAxiosCancelService.serveGetUser({ id: 1 }, {
    headers: { jsonContent: true },
    timeout: 1000,
});

createAxiosCancelService.serveGetUser({ id: 1 }, {
    // @ts-expect-error cancelToken is only available inside request extraOptions.
    cancelToken: {},
});

type MockSignal = {
    aborted?: boolean;
};

const abortCancelApiManage = new ApiManage<
    typeof userApi,
    ApiRequestOptions & { signal?: MockSignal }
>({
    request: (url, method, context, extraOptions) => {
        const signal = extraOptions?.signal;
        void url;
        void method;
        void context;
        return Promise.resolve(signal);
    },
    cancel: createAbortCancel(
        class {
            signal: MockSignal = {};

            abort() {
                this.signal.aborted = true;
            }
        },
    ),
    list: userApi,
});

const createAbortCancelApiManage = ApiManage.create<
    typeof userApi,
    ApiRequestOptions
>()({
    request: (url, method, context, extraOptions) => {
        const headers = extraOptions?.headers;
        const timeout = extraOptions?.timeout;
        const signal = extraOptions?.signal;
        void url;
        void method;
        void context;
        void headers;
        void timeout;
        return Promise.resolve(signal);
    },
    cancel: createAbortCancel(
        class {
            signal: MockSignal = {};

            abort() {
                this.signal.aborted = true;
            }
        },
    ),
    list: userApi,
});

const createAbortCancelService = createAbortCancelApiManage.getService();
createAbortCancelService.serveGetUser({ id: 1 }, {
    headers: { jsonContent: true },
    timeout: 1000,
});

createAbortCancelService.serveGetUser({ id: 1 }, {
    // @ts-expect-error signal is only available inside request extraOptions.
    signal: {},
});

type MockTask = {
    abort: (message?: any) => void;
};

const customCancelApiManage = ApiManage.create<
    typeof userApi,
    ApiRequestOptions
>()({
    request: (url, method, context, extraOptions) => {
        const task = extraOptions?.task;
        void url;
        void method;
        void context;
        return Promise.resolve(task);
    },
    cancel: () => {
        const task: MockTask = {
            abort: (message?: any) => void message,
        };

        return {
            cancel: task.abort,
            extraOptions: { task },
        };
    },
    list: userApi,
});

const customCancelService = customCancelApiManage.getService();
customCancelService.serveGetUser({ id: 1 }, {
    timeout: 1000,
});

customCancelService.serveGetUser({ id: 1 }, {
    // @ts-expect-error task is only available inside request extraOptions.
    task: {
        abort: () => undefined,
    },
});

const reusableCustomCancel = (): CancelAdapterInjectedResult<{
    task?: MockTask;
}> => {
    const task: MockTask = {
        abort: (message?: any) => void message,
    };

    return {
        cancel: task.abort,
        extraOptions: { task },
    };
};

const reusableCustomCancelApiManage = ApiManage.create<
    typeof userApi,
    ApiRequestOptions
>()({
    request: (url, method, context, extraOptions) => {
        const task = extraOptions?.task;
        void url;
        void method;
        void context;
        return Promise.resolve(task);
    },
    cancel: reusableCustomCancel,
    list: userApi,
});

const reusableCustomCancelService = reusableCustomCancelApiManage.getService();
reusableCustomCancelService.serveGetUser({ id: 1 }, {
    timeout: 1000,
});

reusableCustomCancelService.serveGetUser({ id: 1 }, {
    // @ts-expect-error reusable cancel task is only available inside request extraOptions.
    task: {
        abort: () => undefined,
    },
});

const defaultAxiosCancelApiManage = new ApiManage<typeof userApi>({
    request: (url, method, context, extraOptions) => {
        void url;
        void method;
        void context;
        return Promise.resolve(extraOptions);
    },
    cancel: createAxiosCancel({
        CancelToken: class {
            constructor(fn: (cancel: (message?: any) => void) => void) {
                fn(() => undefined);
            }
        },
    }),
    list: userApi,
});

const defaultAbortCancelApiManage = new ApiManage<typeof userApi>({
    request: (url, method, context, extraOptions) => {
        void url;
        void method;
        void context;
        return Promise.resolve(extraOptions);
    },
    cancel: createAbortCancel(
        class {
            signal: MockSignal = {};

            abort() {
                this.signal.aborted = true;
            }
        },
    ),
    list: userApi,
});

// @ts-expect-error bindApi should preserve service names.
bindApiService.serveMissing();

const boundTypedApiList = ApiManage.bindApi([typedApi]);
const boundTypedService = new ApiManage<typeof boundTypedApiList>({
    request: (requestOptions) => Promise.resolve(requestOptions),
    list: boundTypedApiList,
}).getService();

boundTypedService
    .serveBase_GetOcrResult({ taskId: "task-2" })
    .then((result) => {
        const status: OcrResult["status"] = result.status;
        return status;
    });

// @ts-expect-error bindApi should preserve defineApi params.
boundTypedService.serveBase_GetOcrResult({ id: "task-2" });

const tplObject: TemplateData = { id: 1, name: "tom" };
const tplArray: TemplateData = [1, "tom"];
const tplValue: TemplateData = 1;

// @ts-expect-error tplData should only contain string or number values.
const invalidTplObject: TemplateData = { id: { nested: 1 } };

// @ts-expect-error boolean values are not valid path template values.
const invalidTplValue: TemplateData = true;

const list: ApiList = userApi;
void options;
void invalidDefaultOptions;
void optionsWithHeaders;
void hooksApiManage;
void requestService;
void typedRequestContext;
void invalidTypedRequestContext;
void bindApiList;
void bindApiService;
void createApiManage;
void createService;
void directCreateApiManage;
void requestResultApiManage;
void syncRequestResultApiManage;
void anyRequestResultApiManage;
void createRequestNameApiManage;
void createRequestNameService;
void cancelVoidApiManage;
void cancelOnlyApiManage;
void cancelApiManage;
void axiosCancelApiManage;
void createAxiosCancelApiManage;
void createAxiosCancelService;
void abortCancelApiManage;
void createAbortCancelApiManage;
void createAbortCancelService;
void customCancelApiManage;
void customCancelService;
void reusableCustomCancel;
void reusableCustomCancelApiManage;
void reusableCustomCancelService;
void defaultAxiosCancelApiManage;
void defaultAbortCancelApiManage;
void boundTypedApiList;
void boundTypedService;
void tplObject;
void tplArray;
void tplValue;
void list;
