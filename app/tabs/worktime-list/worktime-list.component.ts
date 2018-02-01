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
import { animate, keyframes, query, stagger, style, transition, trigger } from "@angular/animations";

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
                query(":enter", stagger('300ms', [
                    animate("800ms ease-in", keyframes([
                        style({opacity: 0, transform: 'translateY(-75px)', offset: 0}),
                        style({opacity: 0.5, transform: 'translateY(35px)', offset: 0.3}),
                        style({opacity: 1, transform: 'translateY(0)', offset: 1})
                    ]))
                ]), {optional: true}),

                // starts to animate things with a stagger in between
                // query(":enter", stagger('500ms', [
                //     animate(1000, style({opacity: 1}))
                // ]), {delay: '300ms', optional: true})
            ])
        ])
    ]
})
export class WorktimeListComponent implements OnInit, OnDestroy {

    public worktimes$: Observable<any>;
    public worktimes: Worktime[] = [];
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
                private ngZone: NgZone,
                private modalService: ModalDialogService) {
    }

    ngOnInit() {
        moment.locale('de');
        let now: Moment = moment();
        console.log(`WorktimeList: ${now.format('MMMM')}`);

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
                value: (now.month()),
                display: now.format("MMMM"),
            });
        }

        this.selectedYear = 0;
        this.selectedMonth = moment().month();

        //responding to the actionItem tapEvent
        this.utils.subject.subscribe(data => {
            if (data === 'tap') {
                this.onFilter();
            }
        });

        const now2 = moment();
        const startAtReversed: number = (0 - now2.startOf('month').valueOf());
        const endAtReversed: number = (0 - now2.endOf('month').valueOf());
        console.log(`WorktimeList ngOnInit: startAtReversed= ${now2.startOf('month').format()} | endAtReversed= ${now2.endOf('month').format()}`);
        this.month$ = new BehaviorSubject<WorktimeDateRange>(new WorktimeDateRange(startAtReversed, endAtReversed));
        this.worktimes$ = this.month$.pipe(
            switchMap((worktimeDateRange: WorktimeDateRange) => {
                return this.backend.loadWorktimes(worktimeDateRange);
            })
        );
        this.worktimesSub = this.worktimes$.subscribe((value: Worktime[]) => {
            this.ngZone.run(() => {
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
            if (month === 11) {
                month = 0;
                year = year + 1;
            } else {
                month = month + 1;
            }
        } else {
            if (month === 0) {
                month = 11;
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
            this.ngZone.run(() => {
                this.isShowLoadingIndicator = true;
                this.showLoadingIndicator();
            });
        }, 300);
        const month = this.months.getValue(this.selectedMonth);
        const year = this.years.getValue(this.selectedYear);
        const date = moment().year(year).month(month);
        const startAtReversed: number = (0 - date.startOf('month').valueOf());
        const endAtReversed: number = (0 - date.endOf('month').valueOf());
        // console.log(`WorktimeList filter: startAt= ${startAt} | endAt= ${endAt}`);
        this.month$.next(new WorktimeDateRange(startAtReversed, endAtReversed));
    }

    getCurrentDate(): string {
        const month = this.months.getValue(this.selectedMonth);
        const year = this.years.getValue(this.selectedYear);
        const date = moment().month(month);
        return `${date.format('MMMM')} ${year}`;
    }

    showLoadingIndicator() {
        if (this.isShowLoadingIndicator === true && this.isLoading === true) {
            console.log(`${this.isShowLoadingIndicator === true && this.isLoading === true ? "should show loadingIndicator" : "should hide loadingIndicator"}`);
            this.ngZone.run(() => this.utils.showLoading());
        }
    }
}