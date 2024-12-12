import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
// import { INFT } from 'src/app/components/signup/signup.component';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  jsonHeader = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json; charset=utf-8'
      // Authorization: 'Bearer ' + this._adminService.getToken()
    })
  };

  formDataHeader = {
    headers: new HttpHeaders({
      Accept: 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'multipart/form-data'
      // Authorization: 'Bearer ' + this._adminService.getToken()
    })
  };

  constructor(private _httpClient: HttpClient) { }

  addNewJobSmartContract(smartContractMetadata: FormData | any): any {
    return this._httpClient.post(
      environment.apiBaseUrl + '/jobSmartContracts', // POST /api/jobSmartContracts
      smartContractMetadata, // smartContractMetadata data,
      this.jsonHeader
    );
  }

  updateOneJobPost(jobId: any, data: FormData | any): any {
    return this._httpClient.patch(
      environment.apiBaseUrl + '/jobs/' + jobId, // PATCH /api/jobs/:id
      data,
      this.jsonHeader
    );
  }

  getJobSmartContract(): any {
    return this._httpClient.get<any>(
      environment.apiBaseUrl + '/jobSmartContracts/',
      this.jsonHeader
    );
  }

  getAllJobPosts(): any {
    return this._httpClient.get<any>(
      environment.apiBaseUrl + '/jobs',
      this.jsonHeader
    );
  }

  addNewJobPostByAccount(data: FormData | any): any {
    return this._httpClient.post(
      environment.apiBaseUrl + '/jobs', // POST /api/jobs
      data, // job data,
      this.jsonHeader
    );
  }


  getAllJobPostsByAccount(ownerId: any): any {
    return this._httpClient.get(
      environment.apiBaseUrl + '/' + ownerId,
      this.jsonHeader
    );
  }

  getOneJobPostByAccount(ownerId: any, jobId: any): any {
    return this._httpClient.get(
      environment.apiBaseUrl + '/job-account/' + ownerId + '/' + jobId,
      this.jsonHeader
    );
  }

  updateJobPostWithCompletedBy(data: any): any {
    return this._httpClient.put(
      environment.apiBaseUrl + '/jobs/',
      data,
      this.jsonHeader
    );
  }
}
