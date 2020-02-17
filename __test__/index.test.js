import ApiManage from "../lib";

import apiHome from "./api/home.js";

// const apiFiles = require.context("./api/", true, /\.js$/);

describe("基本使用 -------->", () => {
    let apiManage;

    // registerModel(model);

    console.log("sssss");

    apiManage = new ApiManage({
        list: ApiManage.bindApi({ ...apiHome("") }, { server: "" })
    });

    console.log(apiManage.getService());

    // it('使用 store，组件渲染成功！', () => {
    //     expect(wrapper.find('header.header').text()).toEqual(defaultText);
    // });
    // it('测试点击，state 是否更改', () => {
    //     wrapper.find('button.change').simulate('click');
    //     expect(wrapper.find('header.header').text()).toEqual(packageName);
    // });

    // it('同一model中， action type 省略 namespace', () => {
    //     wrapper.find('button.forwardAction').simulate('click');
    //     expect(wrapper.find('header.header').text()).toEqual(authorName);
    // });
});
