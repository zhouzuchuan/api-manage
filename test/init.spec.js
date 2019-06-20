import init from '../src/init';

test('测试没有添加前缀的路由', () => {
    expect(
        init({
            apiList: {
                get: {
                    getName: '/getName',
                },
            },
        }),
    ).toEqual({});
});
