import { Component, Input, OnInit } from '@angular/core';
import { CartService } from '../../_service/cart.service';

import { Category } from '../../_model/category';


@Component({
    moduleId: module.id,
    selector: 'hide-menu',
    templateUrl: 'hide-menu.component.html',
    styleUrls: ['hide-menu.component.css']
})

export class HideMenuComponent implements OnInit {
    @Input() daughtersMenu: Category[];
    @Input('countNews') countNews: number;

    public productCounter = 0;

    constructor(private cart: CartService) { };


    ngOnInit() {
        this.cart.count$.subscribe((count) => {
            this.productCounter = count;
        });
    };

};