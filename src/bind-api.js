import { isFunction, isArray, isObject } from '../utils';

export default (fns, params) => {
    return (isArray(fns) ? fns : [fns]).reduce((r, v) => {
        if (!(isFunction(v) || isObject(v))) return r;
        const result = isFunction(v) ? v(params) : v;
        if (!isObject(result)) return r;
        return Object.entries(result).reduce((r2, [n, m]) => {
            return {
                ...r2,
                ...(isObject(m) && { [n]: { ...(r2[n] || {}), ...m } }),
            };
        }, r);
    }, {});
};
