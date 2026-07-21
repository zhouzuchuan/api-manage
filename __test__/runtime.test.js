import ApiManage, {
    createAbortCancel,
    createAxiosCancel,
    defineApi,
} from "../src/index";

const createDeferredRequest = () => {
    const calls = [];
    const pending = [];

    const request = jest.fn((url, method, context, extraOptions) => {
        const options = { url, method, context, extraOptions };
        calls.push(options);
        return new Promise((resolve, reject) => {
            pending.push({ options, resolve, reject });
        });
    });

    return { calls, pending, request };
};

describe("runtime request pipeline", () => {
    it("maps get params, post data, tplData, config, and async limitResponse", () => {
        const request = jest.fn((url, method, context, extraOptions) =>
            Promise.resolve({
                data: {
                    ret: {
                        ...extraOptions,
                        method,
                        url,
                        serveName: context.serveName,
                        [method === "get" ? "params" : "data"]: context.params,
                    },
                },
                raw: true,
            }),
        );
        const apiManage = new ApiManage({
            request,
            list: {
                get: { apiGetUser: "/user/:id" },
                post: { apiCreateUser: "/user" },
            },
            validate: () => Promise.resolve(true),
            limitResponse: (res) => Promise.resolve(res.data.ret),
        });
        const service = apiManage.getService();

        return expect(
            service.serveGetUser(
                { keyword: "abc" },
                { tplData: { id: 1 }, headers: { token: "t" } },
            ),
        ).resolves.toMatchObject({
            method: "get",
            url: "/user/1",
            serveName: "serveGetUser",
            params: { keyword: "abc" },
            headers: { token: "t" },
        }).then(() =>
            expect(service.serveCreateUser({ name: "Tom" })).resolves.toMatchObject({
                method: "post",
                url: "/user",
                serveName: "serveCreateUser",
                data: { name: "Tom" },
            }),
        );
    });

    it("creates an ApiManage instance through the static factory", () => {
        const request = jest.fn((url, method, context, extraOptions) =>
            Promise.resolve({
                url,
                method,
                serveName: context.serveName,
                params: context.params,
                extraOptions,
            }),
        );
        const apiManage = ApiManage.create({
            request,
            list: {
                get: { apiGetUser: "/user" },
            },
        });

        return expect(
            apiManage.getService().serveGetUser({ id: 1 }, { headers: { token: "t" } }),
        ).resolves.toMatchObject({
            url: "/user",
            method: "get",
            serveName: "serveGetUser",
            params: { id: 1 },
            extraOptions: {
                headers: { token: "t" },
            },
        });
    });

    it("rejects when async validate returns false", () => {
        const apiManage = new ApiManage({
            request: () => Promise.resolve({ data: { code: 500 } }),
            list: { get: { apiGetUser: "/user" } },
            validate: () => Promise.resolve(false),
        });

        return expect(apiManage.getService().serveGetUser()).rejects.toMatchObject({
            error: "api-manage validate false",
        });
    });

    it("runs reject hook but still rejects with original request error", () => {
        const error = new Error("boom");
        const rejectHook = jest.fn();
        const apiManage = new ApiManage({
            request: () => Promise.reject(error),
            list: { get: { apiGetUser: "/user" } },
            hooks: { reject: rejectHook },
        });

        return expect(apiManage.getService().serveGetUser())
            .rejects.toBe(error)
            .then(() => {
                expect(rejectHook).toHaveBeenCalledWith(
                    "serveGetUser",
                    expect.any(String),
                    error,
                );
            });
    });

    it("supports dynamic call with shared request pipeline", () => {
        const request = jest.fn((url, method, context, extraOptions) =>
            Promise.resolve({
                data: {
                    ret: {
                        ...extraOptions,
                        method,
                        url,
                        serveName: context.serveName,
                        params: context.params,
                    },
                },
            }),
        );
        const apiManage = new ApiManage({
            request,
            list: {},
            limitResponse: (res) => res.data.ret,
        });

        return expect(
            apiManage.call({
                url: "/runtime/:id",
                method: "post",
                params: { userId: 1 },
                tplData: { id: 9 },
                serveName: "runtimeUser",
                extraOptions: { headers: { noEncrypt: true } },
            }),
        ).resolves.toMatchObject({
            method: "post",
            url: "/runtime/9",
            serveName: "runtimeUser",
            params: { userId: 1 },
            headers: { noEncrypt: true },
        });
    });

    it("supports object api definitions created by defineApi", () => {
        const request = jest.fn((url, method, context) =>
            Promise.resolve({ method, url, params: context.params }),
        );
        const apiManage = new ApiManage({
            request,
            list: {
                post: {
                    apiGetOcrResult: defineApi("/ocr/:taskId/result"),
                },
            },
        });
        const service = apiManage.getService();

        expect(
            service.serveGetOcrResult.resolve({}, { taskId: "t1" }).requestUrl,
        ).toBe("/ocr/t1/result");

        return expect(
            service.serveGetOcrResult(
                { retry: true },
                { tplData: { taskId: "t1" } },
            ),
        ).resolves.toMatchObject({
            method: "post",
            url: "/ocr/t1/result",
            params: { retry: true },
        });
    });

    it("returns original response when isLimit is false", () => {
        const response = { data: { ret: 1 } };
        const apiManage = new ApiManage({
            request: () => Promise.resolve(response),
            list: { get: { apiGetUser: "/user" } },
            limitResponse: () => "limited",
        });

        return expect(
            apiManage.getService().serveGetUser(null, { isLimit: false }),
        ).resolves.toBe(response);
    });

    it("keeps resolve and abort on serve function properties", () => {
        const request = jest.fn((url, method, context, extraOptions) =>
            new Promise((resolve, reject) => {
                if (extraOptions.cancelToken.reason) {
                    reject(extraOptions.cancelToken.reason);
                    return;
                }
                extraOptions.cancelToken.reject = reject;
            }),
        );
        const apiManage = new ApiManage({
            request,
            cancel: () => {
                const cancelToken = {};
                return {
                    cancel: (message) => {
                        const error = new Error(message);
                        error.message = message;
                        cancelToken.reason = error;
                        cancelToken.reject?.(error);
                    },
                    extraOptions: { cancelToken },
                };
            },
            list: { get: { apiGetUser: "/user/:id" } },
        });
        const serveGetUser = apiManage.getService().serveGetUser;

        expect(serveGetUser.resolve({ page: 1 }, { id: 1 }).requestUrl).toBe(
            "/user/1?page=1",
        );

        const firstRequest = serveGetUser({ page: 1 }, { tplData: { id: 1 } });
        serveGetUser({ page: 1 }, { tplData: { id: 1 } });

        return expect(firstRequest)
            .rejects.toThrow("取消重复请求")
            .then(() => {
                expect(request).toHaveBeenCalledTimes(2);
            });
    });

    it("cleans cancel token after request failure", () => {
        const error = new Error("request failed");
        const apiManage = new ApiManage({
            request: () => Promise.reject(error),
            cancel: () => ({
                cancel: () => undefined,
            }),
            list: { get: { apiGetUser: "/user" } },
        });

        return expect(apiManage.getService().serveGetUser())
            .rejects.toBe(error)
            .then(() => {
                expect(apiManage.cancelList).toEqual({});
            });
    });

    it("can include selected config keys in cancel token", () => {
        const { request } = createDeferredRequest();
        const canceledMessages = [];
        const apiManage = new ApiManage({
            request,
            cancel: () => ({
                cancel: (message) => {
                    canceledMessages.push(message);
                },
            }),
            list: { post: { apiSaveUser: "/user" } },
        });
        const serveSaveUser = apiManage.getService().serveSaveUser;

        serveSaveUser(
            { id: 1 },
            {
                headers: { jsonContent: true },
                cancelParams: { includeConfigKeys: ["headers"] },
            },
        );
        serveSaveUser(
            { id: 1 },
            {
                headers: { jsonContent: false },
                cancelParams: { includeConfigKeys: ["headers"] },
            },
        );

        return Promise.resolve()
            .then(() => Promise.resolve())
            .then(() => {
                expect(request).toHaveBeenCalledTimes(2);
                expect(canceledMessages).toEqual([]);
            });
    });

    it("creates axios cancel adapter", () => {
        class CancelToken {
            constructor(executor) {
                executor((message) => {
                    const error = new Error(message);
                    this.reason = error;
                    this.reject?.(error);
                });
            }
        }

        const request = jest.fn((url, method, context, extraOptions) => {
            const { cancelToken } = extraOptions;
            return new Promise((resolve, reject) => {
                if (cancelToken.reason) {
                    reject(cancelToken.reason);
                    return;
                }
                cancelToken.reject = reject;
            });
        });
        const apiManage = new ApiManage({
            request,
            cancel: createAxiosCancel({ CancelToken }),
            list: { get: { apiGetUser: "/user" } },
        });
        const serveGetUser = apiManage.getService().serveGetUser;
        const firstRequest = serveGetUser({ id: 1 });

        serveGetUser({ id: 1 });

        return expect(firstRequest)
            .rejects.toThrow("取消重复请求")
            .then(() => {
                expect(request).toHaveBeenCalledTimes(2);
            });
    });

    it("creates abort controller cancel adapter", () => {
        const controllers = [];

        class AbortControllerMock {
            constructor() {
                this.signal = { aborted: false };
                controllers.push(this);
            }

            abort(reason) {
                this.signal.aborted = true;
                this.signal.reason = reason;
            }
        }

        const { request } = createDeferredRequest();
        const apiManage = new ApiManage({
            request,
            cancel: createAbortCancel(AbortControllerMock),
            list: { get: { apiGetUser: "/user" } },
        });
        const serveGetUser = apiManage.getService().serveGetUser;

        serveGetUser({ id: 1 });
        serveGetUser({ id: 1 });

        return Promise.resolve()
            .then(() => Promise.resolve())
            .then(() => {
                expect(request).toHaveBeenCalledTimes(2);
                expect(request.mock.calls[0][3].signal).toBe(
                    controllers[0].signal,
                );
                expect(controllers[0].signal).toMatchObject({
                    aborted: true,
                    reason: "取消重复请求",
                });
            });
    });

    it("creates default serve functions for arbitrary method names", () => {
        const request = jest.fn((url, method, context) =>
            Promise.resolve({ url, method, params: context.params }),
        );
        const apiManage = new ApiManage({
            request,
            list: { patch: { apiSaveUser: "/user" } },
        });
        const serveSaveUser = apiManage.getService().serveSaveUser;

        return expect(serveSaveUser({ id: 1 })).resolves.toMatchObject({
            method: "patch",
            url: "/user",
            params: { id: 1 },
        });
    });
});
