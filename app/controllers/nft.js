// console.clear();

const fetch = require("node-fetch");
const axios = require("axios");
require("dotenv").config();

const {
  Client,
  AccountId,
  PrivateKey,
  Hbar,
  NftId,
  TokenId,
  TokenCreateTransaction,
  FileCreateTransaction,
  FileAppendTransaction,
  ContractCallQuery,
  ContractCreateTransaction,
  ContractFunctionParameters,
  TokenUpdateTransaction,
  TransferTransaction,
  ContractExecuteTransaction,
  TokenInfoQuery,
  TokenNftInfoQuery,
  TokenMintTransaction,
  TokenBurnTransaction,
  TokenType,
  TokenSupplyType,
  CustomRoyaltyFee,
  CustomFixedFee,
  AccountBalanceQuery,
  AccountUpdateTransaction,
  TokenAssociateTransaction,
} = require("@hashgraph/sdk");
const fs = require("fs");

let CIDs = [];
let NFTs = [];

const data = require("../data/data.json");
const bytecode = require("../contractArtifacts/JobPost.json", "utf8").bytecode;
let bytecodeFileId;
const fileUpload = require("./fileUpload.js");

const { create, CID, urlSource } = require("ipfs-http-client");

const { INFURA_IPFS_PROJECT_ID, INFURA_IPFS_PROJECT_SECRET } = process.env;

const auth =
  "Basic " + btoa(INFURA_IPFS_PROJECT_ID + ":" + INFURA_IPFS_PROJECT_SECRET);

const ipfs_remote = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});
const ipfs_local = create({
  host: "localhost",
  port: 5001,
  protocol: "http",
  headers: {
    authorization: "Bearer " + auth,
  },
});

// Load Accounts Informations
// 1. Operator
const operatorId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
const operatorKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);

// Instantiate multiple clients
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

const supplyKey = PrivateKey.generate();
const adminKey = PrivateKey.generate();
let nftCustomFee;
let tokenId;

const { UtilsArray } = require("../helpers/utils-helpers");

const { NFTCollection, NFTSerial } = require("../models/nft");
const Account = require("../models/account");

module.exports = {
  index: async (req, res, next) => {
    try {
      let nftCollection = await NFTCollection.find({})
        .sort({
          name: 1,
        })
        .populate("ownerId", "_id name accountId");

      if (!nftCollection.length) {
        return res.status(404).json({ message: "No NFT Collection found" });
      }

      nftCollection = nftCollection[0];

      const account = await Account.findById(nftCollection.ownerId);

      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }

      const accountPrivateKey = PrivateKey.fromStringECDSA(account.pvKey);

      const accountClient = Client.forTestnet().setOperator(
        account.accountId,
        accountPrivateKey
      );

      if (!accountClient) {
        return res.status(500).json({ message: "Client.forTestnet().setOperator failed", error: accountClient });
      }

      let _tokenId = nftCollection?.tokenId;
      const nftInfos = await checkTokenInfo(accountClient, _tokenId);

      const finalCollection = {
        _id: nftCollection?._id,
        name: nftCollection?.name,
        symbol: nftCollection?.symbol,
        tokenId: _tokenId,
        solidityAddress: TokenId.fromString(
          nftCollection?.tokenId
        ).toSolidityAddress(),
        memo: nftCollection?.memo,
        totalSupply: nftInfos?.totalSupply?.low,
        maxSupply: nftInfos.maxSupply.low,
        customFee: {
          numerator: nftInfos?.customFees[0]?._numerator.low,
          denominator: nftInfos?.customFees[0]?._denominator.low,
        },
        ownerId: nftCollection?.ownerId,
        accountId: nftCollection?.accountId,
        created_at: nftCollection?.created_at,
      };

      res.status(200).json(finalCollection);
    } catch (error) {
      // console.log(error);
      res.status(500).json(error);
    }
  },
  newNFTCollection: async (req, res, next) => {
    // Structure of the _data
    let _data = {
      name: req.body.name,
      symbol: req.body.symbol,
      memo: req.body.memo,
      // mintingFee: req.body.mintingFee || 0,
      totalSupply: req.body.totalSupply || 0,
      tokenId: null,
      ownerId: req.body.ownerId,
      accountId: AccountId.fromString(req.body.accountId),
    };
    // console.log('_data', _data);

    // Delete all docs related to this collection and serials
    await resetNFTContractAndCollection();

    // Set Testnet Client
    let _client;
    let account = await Account.find({ _id: _data.ownerId }).sort({
      name: 1,
    });
    account = account[0];
    // console.log('account', account);
    if (account) {
      _client = Client.forTestnet().setOperator(
        AccountId.fromString(account?.accountId),
        PrivateKey.fromString(account?.pvKey)
      );
    } else {
      _client = Client.forTestnet().setOperator(operatorId, operatorKey);
    }

    const tokenId = await createNFTCollectionWithCustomFee(
      _client,
      account?.accountId,
      account?.pvKey,
      _data?.name,
      _data?.symbol,
      await customRoyaltyFeeSchedule(),
      _data?.memo
    );
    _data.tokenId = tokenId;
    // console.log('tokenId', tokenId);

    // Save the new NFT Collection to the _database
    const nftCollection = new NFTCollection(_data);
    try {
      // console.log(nftCollection)
      await nftCollection.save();

      res.status(200).json(nftCollection);
    } catch (error) {
      // console.log(error);
      res.status(500).json(error);
    }
  },
  getOneNFTCollection: async (req, res, next) => {
    const nftCollectionId =
      req.params.nftCollectionId ||
      req.body.nftCollectionId ||
      req.query.nftCollectionId;

    try {
      const nft = await NFTCollection.findOne({
        tokenId: nftCollectionId,
      });

      const _tokenId = nft.tokenId;

      // const nftInfos = await new TokenInfoQuery()
      //     .setTokenId(TokenId.fromString(_tokenId))
      //     .execute(client);
      // console.log(nftInfos);
      const nftInfos = await checkTokenInfo(client, _tokenId);

      const finalCollection = {
        _id: nft._id,
        name: nft.name,
        symbol: nft.symbol,
        tokenId: _tokenId,
        memo: nft.memo,
        totalSupply: nftInfos.totalSupply.low,
        maxSupply: nftInfos.maxSupply.low,
        customFee: {
          numerator: nftInfos.customFees[0]._numerator.low,
          denominator: nftInfos.customFees[0]._denominator.low,
        },
        ownerId: nft.ownerId,
        accountId: nft.accountId,
        created_at: nft.created_at,
      };

      res.status(200).json(finalCollection);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
    res.status(200).json(nft);
  },
  updateNFTCollection: async (req, res, next) => {
    const nftCollectionId =
      req.params.nftCollectionId ||
      req.body.nftCollectionId ||
      req.query.nftCollectionId;

    const newNFTCollection = req.body;
    const result = await NFTCollection.findByIdAndUpdate(
      nftCollectionId,
      newNFTCollection,
      {
        new: true,
      }
    );

    res.status(200).json({
      message: "nft Collection updated",
      nft: result,
    });
  },
  deleteNFTCollection: async (req, res, next) => {
    const nftCollectionId =
      req.params.nftCollectionId ||
      req.body.nftCollectionId ||
      req.query.nftCollectionId;

    try {
      const nft = await NFTCollection.findByIdAndDelete(nftCollectionId);

      if (!nft)
        res.status(404).json({
          message: "No nft found",
        });
      res.status(200).json({
        message: "NFTCollection deleted succesfully",
      });
    } catch (error) {
      res.status(404).json(error);
    }
  },
  indexSerial: async (req, res, next) => {
    const nfts = await NFTSerial.find({})
      .sort({
        serial: 1,
      })
      .populate("ownerId");

    let finalNFTs = [];
    try {
      for (let i = 0; i < nfts.length; i++) {
        const nft = nfts[i];
        // console.log(nft.ipfsHash);
        const hash = nft.ipfsHash;
        let metadata = await axios.get(
          "https://ipfs.io/ipfs/" + hash,
          {
            headers: {
              'Accept': 'application/json, text/plain, */*',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            }
          }
        );
        // console.log(metadata.data);
        metadata = metadata.data;

        const finalNFT = {
          _id: nft?._id,
          serial: nft?.serial,
          tokenId: nft?.tokenId,
          ownerId: nft?.ownerId,
          ipfsHash: hash,
          metadata: metadata,
          created_at: nft?.created_at,
        };
        finalNFTs.push(finalNFT);
      }
      // console.log(finalNFTs);
      res.status(200).json(finalNFTs);
    } catch (error) {
      // console.log(error);
      res.status(500).json(error);
    }
  },
  newNFTSerial: async (req, res, next) => {
    try {
      // Structure of the _data
      const fetchImage = await axios.get(
        "https://randomuser.me/api/?gender=" + (req.body?.gender).toLowerCase(),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      let finalImage = fetchImage.data;
      // let finalImage = { image_url: "https://100k-faces.glitch.me/random-image" };
      // console.log(finalImage);
      finalImage = finalImage.results[0].picture.large;
      let _metadata = {
        name: req.body?.name,
        // description: req.body?.description || null,
        image: finalImage,
        properties: {
          dob: req.body?.dob,
          email: req.body?.email,
          gender: req.body?.gender || null,
        },
      };
      // console.log(_metadata)
      let _data = {
        // serial: req.body.serial || null,
        // ipfsHash: req.body.ipfsHash || null,
        // tokenId: req.body.tokenId,
        ownerId: req.body.ownerId,
      };
      const _network = req.body.network || "ipfs_local";
      // console.log('_data', _data);

      // Fetch NFT Collection
      const _nftCollection = await NFTCollection.find({})
        .sort({
          name: 1,
        })
        .populate("ownerId");
      // console.log("_nftCollection", _nftCollection[0]);

      // Set Testnet Client
      let _client;
      let _clientPvKey;
      let account = await Account.find({
        _id: _nftCollection[0].ownerId._id,
      }).sort({
        name: 1,
      });
      account = account[0];

      if (account) {
        _client = Client.forTestnet().setOperator(
          AccountId.fromString(account?.accountId),
          PrivateKey.fromString(account?.pvKey)
        );
        _clientPvKey = PrivateKey.fromString(account?.pvKey);
      } else {
        _client = Client.forTestnet().setOperator(operatorId, operatorKey);
        _clientPvKey = operatorKey;
      }

      let _result;
      const _CID = await createCID(_data, _network);
      // console.log(_CID);

      _result = await tokenMinterFnc(
        _client,
        _nftCollection[0]?.tokenId,
        _metadata,
        _network
      );
      // console.log(_result?.serial, _result?.hash)

      _data.ipfsHash = _result?.hash;
      _data.serial = _result?.serial;
      _data.tokenId = _nftCollection[0]?.tokenId;

      const nftSerial = await new NFTSerial(_data);
      // console.log(nftSerial)
      await nftSerial.save();

      return res.status(200).json(nftSerial);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  getOneNFTBySerial: async (req, res, next) => {
    const nftSerialNumber =
      req.params.nftSerialNumber ||
      req.body.nftSerialNumber ||
      req.query.nftSerialNumber;

    let nftSerial = await NFTSerial.findOne({
      serial: nftSerialNumber,
    });

    if (!nftSerial) {
      return res
        .status(400)
        .json({ message: "No nft found with serial #" + nftSerialNumber });
    }
    // const nftSerial = await NFTSerial.findOne({
    //     '_id': nftSerialNumber,
    // })

    // Set Testnet Client
    let _client;
    let account = await Account.find({ _id: nftSerial.ownerId }).sort({
      name: 1,
    });
    account = account[0];
    // console.log('account', account);
    // console.log('nftSerial', nftSerial);
    if (account) {
      _client = Client.forTestnet().setOperator(
        AccountId.fromString(account?.accountId),
        PrivateKey.fromString(account?.pvKey)
      );
    } else {
      _client = Client.forTestnet().setOperator(operatorId, operatorKey);
    }

    try {
      const metadata = await getNFTMetadataBySerial(
        _client,
        nftSerial?.tokenId,
        nftSerial?.serial,
        "ipfs_remote"
      );
      const finalMeta = {
        serial: nftSerial?.serial,
        ipfsHash: nftSerial?.ipfsHash,
        tokenId: nftSerial?.tokenId,
        ownerId: nftSerial?.ownerId,
        metadata,
      };
      return res.status(200).json(finalMeta);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
    res.status(200).json(nft);
  },
  updateNFTBySerialId: async (req, res, next) => {
    const nftSerialId =
      req.params.nftSerialId || req.body.nftSerialId || req.query.nftSerialId;

    // console.log(req.body)

    const newNFTSerial = req.body;
    const result = await NFTSerial.findByIdAndUpdate(
      nftSerialId,
      newNFTSerial,
      {
        new: true,
      }
    );

    res.status(200).json({
      message: "nft Serial updated",
      nftSerial: result,
    });
  },
  deleteNFTBySerialId: async (req, res, next) => {
    const nftSerialId =
      req.params.nftSerialId || req.body.nftSerialId || req.query.nftSerialId;

    try {
      const nftSerial = await NFTSerial.findByIdAndDelete(nftSerialId);

      if (!nftSerial)
        res.status(404).json({
          message: "No nftSerial found",
        });
      res.status(200).json({
        message: "NFTSerial deleted succesfully",
      });
    } catch (error) {
      res.status(404).json(error);
    }
  },
  deleteAllNFTSerials: async (req, res, next) => {
    try {
      const nftSerials = await NFTSerial.deleteMany({});

      if (!nftSerials)
        res.status(404).json({
          message: "No nftSerials found",
        });
      res.status(200).json({
        message: "NFTSerials deleted succesfully",
      });
    } catch (error) {
      res.status(404).json(error);
    }
  },
  updateNftProfileAfterCompleteJob: async (req, res, next) => {
    try {
      const nftSerialId = req.params.nftSerialId || req.body.nftSerialId || req.query.nftSerialId;
      const newMetadata = req.body;
      const _network = req.body.network || "ipfs_remote";

      const existentNftSerial = await NFTSerial.findOne({
        serial: nftSerialId
      });

      if (!existentNftSerial) {
        return res.status(404).json({
          message: `No NFT found with the serial: ${nftSerialId}`
        });
      }

      let _client;
      let account = await Account.find({ _id: existentNftSerial.ownerId }).sort({
        name: 1,
      });
      account = account[0];

      if (account) {
        _client = Client.forTestnet().setOperator(
          AccountId.fromString(account?.accountId),
          PrivateKey.fromString(account?.pvKey)
        );
      } else {
        _client = Client.forTestnet().setOperator(operatorId, operatorKey);
      }

      const existingMetadata = await getNFTMetadataBySerial(
        _client,
        existentNftSerial?.tokenId,
        existentNftSerial?.serial,
        "ipfs_remote"
      );

      const updatedMetadata = {
        ...existingMetadata,
        ...newMetadata,
      };

      await updateNFTProfileMetadata(
        existentNftSerial?.tokenId,
        _client,
        updatedMetadata,
        _network,
      );

      // const nftSerial = {
      //   serial: existentNftSerial?.serial,
      //   ipfsHash: existentNftSerial?.ipfsHash,
      //   tokenId: existentNftSerial?.tokenId,
      //   ownerId: existentNftSerial?.ownerId,
      //   metadata,
      // };

      return res.status(200).json({
        message: "NFT Serial updated"
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
};

async function resetNFTContractAndCollection() {
  await NFTCollection.deleteMany({});
  await NFTSerial.deleteMany({});
}
async function createContractBytecodeFileId(_client) {
  const fileCreateTx = await new FileCreateTransaction()
    .setKeys([operatorKey])
    .freezeWith(_client);
  const fileCreateSign = await fileCreateTx.sign(operatorKey);
  const fileCreateSubmit = await fileCreateSign.execute(_client);
  const fileCreateRx = await fileCreateSubmit.getReceipt(_client);
  bytecodeFileId = fileCreateRx.fileId;
  console.log(`- The smart contract bytecode file ID is ${bytecodeFileId}`);
  console.log(
    "👉 " + " https://testnet.dragonglass.me/hedera/contracts/" + bytecodeFileId
  );
  return bytecodeFileId;
}
async function uploadBytecode(_client) {
  const fileAppendTx = await new FileAppendTransaction()
    .setFileId(bytecodeFileId)
    .setContents(bytecode)
    .setMaxChunks(10)
    .freezeWith(_client);
  const fileAppendSign = await fileAppendTx.sign(operatorKey);
  const fileAppendSubmit = await fileAppendSign.execute(_client);
  const fileAppendRx = await fileAppendSubmit.getReceipt(_client);
  console.log(`- Content added: ${fileAppendRx.status} \n`);
}

async function instantiateContract(_client) {
  const contractInstantiateTx = new ContractCreateTransaction()
    .setBytecodeFileId(bytecodeFileId)
    .setGas(3000000);
  // .setConstructorParameters(
  //   new ContractFunctionParameters()
  // );
  const contractInstantiateSubmit = await contractInstantiateTx.execute(
    _client
  );
  const contractInstantiateRx = await contractInstantiateSubmit.getReceipt(
    _client
  );
  const contractId = contractInstantiateRx.contractId;
  const contractAddress = contractId.toSolidityAddress();
  console.log(`- The smart contract ID is: ${contractId}`);
  console.log(
    `- The smart contract ID in Solidity format is: ${contractAddress} \n`
  );
  console.log(
    "👉 " + " https://testnet.dragonglass.me/hedera/contracts/" + contractId
  );
}
async function createCID(_data, _network) {
  // console.log('_data_data_data_data_data', _data);
  const cid = await fileUpload.addMetadataToIPFS(_data, _network);
  // console.log("cidcidcidcdididid", cid);
  return cid;
}
async function createCIDs(_data, _network) {
  let _CIDs = [];
  // console.log(_data)
  for (let i = 0; i < _data.length; i++) {
    _CIDs.push(await fileUpload.addMetadataToIPFS(_data[i], _network));
  }
  // console.log("\n")
  // console.log("LIST OF CIDs USED TO GENERATE NFTs FROM ======================== \n")
  // console.log(_CIDs)
  CIDs = _CIDs;
  return _CIDs;
}
async function customRoyaltyFeeSchedule(numerator = 5, denominator = 10) {
  return await new CustomRoyaltyFee()
    .setNumerator(5)
    .setDenominator(10)
    .setFeeCollectorAccountId(operatorId)
    .setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(200)));
}

async function createNFTCollectionWithCustomFee(
  _client,
  _accountId,
  _clientPvKey,
  _tokenName,
  _tokenSymbol,
  _mintingFee,
  _tokenMemo = _tokenName + " Memo!"
) {
  let nftCreate = await new TokenCreateTransaction()
    .setTokenName(_tokenName)
    .setTokenSymbol(_tokenSymbol)
    .setTokenMemo(_tokenMemo)
    .setMaxTransactionFee(new Hbar(200))
    .setTokenType(TokenType.NonFungibleUnique)
    .setDecimals(0)
    .setInitialSupply(0)
    .setMaxSupply(0)
    .setTreasuryAccountId(AccountId.fromString(_accountId))
    .setSupplyType(TokenSupplyType.Infinite)
    .setCustomFees([_mintingFee])
    .setAdminKey(adminKey)
    .setSupplyKey(supplyKey)
    .freezeWith(_client)
    .sign(PrivateKey.fromString(_clientPvKey));

  let nftCreateSign = await nftCreate.sign(adminKey);
  let nftCreateSubmit = await nftCreateSign.execute(_client);
  let nftCreateRx = await nftCreateSubmit.getReceipt(_client);
  const tokenId = nftCreateRx.tokenId;
  console.log(`Created NFT With Token ID: ${tokenId} \n`);
  console.log(
    `Created NFT With Token Contract Solidity format: ${tokenId.toSolidityAddress()} \n`
  );
  return tokenId;
}

async function updateNFTProfileMetadata(
  _tokenId,
  _client,
  _updatedMetadata,
  _network,
) {
  const _CID = await createCID(_updatedMetadata, _network);

  const transaction = await new TokenUpdateTransaction()
    .setTokenId(_tokenId)
    .setMetadata([await Buffer.from(_CID)])
    .freezeWith(_client);
  
  const signTx = await transaction.sign(operatorKey);
  const response = await signTx.execute(_client);
  const receipt = await response.getReceipt(_client);

  console.log(
    `Token metadata update status: ${receipt.status}`,
  );
}

async function checkTokenInfo(_client, _tokenId) {
  // RoyaltiesInfo, TotalSupply, and More
  const tokenInfo = await new TokenInfoQuery()
    .setTokenId(_tokenId)
    .execute(_client);
  // console.table(tokenInfo.customFees[0]);
  // console.log(tokenInfo)
  return tokenInfo;
}

async function tokenMinterFnc(_client, _tokenId, _data, _network) {
  const _CID = await createCID(_data, _network);
  console.log("CID", _CID);
  if (typeof _CID !== "string") {
    throw new Error(`Expected CID to be a string, got: ${_CID}`);
  }
  // _CID = _CID.toString()
  let serial;
  let mintTx = await new TokenMintTransaction()
    .setTokenId(_tokenId)
    .setMaxTransactionFee(new Hbar(20))
    .setMetadata([await Buffer.from(_CID)])
    .freezeWith(_client);

  let mintTxSign = await mintTx.sign(supplyKey);
  let mintTxSubmit = await mintTxSign.execute(_client);
  let mintRx = await mintTxSubmit.getReceipt(_client);
  console.log("\n\n--mintRx", mintRx);
  return { serial: await mintRx.serials[0].low, hash: _CID };
}

async function mintNFTsInBatch(_client, _tokenId, _CIDs, _network) {
  console.log(
    "\nMinting New NFT Accounts for NFT Class " +
      _tokenId +
      " ================== \n"
  );
  for (let i = 0; i < _CIDs.length; i++) {
    NFTs[i] = await tokenMinterFnc(_client, _tokenId, _CIDs[i], _network);
    console.log(
      `Minted New NFT Profile with serial: ${NFTs[i].serials[0].low}`
    );
  }
}

async function burnNFTFromCollection(_client, _tokenId, _CIDs) {
  let tokenBurnTx = await new TokenBurnTransaction()
    .setTokenId(_tokenId)
    .setSerials([_CIDs.length])
    .freezeWith(_client)
    .sign(supplyKey);

  let tokenBurnSubmit = await tokenBurnTx.execute(_client);
  let tokenBurnRx = await tokenBurnSubmit.getReceipt(_client);
  console.log(
    `\nBurnt NFT with Serial: ${_CIDs.length}: ${tokenBurnRx.status} \n`
  );

  let tokenInfo = await checkTokenInfo(_client, _tokenId);
  console.log(`\nCurrent NFT Supply is: ${tokenInfo.totalSupply} \n`);
}

async function autoAssociateAccountToNFT(_client, _accountId, _accountKey) {
  let associateTx = await new AccountUpdateTransaction()
    .setAccountId(_accountId)
    .setMaxAutomaticTokenAssociations(100) // Up to 1000
    .freezeWith(_client)
    .sign(_accountKey);

  let associateTxSubmit = await associateTx.execute(_client);
  let associateRx = await associateTxSubmit.getReceipt(_client);
  console.log(`\n${_accountId} NFT Auto-association: ${associateRx.status} \n`);
}

async function manualAssociateAccountToNFT(
  _client,
  _tokenId,
  _accountId,
  _accountKey
) {
  let associateTx = await new TokenAssociateTransaction()
    .setAccountId(_accountId)
    .setTokenIds([_tokenId])
    .freezeWith(_client)
    .sign(_accountKey);

  let associateTxSubmit = await associateTx.execute(_client);
  let associateRx = await associateTxSubmit.getReceipt(_client);
  console.log(
    `\nAccount ${_accountId} NFT Manual-association status: ${associateRx.status} \n`
  );
}

async function checkAccountBalance(_client, _tokenId, _accountId) {
  balanceCheckTx = await new AccountBalanceQuery()
    .setAccountId(_accountId)
    .execute(_client);
  console.log(
    `\nUser "${_accountId}" Balance: ${balanceCheckTx.tokens._map.get(
      _tokenId.toString()
    )} NFTs and ${balanceCheckTx.hbars}bars \n`
  );
  return [
    balanceCheckTx.tokens._map.get(_tokenId.toString()),
    balanceCheckTx.hbars,
  ];
}

async function transferNFT(
  _client,
  _tokenId,
  _fromAccountId,
  _fromAccountKey,
  _toAccountId,
  _nftSerial
) {
  let tokenTransferTx = await new TransferTransaction()
    .addNftTransfer(_tokenId, _nftSerial, _fromAccountId, _toAccountId)
    .freezeWith(_client)
    .sign(_fromAccountKey);

  let tokenTransferSubmit = await tokenTransferTx.execute(_client);
  let tokenTransferRx = await tokenTransferSubmit.getReceipt(_client);
  console.log(
    `\nNFT Transfer ${_fromAccountId} -> ${_toAccountId} status: ${tokenTransferRx.status} \n`
  );
}

async function buyNFT(
  _client,
  _tokenId,
  _sellerAccountId,
  _sellerAccountKey,
  _buyerAccountId,
  _buyerAccountKey,
  _nftSerial,
  _amount
) {
  let tokenTransferTx = await new TransferTransaction()
    .addNftTransfer(_tokenId, _nftSerial, _sellerAccountId, _buyerAccountId)
    .addHbarTransfer(_sellerAccountId, _amount)
    .addHbarTransfer(_buyerAccountId, -_amount)
    .freezeWith(_client)
    .sign(_sellerAccountKey);

  let tokenTransferSign = await tokenTransferTx.sign(_buyerAccountKey);
  let tokenTransferSubmit = await tokenTransferSign.execute(_client);
  let tokenTransferRx = await tokenTransferSubmit.getReceipt(_client);
  console.log(
    `\nAccount ${_sellerAccountId} -> ${_buyerAccountId} status: ${tokenTransferRx.status} \n`
  );
}

async function getNFTMetadataBySerial(_client, _tokenId, _serial, _network) {
  let nftSerialMetadata = await new TokenNftInfoQuery()
    .setNftId(new NftId(TokenId.fromString(_tokenId), Number(_serial)))
    .execute(_client);
  let ipfsHash = await nftSerialMetadata[0].metadata;
  // console.log('NFT Metadata:', await ipfsHash.toString());
  ipfsHash = await ipfsHash.toString();
  let _finalMetadata;
  if (_network == "ipfs_local") {
    const _promise = await fetch("https://ipfs.filebase.io/ipfs/" + ipfsHash);
    _finalMetadata = await _promise.json();
    console.log("_finalMetadataLocal", _finalMetadata);
    return _finalMetadata;
  } else if (_network == "ipfs_remote") {
    const _promise = await fetch(
      "https://ipfs.io/ipfs/" + ipfsHash
    );
    _finalMetadata = await _promise.json();
    // console.log('_finalMetadataRemote', _finalMetadata);
    return _finalMetadata;
  }
}

async function main() {
  let tokenId;
  // await createContractBytecodeFileId(client);
  // await uploadBytecode(client);
  // await instantiateContract(client);
  // await createCIDs(data, "ipfs_local");
  // await createCID(data[0], "ipfs_local");
  // await customRoyaltyFeeSchedule();
  tokenId = await createNFTCollectionWithCustomFee(
    client,
    String(operatorId),
    String(operatorKey),
    "Tom And Jerry",
    "TJ22",
    await customRoyaltyFeeSchedule()
  );
  await checkTokenInfo(client, tokenId);
  // await mintNFTsInBatch(client, tokenId, CIDs);
  const res = await tokenMinterFnc(
    monkey_business_client,
    tokenId,
    data[0],
    "ipfs_local"
  );
  console.log("res", res);
  // await burnNFTFromCollection(client, tokenId, CIDs);
  // await autoAssociateAccountToNFT(client, operatorId, operatorKey);
  // await autoAssociateAccountToNFT(client, monkey_businessId, monkey_businessKey);
  // await autoAssociateAccountToNFT(client, operatorId, reportedKey);
  await manualAssociateAccountToNFT(client, tokenId, operatorId, operatorKey);
  await manualAssociateAccountToNFT(client, tokenId, operatorId, reportedKey);
  await checkAccountBalance(client, tokenId, operatorId);
  await transferNFT(client, tokenId, operatorId, operatorKey, operatorId, 1);
  const NFTSerialInfo = await getNFTMetadataBySerial(
    client,
    tokenId,
    1,
    "ipfs_local"
  );
  console.log("NFTSerialInfo", NFTSerialInfo);
  await checkAccountBalance(client, tokenId, operatorId);
  await buyNFT(
    client,
    tokenId,
    operatorId,
    operatorKey,
    operatorId,
    reportedKey,
    1,
    100
  );
  await checkAccountBalance(client, tokenId, operatorId);
  const res2 = await tokenMinterFnc(client, tokenId, data[1], "ipfs_local");
  await transferNFT(client, tokenId, operatorId, operatorKey, operatorId, 2);
  await checkAccountBalance(client, tokenId, operatorId);
  await checkAccountBalance(client, tokenId, operatorId);
}

// main();
