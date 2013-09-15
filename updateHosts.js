var fs = require("fs"),
    colors = require("colors"),

    // process vars
    loopIP = "127.0.0.1",
    newHosts = [],

    // input vars
    sysHostsFile = process.argv[2],
    newHostsInput = process.argv[3];

if (!sysHostsFile || !sysHostsFile.length) {
    console.log("No hosts file provided to child process, exiting child process.".white);
    process.exit(0);
}

newHosts = (newHostsInput.length && newHostsInput.split(";"));
if (!newHosts.length) {
    console.log("No new hosts provided for update, exiting child process.".white);
    process.exit(0);
}

for (i=0, l=newHosts.length; i<l; ++i) {
    console.log(("Writing new host to system hosts file (" + sysHostsFile + "): " + newHosts[i]).cyan);

    newHostLine = "\n# Added by simple-proxy-server at " + (new Date()).getTime() + "\n" + loopIP + "    " + newHosts[i] + "\n";

    fs.appendFile(sysHostsFile, newHostLine, function (err) {
        if (err) {
            console.log(("WARNINIG: Unable to write new host (" + newHosts[i] + ") to system hosts file: " + err).yellow.bold);
        }
    });
}
