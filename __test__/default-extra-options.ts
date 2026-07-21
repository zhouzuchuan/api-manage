import ApiManage from "../src/index";

declare module "../src/index" {
    interface ApiManageDefaultExtraOptions {
        contentTypeJson?: boolean;
        noEncrypt?: boolean;
        deepEncrypt?: boolean;
    }
}

const apiList = {
    post: {
        apiCreateUser: "/user",
    },
} as const;

const apiManage = new ApiManage<typeof apiList>({
    request: (url, method, context, extraOptions) => {
        const headers = extraOptions?.headers;
        const contentTypeJson = extraOptions?.contentTypeJson;
        const noEncrypt = extraOptions?.noEncrypt;
        const deepEncrypt = extraOptions?.deepEncrypt;

        void url;
        void method;
        void context;
        void headers;
        void contentTypeJson;
        void noEncrypt;
        void deepEncrypt;

        return Promise.resolve({});
    },
    list: apiList,
});

const service = apiManage.getService();

service.serveCreateUser(
    { name: "Tom" },
    {
        headers: { token: "demo-token" },
        contentTypeJson: true,
        noEncrypt: true,
        deepEncrypt: false,
        cancelParams: {
            includeConfigKeys: ["headers", "contentTypeJson", "noEncrypt"],
        },
    },
);

service.serveCreateUser({ name: "Tom" }, {
    // @ts-expect-error cancelToken should not be a caller-provided option.
    cancelToken: "axios-token",
});

service.serveCreateUser({ name: "Tom" }, {
    // @ts-expect-error undeclared options should still be rejected.
    timeoutMs: 1000,
});

