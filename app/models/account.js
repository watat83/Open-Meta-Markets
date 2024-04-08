const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const accountSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    accountId: {
        type: String,
        required: true
    },
    pbKey: {
        type: String,
        required: true
    },
    pvKey: {
        type: String,
        required: true
    },
    solidityAddress: {
        type: String,
        required: false
    },
    created_at: {
        type: Date,
        default: new Date()
    },
    updated_at: {
        type: Date
    },
});


//Custom methods specific to Accounts
accountSchema.methods.countAccounts = function () {
    return this.count({}, (err, c) => {
        return c;
    });
};

accountSchema.pre('save', (next) => {
    now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});



const Account = mongoose.model('account', accountSchema);

module.exports = Account;