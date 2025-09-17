'use client';

import { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Heading, 
  Text, 
  VStack, 
  Card, 
  CardBody, 
  CardFooter, 
  Spinner,
  SimpleGrid,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge
} from '@chakra-ui/react';
import { connectToContract, getElectionDetailsById, castVote } from '@/app/utils/electionContract';

type Candidate = {
  id: number;
  name: string;
  voteCount: number;
};

type ElectionDetails = {
  name: string;
  description: string;
  candidates: Candidate[];
  candidateCount: number;
};

export default function ElectionPage() {
  const [election, setElection] = useState<ElectionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [account, setAccount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const toast = useToast();
  // TODO: Replace with user selection, route param, or fetched default.
  const DEFAULT_ELECTION_ID = 'ELECTION_1753004099623_38lomugrp';

  useEffect(() => {
    const loadElection = async () => {
      try {
        setLoading(true);
        const { contract, accounts } = await connectToContract();
        setAccount(accounts[0]);
        
        const details = await getElectionDetailsById(contract, DEFAULT_ELECTION_ID);
        // Map to current UI structure (candidates not yet wired on-chain)
        setElection({
          name: details.title,
          description: details.description,
          candidates: [],
          candidateCount: 0,
        });
        
        // Listen for account changes
        if (window.ethereum) {
          window.ethereum.on('accountsChanged', (accounts: string[]) => {
            setAccount(accounts[0]);
            window.location.reload();
          });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load election data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadElection();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  const handleVote = async (candidateId: number) => {
    try {
      setVoting(true);
      const { contract } = await connectToContract();
      await castVote(contract, candidateId, account);
      
      // Refresh election data
      const details = await getElectionDetailsById(contract, DEFAULT_ELECTION_ID);
      setElection({
        name: details.title,
        description: details.description,
        candidates: [],
        candidateCount: 0,
      });
      
      toast({
        title: 'Vote cast successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err: any) {
      console.error('Voting error:', err);
      toast({
        title: 'Error casting vote',
        description: err.message || 'Failed to cast vote',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <Container centerContent py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading election data...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.md" py={10}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Error loading election</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Text mt={2} fontSize="sm">
              Make sure you're connected to the correct network and have MetaMask installed.
            </Text>
          </Box>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="2xl" mb={2}>
            {election?.name || 'Election'}
          </Heading>
          <Text color="gray.600" fontSize="lg">
            {election?.description || 'Cast your vote for your preferred candidate'}
          </Text>
          <Badge colorScheme="green" mt={2}>
            Connected: {`${account?.substring(0, 6)}...${account?.substring(38)}`}
          </Badge>
        </Box>

        <Box>
          <Heading as="h2" size="lg" mb={6}>
            Candidates
          </Heading>
          
          {election?.candidates && election.candidates.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {election.candidates.map((candidate) => (
                <Card key={candidate.id} variant="outline">
                  <CardBody>
                    <Heading size="md" mb={2}>
                      {candidate.name}
                    </Heading>
                    <Text color="gray.600">
                      Votes: <strong>{candidate.voteCount}</strong>
                    </Text>
                  </CardBody>
                  <CardFooter>
                    <Button
                      colorScheme="blue"
                      width="full"
                      onClick={() => handleVote(candidate.id)}
                      isLoading={voting}
                      loadingText="Voting..."
                    >
                      Vote for {candidate.name.split(' ')[0]}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <Text>No candidates available</Text>
          )}
        </Box>

        <Box mt={8} p={4} bg="gray.50" borderRadius="md">
          <Heading size="md" mb={2}>
            About This Election
          </Heading>
          <Text>
            This is a decentralized voting application built on the Ethereum blockchain. 
            Your vote is recorded on the blockchain, ensuring transparency and immutability.
          </Text>
          <Text mt={2} fontSize="sm" color="gray.600">
            Connected with: {account || 'Not connected'}
          </Text>
        </Box>
      </VStack>
    </Container>
  );
}
