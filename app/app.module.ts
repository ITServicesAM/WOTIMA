import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AuthGuard } from './auth-guard.service';
import { BackendService } from './services/backend.service';
import { SignInModule } from './auth/sign-in/sign-in.module';
import { UtilsService } from './services/utils.service';
import { TNSFontIconModule, TNSFontIconService } from 'nativescript-ngx-fonticon';

import * as textinputlayout from 'nativescript-textinputlayout/textInputLayout';
import * as elementRegistryModule from 'nativescript-angular/element-registry';
import { WorktimeDetailModule } from './worktime-detail/worktime-detail.module';
import { WorktimeNewModule } from './worktime-new/worktime-new.module';
import { WorktimeProfileModule } from "./worktime-profile/worktime-profile.module";
import { SignUpModule } from "./auth/sign-up/sign-up.module";
import firebase = require("nativescript-plugin-firebase/app");
import { SignInEmailModule } from "./auth/sign-in-email/sign-in-email.module";
import { WorktimeBudgetEditModule } from "./worktime-budget-edit/worktime-budget-edit.module";
import { DeviceType } from "tns-core-modules/ui/enums";
import { Config } from "./services/config";
import { device } from "tns-core-modules/platform";

elementRegistryModule.registerElement("Ripple", () => require("nativescript-ripple").Ripple);
elementRegistryModule.registerElement("CardView", () => require("nativescript-cardview").CardView);
elementRegistryModule.registerElement('TextInputLayout', () => (<any>textinputlayout).TextInputLayout);

firebase.initializeApp({
    persist: true,
    onAuthStateChanged: (data: any) => {
        // console.log(JSON.stringify(data));
        if (data.loggedIn) {
            BackendService.setToken(data.user.uid);
        }
        else {
            BackendService.setToken("");
        }
    }
}).then((instance) => {
    console.log(`Firebase init successful with instance: instance`, instance)
}).catch(err => console.log("Firebase init failed with error: ", err));

Config.isTablet = device.deviceType === DeviceType.Tablet;

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        AppRoutingModule,
        SignInModule,
        SignInEmailModule,
        SignUpModule,
        WorktimeDetailModule,
        WorktimeNewModule,
        WorktimeProfileModule,
        WorktimeBudgetEditModule,
        TNSFontIconModule.forRoot({
            'mdi': 'material-design-icons.css'
        })
    ],
    declarations: [
        AppComponent
    ],
    providers: [
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
