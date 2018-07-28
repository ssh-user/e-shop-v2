import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../_service/api.service';
import { openPage } from "../../../_animation/animations";
import { Item } from "../../../_model/item";
import { Title, Meta } from '@angular/platform-browser';

declare const Materialize: any;

@Component({
    moduleId: module.id,
    selector: 'home-page',
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.css'],
    animations: [openPage()]
})

export class HomeComponent implements OnInit {

    public greet: string;
    public recommendedItem: Item[];

    constructor(
        private api: ApiService,
        private title: Title,
        private meta: Meta
    ) {
    };

    ngOnInit() {
        this.api.getGreet().subscribe((text) => {
            this.greet = text;
        },
            (err) => {
                Materialize.toast("Ошибка сервера. Приветствие не удалось загрузить.", 4000);
            }
        );

        this.api.getRecommendedItem().subscribe((arr) => {
            this.recommendedItem = arr;
            this.title.setTitle("Подсолнух");
            this.meta.updateTag({
                name: "description",
                content: "Интернет магазин Подсолнух. Лучшие товары для дома из Европы. Низкие цены. Высокое качество."
            });
        },
            (err) => {
                Materialize.toast("Ошибка сервера. Рекомендованые товары не удалось загрузить.", 4000);
            }
        );
    };
};