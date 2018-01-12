import { Component } from "@angular/core";
import { ModalDialogParams } from "nativescript-angular";

@Component({
    selector: "worktime-listpicker",
    moduleId: module.id,
    templateUrl: "./listpicker.component.html",
    styleUrls: [
        "./listpicker.component.css"
    ]
})
export class ListPickerComponent {
    items: string[];
    selectedIndex: number;

    constructor(private params: ModalDialogParams) {
        this.items = (<ListPickerParams>this.params.context).items;
        this.selectedIndex = (<ListPickerParams>this.params.context).selectedIndex;
    }
}

export class ListPickerParams {
    items: string[];
    selectedIndex: number;

    constructor(items: string[], selectedIndex: number) {
        this.items = items;
        this.selectedIndex = selectedIndex;
    }
}