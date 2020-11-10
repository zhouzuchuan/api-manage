## 一、实例化参数

### `request` `【必填】`

请求库 

```js
import axios from 'axios'

// 配置
{
    request: axios,
}
```


PS：使用其他库有限制，对库的使用必须是下面这种形式（如果库原生不是采用这种方式调用的 则需要自己二次封装）

```js
// 二次封装传参，参考 axios

other({
    mehtod: "get",
    url: ""
    // ....
});
```

### `list` `【必填】`

api 清单 

```js

{
    post: {
        apiHome_GetToken: "/getToken"
    },
    get: {
        apiHome_GetInfo: "/getUserInfo"
    },
    delete: {
        apiHome_DeleteInfo: "/deleteInfo"
    }
}

``` 

### `matchStr`

api 名称需要替换的前缀，默认是 `api`

### `replaceStr`

api 名称替换后的前缀，默认是 `serve`

### `CancelRequest`

设置中断请求函数， 如果使用的是 `axios`，则可以使用 `axios.CancelToken` ，主要应用场景 是将同一个地址的多次请求，中断取消，只保留最后一个

```js
import axios from 'axios'

// 配置
{
    CancelToken: axios.CancelToken,
}
```

### `hooks`

钩子函数

```js

{
    hooks: {
        start: () => { /**/ },
        resolve: () => { /**/ },
        reject: () => { /**/ },
        finally: () => { /**/ },
    }
    // ...
}

```

-   `start`: 请求前调用
-   `resolve`: 请求成功调用
-   `reject`: 请求失败调用
-   `finally`: 请求成功和失败都调用

### `limitResponse`

处理返回之后的数据

`RESTful API 规范` 会在返回的函数中嵌套一层规范数据格式，但这部分格式在应用中用处却不大，反而增加了使用数据的复杂度，所以通过这个函数来处理，去除规范数据格式

```js
/***
 * 规范数据格式（data 才是应用中需要用到的数据）
 * {
 *     message: '',
 *     code: '',
 *     data: {}
 * }
 *
*/
{

    // serveName 就是请求函数名，可以用这个来对特定的请求做处理
    limitResponse: (res, serveName) => {
        return res.data
    },
    // ...
}
```

```
PS：请求函数执行结束 返回两个参数，第一个为处理后的数据，第二个是未处理返回的数据
```

```js
// 请求函数
serveQueryList().then((data, result) => {
    // data 是经过 limitResponse 处理后的数据
    // result 是接口原本返回的参数
})

```


### `customize`

返回指定类型的自定义请求参数（必须返回 `Promise`）

```js
{
    customize: {
        get: () => {
            // 例如
            return Promise.resolve();
        };
    }
}
```

### `validate`

统一验证请求结果 返回 `true` 则通过 默认返回 `true`

通过这里可以对 返回的数据不符合要求的 进行过滤 不处理

```js
{
    // serveName 就是请求函数名，可以用这个来对特定的请求做处理
    validate: (res, serveName) => {
        if (res.code !== 0) {
            return false;
        } 
        return true;
    };
}
```


```
PS：这里方法是在 limitResponse 之前调用处理
```

---

## 二、实例方法

### `getService`

该方法是获取所有经过处理后的 `请求函数`

```js
const apiManage = new ApiManage({
    //...
});

const service = apiManage.getService();
```

### `resolve`

获取指定 serveName 请求函数的原型 resolve 解析函数方法

```js
const apiManage = new ApiManage({
    //...
});

const serveGetNamesResolve = apiManage.resolve("serveGetNames");

// ....
serveGetNamesResolve();
```

### `abort`

中断指定 serveName 的所有请求

```js
const apiManage = new ApiManage({
    //...
});

// 中断 serveGetNames 请求函数
apiManage.abort("serveGetNames");
```

---

## 三、静态方法

### `bindApi`

该方法是将多个 `api清单` 合并为一个统一的 `api清单`

```
PS: 合并后的 api清单是 键值对形式并非是函数形式
```

该函数有两个参数

-   第一个参数是 `api清单` 集合
-   第二个参数是 如果 `api清单` 是 `函数形式` 则该参数则是 该函数的参数

```js
// 清单1
export default ({ server }) => ({
    get: {
        apiHome_GetList: `${server}/aaa`
    }
});
```

```js
// 清单2
export default {
    get: {
        apiHome_GetList2: `/bbb`
    }
};
```

```js
import ApiManage from "api-manage";

// api 清单
import apiList1 from "./api/list1";
import apiList2 from "./api/list2";

ApiMamage.bindApi([apiList1, apiList2], { server: "/api" });
```

---

## 四：请求函数

### `执行请求`

执行返回的是 `Promise`

两个参数，分别如下

-   请求的需要传的参数
-   请求配置参数

    -   `tplData`: 路径模板解析需要的参数
    -   `cancelParams`: 中断请求配置

        -   `isCalcFullPath`: 中断 token 是否是进行全路径计算。 默认： `true`

```js
// api 清单

export default {
    get: {
        apiGetNames: "/api/:a/:b"
    }
};
```

```js
// 省略初始化 ...

const { serveGetNames } = apiManage.getService();

// 执行请求
serveGetNames({ name: "apimanage" }, { tplData: { a: 100, b: 20 } }).then(
    res => {
        // 操作
    }
);
```

### `原型方法 resolve`

请求函数解析方法，可以返回当前函数的真实请求地址（应用场景：下载功能）

两个参数，分别如下

-   请求的需要传的参数
-   路径模板解析需要的参数

```js
// 省略初始化 ...

const { serveGetNames } = apiManage.getService();

const resolveData = serveGetNames.resolve(
    { name: "apimanage" },
    { a: 100, b: 20 }
);

console.log(resolveData.requestUrl);
//  ==> /api/100/20?name=apimanage
```

### `原型方法 abort`

请求函数中断方法

```js
// 省略初始化 ...

const { serveGetNames } = apiManage.getService();

// 在应用中可以通过该方法 中断请求
serveGetNames.abort();
```
