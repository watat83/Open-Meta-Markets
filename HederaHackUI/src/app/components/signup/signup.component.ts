import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  ViewEncapsulation,
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
import { IAccount } from "../account/account.component";
import { NftService } from "src/app/shared/services/nft.service";

export interface INFTForm {
  _id: string;
  network: string;
  name: string;
  // description: string;
  dob: string;
  email: string;
  gender: string;
  ownerId: any;
  ipfsHash: string;
}

export interface INFT {
  _id: string;
  serial: string;
  ipfsHash: string;
  tokenId: string;
  ownerId: any;
  metadata: any;
}

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class SignupComponent implements OnInit, AfterViewInit {
  genders: any = [
    {
      title: "Male",
    },
    {
      title: "Female",
    },
  ];
  networks: any = [
    {
      title: "REMOTE IPFS",
      value: "ipfs_remote",
    },
    {
      title: " LOCAL IPFS",
      value: "ipfs_local",
    },
  ];
  maxDate: Date = new Date();
  resultsLength = 0;
  isLoadingResults = true;
  selectedOwner: string;
  selectedGender: string = this.genders[0].title;
  selectedNetwork: string = this.networks[0].value;
  owners: IAccount[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  NFTs: INFT[] = [];

  accountTest: IAccount = {
    name: "Account #1",
    accountId: "0.0.2345",
    solidityAddress: "60987e5bcd7f327d353f537g",
    pbKey: "60987e5bcd7f327d353f537g",
    pvKey: "60987e5bcd7f327d353f537g",
    created_at: "2021-05-10T00:20:24.638Z",
    _id: "60987e5bcd7f327d353f537g",
  };
  signupForm: any = this.fb.group({
    _id: [null],
    network: [""],
    ownerId: ["", Validators.required],
    name: ["", Validators.required],
    // description: [""],
    dob: ["null", Validators.required],
    email: ["", Validators.required],
    gender: [""],
    created_at: [""],
  });

  // Table
  displayedColumns: string[] = [
    "serial",
    "image",
    "name",
    "email",
    "dob",
    // "accountId",
    "ipfsHash",
    // 'created_at',
    // "actions"
  ];
  dataSource: MatTableDataSource<INFT>;

  constructor(
    private fb: FormBuilder,
    private _accountService: AccountService,
    private _nftService: NftService,
    private _messageService: MessageService
  ) {
    this.isLoadingResults = true;
    this.refreshTable();
  }

  async ngOnInit() {
    this.owners = await this._accountService.getAllAccounts().toPromise();
    // console.log(this.owners);
    this.NFTs = await this._nftService.getAllNFTs().toPromise();
    console.log(this.NFTs);

    for (let i = 0; i < this.NFTs.length; i++) {
      const element = this.NFTs[i];
      let metadata = await fetch(
        "https://cloudflare-ipfs.com/ipfs/" + this.NFTs[i].ipfsHash
      );
      console.log("metadata", await metadata.json());
    }
  }
  onSubmit = async (e: Event) => {
    await e.preventDefault();
    await e.stopPropagation();
    // console.log(this.signupForm.value);
    if (this.signupForm.value._id !== null) {
      // console.log("not null", this.signupForm.value);
      this._nftService
        .updateOneNFT(this.signupForm.value._id, this.signupForm.value)
        .subscribe(
          async (data: any) => {
            this.refreshTable();
            // this.clearFormArray(this.aliases, e);
            // await this.signupForm.reset();
            await this.signupForm.patchValue({
              _id: null,
              network: this.networks[0].value,
              ownerId: null,
              name: null,
              // description: null,
              dob: null,
              email: null,
              gender: null,
            });
            this._messageService.showNotification(
              "NFT updated successfully",
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
      this._nftService.addNewNFT(this.signupForm.value).subscribe(
        async (data: any) => {
          // console.log("data", data);
          this.refreshTable();
          // this.clearFormArray(this.aliases, e);
          // await this.signupForm.reset();
          await this.signupForm.patchValue({
            _id: null,
            network: this.networks[0].value,
            ownerId: null,
            name: null,
            // description: null,
            dob: null,
            email: null,
            gender: null,
          });
          this._messageService.showNotification(
            "NFT created successfully",
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

  setUpdateNFT(account: any) {
    // console.log('setUp NFT', account);
    this.clearForm();
    this.signupForm.patchValue(account);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearForm = () => {
    this.signupForm.reset();
  };

  ngAfterViewInit() {}

  resetPaging(): void {
    this.paginator.pageIndex = 0;
  }

  refreshTable() {
    this.isLoadingResults = true;
    setTimeout(() => {
      this._nftService.getAllNFTs().subscribe(
        (data: any) => {
          console.log(data);
          this.NFTs = data;
          this.dataSource = new MatTableDataSource<INFT>(this.NFTs);
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

  deleteOneNFT(accountId: string) {
    this._nftService.deleteOneNFT(accountId).subscribe(
      async (data: any) => {
        // console.log(data);

        this.refreshTable();
        this._messageService.showNotification(
          "NFT deleted successfully",
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
