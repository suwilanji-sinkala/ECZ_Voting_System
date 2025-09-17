// Truffle exec script to seed an election matching the frontend's DEFAULT_ELECTION_ID
// Usage:
//   truffle exec scripts/seed_election.js --network development --electionId <ID> \
//     --title "Demo Election" --desc "Demo description" --startIn 60 --duration 86400 \
//     --status active --year 2025 --etype general --ward WARD001 --const CONST001 --dist DIST001
// If flags are omitted, sensible defaults are used and electionId defaults to the UI's hardcoded value.

const ElectionSystem = artifacts.require('ElectionSystem');

function getArg(flag, def) {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && process.argv[idx + 1] && !process.argv[idx + 1].startsWith('--')) {
    return process.argv[idx + 1];
  }
  return def;
}

module.exports = async function (callback) {
  try {
    const defaultId = 'ELECTION_1753004099623_38lomugrp';
    const electionId = getArg('--electionId', defaultId);
    const title = getArg('--title', 'Demo Election');
    const description = getArg('--desc', 'Demo description');
    const startIn = parseInt(getArg('--startIn', '60'), 10); // seconds from now
    const duration = parseInt(getArg('--duration', '86400'), 10); // seconds
    const status = getArg('--status', 'active');
    const year = parseInt(getArg('--year', '2025'), 10);
    const electionType = getArg('--etype', 'general');
    const wardCode = getArg('--ward', 'WARD001');
    const constituencyCode = getArg('--const', 'CONST001');
    const districtCode = getArg('--dist', 'DIST001');

    const now = Math.floor(Date.now() / 1000);
    const startDate = now + startIn;
    const endDate = startDate + duration;

    const accounts = await web3.eth.getAccounts();
    const from = accounts[0];

    const es = await ElectionSystem.deployed();

    // Try to detect if it already exists by calling getElection; if it reverts, we'll create.
    let exists = false;
    try {
      await es.getElection(electionId);
      exists = true;
    } catch (e) {
      exists = false;
    }

    if (exists) {
      console.log(`[seed] Election already exists: ${electionId}`);
    } else {
      console.log(`[seed] Creating election: ${electionId}`);
      const tx = await es.createElection(
        electionId,
        title,
        description,
        startDate,
        endDate,
        status,
        year,
        electionType,
        wardCode,
        constituencyCode,
        districtCode,
        { from }
      );
      console.log('[seed] Tx hash:', tx.tx || tx.receipt?.transactionHash);
    }

    // Output address to help set NEXT_PUBLIC_CONTRACT_ADDRESS
    console.log('[seed] Contract address:', es.address);
    callback();
  } catch (err) {
    console.error('[seed] Error:', err);
    callback(err);
  }
};
