import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { AccountComponent } from "./components/account/account.component";
import { SignupComponent } from "./components/signup/signup.component";
import { JobPostComponent } from "./components/job/job-post/job-post/job-post.component";
import { RouteGuard } from "./guards/route.guard";

const routes: Routes = [
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [RouteGuard]
  },
  {
    path: "accounts",
    component: AccountComponent,
    canActivate: [RouteGuard]
  },
  {
    path: "signup",
    component: SignupComponent,
    canActivate: [RouteGuard]
  },
  {
    path: "jobs",
    component: JobPostComponent,
    canActivate: [RouteGuard]
  },
  { path: "", redirectTo: "dashboard", pathMatch: "full" }
  // { path: "**", redirectTo: "dashboard", pathMatch: "full" }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // enableTracing: true,
      onSameUrlNavigation: "reload",
      useHash: false,
      anchorScrolling: "enabled",
      scrollPositionRestoration: "enabled",
      urlUpdateStrategy: "eager"
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
