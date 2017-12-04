import { Injectable } from "@angular/core";
import { CanActivate } from "@angular/router";

import { BackendService } from "./shared/backend.service";
import { RouterExtensions } from 'nativescript-angular';
import { User } from 'nativescript-plugin-firebase';
import { UtilsService } from './shared/UtilsService';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: RouterExtensions,
                private backendServe: BackendService,
                private utils: UtilsService) {
    }

    canActivate() {
        return this.backendServe.isLoggedIn().then((user: User) => {
            if (!user) {
                console.log("No User, Route can not be activated!");
                this.router.navigate(["/login"]);
                return false;
            } else {
                console.log("There is a user, Route can be activated");
                return true;
            }
        }).catch(err => {
            // this.utils.handleError(err);
            this.router.navigate(["/login"]);
            return false;
        });

        // this.router.navigate(["/login"]);
        // return false;
    }
}