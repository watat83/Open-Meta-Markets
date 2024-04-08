// this router deals better with "try{} catch{}" situations"
const routerNFTSerial = require("express-promise-router")();
const routerNFTCollection = require("express-promise-router")();

const AccountController = require("../controllers/account");
const NFTController = require("../controllers/nft");

// /api/nftCollections/
routerNFTCollection
  .route("/")
  // Get All nftCollections
  .get([], NFTController.index)
  .post([], NFTController.newNFTCollection);

// /api/nftCollections/:nftCollectionId
routerNFTCollection
  .route("/:nftCollectionId")
  // Get All nftCollections
  .get([], NFTController.getOneNFTCollection)
  .patch([], NFTController.updateNFTCollection)

  // Delete a nft
  .delete([], NFTController.deleteNFTCollection);

// /api/nftSerials/
routerNFTSerial
  .route("/")
  // Get All nftSerials
  .get([], NFTController.indexSerial)
  .post([], NFTController.newNFTSerial)
  .delete([], NFTController.deleteAllNFTSerials);

// /api/nftSerials/:nftSerialNumber
routerNFTSerial
  .route("/:nftSerialNumber")
  // Get All nftSerial
  .get([], NFTController.getOneNFTBySerial)
  .patch([], NFTController.updateNFTBySerialId)

  // Delete a nft
  .delete([], NFTController.deleteNFTBySerialId);

module.exports = { routerNFTCollection, routerNFTSerial };
