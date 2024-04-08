import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { IAccount } from "src/app/components/account/account.component";

@Injectable({
  providedIn: "root",
})
export class AccountService {
  jsonHeader = {
    headers: new HttpHeaders({
      "Content-Type": "application/json; charset=utf-8",
      // Authorization: 'Bearer ' + this._adminService.getToken()
    }),
  };

  formDataHeader = {
    headers: new HttpHeaders({
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "multipart/form-data",
      // Authorization: 'Bearer ' + this._adminService.getToken()
    }),
  };

  constructor(private _httpClient: HttpClient) {}

  getAllAccounts(): any {
    return this._httpClient.get<IAccount[]>(
      environment.apiBaseUrl + "/accounts",
      this.jsonHeader
    );
  }

  getOneAccount(accountId: string): any {
    return this._httpClient.get<IAccount>(
      environment.apiBaseUrl + "/accounts/" + accountId,
      this.jsonHeader
    );
  }

  updateOneAccount(accountId: string, data: any): any {
    return this._httpClient.patch(
      environment.apiBaseUrl + "/accounts/" + accountId,
      data
      // this.jsonHeader
    );
  }

  addNewAccount(account: FormData | any): any {
    return this._httpClient.post(
      environment.apiBaseUrl + "/accounts", // POST /api/accounts
      account // account data,
      // this.jsonHeader
    );
  }

  deleteOneAccount(accountId: string): any {
    return this._httpClient.delete(
      environment.apiBaseUrl + "/accounts/" + accountId,
      this.jsonHeader
    );
  }
}
