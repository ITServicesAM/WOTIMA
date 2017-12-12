export class Worktime {
    date: string;
    workTimeStart: string;
    workTimeEnd: string;
    reverseOrderDate: number;
    workingMinutesBrutto?: number;
    workingMinutesNetto?: number;
    workingMinutesOverTime?: number;
    workingMinutesPause?: number;

    constructor(date: string, workTimeStart: string,
                workTimeEnd: string, reverseOrderDate: number,
                workingMinutesBrutto?: number, workingMinutesNetto?: number,
                workingMinutesOverTime?: number, workingMinutesPause?: number) {
        this.date = date;
        this.workTimeStart = workTimeStart;
        this.workTimeEnd = workTimeEnd;
        this.reverseOrderDate = reverseOrderDate;
        this.workingMinutesBrutto = workingMinutesBrutto ? workingMinutesBrutto : 0;
        this.workingMinutesNetto = workingMinutesNetto ? workingMinutesNetto : 0;
        this.workingMinutesOverTime = workingMinutesOverTime ? workingMinutesOverTime : 0;
        this.workingMinutesPause = workingMinutesPause ? workingMinutesPause : 0;
    }
}