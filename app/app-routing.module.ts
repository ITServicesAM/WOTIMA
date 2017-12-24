import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { AuthGuard } from './auth-guard.service';
import { WorktimeDetailComponent } from './worktime-detail/worktime-detail.component';
import { WorktimeNewComponent } from './worktime-new/worktime-new.component';
import { WorktimeProfileComponent } from "./worktime-profile/worktime-profile.component";
import { SignUpComponent } from "./auth/sign-up/sign-up.component";
import { SignInEmailComponent } from "./auth/sign-in-email/sign-in-email.component";

const routes: Routes = [
    {path: "", redirectTo: "/tabs", pathMatch: "full"},
    {path: "tabs", loadChildren: "./tabs/tabs.module#TabsModule", canActivate: [AuthGuard]},
    {path: "worktime-detail/:id", component: WorktimeDetailComponent, canActivate: [AuthGuard]},
    {path: "worktime-new", component: WorktimeNewComponent, canActivate: [AuthGuard]},
    {path: "worktime-profile", component: WorktimeProfileComponent, canActivate: [AuthGuard]},
    {path: "worktime-sign-in", component: SignInComponent},
    {path: "worktime-sign-in-email", component: SignInEmailComponent},
    {path: "worktime-sign-up", component: SignUpComponent}
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule {
}
