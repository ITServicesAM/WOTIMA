import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { Worktime } from '../../models/worktime.interface';
import { RouterExtensions } from 'nativescript-angular';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { switchMap } from "rxjs/operators";
import { WorktimeDateRange } from "../../models/worktime-date-range.interface";

@Component({
    selector: "worktime-list",
    moduleId: module.id,
    templateUrl: "./worktime-list.component.html",
    styleUrls: ['worktime-list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorktimeListComponent implements OnInit {

    public worktimes$: Observable<any>;
    private month$: BehaviorSubject<WorktimeDateRange>;
    public showLoading: boolean = true;
    public dates: string[] = ['2018', '2017'];

    constructor(private backend: BackendService,
                private router: RouterExtensions) { }

    onEditWorktime(worktime: Worktime) {
        this.router.navigate([`worktime-detail/${worktime.date}`]);
    }

    ngOnInit() {
        this.month$ = new BehaviorSubject<WorktimeDateRange>(new WorktimeDateRange('2017-05-01', '2017-05-31'));
        this.worktimes$ = this.month$.pipe(
            switchMap((worktimeDateRange: WorktimeDateRange) => {
                return this.backend.loadWorktimes(worktimeDateRange);
            })
        );
        this.worktimes$.subscribe(value => {
            this.showLoading = false;
            // console.log(JSON.stringify(value));
        });
    }

    nextDate() {
        this.showLoading = true;
        this.month$.next(new WorktimeDateRange('2018-01-01', '2018-01-31'));
    }
}