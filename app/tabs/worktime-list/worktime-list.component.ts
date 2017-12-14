import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { Worktime } from '../../models/worktime.interface';
import { RouterExtensions } from 'nativescript-angular';
import { Page } from 'tns-core-modules/ui/page';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
    selector: "worktime-list",
    moduleId: module.id,
    templateUrl: "./worktime-list.component.html",
    styleUrls: ['worktime-list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorktimeListComponent implements OnInit {

    public worktimes$: Observable<any>;

    constructor(private backend: BackendService,
        private router: RouterExtensions) {    }

    onEditWorktime(worktime: Worktime) {
        this.router.navigate([`worktime-detail/${worktime.date}`]);
    }

    ngOnInit() {
        this.worktimes$ = this.backend.loadWorktimes();
        // console.log(`WorktimesObservable: ${JSON.stringify(this.worktimes$)}`);
    }
}