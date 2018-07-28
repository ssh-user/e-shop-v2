import { Component, OnInit } from '@angular/core';
import { ApiService } from "../../../_service/api.service";
import { openPage } from "../../../_animation/animations";

declare const Materialize: any;

@Component({
    moduleId: module.id,
    selector: 'contact',
    templateUrl: 'contact.component.html',
    styleUrls: ['contact.component.css'],
    animations: [openPage()]
})

export class ContactComponent implements OnInit {

    public contact;

    constructor(private api: ApiService) {
    };

    ngOnInit() {
        this.api.getContact().subscribe((text) => {
            if (text.length == 0) this.contact = "<p class='center red-text' style='font-size: 2em; font-weight: 700; font-family: nautilus;'>Простите, в данный момент эта страница пуста.</p>";
            else this.contact = text;
        }, (err) => {
            Materialize.toast("Ошибка сервера. Нет связи с ним.", 4000);
        });
    };
};
