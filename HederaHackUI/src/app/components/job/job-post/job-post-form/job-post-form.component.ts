import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  ViewEncapsulation
} from "@angular/core";
import { HttpClient } from "@angular/common/http";

import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
  FormArray
} from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";

import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { merge, Observable, of as observableOf } from "rxjs";
import { catchError, map, startWith, switchMap } from "rxjs/operators";
import { AccountService } from "../../../../shared/services/account.service";
import { Router } from "@angular/router";
import { MessageService } from "src/app/shared/services/message.service";
import { IAccount } from "../../../account/account.component";
import { JobService } from "src/app/shared/services/job.service";
import { Globals } from "src/app/utils-helpers";
import { MainNavComponent } from "src/app/components/main-nav/main-nav.component";

@Component({
  selector: 'app-job-post-form',
  templateUrl: './job-post-form.component.html',
  styleUrls: ['./job-post-form.component.scss'],
  providers: [MainNavComponent]
})
export class JobPostFormComponent implements OnInit, AfterViewInit {

  paymentMethods: any = ['CRYPTO', 'CASH', 'BANK', 'CREDIT', 'DEBIT'].sort();
  isLoadingResults = true;
  selectedOwner: string;
  selectedPaymentMethod: string = this.paymentMethods[0];
  owners: IAccount[] = [];

  // "title": "The Second Book of Ethereum",
  //   "description": "This is a description of The Second Book of Ethereum",
  //   "paymentMethod": "CASH",
  //   "ownerId": "62bca17f824b409880d5dd29"


  jobPostForm: any = this._fb.group({
    _id: [null],
    ownerId: ["", Validators.required],
    paymentMethod: ["", Validators.required],
    title: ["", Validators.required],
    description: [""],
    created_at: [""]
  });

  constructor(
    private _fb: FormBuilder,
    private _jobService: JobService,
    private _messageService: MessageService,
    private _accountService: AccountService,
    private _globals: Globals,
    private _router: Router,
    private _mainNav: MainNavComponent
  ) {
    this.isLoadingResults = true;
    // this.refreshTable();

  }

  async ngOnInit() {
    this.owners = await this._accountService.getAllAccounts().toPromise();
    // console.log(this.owners);
  }

  clearForm = () => {
    this.jobPostForm.reset();
  };

  ngAfterViewInit() { }

  onSubmit = async (e: Event) => {
    await e.preventDefault();
    await e.stopPropagation();
    // console.log(this.jobPostForm.value);
    if (this.jobPostForm.value._id != null) {
      this._jobService
        .updateOneJobPost(this.jobPostForm.value._id, this.jobPostForm.value)
        .subscribe(
          async (data: any) => {
            // this.refreshTable();
            // this.clearFormArray(this.aliases, e);
            await this.jobPostForm.reset();
            this._messageService.showNotification(
              "Job Post updated successfully",
              "Fantastic!"
            );
            await this._mainNav.refreshComponent()
          },
          (error: any) => {
            // console.log(error);
            this._messageService.showNotification(
              "Something went wrong. Try again later",
              "OK!"
            );
          }
        );
    } else {
      this._jobService.addNewJobPostByAccount(this.jobPostForm.value).subscribe(
        async (data: any) => {
          // console.log(data);
          // this.refreshTable();
          // this.clearFormArray(this.aliases, e);
          await this.jobPostForm.reset();
          this._messageService.showNotification(
            "Job Post created successfully",
            "Awesome!"
          );
        },
        (error: any) => {
          // console.log(error);
          this._messageService.showNotification(
            "Something went wrong. Try again later",
            "OK!"
          );
        }
      );
    }
  };

}
