import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../_service/api.service';
import { Banner } from '../../_model/banner';

declare const $: any;
declare const Materialize: any;

@Component({
    moduleId: module.id,
    selector: 'banner',
    templateUrl: 'banner.component.html',
    styleUrls: ['banner.component.css']
})

export class BannerComponent implements OnInit {
    banners: Array<Banner>;

    constructor(private api: ApiService) { };

    ngOnInit() {
        this.api.getBanner().subscribe((banners) => {
            if (banners.length != 0) this.banners = banners;

            setTimeout(() => {
                $('.slider').slider({
                    interval: 6000
                });
                $('.next').on("click", () => {
                    console.log("click - next");
                    $('.slider').slider('next');
                });
                $('.prev').on("click", () => {
                    console.log("click - prev");
                    $('.slider').slider('prev');
                });
            }, 0);
        },
            (err) => Materialize.toast("Ошибка сервера. Баннер не удалось загрузить.", 4000)
        );
    };
};
