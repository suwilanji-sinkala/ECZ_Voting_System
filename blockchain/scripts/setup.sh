#!/bin/bash

# Hyperledger Fabric Election System Setup Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up Hyperledger Fabric Election System...${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Create directories
mkdir -p organizations/peerOrganizations
mkdir -p organizations/ordererOrganizations
mkdir -p blockchain-network
mkdir -p chaincode/election
mkdir -p system-genesis-block
mkdir -p channel-artifacts

# Download Hyperledger Fabric binaries
echo -e "${YELLOW}Downloading Hyperledger Fabric binaries...${NC}"
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.2.12 1.4.9

# Set PATH to include Fabric binaries
export PATH=${PWD}/bin:${PWD}/configtxgen:${PWD}/configtxlator:$PATH

# Generate crypto materials
echo -e "${YELLOW}Generating crypto materials...${NC}"
cryptogen generate --config=./organizations/cryptogen/crypto-config.yaml --output="organizations"

# Generate system channel genesis block
echo -e "${YELLOW}Generating system channel genesis block...${NC}"
configtxgen -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock ./system-genesis-block/genesis.block

# Generate channel configuration transaction
echo -e "${YELLOW}Generating channel configuration...${NC}"
configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID electionchannel

# Generate anchor peer updates
echo -e "${YELLOW}Generating anchor peer updates...${NC}"
configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/ECZMSPanchors.tx -channelID electionchannel -asOrg ECZMSP
configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/VoterMSPanchors.tx -channelID electionchannel -asOrg VoterMSP

# Start the network
echo -e "${YELLOW}Starting the network...${NC}"
docker-compose -f docker/docker-compose-net.yaml up -d

# Wait for network to be ready
echo -e "${YELLOW}Waiting for network to be ready...${NC}"
sleep 30

# Create channel
echo -e "${YELLOW}Creating election channel...${NC}"
docker exec cli peer channel create -o orderer.election.com:7050 -c electionchannel -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/channel.tx

# Join channel
echo -e "${YELLOW}Joining organizations to channel...${NC}"
docker exec cli peer channel join -b electionchannel.block

# Install chaincode
echo -e "${YELLOW}Installing election chaincode...${NC}"
docker exec cli peer lifecycle chaincode package election.tar.gz --path github.com/hyperledger/fabric/chaincode/election --lang golang --label election_1.0

docker exec cli peer lifecycle chaincode install election.tar.gz

# Approve chaincode
echo -e "${YELLOW}Approving chaincode...${NC}"
docker exec cli peer lifecycle chaincode approveformyorg -o localhost:7050 --channelID electionchannel --name election --version 1.0 --package-id election_1.0:$(docker exec cli peer lifecycle chaincode queryinstalled | grep election_1.0 | awk '{print $3}' | sed 's/,//') --sequence 1

# Commit chaincode
echo -e "${YELLOW}Committing chaincode...${NC}"
docker exec cli peer lifecycle chaincode commit -o localhost:7050 --channelID electionchannel --name election --version 1.0 --sequence 1

# Initialize ledger
echo -e "${YELLOW}Initializing ledger...${NC}"
docker exec cli peer chaincode invoke -o localhost:7050 -C electionchannel -n election -c '{"Args":["InitLedger"]}'

echo -e "${GREEN}Hyperledger Fabric Election System setup completed successfully!${NC}"
echo -e "${GREEN}Network is running on localhost:7050${NC}"
echo -e "${GREEN}Channel: electionchannel${NC}"
echo -e "${GREEN}Chaincode: election${NC}" 