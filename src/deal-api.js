export default data => Object.values(data).reduce((r, v) => ({ ...r, ...v }), {});
