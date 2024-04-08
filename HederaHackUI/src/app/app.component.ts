import {
  Component,
  ViewEncapsulation,
  OnInit,
  Inject,
  AfterViewInit,
  AfterViewChecked,
  ɵConsole,
  ElementRef,
  ViewChild,
  PLATFORM_ID,
  APP_ID,
  OnDestroy,
} from "@angular/core";

import { MatToolbar } from "@angular/material/toolbar";
import { Observable, BehaviorSubject } from "rxjs";

// import { AuthService } from './services/auth/auth.service';
import {
  Router,
  NavigationEnd,
  NavigationStart,
  NavigationCancel,
  NavigationError,
  Event,
} from "@angular/router";
// import { FilterPipe } from './pipes';
import { filter } from "rxjs/operators";
// import { SwUpdate } from '@angular/service-worker';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { isPlatformBrowser } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { Globals } from "./utils-helpers";

declare var jQuery: any;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "Hedera Gack";
  activ: any;

  constructor(
    // private authService: AuthService,
    private _global: Globals,
    private router: Router,
    // private updates: SwUpdate,
    public dialog: MatDialog,
    private _httpClient: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(APP_ID) private appId: string
  ) {}

  async ngOnInit() {
    // console.log(this.activ);
    await this._global.refreshComponent();
  }
}
