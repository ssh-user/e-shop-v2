import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http, Headers, Response } from '@angular/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { User } from '../_model/user.model';


let guest: User = {
    username: "Гость",
    email: "",
    adress: "",
    image: "userpic_default_.jpg",
    phone: "",
    note: "",
    discount: 0
};


@Injectable()
export class AuthService {

    public _user: BehaviorSubject<User> = new BehaviorSubject(guest);
    public user$ = this._user.asObservable();
    public _isAuthorized: boolean;

    // hack for prevent double requests
    public isSendReq: boolean;
    public isSendReqToCheck: boolean;

    constructor(private http: Http) {
        this.isSendReq = false;
        this.isSendReqToCheck = false;
        this._isAuthorized = false;
    };

    public authorization(data: any): Observable<User> {
        this.isSendReq = true;

        return this.http.post("/api/auth", data)
            .map((resp: Response) => {
                this.isSendReq = false;
                this._isAuthorized = true;
                return resp.json();
            })
            .catch((error: any) => {
                this.isSendReq = false;

                return Observable.throw(error);
            });
    };

    public checkAuth(): Observable<User> {
        this.isSendReqToCheck = true;

        return this.http.get("/api/checkAuth")
            .map((resp: Response) => {
                this.isSendReqToCheck = false;
                return resp.json();
            })
            .catch((error: any) => {
                this.isSendReqToCheck = false;
                return Observable.throw(error);
            });
    };

    public login(user: User) {
        this._user.next(user);
        this._isAuthorized = true;
    };

    public logout(): Observable<any> {
        return this.http.get("/api/logout")
            .map((resp: Response) => {
                this._isAuthorized = false;
                this._user.next(guest);
                return "OK";
            })
            .catch((error: any) => {
                return Observable.throw(error);
            });

    };

    public registration(data: any): Observable<any> {
        return this.http.post("/api/reg", data)
            .map((resp: Response) => {
                return "OK";
            })
            .catch((error: any) => {
                return Observable.throw(error);
            });
    };

    public updateProfile(data: FormData): Observable<User> {
        let headers = new Headers({ 'Accept': 'application/json', 'Content-Type': 'application/json' });
        return this.http.post("/api/profile", data, { headers: headers })
            .map((resp: Response) => resp.json())
            .catch((error: any) => Observable.throw(error));
    };

    public recoveryPassword(email: Object): Observable<any> {
        return this.http.post("/api/recovery", email)
            .map((resp: Response) => {
                return "OK";
            })
            .catch((error: any) => {
                return Observable.throw(error);
            });
    };
};
