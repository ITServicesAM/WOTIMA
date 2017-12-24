import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { NativeScriptFormsModule } from "nativescript-angular";
import { ReactiveFormsModule } from "@angular/forms";
import { SignInEmailComponent } from "./sign-in-email.component";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        NativeScriptFormsModule,
        ReactiveFormsModule
    ],
    declarations: [
        SignInEmailComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class SignInEmailModule {
}