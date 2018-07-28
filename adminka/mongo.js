const mongodb = require('mongodb');
const OPTIONS = require('./options');
const MongoClient = mongodb.MongoClient;

class Mongo {
    constructor() {
        this.db = null;

        MongoClient.connect(OPTIONS.mongoStore.url, (err, database) => {
            if (err) throw err;
            this.db = database;
            console.log("mongo adminka - connect!");
        });
    };

    start(callback) {
        if (this.db) {
            callback();
        } else {
            setTimeout(() => {
                this.start(callback);
            }, 300);
        };
    };


    // PRODUCTS
    addProduct(product) {
        return this.db.collection('products').insertOne(product);
    };

    getProduct(id) {
        return this.db.collection('products').findOne({ "_id": mongodb.ObjectID(id) });
    };

    getALLProducts() {
        return this.db.collection('products')
            .find({ "isShow": true })
            .sort({ name: 1 })
            .toArray();
    };

    getAllProductsByCategoryID(id) {
        return this.db.collection('products')
            .find({ "category": id, "isShow": true })
            .sort({ name: 1 })
            .toArray();
    };

    getProductsByFilter(filter, sort, limit, skip) {
        return this.db.collection('products')
            .find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .toArray();
    };

    getProductCount(filter) {
        return this.db.collection('products').count(filter);
    };

    updateProduct(id, obj) {
        return this.db.collection('products').updateOne({ "_id": mongodb.ObjectID(id) }, { $set: obj });
    };

    updateProductImages(id, toDelete) {
        return this.db.collection('products').updateOne(
            { "_id": mongodb.ObjectID(id) },
            { $pull: { 'image': toDelete } }
        );
    };

    deleteProduct(id) {
        return this.db.collection('products').deleteOne({ "_id": mongodb.ObjectID(id) });
    };


    //CATEGORIES
    getAllCategories() {
        return this.db.collection('categories')
            .find({})
            .sort({ name: 1 })
            .toArray();
    };

    addCategory(category) {
        return this.db.collection('categories').insertOne(category);
    };

    getCategory(id) {
        return this.db.collection('categories').findOne({ "_id": mongodb.ObjectID(id) });
    };

    getCategoryByListIDs(ids = []) {
        let mongoIDs = ids.map((id) => new mongodb.ObjectID(id));
        return this.db.collection('categories')
            .find({ _id: { $in: mongoIDs } })
            .sort({ name: 1 })
            .toArray();
    };

    updateCategory(id, obj) {
        return this.db.collection('categories').updateOne({ "_id": mongodb.ObjectID(id) }, { $set: obj });
    };

    deleteCategory(id) {
        return this.db.collection('categories').deleteOne({ "_id": mongodb.ObjectID(id) });
    };


    //PORTALS
    getAllPortals() {
        return this.db.collection('portals')
            .find({})
            .sort({ count: -1 })
            .toArray();
    };

    addPortal(portal) {
        return this.db.collection('portals').insertOne(portal);
    };

    getPortal(id) {
        return this.db.collection('portals').findOne({ "_id": mongodb.ObjectID(id) });
    };

    updatePortal(id, obj) {
        return this.db.collection('portals').updateOne({ "_id": mongodb.ObjectID(id) }, { $set: obj });
    };

    deletePortal(id) {
        return this.db.collection('portals').deleteOne({ "_id": mongodb.ObjectID(id) });
    };


    //NEWS 
    getAllNews() {
        return this.db.collection('news')
            .find({})
            .toArray();
    };

    getNews(id) {
        return this.db.collection('news').findOne({ "_id": mongodb.ObjectID(id) });
    };

    addNews(news) {
        return this.db.collection('news').insertOne(news);
    };

    updateNews(id, obj) {
        return this.db.collection('news').updateOne({ "_id": mongodb.ObjectID(id) }, { $set: obj });
    };

    deleteNews(id) {
        return this.db.collection('news').deleteOne({ "_id": mongodb.ObjectID(id) });
    };


    // BANNERS 
    getAllBanners() {
        return this.db.collection('banners')
            .find({})
            .sort({ count: -1 })
            .toArray();
    };

    addBanner(banner) {
        return this.db.collection('banners').insertOne(banner);
    };

    getBanner(id) {
        return this.db.collection('banners').findOne({ "_id": mongodb.ObjectID(id) });
    };

    updateBanner(id, obj) {
        return this.db.collection('banners').updateOne({ "_id": mongodb.ObjectID(id) }, { $set: obj });
    };

    deleteBanner(id) {
        return this.db.collection('banners').deleteOne({ "_id": mongodb.ObjectID(id) });
    };


    // PAGES
    getDelivery() {
        return this.db.collection('pages').findOne({ "name": "delivery" });
    };

    setDelivery(obj) {
        return this.db.collection('pages').updateOne({ "name": "delivery" }, { $set: obj }, { upsert: true });
    };

    getAbout() {
        return this.db.collection('pages').findOne({ "name": "about" });
    };

    setAbout(obj) {
        return this.db.collection('pages').updateOne({ "name": "about" }, { $set: obj }, { upsert: true });
    };

    getContact() {
        return this.db.collection('pages').findOne({ "name": "contact" });
    };

    setContact(obj) {
        return this.db.collection('pages').updateOne({ "name": "contact" }, { $set: obj }, { upsert: true });
    };

    getGreet() {
        return this.db.collection('pages').findOne({ "name": "greet" });
    };

    setGreet(obj) {
        return this.db.collection('pages').updateOne({ "name": "greet" }, { $set: obj }, { upsert: true });
    };


    // ADMIN AUTH
    getAllAdmins() {
        return this.db.collection('adm_users')
            .find({})
            .sort({ username: 1 })
            .toArray();
    };

    getAdminByID(id) {
        return this.db.collection('adm_users').findOne({ "_id": new mongodb.ObjectID(id) });
    };

    getAdminByName(username) {
        return this.db.collection('adm_users').findOne({ "username": username });
    };

    addAdmin(user) {
        return this.db.collection('adm_users').insertOne(user);
    };

    deleteAdminByID(id) {
        return this.db.collection('adm_users').remove({ "_id": new mongodb.ObjectID(id) });
    };


    // USER
    getAllUsers() {
        return this.db.collection('users')
            .find({})
            .sort({ date: -1 })
            .toArray();
    };

    getUserByID(id) {
        return this.db.collection('users').findOne({ "_id": new mongodb.ObjectID(id) });
    };

    updateUser(id, user) {
        return this.db.collection('users').updateOne({ "_id": new mongodb.ObjectID(id) }, { $set: user })
    };

    deleteUserByID(id) {
        return this.db.collection('users').remove({ "_id": new mongodb.ObjectID(id) });
    };


    // VISITOR COUNTER
    getIPsByDay(day) {
        return this.db.collection('ips').findOne({ "day": day });
    };

    getIPsByListDays(days) {
        return this.db.collection('ips')
            .find({ "day": { $in: days } })
            .toArray();
    };


    // ORDER
    getAllWaitingOrders() {
        return this.db.collection('orders')
            .find({ "status": "wait" })
            .sort({ time: 1 })
            .toArray();
    };

    getAllProcessOrders() {
        return this.db.collection('orders')
            .find({ "status": "process" })
            .sort({ time: 1 })
            .toArray();
    };

    getOrderByID(id) {
        return this.db.collection('orders').findOne({ "_id": new mongodb.ObjectID(id) });
    };

    updateOrder(id, order) {
        return this.db.collection('orders').updateOne({ "_id": new mongodb.ObjectID(id) }, { $set: order })
    };

    getAllOrdersByFilter(filter) {
        return this.db.collection('orders')
            .find(filter)
            .sort({ time: 1 })
            .toArray();
    };
};

module.exports = new Mongo();