const fs = require("fs");
const path = require("path");
const { stdin: input, stdout: output } = require("process");

const readline = require("readline");
const rl = readline.createInterface({ input, output });

const stream = fs.createWriteStream(path.join(__dirname, "input.txt"), {
  encoding: "utf-8",
});

function onLineInput(line, firstLine = false) {
  if (line === "exit") {
    rl.close();
    return;
  }
  stream.write((firstLine ? "" : "\n") + line);
}

rl.question("Hello. What do you want to write? ", (input) => {
  onLineInput(input, true);
});

rl.on("line", (input) => {
  onLineInput(input);
});

rl.on("close", () => {
  process.stdout.write("Thank you. Goodbye.");
  stream.close();
});
