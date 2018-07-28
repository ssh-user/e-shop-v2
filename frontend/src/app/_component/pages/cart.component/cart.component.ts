import { Component, OnInit } from '@angular/core';
import { CartService } from '../../../_service/cart.service';
import { AuthService } from "../../../_service/auth.service";
import { openPage } from "../../../_animation/animations";
import { Item } from '../../../_model/item';
import { User } from '../../../_model/user.model';

@Component({
    moduleId: module.id,
    selector: 'cart',
    templateUrl: 'cart.component.html',
    styleUrls: ['cart.component.css'],
    animations: [openPage()]
})

export class CartComponent implements OnInit {
    public productList: Item[];
    public sum: number;
    public discountSum: number;
    public user: User;

    constructor(private _cartService: CartService, private auth: AuthService) {
        this.sum = 0;
        this.discountSum = 0;
    };

    ngOnInit() {
        this._cartService.productList$.subscribe((list) => {
            this.productList = list;
            this.getSumAndDiscount();
        });

        this.auth.user$.subscribe((user) => {
            this.user = user;
            this.getSumAndDiscount();
        });
    };

    delete(index: number) {
        this._cartService.removeFromList(index);
        this.getSumAndDiscount();
    };


    getSumAndDiscount(): void {
        if (this.user && this.productList) {
            this.discountSum = this.getDiscountSum();
            this.sum = this.getSumWithDiscount();
        };
    };



    // sum calculate with discount
    private getSumWithDiscount(): number {
        let result = 0;
        let discount = +(this.user.discount);

        this.productList.forEach((elem) => {
            let pr = +elem.price;
            let disc = (pr * discount) / 100;
            // bad code, but without 'toFixed()' it does wrong calculate
            result += +(((+(pr - disc).toFixed(2) * elem.count).toFixed(2)));
        });
        return result;
    };

    private getDiscountSum(): number {
        let result = 0;

        this.productList.forEach((elem) => {
            let pr = +elem.price;
            result += +((pr * elem.count).toFixed(2));
        });

        let sumWithDisc = this.getSumWithDiscount();
        return result - sumWithDisc;
    };
};
