import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

export const isNative = () => Capacitor.isNativePlatform();

export function sanitizeName(name) {
  return name.replace(/\.\./g, '').replace(/[\/\\]/g, '').replace(/[^a-zA-Z0-9_\-]/g, '_');
}

async function ensureDir(path) {
  try {
    await Filesystem.mkdir({ path, directory: Directory.Data, recursive: true });
  } catch (err) {
    // directory already exists
  }
}

export async function writeFile(dir, filename, data) {
  await ensureDir(dir);
  await Filesystem.writeFile({
    path: `${dir}/${filename}`,
    directory: Directory.Data,
    data,
    encoding: Encoding.UTF8
  });
}

export async function readFile(dir, filename) {
  const res = await Filesystem.readFile({
    path: `${dir}/${filename}`,
    directory: Directory.Data,
    encoding: Encoding.UTF8
  });
  return res.data;
}

export async function deleteFile(dir, filename) {
  await Filesystem.deleteFile({ path: `${dir}/${filename}`, directory: Directory.Data });
}

export async function listDir(dir, extension) {
  try {
    const { files } = await Filesystem.readdir({ path: dir, directory: Directory.Data });
    return files
      .filter(f => f.type === 'file' && f.name.endsWith(extension))
      .map(f => ({
        name: f.name.slice(0, -extension.length),
        filename: f.name,
        size: f.size,
        mtime: f.mtime
      }))
      .sort((a, b) => b.mtime - a.mtime);
  } catch (err) {
    return [];
  }
}
