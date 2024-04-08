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

@Component({
  selector: 'app-job-post-list',
  templateUrl: './job-post-list.component.html',
  styleUrls: ['./job-post-list.component.scss']
})
export class JobPostListComponent implements OnInit, AfterViewInit {

  resultsLength = 0;
  isLoadingResults = true;
  owners: IAccount[] = [];
  jobPosts: any[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  // Table
  displayedColumns: string[] = [
    "id",
    "title",
    "paymentMethod",
    "accountId",
    // 'created_at',
    // "actions"
  ];
  dataSource: MatTableDataSource<any>;



  constructor(
    private _accountService: AccountService,
    private _jobService: JobService,

  ) {
    this.isLoadingResults = true;
    this.refreshTable();
  }

  ngOnInit(): void {
  }
  ngAfterViewInit(): void { }

  resetPaging(): void {
    this.paginator.pageIndex = 0;
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  refreshTable() {
    this.isLoadingResults = true;
    setTimeout(() => {
      this._jobService.getAllJobPosts().subscribe(
        (data: any[] | []) => {
          // console.log(data);
          this.jobPosts = data;
          this.dataSource = new MatTableDataSource<any>(this.jobPosts);
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

}
