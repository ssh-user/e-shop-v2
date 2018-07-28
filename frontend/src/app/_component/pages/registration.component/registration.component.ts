import { Component } from '@angular/core';
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../../_service/auth.service";
import { openPage } from "../../../_animation/animations";
import * as sha1 from "js-sha1";

declare const Materialize: any;
declare const $: any;


@Component({
    moduleId: module.id,
    templateUrl: 'registration.component.html',
    styleUrls: ['registration.component.css'],
    animations: [openPage()]
})

export class RegistrationComponent {
    public autologin = true;

    constructor(private auth: AuthService, private router: Router) { };

    onSubmit(form: NgForm) {
        let toSend = {
            username: form.value.username,
            password: form.value.password,
            email: form.value.email
        };

        sha1(form.value.password);
        const hash = sha1.create();
        hash.update(form.value.password);
        toSend.password = hash.hex();

        this.auth.registration(toSend).subscribe((success) => {
            this.auth.authorization(toSend).subscribe((user) => {
                this.auth.login(user);
                Materialize.toast("Вы успешно зарегистрировались и вошли.", 1000);
                setTimeout(() => this.router.navigate(['/profile']), 800);

            }, (error) => {
                Materialize.toast("Ошибка сервера. Попробуйте позже.", 4000);
            });

        }, (error) => {
            if (error.status == 409) {
                Materialize.toast("Пользователь с таким именем уже существует. Выберите другой ник.", 4000);
                $("#username").addClass("invalid");
            } else {
                Materialize.toast("Ошибка сервера. Попробуйте позже.", 4000);
            }
        });
    };


};
