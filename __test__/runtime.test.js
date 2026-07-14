import ApiManage, { defineApi } from "../src/index";

const createDeferredRequest = () => {
    const calls = [];
    const pending = [];

    const request = jest.fn((options) => {
        calls.push(options);
        return new Promise((resolve, reject) => {
            pending.push({ options, resolve, reject });
        });
    });

    return { calls, pending, request };
};

describe("runtime request pipeline", () => {
    it("maps get params, post data, tplData, config, and async limitResponse", () => {
        const request = jest.fn((options) =>
            Promise.resolve({ data: { ret: options }, raw: true }),
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
            params: { keyword: "abc" },
            headers: { token: "t" },
        }).then(() =>
            expect(service.serveCreateUser({ name: "Tom" })).resolves.toMatchObject({
                method: "post",
                url: "/user",
                data: { name: "Tom" },
            }),
        );
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
        const request = jest.fn((options) =>
            Promise.resolve({ data: { ret: options } }),
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
                data: { userId: 1 },
                tplData: { id: 9 },
                serveName: "runtimeUser",
                config: { headers: { noEncrypt: true } },
            }),
        ).resolves.toMatchObject({
            method: "post",
            url: "/runtime/9",
            data: { userId: 1 },
            headers: { noEncrypt: true },
        });
    });

    it("supports object api definitions created by defineApi", () => {
        const request = jest.fn((options) => Promise.resolve(options));
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
            data: { retry: true },
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
        const request = jest.fn((options) => {
            if (options.cancelToken.reason) {
                return Promise.reject(options.cancelToken.reason);
            }
            return new Promise(() => undefined);
        });
        class RequestCancel {
            constructor(fn) {
                this.reason = null;
                fn((message) => {
                    const error = new Error(message);
                    error.message = message;
                    this.reason = error;
                });
            }
        }
        const apiManage = new ApiManage({
            request,
            CancelRequest: RequestCancel,
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
});
