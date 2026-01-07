"use client";

import { useState, useCallback, useEffect } from "react";

export type Genre = "fantasy" | "scifi" | "mystery" | "apocalyptic";

export interface GameState {
  steps: number;
  round: number;
  genre: Genre;
  totalStepsUsed: number;
}

export interface Challenge {
  story: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  funFact: string;
  isClose: (selectedIndex: number) => boolean;
}

export interface Resolution {
  wasCorrect: boolean;
  wasClose: boolean;
  stepsDeducted: number;
  explanation: string;
  funFact: string;
}

// Pre-generated "AI" content for each genre
const genreContent: Record<Genre, {
  openingStory: string;
  endings: string[];
  archetypes: { name: string; description: string }[];
}> = {
  fantasy: {
    openingStory: "You stand at the entrance of the ancient Crystal Caverns, where legends speak of the Heart of Eternity—a gem said to grant wishes beyond mortal comprehension. The cave glows with an ethereal blue light, and you can hear distant whispers of ancient magic. Your quest has only just begun, brave adventurer. But beware: the cavern tests not just your strength, but your wisdom.",
    endings: [
      "With the Heart of Eternity in hand, you emerge from the cavern as a legend. Songs are sung of your wisdom, and future generations shall speak of the hero who conquered the Crystal Caverns through cleverness rather than mere strength.",
      "Though you did not claim the Heart of Eternity, the ancient mages of the cavern recognized your wit and granted you a fraction of its power. You return to your village as a learned sorcerer, ready to protect your people with newfound magic.",
      "The cavern's final test revealed your true nature. You chose wisdom over greed, and the Crystal Caverns themselves bowed to your virtue. You become the Guardian of the Deep, keeper of ancient secrets."
    ],
    archetypes: [
      { name: "The Clever Strategist", description: "You solved challenges with wisdom rather than brute force." },
      { name: "The Bold Guesser", description: "You trusted your instincts and took calculated risks." },
      { name: "The Patient Sage", description: "You approached each challenge with careful deliberation." }
    ]
  },
  scifi: {
    openingStory: "You're the pilot of the Starship Odyssey, drifting near the mysterious Nebula X-7. Your ship's AI has detected an alien artifact emitting impossible energy signatures. The Federation sent you here because you're their best—and your ship's systems need recalibration using estimation skills that could determine whether you can safely approach the anomaly.",
    endings: [
      "You successfully extracted the alien technology, revolutionizing Federation science. Your name is etched in the Hall of Explorers, and future ships will bear the Odyssey-class designation in your honor.",
      "The artifact's data downloaded to your ship's computer, but you chose not to approach dangerously. The Federation commends your prudent judgment—you've provided invaluable data while keeping your crew safe.",
      "Your careful approach revealed the artifact to be a message from an ancient civilization. You become the first human to make contact with alien wisdom, thanks to your measured exploration."
    ],
    archetypes: [
      { name: "The Intuitive Pilot", description: "You trusted your cosmic instincts to navigate the unknown." },
      { name: "The Precise Navigator", description: "Your calculations were always remarkably accurate." },
      { name: "The Cautious Explorer", description: "You balanced curiosity with survival wisdom." }
    ]
  },
  mystery: {
    openingStory: "Detective, you've been called to Blackwood Manor. Lord Blackwood has been found unconscious in his study, and a peculiar antidote was found in his hand. The toxin was fast-acting, and only someone with keen observational skills can piece together what happened. The clock is ticking—the butler said the antidote only lasts 1,000 seconds before it's too late.",
    endings: [
      "You solved the case before time ran out! Lord Blackwood awakens and, impressed by your deductive skills, makes you the head of the Blackwood Investigations Unit. Justice has been served, detective.",
      "You identified the culprit in time to save Lord Blackwood, though the case had more twists than expected. The newspapers call you 'The Clockwork Detective' for your ability to work under pressure.",
      "The case solved, you reflect that the truth was stranger than fiction. Your reputation as the sharpest detective in the city is now secured, and criminals everywhere sleep less easily."
    ],
    archetypes: [
      { name: "The Master Deducer", description: "Your logic cut through lies like a knife through silk." },
      { name: "The Quick Thinker", description: "You worked fast when every second mattered." },
      { name: "The Thorough Investigator", description: "You left no stone unturned in your pursuit of truth." }
    ]
  },
  apocalyptic: {
    openingStory: "Year 2, Day 476. You've found shelter in an abandoned research bunker. Your Geiger counter shows radiation levels spiking outside. The bunker's filtration system needs calibration—you have 1,000 seconds before the next wave of radiation hits. You need to estimate dosages, distances, and survival probabilities using only your wits and limited supplies.",
    endings: [
      "You calibrated the filtration system just in time. The bunker is safe, and you've secured enough supplies to survive the next decade. In this new world, you've proven yourself a true survivor.",
      "Though the filtration system has minor issues, you've learned to adapt. Your reputation as a resourceful survivor spreads across the wasteland, and others seek your guidance.",
      "Your careful calculations revealed that the bunker has a hidden second level with preserved supplies. You didn't just survive—you thrived, thanks to your numerical intuition."
    ],
    archetypes: [
      { name: "The Resourceful Survivor", description: "You made every resource count in the harsh new world." },
      { name: "The Calculated Risk-Taker", description: "You knew when to push forward and when to hold back." },
      { name: "The Pragmatic Optimist", description: "You found hope in numbers and survival in wisdom." }
    ]
  }
};

// KiloGuess challenges for each genre
const generateChallenge = (genre: Genre, round: number): Challenge => {
  const challenges: Record<number, Challenge> = {
    1: {
      story: genreContent[genre].openingStory.split(".").slice(0, 2).join(".") + ".",
      question: "Roughly how long is 1,000 seconds?",
      options: [
        "About 5 minutes",
        "About 17 minutes",
        "About an hour",
        "About 3 hours"
      ],
      correctIndex: 1, // 1000/60 ≈ 16.67 minutes
      explanation: "1000 seconds divided by 60 gives approximately 16.67 minutes.",
      funFact: "The average pop song is about 3-4 minutes long, so 1,000 seconds is roughly 4 songs!",
      isClose: (i) => i === 0 || i === 2 // 5 or 17 min are close
    },
    2: {
      story: "You press forward deeper into the unknown. The path ahead forks into three directions. Each seems to hold its own secrets, but only one leads closer to your goal.",
      question: "If you stack 1,000 coins (like quarters), how tall would the stack be?",
      options: [
        "About as tall as a coffee mug",
        "About as tall as a adult person",
        "About as tall as a two-story house",
        "About as tall as the Eiffel Tower"
      ],
      correctIndex: 1, // ~1.75mm × 1000 = ~1.75 meters = adult height
      explanation: "A quarter is about 1.75mm thick. 1000 × 1.75mm = 1,750mm or about 1.75 meters—roughly the height of an adult.",
      funFact: "If you stacked 1,000,000 quarters, you'd have a tower about 1.75 km tall—taller than most mountains!",
      isClose: (i) => i === 0 || i === 2
    },
    3: {
      story: "A challenge appears before you. The ancient ones left this test to prove one's worthiness. Answer wisely, for the cost of failure is steep.",
      question: "1,000 lines of code is roughly how many pages?",
      options: [
        "About 2-3 pages",
        "About 10-15 pages",
        "About 50-60 pages",
        "About 200+ pages"
      ],
      correctIndex: 1, // ~30-50 lines per page, so 1000 lines ≈ 20-33 pages
      explanation: "With typical code formatting (30-50 lines per page), 1,000 lines fill roughly 20-33 pages.",
      funFact: "The original Pac-Man game had about 3,000 lines of code—a 'tiny' game by today's standards!",
      isClose: (i) => i === 2 // 50-60 pages is somewhat close
    },
    4: {
      story: "The trial intensifies. Your mind must remain sharp, for the shadows of doubt creep ever closer with each passing moment.",
      question: "Roughly how far would you walk in 1,000 steps?",
      options: [
        "About the length of a school bus",
        "About the length of a basketball court",
        "About the length of a soccer field",
        "About the length of a marathon"
      ],
      correctIndex: 1, // ~0.75m per step = 750m = basketball court (28m) × 27 = close to soccer field (105m) but 750m is closer to 7-8 basketball courts
      explanation: "An average step is about 0.75 meters. 1,000 × 0.75m = 750 meters—roughly the length of 7-8 basketball courts!",
      funFact: "A marathon is 42,195 meters, so you'd need about 56,000 steps to complete one!",
      isClose: (i) => i === 2 // soccer field is closer than basketball court to 750m
    },
    5: {
      story: "Your final challenge awaits. The ancient guardians watch, waiting to see if you truly possess the wisdom to complete your quest.",
      question: "If you read 1,000 words per minute, how long would it take to read a typical novel (80,000 words)?",
      options: [
        "About 10 minutes",
        "About 80 minutes (1.5 hours)",
        "About 800 minutes (13+ hours)",
        "About 8,000 minutes (5+ days)"
      ],
      correctIndex: 2, // 80,000 / 1000 = 80 minutes
      explanation: "80,000 words ÷ 1,000 words/minute = 80 minutes (1 hour and 20 minutes).",
      funFact: "The longest novel ever published, 'In Search of Lost Time,' has about 1.2 million words—it would take 20 hours to read at 1,000 wpm!",
      isClose: (i) => i === 1 // 80 minutes is close to correct
    }
  };

  // For rounds beyond 5, cycle through with variations
  if (round > 5) {
    const cycleRound = ((round - 1) % 5) + 1;
    const base = challenges[cycleRound];
    return {
      ...base,
      story: `Round ${round}: Your journey continues. The challenges grow more complex, but your wisdom has grown stronger.`
    };
  }

  return challenges[round];
};

const stepsDeduction = {
  correct: 10,
  close: 25,
  wrong: 50
};

// Animated steps display component
function AnimatedSteps({ 
  steps, 
  previousSteps,
  isLow 
}: { 
  steps: number; 
  previousSteps: number;
  isLow: boolean 
}) {
  const [displaySteps, setDisplaySteps] = useState(steps);

  useEffect(() => {
    if (steps !== previousSteps) {
      // Animate counting down
      const duration = 500;
      const stepsPerFrame = Math.ceil(Math.abs(previousSteps - steps) / (duration / 16));
      
      let current = previousSteps;
      const timer = setInterval(() => {
        current = current + (steps > previousSteps ? stepsPerFrame : -stepsPerFrame);
        
        if ((steps > previousSteps && current >= steps) || (steps < previousSteps && current <= steps)) {
          current = steps;
          clearInterval(timer);
        }
        setDisplaySteps(current);
      }, 16);

      return () => clearInterval(timer);
    }
  }, [steps, previousSteps]);

  return (
    <p className={`text-4xl md:text-5xl font-black transition-all duration-300 ${
      isLow 
        ? "text-red-400 scale-110 animate-pulse" 
        : "text-white"
    }`}>
      {displaySteps.toLocaleString()}
    </p>
  );
}

// Progress bar component
function StepsProgressBar({ steps, maxSteps = 1000 }: { steps: number; maxSteps?: number }) {
  const percentage = Math.max(0, (steps / maxSteps) * 100);
  
  return (
    <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
      <div 
        className={`h-full transition-all duration-500 ease-out rounded-full ${
          percentage > 50 ? "bg-gradient-to-r from-green-400 to-emerald-400" :
          percentage > 25 ? "bg-gradient-to-r from-yellow-400 to-orange-400" :
          "bg-gradient-to-r from-red-400 to-pink-500 animate-pulse"
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export default function KiloQuestGame() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [showEnding, setShowEnding] = useState(false);
  const [previousSteps, setPreviousSteps] = useState(1000);
  const [isAnswering, setIsAnswering] = useState(false);

  const startGame = useCallback((genre: Genre) => {
    setSelectedGenre(genre);
    setGameState({
      steps: 1000,
      round: 1,
      genre,
      totalStepsUsed: 0
    });
    setCurrentChallenge(generateChallenge(genre, 1));
    setResolution(null);
    setShowEnding(false);
    setPreviousSteps(1000);
    setIsAnswering(false);
  }, []);

  const handleAnswer = useCallback((selectedIndex: number) => {
    if (!gameState || !currentChallenge || isAnswering) return;

    setIsAnswering(true);
    setPreviousSteps(gameState.steps);

    const isCorrect = selectedIndex === currentChallenge.correctIndex;
    const isClose = currentChallenge.isClose(selectedIndex) && !isCorrect;

    const deduction = isCorrect ? stepsDeduction.correct : 
                      isClose ? stepsDeduction.close : 
                      stepsDeduction.wrong;

    const newSteps = gameState.steps - deduction;

    // Small delay for animation
    setTimeout(() => {
      setGameState(prev => prev ? ({
        ...prev,
        steps: newSteps,
        totalStepsUsed: prev.totalStepsUsed + deduction
      }) : null);

      setResolution({
        wasCorrect: isCorrect,
        wasClose: isClose,
        stepsDeducted: deduction,
        explanation: currentChallenge.explanation,
        funFact: currentChallenge.funFact
      });

      setIsAnswering(false);

      if (newSteps <= 0) {
        setShowEnding(true);
      }
    }, 300);
  }, [gameState, currentChallenge, isAnswering]);

  const continueGame = useCallback(() => {
    if (!gameState || !selectedGenre) return;

    const nextRound = gameState.round + 1;
    setGameState(prev => prev ? ({ ...prev, round: nextRound }) : null);
    setCurrentChallenge(generateChallenge(selectedGenre, nextRound));
    setResolution(null);
  }, [gameState, selectedGenre]);

  const restartGame = useCallback(() => {
    setGameState(null);
    setCurrentChallenge(null);
    setResolution(null);
    setSelectedGenre(null);
    setShowEnding(false);
    setPreviousSteps(1000);
    setIsAnswering(false);
  }, []);

  // Start Screen
  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="max-w-2xl w-full relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight animate-bounce">
              KiloQuest
            </h1>
            <p className="text-xl md:text-2xl text-purple-200 font-light">
              KiloGuess Edition
            </p>
            <p className="mt-6 text-lg text-purple-300/80 italic">
              &quot;You have 1,000 steps. Knowledge is survival.&quot;
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Choose Your Genre
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-8">
              {[
                { id: "fantasy", emoji: "🐉", name: "Fantasy", color: "from-yellow-500 to-orange-500" },
                { id: "scifi", emoji: "🚀", name: "Sci-Fi", color: "from-blue-500 to-cyan-500" },
                { id: "mystery", emoji: "🔍", name: "Mystery", color: "from-purple-500 to-pink-500" },
                { id: "apocalyptic", emoji: "☢️", name: "Post-Apocalyptic", color: "from-red-500 to-orange-600" }
              ].map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => startGame(genre.id as Genre)}
                  className={`p-6 rounded-2xl bg-gradient-to-br ${genre.color} hover:scale-105 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 shadow-lg group`}
                >
                  <span className="text-4xl block mb-2 group-hover:scale-125 transition-transform duration-300">
                    {genre.emoji}
                  </span>
                  <span className="text-white font-bold text-lg">{genre.name}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => startGame("fantasy")}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-xl rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95"
            >
              Start Adventure
            </button>
          </div>

          <p className="text-center text-purple-400/60 mt-8 text-sm">
            Test your estimation skills to survive the journey!
          </p>
        </div>
      </div>
    );
  }

  // Ending Screen
  if (showEnding) {
    const endingIndex = Math.min(Math.floor(gameState.totalStepsUsed / 200), genreContent[gameState.genre].endings.length - 1);
    const archetypeIndex = Math.min(Math.floor(gameState.totalStepsUsed / 300), genreContent[gameState.genre].archetypes.length - 1);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
        {/* Celebration particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-yellow-400 rounded-full animate-bounce" />
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-300" />
          <div className="absolute bottom-1/4 left-1/3 w-5 h-5 bg-purple-400 rounded-full animate-bounce delay-500" />
        </div>

        <div className="max-w-2xl w-full relative z-10">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 text-center shadow-2xl">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 animate-pulse">
              Adventure Complete
            </h1>

            <div className="mb-8">
              <p className="text-purple-200 text-xl mb-4">
                {genreContent[gameState.genre].endings[endingIndex]}
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 mb-8 transform hover:scale-105 transition-transform duration-300">
              <p className="text-purple-200 mb-2">You survived</p>
              <p className="text-6xl font-black text-white animate-bounce">
                {gameState.totalStepsUsed} steps
              </p>
            </div>

            <div className="mb-8">
              <p className="text-purple-200 mb-2">Your Archetype</p>
              <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 animate-pulse">
                {genreContent[gameState.genre].archetypes[archetypeIndex].name}
              </p>
              <p className="text-purple-300/70 mt-2">
                {genreContent[gameState.genre].archetypes[archetypeIndex].description}
              </p>
            </div>

            <button
              onClick={restartGame}
              className="py-4 px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-xl rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Resolution Screen
  if (resolution) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
        <div className="max-w-2xl w-full">
          <div className={`backdrop-blur-lg rounded-3xl p-8 border-2 text-center transform animate-in slide-in-from-bottom-4 fade-in duration-500 ${
            resolution.wasCorrect ? "bg-green-500/20 border-green-400" :
            resolution.wasClose ? "bg-yellow-500/20 border-yellow-400" :
            "bg-red-500/20 border-red-400"
          }`}>
            <div className="text-7xl mb-4 animate-bounce">
              {resolution.wasCorrect ? "🎉" : resolution.wasClose ? "🤔" : "❌"}
            </div>
            
            <h2 className={`text-3xl font-bold mb-2 ${
              resolution.wasCorrect ? "text-green-400" :
              resolution.wasClose ? "text-yellow-400" :
              "text-red-400"
            }`}>
              {resolution.wasCorrect ? "Correct!" : resolution.wasClose ? "Close Enough!" : "Wrong"}
            </h2>

            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white/10 rounded-full">
              <span className="text-purple-300">Steps deducted:</span>
              <span className={`text-2xl font-bold ${
                resolution.wasCorrect ? "text-green-400" :
                resolution.wasClose ? "text-yellow-400" :
                "text-red-400"
              } animate-pulse`}>
                -{resolution.stepsDeducted}
              </span>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 mb-6 text-left">
              <p className="text-purple-200 mb-4">{resolution.explanation}</p>
              <div className="border-t border-white/20 pt-4 mt-4">
                <p className="text-purple-300 font-semibold mb-1 flex items-center gap-2">
                  <span className="animate-pulse">💡</span> Fun Fact
                </p>
                <p className="text-purple-300/80">{resolution.funFact}</p>
              </div>
            </div>

            <button
              onClick={continueGame}
              className="py-4 px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-xl rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95"
            >
              Continue Adventure
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-700" />
      </div>

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-4 text-center relative z-10">
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight animate-pulse">
          KiloQuest
        </h1>
      </div>

      {/* Top Bar */}
      <div className="max-w-4xl mx-auto mb-4 relative z-10">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-xl">
          {/* Progress Bar */}
          <div className="mb-3">
            <StepsProgressBar steps={gameState.steps} />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-purple-300 text-sm uppercase tracking-wider">Steps Left</p>
              <AnimatedSteps 
                steps={gameState.steps} 
                previousSteps={previousSteps}
                isLow={gameState.steps <= 100}
              />
            </div>
            <div className="text-center flex-1">
              <p className="text-purple-300 text-sm uppercase tracking-wider">Round</p>
              <p className="text-3xl font-bold text-white">{gameState.round}</p>
            </div>
            <div className="text-center flex-1 hidden md:block">
              <p className="text-purple-300 text-sm uppercase tracking-wider">Steps Used</p>
              <p className="text-2xl font-bold text-purple-200">{gameState.totalStepsUsed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Story Panel */}
      <div className="max-w-4xl mx-auto mb-4 relative z-10">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-white/20 shadow-xl animate-in slide-in-from-left-4 fade-in duration-500">
          <div className="flex items-start gap-4">
            <span className="text-3xl animate-bounce">📖</span>
            <div>
              <p className="text-purple-100 text-lg md:text-xl leading-relaxed">
                {currentChallenge?.story}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Panel */}
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-purple-400/30 shadow-xl animate-in slide-in-from-right-4 fade-in duration-500">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl animate-pulse">🎯</span>
            <h2 className="text-2xl font-bold text-white">KiloGuess Challenge</h2>
          </div>

          <p className="text-xl text-purple-200 mb-6">
            {currentChallenge?.question}
          </p>

          <div className="space-y-3">
            {currentChallenge?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={isAnswering}
                className={`w-full p-4 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-purple-400 rounded-xl text-left transition-all duration-300 group transform hover:scale-[1.02] active:scale-95 ${
                  isAnswering ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <span className="inline-block w-8 h-8 bg-purple-500/30 rounded-lg text-center leading-8 mr-3 font-bold text-purple-200 group-hover:bg-purple-500/50 group-hover:scale-110 transition-all duration-300">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-white text-lg">{option}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex justify-between text-sm text-purple-300/60">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Correct: -10
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-200" />
              Close: -25
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse delay-500" />
              Wrong: -50
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
