import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";

import { SignInComponent } from "./sign-in.component";
import { NativeScriptCommonModule } from 'nativescript-angular/common';

@NgModule({
    imports: [
        NativeScriptCommonModule
    ],
    declarations: [
        SignInComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class SignInModule {
}
