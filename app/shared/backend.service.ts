import { firestore, LoginType, User } from 'nativescript-plugin-firebase';
import { Injectable, NgZone } from '@angular/core';
import { UtilsService } from './utils.service';
import * as moment from 'moment';
import { Moment } from 'moment';
import { Worktime } from '../models/worktime.interface';
import firebase = require("nativescript-plugin-firebase");
import DocumentSnapshot = firestore.DocumentSnapshot;
import QuerySnapshot = firestore.QuerySnapshot;

@Injectable()
export class BackendService {

    constructor(private utils: UtilsService, private zone: NgZone) {
    }

    getCurrentUser(): Promise<User> {
        return firebase.getCurrentUser();
    }

    loginWithGoogle(): Promise<void> {
        return firebase.login({
            type: LoginType.GOOGLE
        }).then((user) => {
            return this.createUser(user);
        })
    }

    createUser(user: User): Promise<void> {
        return firestore.collection('users').doc(user.uid).set({
            "email": user.email
        }, {merge: true});
    }

    logout(): Promise<any> {
        return firebase.logout();
    }

    loadWorktimes(): Promise<Worktime[]> {
        return this.getCurrentUser().then(user => {
            return firestore.collection('users').doc(user.uid).collection('worktimes')
                .orderBy('reverseOrderDate', "asc").get()
                .then((value: QuerySnapshot) => {
                    return value.docSnapshots.map((doc: firestore.DocumentSnapshot) => {
                        let data = doc.data();
                        return new Worktime(data.date,
                            data.workTimeStart,
                            data.workTimeEnd,
                            data.reverseOrderDate,
                            data.workingMinutesBrutto,
                            data.workingMinutesNetto,
                            data.workingMinutesOverTime,
                            data.workingMinutesPause);
                    });
                });
        })
    }

    loadWorktimeBudget(callback: (doc: DocumentSnapshot) => void) {
        this.getCurrentUser().then((user: User) => {
            firestore.collection('users').doc(user.uid).onSnapshot(callback);
        });
    }

    loadWorktime(dateKey: string, callback: (doc: DocumentSnapshot) => void) {
        this.getCurrentUser().then((user: User) => {
            firestore.collection('users').doc(user.uid).collection('worktimes').doc(dateKey).onSnapshot(callback);
        });
    }

    saveStartWorktime(date: Moment) {
        let dateKey = date.format("YYYY-MM-DD");
        let workTimeStart = date.format();
        this.getCurrentUser().then((user: User) => {
            firestore.collection(`users/${user.uid}/worktimes`).doc(dateKey).set({
                "workTimeStart": workTimeStart,
                "date": dateKey,
                "reverseOrderDate": (0 - moment(dateKey).valueOf())
            }, {merge: true}).then(() => this.calculateWorktimeBudget(dateKey, user.uid))
                .catch(err => this.utils.handleError(JSON.stringify(err)));
        });
    }

    saveEndWorktime(date: Moment) {
        let dateKey = date.format("YYYY-MM-DD");
        let workTimeEnd = date.format();
        this.getCurrentUser().then((user: User) => {
            firestore.collection(`users/${user.uid}/worktimes`).doc(dateKey).set({
                "workTimeEnd": workTimeEnd,
                "date": dateKey,
                "reverseOrderDate": (0 - moment(dateKey).valueOf())
            }, {merge: true}).then(() => this.calculateWorktimeBudget(dateKey, user.uid))
                .catch(err => this.utils.handleError(JSON.stringify(err)));
        });
    }

    saveWorktime(worktime: Worktime): Promise<void> {
        return this.getCurrentUser().then((user: User) => {
            return firestore.collection('users').doc(user.uid).collection('worktimes').doc(worktime.date).set(worktime);
        })
    }

    calculateWorktimeBudget(dateKey: string, uid: string) {
        firestore.collection(`users/${uid}/worktimes`).doc(dateKey).get().then(doc => {
            if (doc.exists) {
                console.log("Document under dateKey exists");
                let worktimeStart = doc.data().workTimeStart;
                let worktimeEnd = doc.data().workTimeEnd;
                let workingMinutesOverTimeOld = doc.data().workingMinutesOverTime;

                if (worktimeStart && worktimeEnd) {
                    let milliseconds = moment(worktimeEnd).valueOf() - moment(worktimeStart).valueOf();

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
                        let workingMinutesNetto: number = workingMinutesBrutto - workingMinutesPause;
                        let workingMinutesOverTimeNew: number = workingMinutesNetto - defaultWorkingMinutesPerDay;

                        firestore.collection(`users/${uid}/worktimes`).doc(dateKey).set({
                            "workingMinutesBrutto": workingMinutesBrutto,
                            "workingMinutesPause": workingMinutesPause,
                            "workingMinutesNetto": workingMinutesNetto,
                            "workingMinutesOverTime": workingMinutesOverTimeNew
                        }, {merge: true});


                        //CALCULATE ADDITION OR SUBTRACTION TO WORKING_HOURS_BUDGET
                        firestore.collection(`users`).doc(uid).get().then(doc => {
                            if (doc.exists) {
                                let worktimeBudget = doc.data().worktimeBudget;
                                let newWorktimeBudget: number = 0;
                                if (!workingMinutesOverTimeOld) {
                                    newWorktimeBudget = worktimeBudget + workingMinutesOverTimeNew;
                                } else {
                                    let valueChange: number = workingMinutesOverTimeNew - workingMinutesOverTimeOld;
                                    console.log("ValueChange: " + valueChange);
                                    newWorktimeBudget = worktimeBudget + valueChange;
                                }
                                firestore.collection(`users`).doc(uid).set({
                                    "worktimeBudget": newWorktimeBudget
                                }, {merge: true});
                            }
                        });
                    }
                }
            }
        })
    }
}