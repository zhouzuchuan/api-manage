import apiManage from './store';
import template from './template';

export default ({ request = apiManage.request, list }) => {
    apiManage.serviceList = Object.entries(list).reduce(
        (r, [method, api]) => ({
            ...r,
            ...Object.entries(api).reduce((r2, [name, requestPath]) => {
                const a = function(params, data) {
                    return request({
                        method,
                        url: template(requestPath, data),
                        [method === 'get' ? 'params' : 'data']: params
                    });
                };

                const funName = name.replace(/^api/, 'serve');

                Object.defineProperty(a, 'name', { value: funName });
                return {
                    ...r2,
                    [funName]: a
                };
            }, {})
        }),
        {}
    );
};
