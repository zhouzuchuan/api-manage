## 微信小程序

这里微信小程序 采用的 开发框架 `Taro` 来开发

在小程序中 无法使用 axios, 这里使用的是 [fly](https://github.com/wendux/fly)。
为了能使用 所以需要对其进行封装

```js
// request.js

import Fly from "flyio/dist/npm/wx";
const fly = new Fly();

export const request = ({ method, url, data }) => fly[method](url, data);
```

```js
// api.js
export default ({ server }) => {
    post: {
        apiGetToken: `${server}/getToken`;
    }
};
```

```js
import ApiManage from "api-manage";
import request from "./request";
import apiList from "./api";

const apiManage = new apiManage({
    request,
    list: ApiManage.bindApi([apiList], { server: "/api" })
});
```
