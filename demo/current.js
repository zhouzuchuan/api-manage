const ApiManageModule = require("../lib/index.js");
const ApiManage = ApiManageModule.default || ApiManageModule;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class CancelRequest {
    constructor(register) {
        this.reason = null;
        register((message) => {
            this.reason = new Error(message || "request canceled");
        });
    }
}

const mockRequest = async (options) => {
    if (options.cancelToken && options.cancelToken.reason) {
        throw options.cancelToken.reason;
    }

    await delay(20);

    if (options.cancelToken && options.cancelToken.reason) {
        throw options.cancelToken.reason;
    }

    return {
        data: {
            code: 200,
            ret: {
                method: options.method,
                url: options.url,
                params: options.params,
                data: options.data,
                headers: options.headers,
            },
        },
    };
};

const apiList = {
    get: {
        apiGetUser: "/users/:id",
        apiGetRuntimeUrl: "/runtime-url",
    },
    post: {
        apiCreateUser: "/users",
    },
};

const apiManage = new ApiManage({
    list: apiList,
    request: mockRequest,
    CancelRequest,
    hooks: {
        start: (serveName) => console.log("[start]", serveName),
        resolve: (serveName) => console.log("[resolve]", serveName),
        reject: (serveName, timestamp, error) =>
            console.log("[reject]", serveName, error.message || error),
        finally: (serveName) => console.log("[finally]", serveName),
    },
    validate: async (res) => res.data.code === 200,
    limitResponse: async (res) => res.data.ret,
});

const apis = apiManage.getService();

async function run() {
    console.log("\n1. list -> serveXxx");
    const user = await apis.serveGetUser(
        { keyword: "tom" },
        {
            tplData: { id: 1 },
            headers: { token: "demo-token" },
        },
    );
    console.log(user);

    console.log("\n2. isLimit false -> raw response");
    const rawUser = await apis.serveGetUser(
        { keyword: "tom" },
        {
            tplData: { id: 1 },
            isLimit: false,
        },
    );
    console.log(rawUser);

    console.log("\n3. resolve");
    console.log(apis.serveGetUser.resolve({ keyword: "tom" }, { id: 1 }));

    console.log("\n4. post");
    console.log(await apis.serveCreateUser({ name: "Tom" }));

    console.log("\n5. dynamic call");
    const runtimeData = await apiManage.call({
        url: "/runtime/:id/detail",
        method: "post",
        data: { userId: 1 },
        tplData: { id: "abc" },
        serveName: "runtimeDetail",
        config: {
            headers: {
                noEncrypt: true,
            },
        },
    });
    console.log(runtimeData);

    console.log("\n6. cancel duplicated request");
    const first = apis.serveGetUser({ keyword: "first" }, { tplData: { id: 2 } });
    const second = apis.serveGetUser({ keyword: "first" }, { tplData: { id: 2 } });

    await first.catch((error) => console.log("first canceled:", error.message));
    console.log("second result:", await second);
}

run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
