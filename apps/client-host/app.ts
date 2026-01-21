// imports
import {default as express, static as serveStatic} from 'express';
import {default as compression} from 'compression';
import path, {join} from 'path';
import {createServer as createHTTPServer} from 'http';
import {readFileSync} from 'fs';
import {default as cors} from 'cors';
import {Config} from "./config-interface";

// constant variables
const app = express(),
    config: Config = JSON.parse(readFileSync('config.json', 'utf8'));

// compress responses
app.use(compression());

// use cors configuration from config.json or allow requests to any website
app.use(cors(config.hasOwnProperty('cors') ? config.cors : {
    origin: [],
    methods: [],
    allowedHeaders: [],
    exposedHeaders: [],
    credentials: false
}));

// serve default page
app.use(serveStatic(join(__dirname, 'public')), (req, res) => {
    const pattern = new RegExp('(.css|.html|.js|.ico|.jpg|.jpeg|.png)+$', 'gi');
    if (pattern.test(req.url)) {
        const url = req.url.replace(RegExp(/\.\.\//gm), '');
        res.sendFile(path.resolve(__dirname, `public${url}`));
    } else {
        res.sendFile(path.resolve(__dirname, 'public/index.html'));
    }
});

// initialize http/https server
let sv = createHTTPServer(app);

// start server
sv.listen(config.port);

// clear require cache - minify memory usage
if (config.clearRequireCache) {
    (function minifyRequireCache() {
        Object.keys(require.cache).forEach(key => delete require.cache[key]);
    })();
}