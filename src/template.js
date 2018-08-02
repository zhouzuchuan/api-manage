export default (template, data) =>
    template
        .split('/')
        .map(v => (v.startsWith(':') && data[v.slice(1)] ? data[v.slice(1)] : v))
        .join('/');
