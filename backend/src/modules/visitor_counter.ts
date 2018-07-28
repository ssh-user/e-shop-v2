import * as getIp from "request-ip";
import { db } from './mongo';

// flag to prevent multy adding to DB a new day (when come a few requests before the first added to DB)
let flag = true;

export function counter(req, res, next) {

    if (flag) {
        flag = false;

        let user = {
            day: new Date().toDateString(),
            ips: [getIp.getClientIp(req)]
        };

        // check is this day in DB
        db.getIPsByDay(user.day)
            .then((result) => {
                // if this day NEW and DB return NULL add new day to DB
                if (!result) {
                    db.addIP(user);
                    flag = true;
                }
                // if this day IS in DB next step
                else return result;
            })
            .then((result) => {
                // search this ip in array IPs from DB. If find - just interrupt Promise
                for (let ip of result.ips) {
                    if (ip == user.ips[0]) throw new Error("nothing to do");
                };
                // if loop of array pass whithout interrupt we add this IP to db. this ip is unique.
                db.pushIP(user);
                flag = true;
            })
            .catch((err) => {
                flag = true;
            });
    };

    next();
};
