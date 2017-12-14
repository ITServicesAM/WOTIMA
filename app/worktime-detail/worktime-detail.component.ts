import { Component, NgZone } from '@angular/core';
import { PageRoute, RouterExtensions } from 'nativescript-angular';
import "rxjs/add/operator/switchMap";
import { UtilsService } from '../services/utils.service';
import { BackendService } from '../services/backend.service';
import { firestore } from 'nativescript-plugin-firebase';
import { Observable } from "rxjs/Observable";

@Component({
    selector: "worktime-detail",
    moduleId: module.id,
    templateUrl: "./worktime-detail.component.html",
    styleUrls: ["./worktime-detail.component.css"]
})
export class WorktimeDetailComponent {

    dateKey: string;
    worktime$: Observable<any>;

    constructor(private router: RouterExtensions,
                private pageRoute: PageRoute,
                private utils: UtilsService,
                private backend: BackendService,
                private zone: NgZone) {
        // use switchMap to get the latest activatedRoute instance
        this.pageRoute.activatedRoute
            .switchMap(activatedRoute => activatedRoute.params)
            .forEach((params) => {
                this.dateKey = params["id"];
                this.loadWorktime();
            });
    }

    loadWorktime() {
        this.backend.loadWorktime(this.dateKey);
        // this.backend.loadWorktime(this.dateKey, (doc: DocumentSnapshot) => {
        //     if (doc.exists) {
        //         this.zone.run(() => {
        //             let data = doc.data();
        //             this.worktime = new Worktime(data.date,
        //                 data.workTimeStart,
        //                 data.workTimeEnd,
        //                 data.reverseOrderDate,
        //                 data.workingMinutesBrutto,
        //                 data.workingMinutesNetto,
        //                 data.workingMinutesOverTime,
        //                 data.workingMinutesPause);
        //             // this.utils.showInfoDialog(`Worktime: ${this.worktime}`);
        //         });
        //     } else {
        //         this.utils.showInfoDialog(`Document not found, handle this error!`);
        //     }
        // });
    }

    onBackPressed() {
        this.router.backToPreviousPage();
    }

    onEditStartime() {
        // let startTime: Moment;
        // if (this.worktime.workTimeStart) {
        //     startTime = moment(this.worktime.workTimeStart);
        // } else
        //     startTime = moment();
        //
        // let mCallback = ((result) => {
        //     if (result) {
        //         let date = moment(result, "DD-MM-YYYY-HH-mm-ZZ");
        //         console.log(date.format());
        //         this.worktime.workTimeStart = date.format();
        //     }
        // });
        // TimeDatePicker.init(mCallback, null, startTime.toDate());
        // TimeDatePicker.showTimePickerDialog();
    }

    onEditEndtime() {
        // let endTime: Moment;
        // if (this.worktime.workTimeEnd) {
        //     endTime = moment(this.worktime.workTimeEnd);
        // } else
        //     endTime = moment();
        //
        // let mCallback = ((result) => {
        //     if (result) {
        //         let date = moment(result, "DD-MM-YYYY-HH-mm-ZZ");
        //         console.log(date.format());
        //         this.worktime.workTimeEnd = date.format();
        //     }
        // });
        // TimeDatePicker.init(mCallback, null, endTime.toDate());
        // TimeDatePicker.showTimePickerDialog();
    }

    onSaveChanges() {

    }
}