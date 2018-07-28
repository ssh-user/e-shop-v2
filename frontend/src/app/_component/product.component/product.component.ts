import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from "../../_service/auth.service";
import { openPage } from "../../_animation/animations";
import { Item } from '../../_model/item';
import { User } from '../../_model/user.model';

declare const $: any;

@Component({
    moduleId: module.id,
    selector: 'product',
    templateUrl: 'product.component.html',
    styleUrls: ['product.component.css'],
    animations: [openPage()]
})

export class ProductComponent implements OnInit {
    @Input() item: Item;
    public user: User;

    constructor(private auth: AuthService, ) { };

    ngOnInit() {
        this.auth.user$.subscribe((user) => {
            this.user = user;
        });

        $(document).ready(function () {
            setTimeout(() => { $('.tooltipped').tooltip({ delay: 50 }); }, 0)
        });

    };
};
