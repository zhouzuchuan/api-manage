import ApiManage from "../lib";

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
    const a = "apiGetList";
    const b = "serveGetList";

    const options = {
        url: "/api/a/b",
        method: "get",
        data: {
            a: 1,
        },
        params: {
            b: 1,
        },
    };

    it("全路径计算", () => {
        expect(ApiManage.createCancelToken(options)).toEqual(
            "%2Fapi%2Fa%2Fb%7B%22params%22%3A%7B%22b%22%3A1%7D%7D"
        );
        expect(
            ApiManage.createCancelToken({
                ...options,
                method: "post",
            })
        ).toEqual("%2Fapi%2Fa%2Fb%7B%22data%22%3A%7B%22a%22%3A1%7D%7D");
    });

    it("非全路径计算", () => {
        expect(ApiManage.createCancelToken(options, false)).toEqual(
            "%2Fapi%2Fa%2Fb%7B%22params%22%3A%7B%22b%22%3A1%7D%7D"
        );
    });
});
