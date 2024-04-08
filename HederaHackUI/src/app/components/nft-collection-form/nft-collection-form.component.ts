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
import { MessageService } from "src/app/shared/services/message.service";
import { NftService } from "src/app/shared/services/nft.service";
import { AccountService } from "src/app/shared/services/account.service";
import { IAccount } from "../account/account.component";
import { Globals } from "src/app/utils-helpers";

export interface INFTCollection {
  _id: string;
  name: string;
  symbol: string;
  memo: string;
  // maxSupply: number;
  ownerId: string;
  accountId: string;
}

@Component({
  selector: "app-nft-collection-form",
  templateUrl: "./nft-collection-form.component.html",
  styleUrls: ["./nft-collection-form.component.scss"],
})
export class NftCollectionFormComponent implements OnInit {
  isLoadingResults = true;
  NFTCollection: any;
  accounts: IAccount[] = [];
  selectedOwner: any;
  nftCollectionForm: any = this._fb.group({
    _id: [null],
    name: ["", Validators.required],
    symbol: ["", Validators.required],
    memo: [""],
    // maxSupply: ["", Validators.required],
    ownerId: ["", Validators.required],
    accountId: [""],
  });
  constructor(
    private _fb: FormBuilder,
    private _nftService: NftService,
    private _messageService: MessageService,
    private _accountService: AccountService,
    private _globals: Globals
  ) {
    this.isLoadingResults = false;
  }

  async ngOnInit() {
    await this.loadAccounts();
  }

  async onSubmit(e: Event) {
    await e.preventDefault();
    await e.stopPropagation();

    this.isLoadingResults = true;
    let accountId = await this.accounts.find(
      (account) => account._id === this.selectedOwner
    );
    this.nftCollectionForm.patchValue({
      accountId: accountId?.accountId,
    });
    // console.log(this.nftCollectionForm.value);
    try {
      const newCollection = await this._nftService
        .addNewNFTCollection(this.nftCollectionForm.value)
        .toPromise();
      // console.log('newCollection', newCollection);
      await this.clearForm();
      await this._globals.refreshComponent();
      this._messageService.showNotification(
        "NEW NFT Class added successfully",
        "Awesome!"
      );
    } catch (error) {
      this._messageService.showNotification(
        "Something went wrong. Try again later",
        "OK!"
      );
    }
  }
  async clearForm() {
    this.nftCollectionForm.reset();
  }

  async loadAccounts() {
    this.accounts = await this._accountService.getAllAccounts().toPromise();
  }
}
