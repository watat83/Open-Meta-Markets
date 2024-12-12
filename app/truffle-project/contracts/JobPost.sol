// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

pragma experimental ABIEncoderV2;

contract JobPost {
    struct NFTProfile {
        string dob;
        string email;
        string gender;
        string nftProfileTokenId;
    }

    struct Job {
        uint256 jobId;
        string jobTitle;
        string paymentMethod;
        string accountId;
        address account;
        string jobCompleted;
        NFTProfile jobCompletedBy;
    }

    enum paymentMethods {
        CASH,
        DEBIT,
        CREDIT,
        CRYPTO
    }

    event JobPostCreated(
        uint256 jobId,
        string jobTitle,
        string paymentMethod,
        string accountId,
        address account,
        string jobCompleted,
        NFTProfile jobCompletedBy
    );

    event JobPostUpdated(
        uint256 _jobId,
        string _jobTitle,
        string _paymentMethod,
        string _accountId,
        address _account,
        string _jobCompleted,
        NFTProfile _jobCompletedBy
    );

    // mapping(uint => Job) JobsByIndex;
    mapping(address => Job[]) JobsByAccount;
    uint256 public jobCounter = 0;

    constructor() {}

    function newJobPostByAccount(
        string memory _jobTitle,
        string memory _paymentMethod,
        string memory _accountId,
        string memory _jobCompleted,
        string memory _dob,
        string memory _email,
        string memory _gender,
        string memory _nftProfileTokenId
    ) public {
        jobCounter++;
        JobsByAccount[msg.sender].push(
            Job({
                jobId: jobCounter,
                jobTitle: _jobTitle,
                paymentMethod: _paymentMethod,
                accountId: _accountId,
                account: msg.sender,
                jobCompleted: _jobCompleted,
                jobCompletedBy: NFTProfile({
                    dob: _dob,
                    email: _email,
                    gender: _gender,
                    nftProfileTokenId: _nftProfileTokenId
                })
            })
        );

        emit JobPostCreated(
            jobCounter,
            _jobTitle,
            _paymentMethod,
            _accountId,
            msg.sender,
            _jobCompleted,
            NFTProfile({
                dob: _dob,
                email: _email,
                gender: _gender,
                nftProfileTokenId: _nftProfileTokenId
            })
        );
    }

    function getOneJobPostByAccount2(
        address _account,
        uint256 _jobId
    )
        public
        view
        returns (
            address account,
            string memory accountId,
            uint256 jobId,
            string memory jobTitle,
            string memory paymentMethod,
            string memory jobCompleted,
            NFTProfile memory jobCompletedBy
        )
    {
        // require(_account <= jobCounter);
        Job[] storage jobs = JobsByAccount[_account];
        for (uint256 index = 0; index < jobs.length; index++) {
            if (jobs[index].jobId == _jobId) {
                return (
                    jobs[index].account,
                    jobs[index].accountId,
                    jobs[index].jobId,
                    jobs[index].jobTitle,
                    jobs[index].paymentMethod,
                    jobs[index].jobCompleted,
                    jobs[index].jobCompletedBy
                );
            }
        }
    }

    function getOneJobPostByAccount(
        address _account,
        uint256 _jobId
    ) public view returns (Job memory job) {
        // require(_account <= jobCounter);
        Job[] storage jobs = JobsByAccount[_account];
        for (uint256 index = 0; index < jobs.length; index++) {
            if (jobs[index].jobId == _jobId) {
                return (jobs[index]);
            }
        }
        // return (0,"","",0x0);
    }

    function updateJobPostByAccount(
        uint256 _jobId,
        string memory _jobTitle,
        string memory _paymentMethod,
        address _account,
        string memory _accountId,
        string memory _jobCompleted,
        string memory _dob,
        string memory _email,
        string memory _gender,
        string memory _nftProfileTokenId
    ) public {
        Job[] storage jobs = JobsByAccount[_account];
        require(_jobId <= jobCounter);
        // require(jobs, "This user does not exist");
        require(jobs.length > 0, "No Job post exists for this user");
        for (uint256 i = 0; i < jobs.length; i++) {
            if (jobs[i].jobId == _jobId) {
                jobs[i].jobTitle = _jobTitle;
                jobs[i].paymentMethod = _paymentMethod;
                jobs[i].account = _account;
                jobs[i].accountId = _accountId;
                jobs[i].jobCompleted = _jobCompleted;
                jobs[i].jobCompletedBy = NFTProfile({
                    dob: _dob,
                    email: _email,
                    gender: _gender,
                    nftProfileTokenId: _nftProfileTokenId
                });
            }
        }
        emit JobPostUpdated(
            _jobId,
            _jobTitle,
            _paymentMethod,
            _accountId,
            _account,
            _jobCompleted,
            NFTProfile({
                dob: _dob,
                email: _email,
                gender: _gender,
                nftProfileTokenId: _nftProfileTokenId
            })
        );
    }

    function getAllJobsByAccount(
        address _account
    ) public view returns (Job[] memory) {
        Job[] storage jobs = JobsByAccount[_account];
        // require(jobs.length > 0, "No Job post exists for this user");
        if (jobs.length > 0) {
            return jobs;
        } else {
            Job[] memory emptyJobs;
            return emptyJobs;
        }
    }

    function updateJobWithCompletedBy(
        address _account,
        uint256 _jobId,
        string memory _jobCompleted,
        string memory _dob,
        string memory _email,
        string memory _gender,
        string memory _nftProfileTokenId
    ) public {
        Job[] storage jobs = JobsByAccount[_account];

        require(_jobId <= jobCounter, "Invalid Job ID");

        if (jobs.length > 0) {
            for (uint256 i = 0; i < jobs.length; i++) {
                if (jobs[i].jobId == _jobId) {
                    jobs[i].jobCompleted = _jobCompleted;
                    jobs[i].jobCompletedBy = NFTProfile({
                        dob: _dob,
                        email: _email,
                        gender: _gender,
                        nftProfileTokenId: _nftProfileTokenId
                    });

                    emit JobPostUpdated(
                        _jobId,
                        jobs[i].jobTitle,
                        jobs[i].paymentMethod,
                        jobs[i].accountId,
                        jobs[i].account,
                        jobs[i].jobCompleted,
                        jobs[i].jobCompletedBy
                    );

                    return;
                }
            }
        } else {
            revert("Job not found");
        }
    }
}
