import * as bodyParser from 'body-parser';

export function serverConfig(app) {

    app.disable('etag');
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.use((req, res, next) => {
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        res.header("Pragma", "no-cache");
        res.header("Expires", 0);
        res.header('Server', 'Microsoft-IIS/6.0');
        res.header('X-Powered-By', 'ASP.NET');
        next();
    });

};