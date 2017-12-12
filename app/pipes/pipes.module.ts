import { WorktimeDatePipe } from './worktime-date.pipe';
import { WorktimeOvertimePipe } from './worktime-overtime.pipe';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { WorktimeBudgetPipe } from './worktime-budget.pipe';
import { WorktimePipe } from './worktime.pipe';

@NgModule({
    imports: [],
    declarations: [
        WorktimeOvertimePipe,
        WorktimeDatePipe,
        WorktimeBudgetPipe,
        WorktimePipe
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ], exports: [
        WorktimeOvertimePipe,
        WorktimeDatePipe,
        WorktimeBudgetPipe,
        WorktimePipe
    ]
})
export class WorktimePipesModule {
}