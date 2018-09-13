export default data =>
    Object.entries(apiList).reduce(
        (r, [key, apis]) => ({
            ...r,
            ...Object.entries(apis).reduce(
                (r1, [name, path]) => ({
                    ...r1,
                    [name]: `${key} ${path}`
                }),
                {}
            )
        }),
        {}
    );
