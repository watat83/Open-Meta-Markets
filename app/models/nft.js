const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AccountModel = require('./account');


const nftCollectionSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    symbol: {
        type: String,
        required: true
    },
    tokenId: {
        type: String,
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: AccountModel
    },
    accountId: {
        type: String,
        required: true
    },
    memo: {
        type: String,
        required: false
    },
    maxSupply: {
        type: Number,
        required: false
    },
    mintingFee: {
        type: String,
        required: false
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date
    },
});
const nftSerialSchema = new Schema({
    serial: {
        type: String,
        required: true
    },
    ipfsHash: {
        type: String,
        required: true
    },
    tokenId: {
        type: String,
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: AccountModel
    },
    created_at: {
        type: Date,
        default: new Date()
    },
    updated_at: {
        type: Date
    },
});



const NFTCollection = mongoose.model('nftCollection', nftCollectionSchema);
const NFTSerial = mongoose.model('nftSerial', nftSerialSchema);

module.exports = { NFTCollection, NFTSerial };