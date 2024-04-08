import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MaterialModule } from "./material.module";
import { HttpClientModule } from "@angular/common/http";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { MainNavComponent } from "./components/main-nav/main-nav.component";
import { LayoutModule } from "@angular/cdk/layout";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from "@angular/material/snack-bar";
import { AccountComponent } from './components/account/account.component';
import { SignupComponent } from './components/signup/signup.component';
import { NftCollectionComponent } from './components/nft-collection/nft-collection.component';
import { NftCollectionFormComponent } from './components/nft-collection-form/nft-collection-form.component';
import { JobSmartContractFormComponent } from './components/job/smart-contract/job-smart-contract-form/job-smart-contract-form.component';
import { JobSmartContractComponent } from './components/job/smart-contract/job-smart-contract/job-smart-contract.component';
import { JobPostFormComponent } from './components/job/job-post/job-post-form/job-post-form.component';
import { JobPostListComponent } from './components/job/job-post/job-post-list/job-post-list.component';
import { JobPostComponent } from './components/job/job-post/job-post/job-post.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    MainNavComponent,
    AccountComponent,
    SignupComponent,
    NftCollectionComponent,
    NftCollectionFormComponent,
    JobSmartContractFormComponent,
    JobSmartContractComponent,
    JobPostFormComponent,
    JobPostListComponent,
    JobPostComponent,
  ],
  imports: [
    FormsModule,
    MaterialModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    LayoutModule,
    ReactiveFormsModule
  ],
  exports: [MaterialModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 2500 } }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
