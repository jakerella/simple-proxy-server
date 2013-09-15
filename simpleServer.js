var http = require("http"),
    httpProxy = require("http-proxy"),
    colors = require("colors"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    mime = require("mime"),
    
    // app vars
    options = {},

    // internal functions
    main, prepareServer, startProxy;


main = function(args) {
    var i, l, m;

    console.log("Starting simple-proxy-server".white + "\nPress CTRL + C to shutdown".yellow.bold);

    // Prepare options
    for (i=2, l=args.length; i<l; ++i) {
        m = args[i].match(/^\-\-([a-zA-Z0-9\-]+)\=(.+)$/);
        if (m) {
            options[m[1]] = m[2];
        }
    }

    if (options.config) {
        fs.exists(options.config, function(exists) {
            if(!exists) {
                console.error(("ERROR: Config file does not exist! (" + options.config + ")").red.bold);
                process.exit(404);
            }

            fs.readFile(options.config, "binary", function(err, file) {
                var configJSON = {};

                if(err) {
                    console.error(("ERROR: Unable to read config file! (" + options.config + ")").red.bold);
                    process.exit(500);
                }

                try {
                    configJSON = JSON.parse(file);
                } catch (e) {
                    console.error(("ERROR: Unable to parse config file! " + e.message).red.bold);
                    process.exit(500);
                }

                if (!Array.isArray(configJSON.hosts)) {
                    console.error(("ERROR: config file does not have a 'hosts' array! ").red.bold);
                    process.exit(400);
                }

                for (i=0, l=configJSON.hosts.length; i<l; ++i) {
                    prepareServer(configJSON.hosts[i]);
                }
            });
        });

    } else {
        // If no config file is specified use individual host options passed in (or defaults)

        options.hosts = [
            { "rootDir": options.rootDir, "host": options.host, "port": options.port }
        ];

        prepareServer(options.hosts[0]);
    }
};


// This is the main functionality to start a single server
prepareServer = function(options) {
    options = (options || {});

    if (!options.rootDir) { options.rootDir = (options.rootDir || process.cwd()); }
    if (!options.host) { options.host = "localhost"; }
    options.port = Number(options.port);
    if (!options.port) { options.port = 8686; }

    console.log("Finding unused port for proxy...".white);
    http.createServer().listen(function() {
        options.proxyPort = this.address().port;
        this.close(function() {
            startProxy(options);
        });
    });
};

startProxy = function(options) {
    console.log("Starting http-proxy...".white);
    httpProxy.createServer(options.proxyPort, options.host).listen(parseInt(options.port, 10));

    console.log("Starting http server...".white);
    http.createServer(function(request, response) {
        var uri = url.parse(request.url).pathname,
            filename = path.join(options.rootDir, uri);
      
        console.log(("Handling " + request.method + " request to " + (options.host + ":" + options.port) + ": " + uri).white);

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
    }).listen(options.proxyPort);

    console.log(
        "    simple-proxy-server running at => ".green + (options.host + ":" + options.port).green.bold + (" (proxying " + options.proxyPort + ")").grey +
        (" and serving files from " + options.rootDir).white
    );
};

// Kick off the process
main(process.argv);
