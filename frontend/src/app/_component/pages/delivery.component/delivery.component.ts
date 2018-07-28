import { Component, OnInit } from '@angular/core';
import { ApiService } from "../../../_service/api.service";
import { openPage } from "../../../_animation/animations";

declare const Materialize: any;

@Component({
    moduleId: module.id,
    selector: 'delivery',
    templateUrl: 'delivery.component.html',
    styleUrls: ['delivery.component.css'],
    animations: [openPage()]
})

export class DeliveryComponent {
    public delivery;

    constructor(private api: ApiService) {
    };

    ngOnInit() {
        this.api.getDelivery().subscribe((text) => {
            if (text.length == 0) this.delivery = "<p class='center red-text' style='font-size: 2em; font-weight: 700; font-family: nautilus;'>Простите, в данный момент эта страница пуста.</p>";
            else this.delivery = text;
        }, (err) => {
            Materialize.toast("Ошибка сервера. Нет связи с ним.", 4000);
        });
    };
};
