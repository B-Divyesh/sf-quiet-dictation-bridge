import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = resolve(root, 'android/app/build/outputs/apk/debug/app-debug.apk');
const destinationDirectory = resolve(root, 'public/download');
const filename = 'quiet-dictation-bridge-debug.apk';
const destination = resolve(destinationDirectory, filename);

const artifact = await readFile(source);
if ((await stat(source)).size <= 1_000_000 || artifact.subarray(0, 4).toString('binary') !== 'PK\x03\x04') {
  throw new Error('Android build did not produce a valid APK archive.');
}

await mkdir(destinationDirectory, { recursive: true });
await copyFile(source, destination);
const digest = createHash('sha256').update(artifact).digest('hex');
await writeFile(resolve(destinationDirectory, `${filename}.sha256`), `${digest}  ${filename}\n`);
console.log(`Staged ${filename} (${artifact.byteLength} bytes, sha256 ${digest}).`);
