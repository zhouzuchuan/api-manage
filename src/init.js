import apiManage from './store';
import template from './template';

export default ({
    request = require('axios').default,
    list,
    matchStr = 'api',
    replaceStr = 'serve',
    validate = () => true
    customize = {},
}) => {
    const serviceList = Object.entries(list).reduce(
        (r, [method, api]) => ({
            ...r,
            ...Object.entries(api).reduce((r2, [name, requestPath]) => {
                const apiFun =
                    customize[method] ||
                    function(params, tplData) {


                        return new Promise((resolve) => {
                            request({
                                method,
                                url: template(requestPath, tplData),
                                [method === 'get' ? 'params' : 'data']: params,
                            }).then(res => {
                                if (validate(res)) {
                                    resolve(res)
                                }
                            });
                        })

                        // return request({
                        //     method,
                        //     url: template(requestPath, tplData),
                        //     [method === 'get' ? 'params' : 'data']: params,
                        // });
                    };
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
    apiManage.serviceList = serviceList;
    return serviceList;
};
