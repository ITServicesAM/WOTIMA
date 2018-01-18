import { getString, setString } from "application-settings";
import { FBData, LoginType, User } from 'nativescript-plugin-firebase';
import { Injectable, NgZone } from '@angular/core';
import { UtilsService } from './utils.service';
import { Moment } from 'moment';
import { Worktime } from '../models/worktime.interface';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/share';
import { WorktimeDateRange } from "../models/worktime-date-range.interface";
import firebase = require("nativescript-plugin-firebase");
import moment = require("moment");

const tokenKey = "token";

@Injectable()
export class BackendService {

    static getToken(): string {
        return getString(tokenKey);
    }

    static setToken(theToken: string) {
        setString(tokenKey, theToken);
    }

    // worktimes: BehaviorSubject<Array<Worktime>> = new BehaviorSubject([]);
    private _allWorktimes: Worktime[] = [];

    constructor(private utils: UtilsService, private ngZone: NgZone) {
    }

    static getCurrentUser(): Promise<User> {
        return firebase.getCurrentUser();
    }

    signInWithGoogle(): Promise<void> {
        return firebase.login({
            type: LoginType.GOOGLE
        }).then((user) => {
            return BackendService.createUser(user);
        }).catch(err => this.utils.handleError(err));
    }

    signInWithFacebook(): Promise<any> {
        return firebase.login({
            type: LoginType.FACEBOOK,
            facebookOptions: {
                // defaults to ['public_profile', 'email']
                scope: ['public_profile', 'email']
            }
        }).then((user) => {
            return BackendService.createUser(user);
        }).catch(err => this.utils.handleError(err));
    }

    static signInWithEmail(email: string, password: string) {
        return firebase.login({
            type: LoginType.PASSWORD,
            passwordOptions: {
                email,
                password
            }
        });
    }

    signUpWithEmailAndPassword(email: string, password: string) {
        return firebase.createUser({
            email,
            password
        }).then(() => {
            return firebase.sendEmailVerification();
        }).catch(err => this.utils.handleError(err));
    }

    static signOut(): Promise<any> {
        BackendService.setToken("");
        return firebase.logout();
    }

    static getUser(): Observable<User> {
        return Observable.fromPromise(firebase.getCurrentUser());
    }

    static createUser(user: User): Promise<void> {
        return firebase.update(`users/${BackendService.getToken()}`, {
            "email": user.email
        })
    }

    loadWorktimes(worktimeDateRange: WorktimeDateRange): Observable<any> {
        this._allWorktimes = [];
        return new Observable((observer: any) => {
            observer.next(null);
            let path = `/workTimes/${BackendService.getToken()}`;
            let onQueryEvent = (querySnapshot: firebase.FBData) => {
                this.ngZone.run(() => {
                    // console.log(`BackendService: ${JSON.stringify(querySnapshot)}`);
                    let results = this.handleSnapshot(querySnapshot);
                    observer.next(results.length > 0 ? results : null);
                });
            };
            firebase.query(onQueryEvent, path, {
                ranges: [
                    {
                        type: firebase.QueryRangeType.START_AT,
                        value: worktimeDateRange.startAtDate
                    },
                    {
                        type: firebase.QueryRangeType.END_AT,
                        value: worktimeDateRange.endAtDate
                    }
                ],
                orderBy: {
                    type: firebase.QueryOrderByType.CHILD,
                    value: 'date'
                }
            })
        }).share();
    }

    handleSnapshot(data: firebase.FBData): Worktime[] {
        if (data.type === "ChildAdded") {
            let alreadyAdded = false;
            this._allWorktimes.forEach(worktime => {
                if (worktime.date === data.key)
                    alreadyAdded = true;
            });
            if (!alreadyAdded)
                this._allWorktimes.push(data.value);
        }
        if (data.type === "ChildRemoved") {
            this._allWorktimes.forEach(worktime => {
                if (worktime.date === data.key) {
                    this._allWorktimes.splice(this._allWorktimes.indexOf(worktime), 1);
                }
            });
        }
        if (data.type === "ChildChanged") {
            let newWorktime: Worktime = data.value;
            this._allWorktimes.forEach(worktime => {
                if (worktime.date === data.key) {
                    let oldWorktime = this._allWorktimes.slice(this._allWorktimes.indexOf(worktime), 1)[0];
                    oldWorktime.date = newWorktime.date;
                    oldWorktime.reverseOrderDate = newWorktime.reverseOrderDate;
                    oldWorktime.workingMinutesBrutto = newWorktime.workingMinutesBrutto;
                    oldWorktime.workingMinutesNetto = newWorktime.workingMinutesNetto;
                    oldWorktime.workingMinutesOverTime = newWorktime.workingMinutesOverTime;
                    oldWorktime.workingMinutesPause = newWorktime.workingMinutesPause;
                    oldWorktime.workTimeEnd = newWorktime.workTimeEnd;
                    oldWorktime.workTimeStart = newWorktime.workTimeStart;
                    // this._allWorktimes.splice(this._allWorktimes.indexOf(worktime), 1);

                    console.log(`Changed worktime: ${this._allWorktimes.slice(this._allWorktimes.indexOf(worktime), 1)[0]}`);
                }
            });
        }
        this.publishUpdates();
        return this._allWorktimes;
    }

    private publishUpdates() {
        this._allWorktimes.sort(function (a, b) {
            if (a.reverseOrderDate < b.reverseOrderDate) return -1;
            if (a.reverseOrderDate > b.reverseOrderDate) return 1;
            return 0;
        })
    }

    loadWorktimeBudget(): Observable<number> {
        return Observable.create(subscriber => {
            let path = `overTimeBudgets/${BackendService.getToken()}`;
            let onValueEvent = (snapshot: any) => {
                this.ngZone.run(() => {
                    console.log(`Neues Arbeitszeitkonto: ${JSON.stringify(snapshot)}`);
                    let overTimeBudget: number;
                    if (snapshot.value) {
                        overTimeBudget = <number>snapshot.value.overTimeBudget;
                    }
                    subscriber.next(overTimeBudget);
                });
            };
            firebase.addValueEventListener(onValueEvent, `/${path}`).then(() => {
                this.ngZone.run(() => {
                    // console.log('Listening to worktimeBudget');
                })
            }).catch(err => {
                this.ngZone.run(() => {
                    this.utils.handleError(err);
                });
            });
        }).share();
    }

    static saveWorktimeBudget(worktimeBudget): Promise<any> {
        let worktimeBudgetNumber = parseFloat(worktimeBudget);
        let path = `overTimeBudgets/${BackendService.getToken()}`;
        return firebase.setValue(path, {
            "overTimeBudget": isNaN(worktimeBudgetNumber) ? worktimeBudget : worktimeBudgetNumber
        });
    }

    loadWorktime(dateKey: string): Observable<any> {
        return new Observable((observer: any) => {
            let path = `workTimes/${BackendService.getToken()}/${dateKey}`;
            let onValueEvent = (snapshot: any) => {
                this.ngZone.run(() => {
                    console.log(JSON.stringify(snapshot));
                    let worktime;
                    if (snapshot.value) {
                        console.log(JSON.stringify(snapshot.value));
                        worktime = snapshot.value;
                    }
                    observer.next(worktime);
                });
            };
            firebase.addValueEventListener(onValueEvent, `/${path}`).then(() => {
                this.ngZone.run(() => {
                    console.log('Listening to specific worktime');
                })
            }).catch(err => {
                this.ngZone.run(() => {
                    this.utils.handleError(err);
                });
            });
        }).share();
    }

    saveStartWorktime(date: Moment) {
        let dateKey = date.format("YYYY-MM-DD");
        let workTimeStart = date.format();
        firebase.update(`workTimes/${BackendService.getToken()}/${dateKey}`, {
            "workTimeStart": workTimeStart,
            "date": dateKey,
            "reverseOrderDate": (0 - moment(dateKey).valueOf())
        }).then(() => this.calculateWorktimeBudget(dateKey)).catch(err => this.utils.handleError(JSON.stringify(err)));
    }

    saveEndWorktime(date: Moment) {
        let dateKey = date.format("YYYY-MM-DD");
        let workTimeEnd = date.format();
        firebase.update(`workTimes/${BackendService.getToken()}/${dateKey}`, {
            "workTimeEnd": workTimeEnd,
            "date": dateKey,
            "reverseOrderDate": (0 - moment(dateKey).valueOf())
        }).then(() => this.calculateWorktimeBudget(dateKey)).catch(err => this.utils.handleError(JSON.stringify(err)));
    }

    static saveWorktime(worktime: Worktime): Promise<any> {
        return firebase.setValue(`workTimes/${BackendService.getToken()}/${worktime.date}`, worktime);
    }

    deleteWorktime(key: string): Promise<any> {
        return firebase.getValue(`overTimeBudgets/${BackendService.getToken()}/overTimeBudget`).then((overTimeBudget: FBData) => {
            return firebase.getValue(`workTimes/${BackendService.getToken()}/${key}/workingMinutesOverTime`).then((workingMinutesOverTime: FBData) => {
                console.log(`overtimeBudget: ${JSON.stringify(overTimeBudget)} | workingMinutesOverTime: ${JSON.stringify(workingMinutesOverTime)}`);
                let updateObj = {};
                updateObj[`overTimeBudgets/${BackendService.getToken()}/overTimeBudget`] = overTimeBudget.value - workingMinutesOverTime.value;
                updateObj[`workTimes/${BackendService.getToken()}/${key}`] = null;
                console.dir(updateObj);
                return firebase.update('/', updateObj);
            });
        });
    }

    calculateWorktimeBudget(dateKey: string) {
        firebase.getValue(`workTimes/${BackendService.getToken()}/${dateKey}`).then((result: FBData) => {
            console.log(JSON.stringify(result));
            let worktime: Worktime = <Worktime>result.value;
            console.log(`calculateWorktimeBudget: ${JSON.stringify(worktime)} and the result was: ${result.value}`);
            if (worktime) {
                // let worktimeStart = worktime.workTimeStart;
                // let worktimeEnd = worktime.workTimeEnd;
                // let workingMinutesOverTimeOld = worktime.workingMinutesOverTime;
                if (worktime.workTimeStart && worktime.workTimeEnd) {
                    let milliseconds: number = moment(worktime.workTimeEnd).valueOf() - moment(worktime.workTimeStart).valueOf();

                    if (milliseconds > 0) {
                        //get minutes form milliseconds
                        let minutes: number = milliseconds / (1000 * 60);
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

                        firebase.update(`workTimes/${BackendService.getToken()}/${dateKey}`, {
                            "workingMinutesBrutto": workingMinutesBrutto,
                            "workingMinutesPause": workingMinutesPause,
                            "workingMinutesNetto": workingMinutesNetto,
                            "workingMinutesOverTime": workingMinutesOverTimeNew
                        });

                        //CALCULATE ADDITION OR SUBTRACTION TO WORKING_HOURS_BUDGET
                        firebase.getValue(`overTimeBudgets/${BackendService.getToken()}/overTimeBudget`).then((result: FBData) => {
                            console.log(JSON.stringify(result));
                            let worktimeBudget: number;
                            switch (typeof result.value) {
                                case 'number':
                                    worktimeBudget = result.value;
                                    break;
                                case 'string':
                                    worktimeBudget = Number.parseInt(result.value);
                                    break;
                            }

                            if (worktimeBudget) {
                                // let worktimeBudget = data.overTimeBudget;
                                let newWorktimeBudget: number = 0;
                                if (!worktime.workingMinutesOverTime) {
                                    newWorktimeBudget = worktimeBudget + workingMinutesOverTimeNew;
                                } else {
                                    let valueChange: number = workingMinutesOverTimeNew - worktime.workingMinutesOverTime;
                                    console.log("ValueChange: " + valueChange);
                                    newWorktimeBudget = worktimeBudget + valueChange;
                                }
                                firebase.update(`overTimeBudgets/${BackendService.getToken()}/overTimeBudget`, newWorktimeBudget);
                            }
                        });
                    }
                }
            }
        });
    }

    // FIRESTORE CODE

    // loadWorktimes(): Promise<Worktime[]> {
    //     return this.getCurrentUser().then(user => {
    //         return firestore.collection('users').doc(user.uid).collection('worktimes')
    //             .orderBy('reverseOrderDate', "asc").get()
    //             .then((value: QuerySnapshot) => {
    //                 return value.docSnapshots.map((doc: firestore.DocumentSnapshot) => {
    //                     let data = doc.data();
    //                     return new Worktime(data.date,
    //                         data.workTimeStart,
    //                         data.workTimeEnd,
    //                         data.reverseOrderDate,
    //                         data.workingMinutesBrutto,
    //                         data.workingMinutesNetto,
    //                         data.workingMinutesOverTime,
    //                         data.workingMinutesPause);
    //                 });
    //             });
    //     })
    // }

    // loadWorktimeBudget(callback: (doc: DocumentSnapshot) => void) {
    //     this.getCurrentUser().then((user: User) => {
    //         firestore.collection('users').doc(user.uid).onSnapshot(callback);
    //     });
    // }

    // loadWorktime(dateKey: string, callback: (doc: DocumentSnapshot) => void) {
    //     this.getCurrentUser().then((user: User) => {
    //         firestore.collection('users').doc(user.uid).collection('worktimes').doc(dateKey).onSnapshot(callback);
    //     });
    // }

    // saveStartWorktime(date: Moment) {
    //     let dateKey = date.format("YYYY-MM-DD");
    //     let workTimeStart = date.format();
    //     this.getCurrentUser().then((user: User) => {
    //         firestore.collection(`users/${user.uid}/worktimes`).doc(dateKey).set({
    //             "workTimeStart": workTimeStart,
    //             "date": dateKey,
    //             "reverseOrderDate": (0 - moment(dateKey).valueOf())
    //         }, { merge: true }).then(() => this.calculateWorktimeBudget(dateKey, user.uid))
    //             .catch(err => this.utils.handleError(JSON.stringify(err)));
    //     });
    // }

    // saveEndWorktime(date: Moment) {
    //     let dateKey = date.format("YYYY-MM-DD");
    //     let workTimeEnd = date.format();
    //     this.getCurrentUser().then((user: User) => {
    //         firestore.collection(`users/${user.uid}/worktimes`).doc(dateKey).set({
    //             "workTimeEnd": workTimeEnd,
    //             "date": dateKey,
    //             "reverseOrderDate": (0 - moment(dateKey).valueOf())
    //         }, { merge: true }).then(() => this.calculateWorktimeBudget(dateKey, user.uid))
    //             .catch(err => this.utils.handleError(JSON.stringify(err)));
    //     });
    // }

    // saveWorktime(worktime: Worktime): Promise<void> {
    //     return this.getCurrentUser().then((user: User) => {
    //         return firestore.collection('users').doc(user.uid).collection('worktimes').doc(worktime.date).set(worktime);
    //     })
    // }

    // calculateWorktimeBudget(dateKey: string, uid: string) {
    //     firestore.collection(`users/${uid}/worktimes`).doc(dateKey).get().then(doc => {
    //         if (doc.exists) {
    //             console.log("Document under dateKey exists");
    //             let worktimeStart = doc.data().workTimeStart;
    //             let worktimeEnd = doc.data().workTimeEnd;
    //             let workingMinutesOverTimeOld = doc.data().workingMinutesOverTime;

    //             if (worktimeStart && worktimeEnd) {
    //                 let milliseconds = moment(worktimeEnd).valueOf() - moment(worktimeStart).valueOf();

    //                 if (milliseconds > 0) {
    //                     //get minutes form milliseconds
    //                     let minutes = milliseconds / (1000 * 60);
    //                     let workingMinutesBrutto: number = Math.floor(minutes);
    //                     // console.log("all minutes in the duration: " + workingMinutesRaw);

    //                     let workingMinutesPause: number = 0;
    //                     if (Math.floor(workingMinutesBrutto / 60) < 6) {
    //                         // console.log("Keine Pause");
    //                     } else if (Math.floor(workingMinutesBrutto / 60) === 6 && (((workingMinutesBrutto / 60) - (Math.floor(workingMinutesBrutto / 60))) * 60) > 0) {
    //                         workingMinutesPause = 30;
    //                         // console.log("30 minuten Pause");
    //                     } else if (Math.floor(workingMinutesBrutto / 60) > 6 && Math.floor(workingMinutesBrutto / 60) < 9) {
    //                         workingMinutesPause = 30;
    //                         // console.log("30 minuten Pause");
    //                     } else if (Math.floor(workingMinutesBrutto / 60) === 9 && (((workingMinutesBrutto / 60) - (Math.floor(workingMinutesBrutto / 60))) * 60) > 0) {
    //                         workingMinutesPause = 45;
    //                         // console.log("45 minuten Pause");
    //                     } else if (Math.floor(workingMinutesBrutto / 60) > 9) {
    //                         workingMinutesPause = 45;
    //                         // console.log("45 minuten Pause");
    //                     }

    //                     let defaultWorkingMinutesPerDay: number = 480; //entspricht 8:30 Stunden
    //                     let workingMinutesNetto: number = workingMinutesBrutto - workingMinutesPause;
    //                     let workingMinutesOverTimeNew: number = workingMinutesNetto - defaultWorkingMinutesPerDay;

    //                     firestore.collection(`users/${uid}/worktimes`).doc(dateKey).set({
    //                         "workingMinutesBrutto": workingMinutesBrutto,
    //                         "workingMinutesPause": workingMinutesPause,
    //                         "workingMinutesNetto": workingMinutesNetto,
    //                         "workingMinutesOverTime": workingMinutesOverTimeNew
    //                     }, { merge: true });


    //                     //CALCULATE ADDITION OR SUBTRACTION TO WORKING_HOURS_BUDGET
    //                     firestore.collection(`users`).doc(uid).get().then(doc => {
    //                         if (doc.exists) {
    //                             let worktimeBudget = doc.data().worktimeBudget;
    //                             let newWorktimeBudget: number = 0;
    //                             if (!workingMinutesOverTimeOld) {
    //                                 newWorktimeBudget = worktimeBudget + workingMinutesOverTimeNew;
    //                             } else {
    //                                 let valueChange: number = workingMinutesOverTimeNew - workingMinutesOverTimeOld;
    //                                 console.log("ValueChange: " + valueChange);
    //                                 newWorktimeBudget = worktimeBudget + valueChange;
    //                             }
    //                             firestore.collection(`users`).doc(uid).set({
    //                                 "worktimeBudget": newWorktimeBudget
    //                             }, { merge: true });
    //                         }
    //                     });
    //                 }
    //             }
    //         }
    //     })
    // }
}