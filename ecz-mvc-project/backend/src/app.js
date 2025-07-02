const express = require('express');
const app = express();

const candidateRoutes = require('./routes/CandidatesRoute.js');
const constituencyRoutes = require('./routes/ConstituenciesRoute.js');
const districtRoutes = require('./routes/DistrictsRoute.js');
const electionVoterRoutes = require('./routes/ElectionVotersRoute.js');
const electionRoutes = require('./routes/ElectionsRoute.js');
const levelRoutes = require('./routes/LevelsRoute.js');
const partyRoutes = require('./routes/PartiesRoute.js');
const positionRoutes = require('./routes/PositionsRoute.js');
const provinceRoutes = require('./routes/ProvincesRoute.js');
const voteRoutes = require('./routes/VotesRoute.js');
const voterRoutes = require('./routes/VotersRoute.js');
const wardRoutes = require('./routes/WardRoute.js');

app.use(express.json());

app.use('/api/candidates', candidateRoutes);
app.use('/api/constituencies', constituencyRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/election-voters', electionVoterRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/parties', partyRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/provinces', provinceRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/voters', voterRoutes);
app.use('/api/wards', wardRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});