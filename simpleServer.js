var http = require("http"),
    httpProxy = require("http-proxy"),
    colors = require("colors"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    mime = require("mime"),
    
    // app settings
    proxyPort = 9000,

    // internal functions
    startServer, getOptions;


// Find an unused port for the proxy first...
console.log("Finding unused port...".white);
http.createServer().listen(function() {
    proxyPort = this.address().port;
    this.close(function() {
        startServer();
    });
});

// This is the main log...
// It is called after we have an unused port from above
startServer = function() {
    var options = getOptions();

    console.log("Starting simple-proxy-server...\n   ".white, options);

    httpProxy.createServer(proxyPort, options.host).listen(parseInt(options.port, 10));

    http.createServer(function(request, response) {
      var uri = url.parse(request.url).pathname,
          filename = path.join(options.rootDir, uri);
      
      console.log(("Handling " + request.method + " request: " + uri).white);

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

          response.writeHead(200, {"Content-Type": mime.lookup(filename)});
          response.write(file, "binary");
          response.end();
        });
      });
    }).listen(proxyPort);

    console.log(
        "    simple-proxy-server running at => ".green + (options.host + ":" + options.port).green.bold + (" (proxying " + proxyPort + ")").grey +
        ("\n    serving files from " + options.rootDir).white + 
        "\nCTRL + C to shutdown".yellow.bold
    );
};

getOptions = function() {
    var options = {};

    options.rootDir = process.argv[2] || process.cwd();
    
    for (i=3, l=process.argv.length; i<l; ++i) {
        m = process.argv[i].match(/^\-\-([a-zA-Z0-9\-]+)\=(.+)$/);
        if (m) {
            options[m[1]] = m[2];
        }
    }

    if (!options.host) { options.host = "localhost"; }
    options.port = Number(options.port);
    if (!options.port) { options.port = 8686; }

    return options;
};
