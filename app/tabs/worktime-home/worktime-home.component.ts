import { Component, NgZone, OnInit } from "@angular/core";
import { BackendService } from '../../shared/backend.service';
import { RouterExtensions } from 'nativescript-angular';
import { UtilsService } from '../../shared/utils.service';
import * as TimeDatePicker from 'nativescript-timedatepicker';
import { Page } from 'tns-core-modules/ui/page';
import * as moment from 'moment';
import { Moment } from 'moment';
import 'moment/locale/de';
import { firestore } from 'nativescript-plugin-firebase';
import { EventData } from 'tns-core-modules/data/observable';
import DocumentSnapshot = firestore.DocumentSnapshot;

@Component({
    selector: "worktime-home",
    moduleId: module.id,
    templateUrl: "./worktime-home.component.html",
    styleUrls: ["./worktime-home.component.css"]
})
export class WorktimeHomeComponent implements OnInit {

    curDate: string;

    worktimeBudget: string;
    worktimeStartString: string = "KOMMTZEIT ERFASSEN";
    worktimeStartDateString: Moment;
    worktimeEndString: string = "GEHTZEIT ERFASSEN";
    worktimeEndDateString: Moment;
    worktimePauseString: string;
    worktimeOvertimeString: string;

    constructor(private page: Page,
                private backendService: BackendService,
                private router: RouterExtensions,
                private utils: UtilsService,
                private zone: NgZone) {
    }

    ngOnInit() {
        moment.locale('de');
        this.curDate = moment().format('ddd, DD.MM.YYYY');
        this.page.actionBarHidden = false;
        this.page.on('navigatedTo', (data: EventData) => {
            this.loadWorktimeBudget();
            this.loadWorktime();
        });
    }

    onEdit() {
        this.utils.showInfoDialog('OnEdit clicked!');
    }

    loadWorktimeBudget() {
        this.backendService.loadWorktimeBudget(doc => {
            if (doc.exists) {
                this.zone.run(() => {
                    this.worktimeBudget = doc.data().worktimeBudget;
                });
            }
        });
    }

    loadWorktime() {
        let curTime: Moment = moment();
        this.backendService.loadWorktime(curTime.format("YYYY-MM-DD"), (doc: DocumentSnapshot) => {
            if (doc.exists) {
                this.zone.run(() => {
                    if (doc.data().workTimeStart) {
                        this.worktimeStartDateString = moment(doc.data().workTimeStart);
                        // console.log(`worktimeStartString: ${this.worktimeStartDateString.format()}`);
                        this.worktimeStartString =
                            `KOMMTZEIT: ${this.worktimeStartDateString.hour()}:${this.worktimeStartDateString.minute()} UHR`;
                    }

                    if (doc.data().workTimeEnd) {
                        this.worktimeEndDateString = moment(doc.data().workTimeEnd);
                        // console.log(`worktimeEndString: ${this.worktimeEndDateString.format()}`);
                        this.worktimeEndString =
                            `GEHTZEIT: ${this.worktimeEndDateString.hour()}:${this.worktimeEndDateString.minute()} UHR`;
                    }

                    if (doc.data().workingMinutesPause) {
                        this.worktimePauseString = `${doc.data().workingMinutesPause} Minuten Pause`;
                    }

                    if (doc.data().workingMinutesOverTime) {
                        this.worktimeOvertimeString = `${doc.data().workingMinutesOverTime} Minuten Mehrarbeitszeit`;
                    }
                });
            }
        });
    }


    onChooseStarttime() {
        if (this.worktimeStartDateString === undefined) {
            this.worktimeStartDateString = moment();
        }
        let mCallback = ((result) => {
            if (result) {
                let date = moment(result, "DD-MM-YYYY-HH-mm-ZZ");
                // console.log(date.format());
                this.backendService.saveStartWorktime(date);
            }
        });
        TimeDatePicker.init(mCallback, null, this.worktimeStartDateString.toDate());
        TimeDatePicker.showTimePickerDialog();
    }

    onChooseEndtime() {
        if (this.worktimeEndDateString === undefined) {
            this.worktimeEndDateString = moment();
        }
        let mCallback = ((result) => {
            if (result) {
                let date = moment(result, "DD-MM-YYYY-HH-mm-ZZ");
                // console.log(date.format());
                this.backendService.saveEndWorktime(date);
            }
        });
        TimeDatePicker.init(mCallback, null, this.worktimeEndDateString.toDate());
        TimeDatePicker.showTimePickerDialog();
    }
}