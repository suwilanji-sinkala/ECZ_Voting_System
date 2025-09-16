package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// ElectionChaincode represents the chaincode for the election system
type ElectionChaincode struct {
	contractapi.Contract
}

// Vote represents a single vote in the blockchain
type Vote struct {
	VoteID      string    `json:"voteId"`
	VoterID     string    `json:"voterId"`
	ElectionID  string    `json:"electionId"`
	CandidateID string    `json:"candidateId"`
	PositionID  string    `json:"positionId"`
	WardCode    string    `json:"wardCode"`
	Timestamp   time.Time `json:"timestamp"`
	VoteHash    string    `json:"voteHash"`
}

// Election represents an election in the blockchain
type Election struct {
	ElectionID       string    `json:"electionId"`
	Title            string    `json:"title"`
	Description      string    `json:"description"`
	StartDate        string    `json:"startDate"`
	EndDate          string    `json:"endDate"`
	Status           string    `json:"status"`
	Year             int       `json:"year"`
	ElectionType     string    `json:"electionType"`
	WardCode         string    `json:"wardCode"`
	ConstituencyCode string    `json:"constituencyCode"`
	DistrictCode     string    `json:"districtCode"`
	CreatedAt        time.Time `json:"createdAt"`
}

// Voter represents a voter in the blockchain
type Voter struct {
	VoterID     string    `json:"voterId"`
	FirstName   string    `json:"firstName"`
	LastName    string    `json:"lastName"`
	NRC         string    `json:"nrc"`
	Ward        string    `json:"ward"`
	Constituency string   `json:"constituency"`
	Email       string    `json:"email"`
	RegisteredAt time.Time `json:"registeredAt"`
}

// Candidate represents a candidate in the blockchain
type Candidate struct {
	CandidateID string    `json:"candidateId"`
	FirstName   string    `json:"firstName"`
	LastName    string    `json:"lastName"`
	OtherName   string    `json:"otherName"`
	AliasName   string    `json:"aliasName"`
	PartyID     string    `json:"partyId"`
	WardCode    string    `json:"wardCode"`
	PositionID  string    `json:"positionId"`
	ElectionID  string    `json:"electionId"`
	RegisteredAt time.Time `json:"registeredAt"`
}

// VoteResult represents the result of a vote submission
type VoteResult struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	VoteID  string `json:"voteId,omitempty"`
}

// InitLedger initializes the ledger with sample data
func (c *ElectionChaincode) InitLedger(ctx contractapi.TransactionContextInterface) error {
	fmt.Println("Initializing Election Ledger")
	return nil
}

// SubmitVote submits a vote to the blockchain
func (c *ElectionChaincode) SubmitVote(ctx contractapi.TransactionContextInterface, voterID, electionID, candidateID, positionID, wardCode string) (*VoteResult, error) {
	// Check if voter has already voted in this election
	hasVoted, err := c.HasVoterVoted(ctx, voterID, electionID)
	if err != nil {
		return nil, fmt.Errorf("failed to check if voter has voted: %v", err)
	}
	if hasVoted {
		return &VoteResult{
			Success: false,
			Message: "Voter has already voted in this election",
		}, nil
	}

	// Validate election exists and is active
	election, err := c.GetElection(ctx, electionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get election: %v", err)
	}
	if election.Status != "active" {
		return &VoteResult{
			Success: false,
			Message: "Election is not active",
		}, nil
	}

	// Validate voter eligibility
	eligible, err := c.IsVoterEligible(ctx, voterID, electionID)
	if err != nil {
		return nil, fmt.Errorf("failed to check voter eligibility: %v", err)
	}
	if !eligible {
		return &VoteResult{
			Success: false,
			Message: "Voter is not eligible for this election",
		}, nil
	}

	// Create vote
	voteID := fmt.Sprintf("VOTE_%s_%s_%s", voterID, electionID, time.Now().Unix())
	voteHash := fmt.Sprintf("%s_%s_%s_%d", voterID, electionID, candidateID, time.Now().UnixNano())
	
	vote := Vote{
		VoteID:      voteID,
		VoterID:     voterID,
		ElectionID:  electionID,
		CandidateID: candidateID,
		PositionID:  positionID,
		WardCode:    wardCode,
		Timestamp:   time.Now(),
		VoteHash:    voteHash,
	}

	voteJSON, err := json.Marshal(vote)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal vote: %v", err)
	}

	// Store vote in ledger
	err = ctx.GetStub().PutState(voteID, voteJSON)
	if err != nil {
		return nil, fmt.Errorf("failed to put vote in ledger: %v", err)
	}

	// Create composite key for voter-election relationship
	voterElectionKey, err := ctx.GetStub().CreateCompositeKey("voter-election", []string{voterID, electionID})
	if err != nil {
		return nil, fmt.Errorf("failed to create composite key: %v", err)
	}

	// Mark that voter has voted in this election
	err = ctx.GetStub().PutState(voterElectionKey, []byte("voted"))
	if err != nil {
		return nil, fmt.Errorf("failed to mark voter as voted: %v", err)
	}

	return &VoteResult{
		Success: true,
		Message: "Vote submitted successfully",
		VoteID:  voteID,
	}, nil
}

// HasVoterVoted checks if a voter has already voted in an election
func (c *ElectionChaincode) HasVoterVoted(ctx contractapi.TransactionContextInterface, voterID, electionID string) (bool, error) {
	voterElectionKey, err := ctx.GetStub().CreateCompositeKey("voter-election", []string{voterID, electionID})
	if err != nil {
		return false, fmt.Errorf("failed to create composite key: %v", err)
	}

	voteRecord, err := ctx.GetStub().GetState(voterElectionKey)
	if err != nil {
		return false, fmt.Errorf("failed to get vote record: %v", err)
	}

	return voteRecord != nil, nil
}

// IsVoterEligible checks if a voter is eligible for an election
func (c *ElectionChaincode) IsVoterEligible(ctx contractapi.TransactionContextInterface, voterID, electionID string) (bool, error) {
	// Get voter details
	voter, err := c.GetVoter(ctx, voterID)
	if err != nil {
		return false, fmt.Errorf("failed to get voter: %v", err)
	}

	// Get election details
	election, err := c.GetElection(ctx, electionID)
	if err != nil {
		return false, fmt.Errorf("failed to get election: %v", err)
	}

	// General elections are open to all
	if election.ElectionType == "general" {
		return true, nil
	}

	// Check location-based eligibility
	if election.WardCode != "" && voter.Ward == election.WardCode {
		return true, nil
	}
	if election.ConstituencyCode != "" && voter.Constituency == election.ConstituencyCode {
		return true, nil
	}

	return false, nil
}

// GetElection retrieves an election from the ledger
func (c *ElectionChaincode) GetElection(ctx contractapi.TransactionContextInterface, electionID string) (*Election, error) {
	electionJSON, err := ctx.GetStub().GetState(electionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get election: %v", err)
	}
	if electionJSON == nil {
		return nil, fmt.Errorf("election not found")
	}

	var election Election
	err = json.Unmarshal(electionJSON, &election)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal election: %v", err)
	}

	return &election, nil
}

// GetVoter retrieves a voter from the ledger
func (c *ElectionChaincode) GetVoter(ctx contractapi.TransactionContextInterface, voterID string) (*Voter, error) {
	voterJSON, err := ctx.GetStub().GetState(voterID)
	if err != nil {
		return nil, fmt.Errorf("failed to get voter: %v", err)
	}
	if voterJSON == nil {
		return nil, fmt.Errorf("voter not found")
	}

	var voter Voter
	err = json.Unmarshal(voterJSON, &voter)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal voter: %v", err)
	}

	return &voter, nil
}

// CreateElection creates a new election in the blockchain
func (c *ElectionChaincode) CreateElection(ctx contractapi.TransactionContextInterface, electionID, title, description, startDate, endDate, status, electionType, wardCode, constituencyCode, districtCode string, year int) error {
	election := Election{
		ElectionID:       electionID,
		Title:            title,
		Description:      description,
		StartDate:        startDate,
		EndDate:          endDate,
		Status:           status,
		Year:             year,
		ElectionType:     electionType,
		WardCode:         wardCode,
		ConstituencyCode: constituencyCode,
		DistrictCode:     districtCode,
		CreatedAt:        time.Now(),
	}

	electionJSON, err := json.Marshal(election)
	if err != nil {
		return fmt.Errorf("failed to marshal election: %v", err)
	}

	return ctx.GetStub().PutState(electionID, electionJSON)
}

// RegisterVoter registers a new voter in the blockchain
func (c *ElectionChaincode) RegisterVoter(ctx contractapi.TransactionContextInterface, voterID, firstName, lastName, nrc, ward, constituency, email string) error {
	voter := Voter{
		VoterID:      voterID,
		FirstName:    firstName,
		LastName:     lastName,
		NRC:          nrc,
		Ward:         ward,
		Constituency: constituency,
		Email:        email,
		RegisteredAt: time.Now(),
	}

	voterJSON, err := json.Marshal(voter)
	if err != nil {
		return fmt.Errorf("failed to marshal voter: %v", err)
	}

	return ctx.GetStub().PutState(voterID, voterJSON)
}

// RegisterCandidate registers a new candidate in the blockchain
func (c *ElectionChaincode) RegisterCandidate(ctx contractapi.TransactionContextInterface, candidateID, firstName, lastName, otherName, aliasName, partyID, wardCode, positionID, electionID string) error {
	candidate := Candidate{
		CandidateID:   candidateID,
		FirstName:     firstName,
		LastName:      lastName,
		OtherName:     otherName,
		AliasName:     aliasName,
		PartyID:       partyID,
		WardCode:      wardCode,
		PositionID:    positionID,
		ElectionID:    electionID,
		RegisteredAt:  time.Now(),
	}

	candidateJSON, err := json.Marshal(candidate)
	if err != nil {
		return fmt.Errorf("failed to marshal candidate: %v", err)
	}

	return ctx.GetStub().PutState(candidateID, candidateJSON)
}

// GetElectionResults retrieves results for an election
func (c *ElectionChaincode) GetElectionResults(ctx contractapi.TransactionContextInterface, electionID string) (map[string]int, error) {
	// Query all votes for this election
	queryString := fmt.Sprintf(`{"selector":{"electionId":"%s"}}`, electionID)
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, fmt.Errorf("failed to query votes: %v", err)
	}
	defer resultsIterator.Close()

	results := make(map[string]int)
	for resultsIterator.HasNext() {
		queryResult, err := resultsIterator.Next()
		if err != nil {
			return nil, fmt.Errorf("failed to get next result: %v", err)
		}

		var vote Vote
		err = json.Unmarshal(queryResult.Value, &vote)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal vote: %v", err)
		}

		results[vote.CandidateID]++
	}

	return results, nil
}

// GetVoteHistory retrieves vote history for a voter
func (c *ElectionChaincode) GetVoteHistory(ctx contractapi.TransactionContextInterface, voterID string) ([]Vote, error) {
	// Query all votes for this voter
	queryString := fmt.Sprintf(`{"selector":{"voterId":"%s"}}`, voterID)
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, fmt.Errorf("failed to query votes: %v", err)
	}
	defer resultsIterator.Close()

	var votes []Vote
	for resultsIterator.HasNext() {
		queryResult, err := resultsIterator.Next()
		if err != nil {
			return nil, fmt.Errorf("failed to get next result: %v", err)
		}

		var vote Vote
		err = json.Unmarshal(queryResult.Value, &vote)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal vote: %v", err)
		}

		votes = append(votes, vote)
	}

	return votes, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&ElectionChaincode{})
	if err != nil {
		fmt.Printf("Error creating election chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting election chaincode: %s", err.Error())
	}
} 