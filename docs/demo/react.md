## React 使用案例

```js
// api.js
export default ({ server }) => {
    post: {
        apiGetToken: `${server}/getToken`;
    }
};
```

`React` 开发规范中不建议用其 `prototype` ,所以 创建一个 全局 `store` 来储存这些 请求函数

```js
// store.js

const store = {};

export const setService = serviceData => {
    Reflect.set(store, "service", serviceData);
};

export const getService = () => {
    Reflect.get(store, "service");
};
```

```js
// 入口 index.js
import React from "vue";
import ApiManage from "api-manage";
import { setStore } from "./store.js";

import apiList from "./api";

// 注入api清单
const apiManage = new apiManage({
    list: ApiManage.bindApi([apiList], { server: "/api" })
});

setService(apiManage.getService());

// ...
```

```js
import React from "react";
import { getStore } from "./store.js";
// 子组件中方法调用

export default function() {
    const { serveGetToken } = getService();

    React.useEffect(() => {
        // 调用
        serveGetToken().then(res => {
            // ...
        });
    }, []);

    return (
        <div>
            {
                // ....
            }
        </div>
    );
}
```
