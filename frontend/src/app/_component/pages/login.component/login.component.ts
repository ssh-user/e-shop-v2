import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../../_service/auth.service';
import { openPage } from "../../../_animation/animations";
import * as sha1 from "js-sha1";

declare const Materialize: any;

@Component({
    moduleId: module.id,
    templateUrl: 'login.component.html',
    styleUrls: ['login.component.css'],
    animations: [openPage()]
})

export class LoginComponent implements OnInit {

    constructor(private auth: AuthService, private router: Router) { };

    ngOnInit() {
        // hack. When user reboot page at PROFILE page shows LOGIN page. To prevent this i use this simple hack 
        setTimeout(() => {
            if (this.auth._isAuthorized) {
                this.router.navigate(["/profile"]);
            };
        }, 20);
    };

    onSubmit(form: NgForm) {
        let toSend = {
            username: form.value.username,
            password: form.value.password
        };

        sha1(form.value.password);
        const hash = sha1.create();
        hash.update(form.value.password);
        toSend.password = hash.hex();

        this.auth.authorization(toSend).subscribe(
            (user) => {
                this.auth.login(user);
                Materialize.toast("Вы успешно авторизовались.", 4000);
                this.router.navigate(['/']);
            },
            (error) => {
                if (error.status == 401) {
                    Materialize.toast("Ошибка авторизации. Неправильный логин или пароль.", 4000);
                } else {
                    Materialize.toast("Ошибка сервера. Возможно нет связи с ним.", 4000);
                };
            }
        );
    };

};
