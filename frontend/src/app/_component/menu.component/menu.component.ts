import { Component, Input } from '@angular/core';
import { Category } from '../../_model/category';

@Component({
    moduleId: module.id,
    selector: 'menu',
    templateUrl: 'menu.component.html',
    styleUrls: ['menu.component.css']
})

export class MenuComponent {

    @Input() daughtersMenu: Category[];

};
