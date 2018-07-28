import { Component, OnInit } from '@angular/core';
import { ApiService } from "../../../_service/api.service";
import { openPage } from "../../../_animation/animations";

declare const Materialize: any;

@Component({
    moduleId: module.id,
    selector: 'about',
    templateUrl: 'about.component.html',
    styleUrls: ['about.component.css'],
    animations: [openPage()]
})

export class AboutComponent implements OnInit {

    public about;

    constructor(private api: ApiService) {
    };

    ngOnInit() {
        this.api.getAbout().subscribe((text) => {
            if (text.length == 0) this.about = "<p class='center red-text' style='font-size: 2em; font-weight: 700; font-family: nautilus;'>Простите, в данный момент эта страница пуста.</p>";
            else this.about = text;
        }, (err) => {
            Materialize.toast("Ошибка сервера. Нет связи с ним.", 4000);
        });
    };
};