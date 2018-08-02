import apiManage from './store';
import template from './template';

console.log(apiManage.serviceList);

export default ({ request = apiManage.request, list }) => {
    return Object.entries(list).reduce(
        (r, [method, api]) => ({
            ...r,
            ...Object.entries(api).reduce(
                (r2, [name, requestPath]) => ({
                    ...r2,
                    [name.replace(/^api/, 'serve')]: (params, data) =>
                        request({
                            method,
                            url: template(requestPath, data),
                            [method === 'get' ? 'params' : 'data']: params
                        })
                }),
                {}
            )
        }),
        apiManage.serviceList
    );
};
