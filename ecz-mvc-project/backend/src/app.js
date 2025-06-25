const express = require('express');
const app = express();

const candidateRoutes = require('./routes/candidateRoutes');
const constituencyRoutes = require('./routes/constituencyRoutes');
const districtRoutes = require('./routes/districtRoutes');
const electionVoterRoutes = require('./routes/electionVoterRoutes');
const electionRoutes = require('./routes/electionRoutes');
const levelRoutes = require('./routes/levelRoutes');
const partyRoutes = require('./routes/partyRoutes');
const positionRoutes = require('./routes/positionRoutes');
const provinceRoutes = require('./routes/provinceRoutes');
const voteRoutes = require('./routes/voteRoutes');
const voterRoutes = require('./routes/voterRoutes');
const wardRoutes = require('./routes/wardRoutes');

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