
// this router deals better with "try{} catch{}" situations"
const router = require('express-promise-router')();

const AccountController = require('../controllers/account');


// /api/accounts/
router.route('/')
    // Get All accounts
    .get([], AccountController.index)
    .post([], AccountController.newAccount);

// /api/accounts/:accountId
router.route('/:accountId')
    // Get All accounts
    .get([], AccountController.getOneAccount)
    .patch([], AccountController.updateAccount)

    // Delete a account
    .delete([], AccountController.deleteAccount)



module.exports = router;