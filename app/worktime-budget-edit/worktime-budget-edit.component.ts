import { Component, OnDestroy, OnInit } from "@angular/core";
import { Page } from "tns-core-modules/ui/page";
import { ModalDialogParams } from "nativescript-angular";
import { Color } from "tns-core-modules/color";
import { addTabletCss } from "../services/tablet-utils";
import * as utils from 'utils/utils';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BackendService } from "../services/backend.service";
import { Subscription } from "rxjs/Subscription";

const pageCommon = require("tns-core-modules/ui/page/page-common").PageBase;

@Component({
    selector: "worktime-budget-edit",
    moduleId: module.id,
    templateUrl: "./worktime-budget-edit.component.html",
    styleUrls: [
        "./worktime-budget-edit.component.css"
    ]
})
export class WorktimeBudgetEditComponent implements OnInit, OnDestroy {

    worktimeBudget: number;
    worktimeBudgetSub: Subscription;
    editWorktimeBudgetForm: FormGroup;

    constructor(private params: ModalDialogParams,
                private backend: BackendService,
                private fb: FormBuilder,
                private page: Page) {

        this.editWorktimeBudgetForm = this.fb.group({
            "worktimeBudget": ["", [Validators.required]]
        });

        this.page.on("unloaded", () => {
            this.params.closeCallback();
        });
        this.page.backgroundColor = new Color(50, 0, 0, 0);

        if (page.ios) {
            // iOS by default won't let us have a transparent background on a modal
            // Ugly workaround from: https://github.com/NativeScript/nativescript/issues/2086#issuecomment-221956483
            // this.page.backgroundColor = new Color(50, 0, 0, 0);
            (<any>page)._showNativeModalView = function (parent, context, closeCallback, fullscreen) {
                pageCommon.prototype._showNativeModalView.call(this, parent, context, closeCallback, fullscreen);
                let that = this;

                // noinspection JSUnusedGlobalSymbols
                this._modalParent = parent;

                if (fullscreen) {
                    this._ios.modalPresentationStyle = 0;
                } else {
                    this._ios.modalPresentationStyle = 2;
                    this._UIModalPresentationFormSheet = true;
                }

                pageCommon.prototype._raiseShowingModallyEvent.call(this);

                this._ios.providesPresentationContextTransitionStyle = true;
                this._ios.definesPresentationContext = true;
                this._ios.modalPresentationStyle = UIModalPresentationStyle.OverFullScreen;
                this._ios.modalTransitionStyle = UIModalTransitionStyle.CrossDissolve;
                this._ios.view.backgroundColor = UIColor.clearColor;

                parent.ios.presentViewControllerAnimatedCompletion(this._ios, utils.ios.MajorVersion >= 9, function () {
                    that._ios.modalPresentationStyle = UIModalPresentationStyle.CurrentContext;
                    that._raiseShownModallyEvent(parent, context, closeCallback);
                });
            };
        }

        addTabletCss(this.page, "worktime-budget-edit");
    }

    ngOnInit(): void {
        this.worktimeBudgetSub = this.backend.loadWorktimeBudget().subscribe(data => {
            this.worktimeBudget = data;
        });
    }

    ngOnDestroy(): void {
        this.worktimeBudgetSub.unsubscribe();
    }

    onSaveWorktimeBudget() {
        this.backend.saveWorktimeBudget(this.worktimeBudget).then(() => {
            this.params.closeCallback();
        }).catch(err => console.log(JSON.stringify(err)));
    }

    getErrorMsg(){
        
    }
}