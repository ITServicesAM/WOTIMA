import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular";
import { BackendService } from "../services/backend.service";
import { Observable } from "rxjs/Observable";
import { User } from "nativescript-plugin-firebase";

@Component({
    selector: "worktime-profile",
    moduleId: module.id,
    templateUrl: "./worktime-profile.component.html",
    styleUrls: ["./worktime-profile.component.css"]
})
export class WorktimeProfileComponent implements OnInit {

    public user$: Observable<User>;

    constructor(private router: RouterExtensions,
                private backendService: BackendService) {

    }

    ngOnInit() {
        this.user$ = this.backendService.getUser();
    }

    onBackPressed() {
        this.router.backToPreviousPage();
    }
}