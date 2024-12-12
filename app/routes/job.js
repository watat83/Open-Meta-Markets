
// this router deals better with "try{} catch{}" situations"
const routerJob = require('express-promise-router')();
const routerAccountJob = require('express-promise-router')();
const routerJobSmartContract = require('express-promise-router')();

const AccountController = require('../controllers/account');
const JobSmartContract = require('../controllers/job');


// /api/jobSmartContracts/
routerJobSmartContract.route('/')
    // Get All jobSmartContracts
    .get([], JobSmartContract.index)
    .post([], JobSmartContract.newJobSmartContract);

// /api/jobSmartContracts/:jobSmartContractId
routerJobSmartContract.route('/:jobSmartContractId')
// Get All jobSmartContract
// .get([], JobSmartContract.getOneJobSmartContract)
// .patch([], JobSmartContract.updateJobSmartContract)

// Delete a nft
// .delete([], JobSmartContract.deleteJobSmartContract)


// /api/jobs/
routerJob.route('/')
    // Get All jobs
    .get([], JobSmartContract.getAllJobPosts)
    .post([], JobSmartContract.newJobPostByAccount)
    .put([], JobSmartContract.updateJobPostWithCompletedBy)
// .delete([], JobSmartContract.deleteAllJobs);

// /api/jobs/:ownerId
routerJob.route('/:ownerId')
    // Get All Jobs
    .get([], JobSmartContract.getAllJobPostsByAccount)
// .patch([], JobSmartContract.updateJobByAccount)

// /api/job-account/:ownerId/:jobId
routerAccountJob.route('/:ownerId/:jobId')
    // Get All Jobs
    .get([], JobSmartContract.getOneJobPostByAccount)
// .patch([], JobSmartContract.updateJobByAccount)




module.exports = { routerJobSmartContract, routerJob, routerAccountJob };