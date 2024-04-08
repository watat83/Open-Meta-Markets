import { Injectable, Component, TemplateRef } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from "@angular/material/dialog";

@Injectable({
  providedIn: "root"
})
export class MessageService {
  constructor(private _snackBar: MatSnackBar, private _matDialog: MatDialog) {}

  showNotification(message: string, action: string, config: any = undefined) {
    this._snackBar.open(message, action, config);
  }

  showDialog(
    dialogComponent: any,
    options: { width: string; data: any },
    dialogData: any
  ) {
    let dialogRef = this._matDialog.open(dialogComponent, options);

    dialogRef.afterClosed().subscribe((result: any) => {
      // console.log('The dialog was closed: dialogdata', dialogData);
      dialogData = result;
    });
  }
}
