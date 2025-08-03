# Election Management System with Blockchain Integration

A comprehensive election management system built with Next.js, Prisma, and Hyperledger Fabric blockchain technology. This system provides secure, transparent, and immutable voting records with location-based voter eligibility.

## Features

### Core Election Management
- **Election Creation & Management**: Create, update, and manage elections with multiple positions
- **Candidate Registration**: Register candidates for specific elections, positions, and wards
- **Voter Registration**: Register voters with location-based eligibility
- **Voting System**: Secure voting with blockchain immutability
- **Results Management**: Real-time and final election results

### Blockchain Integration (Hyperledger Fabric)
- **Immutable Vote Records**: All votes are stored on the blockchain for transparency
- **Smart Contract Logic**: Chaincode handles voting rules and eligibility checks
- **Audit Trail**: Complete history of all voting activities
- **Decentralized Storage**: Distributed ledger ensures data integrity
- **Location-Based Access Control**: Voters can only access elections for their constituency/ward

### Security Features
- **Voter Authentication**: Secure login system
- **Eligibility Verification**: Location-based voting restrictions
- **Duplicate Vote Prevention**: Blockchain ensures one vote per voter per election
- **Data Integrity**: Cryptographic verification of all transactions

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production ready)
- **Blockchain**: Hyperledger Fabric 2.2.12
- **Smart Contracts**: Go chaincode
- **Authentication**: Custom voter authentication system

## Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- Go 1.19+ (for chaincode development)
- Git

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd my-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Set Up Hyperledger Fabric Network

#### Option A: Automated Setup (Recommended)
```bash
# Make setup script executable
chmod +x blockchain/scripts/setup.sh

# Run the setup script
npm run fabric:setup
```

#### Option B: Manual Setup
```bash
# Navigate to blockchain directory
cd blockchain

# Download Fabric binaries
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.2.12 1.4.9

# Generate crypto materials
cryptogen generate --config=./organizations/cryptogen/crypto-config.yaml --output="organizations"

# Generate genesis block
configtxgen -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock ./system-genesis-block/genesis.block

# Start the network
docker-compose -f docker/docker-compose-net.yaml up -d

# Install and deploy chaincode
npm run fabric:deploy
```

### 5. Start the Application
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
my-app/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── blockchain/           # Blockchain integration APIs
│   │   │   ├── vote/             # Blockchain vote submission
│   │   │   └── election/         # Blockchain election management
│   │   ├── elections/            # Election management APIs
│   │   ├── candidates/           # Candidate management APIs
│   │   └── voters/               # Voter management APIs
│   ├── client/                   # Voter-facing pages
│   └── management/               # Admin management pages
├── blockchain/                   # Hyperledger Fabric configuration
│   ├── chaincode/                # Smart contracts (Go)
│   ├── docker/                   # Docker configuration
│   ├── organizations/            # Network organization config
│   └── scripts/                  # Setup and deployment scripts
├── lib/                          # Shared libraries
│   ├── prisma.ts                 # Database client
│   └── fabric-client.ts          # Blockchain client
├── prisma/                       # Database schema and migrations
└── public/                       # Static assets
```

## Blockchain Architecture

### Network Organizations
- **ECZMSP**: Electoral Commission of Zambia organization
- **VoterMSP**: Voter organization for transparency

### Smart Contract Functions
- `SubmitVote`: Submit a vote with eligibility verification
- `CreateElection`: Create a new election on the blockchain
- `RegisterVoter`: Register a voter with location details
- `RegisterCandidate`: Register a candidate for an election
- `GetElectionResults`: Retrieve election results
- `HasVoterVoted`: Check if a voter has already voted
- `IsVoterEligible`: Verify voter eligibility for an election

### Channel Configuration
- **Channel Name**: `electionchannel`
- **Chaincode Name**: `election`
- **Consensus**: Raft (for production) / Solo (for development)

## API Endpoints

### Blockchain Integration
- `POST /api/blockchain/vote` - Submit vote to blockchain
- `GET /api/blockchain/vote` - Check voting status
- `POST /api/blockchain/election` - Create election on blockchain
- `GET /api/blockchain/election` - Get election with blockchain verification

### Traditional APIs
- `GET /api/elections` - Get all elections
- `POST /api/elections` - Create election
- `GET /api/elections/voter-eligible` - Get eligible elections for voter
- `POST /api/vote` - Submit vote (legacy)
- `GET /api/candidate` - Get candidates
- `POST /api/candidate` - Register candidate

## Usage Examples

### Creating an Election
```javascript
const electionData = {
  title: "Presidential Election 2024",
  description: "National presidential election",
  startDate: "2024-08-12T08:00:00Z",
  endDate: "2024-08-12T18:00:00Z",
  status: "draft",
  year: 2024,
  electionType: "general",
  wardCode: "WARD001",
  constituencyCode: "1",
  districtCode: "DIST001",
  positionIds: [1, 2, 3]
};

const response = await fetch('/api/blockchain/election', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(electionData)
});
```

### Submitting a Vote
```javascript
const voteData = {
  voterId: "001W",
  electionId: "1",
  votes: [
    { candidateId: 1, positionId: 1 },
    { candidateId: 5, positionId: 2 }
  ]
};

const response = await fetch('/api/blockchain/vote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(voteData)
});
```

## Blockchain Commands

### Network Management
```bash
# Start the network
npm run fabric:start

# Stop the network
npm run fabric:stop

# Deploy chaincode updates
npm run fabric:deploy
```

### Chaincode Operations
```bash
# Query election results
docker exec cli peer chaincode query -C electionchannel -n election -c '{"Args":["GetElectionResults","ELECTION_1"]}'

# Check voter eligibility
docker exec cli peer chaincode query -C electionchannel -n election -c '{"Args":["IsVoterEligible","001W","ELECTION_1"]}'

# Get vote history
docker exec cli peer chaincode query -C electionchannel -n election -c '{"Args":["GetVoteHistory","001W"]}'
```

## Security Considerations

### Voter Eligibility
- Voters can only access elections for their registered ward/constituency
- General elections are available to all voters
- Location-based restrictions are enforced at both API and blockchain levels

### Vote Integrity
- Each vote is cryptographically signed and stored on the blockchain
- Duplicate voting is prevented through blockchain consensus
- Vote history is immutable and auditable

### Network Security
- TLS encryption for all network communications
- Certificate-based authentication for all network participants
- Role-based access control through MSP (Membership Service Provider)

## Development

### Adding New Chaincode Functions
1. Modify `blockchain/chaincode/election-chaincode.go`
2. Update the Fabric client in `lib/fabric-client.ts`
3. Create corresponding API endpoints
4. Deploy updated chaincode: `npm run fabric:deploy`

### Database Schema Changes
1. Update `prisma/schema.prisma`
2. Generate new client: `npx prisma generate`
3. Apply migrations: `npx prisma db push`

### Testing
```bash
# Run unit tests
npm test

# Test blockchain functions
npm run fabric:test

# Test API endpoints
npm run test:api
```

## Deployment

### Production Setup
1. Configure production database (PostgreSQL)
2. Set up production Fabric network with proper TLS certificates
3. Configure environment variables
4. Deploy using Docker or cloud platform

### Environment Variables
```env
DATABASE_URL="postgresql://user:password@localhost:5432/election_db"
FABRIC_NETWORK_CONFIG_PATH="/path/to/connection-profile.json"
FABRIC_WALLET_PATH="/path/to/wallet"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `/docs` folder

## Roadmap

- [ ] Multi-language support
- [ ] Mobile application
- [ ] Advanced analytics dashboard
- [ ] Integration with government ID systems
- [ ] Real-time result broadcasting
- [ ] Advanced blockchain features (private channels, asset transfer)
