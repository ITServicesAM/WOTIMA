import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from 'nativescript-angular';
import { BackendService } from '../../services/backend.service';
import { UtilsService } from '../../services/utils.service';
import { Page } from 'tns-core-modules/ui/page';

@Component({
    selector: "SignInPage",
    moduleId: module.id,
    templateUrl: "./sign-in.component.html",
    styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
    busy: boolean = false;

    constructor(private page: Page,
                private router: RouterExtensions,
                private backendService: BackendService,
                private utils: UtilsService) {
    }

    ngOnInit() {
        this.page.actionBarHidden = true;
    }

    onSignWithGoogle(): void {
        this.busy = true;
        console.log("Login with Google clicked!");
        this.backendService.signInWithGoogle().then(() => {
            this.router.navigate(["/tabs"], {
                clearHistory: true,
                transition: {
                    name: "slideLeft",
                    curve: "easeInOut"
                }
            });
            this.busy = false;
        }).catch(err => this.utils.handleError(err));
    }

    onSignWithFacebook(): void {
        console.log("Login with Facebook clicked!");
        this.router.navigate(["/tabs"], {
            transition: {
                name: "slideLeft",
                curve: "easeInOut"
            }
        });
    }

    onSignInWithEmail(): void {
        console.log("Login with Email clicked!");
        this.router.navigate(["/worktime-sign-in-email"], {
            transition: {
                name: "slideLeft",
                curve: "easeInOut"
            }
        });
    }

    onNavigateToSignUp(): void {
        this.router.navigate(['/worktime-sign-up'], {
            transition: {
                name: "slideLeft",
                curve: "easeInOut"
            }
        });
    }
}
