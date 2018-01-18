import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { RouterExtensions } from "nativescript-angular";
import { Page } from "tns-core-modules/ui/page";
import { WotimaValidators } from "../../validators/wotima.validators";
import { BackendService } from '../../services/backend.service';
import { UtilsService } from '../../services/utils.service';
import { openUrl } from "tns-core-modules/utils/utils";
import { LoadingIndicator, OptionsCommon } from "nativescript-loading-indicator";
import { openApp } from "nativescript-open-app";

@Component({
    selector: "SignInEmailPage",
    moduleId: module.id,
    templateUrl: "./sign-in-email.component.html",
    styleUrls: ['./sign-in-email.component.css']
})
export class SignInEmailComponent implements OnInit {

    public signInEmailForm: FormGroup;

    constructor(private fb: FormBuilder,
                private router: RouterExtensions,
                private page: Page,
                private backend: BackendService,
                private utils: UtilsService) {
        this.signInEmailForm = this.fb.group({
            "email": ["", [Validators.required, WotimaValidators.checkEmail]],
            "password": ["", [Validators.required, WotimaValidators.checkPasswordLength(8)]]
        });
    }


    ngOnInit() {
        this.page.actionBarHidden = true;
    }

    onSignInWithEmail() {
        this.utils.showLoading();
        console.log(JSON.stringify(this.signInEmailForm.value));
        BackendService.signInWithEmail(this.signInEmailForm.value.email, this.signInEmailForm.value.password).then((user) => {
                this.utils.hideLoading();
                if (user.emailVerified) {
                    BackendService.createUser(user);
                    this.router.navigate(["/tabs"], {
                        clearHistory: true,
                        transition: {
                            name: "slideRight",
                            curve: "easeInOut"
                        }
                    });
                }
                else {
                    BackendService.signOut();
                    // this.utils.showInfoDialog("Du musst deine Email Adresse zunächst bestätigen!");
                    this.utils.showSnackBarWithAction("Du musst deine Email Adresse zunächst bestätigen!", "ok", (args) => {
                        if (args.command === "Action") {
                            let appAvailable = openApp("com.google.android.gm", false);
                            if (!appAvailable) {
                                openUrl("mail.google.com");
                            }
                        }
                    });
                }
            }
        ).catch(err => {
            this.utils.hideLoading();
            this.utils.handleError(err);
        });
    }

    getErrorMessageEmail(): string {
        let err = "";
        let emailControl = this.signInEmailForm.get('email');
        if (emailControl.touched) {
            if (emailControl.hasError('required')) {
                err = "Die Email Adresse ist erforderlich!";
            }

            if (emailControl.hasError('invalidEmail') && !emailControl.hasError('required')) {
                err = "Gib eine echte Email Adresse ein!";
            }
        }
        return err;
    }

    getErrorMessagePassword(): string {
        let err = "";
        let passwordControl = this.signInEmailForm.get('password');
        // console.log(JSON.stringify(passwordControl.errors));
        if (passwordControl.touched) {
            if (passwordControl.hasError('required')) {
                err = "Das Passwort ist erforderlich!";
            }

            if (passwordControl.hasError('passwordLength') && !passwordControl.hasError('required')) {
                err = "Das Passwort muss mindestens 8 Zeichen lang sein!";
            }
        }
        return err;
    }

    onNavigateToSignIn(): void {
        this.router.navigate(['/worktime-sign-in'], {
            clearHistory: true,
            transition: {
                name: "slideRight",
                curve: "easeInOut"
            }
        });
    }
}