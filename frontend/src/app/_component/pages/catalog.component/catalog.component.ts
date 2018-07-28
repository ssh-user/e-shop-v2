import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

import { CartService } from '../../../_service/cart.service';
import { ApiService } from '../../../_service/api.service';
import { AuthService } from '../../../_service/auth.service';
import { ViewSettingService } from '../../../_service/view_serrings.service';
import { openPage } from "../../../_animation/animations";
import { Item } from '../../../_model/item';
import { User } from '../../../_model/user.model';

declare const $: any;

@Component({
    moduleId: module.id,
    selector: 'catalog',
    templateUrl: 'catalog.component.html',
    styleUrls: ['catalog.component.css'],
    animations: [openPage()]
})

export class CatalogComponent implements OnInit {
    public view: boolean; // change tempeates card or table views
    public view_sort: string; // change 1-2-3 to add\remove css class

    public user: User;
    public itemList: Item[];
    public p: number;

    constructor(
        private api: ApiService,
        private auth: AuthService,
        private activateRoute: ActivatedRoute,
        private cart: CartService,
        private settings: ViewSettingService,
        private title: Title,
        private meta: Meta
    ) { };

    ngOnInit() {
        this.p = 1;
        this.view = this.settings.view_product;
        this.view_sort = this.settings.viewSort;

        this.auth.user$.subscribe((user) => {
            this.user = user;
        });

        this.activateRoute.params.subscribe((params) => {
            this.api.getItemListByID(params['id']).subscribe((category) => {
                this.itemList = category.products;
                this.title.setTitle(category.category.name);
                this.meta.updateTag({
                    name: "description",
                    content: category.category.description || category.category.name
                });
                this.sort(this.settings.viewSort);

                // reset currentPage of paginator to 1 page
                this.p = 1;

                // hack to add css rule to active element menu
                this.activeCategory(params['id']);
            });
        });
    };

    scroll() {
        $("html, body").animate({ scrollTop: 0 }, "fast");
        return false;
    };

    changeView(line: boolean) {
        this.settings.view_product = line;
        this.view = line;
    };

    increment(e: Event) {
        let input = $(e.target).parent("div").children("input");
        if (+input.val() < 1000) {
            input.val(+input.val() + 1);
        };
    };

    decrement(e: Event) {
        let input = $(e.target).parent("div").children("input");
        if (+input.val() > 1) {
            input.val(+input.val() - 1);
        };
    };

    table_view_addToCart(e, item: Item) {
        let orderItem = JSON.parse(JSON.stringify(item)); // deep copy    
        //shit
        orderItem.count = +(e.target.parentElement.parentElement.parentElement.getElementsByTagName("input")[0].value);
        this.cart.addToList(orderItem);
    };

    sort(sortBy: string) {
        this.settings.viewSort = sortBy;
        this.view_sort = sortBy;

        switch (sortBy) {
            case 'price':
                this.itemList.sort((a: Item, b: Item) => {
                    return a.price - b.price;
                });
                break;

            case 'name':
                this.itemList.sort((a: Item, b: Item) => {
                    if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                    if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                    return 0;
                });
                break;

            case 'stock':
                this.itemList.sort((a: Item, b: Item) => {
                    if (a.isStock && !b.isStock) return -1;
                    if (a.isStock && b.isStock) return 0;
                    if (!a.isStock && !b.isStock) return 0;
                    if (!a.isStock && b.isStock) return 1;
                });
                break;

            default:
                break;
        }
    };

    // bad hack
    activeCategory(id: string) {
        // remove prev active menu from element
        let arr = Array.from(document.getElementsByClassName("active_menu"));
        for (let elem of arr) {
            elem.classList.remove("active_menu");
        };

        // add to active element menu
        document.getElementById(id).classList.add("active_menu");
    };
};
