import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { Worktime } from '../../models/worktime.interface';
import { RouterExtensions } from 'nativescript-angular';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { switchMap } from "rxjs/operators";

@Component({
    selector: "worktime-list",
    moduleId: module.id,
    templateUrl: "./worktime-list.component.html",
    styleUrls: ['worktime-list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorktimeListComponent implements OnInit {

    public worktimes$: Observable<any>;
    private month$: BehaviorSubject<number>;

    constructor(private backend: BackendService,
                private router: RouterExtensions) { }

    onEditWorktime(worktime: Worktime) {
        this.router.navigate([`worktime-detail/${worktime.date}`]);
    }

    ngOnInit() {
        this.month$ = new BehaviorSubject<number>(11);
        this.worktimes$ = this.month$.pipe(
            switchMap((month: number) => {
                return this.backend.loadWorktimes(month);
            })
        );
        this.worktimes$.subscribe(value => {
            console.log(JSON.stringify(value));
        });
    }

    nextDate() {
        this.month$.next(this.month$.getValue() == 11 ? 0 : this.month$.getValue() + 1);
    }
}