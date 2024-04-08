import { Component, OnInit } from '@angular/core';
import { JobService } from 'src/app/shared/services/job.service';

@Component({
  selector: 'app-job-smart-contract',
  templateUrl: './job-smart-contract.component.html',
  styleUrls: ['./job-smart-contract.component.scss']
})
export class JobSmartContractComponent implements OnInit {
  jobSmartContract: any = null;
  jobPosts: any = [];
  constructor(
    private _jobService: JobService,
  ) { }

  async ngOnInit() {
    this.jobSmartContract = await this._jobService.getJobSmartContract().toPromise();
    this.jobSmartContract = this.jobSmartContract[0]
    this.jobSmartContract.solidityAddress = this.jobSmartContract.solidityAddress.toString().toUpperCase().match(/.{1,4}/g)
    this.jobSmartContract.solidityAddress = this.jobSmartContract.solidityAddress.join(' ')
    // console.log(this.jobSmartContract)

    this.jobPosts = await this._jobService.getAllJobPosts().toPromise();
  }

}
