const fs = require("fs");
const path = require("path");
const { text } = require("stream/consumers");
const { stdin, stdout } = process;

const track = path.join(__dirname, "text.txt");

const readableStream = fs.createReadStream(track, "utf-8");

let data = "";

readableStream.on("data", (chunk) => (data += chunk));
readableStream.on("end", () => stdout.write(data));
readableStream.on("error", (error) => console.log("Error", error.message));

// fs.readFile(
//     path.join(__dirname, 'text.txt'),
//     'utf-8',
//     (err, data) => {
//         if (err) throw err;
//         console.log(data);
//     }
// );
