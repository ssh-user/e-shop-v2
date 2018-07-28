import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../_service/auth.service';

import { User } from '../../_model/user.model';

@Component({
    moduleId: module.id,
    selector: 'auth-menu',
    templateUrl: 'auth.component.html',
    styleUrls: ['auth.component.css']
})

export class AuthMenuComponent implements OnInit {
    public user: User;

    constructor(private auth: AuthService) { };

    ngOnInit() {
        this.auth.user$.subscribe((user) => {
            this.user = user;
        }, (err) => { });

        if (!this.auth.isSendReqToCheck) this.auth.checkAuth().subscribe((user: User) => {
            this.user = user;
            this.auth.login(user);
        });
    };

};
