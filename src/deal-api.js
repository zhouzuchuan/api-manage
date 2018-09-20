export default (data, type = false) =>
    Object.entries(data).reduce(
        (r, [key, apis]) => ({
            ...r,
            ...Object.entries(apis).reduce(
                (r1, [name, path]) => ({
                    ...r1,
                    [name]: `${type ? '' : `${key} `}${path}`
                }),
                {}
            )
        }),
        {}
    );
