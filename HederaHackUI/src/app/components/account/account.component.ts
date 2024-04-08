import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from "@angular/core";
import { HttpClient } from "@angular/common/http";

import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
} from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";

import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { merge, Observable, of as observableOf } from "rxjs";
import { catchError, map, startWith, switchMap } from "rxjs/operators";
import { AccountService } from "../../shared/services/account.service";
import { Router } from "@angular/router";
import { MessageService } from "src/app/shared/services/message.service";

export interface IAccount {
  _id: string;
  name: string;
  accountId: string;
  solidityAddress: string;
  pbKey: string;
  pvKey: string;
  created_at: string;
}
@Component({
  selector: "app-account",
  templateUrl: "./account.component.html",
  styleUrls: ["./account.component.scss"],
})
export class AccountComponent implements OnInit, AfterViewInit {
  resultsLength = 0;
  isLoadingResults = true;
  // isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  accounts: IAccount[] = [];
  accountTest: IAccount = {
    name: "Account #1",
    accountId: "0.0.2345",
    solidityAddress: "60987e5bcd7f327d353f537g",
    pbKey: "60987e5bcd7f327d353f537g",
    pvKey: "60987e5bcd7f327d353f537g",
    created_at: "2021-05-10T00:20:24.638Z",
    _id: "60987e5bcd7f327d353f537g",
  };
  accountForm: any = this.fb.group({
    _id: [null],
    name: ["", Validators.required],
    accountId: ["", Validators.required],
    pvKey: ["", Validators.required],
    pbKey: ["", Validators.required],
    solidityAddress: [""],
    created_at: [""],
  });

  // Table
  displayedColumns: string[] = [
    "name",
    "accountId",
    "solidityAddress",
    // 'created_at',
    "actions",
  ];
  dataSource: MatTableDataSource<IAccount>;

  constructor(
    private fb: FormBuilder,
    private _accountService: AccountService,
    private _messageService: MessageService
  ) {
    this.isLoadingResults = true;
    this.refreshTable();
  }

  ngOnInit(): void {}

  onSubmit = async (e: Event) => {
    await e.preventDefault();
    await e.stopPropagation();

    if (this.accountForm.value._id != null) {
      this._accountService
        .updateOneAccount(this.accountForm.value._id, this.accountForm.value)
        .subscribe(
          async (data: any) => {
            this.refreshTable();
            // this.clearFormArray(this.aliases, e);
            await this.accountForm.reset();
            this._messageService.showNotification(
              "Account updated successfully",
              "Fantastic!"
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
    } else {
      this._accountService.addNewAccount(this.accountForm.value).subscribe(
        async (data: any) => {
          // console.log(data);
          this.refreshTable();
          // this.clearFormArray(this.aliases, e);
          await this.accountForm.reset();
          this._messageService.showNotification(
            "Account created successfully",
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

  setUpdateAccount(account: any) {
    // console.log('setUp Account', account);
    this.clearForm();
    this.accountForm.patchValue(account);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearForm = () => {
    this.accountForm.reset();
  };

  ngAfterViewInit() {}

  resetPaging(): void {
    this.paginator.pageIndex = 0;
  }

  refreshTable() {
    this.isLoadingResults = true;
    setTimeout(() => {
      this._accountService.getAllAccounts().subscribe(
        (data: IAccount[] | []) => {
          // console.log(data);
          this.accounts = data;
          this.dataSource = new MatTableDataSource<IAccount>(this.accounts);
          // console.log(data);

          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.isLoadingResults = false;
        },
        (error: any) => {
          // console.log(error);
        }
      );
    }, 3000);
  }

  deleteOneAccount(accountId: string) {
    this._accountService.deleteOneAccount(accountId).subscribe(
      async (data: any) => {
        // console.log(data);

        this.refreshTable();
        this._messageService.showNotification(
          "Account deleted successfully",
          "Alright!"
        );
      },
      (error: any) => {
        // console.log(error);
        this._messageService.showNotification(
          "We could not delete this record. Try again later",
          "Strange!"
        );
      }
    );
  }
}
