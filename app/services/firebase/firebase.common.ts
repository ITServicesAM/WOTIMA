import { FirebaseUser } from './firebase-user.model';
import { FirebaseObject } from './firebase-object';
import { FirebaseList } from './firebase-list';

export interface FirebaseUserServiceCommon {
    signIn(email: string, password: string): Promise<FirebaseUser>;

    register(email: string, password: string): Promise<string>;

    logout(): Promise<any>;

    resetPassword(email: string): Promise<any>;

    updateUserDetails(displayName): Promise<any>;
}

export interface FirebaseDataServiceCommon {
    object<T>(path: string): FirebaseObject<T>;
    list<T>(path: string): FirebaseList<T>;
}