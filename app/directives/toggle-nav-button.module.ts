import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { ToggleNavButtonDirective } from "./toggle-nav-button.directive";

@NgModule({
    schemas: [NO_ERRORS_SCHEMA],
    declarations: [ToggleNavButtonDirective],
    exports: [ToggleNavButtonDirective]
})
export class ToggleNavButtonModule {
}