import { Component, OnInit } from '@angular/core';
import { SearchService } from '../../../_service/search.service';
import { openPage } from "../../../_animation/animations";

declare const $: any;

@Component({
    moduleId: module.id,
    templateUrl: 'search.component.html',
    styleUrls: ['search.component.css'],
    animations: [openPage()]
})

export class SearchPageComponent implements OnInit {
    public searchList;

    constructor(private search: SearchService) { };

    ngOnInit() {
        this.search.searchResult$.subscribe((list) => {
            this.searchList = list;
        });
    };


    scroll() {
        $("html, body").animate({ scrollTop: 0 }, "fast");
        return false;
    };
};
