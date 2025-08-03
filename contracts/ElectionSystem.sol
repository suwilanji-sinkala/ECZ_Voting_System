// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ElectionSystem {
    struct Vote {
        string voteId;
        string voterId;
        string electionId;
        string candidateId;
        string positionId;
        string wardCode;
        uint256 timestamp;
        string voteHash;
    }

    struct Election {
        string electionId;
        string title;
        string description;
        uint256 startDate;
        uint256 endDate;
        string status;
        uint256 year;
        string electionType;
        string wardCode;
        string constituencyCode;
        string districtCode;
        uint256 createdAt;
    }

    struct Voter {
        string voterId;
        string firstName;
        string lastName;
        string nrc;
        string ward;
        string constituency;
        string email;
        uint256 registeredAt;
    }

    struct Candidate {
        string candidateId;
        string firstName;
        string lastName;
        string otherName;
        string aliasName;
        string partyId;
        string wardCode;
        string positionId;
        string electionId;
        uint256 registeredAt;
    }

    // Storage mappings
    mapping(string => Election) public elections;
    mapping(string => Voter) public voters;
    mapping(string => Candidate) public candidates;
    mapping(string => Vote) public votes;
    mapping(string => mapping(string => bool)) public voterElectionVoted; // voterId => electionId => hasVoted
    mapping(string => mapping(string => uint256)) public electionCandidateVotes; // electionId => candidateId => voteCount
    mapping(string => bool) public voterExists;
    mapping(string => bool) public electionExists;
    mapping(string => bool) public candidateExists;
    mapping(string => bool) public voteExists;

    // Events
    event ElectionCreated(string electionId, string title, uint256 timestamp);
    event VoterRegistered(string voterId, string firstName, string lastName, uint256 timestamp);
    event CandidateRegistered(string candidateId, string firstName, string lastName, uint256 timestamp);
    event VoteSubmitted(string voteId, string voterId, string electionId, string candidateId, uint256 timestamp);
    event ElectionStatusUpdated(string electionId, string status, uint256 timestamp);

    // Modifiers
    modifier onlyValidElection(string memory _electionId) {
        require(electionExists[_electionId], "Election does not exist");
        _;
    }

    modifier onlyValidVoter(string memory _voterId) {
        require(voterExists[_voterId], "Voter does not exist");
        _;
    }

    modifier onlyValidCandidate(string memory _candidateId) {
        require(candidateExists[_candidateId], "Candidate does not exist");
        _;
    }

    modifier onlyActiveElection(string memory _electionId) {
        require(electionExists[_electionId], "Election does not exist");
        require(keccak256(bytes(elections[_electionId].status)) == keccak256(bytes("active")), "Election is not active");
        require(block.timestamp >= elections[_electionId].startDate, "Election has not started");
        require(block.timestamp <= elections[_electionId].endDate, "Election has ended");
        _;
    }

    // Create a new election
    function createElection(
        string memory _electionId,
        string memory _title,
        string memory _description,
        uint256 _startDate,
        uint256 _endDate,
        string memory _status,
        uint256 _year,
        string memory _electionType,
        string memory _wardCode,
        string memory _constituencyCode,
        string memory _districtCode
    ) public {
        require(!electionExists[_electionId], "Election already exists");
        require(_startDate < _endDate, "Start date must be before end date");
        require(_startDate >= block.timestamp, "Start date must be now or in the future");

        elections[_electionId] = Election({
            electionId: _electionId,
            title: _title,
            description: _description,
            startDate: _startDate,
            endDate: _endDate,
            status: _status,
            year: _year,
            electionType: _electionType,
            wardCode: _wardCode,
            constituencyCode: _constituencyCode,
            districtCode: _districtCode,
            createdAt: block.timestamp
        });

        electionExists[_electionId] = true;
        emit ElectionCreated(_electionId, _title, block.timestamp);
    }

    // Register a new voter
    function registerVoter(
        string memory _voterId,
        string memory _firstName,
        string memory _lastName,
        string memory _nrc,
        string memory _ward,
        string memory _constituency,
        string memory _email
    ) public {
        require(!voterExists[_voterId], "Voter already exists");

        voters[_voterId] = Voter({
            voterId: _voterId,
            firstName: _firstName,
            lastName: _lastName,
            nrc: _nrc,
            ward: _ward,
            constituency: _constituency,
            email: _email,
            registeredAt: block.timestamp
        });

        voterExists[_voterId] = true;
        emit VoterRegistered(_voterId, _firstName, _lastName, block.timestamp);
    }

    // Register a new candidate
    function registerCandidate(
        string memory _candidateId,
        string memory _firstName,
        string memory _lastName,
        string memory _otherName,
        string memory _aliasName,
        string memory _partyId,
        string memory _wardCode,
        string memory _positionId,
        string memory _electionId
    ) public onlyValidElection(_electionId) {
        require(!candidateExists[_candidateId], "Candidate already exists");

        candidates[_candidateId] = Candidate({
            candidateId: _candidateId,
            firstName: _firstName,
            lastName: _lastName,
            otherName: _otherName,
            aliasName: _aliasName,
            partyId: _partyId,
            wardCode: _wardCode,
            positionId: _positionId,
            electionId: _electionId,
            registeredAt: block.timestamp
        });

        candidateExists[_candidateId] = true;
        emit CandidateRegistered(_candidateId, _firstName, _lastName, block.timestamp);
    }

    // Submit a vote
    function submitVote(
        string memory _voteId,
        string memory _voterId,
        string memory _electionId,
        string memory _candidateId,
        string memory _positionId,
        string memory _wardCode
    ) public onlyValidVoter(_voterId) onlyValidElection(_electionId) onlyValidCandidate(_candidateId) onlyActiveElection(_electionId) {
        require(!voteExists[_voteId], "Vote ID already exists");
        require(!voterElectionVoted[_voterId][_electionId], "Voter has already voted in this election");

        // Create vote hash for verification
        string memory voteHash = _generateVoteHash(_voterId, _electionId, _candidateId, _positionId, _wardCode);

        votes[_voteId] = Vote({
            voteId: _voteId,
            voterId: _voterId,
            electionId: _electionId,
            candidateId: _candidateId,
            positionId: _positionId,
            wardCode: _wardCode,
            timestamp: block.timestamp,
            voteHash: voteHash
        });

        voteExists[_voteId] = true;
        voterElectionVoted[_voterId][_electionId] = true;
        electionCandidateVotes[_electionId][_candidateId]++;

        emit VoteSubmitted(_voteId, _voterId, _electionId, _candidateId, block.timestamp);
    }

    // Check if voter has voted in an election
    function hasVoterVoted(string memory _voterId, string memory _electionId) public view returns (bool) {
        return voterElectionVoted[_voterId][_electionId];
    }

    // Get election results
    function getElectionResults(string memory _electionId) public view onlyValidElection(_electionId) returns (uint256[] memory, string[] memory) {
        // This is a simplified version - in a real implementation, you'd need to iterate through all candidates
        // For now, we'll return the vote counts for candidates that have votes
        uint256 candidateCount = 0;
        
        // Count candidates for this election
        // Note: This is a limitation of Solidity - we'd need to maintain a separate array of candidates per election
        // For now, this is a placeholder implementation
        
        uint256[] memory voteCounts = new uint256[](candidateCount);
        string[] memory candidateIds = new string[](candidateCount);
        
        return (voteCounts, candidateIds);
    }

    // Update election status
    function updateElectionStatus(string memory _electionId, string memory _status) public onlyValidElection(_electionId) {
        elections[_electionId].status = _status;
        emit ElectionStatusUpdated(_electionId, _status, block.timestamp);
    }

    // Get election details
    function getElection(string memory _electionId) public view onlyValidElection(_electionId) returns (Election memory) {
        return elections[_electionId];
    }

    // Get voter details
    function getVoter(string memory _voterId) public view onlyValidVoter(_voterId) returns (Voter memory) {
        return voters[_voterId];
    }

    // Get candidate details
    function getCandidate(string memory _candidateId) public view onlyValidCandidate(_candidateId) returns (Candidate memory) {
        return candidates[_candidateId];
    }

    // Get vote details
    function getVote(string memory _voteId) public view returns (Vote memory) {
        require(voteExists[_voteId], "Vote does not exist");
        return votes[_voteId];
    }

    // Generate vote hash for verification
    function _generateVoteHash(
        string memory _voterId,
        string memory _electionId,
        string memory _candidateId,
        string memory _positionId,
        string memory _wardCode
    ) internal pure returns (string memory) {
        // In a real implementation, you'd use a proper hashing algorithm
        // For now, we'll create a simple concatenated string
        return string(abi.encodePacked(_voterId, _electionId, _candidateId, _positionId, _wardCode));
    }

    // Get vote count for a candidate in an election
    function getCandidateVoteCount(string memory _electionId, string memory _candidateId) public view returns (uint256) {
        return electionCandidateVotes[_electionId][_candidateId];
    }
} 