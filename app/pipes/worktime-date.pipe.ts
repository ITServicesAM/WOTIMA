import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({name: 'worktimeDate'})
export class WorktimeDatePipe implements PipeTransform {
    transform(value: string): string {
        let date = moment(value);
        return date.format('ddd, DD.MM.YYYY');
    }
}