const app = require('express').Router();
const passport = require('passport');
const mongo = require('./mongo');
const formidable = require("formidable");
const fs = require("fs");
const fs_async = require("./promisify");
const path = require("path");
const backup = require('mongodb-backup');


const OPTIONS = require("./options");
const month = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];


// login page. Redirect to this at every error of auth
app.get("/", (req, res) => {
    res.render('login', { layout: false });
});


// AUTH
// authorization by passportjs
app.post("/api/auth", (req, res, next) => {
    passport.authenticate('adminAuth', function (error, user, info) {
        if (error) return res.status(500).json(error);
        if (!user) return res.status(401).json("ошибка авторизации");
        req.logIn(user, (err) => {
            if (err) return res.status(500).json(error);
            delete user["password"];
            res.json(user);
        });

    })(req, res, next);
});

//check auth for all requests 
app.all('*', (req, res, next) => {
    if (req.isAuthenticated()) next();
    else next(new Error(401)); // 401 Not Authorized
});

// logout
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie(`connect.sid_${OPTIONS.server.domen}`);
        res.redirect('/');
    });
});


// PRODUCT
app.get("/products", async (req, res) => {
    try {
        let request = parseQuery(req);
        let count = await mongo.getProductCount(request.category);
        let categories = await mongo.getAllCategories();
        let products = await mongo.getProductsByFilter(request.category, request.sort, request.limit, request.skip);

        res.status(200);
        res.render('./product/products', {
            products: products,
            category: request.category,
            categories: categories,
            numbersOnPageCurr: request.limit,
            numbersOnPage: [10, 20, 50, 100],
            pagination: {
                page: request.page,
                pageCount: Math.ceil(count / request.limit)
            },
            helpers: {
                increase: function (index) { return ((+index + 1) + request.limit * request.page - request.limit) },
                url: function () { return request.url },
                urlSort: function () { return request.urlSort },
            }
        });
    } catch (error) {
        res.status(500).send("Server error. Cannot get product");
    };
});

app.get("/product/:id", async (req, res) => {
    try {
        let product = await mongo.getProduct(req.params.id);
        let categories = await mongo.getAllCategories();

        res.status(200);
        res.render('./product/product_edit', {
            product: product,
            categories: categories
        });
    } catch (error) {
        res.status(500).send("Server error. Cannot get product");
    };
});

app.get("/api/product/:id", async (req, res) => {
    try {
        let product = await mongo.getProduct(req.params.id);

        res.status(200);
        res.send(JSON.stringify(product));
    } catch (error) {
        res.status(500).send("Server error. Cannot get product");
    };
});

app.get("/product/category/:id", async (req, res) => {
    try {
        let products = await mongo.getAllProductsByCategoryID(req.params.id);

        res.status(200);
        res.send(JSON.stringify(products));
    } catch (error) {
        res.status(500).send("Server error. Cannot get products");
    };
});

app.put("/api/product/:id", async (req, res) => {
    try {
        req.body.siteMapDate = new Date().toISOString();
        await mongo.updateProduct(req.params.id, req.body);
        res.status(200);
        res.send("product - updated");
    } catch (error) {
        res.status(500).send("Server error. Cannot update product");
    };
});

app.delete("/api/product/:id", async (req, res) => {
    try {
        let product = await mongo.getProduct(req.params.id);
        for (let img of product.image || []) {
            await fs_async.unlink(OPTIONS.path_to_pub + "images/" + img);
        };
        await mongo.deleteProduct(req.params.id);

        res.status(200);
        res.send(`${req.params.id} - deleted`);
    } catch (error) {
        res.status(500).send("Server error. Cannot delete product");
    };
});

app.put("/api/product_edit/:id", async (req, res) => {
    try {
        req.body.siteMapDate = new Date().toISOString();
        convertFromStringToOriginType(req.body);
        await mongo.updateProduct(req.params.id, req.body);

        res.status(200);
        res.end();
    } catch (error) {
        res.status(500).send("Server error. Cannot save product");
    };
});

app.get("/product_new", async (req, res) => {
    try {
        let categories = await mongo.getAllCategories();
        res.status(200);
        res.render('./product/product_new', { categories: categories });
    } catch (error) {
        res.status(500).send("Server error. Cannot get new product page.");
    };
});

app.post("/api/product_new", async (req, res) => {
    try {
        req.body.siteMapDate = new Date().toISOString();
        convertFromStringToOriginType(req.body);
        await mongo.addProduct(req.body);

        res.status(200).end();
    } catch (error) {
        res.status(500).send("Server error. Cannot save product");
    };
});

app.post("/api/product_image", async (req, res) => {
    try {
        let name = await saveImage(req, "images");
        res.status(200).send(name);
    } catch (error) {
        res.status(500).send(error);
    };
});

app.delete("/api/product_image", async (req, res) => {
    try {
        // delete file
        await fs_async.unlink(OPTIONS.path_to_pub + "images/" + req.body.name);

        // if request has product ID update product in DB
        if (req.body.product) await mongo.updateProductImages(req.body.product, req.body.name);

        res.status(200).end();
    } catch (error) {
        res.status(500).send("Server error. No File");
    };
});


// CATEGORY
app.get("/categories", async (req, res) => {
    try {
        let categories = await mongo.getAllCategories();

        res.status(200);
        res.render('./category/categories', {
            categories: categories
        });
    } catch (error) {
        res.status(500).send("Server error. Cannot get categories");
    };
});

app.get("/category_new", async (req, res) => {
    res.status(200);
    res.render('./category/category_new');
});

app.post("/api/category_new", async (req, res) => {
    try {
        let category = {
            name: req.body.name,
            image: req.body.image,
            count: +req.body.count || 0,
            description: req.body.description,
            siteMapDate: new Date().toISOString()
        };

        await mongo.addCategory(category);
        res.status(200).end();
    } catch (error) {
        res.status(500).send("Server error. Cannot save category");
    };
});

app.get("/category/:id", async (req, res) => {
    try {
        let category = await mongo.getCategory(req.params.id);
        res.status(200);
        res.render('./category/category_edit', { category: category });
    } catch (error) {
        res.status(500).send("Server error. Cannot get category");
    };
});

app.put("/api/category/:id", async (req, res) => {
    try {
        let data = {
            "image": req.body.image,
            "name": req.body.name,
            "siteMapDate": new Date().toISOString(),
            "description": req.body.description,
            "count": +req.body.count || 0
        };
        await mongo.updateCategory(req.params.id, data);
        res.status(200).end();

    } catch (error) {
        res.status(500).send("Server error. Cannot update banner");
    };
});

app.delete("/api/category/:id", async (req, res) => {
    try {
        let category = await mongo.getCategory(req.params.id);
        await deleteImage("images", category.image);
        await mongo.deleteCategory(category._id);
        res.status(200);
        res.send(`deleted - ${category._id}`);
    } catch (error) {
        res.status(500).send("Server error. Cannot delete category");
    };
});

app.post("/api/category_image", async (req, res) => {
    try {
        let name = await saveImage(req, "images");
        res.status(200).send(name);
    } catch (error) {
        res.status(500).send(error);
    };
});

app.delete("/api/category_image", async (req, res) => {
    try {
        await deleteImage("images", req.body.name);
        res.status(200).send();
    } catch (error) {
        res.status(500).send();
    };
});


// MENU. LEFT SIDE
app.get("/portals", async (req, res) => {
    try {
        let portals = await mongo.getAllPortals();

        for (let menu of portals) {
            menu.categories = await mongo.getCategoryByListIDs(menu.categories);
        };

        res.status(200);
        res.render("./portal/portals", { portals: portals });

    } catch (error) {
        res.status(500);
        res.send("Server error. Cannot get portals");
    };
});

app.get("/portal/:id", async (req, res) => {
    try {
        let portal = await mongo.getPortal(req.params.id);
        let categories = await mongo.getAllCategories();
        let border = Math.round(categories.length / 2);

        res.status(200);
        res.render('./portal/portal_edit', {
            portal: portal,
            cat_first_part: categories.splice(0, border),
            cat_second_part: categories,
            helpers: {
                multi_if: function (id, arr = [], options) {
                    for (let i = 0; i < arr.length; i++) {
                        if (id == arr[i]) return options.fn(this);
                    };
                    return options.inverse(this);
                }
            }
        });
    } catch (error) {
        res.status(500).send("Server error. Cannot get portal");
    };
});

app.put("/api/portal/:id", async (req, res) => {
    try {
        req.body.siteMapDate = new Date().toISOString();
        req.body.count ? req.body.count = +req.body.count : req.body.count = 0;

        await mongo.updatePortal(req.params.id, req.body);
        res.status(200);
        res.send("portal updated");
    } catch (error) {
        res.status(500).send("Server error. Cannot update portal");
    };
});

app.delete("/api/portal/:id", async (req, res) => {
    try {
        await mongo.deletePortal(req.params.id);
        res.status(200);
        res.send(`${req.params.id} - deleted`);
    } catch (error) {
        res.status(500).send("Server error. Cannot delete portal");
    };
});

app.get("/portal_new", async (req, res) => {
    try {
        let categories = await mongo.getAllCategories();
        let border = Math.round(categories.length / 2);
        res.status(200);
        res.render('./portal/portal_new', {
            cat_first_part: categories.splice(0, border),
            cat_second_part: categories,
            helpers: {
                json: function (data) { return JSON.stringify(data) }
            }
        });
    } catch (error) {
        res.status(500).send("Server error. Cannot get new_portal");
    };
});

app.post("/api/portal_new", async (req, res) => {
    try {
        req.body.siteMapDate = new Date().toISOString();
        req.body.count ? req.body.count = +req.body.count : req.body.count = 0;

        await mongo.addPortal(req.body);
        res.status(200);
        res.send("Added");
    } catch (error) {
        res.status(500).send("Server error. Cannot add portal to DB");
    };
});


// NEWS (акции)
app.get("/all_news", async (req, res) => {
    try {
        let news = await mongo.getAllNews();
        res.status(200);
        res.render("./news/news", { news: news });
    } catch (error) {
        res.status(500).send("Server error. Cannot get all_news");
    };
});

app.get("/news_new", async (req, res) => {
    res.status(200);
    res.render('./news/news_new');
});

app.post("/api/news_new", (req, res) => {
    new Promise((resolve, reject) => {

        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) reject(err);

            if (files.file) {
                let uniqueName = Date.now() + "_" + files.file.name;
                fs_async.move(files.file.path, OPTIONS.path_to_pub + "news/" + uniqueName, { encoding: 'binary' }, (err) => {
                    if (err) reject(err);
                    fields.image = uniqueName;  // change image_url to new
                    resolve(fields);
                });
            } else {
                resolve(fields);
            };

        });
    })
        .then((fields) => {
            return mongo.addNews(fields);
        })
        .then((result) => {
            res.status(200);
            res.end();
        })
        .catch((err) => {
            res.status(500);
            res.send("Server error. Cannot save product");
        });
});

app.get("/news/:id", async (req, res) => {
    try {
        let news = await mongo.getNews(req.params.id);
        res.status(200);
        res.render('./news/news_edit', { news: news });
    } catch (error) {
        res.status(500).send("Server error. Cannot get news");
    };
});

app.put("/api/news/:id", (req, res) => {
    new Promise((resolve, reject) => {

        const form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            if (err) reject(err);

            if (files.file) {
                let uniqueName = Date.now() + "_" + files.file.name;
                fs_async.move(files.file.path, OPTIONS.path_to_pub + "news/" + uniqueName, { encoding: 'binary' }, (err) => {
                    if (err) reject(err);

                    fields.image = uniqueName;  // change image_url to new
                    resolve(fields);
                });
            } else {
                resolve(fields);
            };

        });
    })
        .then((fields) => {
            return mongo.updateNews(req.params.id, fields);
        })
        .then((result) => {
            res.status(200);
            res.end();
        })
        .catch((err) => {
            res.status(500);
            res.send("Server error. Cannot save news");
        });
});

app.delete("/api/news/:id", async (req, res) => {
    try {
        let id = req.params.id;
        let news = await mongo.getNews(id);
        await fs_async.unlink(OPTIONS.path_to_pub + "news/" + news.image);
        await mongo.deleteNews(id);
        res.status(200);
        res.send(`deleted - ${req.params.id}`);
    } catch (error) {
        res.status(500).send("Server error. Cannot delete news");
    };
});


// BANNERS
app.get("/banners", async (req, res) => {
    try {
        let banners = await mongo.getAllBanners();
        res.status(200);
        res.render("./banners/banners", { banners: banners });
    } catch (error) {
        res.status(500).send("Server error. Cannot get banners");
    };
});

app.get("/banner_new", async (req, res) => {
    res.status(200);
    res.render('./banners/banner_new');
});

app.post("/api/banner_new", async (req, res) => {
    try {
        let data = {
            "image": req.body.image,
            "title": req.body.title,
            "body": req.body.body,
            "count": +req.body.count
        };
        await mongo.addBanner(data);
        res.status(200).send();
    } catch (error) {
        res.status(500).send(error);
    };
});

app.post("/api/banner_image", async (req, res) => {
    try {
        let name = await saveImage(req, "banners");
        res.status(200).send(name);
    } catch (error) {
        res.status(500).send(error);
    };
});

app.delete("/api/banner_image", async (req, res) => {
    try {
        await deleteImage("banners", req.body.name);
        res.status(200).send();
    } catch (error) {
        res.status(500).send();
    };
});

app.get("/banner/:id", async (req, res) => {
    try {
        let banner = await mongo.getBanner(req.params.id);
        res.status(200);
        res.render('./banners/banner_edit', { banner: banner });
    } catch (error) {
        res.status(500).send("Server error. Cannot get banner");
    };
});

app.put("/api/banner/:id", async (req, res) => {
    try {
        let data = {
            "image": req.body.image,
            "title": req.body.title,
            "body": req.body.body,
            "count": +req.body.count
        };
        await mongo.updateBanner(req.params.id, data);
        res.status(200).end();

    } catch (error) {
        res.status(500).send("Server error. Cannot update banner");
    };
});

app.delete("/api/banner/:id", async (req, res) => {
    try {
        let id = req.params.id;
        let banner = await mongo.getBanner(id);
        await deleteImage("banners", banner.image);
        await mongo.deleteBanner(id);

        res.status(200).send(`deleted - ${id}`);
    } catch (error) {
        res.status(500).send("Server error. Cannot delete banner");
    };
});


// PAGES
app.get("/delivery", async (req, res) => {
    try {
        let text = await mongo.getDelivery();
        res.status(200);
        res.render('./pages/delivery', { delivery: text });
    } catch (error) {
        res.status(500).send("Server error. Cannot get DELIVERY from DB");
    };
});

app.post("/api/delivery", async (req, res) => {
    try {
        var toSave = {
            name: "delivery",
            text: req.body.text
        };
        await mongo.setDelivery(toSave);
        res.status(200);
        res.send("saved");

    } catch (error) {
        res.status(500).send("Server error. Cannot set DELIVERY to DB");
    };
});

app.get("/about", async (req, res) => {
    try {
        let text = await mongo.getAbout();
        res.status(200);
        res.render('./pages/about', { about: text });
    } catch (error) {
        res.status(500).send("Server error. Cannot get ABOUT from DB");
    };
});

app.post("/api/about", async (req, res) => {
    try {
        var toSave = {
            name: "about",
            text: req.body.text
        };
        await mongo.setAbout(toSave);
        res.status(200);
        res.send("ok");

    } catch (error) {
        res.status(500).send("Server error. Cannot set ABOUT to DB");
    };
});

app.get("/contact", async (req, res) => {
    try {
        let text = await mongo.getContact();
        res.status(200);
        res.render('./pages/contact', { contact: text });
    } catch (error) {
        res.status(500).send("Server error. Cannot get CONTACT from DB");
    };
});

app.post("/api/contact", async (req, res) => {
    try {
        var toSave = {
            name: "contact",
            text: req.body.text
        };
        await mongo.setContact(toSave);
        res.status(200);
        res.send("ok");
    } catch (error) {
        res.status(500).send("Server error. Cannot set CONTACT to DB");
    };
});

app.get("/greet", async (req, res) => {
    try {
        let text = await mongo.getGreet();
        res.status(200);
        res.render('./pages/greet', { greet: text });
    } catch (error) {
        res.status(500).send("Server error. Cannot get GREET from DB");
    };
});

app.post("/api/greet", async (req, res) => {
    try {
        var toSave = {
            name: "greet",
            text: req.body.text
        };
        await mongo.setGreet(toSave);
        res.status(200);
        res.send("ok");
    } catch (error) {
        res.status(500).send("Server error. Cannot set GREET to DB");
    };
});


// USER
app.get("/users", async (req, res) => {
    try {
        let users = await mongo.getAllUsers();
        let admins = await mongo.getAllAdmins();

        res.status(200);
        res.render('./users/users', { users: users, admins: admins });
    } catch (error) {
        res.status(500).send("Server error. Cannot get USERS");
    };
});

app.put("/api/user/:id", async (req, res) => {
    try {
        await mongo.updateUser(req.params.id, req.body);
        res.status(200);
        res.send("user updated");
    } catch (error) {
        res.status(500).send("Server error. Cannot update portal");
    };
});

app.get("/user/:id", async (req, res) => {
    try {
        let user = await mongo.getUserByID(req.params.id);

        res.status(200);
        res.render('./users/user_edit', { user: user });
    } catch (error) {
        res.status(500).send("Server error. Cannot get USER");
    };
});

app.delete("/api/user/:id", async (req, res) => {
    try {
        await mongo.deleteUserByID(req.params.id);
        res.status(200);
        res.send(`deleted - ${req.params.id}`);
    } catch (error) {
        res.status(500).send("Server error. Cannot delete news");
    };
});


// ADMINS
app.get("/admin/", async (req, res) => {
    try {
        res.status(200);
        res.render('./users/admin_create');
    } catch (error) {
        res.status(500).send("Server error. Cannot get USER");
    };
});

app.post("/api/admin", async (req, res) => {
    try {
        await mongo.addAdmin(req.body);
        res.status(200);
        res.send("ok");
    } catch (error) {
        res.status(500).send("Server error. Cannot add user to DB");
    };
});

app.delete("/api/admin/:id", async (req, res) => {
    try {
        await mongo.deleteAdminByID(req.params.id);
        res.status(200);
        res.send(`deleted - ${req.params.id}`);
    } catch (error) {
        res.status(500).send("Server error. Cannot delete news");
    };
});


// HOME PAGE. STATISTIC
app.get("/home", async (req, res) => {
    try {
        let todayIPs = await mongo.getIPsByDay(new Date().toDateString());
        if (todayIPs) todayIPs = todayIPs.ips.length;
        else todayIPs = 0;

        let lastSevenDays = getIPsByDayCounter(7);
        lastSevenDays = await mongo.getIPsByListDays(lastSevenDays);
        lastSevenDays.reverse();

        let labels = [];
        let series = [];

        for (let elem of lastSevenDays) {
            labels.push(elem.day);
            series.push(elem.ips.length);
        };

        res.status(200);
        res.render('home', { yesterday: todayIPs, labels: labels, series: series });
    } catch (error) {
        res.status(500).send("ups, can't get home page");
    };
});

app.post("/api/statistics", async (req, res) => {
    try {
        let days = getIPsByDayCounter(+req.body.range);
        days = await mongo.getIPsByListDays(days);
        days.reverse();

        let labels = [];
        let series = [];

        for (let elem of days) {
            labels.push(elem.day);
            series.push(elem.ips.length);
        };

        res.status(200);
        res.send(JSON.stringify({ labels: labels, series: [series] }));
    } catch (error) {
        res.status(500).send("ups, can't get statistic");
    };
});

app.post("/api/statistic", async (req, res) => {
    try {
        let date = await mongo.getIPsByDay(req.body.date);
        if (date) date = date.ips.length + " человек";
        else date = "нет данных";

        res.status(200);
        res.send(JSON.stringify({ msg: date }));
    } catch (error) {
        res.status(500).send("ups, can't get statistic");
    };
});


// ORDER
app.get("/orders", async (req, res) => {
    try {
        let waitings = await mongo.getAllWaitingOrders();
        let process = await mongo.getAllProcessOrders();
        let users = await mongo.getAllUsers();

        res.status(200);
        res.render('./order/orders', {
            orders: {
                waitings: waitings,
                process: process
            },
            users: users,
            yearRange: range(2010),
            monthRange: month
        });
    } catch (error) {
        res.status(500).send("Server error. Cannot get orders.");
    };
});

app.get("/order/:id", async (req, res) => {
    try {
        let order = await mongo.getOrderByID(req.params.id);
        let categories = await mongo.getAllCategories();

        res.status(200);
        res.render('./order/order_edit', {
            order: order,
            categories: categories,
            helpers: {
                increase: (index) => { return ((+index + 1)) }
            }
        });
    } catch (error) {
        res.status(500).send("Server error. Cannot get order.");
    };
});

app.get("/api/order/check", async (req, res) => {
    try {
        let waitings = await mongo.getAllWaitingOrders();

        res.status(200);
        res.send(JSON.stringify(waitings));
    } catch (error) {
        res.status(500).send("Server error. Cannot get order.");
    };
});

app.post("/api/order/archive/", async (req, res) => {
    try {
        let num = req.body.orderNumber ? req.body.orderNumber : null;
        let user = req.body.user ? req.body.user : null;
        let year = req.body.year ? req.body.year : null;
        let month = req.body.month ? req.body.month : null;
        let from = req.body.range ? req.body.range.from : null;
        let to = req.body.range ? req.body.range.to : null;

        let timeRange;
        let numberRange;

        // prevent month without year
        if (month && !year) year = new Date().getFullYear();

        if (year && new Date(year, month) != "Invalid Date") {
            if (month) timeRange = monthRange(year, month);
            else timeRange = yearRange(year);
        };

        if (from && to) numberRange = { $gte: from, $lte: to };

        let filter = {};
        if (num) filter.orderNumber = num;
        if (user) filter["user._id"] = user;
        if (timeRange) filter.time = timeRange;
        if (numberRange) filter.orderNumber = numberRange;

        let archiveOrders = await mongo.getAllOrdersByFilter(filter);

        res.status(200);
        res.send(JSON.stringify(archiveOrders));
    } catch (error) {
        res.status(500).send("Server error. Cannot get order.");
    };
});

app.put("/api/order/:id", async (req, res) => {
    try {
        delete req.body._id;
        await mongo.updateOrder(req.params.id, req.body);

        res.status(200);
        res.send();
    } catch (error) {
        res.status(500).send("Server error. Cannot update product from order.");
    };
});

app.get("/orders/print", async (req, res) => {
    try {
        let process = await mongo.getAllProcessOrders();

        res.status(200);
        res.render('./order/print', {
            orders: process,
            layout: false,
            helpers: {
                empty: (str) => {
                    if (str == "" || str == undefined) return "Нет Заметок";
                    else return str;
                },
                multiply: (v1, v2) => {
                    return (+v1 * +v2);
                },
                result: (array) => {
                    let result = 0;
                    for (let elem of array) {
                        result += +((+elem.price * +elem.count).toFixed(2));
                    };
                    return result.toFixed(2);
                }
            }
        });
    } catch (error) {
        res.status(500).send("Server error. Cannot get print page.");
    };
});

// PRICE GENERATER
app.get("/api/price_gen", async (req, res) => {
    try {
        let name = `price_${Date.now()}.html`;
        let path_to_save = path.join(OPTIONS.path_to_pub, "tmp/", name);

        let products = await mongo.getALLProducts();
        let template = await getPriceTemplate(products);
        await fs_async.writeFile(path_to_save, template);

        setTimeout(() => {
            fs_async.unlink(path_to_save);
        }, 1000 * 60 * 10); // [ml, s, m, h]  so after 10 minutes file will be delete

        res.status(200).send(name);
    } catch (error) {
        res.status(500).send("Server error");
    };
});

app.get("/api/db_back", async (req, res) => {
    try {
        let name = `db_back_${Date.now()}.tar`;
        let path_to_save = path.join(OPTIONS.path_to_pub, "tmp/");
        let to_delete = path_to_save + name;

        await backupMongo(name, path_to_save);

        setTimeout(() => {
            fs_async.unlink(to_delete);
        }, 1000 * 60 * 10); // [ml, s, m, h]  so after 10 minutes file will be delete

        res.status(200).send(name);
    } catch (error) {
        res.status(500).send("Server error");
    };
});


/* 
    Last routers. Error.
*/
app.use(function (err, req, res, next) {
    // if authotization doesnt pass
    if (err instanceof Error) {
        if (err.message === '401') {
            if (req.originalUrl.includes("api/")) res.status(401).send('401: Unauthorized');
            else res.redirect("/");
        };
    };
});

app.use(function (req, res, next) {
    if (req.originalUrl.includes("api/")) res.status(404).send('404: File Not Found');
    else res.redirect("/");
});


module.exports = app;




// additional functions

function parseQuery(req) {
    // default
    let request = {
        category: {},
        sort: { name: 1 },
        limit: 10,
        skip: 0,
        page: 1,
        url: null,
        urlSort: null
    };

    if (req.query.category && (typeof req.query.category == "string")) {
        request.category = { category: req.query.category };
        request.url = `&category=${req.query.category}`;
    };

    if (req.query.sort && (typeof req.query.sort == "string")) {
        if (req.query.sort == "isRecommended" || req.query.sort == "isStock" || req.query.sort == "isShow") {
            request.sort = { [req.query.sort]: -1 };
        } else {
            request.sort = { [req.query.sort]: 1 };
        };

        request.urlSort = `&sort=${req.query.sort}`;
    };

    if (req.query.limit) {
        request.limit = +req.query.limit;
        if (request.url) {
            request.url += `&limit=${+req.query.limit}`;
        } else {
            request.url = `&limit=${+req.query.limit}`;
        };
    };

    if (req.query.page) {
        request.page = +req.query.page;
        request.skip = ((request.limit * request.page) - request.limit);
    };

    return request;
};

function convertFromStringToOriginType(fields) {
    fields.isRecommended = JSON.parse(fields.isRecommended);
    fields.isStock = JSON.parse(fields.isStock);
    fields.isShow = JSON.parse(fields.isShow);
    fields.price = +fields.price;
    fields.priceStrip = +fields.priceStrip;
    if (!fields.image) fields.image = [];

};

function getIPsByDayCounter(days) {
    let lastDays = [];
    for (let index = 0; index < days; ++index) {
        lastDays.push(new Date(Date.now() - (index * 1000 * 60 * 60 * 24)).toDateString());
    };
    return lastDays;
};

function range(start = 0, length = 20) {
    let arr = Array.apply(null, Array(length)).map((_, i) => start + i);
    return arr;
};

function yearRange(year) {
    let begin = new Date(year); // begin of year YEAR Jan 01 0:00:00
    let end = new Date(begin.getFullYear(), 11, 31, 23, 59, 59); // end of year YEAR Dec 31 23:59:59

    return {
        $gte: begin,
        $lt: end
    };
};

function monthRange(year, month) {

    let begin = new Date(year, month);  // begin of year YEAR MONTH 01 0:00:00
    let end = new Date(year             // end of year YEAR MONTH current count DAY 23:59:59
        , month
        , getDaysInMonth(year, month)
        , 23, 59, 59
    );

    return {
        $gte: begin.toISOString(),
        $lt: end.toISOString()
    };
};

function getDaysInMonth(year, month) {
    return [31, (isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
};

function isLeapYear(year) {
    return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
};

/**
 * Save image and return name of it.
 * @param { Request } req request obj, to get data from it.
 * @param { string } dir Dir name, where will be save image.
 * @return { Promise <string> }
 */
function saveImage(req, dir) {
    return new Promise((resolve, reject) => {
        const form = new formidable.IncomingForm();

        form.parse(req, function (err, fields, files) {
            if (err) return reject(err);
            if (files.file) {
                let imageName = Date.now() + "_" + fields.name.toLowerCase();

                fs_async.move(files.file.path, OPTIONS.path_to_pub + dir + "/" + imageName, (err) => {
                    if (err) return reject(err);
                    else resolve(imageName);
                });
            } else return reject("No File");
        });
    });
};

/**
 * Delete image from DIR by NAME
 * @param { String } dir Name of DIR.
 * @param { String } name Name of FILE to delete.
 * @return { Promise<void> }
 */
function deleteImage(dir, name) {
    return new Promise((resolve, reject) => {
        // dont remove default file
        if (name == "default.jpg" || name == "default.png") return resolve();

        let path = OPTIONS.path_to_pub + dir + "/" + name;
        fs.unlink(path, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

/**
 * Render a price from array of products to html page.
 * @param { Object[] } products 
 * @return { Promise<string> }
 */
function getPriceTemplate(products) {
    return new Promise((resolve) => {
        let html = ``;
        html += `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="utf-8" />
            <title>Price</title>
            <style>
                .datagrid table { border-collapse: collapse; text-align: left; width: 100%; } .datagrid {font: normal 12px/150% Arial, Helvetica, sans-serif; background: #fff; overflow: hidden; border: 1px solid #006699; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; }.datagrid table td, .datagrid table th { padding: 3px 10px; }.datagrid table thead th {background:-webkit-gradient( linear, left top, left bottom, color-stop(0.05, #006699), color-stop(1, #00557F) );background:-moz-linear-gradient( center top, #006699 5%, #00557F 100% );filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#006699', endColorstr='#00557F');background-color:#006699; color:#FFFFFF; font-size: 15px; font-weight: bold; border-left: 1px solid #0070A8; } .datagrid table thead th:first-child { border: none; }.datagrid table tbody td { font-weight: bold; color: #00496B; border-left: 1px solid #E1EEF4;font-size: 12px;font-weight: normal; }.datagrid table tbody .alt td { background: #E1EEF4; color: #00496B; }.datagrid table tbody td:first-child { border-left: none; }.datagrid table tbody tr:last-child td { border-bottom: none; }
            </style>
            </head>
            <body>
            <div class="datagrid"><table>
                <thead>
                    <tr>
                        <th>№</th>
                        <th>Наименование</th>
                        <th>Цена</th>
                    </tr>
                </thead>
                <tbody>`;


        for (let i = 0; i < products.length; ++i) {
            html += `<tr>
                <td>${i + 1}</td>
                <td>${products[i].name}</td>
                <td>${products[i].price.toFixed(2)} грн.</td>
            </tr>`;
        };

        html += `</tbody>
            </table></div>
            </body>
            </html>`;

        resolve(html);
    });
};


/**
 * 
 * @param { String } name name of file
 * @param { String } path path to folder
 * @return { Promise<void> }
 */
function backupMongo(name, path) {
    return new Promise((resolve, reject) => {
        backup({
            uri: OPTIONS.mongoStore.url, // mongodb://<dbuser>:<dbpassword>@<dbdomain>.mongolab.com:<dbport>/<dbdatabase>
            root: path,
            tar: name,
            callback: (err) => {
                if (err) reject(err);
                else resolve();
            }
        });
    });
};