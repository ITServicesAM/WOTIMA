import { Component, OnDestroy, OnInit, ViewContainerRef } from "@angular/core";
import { BackendService } from '../../services/backend.service';
import { ModalDialogOptions, ModalDialogService, RouterExtensions } from 'nativescript-angular';
import { UtilsService } from '../../services/utils.service';
import * as TimeDatePicker from 'nativescript-timedatepicker';
    import { Page } from 'tns-core-modules/ui/page';
    import * as moment from 'moment';
import { Moment } from 'moment';
import 'moment/locale/de';
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import { WorktimeBudgetEditComponent } from "../../worktime-budget-edit/worktime-budget-edit.component";

@Component({
    selector: "worktime-home",
    moduleId: module.id,
    templateUrl: "./worktime-home.component.html",
    styleUrls: ["./worktime-home.component.css"]
})
export class WorktimeHomeComponent implements OnInit, OnDestroy {

    public worktimeBudget$: Observable<any>;
    public worktime$: Observable<any>;
    private workTimeSubscription: Subscription;

    curDate: string;

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
                private vcRef: ViewContainerRef,
                private modalService: ModalDialogService) {
    }

    ngOnInit() {
        moment.locale('de');
        this.curDate = moment().format('ddd, DD.MM.YYYY');
        this.page.actionBarHidden = false;

        this.loadWorktimeBudget();
        this.loadWorktime();
    }

    ngOnDestroy(): void {
        this.workTimeSubscription.unsubscribe();
    }

    onEdit() {
        // this.utils.showInfoDialog('OnEdit clicked!');
        const options: ModalDialogOptions = {
            viewContainerRef: this.vcRef,
            fullscreen: false,
        };

        this.modalService.showModal(WorktimeBudgetEditComponent, options).then(() => {
        });
    }

    loadWorktimeBudget() {
        this.worktimeBudget$ = this.backendService.loadWorktimeBudget();
    }

    loadWorktime() {
        let curTime: Moment = moment();
        this.worktime$ = this.backendService.loadWorktime(curTime.format("YYYY-MM-DD"));
        this.workTimeSubscription = this.worktime$.subscribe(data => {
            // console.log(JSON.stringify(data));
            if (data != undefined) {
                if (data.workTimeStart) {
                    this.worktimeStartDateString = moment(data.workTimeStart);
                    // console.log(`worktimeStartString: ${this.worktimeStartDateString.format()}`);
                    this.worktimeStartString =
                        `KOMMTZEIT: ${this.worktimeStartDateString.format("HH")}:${this.worktimeStartDateString.format("mm")} UHR`;
                }

                if (data.workTimeEnd) {
                    this.worktimeEndDateString = moment(data.workTimeEnd);
                    // console.log(`worktimeEndString: ${this.worktimeEndDateString.format()}`);
                    this.worktimeEndString =
                        `GEHTZEIT: ${this.worktimeEndDateString.format("HH")}:${this.worktimeEndDateString.format("mm")} UHR`;
                }

                // console.log(`Pausenzeit vor if beträgt: ${data.workingMinutesPause}`);
                if (data.workingMinutesPause != undefined) {
                    // console.log(`Pausenzeit nach if beträgt: ${data.workingMinutesPause}`);
                    this.worktimePauseString = `${data.workingMinutesPause == 0 ? "0" : data.workingMinutesPause} Minuten Pause`;
                }

                if (data.workingMinutesOverTime != undefined)
                    this.worktimeOvertimeString = `${data.workingMinutesOverTime} Minuten Mehrarbeitszeit`;
            } else {
                this.worktimeStartString = "KOMMTZEIT ERFASSEN";
                this.worktimeEndString = "GEHTZEIT ERFASSEN";
                this.worktimePauseString = undefined;
                this.worktimeOvertimeString = undefined;
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