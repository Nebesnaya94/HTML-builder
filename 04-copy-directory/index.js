const { readdir } = require("fs/promises");
const { mkdir } = require("fs/promises");
const { copyFile, constants } = require("fs/promises");

const path = require("path");
const fs = require("fs");

async function scanDir(dir) {
  let subDirs = [];
  try {
    subDirs = await fs.promises.readdir(dir);
  } catch (err) {
    return false;
  }

  const files = await Promise.all(
    subDirs.map(async (subDir) => {
      const res = path.resolve(dir, subDir);
      const stats = await fs.promises.stat(res);

      return stats.isDirectory() ? [res, await scanDir(res)] : res;
    })
  );

  return files.filter(Boolean).flat(Infinity);
}

async function removeDir(dir) {
  const files = await scanDir(dir);

  if (!files) {
    return false;
  }

  let dirs = [];

  for (let file of files) {
    const stat = await fs.promises.stat(file);
    if (stat.isDirectory()) {
      dirs.push(file);
    }
  }

  dirs = dirs.sort(
    (a, b) => b.split(path.sep).length - a.split(path.sep).length
  );

  for (let dir of dirs) {
    await fs.promises.rm(dir, { recursive: true });
  }
  await fs.promises.rm(dir, { recursive: true });
}

async function copyDir(src, dest) {
  await removeDir(dest);
  await fs.promises.mkdir(dest, { recursive: true });
  const files = await scanDir(src);

  for (const file of files) {
    if ((await fs.promises.stat(file)).isDirectory()) {
      await fs.promises.mkdir(path.join(file.replace(src, dest)), {
        recursive: true,
      });
      continue;
    }
    let newPath = file.replace(src, dest);

    await fs.promises.copyFile(file, newPath);
  }
}
copyDir(path.join(__dirname, "files"), path.join(__dirname, "files-copy"));
