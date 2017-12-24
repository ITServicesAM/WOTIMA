import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { RouterExtensions } from "nativescript-angular";
import { Page } from "tns-core-modules/ui/page";
import { WotimaValidators } from "../../validators/wotima.validators"
import * as app from "application";
import { OrientationChangedEventData } from "tns-core-modules/application";

@Component({
    selector: "SignInEmailPage",
    moduleId: module.id,
    templateUrl: "./sign-in-email.component.html",
    styleUrls: ['./sign-in-email.component.css']
})
export class SignInEmailComponent implements OnInit {

    public signInEmailForm: FormGroup;
    public orientation: string = "portrait";

    constructor(private fb: FormBuilder,
                private router: RouterExtensions,
                private page: Page,) {
        app.on("orientationChanged", (data: OrientationChangedEventData) => {
            // console.log("OrientationChange detected: ", data);
            this.orientation = data.newValue;
        });
        this.signInEmailForm = this.fb.group({
            "email": ["", [Validators.required, WotimaValidators.checkEmail]],
            "password": ["", [Validators.required, WotimaValidators.checkPasswordLength(8)]]
        });
    }


    ngOnInit() {
        this.page.actionBarHidden = true;
    }

    onSignInWithEmail() {
        console.log(JSON.stringify(this.signInEmailForm.value));
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