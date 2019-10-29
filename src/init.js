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
                    apiFun = customize[method].bind(requestPath);
                } else {
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

                    // 设置请求函数名称
                    Reflect.defineProperty(apiFun, 'name', { value: funName });

                    Object.setPrototypeOf(apiFun, {
                        resolve(params, tplData) {
                            const splitPath = URI(template(requestPath, tplData));
                            return {
                                fn: apiFun(params, tplData),
                                api: requestPath,
                                name,
                                method,
                                fullApi: method === 'get' ? splitPath.query(params) : splitPath,
                            };
                        },
                    });
                }

                // 设置请求函数名称
                Reflect.defineProperty(apiFun, 'name', { value: funName });

                // 是否有前缀与设置不一样的清单名称
                if (!name.startsWith(matchStr)) {
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
