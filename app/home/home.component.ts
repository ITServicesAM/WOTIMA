import { Component, OnInit } from "@angular/core";
import { BackendService } from '../shared/backend.service';
import { RouterExtensions } from 'nativescript-angular';
import { User } from 'nativescript-plugin-firebase';
import { UtilsService } from '../shared/UtilsService';
import { setTimeout } from 'tns-core-modules/timer';
import { Page } from 'tns-core-modules/ui/page';

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {

    constructor(private page: Page,
                private backendService: BackendService,
                private router: RouterExtensions,
                private utils: UtilsService) {
    }

    ngOnInit() {
        this.page.actionBarHidden = false;
    }

    onSignOut() {
        setTimeout(() => {
            this.backendService.logout();
            this.router.navigate(['/login']);
        }, 300);
    }

    onGetCurrentUser() {
        this.backendService.isLoggedIn().then((user: User) => {
            this.utils.showInfoDialog(`Current user is: ${JSON.stringify(user)}`);

            console.log(`Current user is: ${JSON.stringify(user)}`);
        }).catch(err => {
            this.utils.handleError(err === undefined ? "no current user" : err);
        });
    }


    onGetWorkTimes() {
        this.backendService.loadWorkTimes();
    }
}
