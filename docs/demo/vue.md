## VUE 使用案例

```js
// api.js
export default ({ server }) => {
    post: {
        apiGetToken: `${server}/getToken`;
    }
};
```

```js
// 入口 index.js
import Vue from "vue";
import ApiManage from "api-manage";

import apiList from "./api";

// 注入api清单
Vue.prototype.$service = new apiManage({
    list: ApiManage.bindApi([apiList], { server: "/api" })
});
```

```js
// 子组件中方法调用

export default {
    mounted() {
        this.$service.serveGetToken(); // 调用方法
    }
};
```
