import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { WorktimePipesModule } from "../pipes/pipes.module";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptFormsModule } from "nativescript-angular";
import { TNSFontIconModule } from "nativescript-ngx-fonticon";
import { WorktimeProfileComponent } from "./worktime-profile.component";
import { ToggleNavButtonModule } from "../directives/toggle-nav-button.module";

@NgModule({
    imports: [
        ToggleNavButtonModule,
        NativeScriptCommonModule,
        NativeScriptFormsModule,
        WorktimePipesModule,
        TNSFontIconModule
    ],
    declarations: [
        WorktimeProfileComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class WorktimeProfileModule {
}