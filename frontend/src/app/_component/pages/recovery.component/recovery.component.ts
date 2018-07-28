import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../../_service/auth.service';
import { openPage } from "../../../_animation/animations";
import * as sha1 from "js-sha1";

declare const Materialize: any;

@Component({
    moduleId: module.id,
    templateUrl: 'recovery.component.html',
    styleUrls: ['recovery.component.css'],
    animations: [openPage()]
})

export class RecoveryComponent {

    constructor(private auth: AuthService, private router: Router) { };

    onSubmit(form: NgForm) {
        let email = { email: form.value.email };

        this.auth.recoveryPassword(email).subscribe(
            (result) => {
                Materialize.toast("Выслан новый пароль на указанный почтовый адрес. Это может занять несколько минут.", 10000);
                setTimeout(() => {
                    this.router.navigate(['/login']);
                }, 6000);
            },
            (error) => {
                if (error.status == 403) {
                    Materialize.toast("Ошибка. Неправильный адрес почты.", 4000);
                } else {
                    Materialize.toast("Ошибка сервера. Возможно нет связи с ним.", 4000);
                };
            }
        );
    };

};
