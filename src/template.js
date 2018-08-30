import { isArray, isObject } from '../utils/';

export default (template, data) => {
    let tmp = 0;
    const isA = isArray(data);
    const isO = isObject(data);
    const dealData = !isO && !isA ? [data] : data;
    return template
        .split('/')
        .map(v => {
            let result = v;
            if (v.startsWith(':')) {
                let d = dealData[isO ? v.slice(1) : tmp++];
                if (d) result = d;
            }
            return result;
        })
        .join('/');
};
