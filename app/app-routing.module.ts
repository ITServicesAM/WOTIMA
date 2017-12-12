import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './auth-guard.service';
import { WorktimeDetailComponent } from './worktime-detail/worktime-detail.component';
import { WorktimeNewComponent } from './worktime-new/worktime-new.component';

const routes: Routes = [
    {path: "", redirectTo: "/tabs", pathMatch: "full"},
    {path: "tabs", loadChildren: "./tabs/tabs.module#TabsModule", canActivate: [AuthGuard]},
    {path: "worktime-detail/:id", component: WorktimeDetailComponent},
    {path: "worktime-new", component: WorktimeNewComponent},
    {path: "login", component: LoginComponent}
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule {
}
