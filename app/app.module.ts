import { NgModule, NgModuleFactoryLoader, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NSModuleFactoryLoader } from "nativescript-angular/router";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AuthGuard } from './auth-guard.service';
import { BackendService } from './shared/backend.service';
import { LoginModule } from './auth/login/login.module';
import { UtilsService } from './shared/utils.service';
import { TNSFontIconModule } from 'nativescript-ngx-fonticon';

import * as textinputlayout from 'nativescript-textinputlayout/textInputLayout';
import * as elementRegistryModule from 'nativescript-angular/element-registry';
import { WorktimeDetailModule } from './worktime-detail/worktime-detail.module';
import { WorktimeNewModule } from './worktime-new/worktime-new.module';
import firebase = require("nativescript-plugin-firebase/app");

elementRegistryModule.registerElement("Ripple", () => require("nativescript-ripple").Ripple);
elementRegistryModule.registerElement("CardView", () => require("nativescript-cardview").CardView);
elementRegistryModule.registerElement('TextInputLayout', () => (<any>textinputlayout).TextInputLayout);

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
        LoginModule,
        WorktimeDetailModule,
        WorktimeNewModule,
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
