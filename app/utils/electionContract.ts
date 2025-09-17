import Web3 from 'web3';
import ElectionSystem from '../../build/contracts/ElectionSystem.json';

declare let window: any;

// Optional legacy fallback (discouraged). Prefer NEXT_PUBLIC_CONTRACT_ADDRESS or artifact mapping.
const LEGACY_FALLBACK_ADDRESS = '0x8C0337c6EA005368823f34e1238292BB76528FBA';

export const connectToContract = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Request account access if needed
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Create Web3 instance
      const web3 = new Web3(window.ethereum);
      
      // Get the contract instance
      const networkId = await web3.eth.net.getId();
      const chainId = await web3.eth.getChainId();
      // Truffle artifact networks keys are strings; ensure we index with a string
      const deployedNetwork = (ElectionSystem.networks as Record<string, any>)[
        networkId.toString()
      ];
      console.debug('[ElectionContract] networkId:', networkId.toString());
      console.debug('[ElectionContract] chainId:', chainId.toString());
      console.debug('[ElectionContract] artifact networks keys:', Object.keys(ElectionSystem.networks || {}));

      // Determine address with strict verification order:
      // 1) Explicit env var override
      // 2) Artifact address for current network
      // 3) As a last resort for legacy setups, try legacy fallback (will be verified to have code)
      const envAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string | undefined;
      let addressToUse: string | undefined = undefined;
      let addressSource = '';

      if (envAddress && envAddress.trim()) {
        addressToUse = envAddress.trim();
        addressSource = 'env(NEXT_PUBLIC_CONTRACT_ADDRESS)';
      } else if (deployedNetwork?.address) {
        addressToUse = deployedNetwork.address;
        addressSource = `artifact(networkId=${networkId})`;
      } else if (LEGACY_FALLBACK_ADDRESS) {
        addressToUse = LEGACY_FALLBACK_ADDRESS;
        addressSource = 'legacy_fallback';
      }

      console.debug('[ElectionContract] Candidate contract address:', addressToUse, 'source:', addressSource);
      if (!addressToUse) {
        throw new Error(
          'No contract address available. Set NEXT_PUBLIC_CONTRACT_ADDRESS or deploy the contract on the connected network.'
        );
      }

      const contract = new web3.eth.Contract(ElectionSystem.abi as any, addressToUse);
      
      // Get the current account
      const accounts = await web3.eth.getAccounts();

      // Verify the address actually has contract code on the connected network
      const code = await web3.eth.getCode(addressToUse);
      if (!code || code === '0x') {
        throw new Error(
          `No contract found at ${addressToUse} on networkId=${networkId}, chainId=${chainId}. ` +
          'Make sure: (1) MetaMask is connected to the correct network, ' +
          '(2) the contract is deployed to this network, and (3) the address matches the deployed instance. ' +
          `Currently selected address source: ${addressSource}.`
        );
      }
      
      return {
        contract,
        accounts,
        web3
      };
    } catch (error) {
      console.error('Error connecting to contract:', error);
      throw error;
    }
  } else {
    throw new Error('Please install MetaMask to use this application');
  }
};

export const getElectionDetails = async (contract: any) => {
  try {
    throw new Error('getElectionDetails(contract) now requires an electionId. Use getElectionDetailsById(contract, electionId).');
  } catch (error) {
    console.error('Error getting election details:', error);
    throw error;
  }
};

// New function aligned with ElectionSystem.sol ABI
export const getElectionDetailsById = async (contract: any, electionId: string) => {
  try {
    if (!electionId) {
      throw new Error('Missing electionId. Provide a valid electionId to fetch election details.');
    }
    if (!contract?.methods?.getElection) {
      throw new Error('Contract ABI does not include getElection(string). Ensure you are using ElectionSystem ABI.');
    }

    const election = await contract.methods.getElection(electionId).call();

    // election is the Election struct defined in the contract
    return {
      electionId: election.electionId,
      title: election.title,
      description: election.description,
      startDate: Number(election.startDate),
      endDate: Number(election.endDate),
      status: election.status,
      year: Number(election.year),
      electionType: election.electionType,
      wardCode: election.wardCode,
      constituencyCode: election.constituencyCode,
      districtCode: election.districtCode,
      createdAt: Number(election.createdAt)
    };
  } catch (error: any) {
    console.error('Error getting election details by ID:', error);
    // Attempt to extract nested revert reason from common provider error shapes
    const nestedMsg =
      error?.data?.message ||
      error?.data?.originalError?.message ||
      error?.error?.message ||
      error?.message ||
      '';
    const msg = String(nestedMsg);
    if (msg.includes("Returned values aren't valid") || msg.includes('Parameter decoding error')) {
      throw new Error(
        'Failed to decode contract response. Likely causes: (1) wrong contract address for the current network, ' +
        '(2) incorrect ABI, or (3) querying a node that is not synced. Verify deployment and network selection in MetaMask.'
      );
    }
    if (msg.includes('Election does not exist')) {
      throw new Error('Election ID not found on-chain. Create this election on the connected network or use a valid electionId.');
    }
    if (msg.toLowerCase().includes('internal json-rpc error')) {
      throw new Error(
        'Provider returned an internal error. Common causes: contract revert (e.g., missing election), wrong network, or node/provider issue. ' +
        'Check that the electionId exists and the contract is deployed on the selected network.'
      );
    }
    throw error;
  }
};

export const castVote = async (contract: any, candidateId: number, account: string) => {
  try {
    await contract.methods.vote(candidateId).send({ from: account });
    return true;
  } catch (error) {
    console.error('Error casting vote:', error);
    throw error;
  }
};
