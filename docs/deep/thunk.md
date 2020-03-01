一个应用程序里面 api 会根据不同的功能以及应用常见分为多种，而且数量很多，如果依然用一个 `js文件` 存放，已然增加了维护成本，所以在真正的应用中，建议根据功能以及应用场景来分别储存不同的 api。
通过拆分 降低维护复杂度

比如：菜单管理（menu.js）、用户管理（user.js）、公共 api（public.js）等

```js
// api/public.js
export default ({ server }) => ({
    get: {
        apiPublic_GetVerifyToken: `${server}/get_verify_token`
    }
});
```

```js
// api/menu.js
export default ({ server }) => ({
    get: {
        apiMenu_QueryList: `${server}/menu/list`
    },
    post: {
        apiMenu_AddMenu: `${server}/menu/add`
    },
    put: {
        apiMenu_ChangeMenu: `${server}/menu/change`
    },
    delete: {
        apiMenu_DeleteMenu: `${server}/menu/delete`
    }
});
```

```js
// api/user.js
export default ({ server }) => ({
    get: {
        apiUser_QueryList: `${server}/user/list`
    },
    post: {
        apiUser_AddUser: `${server}/user/add`
    },
    put: {
        apiUser_ChangeUser: `${server}/user/change`
    },
    delete: {
        apiUser_DeleteUser: `${server}/user/delete`
    }
});
```

然后通过 静态方法 [bindApi](/api?id=bindapi) 将多个 `api 清单` 合并为一个，然后赋值使用

```js
import ApiManage from "api-manage";

import apiPublicList from "./api/public.js";
import apiMenuList from "./api/menu.js";
import apiUserList from "./api/user.js";

const apiManage = new ApiManage({
    list: ApiManage.bindApi([apiPublicList, apiMenuList, apiUserList], {
        server: ""
    })
});

const service = apiManage.getService();

//  使用  service.servePublic_GetVerifyToken()
```
