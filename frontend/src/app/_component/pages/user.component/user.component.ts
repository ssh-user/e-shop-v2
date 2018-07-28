import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from '../../../_service/api.service';
import { CartService } from '../../../_service/cart.service';
import { AuthService } from '../../../_service/auth.service';
import { openPage } from "../../../_animation/animations";

import { User } from '../../../_model/user.model';

declare const Materialize: any;

@Component({
    moduleId: module.id,
    selector: 'user',
    templateUrl: 'user.component.html',
    styleUrls: ['user.component.css'],
    animations: [openPage()]
})

export class UserComponent implements OnInit {
    public user: User;

    constructor(
        private router: Router,
        private cart: CartService,
        private api: ApiService,
        private auth: AuthService
    ) { };

    ngOnInit() {
        if (this.cart.getProductList().length == 0) {
            this.router.navigate(['']);
        };

        this.auth.user$.subscribe((user) => {
            this.user = JSON.parse(JSON.stringify(user));
            setTimeout(() => {
                Materialize.updateTextFields();
            }, 0);
        });
    };

    send() {
        let orderToServer = {
            user: this.user,
            order: this.cart.getProductList()
        };

        // create cart history for debug
        this.cart.setHistory();

        this.api.sendOrderToServer(orderToServer).subscribe(
            (answer: any) => {
                this.cart.clearCart();
                this.router.navigate(
                    ['/graz'], {
                        queryParams: {
                            'number': answer.number,
                            "success": true
                        }
                    }
                );
            },
            (err) => {
                // send debug info and navigate to error page
                if (err.status == 501) {
                    this.api.sendDebugInfo(this.getUserInfo()).subscribe((suc) => { }, (err) => { });
                    setTimeout(() => { this.router.navigate(['/error', '501']); }, 20);
                } else {
                    Materialize.toast("Ошибка сервера. Нет связи, попробуйте позже.", 4000);
                };
            }
        );
    };

    // collect debug info
    private getUserInfo() {
        let debug = {
            user: this.user,
            order: this.cart.getProductList(),
            info: {
                timeOpened: new Date(),
                timezone: (new Date()).getTimezoneOffset() / 60,

                pageon: window.location.pathname,
                referrer: document.referrer,
                previousSites: history.length,

                browserName: navigator.appName,
                browserEngine: navigator.product,
                browserVersion1a: navigator.appVersion,
                browserVersion1b: navigator.userAgent,
                browserLanguage: navigator.language,
                browserOnline: navigator.onLine,
                browserPlatform: navigator.platform,
                javaEnabled: navigator.javaEnabled(),
                dataCookiesEnabled: navigator.cookieEnabled,
                dataCookies1: document.cookie,
                dataStorage: localStorage,

                sizeScreenW: screen.width,
                sizeScreenH: screen.height,
                sizeInW: innerWidth,
                sizeInH: innerHeight,
                sizeAvailW: screen.availWidth,
                sizeAvailH: screen.availHeight,
                scrColorDepth: screen.colorDepth,
                scrPixelDepth: screen.pixelDepth
            }
        };
        return debug;
    };


};