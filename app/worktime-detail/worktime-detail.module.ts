import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { WorktimeDetailComponent } from './worktime-detail.component';
import { WorktimePipesModule } from '../pipes/pipes.module';
import { TNSFontIconModule } from 'nativescript-ngx-fonticon';
import { ToggleNavButtonModule } from "../directives/toggle-nav-button.module";

@NgModule({
    imports: [
        ToggleNavButtonModule,
        NativeScriptCommonModule,
        WorktimePipesModule,
        TNSFontIconModule
    ],
    declarations: [
        WorktimeDetailComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class WorktimeDetailModule {
}