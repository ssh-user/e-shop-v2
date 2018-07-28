const Strategy = require("passport-local").Strategy;
const passport = require("passport");
const session = require("express-session");
const connect_mongo = require("connect-mongo");
const db = require("./mongo");
const OPTIONS = require("./options");

const MongoStore = connect_mongo(session);


module.exports = function auth(app) {

    app.use(session({
        key: `connect.sid_${OPTIONS.server.domen}`,
        store: new MongoStore({
            url: OPTIONS.mongoStore.url
        }),
        secret: OPTIONS.mongoStore.secret,
        resave: true,
        rolling: true,
        saveUninitialized: false,
        cookie: {
            maxAge: 3 * 60 * 60 * 1000 //3 hours
        }
    }));
    app.use(passport.initialize());
    app.use(passport.session());


    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        db.getAdminByID(id)
            .then((user) => {
                done(null, user);
            })
            .catch((err) => {
                done(err, null);
            });
    });

    passport.use("adminAuth", new Strategy(
        (username, password, done) => {
            db.getAdminByName(username)
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
