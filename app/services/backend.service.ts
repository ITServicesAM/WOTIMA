import { getString, setString } from "application-settings";
import { LoginType, User } from 'nativescript-plugin-firebase';
import { Injectable, NgZone } from '@angular/core';
import { UtilsService } from './utils.service';
import { Moment } from 'moment';
import { Worktime } from '../models/worktime.interface';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/share';
import firebase = require("nativescript-plugin-firebase");
import moment = require("moment");

const tokenKey = "token";

@Injectable()
export class BackendService {

    static isLoggedIn(): Promise<boolean> {
        return firebase.getCurrentUser().then(user => {
            return user === null ? false : user.emailVerified;
        }).catch(() => {
            return false;
        });
    }

    static getToken(): string {
        return getString(tokenKey);
    }

    static setToken(theToken: string) {
        setString(tokenKey, theToken);
    }

    // worktimes: BehaviorSubject<Array<Worktime>> = new BehaviorSubject([]);
    private _allWorktimes: Array<Worktime> = [];

    constructor(private utils: UtilsService, private ngZone: NgZone) {
    }

    signInWithGoogle(): Promise<void> {
        return firebase.login({
            type: LoginType.GOOGLE
        }).then((user) => {
            return this.createUser(user);
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
            return this.createUser(user);
        }).catch(err => this.utils.handleError(err));
    }

    signUpWithEmailAndPassword(email: string, password: string) {
        return firebase.createUser({
            email,
            password
        }).then(() => {
            return firebase.sendEmailVerification();
        }).catch(err => this.utils.handleError(err));
    }

    signInWithEmail(email: string, password: string) {
        return firebase.login({
            type: LoginType.PASSWORD,
            passwordOptions: {
                email,
                password
            }
        }).then((user) => {
            return this.createUser(user);
        }).catch(err => this.utils.handleError(err));
    }

    logout(): Promise<any> {
        BackendService.setToken("");
        return firebase.logout();
    }

    getUser(): Observable<User> {
        return Observable.fromPromise(firebase.getCurrentUser());
    }

    createUser(user: User): Promise<void> {
        return firebase.update(`users/${BackendService.getToken()}`, {
            "email": user.email
        })
    }

    loadWorktimes(): Observable<any> {
        return new Observable((observer: any) => {
            let path = `workTimes/${BackendService.getToken()}`;
            let onValueEvent = (snapshot: any) => {
                this.ngZone.run(() => {
                    let results = this.handleSnapshot(snapshot.value);
                    // console.log(JSON.stringify(results));
                    observer.next(results);
                });
            };
            firebase.addValueEventListener(onValueEvent, `/${path}`).then(() => {
                this.ngZone.run(() => {
                    // console.log('eventlistener added');
                })
            }).catch(err => {
                this.ngZone.run(() => {
                    this.utils.handleError(err);
                });
            });
        }).share();
    }

    handleSnapshot(data: any) {
        //empty array, then refill and filter
        this._allWorktimes = [];
        if (data) {
            for (let id in data) {
                let result = (Object).assign({id: id}, data[id]);
                this._allWorktimes.push(result);
            }
            this.publishUpdates();
        }
        return this._allWorktimes;
    }

    publishUpdates() {
        this._allWorktimes.sort(function (a, b) {
            if (a.reverseOrderDate < b.reverseOrderDate) return -1;
            if (a.reverseOrderDate > b.reverseOrderDate) return 1;
            return 0;
        })
        // this.worktimes.next([...this._allWorktimes]);
    }

    loadWorktimeBudget(): Observable<any> {
        return new Observable((observer: any) => {
            let path = `overTimeBudgets/${BackendService.getToken()}`;
            let onValueEvent = (snapshot: any) => {
                this.ngZone.run(() => {
                    console.log(`Neues Arbeitszeitkonto: ${JSON.stringify(snapshot)}`);
                    let overTimeBudget;
                    if (snapshot.value) {
                        overTimeBudget = snapshot.value.overTimeBudget;
                    }
                    observer.next(overTimeBudget);
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

    saveWorktime(worktime: Worktime): Promise<any> {
        return firebase.setValue(`workTimes/${BackendService.getToken()}/${worktime.date}`, worktime);
    }

    calculateWorktimeBudget(dateKey: string) {
        firebase.getValue(`workTimes/${BackendService.getToken()}/${dateKey}`).then(result => {
            console.log(JSON.stringify(result));
            let data = result.value;
            if (data) {
                let worktimeStart = data.workTimeStart;
                let worktimeEnd = data.workTimeEnd;
                let workingMinutesOverTimeOld = data.workingMinutesOverTime;
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

                        firebase.update(`workTimes/${BackendService.getToken()}/${dateKey}`, {
                            "workingMinutesBrutto": workingMinutesBrutto,
                            "workingMinutesPause": workingMinutesPause,
                            "workingMinutesNetto": workingMinutesNetto,
                            "workingMinutesOverTime": workingMinutesOverTimeNew
                        });

                        //CALCULATE ADDITION OR SUBTRACTION TO WORKING_HOURS_BUDGET
                        firebase.getValue(`overTimeBudgets/${BackendService.getToken()}`).then(result => {
                            console.log(JSON.stringify(result));
                            let data = result.value;
                            if (data) {
                                let worktimeBudget = data.overTimeBudget;
                                let newWorktimeBudget: number = 0;
                                if (!workingMinutesOverTimeOld) {
                                    newWorktimeBudget = worktimeBudget + workingMinutesOverTimeNew;
                                } else {
                                    let valueChange: number = workingMinutesOverTimeNew - workingMinutesOverTimeOld;
                                    console.log("ValueChange: " + valueChange);
                                    newWorktimeBudget = worktimeBudget + valueChange;
                                }
                                firebase.update(`overTimeBudgets/${BackendService.getToken()}`, {
                                    "overTimeBudget": newWorktimeBudget
                                });
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