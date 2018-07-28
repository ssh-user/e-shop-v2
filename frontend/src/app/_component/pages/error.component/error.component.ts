import { Component } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { openPage } from "../../../_animation/animations";

@Component({
    moduleId: module.id,
    selector: 'error-page',
    templateUrl: 'error.component.html',
    styleUrls: ['error.component.css'],
    animations: [openPage()]
})

export class ErrorComponent {
    public error: number;

    constructor(private route: ActivatedRoute) { };

    ngOnInit() {
        this.route.params.subscribe((params) => {
            switch (+(params['id'])) {
                case 501: this.error = 501; break;
                default: this.error = 404; break;
            };
        });
    };
};
