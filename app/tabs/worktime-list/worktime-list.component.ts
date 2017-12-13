import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { BackendService } from '../../services/backend.service';
import { Worktime } from '../../models/worktime.interface';
import { RouterExtensions } from 'nativescript-angular';
import { Page } from 'tns-core-modules/ui/page';
import { EventData } from 'tns-core-modules/data/observable';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
    selector: "worktime-list",
    moduleId: module.id,
    templateUrl: "./worktime-list.component.html",
    styleUrls: ['worktime-list.component.css'],
    changeDetection: ChangeDetectionStrategy.Default
})
export class WorktimeListComponent implements OnInit {

    public worktimes$: Observable<any>;

    public items$: BehaviorSubject<Array<any>> = new BehaviorSubject([]);
    private _items: Array<any>;

    constructor(private backend: BackendService,
        private router: RouterExtensions,
        private page: Page) {
        this._items = [
            'Item 1',
            'Item 2',
            'Item 3'
        ];
        this.items$.next(this._items);
    }

    public addItem() {
        this._items.push(`Item ${this._items.length + 1}`);
        // important to always push a new Array
        // to properly update the view (immutability)
        this.items$.next([...this._items]);

        // this would be the wrong way
        // this.items$.next(this._items);
    }

    onEditWorktime(worktime: Worktime) {
        this.router.navigate([`worktime-detail/${worktime.date}`]);
    }

    ngOnInit() {
        console.log('onInit called');
        this.worktimes$ = this.backend.loadWorktimes();
        console.log(`WorktimesObservable: ${JSON.stringify(this.worktimes$)}`);
        // this.loadWorktimes();
        // this.page.on('navigatedTo', (data: EventData) => {
        //     // console.log(JSON.stringify(data));
        //     this.loadWorktimes();
        // });
    }

    loadWorktimes() {
        this.worktimes$ = this.backend.loadWorktimes();
    }
}