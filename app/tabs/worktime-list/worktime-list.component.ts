import { ChangeDetectionStrategy, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { Worktime } from '../../models/worktime.interface';
import { RouterExtensions } from 'nativescript-angular';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { switchMap } from "rxjs/operators";
import { WorktimeDateRange } from "../../models/worktime-date-range.interface";
import { Subscription } from "rxjs/Subscription";
import * as moment from 'moment';
import { Moment } from "moment";
import { ValueList } from "nativescript-drop-down";
import { Page } from "tns-core-modules/ui/page";
import { ActionItem } from "tns-core-modules/ui/action-bar";
import { Popup } from "nativescript-popup";

@Component({
    selector: "worktime-list",
    moduleId: module.id,
    templateUrl: "./worktime-list.component.html",
    styleUrls: ['worktime-list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
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
    public empty_list: boolean = false;
    public popup: Popup

    constructor(private backend: BackendService,
                private router: RouterExtensions,
                private page: Page,
                private zone: NgZone) {
        let actionFilter = new ActionItem();
        actionFilter.text = "Filtern";
        actionFilter.icon = "res://ic_filter_list_white_24dp";
        actionFilter.android.position= "actionBar";
        actionFilter.ios.position= "right";
        page.actionBar.actionItems.addItem(new ActionItem());
    }

    onEditWorktime(worktime: Worktime) {
        this.router.navigate([`worktime-detail/${worktime.date}`]);
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

        setTimeout(() => {
            this.zone.run(() => {
                this.selectedYear = 0;
                this.selectedMonth = 0;
            });
        }, 500);

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
        this.worktimesSub = this.worktimes$.subscribe(value => {
            this.isLoading = false;
            this.empty_list = value === null;
            // console.log(`WorktimeList: ${JSON.stringify(value)}`);
            // console.log("query has fired the function");
        });
    }

    ngOnDestroy(): void {
        this.worktimesSub.unsubscribe();
    }

    yearSelected(args) {
        // console.log(`New year selected: ${args.newIndex}`);
        this.selectedYear = args.newIndex;
    }

    monthSelected(args) {
        // console.log(`New month selected: ${args.newIndex}`);
        this.selectedMonth = args.newIndex;
    }

    changeMonth(nextMonth: boolean) {
        this.empty_list = false;
        this.isLoading = true;
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
        this.empty_list = false;
        this.isLoading = true;
        let month = this.months.getValue(this.selectedMonth);
        let startAt = `${this.years.getValue(this.selectedYear)}-${month < 10 ? '0' + month : month}-01`;
        let endAt = `${this.years.getValue(this.selectedYear)}-${month < 10 ? '0' + month : month}-31`;
        // console.log(`WorktimeList filter: startAt= ${startAt} | endAt= ${endAt}`);
        this.month$.next(new WorktimeDateRange(startAt, endAt));
    }
}