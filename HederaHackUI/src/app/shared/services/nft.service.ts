import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { INFT } from "src/app/components/signup/signup.component";

@Injectable({
  providedIn: "root",
})
export class NftService {
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

  addNewNFTCollection(nftCollectionMetadata: FormData | any): any {
    return this._httpClient.post(
      environment.apiBaseUrl + "/nftCollections", // POST /api/nftCollections
      nftCollectionMetadata, // nftCollectionMetadata data,
      this.jsonHeader
    );
  }

  getNFTCollection(): any {
    return this._httpClient.get<any>(
      environment.apiBaseUrl + "/nftCollections/",
      this.jsonHeader
    );
  }

  getAllNFTs(): any {
    return this._httpClient.get<INFT[] | any[]>(
      environment.apiBaseUrl + "/nftSerials/",
      this.jsonHeader
    );
  }

  getOneNFT(serial: any): any {
    return this._httpClient.get<INFT | any>(
      environment.apiBaseUrl + "/nftSerials/" + serial,
      this.jsonHeader
    );
  }

  updateOneNFT(serial: string, data: any): any {
    return this._httpClient.patch(
      environment.apiBaseUrl + "/nftSerials/" + serial,
      data
      // this.jsonHeader
    );
  }

  addNewNFT(nft: FormData | any): any {
    return this._httpClient.post(
      environment.apiBaseUrl + "/nftSerials", // POST /api/nftSerials
      nft, // nft data,
      this.jsonHeader
    );
  }

  deleteOneNFT(serial: string): any {
    return this._httpClient.delete(
      environment.apiBaseUrl + "/nftSerials/" + serial,
      this.jsonHeader
    );
  }

  updateNFTProfileAfterCompleteJob(serial: string, data: any): any {
    return this._httpClient.patch(
      environment.apiBaseUrl + "/nftSerials/completeJob/" + serial,
      data
    );
  }
}
