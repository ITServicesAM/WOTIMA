export class FirebaseUser {
    uid: string;
    displayName: string;
    email: string;
    phoneNumber: string;
    photoURL: string;

    isAnonymous: boolean;
    providerData: Provider[];
    emailVerified: boolean;
    refreshToken: string;
};

export class Provider {
    providerId: string;
}

export class FirebaseUserUpdateOptions {
    displayName?: string;
    email?: string;
    photoURL?: string;
}