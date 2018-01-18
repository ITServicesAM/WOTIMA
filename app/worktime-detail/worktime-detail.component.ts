import { Component, OnDestroy } from '@angular/core';
import { PageRoute, RouterExtensions } from 'nativescript-angular';
import "rxjs/add/operator/switchMap";
import { UtilsService } from '../services/utils.service';
import { BackendService } from '../services/backend.service';
import { Worktime } from "../models/worktime.interface";
import { Moment } from "moment";
import * as TimeDatePicker from 'nativescript-timedatepicker';
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import * as dialogs from "tns-core-modules/ui/dialogs";
import moment = require("moment");

@Component({
    selector: "worktime-detail",
    moduleId: module.id,
    templateUrl: "./worktime-detail.component.html",
    styleUrls: ["./worktime-detail.component.css"]
})
export class WorktimeDetailComponent implements OnDestroy {

    dateKey: string;
    worktime: Worktime;
    worktime$: Observable<Worktime>;
    worktimeSubscription: Subscription;

    constructor(private router: RouterExtensions,
                private pageRoute: PageRoute,
                private utils: UtilsService,
                private backend: BackendService) {
        // use switchMap to get the latest activatedRoute instance
        this.pageRoute.activatedRoute.switchMap(activatedRoute => activatedRoute.params).forEach((params) => {
            this.dateKey = params["id"];
            console.log(`WorktimeDetail dateKey: ${this.dateKey}`);
            this.loadWorktime();
        });
    }

    ngOnDestroy(): void {
        this.worktimeSubscription.unsubscribe();
    }

    loadWorktime() {
        this.worktime$ = this.backend.loadWorktime(this.dateKey);
        this.worktimeSubscription = this.worktime$.subscribe(data => {
            this.worktime = data;
        });
    }

    goToPreviousPage() {
        this.router.backToPreviousPage();
    }

    onEditStartime() {
        let startTime: Moment;
        if (this.worktime.workTimeStart) {
            startTime = moment(this.worktime.workTimeStart);
        } else
            startTime = moment();

        let mCallback = ((result) => {
            if (result) {
                let date = moment(result, "DD-MM-YYYY-HH-mm-ZZ");
                console.log(date.format());
                this.worktime.workTimeStart = date.format();
                this.calculateWorktimeBudget();
            }
        });
        TimeDatePicker.init(mCallback, null, startTime.toDate());
        TimeDatePicker.showTimePickerDialog();
    }

    onEditEndtime() {
        let endTime: Moment;
        if (this.worktime.workTimeEnd) {
            endTime = moment(this.worktime.workTimeEnd);
        } else
            endTime = moment();

        let mCallback = ((result) => {
            if (result) {
                let date = moment(result, "DD-MM-YYYY-HH-mm-ZZ");
                console.log(date.format());
                this.worktime.workTimeEnd = date.format();
                this.calculateWorktimeBudget();
            }
        });
        TimeDatePicker.init(mCallback, null, endTime.toDate());
        TimeDatePicker.showTimePickerDialog();
    }

    onPauseChange(value) {
        console.log(value);
        this.worktime.workingMinutesPause = value;
        // let textfield: TextField = <TextField>args.object;
        // console.log(`New value for pause: ${this.workingMinutesPause}`);
        this.calculateWorktimeBudget();
    }

    onSaveChanges() {
        BackendService.saveWorktime(this.worktime).then(() => {
            console.log('successfully saved new worktime');
            this.router.backToPreviousPage();
        }).catch(err => this.utils.handleError(JSON.stringify(err)));
    }

    onDelete() {
        const date: Moment = moment(this.dateKey);
        dialogs.confirm({
            title: "Arbeitszeit löschen?",
            message: `Hiermit werden alle Daten für den ${date.format('DD.MM.YYYY')} gelöscht!`,
            cancelButtonText: "Abbrechen",
            okButtonText: "Löschen"
        }).then(result => {
            console.log("Dialog result: " + result);
            if (result === true) {
                this.backend.deleteWorktime(this.dateKey).then(() => {
                    this.goToPreviousPage();
                }).catch(err => console.log(err.message));
            }
        });
    }

    calculateWorktimeBudget() {
        let milliseconds = moment(this.worktime.workTimeEnd).valueOf() - moment(this.worktime.workTimeStart).valueOf();

        if (milliseconds > 0) {
            //get minutes form milliseconds
            let minutes = milliseconds / (1000 * 60);
            let workingMinutesBrutto: number = Math.floor(minutes);
            // console.log("all minutes in the duration: " + workingMinutesRaw);

            let workingMinutesPause: number = 0;
            if (Math.floor(workingMinutesBrutto / 60) < 6) {
                // console.log("Keine Pause");
            } else if (Math.floor(workingMinutesBrutto / 60) === 6 &&
                (((workingMinutesBrutto / 60) - (Math.floor(workingMinutesBrutto / 60))) * 60) > 0) {
                workingMinutesPause = 30;
                // console.log("30 minuten Pause");
            } else if (Math.floor(workingMinutesBrutto / 60) > 6 && Math.floor(workingMinutesBrutto / 60) < 9) {
                workingMinutesPause = 30;
                // console.log("30 minuten Pause");
            } else if (Math.floor(workingMinutesBrutto / 60) === 9 &&
                (((workingMinutesBrutto / 60) - (Math.floor(workingMinutesBrutto / 60))) * 60) > 0) {
                workingMinutesPause = 45;
                // console.log("45 minuten Pause");
            } else if (Math.floor(workingMinutesBrutto / 60) > 9) {
                workingMinutesPause = 45;
                // console.log("45 minuten Pause");
            }

            let defaultWorkingMinutesPerDay: number = 480; //entspricht 8:30 Stunden
            let workingMinutesNetto: number = workingMinutesBrutto - workingMinutesPause -
                (this.worktime.workingMinutesPause > workingMinutesPause ? this.worktime.workingMinutesPause - workingMinutesPause : 0);
            let workingMinutesOverTimeNew: number = workingMinutesNetto - defaultWorkingMinutesPerDay;

            this.worktime.workingMinutesBrutto = workingMinutesBrutto;
            this.worktime.workingMinutesNetto = workingMinutesNetto;
            this.worktime.workingMinutesOverTime = workingMinutesOverTimeNew;
            this.worktime.workingMinutesPause = (this.worktime.workingMinutesPause > workingMinutesPause ?
                this.worktime.workingMinutesPause : workingMinutesPause);
        }
    }
}