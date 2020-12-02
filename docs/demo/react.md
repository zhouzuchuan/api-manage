## React 使用案例

```js
// api.js
export default ({ server }) => {
    post: {
        apiGetToken: `${server}/getToken`;
    }
};
```

`React` 开发规范中不建议用其 `prototype` ,所以 创建一个 hooks 函数来使用

```js
// api.js
import React from "react";
import apiList from "./api";
import ApiManage from "api-manage"; 

// 注入api清单
const apiManage = new apiManage({
    list: ApiManage.bindApi([apiList], { server: "/api" })
});
 

export const useService = () => React.useMemo(() => apiManage.getService(),[])
 
```
 

```js
import React from "react";
import { useService } from "./api.js";
// 子组件中方法调用

export default function() {
    const { serveGetToken } = useService();

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
