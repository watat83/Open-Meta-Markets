import { Component, OnInit } from "@angular/core";
import { MessageService } from "src/app/shared/services/message.service";
import { SharedDataService } from "src/app/shared/services/shared-data.service";
import { Globals } from "src/app/utils-helpers";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  constructor(
    private _dataService: SharedDataService,
    private _globals: Globals,
    private _messageService: MessageService
  ) {}

  ngOnInit(): void {}
}
