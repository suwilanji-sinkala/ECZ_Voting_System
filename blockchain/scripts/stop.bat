@echo off
echo Stopping Hyperledger Fabric Election Network...

cd /d "%~dp0.."
docker-compose -f docker/docker-compose-net.yaml down

echo Network stopped successfully! 