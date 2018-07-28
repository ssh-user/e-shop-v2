/* initialisation */
const express = require('express');
const exphbs = require('express-handlebars');
const paginate = require('handlebars-paginate');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');
const routes = require('./routes');
const mongo = require('./mongo');
const auth = require("./auth");
const Timer = require("./timer");
const sitemap = require("./sitemap");
const fs = require("fs");

const OPTIONS = require("./options");

let app = express();

// view engine with custom helpers
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
    helpers: {
        paginate: paginate,
        my_if: function (v1, v2, options) {
            if (v1 == v2) return options.fn(this);
            return options.inverse(this);
        },
        tofixed: (number) => {
            return (+number).toFixed(2);
        },
        img: (image) => {
            if (typeof image == "string") return image;
            else if (typeof image == "object" && image.length != 0) return image[0];
            else return "default.png";
        },
        time: (time) => {
            if (!time) return "Не указано.";
            let correct = new Date(time);
            return `${correct.getFullYear()}/${correct.getMonth() + 1}/${correct.getDate()} ${correct.getHours()}:${correct.getMinutes()}`;
        },
        incr: (index) => ++index,
        json: (obj) => JSON.stringify(obj),
        log: (log) => { console.log('logger - ', log) }
    }
}));
app.set('view engine', 'handlebars');

// static files
app.use(favicon(OPTIONS.path_to_fav));
app.use(express.static(OPTIONS.path_to_pub));

app.disable('view cache');

// settings like bodyparser and cookie
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json({
    limit: "200kb"
}));
app.use(cookieParser());

//auth
auth(app);

// routes
app.use('/', routes);

// check some necessary dirs before start server
if (!fs.existsSync(OPTIONS.path_to_pub + "images/")) fs.mkdirSync(OPTIONS.path_to_pub + "images/");
if (!fs.existsSync(OPTIONS.path_to_pub + "news/")) fs.mkdirSync(OPTIONS.path_to_pub + "news/");
if (!fs.existsSync(OPTIONS.path_to_pub + "userpics/")) fs.mkdirSync(OPTIONS.path_to_pub + "userpics/");
if (!fs.existsSync(OPTIONS.path_to_pub + "banners/")) fs.mkdirSync(OPTIONS.path_to_pub + "banners/");
if (!fs.existsSync(OPTIONS.path_to_pub + "tmp/")) fs.mkdirSync(OPTIONS.path_to_pub + "tmp/");

// every day at 3 am create sitemap
let every_night = new Timer(OPTIONS.timer, () => {
    sitemap.create();
});


// start server
mongo.start(() => {
    app.listen(OPTIONS.server.port, () => console.log("server admin - started"));

    every_night.start();

    sitemap.create();
});
