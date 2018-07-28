import { Injectable } from '@angular/core';


@Injectable()
export class ViewSettingService {
    public _viewProduct: boolean;
    public _viewSort: string;

    constructor() {
        let ls = localStorage.getItem("view_setting");
        if (ls) {
            let data = JSON.parse(ls);
            this._viewProduct = data.view;
            this._viewSort = data.sort;
        } else {
            this._viewProduct = true;
            this._viewSort = "name";
        };
    };


    get view_product(): boolean {
        return this._viewProduct;
    };

    set view_product(viewProduct: boolean) {
        if (typeof viewProduct == "boolean") {
            this._viewProduct = viewProduct;
            this._saveToLocalStorage();
        };
    };


    get viewSort(): string {
        return this._viewSort;
    };

    set viewSort(sort: string) {
        if (typeof sort == "string") {
            this._viewSort = sort;
            this._saveToLocalStorage();
        };
    };

    private _saveToLocalStorage(): void {
        let settings = JSON.stringify({
            view: this._viewProduct,
            sort: this._viewSort
        });
        localStorage.setItem("view_setting", settings);
    };
};