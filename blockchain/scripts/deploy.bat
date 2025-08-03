@echo off
echo Deploying Election Chaincode...

cd /d "%~dp0.."

REM Package the chaincode
docker exec cli peer lifecycle chaincode package election.tar.gz --path github.com/hyperledger/fabric/chaincode/election --lang golang --label election_1.0

REM Install the chaincode
docker exec cli peer lifecycle chaincode install election.tar.gz

REM Get the package ID
for /f "tokens=3" %%i in ('docker exec cli peer lifecycle chaincode queryinstalled ^| findstr election_1.0') do set PACKAGE_ID=%%i
set PACKAGE_ID=%PACKAGE_ID:,=%

REM Approve the chaincode
docker exec cli peer lifecycle chaincode approveformyorg -o localhost:7050 --channelID electionchannel --name election --version 1.0 --package-id election_1.0:%PACKAGE_ID% --sequence 1

REM Commit the chaincode
docker exec cli peer lifecycle chaincode commit -o localhost:7050 --channelID electionchannel --name election --version 1.0 --sequence 1

echo Chaincode deployed successfully! 