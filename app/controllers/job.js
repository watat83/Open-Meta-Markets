// console.clear();

require("dotenv").config();

const {
  Client,
  AccountId,
  PrivateKey,
  ContractId,
  Hbar,
  FileCreateTransaction,
  FileAppendTransaction,
  ContractCallQuery,
  ContractCreateTransaction,
  ContractFunctionParameters,
  ContractExecuteTransaction,
  AccountBalanceQuery,
} = require("@hashgraph/sdk");
const fs = require("fs");

const Web3 = require("web3");
// import Web3 from "web3";
const web3 = new Web3(
  Web3.givenProvider ||
    "https://pool.arkhia.io/hedera/testnet/json-rpc/v1/" +
      process.env.ARKHIA_API_KEY
);

// Load Accounts Informations
// 1. Operator
const operatorId = process.env.HEDERA_ACCOUNT_ID;
const operatorEVMAddress = process.env.HEDERA_EVM_ADDRESS;
const operatorKey = PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY);

const bytecode = require(process.cwd() +
  "/app/contractArtifacts/JobPost.json", "utf8").bytecode;
const abi = require(process.cwd() +
  "/app/contractArtifacts/JobPost.json", "utf8").abi;
let bytecodeFileId;
// Instantiate multiple clients
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

let contractId;

const { UtilsArray } = require("../helpers/utils-helpers");

const { JobSmartContract } = require("../models/job");
const Account = require("../models/account");

module.exports = {
  index: async (req, res, next) => {
    let jobSmartContract = await JobSmartContract.find({})
      .sort({
        title: 1,
      })
      .populate("ownerId", "_id name accountId");

    try {
      // console.log(jobSmartContract)
      res.status(200).json(jobSmartContract);
    } catch (error) {
      // console.log(error);
      res.status(500).json(error);
    }
  },
  newJobSmartContract: async (req, res, next) => {
    const { title, description, ownerId } = req.body;

    try {
      const account = await Account.findById(ownerId);

      if (!account) {
        return res.status(404).json({ "message": "Account not found" });
      }

      const accountPrivateKey = PrivateKey.fromStringECDSA(account.pvKey);

      const accountClient = Client.forTestnet().setOperator(
        account.accountId,
        accountPrivateKey
      );

      if (!accountClient) {
        return res.status(500).json({ "message": "Client.forTestnet().setOperator failed", error: accountClient });
      }

      await redeploySmartContract(accountClient, accountPrivateKey, bytecode, 3000000, 10);

      const jobSmartContract = new JobSmartContract({
        title: title || req.body.title,
        description: description || req.body.description,
        ownerId: ownerId || req.body.ownerId,
        contractId: contractId || req.body.contractId,
        solidityAddress: contractId.toSolidityAddress(),
      });

      const newJobSmartContract = await jobSmartContract.save();

      return res.status(200).json(newJobSmartContract);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  newJobPostByAccount: async (req, res, next) => {
    try {
      // Set Testnet Client
      let _client;
      let account = await Account.find({ _id: req.body.ownerId }).sort({
        name: 1,
      });
      account = account[0];

      if (account) {
        _client = Client.forTestnet().setOperator(
          account.accountId,
          PrivateKey.fromStringECDSA(account.pvKey)
        );
      } else {
        _client = Client.forTestnet().setOperator(operatorId, operatorKey);
      }

      const jobSmartContract = await JobSmartContract.find({})
        .sort({
          title: 1,
        })
        .populate("ownerId", "_id name accountId");

      if (!jobSmartContract.length) {
        res.status(404).json({ message: "Job Smart Contract not found" });
      }

      const _jobPost = {
        title: req.body.title,
        description: req.body.description,
        ownerId: req.body.ownerId,
        contractId: jobSmartContract[0].contractId,
        paymentMethod: req.body.paymentMethod,
      };

      await newJobPostByAccount(
        _client,
        _jobPost.contractId,
        account.accountId,
        _jobPost.title,
        _jobPost.paymentMethod
      );

      res.status(200).json(_jobPost);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  },
  getAllJobPosts: async (req, res, next) => {
    
    try {
      var jobPosts = [];
      let jobSmartContract = await JobSmartContract.find({})
        .sort({
          title: 1,
        })
        .populate("ownerId", "_id name accountId");

      if (!jobSmartContract?.length) {
        return res.status(404).json({ message: "No Job Smart Contract found." });
      }

      jobSmartContract = jobSmartContract[0];
      
      let accounts = await Account.find().sort({
        name: 1,
      });

      if (!accounts || !accounts?.length) {
        return res.status(404).json({ message: "No accounts found." });
      }

      for (let i = 0; i < accounts.length; i++) {
        let account = accounts[i];

        let _client = await Client.forTestnet().setOperator(
          account.accountId,
          PrivateKey.fromStringECDSA(account.pvKey)
        );
        
        const queryGas = 100000;
        const accountBalance = await getAccountBalance(account.accountId);

        if (accountBalance >= queryGas) {
          const jobs = await getAllJobPostsByAccount(
            _client,
            "getAllJobsByAccount",
            account.accountId,
            jobSmartContract.contractId,
            account.solidityAddress,
          );

          if (jobs.length > 0) {
            for (let j = 0; j < jobs.length; j++) {
              const element = jobs[j];

              jobPosts.push({
                jobId: element.jobId,
                title: element.jobTitle,
                paymentMethod: element.paymentMethod,
                accountId: element.accountId,
                account: element.account,
              });
            }
          }
        }
      }

      jobPosts = await UtilsArray.sortBy(jobPosts, "jobId", "asc");

      return res.status(200).json(jobPosts);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  getAllJobPostsByAccount: async (req, res, next) => {
    const _ownerId = req.params.ownerId;
    // console.log('_ownerId', _ownerId);
    // Set Testnet Client
    let _client;
    let jobPosts = [];
    let account = await Account.find({ _id: _ownerId }).sort({
      name: 1,
    });
    account = account[0];
    // console.log('account', account);
    if (account) {
      _client = Client.forTestnet().setOperator(
        account.accountId,
        account.pvKey
      );
    } else {
      _client = Client.forTestnet().setOperator(operatorId, operatorKey);
    }

    let jobSmartContract = await JobSmartContract.find({})
      .sort({
        title: 1,
      })
      .populate("ownerId", "_id name accountId");
    jobSmartContract = jobSmartContract[0];
    const jobsByAccount = await getAllJobPostsByAccount(
      _client,
      _functionName,
      account.accountId,
      jobSmartContract?.contractId
    );
    // jobs = jobs;
    // console.log('jobsByAccount', jobsByAccount);

    try {
      if (jobsByAccount.length > 0) {
        for (let j = 0; j < jobsByAccount.length; j++) {
          const element = jobsByAccount[j];
          // console.log('element', element);
          jobPosts.push({
            jobId: element.jobId,
            title: element.jobTitle,
            paymentMethod: element.paymentMethod,
            accountId: element.accountId,
            account: element.account,
          });
        }
      }
      jobPosts = await UtilsArray.sortBy(jobPosts, "jobId", "asc");
      return res.status(200).json(jobPosts);
    } catch (error) {
      console.log(error);
      return res.status(500).json(error);
    }
  },
  getOneJobPostByAccount: async (req, res, next) => {
    const _ownerId =
      req.body.ownerId || req.params.ownerId || req.query.ownerId;
    const _jobId = req.body.jobId || req.params.jobId || req.query.jobId;
    // Set Testnet Client
    let _client;
    let account = await Account.find({ _id: _ownerId }).sort({
      name: 1,
    });
    account = account[0];
    // console.log('account', account);
    if (account) {
      _client = Client.forTestnet().setOperator(
        account.accountId,
        account.pvKey
      );
    } else {
      _client = Client.forTestnet().setOperator(operatorId, operatorKey);
    }

    let jobSmartContract = await JobSmartContract.find({})
      .sort({
        title: 1,
      })
      .populate("ownerId", "_id name accountId");
    const jobByAccount = await getOneJobPostByAccount2(
      _client,
      "getOneJobPostByAccount2",
      jobSmartContract[0].contractId,
      account.accountId,
      +_jobId
    );

    if (jobByAccount.jobId != "0") {
      // console.log(jobByAccount)
      try {
        return res.status(200).json({
          jobId: jobByAccount.jobId,
          title: jobByAccount.jobTitle,
          description: jobByAccount.description,
          accountId: jobByAccount.accountId,
          account: jobByAccount.account,
          paymentMethod: jobByAccount.paymentMethod,
          ownerId: _ownerId,
        });
      } catch (error) {
        return res.status(500).json(error);
      }
    } else {
      return res.status(404).json({
        message: "Job not found",
      });
    }
  },
};

async function redeploySmartContract(
  _client,
  _clientPvKey,
  _bytecode,
  _gas = 3000000,
  _chunks = 10
) {
  await JobSmartContract.deleteMany({});

  const _bytecodeFileId = await createContractBytecodeFileId(
    _client,
    _clientPvKey
  );

  await uploadBytecode(
    _client,
    _clientPvKey,
    _bytecodeFileId,
    _bytecode,
    _chunks
  );

  const _contractId = await instantiateContract(_client, _bytecodeFileId, _gas);
  const solidityAddress = await contractId.toSolidityAddress();
}

async function createContractBytecodeFileId(_client, _clientPvKey) {
  const fileCreateTx = await new FileCreateTransaction()
    .setKeys([_clientPvKey])
    .freezeWith(_client);

  const fileCreateSign = await fileCreateTx.sign(_clientPvKey);
  const fileCreateSubmit = await fileCreateSign.execute(_client);
  const fileCreateRx = await fileCreateSubmit.getReceipt(_client);

  bytecodeFileId = fileCreateRx.fileId;
  console.log(`\nGENERATING CONTRACT BYTECODE ID =============== \n`);
  console.log(`- The smart contract bytecode file ID is ${bytecodeFileId} \n`);
  console.log(
    "👉 " + " https://hashscan.io/testnet/contract/" + bytecodeFileId + "\n"
  );
  return bytecodeFileId;
}
async function uploadBytecode(
  _client,
  _clientPvKey,
  _bytecodeFileId,
  _bytecode,
  _chunks = 10
) {
  const fileAppendTx = await new FileAppendTransaction()
    .setFileId(_bytecodeFileId)
    .setContents(_bytecode)
    .setMaxChunks(_chunks)
    .freezeWith(_client);
  const fileAppendSign = await fileAppendTx.sign(_clientPvKey);
  const fileAppendSubmit = await fileAppendSign.execute(_client);
  const fileAppendRx = await fileAppendSubmit.getReceipt(_client);
  console.log(`\nUPLOADING CONTRACT BYTECODE TO NETWORK ======= \n`);
  console.log(`- Content added: ${fileAppendRx.status} \n`);
}

async function instantiateContract(_client, _bytecodeFileId, _gas = 3000000) {
  const contractInstantiateTx = new ContractCreateTransaction()
    .setBytecodeFileId(_bytecodeFileId)
    .setGas(_gas);
  // .setConstructorParameters(
  //   new ContractFunctionParameters()
  // );
  const contractInstantiateSubmit = await contractInstantiateTx.execute(
    _client
  );
  const contractInstantiateRx = await contractInstantiateSubmit.getReceipt(
    _client
  );
  contractId = contractInstantiateRx.contractId;
  const contractAddress = contractId.toSolidityAddress();
  console.log(`\nINSTANTIATE THE CONTRACT ON HEDERA ======= \n`);
  console.log(`- The smart contract ID is: ${contractId}`);
  console.log(
    `- The smart contract ID in Solidity format is: ${contractAddress} \n`
  );
  console.log("👉 " + " https://hashscan.io/testnet/contract/" + contractId);

  return contractId;
}

async function newJobPostByAccount(
  _client,
  _contractId,
  _accountId,
  _title,
  _paymentMethod,
  _gas = 3000000
) {
  const contractExecTx = await new ContractExecuteTransaction()
    .setContractId(_contractId)
    .setGas(_gas)
    .setFunction(
      "newJobPostByAccount",
      new ContractFunctionParameters()
        .addString(_title)
        .addString(_paymentMethod)
        .addString(_accountId)
      // .addAddress(_accountId.toSolidityAddress())
    );
  const contractExecSubmit = await contractExecTx.execute(_client);
  const record = await contractExecSubmit.getRecord(_client);
  const contractExecRx = await contractExecSubmit.getReceipt(_client);
  console.log(`\nCREATING A NEW JOB POST ======= \n`);
  console.log(`- New Job Post Created: ${contractExecRx.status.toString()}`);
  console.log(`- Transaction Record: ${record.transactionId.toString()}`);
}

async function decodeFunctionResult(functionName, resultAsBytes) {
  const functionAbi = abi.find((func) => func.name === functionName);
  const functionParameters = functionAbi.outputs;
  const resultHex = "0x".concat(Buffer.from(resultAsBytes).toString("hex"));
  const result = await web3.eth.abi.decodeParameters(
    functionParameters,
    resultHex
  );
  console.log("Done");

  return result;
}

async function encodeFunctionCall(functionName, parameters) {
  const functionAbi = abi.find(
    (func) => func.name === functionName && func.type === "function"
  );
  const encodedParametersHex = await web3.eth.abi
    .encodeFunctionCall(functionAbi, parameters)
    .slice(2);
  return Buffer.from(encodedParametersHex, "hex");
}

async function getOneJobPostByAccount2(
  _client,
  _functionName,
  _contractId,
  _accountId,
  _jobId,
  _gas = 100000,
  _queryPaymentInHBars = 2
) {
  console.log(AccountId.fromString(_accountId).toSolidityAddress());
  const contractQuery = await new ContractCallQuery()
    //Set the gas for the query
    .setGas(_gas)
    //Set the contract ID to return the request for
    .setContractId(_contractId)
    //Set the contract function to call
    .setFunction(
      _functionName,
      new ContractFunctionParameters()
        .addAddress(operatorEVMAddress)
        .addUint256(_jobId)
    )
    //Set the query payment for the node returning the request
    //This value must cover the cost of the request otherwise will fail
    .setQueryPayment(new Hbar(_queryPaymentInHBars));

  //Submit to a Hedera network
  const contractExec = await contractQuery.execute(_client);
  console.log(`\nRETRIEVE A JOB POST BY ACCOUNT ======= \n`);
  // console.log(
  //   `- New Job Post Account Owner EVM: ${await contractExec.getAddress(0)}`
  // );
  // console.log(
  //   `- New Job Post Account Owner: ${await contractExec.getString(1)}`
  // );
  // console.log(`- New Job Post ID: ${await contractExec.getUint256(2)}`);
  // console.log(`- New Job Post Title: ${await contractExec.getString(3)}`);
  // console.log(
  //   `- New Job Post Payment Method: ${await contractExec.getString(4)}`
  // );
  const res = await decodeFunctionResult(_functionName, contractQuery.bytes);
  console.log(res[0]);
  return res[0];
}
async function getAllJobPostsByAccount(
  _client,
  _functionName,
  _accountId,
  _contractId,
  _accountEvmAddress,
  _queryGas,
) {
  address = _accountEvmAddress || operatorEVMAddress;

  const contractQuery = await new ContractCallQuery()
    //Set the gas for the query
    .setGas(_queryGas)
    //Set the contract ID to return the request for
    .setContractId(_contractId)
    //Set the contract function to call
    .setFunction(
      _functionName,
      new ContractFunctionParameters().addAddress(address)
    )
    //Set the query payment for the node returning the request
    //This value must cover the cost of the request otherwise will fail
    .setQueryPayment(new Hbar(5));
  // Execute the function
  // .execute(_client);

  const funcExec = await contractQuery.execute(_client);

  console.log(`\nRETRIEVE ALL JOB POSTs BY ACCOUNT ======= \n`);
  const res = await decodeFunctionResult(_functionName, funcExec.bytes);

  // console.log(res[0]);
  return res[0];
}

async function getAccountBalance(_accountId) {
  const query = new AccountBalanceQuery()
    .setAccountId(_accountId);

  const accountBalance = await query.execute(client);

  return accountBalance;
}

async function main() {
  await redeploySmartContract(client, operatorKey, bytecode, 3000000, 10);
  await newJobPostByAccount(
    client,
    contractId,
    operatorId,
    "The Book Of Ethereum",
    "CASH"
  );
  await newJobPostByAccount(
    client,
    contractId,
    operatorId,
    "The Second Book Of Ethereum",
    "DEBIT"
  );
  await getOneJobPostByAccount2(
    client,
    "getOneJobPostByAccount2",
    contractId,
    operatorId,
    2
  );
  await getAllJobPostsByAccount(
    client,
    "getAllJobsByAccount",
    operatorId,
    contractId
  );
}

// main();
