import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

import { ApiService } from '../../../_service/api.service';
import { Category } from '../../../_model/category';
import { openPage } from "../../../_animation/animations";

@Component({
    moduleId: module.id,
    selector: 'portal',
    templateUrl: 'portal.component.html',
    styleUrls: ['portal.component.css'],
    animations: [openPage()]
})


export class PortalComponent {

    public category: Category;

    constructor(
        private api: ApiService,
        private activateRoute: ActivatedRoute,
        private title: Title,
        private meta: Meta) {

        this.activateRoute.params.subscribe((params) => {
            this.api.getCategoryByID(params['id']).subscribe((portal) => {
                this.category = portal;
                this.title.setTitle(portal.name);
                this.meta.updateTag({
                    name: "description",
                    content: portal.description || portal.name
                });
            });
        });
    };

};
