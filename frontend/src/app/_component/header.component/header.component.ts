import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CartService } from '../../_service/cart.service';


@Component({
    moduleId: module.id,
    selector: 'app-header',
    templateUrl: 'header.component.html',
    styleUrls: ['header.component.css']
})

export class HeaderComponent implements OnInit {
    @Input() countNews: number;
    public productCounter = 0;

    constructor(private cart: CartService) {
    };

    ngOnInit() {
        this.cart.count$.subscribe((count) => {
            this.productCounter = count;
        });
    };

};
