import { Component, OnInit } from "@angular/core";
import { isAndroid } from "platform";
import { SelectedIndexChangedEventData, TabView } from "tns-core-modules/ui/tab-view";
import { RouterExtensions } from 'nativescript-angular';
import { BackendService } from '../services/backend.service';
import { Observable } from "rxjs/Observable";
import { User } from "nativescript-plugin-firebase";
import { isIOS } from "platform";
import { UtilsService } from "../services/utils.service";

@Component({
    selector: "TabsComponent",
    moduleId: module.id,
    templateUrl: "./tabs.component.html",
    styleUrls: ["./tabs.component.css"]
})
export class TabsComponent implements OnInit {
    isIOS: boolean = isIOS;
    private _title: string;
    public selectedTabIndex: number = 1;
    public user$: Observable<User>;

    constructor(private router: RouterExtensions,
                private backendService: BackendService,
                private utils: UtilsService) {
        /* ***********************************************************
         * Use the constructor to inject app services that will be needed for
         * the whole tab navigation layout as a whole.
         *************************************************************/
    }

    ngOnInit(): void {
        /* ***********************************************************
         * Use the "ngOnInit" handler to initialize data for the whole tab
         * navigation layout as a whole.
         *************************************************************/
        this.user$ = BackendService.getUser();
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        if (this._title !== value) {
            this._title = value;
        }
    }

    /* ***********************************************************
     * The "getIconSource" function returns the correct tab icon source
     * depending on whether the app is ran on Android or iOS.
     * You can find all resources in /App_Resources/os
     *************************************************************/
    getIconSource(icon: string): string {
        return isAndroid ? "" : "res://tabIcons/" + icon;
    }

    /* ***********************************************************
     * Get the current tab view title and set it as an ActionBar title.
     * Learn more about the onSelectedIndexChanged event here:
     * https://docs.nativescript.org/cookbook/ui/tab-view#using-selectedindexchanged-event-from-xml
     *************************************************************/
    onSelectedIndexChanged(args: SelectedIndexChangedEventData) {
        const tabView = <TabView>args.object;
        const selectedTabViewItem = tabView.items[args.newIndex];

        this.selectedTabIndex = args.newIndex;
        this.title = selectedTabViewItem.title;
    }

    onSignOut() {
        BackendService.signOut().then(() => {
            this.router.navigate(['/worktime-sign-in'], {clearHistory: true});
        });
    }

    onFilter(args) {
        this.utils.subject.next('tap');
    }
}