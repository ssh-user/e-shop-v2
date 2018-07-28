import * as path from "path";

const PATH_TO_PUBLIC = path.join(__dirname, "/public/assets/"); // DONT FORGET TO CHANGE PATH
const DataBaseName = "DATA_BASE_NAME";
const DataBaseSecretKey = "DATA_BASE_SECRET_KEY";
const ServerPort = 2002;

export const config = {
    mongoStore: {
        url: `mongodb://127.0.0.1:27017/${DataBaseName}`,
        secret: DataBaseSecretKey
    },
    server: {
        port: ServerPort,
        domen: 'DOMEN.com'
    },
    PathtoPublic: PATH_TO_PUBLIC,
    mail: {
        host: 'smtp.gmail.com',
        port: 465,
        auth: {
            user: 'EXAMPLE@gmail.com',
            pass: 'PASSWORD'
        }
    }
};
