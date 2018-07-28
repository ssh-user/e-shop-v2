import { Component, OnInit } from '@angular/core';
import { NewsService } from '../../../_service/news.service';
import { openPage } from "../../../_animation/animations";
import { News } from "../../../_model/news.model";

declare const Materialize: any;

@Component({
    moduleId: module.id,
    selector: 'news',
    templateUrl: 'news.component.html',
    styleUrls: ['news.component.css'],
    animations: [openPage()]
})

export class NewsComponent {
    public newsCard: News[] = [];

    constructor(private news: NewsService) { };

    ngOnInit() {
        this.news.getNews().subscribe((news) => {
            this.newsCard = news;
        }, (err) => {
            Materialize.toast("Ошибка сервера. Нет связи с ним.", 4000);
        });
    };

};
