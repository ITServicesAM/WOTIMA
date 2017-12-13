import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { RouterExtensions } from 'nativescript-angular';
import * as moment from 'moment';
import { Moment } from 'moment';
import * as TimeDatePicker from 'nativescript-timedatepicker';
import 'rxjs/add/observable/of';
import { BackendService } from '../services/backend.service';
import { Worktime } from '../models/worktime.interface';
import { UtilsService } from '../services/utils.service';

@Component({
    selector: "worktime-new",
    moduleId: module.id,
    templateUrl: "./worktime-new.component.html",
    styleUrls: ["./worktime-new.component.css"]
})
export class WorktimeNewComponent implements OnInit {

    worktimeDate: string;
    worktimeStart: string;
    worktimeEnd: string;
    workingMinutesPause: number = 0;
    workingMinutesNetto: number = 0;
    workingMinutesBrutto: number;
    workingMinutesOverTime: number;

    constructor(private router: RouterExtensions,
                private changeDetection: ChangeDetectorRef,
                private backendService: BackendService,
                private utils: UtilsService,
                private zone: NgZone) {
    }

    ngOnInit() {
        let curDate = moment();
        this.worktimeDate = curDate.format("YYYY-MM-DD");
        this.worktimeStart = curDate.format();
        this.worktimeEnd = curDate.format();
        this.calculateWorktimeBudget();
    }

    onBackPressed() {
        this.router.backToPreviousPage();
    }

    onEditDate() {
        let date: Moment;
        if (this.worktimeDate) {
            date = moment(this.worktimeDate);
        } else
            date = moment();

        let mCallback = ((result) => {
            if (result) {
                console.log(result);
                this.zone.run(() => {
                    let date = moment(result, "DD-MM-YYYY-HH-mm-ZZ");
                    // console.log(date.format());
                    this.worktimeDate = date.format("YYYY-MM-DD");
                    let worktimeStartMoment = moment(this.worktimeStart);
                    let worktimeEndMoment = moment(this.worktimeEnd);
                    worktimeStartMoment.date(date.date());
                    worktimeStartMoment.month(date.month());
                    worktimeStartMoment.year(date.year());
                    worktimeEndMoment.date(date.date());
                    worktimeEndMoment.month(date.month());
                    worktimeEndMoment.year(date.year());
                    this.worktimeStart = worktimeStartMoment.format();
                    this.worktimeEnd = worktimeEndMoment.format();

                    console.log(`WorktimeStart: ${this.worktimeStart}`);
                    console.log(`WorktimeEnd: ${this.worktimeEnd}`);
                });
            }
        });
        TimeDatePicker.init(mCallback, null, date.toDate());
        TimeDatePicker.showDatePickerDialog();
    }

    onEditStarttime() {
        let startTime: Moment;
        if (this.worktimeStart) {
            startTime = moment(this.worktimeStart);
        } else
            startTime = moment();

        let mCallback = ((result) => {
            if (result) {
                this.zone.run(() => {
                    let date = moment(result, "DD-MM-YYYY-HH-mm-ZZ");
                    // console.log(date.format());
                    this.worktimeStart = date.format();
                    this.calculateWorktimeBudget();
                });
            }
        });
        TimeDatePicker.init(mCallback, null, startTime.toDate());
        TimeDatePicker.showTimePickerDialog();
    }

    onEditEndtime() {
        let endTime: Moment;
        if (this.worktimeEnd) {
            endTime = moment(this.worktimeEnd);
        } else
            endTime = moment();

        let mCallback = ((result) => {
            if (result) {
                this.zone.run(() => {
                    let date = moment(result, "DD-MM-YYYY-HH-mm-ZZ");
                    // console.log(date.format());
                    this.worktimeEnd = date.format();
                    this.calculateWorktimeBudget();
                });
            }
        });
        TimeDatePicker.init(mCallback, null, endTime.toDate());
        TimeDatePicker.showTimePickerDialog();
    }

    onSaveChanges() {
        this.backendService.saveWorktime(new Worktime(
            this.worktimeDate,
            this.worktimeStart,
            this.worktimeEnd,
            (0 - moment(this.worktimeDate).valueOf()),
            this.workingMinutesBrutto,
            this.workingMinutesNetto,
            this.workingMinutesOverTime,
            this.workingMinutesPause
        )).then(() => {
            console.log('successfully saved new worktime');
            this.router.backToPreviousPage();
        })
            .catch(err => this.utils.handleError(JSON.stringify(err)));
    }

    onPauseChange(value) {
        console.log(value);
        this.workingMinutesPause = value;
        // let textfield: TextField = <TextField>args.object;
        // console.log(`New value for pause: ${this.workingMinutesPause}`);
        this.calculateWorktimeBudget();
    }

    calculateWorktimeBudget() {
        let milliseconds = moment(this.worktimeEnd).valueOf() - moment(this.worktimeStart).valueOf();

        if (milliseconds > 0) {
            //get minutes form milliseconds
            let minutes = milliseconds / (1000 * 60);
            let workingMinutesBrutto: number = Math.floor(minutes);
            // console.log("all minutes in the duration: " + workingMinutesRaw);

            let workingMinutesPause: number = 0;
            if (Math.floor(workingMinutesBrutto / 60) < 6) {
                // console.log("Keine Pause");
            } else if (Math.floor(workingMinutesBrutto / 60) === 6 && (((workingMinutesBrutto / 60) - (Math.floor(workingMinutesBrutto / 60))) * 60) > 0) {
                workingMinutesPause = 30;
                // console.log("30 minuten Pause");
            } else if (Math.floor(workingMinutesBrutto / 60) > 6 && Math.floor(workingMinutesBrutto / 60) < 9) {
                workingMinutesPause = 30;
                // console.log("30 minuten Pause");
            } else if (Math.floor(workingMinutesBrutto / 60) === 9 && (((workingMinutesBrutto / 60) - (Math.floor(workingMinutesBrutto / 60))) * 60) > 0) {
                workingMinutesPause = 45;
                // console.log("45 minuten Pause");
            } else if (Math.floor(workingMinutesBrutto / 60) > 9) {
                workingMinutesPause = 45;
                // console.log("45 minuten Pause");
            }

            let defaultWorkingMinutesPerDay: number = 480; //entspricht 8:30 Stunden
            let workingMinutesNetto: number = workingMinutesBrutto - workingMinutesPause -
                (this.workingMinutesPause > workingMinutesPause ? this.workingMinutesPause - workingMinutesPause : 0);
            let workingMinutesOverTimeNew: number = workingMinutesNetto - defaultWorkingMinutesPerDay;

            this.workingMinutesBrutto = workingMinutesBrutto;
            this.workingMinutesNetto = workingMinutesNetto;
            this.workingMinutesOverTime = workingMinutesOverTimeNew;
            this.workingMinutesPause = (this.workingMinutesPause > workingMinutesPause ? this.workingMinutesPause : workingMinutesPause);
        }
    }
}