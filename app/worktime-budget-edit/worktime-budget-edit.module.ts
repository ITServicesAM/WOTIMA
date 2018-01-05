import { TNSFontIconModule } from "nativescript-ngx-fonticon";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { WorktimePipesModule } from "../pipes/pipes.module";
import { WorktimeBudgetEditComponent } from "./worktime-budget-edit.component";
import { NativeScriptFormsModule } from "nativescript-angular";
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
    imports: [
        NativeScriptCommonModule,
        WorktimePipesModule,
        TNSFontIconModule,
        NativeScriptFormsModule,
        ReactiveFormsModule
    ],
    declarations: [
        WorktimeBudgetEditComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ],
    entryComponents: [
        WorktimeBudgetEditComponent
    ]
})
export class WorktimeBudgetEditModule {
}