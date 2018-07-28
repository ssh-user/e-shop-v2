import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

import { News } from '../_model/news.model';


@Injectable()
export class NewsService {

    constructor(private http: Http) { };

    public getNews(): Observable<News[]> {
        return this.http.get('/api/news')
            .map((resp: Response) => {
                return resp.json();
            })
            .catch((error: any) => {
                return Observable.throw(error);
            });
    };

};
