import { NgModule, NgModuleFactoryLoader, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NSModuleFactoryLoader } from "nativescript-angular/router";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AuthGuard } from './auth-guard.service';
import { BackendService } from './shared/backend.service';
import { HomeModule } from './home/home.module';
import { LoginModule } from './auth/login/login.module';
import { UtilsService } from './shared/UtilsService';
import { TNSFontIconModule } from 'nativescript-ngx-fonticon';

import * as elementRegistryModule from 'nativescript-angular/element-registry';
import firebase = require("nativescript-plugin-firebase/app");

elementRegistryModule.registerElement("Ripple", () => require("nativescript-ripple").Ripple);
elementRegistryModule.registerElement("CardView", () => require("nativescript-cardview").CardView);

firebase.initializeApp({
    persist: true
}).then((instance) => {
    console.log(`Firebase init successful with instance: instance`, instance)
}).catch(err => console.log("Firebase init failed!"));

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        AppRoutingModule,
        HomeModule,
        LoginModule,
        TNSFontIconModule.forRoot({
            'mdi': 'material-design-icons.css'
        })
    ],
    declarations: [
        AppComponent
    ],
    providers: [
        {provide: NgModuleFactoryLoader, useClass: NSModuleFactoryLoader},
        AuthGuard,
        BackendService,
        UtilsService
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class AppModule {
}
