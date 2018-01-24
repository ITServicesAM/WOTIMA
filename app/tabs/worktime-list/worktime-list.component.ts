import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { ModalDialogOptions, ModalDialogService, RouterExtensions } from 'nativescript-angular';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { switchMap } from "rxjs/operators";
import { WorktimeDateRange } from "../../models/worktime-date-range.interface";
import { Subscription } from "rxjs/Subscription";
import * as moment from 'moment';
import { Moment } from 'moment';
import { ValueList } from "nativescript-drop-down";
import { FilterListComponent } from './filter-list/filter-list.component';
import { UtilsService } from "../../services/utils.service";
import * as dialogs from "ui/dialogs";
import { Worktime } from "../../models/worktime.interface";
import { animate, style, transition, trigger } from "@angular/animations";
import { ObservableArray } from "tns-core-modules/data/observable-array";

@Component({
    selector: "worktime-list",
    moduleId: module.id,
    templateUrl: "./worktime-list.component.html",
    styleUrls: ['worktime-list.component.css'],
    animations: [
        trigger("visibility", [
            transition("* => fadeIn", [
                style({opacity: 0}),
                animate(600, style({opacity: 1}))
            ]),
            transition("* => fadeOut", [
                animate(600, style({opacity: 0}))
            ])
        ])

    ]
})
export class WorktimeListComponent implements OnInit, OnDestroy {

    public worktimes$: Observable<any>;
    private worktimesSub: Subscription;
    private month$: BehaviorSubject<WorktimeDateRange>;
    public isLoading: boolean = true;
    public years: ValueList<number> = new ValueList<number>();
    public months: ValueList<number> = new ValueList<number>();
    public selectedYear: number = null;
    public selectedMonth: number = null;
    public isEmptyList: boolean = false;
    public listLoaded: boolean = false;

    public listState: string = "";

    constructor(private backend: BackendService,
                private utils: UtilsService,
                private router: RouterExtensions,
                private vcRef: ViewContainerRef,
                private modalService: ModalDialogService) {
    }

    listFadeIn() {
        this.listState = "fadeIn";
    }

    listFadeOut() {
        this.listState = "fadeOut";
    }

    ngOnInit() {
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

        this.selectedYear = 0;
        this.selectedMonth = 0;

        this.utils.subject.subscribe(data => {
            if (data === 'tap') {
                this.onFilter();
            }
        });

        let month = moment().month() + 1;
        let startAt = `${moment().year()}-${month < 10 ? '0' + month : month}-01`;
        let endAt = `${moment().year()}-${month < 10 ? '0' + month : month}-31`;
        // console.log(`WorktimeList ngOnInit: startAt= ${startAt} | endAt= ${endAt}`);
        this.month$ = new BehaviorSubject<WorktimeDateRange>(new WorktimeDateRange(startAt, endAt));
        this.worktimes$ = this.month$.pipe(
            switchMap((worktimeDateRange: WorktimeDateRange) => {
                return this.backend.loadWorktimes(worktimeDateRange);
            })
        );
        this.worktimesSub = this.worktimes$.subscribe((value: Worktime[]) => {
            if (value && value.length > 0 || value === null) {
                this.isLoading = false;
            }
            if (value === null)
                this.isEmptyList = true;
            if (value && value.length > 0) {
                this.listLoaded = true;
                this.listFadeIn();
                console.log(`WorktimeList loaded! listState: ${this.listState}`);
            }
            // console.log(`WorktimeList: ${JSON.stringify(value)}`);
            // console.log("query has fired the function");
        });
    }

    onDeleteClick(key: string) {
        const date: Moment = moment(key);
        dialogs.confirm({
            title: "Arbeitszeit löschen?",
            message: `Hiermit werden alle Daten für den ${date.format('DD.MM.YYYY')} gelöscht!`,
            cancelButtonText: "Abbrechen",
            okButtonText: "Löschen"
        }).then(result => {
            console.log("Dialog result: " + result);
            if (result === true) {
                this.backend.deleteWorktime(key).catch(err => console.log(err.message));
            }
        });
    }

    onFilter() {
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: false,
            context: {years: this.years, months: this.months}
        };

        this.modalService.showModal(FilterListComponent, options).then(result => {
            this.selectedMonth = result.selectedMonth;
            this.selectedYear = result.selectedYear;
            this.filter();
        });
    }

    ngOnDestroy(): void {
        this.worktimesSub.unsubscribe();
    }

    changeMonth(nextMonth: boolean) {
        let month = this.months.getValue(this.selectedMonth);
        let year = this.years.getValue(this.selectedYear);
        if (nextMonth) {
            if (month === 12) {
                month = 1;
                year = year + 1;
            } else {
                month = month + 1;
            }
        } else {
            if (month === 1) {
                month = 12;
                year = year - 1;
            } else {
                month = month - 1;
            }
        }

        this.selectedMonth = this.months.getIndex(month);
        this.selectedYear = this.years.getIndex(year);
        this.filter();
    }

    filter() {
        this.listFadeOut();
        this.isEmptyList = false;
        this.isLoading = true;
        this.listLoaded = false;
        let month = this.months.getValue(this.selectedMonth);
        let year = this.years.getValue(this.selectedYear);
        let startAt = `${year}-${month < 10 ? '0' + month : month}-01`;
        let endAt = `${year}-${month < 10 ? '0' + month : month}-31`;
        // console.log(`WorktimeList filter: startAt= ${startAt} | endAt= ${endAt}`);
        this.month$.next(new WorktimeDateRange(startAt, endAt));
    }

    getCurrentDate(): string {
        let month = this.months.getValue(this.selectedMonth);
        let year = this.years.getValue(this.selectedYear);
        let date = moment();
        date.month(month - 1);
        return `${date.format('MMMM')} ${year}`;
    }
}