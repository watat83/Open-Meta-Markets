import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef
} from "@angular/core";
import { HttpClient } from "@angular/common/http";

import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
  FormArray
} from "@angular/forms";
import { MessageService } from "src/app/shared/services/message.service";
import { JobService } from "src/app/shared/services/job.service";
import { AccountService } from "src/app/shared/services/account.service";
import { IAccount } from "../../../account/account.component";
import { Globals } from "src/app/utils-helpers";

export interface IJobSmartContract {
  // _id: string;
  title: string;
  description: string;
  solidityAddress: string;
  contractId: string;
  ownerId: any;
}


@Component({
  selector: 'app-job-smart-contract-form',
  templateUrl: './job-smart-contract-form.component.html',
  styleUrls: ['./job-smart-contract-form.component.scss']
})
export class JobSmartContractFormComponent implements OnInit {

  isLoadingResults = true;
  accounts: IAccount[] = [];
  selectedOwner: any;
  jobSmartContractForm: any = this._fb.group({
    _id: [null],
    title: ["", Validators.required],
    ownerId: ["", Validators.required],
    description: [""],
  })

  constructor(
    private _fb: FormBuilder,
    private _jobService: JobService,
    private _accountService: AccountService,
    private _globals: Globals,
    private _messageService: MessageService
  ) {
    this.isLoadingResults = false;
  }

  async ngOnInit() {
    await this.loadAccounts();
  }

  async clearForm() {
    this.jobSmartContractForm.reset();
  };
  async loadAccounts() {
    this.accounts = await this._accountService.getAllAccounts().toPromise();
  }

  async onSubmit(e: Event) {
    await e.preventDefault();
    await e.stopPropagation();

    this.isLoadingResults = true;
    let accountId = await this.accounts.find(
      account => account._id === this.selectedOwner
    )
    this.jobSmartContractForm.patchValue({
      accountId: accountId?.accountId
    })
    // console.log(this.jobSmartContractForm.value);
    try {
      const newSmartContract = await this._jobService.addNewJobSmartContract(this.jobSmartContractForm.value).toPromise();
      // console.log('newSmartContract', newSmartContract);
      await this.clearForm();
      await this._globals.refreshComponent();
      this._messageService.showNotification(
        "NEW Job Contract created successfully",
        "Awesome!"
      );

    } catch (error) {
      this._messageService.showNotification(
        "Something went wrong. Try again later",
        "OK!"
      );
    }

  }

}
