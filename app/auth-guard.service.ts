import { Injectable } from "@angular/core";
import { CanActivate } from "@angular/router";

import { BackendService } from "./services/backend.service";
import { RouterExtensions } from 'nativescript-angular';
import { UtilsService } from './services/utils.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: RouterExtensions,
                private backend: BackendService,
                private utils: UtilsService) {
    }

    canActivate(): Promise<boolean> {
        return new Promise(resolve => {
            this.backend.getCurrentUser().then(user => {
                console.log(`There is a user and email is ${user.emailVerified ? "verified" : " not verified"}`);
                if (!user.emailVerified) {
                    this.router.navigate(["/worktime-sign-in"]);
                }
                resolve(user.emailVerified);
            }).catch(() => {
                console.log("No User, Route can not be activated!");
                this.router.navigate(["/worktime-sign-in"]);
                resolve(false);
            })
        });
    }
}