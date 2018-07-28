import * as mongodb from 'mongodb';
import { config } from "../config";

const MongoClient = mongodb.MongoClient;


class Mongo {
    private db: mongodb.Db;

    constructor() {
        this.db = null;

        MongoClient.connect(config.mongoStore.url, (err, database) => {
            if (err) throw err;
            this.db = database;
            console.log("mongo front - connected!");
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



    // CATEGORY
    getCategories(): Promise<any> {
        return this.db.collection('categories')
            .find({})
            .sort({ count: -1 })
            .toArray();
    };

    getCategoriesByListIDs(ids = []) {
        let mongoIDs = ids.map((id) => new mongodb.ObjectID(id));
        return this.db.collection('categories')
            .find({ _id: { $in: mongoIDs } })
            .sort({ count: -1 })
            .toArray();
    };

    getCategoryByID(id: string): Promise<any> {
        return this.db.collection('categories').findOne({ "_id": new mongodb.ObjectID(id) });
    };


    // PRODUCT
    getAllProductsByCategoryID(id: string): Promise<any> {
        return this.db.collection('products')
            .find({ "category": id, "isShow": true })
            .sort({ name: 1 })
            .toArray();
    };

    getAllProductsBySearchRequest(str: string): Promise<any> {
        return this.db.collection('products')
            .find({ "name": { $regex: new RegExp(str, "i") }, "isShow": true })
            .sort({ name: 1 })
            .toArray();
    };

    getProductByID(id: string): Promise<any> {
        return this.db.collection('products').findOne({ "_id": new mongodb.ObjectID(id) });
    };

    getProductsByListIDs(ids: Array<string>): Promise<Array<any>> {
        let mongoIDs = ids.map((id: string) => new mongodb.ObjectID(id));
        return this.db.collection('products')
            .find({ _id: { $in: mongoIDs } })
            .sort({ name: 1 })
            .toArray();
    };

    getAllProductsByRecom(): Promise<any> {
        return this.db.collection('products')
            .find({ "isRecommended": true, "isShow": true })
            .sort({ name: 1 })
            .toArray();
    };

    // ORDER
    addOrder(order: any): Promise<any> {
        return this.db.collection('orders').insertOne(order);
    };

    getOrdersByUser(username): Promise<any> {
        return this.db.collection('orders')
            .find({ "user.username": username }, { _id: true, orderNumber: true, time: true, sum: true })
            .sort({ orderNumber: -1 })
            .toArray();
    };

    getOrderById(id): Promise<any> {
        return this.db.collection('orders')
            .find({ "_id": new mongodb.ObjectID(id) }, { "order": true, "_id": false })
            .toArray();
    };

    getOrdersCountNext(): Promise<any> {
        return this.db.collection("counter").findOneAndUpdate({ orders: "orders" }, { $inc: { count: 1 } }, { upsert: true })
    };


    // PORTAL (MENU 1lvl)
    getPortals(): Promise<any> {
        return this.db.collection('portals')
            .find({})
            .sort({ count: -1 })
            .toArray();
    };

    getPortalByID(id: string): Promise<any> {
        return this.db.collection('portals').findOne({ "_id": new mongodb.ObjectID(id) });
    };


    // PAGES
    getDelivery(): Promise<any> {
        return this.db.collection('pages').findOne({ "name": "delivery" });
    };

    getAbout(): Promise<any> {
        return this.db.collection('pages').findOne({ "name": "about" });
    };

    getContact(): Promise<any> {
        return this.db.collection('pages').findOne({ "name": "contact" });
    };

    getGreet(): Promise<any> {
        return this.db.collection('pages').findOne({ "name": "greet" });
    };


    // NEWS
    getNews(): Promise<any> {
        return this.db.collection('news')
            .find({})
            .toArray();
    };


    // USER
    getUserByID(id: string): Promise<any> {
        return this.db.collection('users').findOne({ "_id": new mongodb.ObjectID(id) });
    };

    getUserByName(username: string): Promise<any> {
        return this.db.collection('users').findOne({ "username": username });
    };

    addUser(user): Promise<any> {
        return this.db.collection('users').insertOne(user);
    };

    updateUser(id, user): Promise<any> {
        return this.db.collection('users').updateOne({ "_id": new mongodb.ObjectID(id) }, { $set: user })
    };


    // BANNERS
    getBanners(): Promise<any> {
        return this.db.collection('banners')
            .find({})
            .sort({ count: -1 })
            .toArray();
    };


    // SOME ADDITIONAL FUNCTIONS
    addDebugInfo(info): Promise<any> {
        return this.db.collection('debug').insertOne(info);
    };

    addMailResult(mail): Promise<any> {
        return this.db.collection('mails').insertOne(mail);
    };

    recoveryPassword(email): Promise<any> {
        return this.db.collection("users").findOne({ email: email });
    };


    // IP STATISTIC
    getIPsByDay(day: string): Promise<any> {
        return this.db.collection("ips").findOne({ day: day });
    };

    addIP(user): Promise<any> {
        return this.db.collection("ips").insertOne(user);
    };

    pushIP(user): Promise<any> {
        return this.db.collection("ips").findOneAndUpdate({ day: user.day }, { $push: { ips: user.ips[0] } }, { upsert: true })
    };
};


const db: Mongo = new Mongo();

export { db };
