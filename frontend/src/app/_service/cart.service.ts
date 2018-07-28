import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Item } from '../_model/item';

declare const Materialize: any;

@Injectable()
export class CartService {
    public _count = new Subject<number>();
    public _productList: BehaviorSubject<Item[]> = new BehaviorSubject([]);

    public count$ = this._count.asObservable();
    public productList$ = this._productList.asObservable();

    constructor() {
        // restore prev state of cart storage
        if (this._getFromLocalStorage()) {
            this._productList.next(this._getFromLocalStorage());
            setTimeout(() => { this.setCount(this._productList.getValue().length); }, 0); //hack to call event change
        };
    };

    addToList(item: Item) {
        // it's bad string of code, but the easiest way. After some add product to cart, he see a message.
        Materialize.toast("Товар в корзине!", 1000);

        let productList = this._productList.getValue();
        for (let index = 0; index < productList.length; index++) {
            if (productList[index]._id == item._id) {
                productList[index].count += item.count;

                this._setLocalStorage();
                this.setCount(this._productList.getValue().length);
                return;
            };
        };


        this._productList.getValue().push(item);
        this._setLocalStorage();
        this.setCount(this._productList.getValue().length);
    };

    getProductList(): Item[] {
        return this._productList.getValue();
    };

    removeFromList(index: number) {
        this._productList.getValue().splice(index, 1);

        this._setLocalStorage();
        this.setCount(this._productList.getValue().length);
    };

    clearCart() {
        this._productList.next([]);
        this.setCount(0);
        this._setLocalStorage();
    };

    // get and set Hystory, only for some debug. There were some problem (at prev version of site) when order was empty.
    setHistory() {
        localStorage.setItem("debug_cart", JSON.stringify(this._productList.getValue()));
    };

    getHistory() {
        let temp = localStorage.getItem("debug_cart");
        if (temp) return JSON.parse(temp);
        return null;
    };

    private setCount(value: number) {
        this._count.next(value);
    };


    private _setLocalStorage(): void {
        localStorage.setItem("cart_list", JSON.stringify(this._productList.getValue()));
    };

    private _getFromLocalStorage() {
        let temp = localStorage.getItem("cart_list");
        if (temp) return JSON.parse(temp);
        return null;
    };
};