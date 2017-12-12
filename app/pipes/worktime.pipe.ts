import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({name: 'worktime'})
export class WorktimePipe implements PipeTransform {
    transform(value: string): string {
        let date = moment(value);
        return date.format('HH:mm');
    }
}