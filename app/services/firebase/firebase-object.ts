import { Observable } from 'rxjs/Observable';
import firebase = require('nativescript-plugin-firebase');

export class FirebaseObject<T> {
    constructor(private observable: Observable<T>, private path: string) {
    }

    public valueChanges(): Observable<T> {
        return this.observable;
    }

    public set(value: T): Promise<void> {
        return firebase.setValue(this.path, value);
    }

    public update(value: T): Promise<void> {
        return firebase.update(this.path, value);
    }

    public remove(): Promise<void> {
        return firebase.remove(this.path);
    }
}