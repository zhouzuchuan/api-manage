import ApiManage, {
    ApiFilesServiceMap,
    ApiList,
    ServeFnOptions,
    TemplateData,
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
    request: (options) => Promise.resolve(options),
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

const options: ServeFnOptions = {
    tplData: { id: 1 },
    cancelParams: { open: true, isCalcFullPath: false },
    isLimit: false,
};

const tplObject: TemplateData = { id: 1, name: "tom" };
const tplArray: TemplateData = [1, "tom"];
const tplValue: TemplateData = 1;

// @ts-expect-error tplData should only contain string or number values.
const invalidTplObject: TemplateData = { id: { nested: 1 } };

// @ts-expect-error boolean values are not valid path template values.
const invalidTplValue: TemplateData = true;

const list: ApiList = userApi;
void options;
void tplObject;
void tplArray;
void tplValue;
void list;
