import { TNSFancyAlert } from 'nativescript-fancyalert';

export class UtilsService {

    handleError(errMsg: string) {
        // TNSFancyAlert.showAnimationType = TNSFancyAlert.SHOW_ANIMATION_TYPES.SlideInFromBottom;
        // TNSFancyAlert.hideAnimationType = TNSFancyAlert.HIDE_ANIMATION_TYPES.SlideOutToBottom;
        // TNSFancyAlert.backgroundType = TNSFancyAlert.BACKGROUND_TYPES.Blur;

        TNSFancyAlert.showError('Error', `errMsg`, 'ok');
        console.log(`Error occurred with msg: ${errMsg}`);
    }

    showInfoDialog(msg: string) {
        TNSFancyAlert.showInfo('INFO', msg, 'ok');
    }
}