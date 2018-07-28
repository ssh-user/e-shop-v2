import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { Observable } from "rxjs/Rx";

import { AuthService } from '../../../_service/auth.service';

@Injectable()
export class ProfileGuard implements CanActivate {

    constructor(private auth: AuthService, private router: Router) { };

    canActivate(
        route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {

        if (this.auth._isAuthorized) {
            return true;
        } else {
            this.router.navigate(["/login"]);
            return false;
        };
    };
};