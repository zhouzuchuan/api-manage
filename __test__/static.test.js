import path from "path";
import ts from "typescript";
import ApiManage from "../lib";

const getExtraOptionsCompletionNames = (source) => {
    const cwd = process.cwd();
    const fileName = path.join(cwd, "virtual-completion.ts");
    const marker = "/*MARK*/";
    const position = source.indexOf(marker);
    const cleanSource = source.replace(marker, "");
    const compilerOptions = {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.CommonJS,
        strict: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        skipLibCheck: true,
    };
    const serviceHost = {
        getScriptFileNames: () => [fileName, path.join(cwd, "src/index.ts")],
        getScriptVersion: () => "1",
        getScriptSnapshot: (name) => {
            if (name === fileName) {
                return ts.ScriptSnapshot.fromString(cleanSource);
            }

            if (ts.sys.fileExists(name)) {
                return ts.ScriptSnapshot.fromString(ts.sys.readFile(name));
            }

            return undefined;
        },
        getCurrentDirectory: () => cwd,
        getCompilationSettings: () => compilerOptions,
        getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
        fileExists: ts.sys.fileExists,
        readFile: ts.sys.readFile,
        readDirectory: ts.sys.readDirectory,
        directoryExists: ts.sys.directoryExists,
        getDirectories: ts.sys.getDirectories,
    };
    const service = ts.createLanguageService(serviceHost);

    return (
        service
            .getCompletionsAtPosition(fileName, position, {})
            ?.entries.map((entry) => entry.name) || []
    );
};

describe("测试 create cancel extraOptions 类型补全 -------->", () => {
    const sourcePrefix = `
import ApiManage, { createAbortCancel, createAxiosCancel, defineApi } from "./src/index";

const userApi = {
    get: {
        apiGetUser: defineApi<{ id: number }, { id: number }>("/user"),
    },
};
`;

    it("createAxiosCancel 直写时提示 cancelToken", () => {
        const names = getExtraOptionsCompletionNames(`
${sourcePrefix}
const axiosLike = {
    CancelToken: class {
        constructor(fn: (cancel: (message?: any) => void) => void) {
            fn(() => undefined);
        }
    },
};

ApiManage.create<typeof userApi>()({
    request: (url, method, context, extraOptions) => {
        extraOptions?./*MARK*/
        return Promise.resolve();
    },
    cancel: createAxiosCancel(axiosLike),
    list: userApi,
});
`);

        expect(names).toContain("cancelToken");
        expect(names).toContain("headers");
    });

    it("createAbortCancel 直写时提示 signal", () => {
        const names = getExtraOptionsCompletionNames(`
${sourcePrefix}
ApiManage.create<typeof userApi>()({
    request: (url, method, context, extraOptions) => {
        extraOptions?./*MARK*/
        return Promise.resolve();
    },
    cancel: createAbortCancel(
        class {
            signal = {};

            abort() {}
        }
    ),
    list: userApi,
});
`);

        expect(names).toContain("signal");
        expect(names).toContain("headers");
    });

    it("request context.controlOptions 提示 serve 控制参数", () => {
        const names = getExtraOptionsCompletionNames(`
${sourcePrefix}
ApiManage.create<typeof userApi>()({
    request: (url, method, context, extraOptions) => {
        context.controlOptions./*MARK*/
        return Promise.resolve(extraOptions);
    },
    list: userApi,
});
`);

        expect(names).toContain("isLimit");
        expect(names).toContain("tplData");
        expect(names).toContain("cancelParams");
    });

    it("validate res 从 request 返回值推导补全", () => {
        const names = getExtraOptionsCompletionNames(`
${sourcePrefix}
ApiManage.create<typeof userApi>()({
    request: () =>
        Promise.resolve({
            data: {
                code: 200,
            },
            headers: {
                requestId: "request-id",
            },
        }),
    validate: (res) => {
        res./*MARK*/
        return true;
    },
    list: userApi,
});
`);

        expect(names).toContain("data");
        expect(names).toContain("headers");
    });

    it("limitResponse res 从 request 返回值推导补全", () => {
        const names = getExtraOptionsCompletionNames(`
${sourcePrefix}
ApiManage.create<typeof userApi>()({
    request: () => ({
        data: {
            code: 200,
        },
        headers: {
            requestId: "request-id",
        },
    }),
    limitResponse: (res) => {
        res./*MARK*/
        return res.data;
    },
    list: userApi,
});
`);

        expect(names).toContain("data");
        expect(names).toContain("headers");
    });
});

describe("测试 static bindApi -------->", () => {
    const apiIndex = {
        get: {
            apiIndex_GetList: `/index/1`,
        },
        post: {
            apiIndex_queryList: `/index/2`,
        },
    };

    const apiIndex2 = (server) => ({
        get: {
            apiIndex_GetList2: `${server}/index/1`,
        },
        post: {
            apiIndex_queryList2: `${server}/index/2`,
        },
    });

    const apiHome = {
        get: {
            apiHome_GetList: `/home/1`,
        },
        post: {
            apiHome_queryList: `/home/2`,
            apiHome_queryData: `/home/3`,
        },
    };

    const apiHome2 = (server) => ({
        get: {
            apiHome_GetList2: `${server}/home/1`,
        },
        post: {
            apiHome_queryList2: `${server}/home/2`,
            apiHome_queryData2: `${server}/home/3`,
        },
    });

    it("api清单 单个（函数）", () => {
        expect(ApiManage.bindApi(apiIndex2("/api"))).toEqual({
            get: {
                apiIndex_GetList2: `/api/index/1`,
            },
            post: {
                apiIndex_queryList2: `/api/index/2`,
            },
        });
    });

    it("api清单 单个（对象）", () => {
        expect(ApiManage.bindApi(apiHome)).toEqual({
            get: {
                apiHome_GetList: `/home/1`,
            },
            post: {
                apiHome_queryList: `/home/2`,
                apiHome_queryData: `/home/3`,
            },
        });
    });

    it("api清单 多个（函数）", () => {
        expect(ApiManage.bindApi([apiHome2(""), apiIndex2("/api")])).toEqual({
            get: {
                apiIndex_GetList2: `/api/index/1`,
                apiHome_GetList2: `/home/1`,
            },
            post: {
                apiIndex_queryList2: `/api/index/2`,
                apiHome_queryList2: `/home/2`,
                apiHome_queryData2: `/home/3`,
            },
        });
    });

    it("api清单 多个（对象）", () => {
        expect(ApiManage.bindApi([apiHome, apiIndex])).toEqual({
            get: {
                apiIndex_GetList: `/index/1`,
                apiHome_GetList: `/home/1`,
            },
            post: {
                apiIndex_queryList: `/index/2`,
                apiHome_queryList: `/home/2`,
                apiHome_queryData: `/home/3`,
            },
        });
    });

    it("api清单 多个（函数、对象）", () => {
        expect(ApiManage.bindApi([apiHome, apiIndex2("/api")])).toEqual({
            get: {
                apiIndex_GetList2: `/api/index/1`,
                apiHome_GetList: `/home/1`,
            },
            post: {
                apiIndex_queryList2: `/api/index/2`,
                apiHome_queryList: `/home/2`,
                apiHome_queryData: `/home/3`,
            },
        });
    });
});

describe("测试 static flatApi -------->", () => {
    const apiList = {
        get: {
            apiIndex_GetList: `/index/1`,
            apiHome_GetList: `/home/1`,
        },
        post: {
            apiIndex_queryList: `/index/2`,
            apiHome_queryList: `/home/2`,
            apiHome_queryData: `/home/3`,
        },
    };

    it("数据重组", () => {
        expect(ApiManage.flatApi(apiList)).toEqual({
            apiIndex_GetList: {
                path: "/index/1",
                method: "get",
            },
            apiHome_GetList: {
                path: "/home/1",
                method: "get",
            },
            apiIndex_queryList: {
                path: "/index/2",
                method: "post",
            },
            apiHome_queryList: {
                path: "/home/2",
                method: "post",
            },
            apiHome_queryData: {
                path: "/home/3",
                method: "post",
            },
        });
    });
});

describe("测试 static template -------->", () => {
    const url = "/api/manage/:0/:1/serve/:2";
    const resultUrl = "/api/manage/a/b/serve/c";

    it("数组传参", () => {
        expect(ApiManage.template(url, ["a", "b", "c"])).toEqual(resultUrl);
    });

    it("对象传参", () => {
        expect(ApiManage.template(url, { 0: "a", 1: "b", 2: "c" })).toEqual(
            resultUrl
        );
    });

    it("直接赋值传参", () => {
        expect(ApiManage.template("/a/b/:c", 123)).toEqual("/a/b/123");
    });
});

describe("测试 static replaceFnName -------->", () => {
    const a = "apiGetList";
    const b = "serveGetList";

    it("所有参数都有", () => {
        expect(ApiManage.replaceFnName(a, "api", "serve")).toEqual(b);
    });

    it("没有传替换后的字符", () => {
        expect(ApiManage.replaceFnName(a, "api", "")).toEqual("GetList");
    });

    it("没有传被替换字符", () => {
        expect(ApiManage.replaceFnName(a, "", "serve")).toEqual(a);
    });

    it("字符串首位没有 需要替换的字符串", () => {
        expect(ApiManage.replaceFnName(a, "222", "333")).toEqual(a);
    });
});

describe("测试 static createCancelToken -------->", () => {
    const options = {
        url: "/api/a/b",
        method: "get",
        context: {
            serveName: "serveGetList",
            params: {
                b: 1,
            },
        },
    };

    it("全路径计算", () => {
        expect(ApiManage.createCancelToken(options)).toEqual(
            encodeURIComponent(
                '/api/a/b' + JSON.stringify({ method: "get", params: { b: 1 } })
            )
        );
        expect(
            ApiManage.createCancelToken({
                ...options,
                method: "post",
            })
        ).toEqual(
            encodeURIComponent(
                '/api/a/b' + JSON.stringify({ method: "post", params: { b: 1 } })
            )
        );
    });

    it("非全路径计算", () => {
        expect(ApiManage.createCancelToken(options, false)).toEqual(
            encodeURIComponent(
                '/api/a/b' + JSON.stringify({ method: "get", params: { b: 1 } })
            )
        );
    });

    it("按需把请求配置加入 token", () => {
        expect(
            ApiManage.createCancelToken({
                ...options,
                extraOptions: { headers: { jsonContent: true } },
            })
        ).toEqual(
            encodeURIComponent(
                '/api/a/b' + JSON.stringify({ method: "get", params: { b: 1 } })
            )
        );

        expect(
            ApiManage.createCancelToken(
                {
                    ...options,
                    extraOptions: { headers: { jsonContent: true } },
                },
                { includeConfigKeys: ["headers"] }
            )
        ).toEqual(
            encodeURIComponent(
                '/api/a/b' +
                    JSON.stringify({
                        method: "get",
                        params: { b: 1 },
                        headers: { jsonContent: true },
                    })
            )
        );
    });
});
