import apiManage from './store';
import template from './template';

export default ({ request = apiManage.request, list }) => {
    apiManage.serviceList = Object.entries(list).reduce(
        (r, [method, api]) => ({
            ...r,
            ...Object.entries(api).reduce((r2, [name, requestPath]) => {
                const apiFun = (params, data) =>
                    request({
                        method,
                        url: template(requestPath, data),
                        [method === 'get' ? 'params' : 'data']: params
                    });

                const funName = name.replace(/^api/, 'serve');

                Object.defineProperty(apiFun, 'name', { value: funName });
                return {
                    ...r2,
                    [funName]: apiFun
                };
            }, {})
        }),
        {}
    );
};
