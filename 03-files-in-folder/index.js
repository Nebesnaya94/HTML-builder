const { readdir } = require("fs/promises");

const filePath = require("path");
const fs = require("fs");

const folder = filePath.join(__dirname, "secret-folder");

(async function (path) {
  try {
    const files = await readdir(path);
    for (const file of files) {
      const res = filePath.resolve(path, file);
      const stat = await fs.promises.stat(res);
      if (stat.isDirectory()) {
        continue;
      }
      const fileName = filePath.basename(res, filePath.extname(res));
      const fileExt = filePath.extname(res).slice(1);
      const fileSize = stat.size / 1000 + "kb";
      const str = `${fileName} - ${fileExt} - ${fileSize}`;
      console.log(str);
    }
  } catch (err) {
    console.error(err);
  }
})(folder);
