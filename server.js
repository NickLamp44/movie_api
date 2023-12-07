// nicks first server
const http = require("http");
fs = require("fs");
url = require("url");
path = require("path");
express = require("express");

http
  .createServer((request, response) => {
    let addr = request.url,
      q = new URL(addr, "http://" + request.headers.host),
      filePath = "";

    console.log("Request URL:", addr);

    fs.appendFile(
      "log.txt",
      "URL: " + addr + "\nTimestamp: " + new Date() + "\n\n",
      (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Added to log.");
        }
      }
    );

    if (q.pathname.includes("documentation")) {
      filePath = path.join(__dirname, "documentation.html");
    } else {
      filePath = "index.html";
    }

    console.log("File Path:", filePath);

    fs.readFile(filePath, (err, data) => {
      if (err) {
        if (err.code === "ENOENT") {
          console.log("File not found:", filePath);
          response.writeHead(404);
          response.end("Not Found");
        }
      } else {
        console.log("File read successfully:", filePath);
        response.writeHead(200, { "Content-Type": "text/html" });
        response.write(data);
        response.end();
      }
    });
  })
  .listen(8080);

console.log("My test server is running on Port 8080.");
