import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from 'nativescript-angular';
import { BackendService } from '../../services/backend.service';
import { UtilsService } from '../../services/utils.service';
import { Page } from 'tns-core-modules/ui/page';

@Component({
    selector: "LoginPage",
    moduleId: module.id,
    templateUrl: "./login.component.html"
})
export class LoginComponent implements OnInit {
    busy: boolean = false;

    constructor(private page: Page,
                private router: RouterExtensions,
                private backendService: BackendService,
                private utils: UtilsService) {
    }

    ngOnInit() {
        this.page.actionBarHidden = true;
    }


    onLoginWithGoogle(): void {
        this.busy = true;
        console.log("Login with Google clicked!");
        this.backendService.loginWithGoogle()
            .then(() => {
                this.router.navigate(["/tabs"], {clearHistory: true});
                this.busy = false;
            }).catch(err => {
            this.utils.handleError(err);
        });
    }

    onLoginWithFacebook(): void {
        console.log("Login with Facebook clicked!");
        this.router.navigate(["/tabs"]);
    }
}
