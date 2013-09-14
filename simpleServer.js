var http = require("http"),
    httpProxy = require("http-proxy"),
    colors = require("colors"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    mime = require("mime"),
    rootDir = process.argv[2] || process.cwd(),
    host = process.argv[3] || "localhost",
    port = process.argv[4] || 8686,
    proxyPort = 9000,
    portLookupCallback;

console.log("Starting simple-proxy-server... ".cyan);

http.createServer().listen(function() {
    proxyPort = this.address().port;
    this.close(function() {
        portLookupCallback();
    });
});

portLookupCallback = function() {
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

        if (fs.statSync(filename).isDirectory()) filename = path.join(filename, "/index.html");

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

    console.log(
        "    simple-proxy-server running at => ".cyan + (host + ":" + port).green.bold + (" (proxying " + proxyPort + ")").grey +
        ("\n    serving files from " + rootDir).cyan + 
        "\nCTRL + C to shutdown".yellow.bold
    );
};
