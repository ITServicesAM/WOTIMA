import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'worktimeOvertime'})
export class WorktimeOvertimePipe implements PipeTransform {
    transform(value: number): string {
        // console.log(`OverTimePipeValue was: ${JSON.stringify(value)}`);
        let worktimeBudgetString = "";

        //Get hours from milliseconds
        let hours = ((Math.abs(value)) / 60);
        let absoluteHours = Math.floor(hours);

        //Get remainder from hours and convert to minutes
        let minutesInHours = Math.abs(value) - (absoluteHours * 60);
        let absoluteMinutesInHours = Math.floor(minutesInHours);

        if (absoluteHours > 0 && absoluteHours < 10) {
            worktimeBudgetString = `0${absoluteHours}`;
        } else if (absoluteHours > 0) {
            worktimeBudgetString = `${absoluteHours}`;
        } else {
            worktimeBudgetString = '00';
        }

        if (absoluteMinutesInHours > 0 && absoluteMinutesInHours < 10) {
            worktimeBudgetString = `${worktimeBudgetString}:0${absoluteMinutesInHours}`;
        } else if (absoluteMinutesInHours > 9) {
            worktimeBudgetString = `${worktimeBudgetString}:${absoluteMinutesInHours}`;
        } else {
            worktimeBudgetString = `${worktimeBudgetString}:00`;
        }
        if (value < 0)
            worktimeBudgetString = `- ${worktimeBudgetString}`;

        return "Deine Arbeitszeit beträgt: " + worktimeBudgetString;
    }
}