import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from 'nativescript-angular';
import { BackendService } from '../../shared/backend.service';
import { User } from 'nativescript-plugin-firebase';
import { UtilsService } from '../../shared/UtilsService';
import { LoadingIndicator, OptionsCommon } from "nativescript-loading-indicator";
import { Page } from 'tns-core-modules/ui/page';

@Component({
    selector: "LoginPage",
    moduleId: module.id,
    templateUrl: "./login.component.html"
})
export class LoginComponent implements OnInit {
    email: string;
    password: string;

    //Loading indicator
    loader: LoadingIndicator;
    loaderOptions: OptionsCommon;

    constructor(private page: Page,
                private router: RouterExtensions,
                private backendService: BackendService,
                private utils: UtilsService) {
        this.loader = new LoadingIndicator();
        this.loaderOptions = {
            message: ""
        }
    }

    ngOnInit() {
        this.page.actionBarHidden = true;
    }

    onLoginWithGoogle(): void {
        this.loader.show(this.loaderOptions);
        console.log("Login with Google clicked!");
        this.backendService.loginWithGoogle()
            .then((user: User) => {
                console.log(`Google login successful. Current user is: ${JSON.stringify(user)}`);
                this.router.navigate(["/home"]);
                this.loader.hide();
            })
            .catch(err => {
                this.utils.handleError(err);
            });
    }

    onLoginWithFacebook(): void {
        console.log("Login with Facebook clicked!");
        this.router.navigate(["/home"]);
    }
}
