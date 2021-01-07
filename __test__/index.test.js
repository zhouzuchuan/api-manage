import ApiManage from "../lib";
import axios from "axios";

// const apiFiles = require.context("./api/", true, /\.js$/);

const apiList = (server) => ({
    get: {
        apiGetList: `${server}/todos/1`,
        apiGetList2: `${server}/todos/:id`,
    },
});

describe("测试 基础 用法 -------->", () => {
    let requestList = {};

    // registerModel(model);

    const apiManage = new ApiManage({
        request: axios,
        list: ApiManage.bindApi([
            apiList("https://jsonplaceholder.typicode.com"),
        ]),
        CancelRequest: axios.CancelToken,
        limitResponse: (result) => result.data,
    });

    requestList = apiManage.getService();

    it("获取 所有的请求函数", () => {
        expect(Object.keys(requestList).includes("serveGetList")).toEqual(true);
    });

    it("测试 请求 成功！", () => {
        return requestList
            .serveGetList()
            .then((data) => {
                expect(data).toEqual({
                    userId: 1,
                    id: 1,
                    title: "delectus aut autem",
                    completed: false,
                });
            })
            .catch(() => {
                console.log("请求失效！");
            });
    });


    it("测试 isLimit 不处理返回数据！", () => {
        return requestList
            .serveGetList(null, {
                isLimit: false
            })
            .then((res) => {
                expect(res.data).toEqual({
                    userId: 1,
                    id: 1,
                    title: "delectus aut autem",
                    completed: false,
                });
            })
            .catch(() => {
                console.log("请求失效！");
            });
    });

    it("测试 请求 中断！", () => {
        let temp = false;
        requestList.serveGetList2({}, { tplData: { id: 2 } }).catch((a) => {
            expect(a).toEqual({ message: "取消重复请求" });
            temp = true;
        });

        requestList.serveGetList2({}, { tplData: { id: 3 } }).catch((a) => {
            expect(a).toEqual({ message: "取消重复请求" });
        });
        apiManage.abort("serveGetList2");

        return requestList
            .serveGetList2({}, { tplData: { id: 2 } })
            .then((data) => {
                expect(data).toEqual({
                    userId: 1,
                    id: 2,
                    title: "quis ut nam facilis et officia qui",
                    completed: false,
                });

                expect(temp).toEqual(true);
            });
    });

    it("测试 请求函数 路径解析", () => {
        expect(
            requestList.serveGetList2.resolve({}, { id: 100 }).requestUrl
        ).toEqual("https://jsonplaceholder.typicode.com/todos/100");

        expect(
            apiManage.resolve("serveGetList2")({}, { id: 222 }).requestUrl
        ).toEqual("https://jsonplaceholder.typicode.com/todos/222");
    });
});

describe("测试 实例方法 mergeQuery -------->", () => {
    const apiManage = new ApiManage({
        request: axios,
        list: {},
    });

    it("常规", () => {
        expect(apiManage.mergeQuery("?a=1")).toEqual("a=1");
        expect(apiManage.mergeQuery("a=1")).toEqual("a=1");
        expect(apiManage.mergeQuery("?a=1", { b: 1 })).toEqual("a=1&b=1");
        expect(apiManage.mergeQuery("a=1", { b: 1 })).toEqual("a=1&b=1");
        expect(apiManage.mergeQuery("?a=1", { b: 1, c: undefined })).toEqual(
            "a=1&b=1&c="
        );
        expect(apiManage.mergeQuery("?a=1&d", { b: 1, c: undefined })).toEqual(
            "a=1&d&b=1&c="
        );
    });
    it("特殊", () => {
        expect(apiManage.mergeQuery("   ", { a: 1 })).toEqual("a=1");
        expect(apiManage.mergeQuery("a", { b: 1 })).toEqual("a&b=1");
        expect(apiManage.mergeQuery("    a", { b: 1 })).toEqual("a&b=1");
        expect(apiManage.mergeQuery("    a&  b=1", { c: 1 })).toEqual(
            "a&  b=1&c=1"
        );
    });
});
