import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

import { ApiService } from '../../../_service/api.service';
import { CartService } from '../../../_service/cart.service';
import { AuthService } from '../../../_service/auth.service';
import { openPage } from "../../../_animation/animations";

import { Item } from '../../../_model/item';

declare const $: any;
declare const Materialize: any;

@Component({
    moduleId: module.id,
    selector: 'item',
    templateUrl: 'item.component.html',
    styleUrls: ['item.component.css'],
    animations: [openPage()]
})

export class ItemComponent implements OnInit {
    public item: Item;
    public user;

    constructor(
        private api: ApiService,
        private activateRoute: ActivatedRoute,
        private router: Router,
        private cart: CartService,
        private auth: AuthService,
        private title: Title,
        private meta: Meta
    ) { };

    ngOnInit() {
        this.auth.user$.subscribe((user) => {
            this.user = user;
        });

        this.activateRoute.params.subscribe((params) => {
            this.api.getItemByID(params['id']).subscribe(item => {
                this.item = item;
                this.title.setTitle(item.name);
                this.meta.updateTag({
                    name: "description",
                    content: $(item.description).text() || "Нет описания"
                });

                setTimeout(() => {
                    var fotorama = $('.fotorama');

                    // if itsn't a new view initialization
                    if (fotorama.data('fotorama')) {
                        fotorama.data('fotorama').destroy(); // delete prev data

                        let imgArr = item.image.map((elem) => { // convert image url to FOTORAMA standart
                            return { img: "/assets/images/" + elem };
                        });

                        fotorama.fotorama({ // dynamically change imges
                            data: imgArr
                        });
                        return; // stop
                    };
                    fotorama.fotorama();
                }, 0);
            }, (err: any) => {
                if (err.status == 404) {
                    this.router.navigate(["/home"]);
                    Materialize.toast("Такого продукта уже нет в магазине.", 3000);
                } else {
                    Materialize.toast("Ошибка сервера. Нет данных от него.", 4000);
                };
            });
        });
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

    buy() {
        let orderItem = JSON.parse(JSON.stringify(this.item)); // deep copy    
        orderItem.count = +($("#count").val()); // count of product

        this.cart.addToList(orderItem);
    };

};