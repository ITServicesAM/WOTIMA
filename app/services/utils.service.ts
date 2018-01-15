import { TNSFancyAlert } from 'nativescript-fancyalert';
import { SnackBar, SnackBarOptions } from "nativescript-snackbar";
import { LoadingIndicator, OptionsCommon } from "nativescript-loading-indicator";
import { Subject } from "rxjs/Subject";

export class UtilsService {

    public subject: Subject<string> = new Subject<string>();
    private snackBar: SnackBar;
    private loading: LoadingIndicator;
    private loadingOptions: OptionsCommon = {
        message: "Bitte warten..."
    };

    constructor(){
        this.snackBar = new SnackBar();
        this.loading = new LoadingIndicator();
    }

    handleError(errMsg: string) {
        // TNSFancyAlert.showAnimationType = TNSFancyAlert.SHOW_ANIMATION_TYPES.SlideInFromBottom;
        // TNSFancyAlert.hideAnimationType = TNSFancyAlert.HIDE_ANIMATION_TYPES.SlideOutToBottom;
        // TNSFancyAlert.backgroundType = TNSFancyAlert.BACKGROUND_TYPES.Blur;

        TNSFancyAlert.showError('Error', `${errMsg}`, 'ok');
        console.log(`Error occurred with msg: ${errMsg}`);
    }

    showInfoDialog(msg: string) {
        TNSFancyAlert.showInfo('INFO', msg, 'ok');
    }

    showSnackBarWithAction(message: string, actionText: string, callback) {
        let options: SnackBarOptions = {
            actionText,
            snackText: message,
            hideDelay: 5000
        };
        this.snackBar.action(options).then(callback);
    }

    showLoading(){
        this.loading.show(this.loadingOptions);
    }

    hideLoading(){
        this.loading.hide();
    }
}