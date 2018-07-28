import { Strategy } from "passport-local";
import * as passport from "passport";
import * as session from "express-session";
import * as connect_mongo from "connect-mongo";
import { db } from './mongo';
import { config } from "../config";

const MongoStore = connect_mongo(session);


export function auth(app) {

    app.use(session({
        store: new MongoStore({
            url: config.mongoStore.url
        }),
        secret: config.mongoStore.secret,
        resave: true,
        rolling: true,
        saveUninitialized: false,
        cookie: {
            maxAge: 3 * 24 * 60 * 60 * 1000 //3 days
        }
    }));
    app.use(passport.initialize());
    app.use(passport.session());


    passport.serializeUser(function (user: any, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function (id: any, done) {
        db.getUserByID(id)
            .then((user) => {
                done(null, user);
            })
            .catch((err) => {
                done(err, null);
            });
    });


    passport.use("userEnter", new Strategy(
        (username, password, done) => {
            db.getUserByName(username)
                .then((user) => {
                    if (!user) done(null, false); // no user with this name
                    else {
                        if (password == user.password) done(null, user); // user and pass - right
                        else done(null, false); // password - incorrect
                    };
                })
                .catch((err) => {
                    done(err, null); // database - error
                });
        }
    ));

};
