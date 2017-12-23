import { AbstractControl, ValidatorFn } from "@angular/forms";

export class WotimaValidators {
    static checkEmail(control: AbstractControl) {
        const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const valid = pattern.test(control.value);
        return valid ? null : {invalidEmail: true};
    }

    static checkPasswordsMatching(control: AbstractControl) {
        const password1 = control.get('password');
        const password2 = control.get('password2');

        if (!(password1 && password2)) return null;

        return password1.value === password2.value ? null : {passwordMismatch: true};
    }

    static checkEmailsMatching(control: AbstractControl) {
        const email1 = control.get('email');
        const email2 = control.get('email2');

        if (!(email1 && email2)) return null;

        return email1.value === email2.value ? null : {emailMismatch: true};
    }

    static checkPasswordLength(minLength: number): ValidatorFn {
        // const value: string = control.value.toString();
        // const valid = value.length >= minLength;
        // return valid ? null : {passwordLength: true};
        return (c: AbstractControl): { [key: string]: boolean } | null => {
            if (c.value.length < minLength) {
                return {'passwordLength': true};
            }
            return null;
        };
    }
}