import { Component, NgZone, OnInit } from '@angular/core';
import { ValueList } from 'nativescript-drop-down';
import { ModalDialogParams } from "nativescript-angular";
import * as moment from "moment";

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

    constructor(private zone: NgZone,
                private params: ModalDialogParams) {}

    ngOnInit(): void {
        // console.log(`YearsArray: ${this.params.context.years}`);
        // console.log(`MonthsArray: ${this.params.context.months}`);
        this.years = this.params.context.years;
        this.months = this.params.context.months;
        this.selectedYear = 0;
        this.selectedMonth = moment().month();
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
        // let month = this.months.getValue(this.selectedMonth);
        // let year = this.years.getValue(this.selectedYear);
        // let startAt = `${year}-${month < 10 ? '0' + month : month}-01`;
        // let endAt = `${year}-${month < 10 ? '0' + month : month}-31`;
        this.params.closeCallback({selectedMonth: this.selectedMonth, selectedYear: this.selectedYear});
    }
}