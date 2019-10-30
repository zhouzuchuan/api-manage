import URI from 'urijs';
import apiManage from './store';
import template from './template';

export default ({
    request = require('axios').default,
    list,
    matchStr = 'api',
    replaceStr = 'serve',
    validate = () => true,
    customize = {},
}) => {
    const filterArr = [];
    const serviceList = Object.entries(list).reduce(
        (r, [method, apis]) => ({
            ...r,
            ...Object.entries(apis).reduce((r2, [name, requestPath]) => {
                let apiFun = () => null;

                const funName = name.replace(RegExp('^' + matchStr), replaceStr);

                //是否有自定义
                if (customize[method]) {
                    // 自定义必须为函数
                    if (typeof customize[method] === 'function') apiFun = customize[method].bind(requestPath);
                } else if (request[method]) {
                    apiFun = function(params, tplData) {
                        return new Promise((resolve, reject) => {
                            request({
                                method,
                                url: template(requestPath, tplData),
                                [method === 'get' ? 'params' : 'data']: params,
                            })
                                .then(res => {
                                    if (validate(res)) {
                                        resolve(res);
                                    } else {
                                        reject({
                                            error: 'api-manage validate false',
                                            response: res,
                                        });
                                    }
                                })
                                .catch(reject);
                        });
                    };
                }

                // 设置请求函数名称
                Reflect.defineProperty(apiFun, 'name', { value: funName });

                Object.setPrototypeOf(apiFun, {
                    resolve: function resolve(data, tplData) {
                        const splitPath = URI(template(requestPath, tplData));

                        const dealURI = method === 'get' ? splitPath.addQuery(data) : splitPath;

                        const { hostname, path, port, protocol, query } = dealURI._parts;

                        const fn = apiFun.bind(apiFun, ...arguments);

                        Reflect.defineProperty(fn, 'name', {
                            value: funName,
                        });
                        return {
                            fn,
                            url: requestPath,
                            name: name,
                            method: method,
                            hostname,
                            path,
                            port,
                            protocol,
                            query,
                            requestUrl: dealURI.toString(),
                        };
                    },
                    bind: Function.prototype.bind,
                    call: Function.prototype.call,
                    apply: Function.prototype.apply,
                });

                if (!name.startsWith(matchStr)) {
                    // 是否有前缀与设置不一样的清单名称
                    filterArr.push(name);
                    return r2;
                }

                return {
                    ...r2,
                    [funName]: apiFun,
                };
            }, {}),
        }),
        {},
    );

    if (filterArr.length) {
        console.warn(`以下清单api不符合规范，必须包含前缀 "${matchStr}", 已过滤!`, filterArr);
    }
    apiManage.serviceList = serviceList;
    return serviceList;
};
