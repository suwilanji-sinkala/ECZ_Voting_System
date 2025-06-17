'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import Link from 'next/link';

type Candidate = {
  name: string;
  party: string;
  age: number;
  experience: string;
  policies: string;
  quote: string;
  image: string;
};

type Position = 'president' | 'mp' | 'mayor' | 'councilor';

export default function VoterPage() {
  const [currentPosition, setCurrentPosition] = useState<Position>('president');
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<Record<Position, string>>({
    president: '',
    mp: '',
    mayor: '',
    councilor: ''
  });
  const progressBarRef = useRef<HTMLDivElement>(null);
  const rotationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const candidates: Record<Position, Candidate> = {
    president: {
      name: 'Hakainde Hichilema',
      party: 'United Party for National Development',
      age: 61,
      experience: 'Businessman, Former Opposition Leader',
      policies: 'Economic revival, Job creation, Anti-corruption',
      quote: '"Zambia must work for all its citizens."',
      image: '/images3.jpeg'
    },
    mp: {
      name: 'Mutale Nalumango',
      party: 'United Party for National Development',
      age: 65,
      experience: 'Teacher, Former Deputy Speaker',
      policies: 'Education reform, Constituency development',
      quote: '"Service to the people is my priority."',
      image: '/image4.webp'
    },
    mayor: {
      name: 'Chilando Chitangala',
      party: 'Patriotic Front',
      age: 42,
      experience: 'Businesswoman, Councilor',
      policies: 'Urban development, Service delivery',
      quote: '"A cleaner, more organized Lusaka is possible."',
      image: '/images5.jpeg'
    },
    councilor: {
      name: 'Precious Nkandu',
      party: 'Socialist Party',
      age: 38,
      experience: 'Community activist',
      policies: 'Local services, Youth empowerment',
      quote: '"Real change starts in our wards."',
      image: '/image6.jpeg'
    }
  };

  const positions: Position[] = ['president', 'mp', 'mayor', 'councilor'];

  const showPosition = (position: Position) => {
    setCurrentPosition(position);
    if (isAutoRotating) {
      resetProgressBar();
    }
  };

  const rotateToNextPosition = () => {
    const currentIndex = positions.indexOf(currentPosition);
    const nextIndex = (currentIndex + 1) % positions.length;
    setCurrentPosition(positions[nextIndex]);
  };

  const resetProgressBar = () => {
    const progressBar = progressBarRef.current;
    if (!progressBar) return;
    
    progressBar.style.animation = 'none';
    void progressBar.offsetWidth;
    progressBar.style.animation = 'progress 8s linear forwards';
    
    const onAnimationEnd = () => {
      progressBar.style.animation = 'none';
      if (isAutoRotating) {
        progressBar.style.animation = 'progress 8s linear forwards';
      }
      progressBar.removeEventListener('animationend', onAnimationEnd);
    };
    
    progressBar.addEventListener('animationend', onAnimationEnd);
  };

  const toggleAutoRotation = () => {
    if (isAutoRotating) {
      stopAutoRotation();
    } else {
      startAutoRotation();
    }
  };

  const startAutoRotation = () => {
    setIsAutoRotating(true);
    if (rotationIntervalRef.current) {
      clearInterval(rotationIntervalRef.current);
    }
    rotationIntervalRef.current = setInterval(rotateToNextPosition, 8000);
    resetProgressBar();
  };

  const stopAutoRotation = () => {
    setIsAutoRotating(false);
    if (rotationIntervalRef.current) {
      clearInterval(rotationIntervalRef.current);
      rotationIntervalRef.current = null;
    }
  };

  const selectCandidate = () => {
    setSelectedCandidates(prev => ({
      ...prev,
      [currentPosition]: candidates[currentPosition].name
    }));
  };

  const submitVote = () => {
    console.log('Votes submitted:', selectedCandidates);
    alert('Thank you for voting! Your selections have been recorded.');
    setSelectedCandidates({
      president: '',
      mp: '',
      mayor: '',
      councilor: ''
    });
  };

  useEffect(() => {
    return () => {
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
      }
    };
  }, []);

  const currentCandidate = candidates[currentPosition];
  const isSelected = selectedCandidates[currentPosition] === currentCandidate.name;
  const allSelected = positions.every((pos: Position) => selectedCandidates[pos] !== '');

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image 
          src="/ECZ_Logo.png" 
          alt="Electoral Commission of Zambia Logo" 
          width={200} 
          height={100} 
          priority
          className={styles.logo}
        />
        <h1 className={styles.title}>ECZ - Online Voting System</h1>
        
        <div className={styles.candidateSection}>
          <h2 className={styles.sectionTitle}>2023 General Election Candidates</h2>
          
          <div className={styles.candidateNavigation}>
            {positions.map((position: Position) => (
              <button
                key={position}
                className={`${styles.navButton} ${
                  currentPosition === position ? styles.active : ''
                } ${selectedCandidates[position] ? styles.selectedPosition : ''}`}
                onClick={() => showPosition(position)}
                aria-label={`Show ${position} candidate`}
              >
                {position.charAt(0).toUpperCase() + position.slice(1)}
                {selectedCandidates[position] && (
                  <span className={styles.selectionIndicator}>✓</span>
                )}
              </button>
            ))}
            <button
              className={`${styles.rotateButton} ${
                isAutoRotating ? styles.rotating : ''
              }`}
              onClick={toggleAutoRotation}
              aria-label={isAutoRotating ? 'Stop rotation' : 'Start rotation'}
            >
              <i className={`bi bi-${isAutoRotating ? 'pause' : 'play'}-fill`}></i>
              {isAutoRotating ? ' Pause' : ' Auto'}
            </button>
          </div>
          
          <div className={`${styles.progressContainer} ${
            isAutoRotating ? '' : styles.hidden
          }`}>
            <div
              className={styles.progressBar}
              ref={progressBarRef}
              aria-hidden="true"
            />
          </div>
          
          <div className={styles.candidateDisplay}>
            <span className={styles.positionTag}>
              {currentPosition.toUpperCase()}
            </span>
            <div className={styles.candidateImageWrapper}>
              <Image
                src={currentCandidate.image}
                alt={`${currentPosition} candidate ${currentCandidate.name}`}
                width={180}
                height={180}
                className={styles.candidateImage}
                priority={currentPosition === 'president'}
              />
            </div>
            <div className={styles.candidateInfo}>
              <div className={styles.candidateHeader}>
                <h3 className={styles.candidateName}>{currentCandidate.name}</h3>
                <p className={styles.candidateParty}>{currentCandidate.party}</p>
              </div>
              <div className={styles.candidateDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Age:</span>
                  <span>{currentCandidate.age}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Experience:</span>
                  <span>{currentCandidate.experience}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Key Policies:</span>
                  <span>{currentCandidate.policies}</span>
                </div>
                <div className={styles.quote}>
                  <span className={styles.quoteLabel}>Quote:</span>
                  <blockquote>{currentCandidate.quote}</blockquote>
                </div>
              </div>
              <div className={styles.candidateActions}>
                <button
                  className={`${styles.voteButton} ${
                    isSelected ? styles.selected : ''
                  }`}
                  onClick={selectCandidate}
                  aria-label={isSelected ? 'Selected' : 'Select candidate'}
                >
                  {isSelected ? (
                    <span className={styles.tickIcon}>✓</span>
                  ) : (
                    'Vote'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.voteSection}>
          {allSelected ? (
            <Link href="/client/vote-select" passHref legacyBehavior>
            <button
              className={styles.submitVoteButton}
              onClick={submitVote}
            >
              SUBMIT VOTE
            </button>
            </Link>
          ) : (
            <button
              className={styles.submitVoteButton}
              disabled
            >
              SUBMIT VOTE
            </button>
          )}
          {!allSelected && (
            <p className={styles.voteMessage}>
              Please select candidates for all positions
            </p>
          )}
        </div>
      </main>
    </div>
  );
}