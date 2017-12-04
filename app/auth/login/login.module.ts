import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";

import { LoginComponent } from "./login.component";
import { NativeScriptCommonModule } from 'nativescript-angular/common';

@NgModule({
    imports: [
        NativeScriptCommonModule
    ],
    declarations: [
        LoginComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class LoginModule {
}
