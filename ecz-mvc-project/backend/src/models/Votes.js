class Vote {
    constructor({ voteId, candidateId, wardCode, electionId, voteHash }) {
        this.voteId = voteId;
        this.candidateId = candidateId;
        this.wardCode = wardCode;
        this.electionId = electionId;
        this.voteHash = voteHash;
    }
}

module.exports = Vote;