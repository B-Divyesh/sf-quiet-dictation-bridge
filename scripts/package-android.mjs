import { access, mkdir, rename } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const publishedDownload = resolve(root, 'public/download');
const heldDownload = resolve(root, '.android-package-download-hold');

const run = (command, args, options = {}) => new Promise((resolveRun, reject) => {
  const child = spawn(command, args, { cwd: root, stdio: 'inherit', ...options });
  child.on('error', reject);
  child.on('exit', (code) => code === 0 ? resolveRun() : reject(new Error(`${command} ${args.join(' ')} exited ${code}`)));
});

const exists = async (path) => access(path).then(() => true).catch(() => false);
const bundledSdk = '/opt/android-sdk';
const androidSdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT
  || (await exists(bundledSdk) ? bundledSdk : undefined);
const androidEnvironment = androidSdk
  ? { ...process.env, ANDROID_HOME: androidSdk, ANDROID_SDK_ROOT: androidSdk }
  : process.env;

if (!await exists(publishedDownload)) throw new Error('The committed Android download artifact is missing.');
if (await exists(heldDownload)) throw new Error('A prior Android package operation did not restore its download artifact.');

await mkdir(resolve(root, 'public'), { recursive: true });
await rename(publishedDownload, heldDownload);
try {
  await run('npm', ['run', 'cap:sync']);
  await run('./gradlew', ['--no-daemon', 'clean', 'test', 'lint', 'assembleDebug'], { cwd: resolve(root, 'android'), env: androidEnvironment });
} finally {
  if (await exists(heldDownload)) await rename(heldDownload, publishedDownload);
}

await run(process.execPath, ['scripts/stage-android-artifact.mjs']);
await run('npm', ['run', 'build']);
