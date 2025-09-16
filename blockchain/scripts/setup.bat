@echo off
REM Hyperledger Fabric Election System Setup Script for Windows

echo Setting up Hyperledger Fabric Election System...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Create directories
if not exist "organizations\peerOrganizations" mkdir organizations\peerOrganizations
if not exist "organizations\ordererOrganizations" mkdir organizations\ordererOrganizations
if not exist "blockchain-network" mkdir blockchain-network
if not exist "chaincode\election" mkdir chaincode\election
if not exist "system-genesis-block" mkdir system-genesis-block
if not exist "channel-artifacts" mkdir channel-artifacts

REM Download Hyperledger Fabric binaries
echo Downloading Hyperledger Fabric binaries...
powershell -Command "Invoke-WebRequest -Uri 'https://bit.ly/2ysbOFE' -OutFile 'bootstrap.sh'"
bash bootstrap.sh 2.2.12 1.4.9

REM Set PATH to include Fabric binaries
set PATH=%cd%\bin;%cd%\configtxgen;%cd%\configtxlator;%PATH%

REM Generate crypto materials
echo Generating crypto materials...
cryptogen generate --config=./organizations/cryptogen/crypto-config.yaml --output="organizations"

REM Generate system channel genesis block
echo Generating system channel genesis block...
configtxgen -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock ./system-genesis-block/genesis.block

REM Generate channel configuration transaction
echo Generating channel configuration...
configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID electionchannel

REM Generate anchor peer updates
echo Generating anchor peer updates...
configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/ECZMSPanchors.tx -channelID electionchannel -asOrg ECZMSP
configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/VoterMSPanchors.tx -channelID electionchannel -asOrg VoterMSP

REM Start the network
echo Starting the network...
docker-compose -f docker/docker-compose-net.yaml up -d

REM Wait for network to be ready
echo Waiting for network to be ready...
timeout /t 30 /nobreak >nul

REM Create channel
echo Creating election channel...
docker exec cli peer channel create -o orderer.election.com:7050 -c electionchannel -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/channel.tx

REM Join channel
echo Joining organizations to channel...
docker exec cli peer channel join -b electionchannel.block

REM Install chaincode
echo Installing election chaincode...
docker exec cli peer lifecycle chaincode package election.tar.gz --path github.com/hyperledger/fabric/chaincode/election --lang golang --label election_1.0

docker exec cli peer lifecycle chaincode install election.tar.gz

REM Approve chaincode
echo Approving chaincode...
docker exec cli peer lifecycle chaincode approveformyorg -o localhost:7050 --channelID electionchannel --name election --version 1.0 --package-id election_1.0:$(docker exec cli peer lifecycle chaincode queryinstalled | grep election_1.0 | awk '{print $3}' | sed 's/,//') --sequence 1

REM Commit chaincode
echo Committing chaincode...
docker exec cli peer lifecycle chaincode commit -o localhost:7050 --channelID electionchannel --name election --version 1.0 --sequence 1

REM Initialize ledger
echo Initializing ledger...
docker exec cli peer chaincode invoke -o localhost:7050 -C electionchannel -n election -c "{\"Args\":[\"InitLedger\"]}"

echo Hyperledger Fabric Election System setup completed successfully!
echo Network is running on localhost:7050
echo Channel: electionchannel
echo Chaincode: election 