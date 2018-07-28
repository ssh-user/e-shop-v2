import * as formidable from 'formidable';
import * as passport from "passport";
import * as fs from "fs";
import * as move from "mv";
import * as escape from 'escape-string-regexp';
import * as sha1 from "js-sha1";

import { db } from './mongo';
import { sendMail, sendNewPasswordMail } from './mail';
import { config } from '../config';


// ROUTES
function routers(app) {

    app.get("/api/portals", async (req, res) => {
        try {
            let portals = await db.getPortals();

            for (let menu of portals) {
                menu.categories = await db.getCategoriesByListIDs(menu.categories);
            };

            res.status(200);
            res.send(JSON.stringify(portals));

        } catch (error) {
            res.status(500);
            res.send(error);
        };
    });

    app.get('/api/portal/:id', async (req, res) => {
        try {
            let portal = await db.getPortalByID(req.params.id);
            portal.categories = await db.getCategoriesByListIDs(portal.categories);

            res.status(200);
            res.send(JSON.stringify(portal));

        } catch (error) {
            res.status(500);
            res.send(error);
        };
    });

    app.get('/api/categories', (req, res) => {
        db.getCategories()
            .then((categories) => {
                res.status(200);
                res.send(JSON.stringify(categories));
            })
            .catch((err) => {
                res.status(500);
                res.send(err);
            });
    });

    app.get('/api/category/:id', (req, res) => {
        db.getCategoryByID(req.params.id)
            .then((category) => {
                res.status(200);
                res.send(JSON.stringify(category));
            })
            .catch((err) => {
                res.status(500);
                res.send(err);
            });
    });

    app.get('/api/products/:id', async (req, res) => {
        try {
            let category = await db.getCategoryByID(req.params.id);
            let products = await db.getAllProductsByCategoryID(req.params.id);

            res.status(200).send(JSON.stringify({
                category: category,
                products: products
            }));
        } catch (error) {
            res.status(500).send(error);
        };
    });

    app.get('/api/product/:id', (req, res) => {
        db.getProductByID(req.params.id)
            .then((product) => {
                if (product.isShow) {
                    res.status(200);
                    res.send(JSON.stringify(product));
                } else {
                    // if the product is't intended for viewing
                    res.status(404).end();
                };
            })
            .catch((err) => {
                res.status(500);
                res.send(err);
            });
    });

    app.get('/api/recommended', (req, res) => {
        db.getAllProductsByRecom()
            .then((products) => {
                res.status(200);
                res.send(JSON.stringify(products));
            })
            .catch((err) => {
                res.status(500);
                res.send(err);
            })
    });

    app.get("/api/delivery", (req, res) => {
        db.getDelivery()
            .then((result) => {
                res.status(200);
                if (!result) res.send();
                else res.send(result.text);
            })
            .catch((err) => {
                res.status(500);
                res.send(err);
            });
    });

    app.get("/api/about", (req, res) => {
        db.getAbout()
            .then((result) => {
                res.status(200);
                if (!result) res.send();
                else res.send(result.text);
            })
            .catch((err) => {
                res.status(500);
                res.send(err);
            });
    });

    app.get("/api/contact", (req, res) => {
        db.getContact()
            .then((result) => {
                res.status(200);
                if (!result) res.send();
                else res.send(result.text);
            })
            .catch((err) => {
                res.status(500);
                res.send(err);
            });
    });

    app.get("/api/greet", (req, res) => {
        db.getGreet()
            .then((result) => {
                res.status(200);
                if (!result) res.send();
                else res.send(result.text);
            })
            .catch((err) => {
                res.status(500);
                res.send(err);
            });
    });

    app.get("/api/news", (req, res) => {
        db.getNews()
            .then((news) => {
                res.status(200);
                res.send(JSON.stringify(news));
            })
            .catch((err) => {
                res.status(500);
                res.send(err);
            });
    });

    app.post('/api/auth', (req, res, next) => {
        passport.authenticate('userEnter', function (error, user, info) {
            if (error) return res.status(500).json(error);
            if (!user) return res.status(401).json("ошибка авторизации");
            req.logIn(user, (err) => {
                if (err) return res.status(500).json(error);
                delete user["password"];
                res.json(user);
            });

        })(req, res, next);
    });

    app.post("/api/reg", (req, res) => {
        // check to empty body
        if (!req.body) res.status(500).send("error body parse");

        // check to correctly fields
        if (typeof req.body.username == "string" &&
            typeof req.body.password == "string" &&
            typeof req.body.email == "string") {

            db.getUserByName(req.body.username)
                .then((user) => {
                    if (user) {
                        res.status(409).send();
                        throw new Error("stop");
                    };

                    return db.addUser({
                        username: req.body.username,
                        password: req.body.password,
                        email: req.body.email,
                        date: Date.now(),
                        image: "userpic.jpg",
                        adress: "",
                        phone: "",
                        note: "",
                        discount: 0
                    })
                })
                .then((user) => {
                    res.status(200).send();
                })
                .catch((err: Error) => {
                    // check username in base
                    if (err.message == "stop") return;
                    res.status(500)
                    res.send(err);
                })
        } else {
            res.status(500).send("error body parse");
        };

    });

    app.get("/api/checkAuth", (req, res) => {
        let user = req.user;
        if (user) {
            delete user["password"];
            res.status(200).send(user);
        } else {
            res.status(401).send();
        }
    });

    app.get('/api/logout', (req, res) => {
        req.session.destroy(function () {
            res.clearCookie('connect.sid');
            res.redirect('/');
        });
    });

    app.post("/api/recovery", async (req, res) => {
        try {
            let user = await db.recoveryPassword(req.body.email);
            if (user) {
                // generate new password
                const newPassword = Math.random().toString(36).slice(-8);

                // create HASH of new password
                sha1(newPassword);
                const hash = sha1.create();
                hash.update(newPassword);
                const hashPassword = hash.hex();

                // update user info
                user.password = hashPassword;
                await db.updateUser(user._id, user);

                res.status(200).end();

                try {
                    // send response before send a mail. because sending mail is long operation ~1.5s-2s
                    await sendNewPasswordMail(user, newPassword);
                } catch (error) { };
            } else
                res.status(403).send("no user");
        } catch (error) {
            res.status(500).send("Server error");
        };
    });

    app.get('/api/search', (req, res) => {
        if (!req.query.search) res.status(404).send(); // error
        if (req.query.search.length >= 3) { // nothing doing if request length is less then 3 chars
            db.getAllProductsBySearchRequest(escape(req.query.search))
                .then((result) => {
                    res.status(200).send(JSON.stringify(result));
                })
                .catch((err) => {
                    res.status(500).send("DB error");
                })
        } else {
            res.status(200).send(JSON.stringify([]));
        };
    });

    app.post('/api/profile', (req, res) => {
        new Promise((resolve, reject) => {
            // check authorization
            if (!req.user) {
                reject("no_authorization"); return;
            };
            // form parse
            let form = new formidable.IncomingForm();

            form.parse(req, (err, fields, files: any) => {
                if (err) {
                    reject("no_authorization"); return;
                };

                // if no password or password wrong
                if (!fields.password || fields.password != req.user.password) {
                    reject("wrong_password"); return;
                };

                // prepare user data to update
                let userToUpdate = {
                    username: req.user.username,
                    email: req.user.email
                };

                if (fields.new_password) userToUpdate["password"] = fields.new_password;
                if (fields.adress) userToUpdate["adress"] = fields.adress;
                if (fields.phone) userToUpdate["phone"] = fields.phone;
                if (fields.secondphone) userToUpdate["secondphone"] = fields.secondphone;
                if (fields.fio) userToUpdate["fio"] = fields.fio;

                if (files.image) {
                    let name = files.image.name.split(".");
                    let userpicName = `${Date.now().toString()}.${name[name.length - 1]}`;

                    move(files.image.path, config.PathtoPublic + "userpics/" + userpicName, (err) => {
                        // if err - resolve without image
                        if (err) {
                            resolve(userToUpdate);
                        };
                        // if no error - we collect all fields and resolve next step
                        userToUpdate["image"] = userpicName;
                        resolve(userToUpdate);
                    });
                } else {
                    resolve(userToUpdate);
                };
            });
        })
            .then((userToUpdate) => {
                return db.updateUser(req.user._id, userToUpdate)
            })
            .then((result) => {
                return db.getUserByID(req.user._id);
            })
            .then((updatedUser) => {
                delete updatedUser["password"];
                res.status(200);
                res.send(JSON.stringify(updatedUser));
            })
            .catch((err) => {
                switch (err) {
                    case "no_authorization": res.status(401).send(); break;
                    case "wrong_password": res.status(422).send(); break;
                    default: res.status(500).send(JSON.stringify({ err: err })); break;
                };
            });
    });

    app.post('/api/order', async (req, res) => {
        try {
            // check empty\wrong request
            if (!req.body.user ||
                !req.body.user.phone ||
                req.body.user.phone.length < 5 ||
                !req.body.order ||
                req.body.order.length < 1) throw new Error("empty_body");

            // prepare order product to prevent change prices with smart users
            // get All ids of ORDER from DB
            let orderIDs = req.body.order.map((elem) => {
                return elem._id;
            });

            let productsFromListIDs = await db.getProductsByListIDs(orderIDs);

            for (let i = 0; i < productsFromListIDs.length; i++) {
                for (let j = 0; j < req.body.order.length; j++) {
                    if (productsFromListIDs[i]._id == req.body.order[j]._id) {
                        // if IDs are same so add count
                        productsFromListIDs[i].count = req.body.order[j].count;
                    };
                };
            };
            req.body.order = productsFromListIDs;

            // verification discount
            let discount = (req.user) ? +req.user.discount : 0;
            // if user change own discount, and then we can trust to this field
            if (discount) req.body.user.discount = discount;

            if (discount != 0) {
                let listWithDiscount = [];
                for (let elem of req.body.order) {

                    let pr = +elem.price;
                    let disc = (pr * discount) / 100;

                    elem.price = +(pr - disc).toFixed(2);
                    listWithDiscount.push(elem);
                };

                req.body.order = listWithDiscount;
            };

            // get next count of order
            let count = await db.getOrdersCountNext();

            // if it's first request to db, it return value = null. So we request again value.
            if (!count.value) count = 1;
            else count = count.value.count;

            // after all verifications add number and Date to order and then add order to DB
            req.body.orderNumber = +count;
            req.body.time = new Date();
            req.body.status = "wait";

            // add sum to order
            let sum = 0;
            for (let order of req.body.order) {
                sum += order.price * order.count;
            };
            req.body.sum = sum;

            await db.addOrder(req.body);

            // if email is, send a mail to user
            if (req.body.user.email && req.body.user.email != "") {

                // send response before send a mail. because sending mail is long operation ~1.5s-2s
                res.status(200).send(JSON.stringify({ number: count }));
                let answ = await sendMail(req.body.user, req.body.order, count);
                await db.addMailResult(answ);

            } else res.status(200).send(JSON.stringify({ number: count }));
        } catch (err) {
            if (err.message != "empty_body") res.status(501).send();
            else res.status(500).send();
        };
    });

    app.get('/api/history', async (req, res) => {
        try {
            if (!req.user) throw new Error("no_auth");
            let orders = await db.getOrdersByUser(req.user.username);
            res.status(200);
            res.send(JSON.stringify(orders));
        } catch (error) {
            res.status(403).send("No auth");
        };
    });

    app.get('/api/history/:id', async (req, res) => {
        try {
            if (!req.user) throw new Error("no_auth.");
            let rawOrder = await db.getOrderById(req.params.id);

            if (rawOrder.length == 0) throw new Error("Wrong request.");

            // transform order
            let order = rawOrder[0].order.map((elem) => {
                return {
                    count: elem.count,
                    name: elem.name,
                    price: elem.price,
                    _id: elem._id
                };
            });

            res.status(200);
            res.send(JSON.stringify(order));
        } catch (error) {
            res.status(500).send("error.message");
        };
    });

    app.get('/api/banners', async (req, res) => {
        try {
            let banners = await db.getBanners();
            res.status(200);
            res.send(JSON.stringify(banners));
        } catch (error) {
            res.status(500).send("Server error");
        };
    });

    // debug info
    app.post('/api/debug', (req, res) => {
        db.addDebugInfo(req.body)
            .then(() => {
                res.status(200);
                res.send();
            })
            .catch(() => {
                res.status(500);
                res.send();
            });
    });

    // last route. Error.
    app.use((req, res, next) => {
        res.status(400);
        res.send("wrong api request");
    });
};

export { routers };

