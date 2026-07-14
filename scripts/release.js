const { spawnSync } = require('child_process');
const os = require('os');
const path = require('path');
const pkg = require('../package.json');

const args = process.argv.slice(2);
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const cacheDir = process.env.NPM_CONFIG_CACHE || path.join(os.tmpdir(), 'api-manage-npm-cache');

const options = {
    dryRun: args.includes('--dry-run'),
    skipTests: args.includes('--skip-tests'),
    tag: 'latest',
    otp: '',
};

args.forEach((arg, index) => {
    if (arg === '--tag') options.tag = args[index + 1] || options.tag;
    if (arg.startsWith('--tag=')) options.tag = arg.replace('--tag=', '') || options.tag;
    if (arg === '--otp') options.otp = args[index + 1] || options.otp;
    if (arg.startsWith('--otp=')) options.otp = arg.replace('--otp=', '') || options.otp;
});

function run(command, commandArgs, runOptions = {}) {
    console.log(`\n> ${[command].concat(commandArgs).join(' ')}`);
    const result = spawnSync(command, commandArgs, {
        stdio: 'inherit',
        env: {
            ...process.env,
            NPM_CONFIG_CACHE: cacheDir,
        },
        ...runOptions,
    });

    if (result.status !== 0) {
        process.exit(result.status || 1);
    }
}

function npm(commandArgs, runOptions) {
    run(npmCmd, ['--cache', cacheDir].concat(commandArgs), runOptions);
}

function checkNpmLogin() {
    const result = spawnSync(npmCmd, ['--cache', cacheDir, 'whoami'], {
        stdio: 'ignore',
        env: {
            ...process.env,
            NPM_CONFIG_CACHE: cacheDir,
        },
    });

    if (result.status === 0) return;

    console.log('\n未检测到 npm 登录状态，请按提示输入 npm 账号、密码和 OTP。');
    npm(['login', '--auth-type=legacy']);
}

console.log(`准备发布 ${pkg.name}@${pkg.version}`);
console.log(`npm cache: ${cacheDir}`);

if (!options.skipTests) {
    npm(['run', 'type-check']);
    npm(['test']);
} else {
    console.log('\n跳过测试：--skip-tests');
}

npm(['run', 'build']);
npm(['pack', '--dry-run']);

if (options.dryRun) {
    console.log('\nDry run 完成，未执行 npm publish。');
    process.exit(0);
}

checkNpmLogin();

const publishArgs = ['publish', '--tag', options.tag];
if (options.otp) publishArgs.push('--otp', options.otp);
npm(publishArgs);

console.log(`\n发布完成：${pkg.name}@${pkg.version}`);
