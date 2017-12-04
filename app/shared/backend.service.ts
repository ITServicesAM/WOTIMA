import { FBData, firestore, LoginType, User } from 'nativescript-plugin-firebase';
import { Injectable } from '@angular/core';
import { UtilsService } from './UtilsService';
import firebase = require("nativescript-plugin-firebase");
import DocumentReference = firestore.DocumentReference;

@Injectable()
export class BackendService {

    constructor(private utils: UtilsService) {
    }

    isLoggedIn(): Promise<User> {
        return firebase.getCurrentUser();
    }

    loginWithGoogle(): Promise<User> {
        return firebase.login({
            type: LoginType.GOOGLE
        })
    }

    logout() {
        firebase.logout();
    }

    loadWorkTimes() {
        firebase.getCurrentUser().then((user: User) => {

            firebase.addChildEventListener((data: FBData) => {
                console.log(JSON.stringify(data.value.date));
                let userDoc: DocumentReference = firestore.collection('users').doc(user.uid);
                userDoc.set({email: user.email});
                userDoc.collection('worktimes').doc(data.key).set({
                    date: data.value.date,
                    reverseOrderDate: data.value.reverseOrderDate,
                    workTimeEnd: data.value.workTimeEnd,
                    workTimeStart: data.value.workTimeStart,
                    workingMinutesBrutto: data.value.workingMinutesBrutto,
                    workingMinutesNetto: data.value.workingMinutesNetto,
                    workingMinutesOverTime: data.value.workingMinutesOverTime,
                    workingMinutesPause: data.value.workingMinutesPause
                });
            }, `/workTimes/${user.uid}`);


            // firebase.query((data: FBData) => {
            //     console.log(`WorkTimes: ${JSON.stringify(data.value)}`);
            //     let dataObj = JSON.parse(JSON.stringify(data.value));
            //
            //     dataObj.forEach(value => {
            //        console.log(value);
            //     });
            //
            //     let usersCol: CollectionReference = firestore.collection('users');
            //     let userDoc: DocumentReference = usersCol.doc(user.uid);
            //     let worktimesCol: CollectionReference = userDoc.collection('worktimes');
            //     for (let val in data.value) {
            //         console.log(val);
            //
            //         for (let element of data.value[val]) {
            //
            //             console.log(element['reverseOrderDate']);
            //             // worktimesCol.doc(val).set({
            //             //     date: element['date'],
            //             //     reverseOrderDate: element['reverseOrderDate'],
            //             //     workTimeEnd: element.workTimeEnd,
            //             //     workTimeStart: element.workTimeStart,
            //             //     workingMinutesBrutto: element.workingMinutesBrutto,
            //             //     workingMinutesNetto: element.workingMinutesNetto,
            //             //     workingMinutesOverTime: element.workingMinutesOverTime,
            //             //     workingMinutesPause: element.workingMinutesPause
            //             // });
            //         }
            //     }
            // }, `/workTimes/${user.uid}`, {
            //     singleEvent: true,
            //     orderBy: {
            //         type: firebase.QueryOrderByType.VALUE,
            //         value: 'reverseOrderDate'
            //     }
            // }).catch(err => this.utils.handleError(err));

        }).catch(err => this.utils.handleError(err));
    }
}