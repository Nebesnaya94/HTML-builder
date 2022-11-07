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

async function createBundle(src, dest) {
  let files = await scanDir(src);
  if (!files) return;
  let i = 0;
  const bundleStream = fs.createWriteStream(dest, {
    encoding: "utf-8",
  });

  files = files.filter((f) => {
    const data = path.parse(f);
    return data.ext === ".css";
  });

  for (let file of files) {
    bundleStream.write(
      (await fs.promises.readFile(file)) + (i === files.length - 1 ? "" : "\n")
    );
    i++;
  }
}
createBundle(
  path.join(__dirname, "styles"),
  path.join(__dirname, "project-dist", "bundle.css")
);
