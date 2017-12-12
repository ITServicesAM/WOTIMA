import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";

import { TabsRoutingModule } from "./tabs-routing.module";
import { TabsComponent } from "./tabs.component";
import { TNSFontIconModule } from 'nativescript-ngx-fonticon';
import { WorktimeHomeComponent } from './worktime-home/worktime-home.component';
import { WorktimeListComponent } from './worktime-list/worktime-list.component';
import { WorktimeBudgetPipe } from '../pipes/worktime-budget.pipe';
import { LISTVIEW_DIRECTIVES, NativeScriptUIListViewModule } from 'nativescript-pro-ui/listview/angular';
import { WorktimeDatePipe } from '../pipes/worktime-date.pipe';
import { WorktimeOvertimePipe } from '../pipes/worktime-overtime.pipe';
import { WorktimePipesModule } from '../pipes/pipes.module';

@NgModule({
    imports: [
        NativeScriptCommonModule,
        TabsRoutingModule,
        TNSFontIconModule,
        NativeScriptUIListViewModule,
        WorktimePipesModule
    ],
    declarations: [
        TabsComponent,
        WorktimeHomeComponent,
        WorktimeListComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class TabsModule {
}
