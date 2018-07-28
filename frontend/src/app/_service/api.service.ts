import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

import { Category } from '../_model/category';
import { Item } from '../_model/item';


@Injectable()
export class ApiService {

    constructor(private http: Http) { }

    getMenu(): Observable<Category[]> {
        return this.http.get('/api/portals')
            .map((resp: Response) => {
                return resp.json();
            })
            .catch((error: any) => {
                return Observable.throw(error);
            });
    };

    getCategoryByID(id: string): Observable<Category> {
        return this.http.get('/api/portal/' + id)
            .map((resp: Response) => {
                return (resp.json());
            })
            .catch((error: any) => {
                return Observable.throw(error);
            });
    };

    getItemListByID(id: string): Observable<any> {
        return this.http.get('/api/products/' + id)
            .map((resp: Response) => {
                return resp.json();
            })
            .catch((error: any) => {
                return Observable.throw(error);
            });
    };

    getItemByID(id: string): Observable<Item> {
        return this.http.get('/api/product/' + id)
            .map((resp: Response) => {
                return (resp.json());
            })
            .catch((error: any) => {
                return Observable.throw(error);
            });
    };

    sendOrderToServer(order: any) {
        return this.http.post("/api/order", order)
            .map((resp: Response) => resp.json())
            .catch((error: any) => Observable.throw(error));
    };

    getDelivery(): Observable<string> {
        return this.http.get("/api/delivery")
            .map((resp: Response) => resp.text())
            .catch((error: any) => Observable.throw(error));
    };

    getAbout(): Observable<string> {
        return this.http.get("/api/about")
            .map((resp: Response) => resp.text())
            .catch((error: any) => Observable.throw(error));
    };

    getContact(): Observable<string> {
        return this.http.get("/api/contact")
            .map((resp: Response) => resp.text())
            .catch((error: any) => Observable.throw(error));
    };

    getGreet(): Observable<string> {
        return this.http.get("/api/greet")
            .map((resp: Response) => resp.text())
            .catch((error: any) => Observable.throw(error));
    };

    getBanner(): Observable<any[]> {
        return this.http.get("/api/banners")
            .map((resp: Response) => resp.json())
            .catch((error: any) => Observable.throw(error));
    };

    getRecommendedItem(): Observable<Item[]> {
        return this.http.get('/api/recommended')
            .map((resp: Response) => {
                return resp.json();
            })
            .catch((error: any) => {
                return Observable.throw(error);
            });
    };

    sendDebugInfo(info) {
        return this.http.post("/api/debug", info)
            .map((resp: Response) => resp.json())
            .catch((error: any) => Observable.throw(error));
    };

    getHistory() {
        return this.http.get("/api/history")
            .map((resp: Response) => resp.json())
            .catch((error: any) => Observable.throw(error));
    };

    getHistoryOrder(id: string) {
        return this.http.get(`/api/history/${id}`)
            .map((resp: Response) => resp.json())
            .catch((error: any) => Observable.throw(error));
    };
};
