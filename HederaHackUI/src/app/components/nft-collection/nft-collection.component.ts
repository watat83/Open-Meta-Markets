import { Component, OnInit } from "@angular/core";
import { NftService } from "src/app/shared/services/nft.service";

@Component({
  selector: "app-nft-collection",
  templateUrl: "./nft-collection.component.html",
  styleUrls: ["./nft-collection.component.scss"],
})
export class NftCollectionComponent implements OnInit {
  NFTCollection: any;

  constructor(private _nftService: NftService) {}

  async ngOnInit() {
    this.NFTCollection = await this._nftService.getNFTCollection().toPromise();
    this.NFTCollection.solidityAddress = this.NFTCollection.solidityAddress
      .toString()
      .toUpperCase()
      .match(/.{1,4}/g);
    this.NFTCollection.solidityAddress =
      this.NFTCollection.solidityAddress.join(" ");
    // console.log(this.NFTCollection);
  }
}
