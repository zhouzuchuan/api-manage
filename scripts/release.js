const { spawnSync } = require('child_process');
const os = require('os');
const path = require('path');
const pkgPath = path.join(__dirname, '..', 'package.json');

const args = process.argv.slice(2);
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const cacheDir = process.env.NPM_CONFIG_CACHE || path.join(os.tmpdir(), 'api-manage-npm-cache');

const options = {
    dryRun: args.includes('--dry-run'),
    skipTests: args.includes('--skip-tests'),
    tag: 'latest',
    preid: '',
    explicitTag: false,
    otp: '',
    registry: '',
};

args.forEach((arg, index) => {
    if (arg === '--beta') options.preid = 'beta';
    if (arg === '--tag') {
        options.tag = args[index + 1] || options.tag;
        options.explicitTag = true;
    }
    if (arg.startsWith('--tag=')) {
        options.tag = arg.replace('--tag=', '') || options.tag;
        options.explicitTag = true;
    }
    if (arg === '--pre' || arg === '--preid' || arg === '--prerelease') options.preid = args[index + 1] || options.preid;
    if (arg.startsWith('--pre=')) options.preid = arg.replace('--pre=', '') || options.preid;
    if (arg.startsWith('--preid=')) options.preid = arg.replace('--preid=', '') || options.preid;
    if (arg.startsWith('--prerelease=')) options.preid = arg.replace('--prerelease=', '') || options.preid;
    if (arg === '--otp') options.otp = args[index + 1] || options.otp;
    if (arg.startsWith('--otp=')) options.otp = arg.replace('--otp=', '') || options.otp;
    if (arg === '--registry') options.registry = args[index + 1] || options.registry;
    if (arg.startsWith('--registry=')) options.registry = arg.replace('--registry=', '') || options.registry;
});

if (options.preid && !options.explicitTag) {
    options.tag = options.preid;
}

function readPackage() {
    delete require.cache[require.resolve(pkgPath)];
    return require(pkgPath);
}

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

function getNpmArgs(commandArgs) {
    const npmArgs = ['--cache', cacheDir];
    if (options.registry) npmArgs.push('--registry', options.registry);
    return npmArgs.concat(commandArgs);
}

function npm(commandArgs, runOptions) {
    run(npmCmd, getNpmArgs(commandArgs), runOptions);
}

function checkNpmLogin() {
    const result = spawnSync(npmCmd, getNpmArgs(['whoami']), {
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

let pkg = readPackage();
console.log(`准备发布 ${pkg.name}@${pkg.version}`);
console.log(`npm cache: ${cacheDir}`);
if (options.registry) console.log(`npm registry: ${options.registry}`);

if (options.preid) {
    npm(['version', 'prerelease', '--preid', options.preid, '--no-git-tag-version']);
    pkg = readPackage();
    console.log(`\n预发布版本已更新：${pkg.name}@${pkg.version}`);
    console.log(`npm dist-tag: ${options.tag}`);
}

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
