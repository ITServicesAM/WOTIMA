import { Component, OnInit } from '@angular/core';
import { ValueList } from 'nativescript-drop-down';
import * as moment from 'moment';
import { Moment } from 'moment';

@Component({
    selector: "worktime-list-filter",
    moduleId: module.id,
    templateUrl: "./filter-list.component.html",
    styleUrls: [
        "./filter-list.component.css"
    ]
})
export class FilterListComponent implements OnInit {

    public years: ValueList<number> = new ValueList<number>();
    public months: ValueList<number> = new ValueList<number>();
    public selectedYear: number = null;
    public selectedMonth: number = null;

    ngOnInit(): void {
        moment.locale('de');
        let now: Moment = moment();
        // console.log(`WorktimeList: ${now.format('MMMM')}`);

        for (let i = 0; i < 99; i++) {
            let year = now.year() - i;
            this.years.push({
                value: year,
                display: year + ""
            });
            // console.log(`WorktimeList: ${year}`);
        }

        for (let j = 0; j < 12; j++) {
            now.set("month", j);
            // console.log(now.format("MMMM"));
            this.months.push({
                value: (now.month() + 1),
                display: now.format("MMMM"),
            });
        }

        setTimeout(() => {
            this.zone.run(() => {
                this.selectedYear = 0;
                this.selectedMonth = 0;
            });
        }, 500);
    }

    yearSelected(args) {
        // console.log(`New year selected: ${args.newIndex}`);
        this.selectedYear = args.newIndex;
    }

    monthSelected(args) {
        // console.log(`New month selected: ${args.newIndex}`);
        this.selectedMonth = args.newIndex;
    }

    filter() {

    }
}