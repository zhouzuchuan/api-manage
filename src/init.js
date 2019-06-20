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
        (r, [method, api]) => ({
            ...r,
            ...Object.entries(api).reduce((r2, [name, requestPath]) => {
                const apiFun =
                    customize[method] ||
                    function(params, tplData) {
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
                if (!name.startsWith(matchStr)) {
                    filterArr.push(name);
                    return r2;
                }
                const funName = name.replace(RegExp('^' + matchStr), replaceStr);
                Reflect.defineProperty(apiFun, 'name', { value: funName });
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
