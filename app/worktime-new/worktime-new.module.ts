import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { TNSFontIconModule } from 'nativescript-ngx-fonticon';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { WorktimePipesModule } from '../pipes/pipes.module';
import { WorktimeNewComponent } from './worktime-new.component';
import { NativeScriptFormsModule } from 'nativescript-angular';
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
        WorktimeNewComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class WorktimeNewModule {
}