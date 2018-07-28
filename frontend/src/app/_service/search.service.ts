import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';

import { Item } from '../_model/item';


@Injectable()
export class SearchService {

    public baseUrl: string = '/api/search';
    public queryUrl: string = '?search=';
    public _searchResult: BehaviorSubject<Item[]> = new BehaviorSubject([]);
    public searchResult$ = this._searchResult.asObservable();

    constructor(private http: Http) { }

    public search(terms: Observable<string>) {
        return terms.debounceTime(400)
            .distinctUntilChanged()
            .switchMap(term => this.searchEntries(term));
    };

    private searchEntries(term: string) {
        if (!term) return Observable.of([]); // check empty search bar
        return this.http
            .get(this.baseUrl + this.queryUrl + encodeURIComponent(term))
            .map((res) => {
                this._searchResult.next(res.json());
                return res.json();
            });
    };

};