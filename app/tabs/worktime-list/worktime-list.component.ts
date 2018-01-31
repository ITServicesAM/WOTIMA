import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    NgZone,
    OnDestroy,
    OnInit,
    ViewContainerRef
} from '@angular/core';
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
import { animate, query, stagger, style, transition, trigger } from "@angular/animations";

@Component({
    selector: "worktime-list",
    moduleId: module.id,
    templateUrl: "./worktime-list.component.html",
    styleUrls: ['worktime-list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('itemAnimation', [
            transition(":enter", [
                style({opacity: 0}),
                animate(500, style({opacity: 1}))
            ]),
            transition(":leave", [
                style({opacity: 1}),
                animate(500, style({opacity: 0}))
            ])
        ]),
        trigger("listAnimation", [
            transition("* => *", [
                // this hides everything right away
                query(":enter",
                    style({opacity: 0}),
                    {optional: true}),
                // starts to animate things with a stagger in between
                // query(":enter", stagger('300ms', [
                //     animate("800s ease-in", keyframes([
                //         style({opacity: 0, transform: 'translateY(-75px)', offset: 0}),
                //         style({opacity: 0.5, transform: 'translateY(35px)', offset: 0.3}),
                //         style({opacity: 1, transform: 'translateY(0)', offset: 1})
                //     ]))
                // ]), {optional: true}),

                // starts to animate things with a stagger in between
                query(":enter", stagger(5000, [
                    animate(1000, style({opacity: 1}))
                ]), {delay: 200, optional: true})
            ])
        ])
    ]
})
export class WorktimeListComponent implements OnInit, OnDestroy {

    public worktimes$: Observable<any>;
    public worktimes: Worktime[];
    private worktimesSub: Subscription;
    private month$: BehaviorSubject<WorktimeDateRange>;
    public isLoading: boolean = false;
    public isShowLoadingIndicator: boolean = false;
    public years: ValueList<number> = new ValueList<number>();
    public months: ValueList<number> = new ValueList<number>();
    public selectedYear: number = null;
    public selectedMonth: number = null;

    constructor(private backend: BackendService,
                private utils: UtilsService,
                private router: RouterExtensions,
                private vcRef: ViewContainerRef,
                private changeRef: ChangeDetectorRef,
                private zone: NgZone,
                private modalService: ModalDialogService) {
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

        //responding to the actionItem tapEvent
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
            this.zone.run(() => {
                if (value && value.length > 0 || value === null) {
                    this.isLoading = false;
                    this.utils.hideLoading();
                }
                console.log(`isLoading: ${this.isLoading}`);
                this.worktimes = value === null ? [] : value;
                this.changeRef.detectChanges();
            });
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
        this.worktimes = [];
        this.isLoading = true;
        this.isShowLoadingIndicator = false;
        this.changeRef.detectChanges();
        setTimeout(() => {
            this.isShowLoadingIndicator = true;
            this.showLoadingIndicator();
        }, 500);
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

    showLoadingIndicator() {
        if (this.isShowLoadingIndicator === true && this.isLoading === true) {
            console.log(`${this.isShowLoadingIndicator === true && this.isLoading === true ? "should show loadingIndicator" : "should hide loadingIndicator"}`);
            this.zone.run(() => this.utils.showLoading());
        }
    }
}