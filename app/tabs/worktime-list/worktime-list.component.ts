import { Component, OnInit } from '@angular/core';
import { BackendService } from '../../shared/backend.service';
import { Worktime } from '../../models/worktime.interface';
import { RouterExtensions } from 'nativescript-angular';
import { Page } from 'tns-core-modules/ui/page';
import { EventData } from 'tns-core-modules/data/observable';

@Component({
    selector: "worktime-list",
    moduleId: module.id,
    templateUrl: "./worktime-list.component.html",
    styleUrls: ['worktime-list.component.css']
})
export class WorktimeListComponent implements OnInit {

    public _dataItems: Worktime[];

    constructor(private backend: BackendService,
                private router: RouterExtensions,
                private page: Page) {
    }

    onEditWorktime(worktime: Worktime) {
        this.router.navigate([`worktime-detail/${worktime.date}`]);
    }

    ngOnInit() {
        this.page.on('navigatedTo', (data: EventData) => {
            // console.log(JSON.stringify(data));
            this.loadWorktimes();
        });
    }

    loadWorktimes() {
        this.backend.loadWorktimes().then((values: Worktime[]) => {
            this._dataItems = values;
        });
    }
}