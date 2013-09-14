var http = require("http"),
    httpProxy = require("http-proxy"),
    colors = require("colors"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    mime = require("/usr/local/lib/node_modules/mime"),
    proxyPort = 9000,
    rootDir = process.argv[2] || __dirname,
    host = process.argv[3] || "localhost",
    port = process.argv[4] || 8686;

httpProxy.createServer(proxyPort, host).listen(parseInt(port, 10));

http.createServer(function(request, response) {
  var uri = url.parse(request.url).pathname,
      filename = path.join(rootDir, uri);
  
  console.log(("Handling new request: " + uri).white);

  fs.exists(filename, function(exists) {
    if(!exists) {
      console.log(("File not found: " + filename).red.bold);
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {
        console.log(("Unable to serve binary file: " + filename).red.bold);
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      console.log(("Serving file: " + filename).green);

      response.writeHead(200, {"Content-Type": mime.lookup(filename)});
      response.write(file, "binary");
      response.end();
    });
  });
}).listen(proxyPort);

console.log("Static file server running at => " + (host + ":" + port).green.bold + "\nCTRL + C to shutdown".yellow.bold);
