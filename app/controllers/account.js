const fetch = require("node-fetch");
const axios = require("axios");
require("dotenv").config();

const {
  Client,
  AccountId,
  PrivateKey,
  EntityIdHelper,
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

const { UtilsArray } = require("../helpers/utils-helpers");

const Account = require("../models/account");

module.exports = {
  index: async (req, res, next) => {
    const accounts = await Account.find({}).sort({
      name: 1,
    });
    try {
      // console.log(accounts)
      res.status(200).json(accounts);
    } catch (error) {
      // console.log(error);
      res.status(500).json(error);
    }
  },
  newAccount: async (req, res, next) => {
    if (!req.body?.solidityAddress || req.body?.solidityAddress == "") {
      req.body.solidityAddress = await convert(req.body?.accountId);
    }
    let account = new Account(req.body);
    try {
      // console.log(account)
      await account.save();

      res.status(200).json(account);
    } catch (error) {
      // console.log(error);
      res.status(500).json(error);
    }
  },
  getOneAccount: async (req, res, next) => {
    const { _id, accountId } = req.params || req.body || req.query;

    const account = await Account.findOne({
      _id: id,
    });

    try {
      // console.log(account)

      res.status(200).json(account);
    } catch (error) {
      // console.log(error);
      res.status(500).json(error);
    }
    res.status(200).json(account);
  },
  updateAccount: async (req, res, next) => {
    const { _id, accountId } = req.params || req.body || req.query;
    // console.log(req.body)

    const newAccount = req.body;
    const result = await Account.findByIdAndUpdate(newAccount._id, newAccount, {
      new: true,
    });

    res.status(200).json({
      message: "account updated",
      account: result,
    });
  },
  deleteAccount: async (req, res, next) => {
    const { _id, accountId } = req.params || req.body || req.query;

    try {
      //   const account = await Account.findByIdAndDelete(accountId);
      const account = await Account.find({ accountId });
      console.log(account);
      if (!account)
        res.status(404).json({
          message: "No account found",
        });
      const result = await Account.findByIdAndDelete(account[0]._id);
      console.log(result);
      return res.status(200).json({
        message: "Account deleted succesfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(404).json(error);
    }
  },
};

function convert(hederaNativeAddress) {
  const { shard, realm, num } = EntityIdHelper.fromString(hederaNativeAddress);
  return EntityIdHelper.toSolidityAddress([shard, realm, num]);
}
