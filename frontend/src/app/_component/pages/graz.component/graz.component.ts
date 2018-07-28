import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { openPage } from "../../../_animation/animations";

@Component({
    moduleId: module.id,
    templateUrl: 'graz.component.html',
    styleUrls: ['graz.component.css'],
    animations: [openPage()]
})

export class GrazComponent implements OnInit {

    public success: boolean = false;
    public number: number;

    constructor(private route: ActivatedRoute) { };

    ngOnInit() {
        this.route.queryParams.subscribe(
            (queryParam: any) => {
                this.success = queryParam['success'];
                this.number = queryParam['number'];
            }
        );
    };

};
