import { Injectable, Component, TemplateRef } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "../../../environments/environment";

import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class SharedDataService {
  jsonHeader = {
    headers: new HttpHeaders({
      "Content-Type": "application/json; charset=utf-8",
      // Authorization: 'Bearer ' + this._adminService.getToken()
    }),
  };
  activities: any[];
  constructor(
    private _httpClient: HttpClient,
    private _snackBar: MatSnackBar,
    private _matDialog: MatDialog
  ) {}
}
