const process = require("process");
const path = require("path");
const fs = require("fs");

const componentsPath = path.join(__dirname, "components");
const templatePath = path.join(__dirname, "template.html");
const assetsPath = path.join(__dirname, "assets");
const stylesPath = path.join(__dirname, "styles");

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

async function readFile(path) {
  return await fs.promises.readFile(path, "utf-8");
}

async function buildPage() {
  const projectDistPath = path.join(__dirname, "project-dist");
  const indexHtmlPath = path.join(projectDistPath, "index.html");
  const projectDistAssetsPath = path.join(projectDistPath, "assets");
  const projectDistStylesBundlePath = path.join(projectDistPath, "style.css");

  await removeDir(projectDistPath);
  await fs.promises.mkdir(projectDistPath, { recursive: true });

  const components = await scanDir(componentsPath);

  const componentsObj = Object.fromEntries(
    await Promise.all(
      await components
        .map(async (pathname) => {
          const stat = await fs.promises.stat(pathname);

          if (stat.isDirectory()) return null;

          const fileObj = path.parse(pathname);

          if (fileObj.ext !== ".html") return null;

          return [fileObj.name, await readFile(pathname)];
        })
        .filter(Boolean)
    )
  );

  let templateContent = await readFile(templatePath);

  for (let name in componentsObj) {
    if (componentsObj.hasOwnProperty(name)) {
      templateContent = templateContent.replace(
        RegExp(`{{${name}}}`),
        componentsObj[name]
      );
    }
  }

  templateContent = templateContent.replace(/\{\{.*\}\}/, "");

  const indexStream = fs.createWriteStream(indexHtmlPath, {
    encoding: "utf-8",
  });
  indexStream.write(templateContent);

  await copyDir(assetsPath, projectDistAssetsPath);
  await createBundle(stylesPath, projectDistStylesBundlePath);
}
buildPage();
