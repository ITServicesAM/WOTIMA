import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";

import { HomeComponent } from "./home.component";
import { TNSFontIconModule } from 'nativescript-ngx-fonticon';

@NgModule({
    imports: [
        NativeScriptCommonModule,
        TNSFontIconModule
    ],
    declarations: [
        HomeComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class HomeModule {
}
