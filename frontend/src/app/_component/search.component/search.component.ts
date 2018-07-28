import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import { openPage } from "../../_animation/animations";

import { SearchService } from '../../_service/search.service';

@Component({
    moduleId: module.id,
    selector: 'search',
    templateUrl: 'search.component.html',
    styleUrls: ['search.component.css'],
    animations: [openPage()]
})

export class SearchComponent {
    public showSearchResult = false;
    public searchList;
    public searchTerm$ = new Subject<string>();

    constructor(private router: Router, private searchService: SearchService) {
        this.searchService.search(this.searchTerm$)
            .subscribe(results => {
                console.log(results);
                this.searchList = results;
            });
    }

    showSearchResultChange(bool: boolean) {
        setTimeout(() => {
            // to delay FOCUSOUT from search bar
            this.showSearchResult = bool;
        }, 100);
    };

    enter() {
        this.router.navigate(['/search']);
    };

    onSelect(item) {
        this.router.navigate(['/item', item._id])
    };
};
