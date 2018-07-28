import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from '../../../_service/auth.service';
import { openPage, showHide } from "../../../_animation/animations";
import * as sha1 from "js-sha1";

import { User } from '../../../_model/user.model';

declare const Materialize: any;
declare const $: any;

@Component({
    moduleId: module.id,
    templateUrl: 'profile.component.html',
    styleUrls: ['profile.component.css'],
    animations: [openPage(), showHide()]
})

export class ProfileComponent implements OnInit {
    public user: User;

    // some alerts
    public alertFotoSize = false;
    public alertNeedPassword = false;
    public alertDifferentPasswords = false;
    public alertWrongPassword = false;


    constructor(
        private auth: AuthService,
        private router: Router
    ) { };

    ngOnInit() {
        this.auth.checkAuth().subscribe((user: User) => {
            this.user = user;
            setTimeout(() => {
                Materialize.updateTextFields();
            }, 0);
        }, (err) => {
            this.auth.logout().subscribe();
            this.router.navigate(["/home"]);
        });

    };

    logout() {
        this.auth.logout().subscribe((succ) => {
            Materialize.toast("Вы успешно вышли.", 1000);
            this.router.navigate(["/home"]);
        }, (err) => {
            Materialize.toast("Проблема сети. Нет связи с сервером.", 1000);
        })
    };

    // show prev image
    onChangeImage(files: FileList, image: HTMLImageElement) {
        let file = files[0];
        if (!file) return; // stop function if no any file

        // check file size
        if (file.size > 600000) {
            this.alertFotoSize = true; // show alert message
            setTimeout(() => { this.alertFotoSize = false }, 3000); // clear message after 3 sec
            return; // stop function
        };

        let reader = new FileReader();
        reader.onloadend = () => {
            image.src = reader.result;
        };

        reader.readAsDataURL(file);

    };


    save() {
        // check password field. If it's empty - show alert and interrupt a function
        let passwordElement = $("#passwordOld");
        if (passwordElement.val() == 0) {
            this.alertNeedPassword = true;
            passwordElement.addClass("invalid");
            $('html, body').animate({ scrollTop: passwordElement.offset().top }, 1000);
            setTimeout(() => { this.alertNeedPassword = false }, 3000);
            return;
        };

        // form obj is sending to server
        let form = new FormData();

        // get password hash
        sha1(passwordElement.val());
        const hash = sha1.create();
        hash.update(passwordElement.val());
        form.append("password", hash.hex());

        // check fio field and add if isn't empty
        let fio = $("#fio").val();
        if (fio != "") form.append("fio", fio);

        // check phone field and add if isn't empty
        let phone = $("#icon_telephone").val();
        if (phone != "") form.append("phone", phone);

        // check second phone field and add if isn't empty
        let secondPhone = $("#icon_telephone_second").val();
        if (secondPhone != "") form.append("secondphone", secondPhone);

        // check adress field and add if isn't empty
        let adress = $("#icon_adress").val();
        if (adress != "") form.append("adress", adress);

        // check adress field and add if isn't empty
        let newPassword = $("#newPassword");
        let newPasswordCopy = $("#newPasswordCopy");
        if (newPassword.val() != "" || newPasswordCopy.val() != "") { // check if any field aren't empty
            if (newPassword.val() == newPasswordCopy.val()) { // if fields aren't empty and the same both
                sha1(newPassword.val());
                const hash = sha1.create();
                hash.update(newPassword.val());
                form.append("new_password", hash.hex());
            } else { // if fields aren't empty but with different values
                newPassword.addClass("invalid");
                newPasswordCopy.addClass("invalid");
                this.alertDifferentPasswords = true;
                $('html, body').animate({ scrollTop: newPassword.offset().top }, 1000);
                setTimeout(() => { this.alertDifferentPasswords = false }, 3000);
                return; // stop
            };
        };

        // add image
        let file = (<HTMLInputElement>document.getElementById('userpicInput')).files[0];
        if (file && file.size < 600000) {
            form.append("image", file);
        };

        // send to server. If all is OK, get updated user and update current.
        this.auth.updateProfile(form).subscribe((user: User) => {
            this.auth.login(user);
            Materialize.toast("Профиль был успешно обновлён.", 1000);
            setTimeout(() => { this.router.navigate(["/home"]) }, 500);
        }, (err) => {
            if (err.status == 422) {
                this.alertWrongPassword = true;
                passwordElement.addClass("invalid");
                $('html, body').animate({ scrollTop: passwordElement.offset().top }, 1000);
                setTimeout(() => { this.alertWrongPassword = false }, 3000);
                return;
            };
            Materialize.toast("Проблема сети. Нет связи с сервером.", 1000);
        });

    };

};
