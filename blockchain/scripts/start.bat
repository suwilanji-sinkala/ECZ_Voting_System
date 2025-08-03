@echo off
echo Starting Hyperledger Fabric Election Network...

cd /d "%~dp0.."
docker-compose -f docker/docker-compose-net.yaml up -d

echo Network started successfully!
echo Orderer: localhost:7050
echo ECZ Peer: localhost:7051
echo Voter Peer: localhost:8051 