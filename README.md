simple-proxy-server
===================

Run a simple proxy server with proper mime type support for static sites

## Usage

1. Clone the repo: `git clone git@github.com:jakerella/simple-proxy-server.git`
2. Install (the very few) dependencies: `npm install`
3. Run the server: `node /path/to/project`
4. Hit your local site at http://localhost:8686

### Specifying a hostname

Simply add the host to your `/etc/hosts` file (`C:/Windows/System32/drivers/etc/hosts` on Windows):

```
...
127.0.0.1    somelocaldomain.com
...
```

Then start your server: `node /path/to/project somelocaldomain.com` and hit http://somelocaldomain.com:8686

(Or specify the port as well: `node /path/to/project somelocaldomain.com 9999` and hit http://somelocaldomain.com:9999)


### Making it easier with a symlink

If you want to be able to run the server from anywhere, create a symlink:

`sudo ln -s /path/to/simple-proxy-server/run.sh /usr/local/bin/nserve`

Then run `nserve` from any directory you want to serve up:

```bash
~$ cd /path/to/project/
~$ nserve . somelocaldomain.com
```
