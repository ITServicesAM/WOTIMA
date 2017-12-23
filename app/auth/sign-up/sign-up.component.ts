import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { RouterExtensions } from "nativescript-angular";
import { Page } from "tns-core-modules/ui/page";
import { WotimaValidators } from "../../validators/wotima.validators";

@Component({
    selector: "SignUpPage",
    moduleId: module.id,
    templateUrl: "./sign-up.component.html",
    styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {

    public signUpForm: FormGroup;

    constructor(private fb: FormBuilder,
                private router: RouterExtensions,
                private page: Page,) {
        this.signUpForm = this.fb.group({
            "email": ["", [Validators.required, WotimaValidators.checkEmail]],
            "email2": ["", [Validators.required]],
            "password": ["", [Validators.required, WotimaValidators.checkPasswordLength(8)]],
            "password2": ["", [Validators.required, WotimaValidators.checkPasswordLength(8)]]
        }, {validator: Validators.compose([WotimaValidators.checkPasswordsMatching, WotimaValidators.checkEmailsMatching])});
    }

    ngOnInit() {
        this.page.actionBarHidden = true;
    }

    onSignUp() {
        console.log(JSON.stringify(this.signUpForm.value));
    }

    getErrorMessageEmail(): string {
        let err = "";
        let emailControl = this.signUpForm.get('email');
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

    getErrorMessageEmail2(): string {
        let err = "";
        let emailControl = this.signUpForm.get('email2');
        if (emailControl.touched) {
            if (emailControl.hasError('required')) {
                err = "Die Bestätigung der Email Adresse ist erforderlich!";
            }

            if (this.signUpForm.hasError('emailMismatch')) {
                err = "Die Email Adressen stimmen nicht überein";
            }
        }
        return err;
    }

    getErrorMessagePassword(): string {
        let err = "";
        let passwordControl = this.signUpForm.get('password');
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

    getErrorMessagePassword2(): string {
        let err = "";
        let passwordControl = this.signUpForm.get('password2');
        if (passwordControl.touched) {
            if (passwordControl.hasError('required')) {
                err = "Die Bestätigung des Passworts ist erforderlich!";
            }

            if (this.signUpForm.hasError('passwordMismatch')) {
                err = "Die Passwörter stimmen nicht überein";
            }
        }
        return err;
    }

    onNavigateToSignIn(): void {
        this.router.navigate(['/worktime-sign-in'], {
            clearHistory: true,
            transition: {
                name: "slideLeft",
                curve: "easeInOut"
            }
        });
    }
}