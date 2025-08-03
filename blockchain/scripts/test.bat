@echo off
echo Testing Hyperledger Fabric Election System...

cd /d "%~dp0.."

echo.
echo 1. Testing chaincode query...
docker exec cli peer chaincode query -C electionchannel -n election -c "{\"Args\":[\"GetElectionResults\",\"ELECTION_1\"]}"

echo.
echo 2. Testing voter eligibility check...
docker exec cli peer chaincode query -C electionchannel -n election -c "{\"Args\":[\"IsVoterEligible\",\"001W\",\"ELECTION_1\"]}"

echo.
echo 3. Testing vote history...
docker exec cli peer chaincode query -C electionchannel -n election -c "{\"Args\":[\"GetVoteHistory\",\"001W\"]}"

echo.
echo Blockchain test completed! 