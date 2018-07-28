import { Component, OnInit } from '@angular/core';

import { ApiService } from './_service/api.service';
import { NewsService } from './_service/news.service';
import { openPage } from './_animation/animations';
import { Category } from './_model/category';

declare const $: any;
declare const Materialize: any;

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  animations: [openPage()]
})

export class AppComponent implements OnInit {
  public menu: Category[];
  public countNews: number;

  constructor(private api: ApiService, private news: NewsService) { };

  ngOnInit() {
    this.api.getMenu().subscribe(
      (data) => {
        this.menu = data;

        // bad code. 
        setTimeout(function () {
          $(".button-collapse").sideNav({
            menuWidth: 250,
            closeOnClick: true
          });

          $('.collapsible').collapsible();
        }, 50);

      },
      (err) => {
        Materialize.toast("Ошибка сервера. Категории товаров не удалось загрузить.", 4000);
      });

    this.news.getNews().subscribe((data) => {
      this.countNews = data.length;
    }, (err) => {
      Materialize.toast("Ошибка сервера. Акции не удалось загрузить.", 4000);
    });
  };

  onDeactivate() {
    document.body.scrollTop = 0;
  }

};
