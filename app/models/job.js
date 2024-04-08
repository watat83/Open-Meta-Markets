const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AccountModel = require('./account');
const {
    Client,
    TokenId
} = require("@hashgraph/sdk");

const jobSmartContractSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    contractId: {
        type: String,
        required: true
    },
    solidityAddress: {
        type: String,
        required: false
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: AccountModel
    },
    description: {
        type: String,
        required: false
    },
    created_at: {
        type: Date,
        default: Date.now,
        required: false
    },
    updated_at: {
        type: Date,
        required: false
    },
});


const JobSmartContract = mongoose.model('jobSmartContract', jobSmartContractSchema);

module.exports = { JobSmartContract };