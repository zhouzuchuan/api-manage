export const getType = obj =>
    Object.prototype.toString
        .call(obj)
        .slice(8, -1)
        .toLowerCase();
export const isFunction = o => getType(o) === 'function';
export const isObject = o => getType(o) === 'object';
export const isString = o => getType(o) === 'string';
export const isUndefined = o => getType(o) === 'undefined';
export const isArray = o => getType(o) === 'array';
export const isNull = o => getType(o) === 'null';
