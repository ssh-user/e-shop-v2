const path = require("path");

const PATH_TO_PUBLIC = path.join(__dirname, "../", "/public/assets/"); // DONT FORGET TO CHANGE PATH
const PATH_TO_FAVICON = path.join(__dirname, "../", "/public/assets/", 'adm_favicon.ico');

const DataBaseName = "DATA_BASE_NAME";
const DataBaseSecretKey = "DATE_BASE_SECRET_KEY";
const ServerPort = 2001;

const OPTIONS = {
    time: 1000 * 60 * 60 * 3, // 3 hours

    path_to_fav: PATH_TO_FAVICON,
    path_to_pub: PATH_TO_PUBLIC,

    mongoStore: {
        url: `mongodb://127.0.0.1:27017/${DataBaseName}`,
        secret: DataBaseSecretKey
    },

    server: {
        port: ServerPort,
        domen: 'adminko.DOMEN.com',
        domenHLvl: 'http://DOMEN.com/'
    },

    timer: 3
};

module.exports = OPTIONS;
