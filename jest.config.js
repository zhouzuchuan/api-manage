module.exports = {
    moduleFileExtensions: ['js', 'jsx', 'json', 'vue'],
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
    },
    transformIgnorePatterns: ['/node_modules/'],
    testMatch: ['**/test/**/*.spec.(js|jsx|ts|tsx)|**/__test__/*.(js|jsx|ts|tsx)'],
    testURL: 'http://localhost/',

    // 测试覆盖率
    collectCoverage: true,
    collectCoverageFrom: ['**/*.{js,vue}', '!**/node_modules/**'],
    coverageReporters: ['html', 'text-summary'],
};
