import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../_service/api.service';
import { openPage, showHide } from "../../../_animation/animations";


declare const Materialize: any;
declare const $: any;

@Component({
    moduleId: module.id,
    templateUrl: 'profile_history.component.html',
    styleUrls: ['profile_history.component.css'],
    animations: [openPage(), showHide()]
})

export class ProfileHistoryComponent implements OnInit {
    public orders;

    constructor(private http: ApiService) { };

    ngOnInit() {
        this.http.getHistory().subscribe((orders = []) => {
            this.orders = orders;
        }, (err) => {
            Materialize.toast("Нет связи с сервером. Попробуйте позже.", 3000);
        });
    };

    fullOrder(e) {
        // very bad code. Angular doesnt solve it.
        let id = e.currentTarget.parentNode.parentNode.id;
        let elem = e.currentTarget.parentNode.parentNode.nextSibling.nextSibling;
        let toggleElement = $(e.currentTarget.parentNode.parentNode.nextSibling.nextSibling);
        let outerElement = toggleElement.children(".outer");

        if (toggleElement.hasClass("hide")) {
            toggleElement.removeClass("hide").addClass("show");
            let request = this.http.getHistoryOrder(id).subscribe((order) => {

                outerElement.html(this._helperTemplate(order));

                request.unsubscribe();
            }, (err) => {
                Materialize.toast("Нет связи с сервером. Попробуйте позже.", 3000);
            });
        } else {
            outerElement.html('<p class="font2">Идет загрузка ...</p>');
            toggleElement.removeClass("show").addClass("hide");
        };

    };

    scroll() {
        $("html, body").animate({ scrollTop: 0 }, "fast");
        return false;
    };


    private _helperTemplate(orders): string {
        let template = `<table class="bordered striped centered responsive-table"><tbody>`;

        for (let order of orders) {
            template += `<tr>
                <td><p class="font2 blue-text"><b>${order.name}</b></p></td>
                <td><p class="font2"><b class="red-text">${order.price}</b> грн.</p></td>
                <td><p class="font2">${order.count} шт.</p></td>
                <td><p class="font2"><b class="red-text">${(order.price * order.count).toFixed(2)}</b>  грн.</p></td>
            </tr>`;
        };

        let sum = 0;
        for (let o of orders) sum += o.price * o.count;

        template += `<tr>
            <td colspan="3"><p class="font2 blue-text"><b>Итого:</b></p></td>
            <td><p class="font2"><b class="red-text">${sum.toFixed(2)}</b> грн.</p></td>
        </tr>`;
        template += `</tbody></table>`;
        return template;
    };
};
