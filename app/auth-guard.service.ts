import { Injectable } from "@angular/core";
import { CanActivate } from "@angular/router";

import { BackendService } from "./services/backend.service";
import { RouterExtensions } from 'nativescript-angular';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: RouterExtensions) {
    }

    canActivate() {
        if (BackendService.isLoggedIn()) {
            console.log("There is a user, Route can be activated");
            return true;
        } else {
            console.log("No User, Route can not be activated!");
            this.router.navigate(["/worktime-sign-in"]);
            return false;
        }
    }
}