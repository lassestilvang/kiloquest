"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";

export type Genre = "fantasy" | "scifi" | "mystery" | "apocalyptic";

export type QuestionCategory = "scale" | "conceptual" | "kilo_feature";

export interface GameState {
  steps: number;
  round: number;
  genre: Genre;
  totalStepsUsed: number;
  correctCount: number;
  closeCount: number;
  wrongCount: number;
  challengeOrder: number[]; // Shuffled order of challenge indices (1-5)
  startTime?: number; // Timestamp when game started
}

export interface Challenge {
  story: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  funFact: string;
  category: QuestionCategory;
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
const genreContent: Record<
  Genre,
  {
    openingStory: string;
    endings: string[];
    statsLabels: { correct: string; close: string; wrong: string };
    archetypes: { name: string; tagline: string; description: string }[];
    finalMessage: string;
  }
> = {
  fantasy: {
    openingStory:
      "You stand at the entrance of the ancient Crystal Caverns, where legends speak of the Heart of Eternity—a gem said to grant wishes beyond mortal comprehension. The cave glows with an ethereal blue light, and you can hear distant whispers of ancient magic. Your quest has only just begun, brave adventurer. But beware: the cavern tests not just your strength, but your wisdom.",
    endings: [
      "With the Heart of Eternity in hand, you emerge from the cavern as a legend. Songs are sung of your wisdom, and future generations shall speak of the hero who conquered the Crystal Caverns through cleverness rather than mere strength.",
      "Though you did not claim the Heart of Eternity, the ancient mages of the cavern recognized your wit and granted you a fraction of its power. You return to your village as a learned sorcerer, ready to protect your people with newfound magic.",
      "The cavern's final test revealed your true nature. You chose wisdom over greed, and the Crystal Caverns themselves bowed to your virtue. You become the Guardian of the Deep, keeper of ancient secrets.",
    ],
    statsLabels: {
      correct: "Spells Mastered",
      close: "Illusions Seen",
      wrong: "Traps Triggered",
    },
    archetypes: [
      {
        name: "The Kilo Archmage",
        tagline: "A thousand truths revealed",
        description:
          "Your estimation magic is unmatched. You calculated your way through every puzzle the Crystal Caverns threw at you.",
      },
      {
        name: "The Kilo Trickster",
        tagline: "A thousand paths traversed",
        description:
          "Quick wits and quicker guesses. You navigated the cavern's tricks with cunning and courage.",
      },
      {
        name: "The Kilo Apprentice",
        tagline: "A thousand lessons learned",
        description:
          "Every wrong turn taught you something. Your journey has only just begun, but your potential is limitless.",
      },
    ],
    finalMessage: "May your estimates always be true, hero.",
  },
  scifi: {
    openingStory:
      "You're the pilot of the Starship Odyssey, drifting near the mysterious Nebula X-7. Your ship's AI has detected an alien artifact emitting impossible energy signatures. The Federation sent you here because you're their best—and your ship's systems need recalibration using estimation skills that could determine whether you can safely approach the anomaly.",
    endings: [
      "You successfully extracted the alien technology, revolutionizing Federation science. Your name is etched in the Hall of Explorers, and future ships will bear the Odyssey-class designation in your honor.",
      "The artifact's data downloaded to your ship's computer, but you chose not to approach dangerously. The Federation commends your prudent judgment—you've provided invaluable data while keeping your crew safe.",
      "Your careful approach revealed the artifact to be a message from an ancient civilization. You become the first human to make contact with alien wisdom, thanks to your measured exploration.",
    ],
    statsLabels: {
      correct: "Calculations Perfect",
      close: "Readings Verified",
      wrong: "Anomalies Detected",
    },
    archetypes: [
      {
        name: "The Kilo Navigator",
        tagline: "A thousand light-years bridged",
        description:
          "Your precision in the void is legendary. Every measurement, every calculation brought you closer to the stars.",
      },
      {
        name: "The Kilo Pioneer",
        tagline: "A thousand frontiers crossed",
        description:
          "Bold decisions and brave estimations. You charted unknown territories with nothing but your wits.",
      },
      {
        name: "The Kilo Cadet",
        tagline: "A thousand simulations run",
        description:
          "Your training has paid off. The Academy would be proud of your performance in the field.",
      },
    ],
    finalMessage: "Engage hyperdrive, Commander. The universe awaits.",
  },
  mystery: {
    openingStory:
      "Detective, you've been called to Blackwood Manor. Lord Blackwood has been found unconscious in his study, and a peculiar antidote was found in his hand. The toxin was fast-acting, and only someone with keen observational skills can piece together what happened. The clock is ticking—the butler said the antidote only lasts 1,000 seconds before it's too late.",
    endings: [
      "You solved the case before time ran out! Lord Blackwood awakens and, impressed by your deductive skills, makes you the head of the Blackwood Investigations Unit. Justice has been served, detective.",
      "You identified the culprit in time to save Lord Blackwood, though the case had more twists than expected. The newspapers call you 'The Clockwork Detective' for your ability to work under pressure.",
      "The case solved, you reflect that the truth was stranger than fiction. Your reputation as the sharpest detective in the city is now secured, and criminals everywhere sleep less easily.",
    ],
    statsLabels: {
      correct: "Cases Cracked",
      close: "Leads Followed",
      wrong: "Red Herrings",
    },
    archetypes: [
      {
        name: "The Kilo Mastermind",
        tagline: "A thousand clues connected",
        description:
          "No riddle could withstand your scrutiny. Every piece fell into place under your brilliant deduction.",
      },
      {
        name: "The Kilo Sleuth",
        tagline: "A thousand suspects interviewed",
        description:
          "Your instincts are razor-sharp. You cut through deception to find the truth beneath.",
      },
      {
        name: "The Kilo Rookie",
        tagline: "A thousand files reviewed",
        description:
          "Every investigation starts somewhere. Your first case showed promise that could become legendary.",
      },
    ],
    finalMessage: "The city sleeps safer tonight, Detective.",
  },
  apocalyptic: {
    openingStory:
      "Year 2, Day 476. You've found shelter in an abandoned research bunker. Your Geiger counter shows radiation levels spiking outside. The bunker's filtration system needs calibration—you have 1,000 seconds before the next wave of radiation hits. You need to estimate dosages, distances, and survival probabilities using only your wits and limited supplies.",
    endings: [
      "You calibrated the filtration system just in time. The bunker is safe, and you've secured enough supplies to survive the next decade. In this new world, you've proven yourself a true survivor.",
      "Though the filtration system has minor issues, you've learned to adapt. Your reputation as a resourceful survivor spreads across the wasteland, and others seek your guidance.",
      "Your careful calculations revealed that the bunker has a hidden second level with preserved supplies. You didn't just survive—you thrived, thanks to your numerical intuition.",
    ],
    statsLabels: {
      correct: "Survival Calculated",
      close: "Risks Assessed",
      wrong: "Supplies Lost",
    },
    archetypes: [
      {
        name: "The Kilo Survivor",
        tagline: "A thousand days endured",
        description:
          "Every calculation kept you alive. Your analytical mind is the reason you still draw breath in this harsh world.",
      },
      {
        name: "The Kilo Scavenger",
        tagline: "A thousand miles trekked",
        description:
          "Resources are scarce, but your estimations ensure nothing goes to waste. You're a legend in the wasteland.",
      },
      {
        name: "The Kilo Dreamer",
        tagline: "A thousand hopes kept alive",
        description:
          "Even in darkness, you see possibilities. Your optimism is as valuable as any skill.",
      },
    ],
    finalMessage: "The wasteland remembers your name.",
  },
};



// Kilo feature questions - at least 1 in every 3 should be a Kilo feature question
const KILO_FEATURE_QUESTIONS: Challenge[] = [
  {
    story:
      "You discover a Kilo-powered terminal glowing with blue light. A holographic guide appears, offering wisdom about the platform's capabilities.",
    question:
      "What is Kilo's App Builder primarily designed to help developers do?",
    options: [
      "Write complex algorithms from scratch",
      "Create full-stack web and mobile applications without extensive coding",
      "Manage database migrations manually",
      "Deploy raw server infrastructure",
    ],
    correctIndex: 1,
    explanation:
      "Kilo's App Builder helps developers create full-stack applications with minimal manual coding, handling much of the boilerplate automatically.",
    funFact:
      "App Builder can generate complete application scaffolds in seconds, handling both frontend and backend components.",
    isClose: (i) => i === 0,
    category: "kilo_feature",
  },
  {
    story:
      "A sleek Kilo interface displays the Cloud Agents panel. The agents are humming with activity, each handling different tasks autonomously.",
    question: "Which best describes what Kilo's Cloud Agents provide?",
    options: [
      "Physical server maintenance",
      "Autonomous AI-powered tasks that handle complex workflows without constant supervision",
      "Manual code review services",
      "Hardware rental services",
    ],
    correctIndex: 1,
    explanation:
      "Cloud Agents are AI-powered autonomous workers that can manage complex tasks and workflows independently.",
    funFact:
      "Cloud Agents can handle everything from data processing to customer support automation without human intervention.",
    isClose: (i) => i === 0,
    category: "kilo_feature",
  },
  {
    story:
      "You find a Kilo dashboard showing Managed Indexing. Vectors are being organized automatically, optimizing search and retrieval.",
    question: "What problem does Kilo's Managed Indexing solve for developers?",
    options: [
      "Manually configuring server clusters",
      "Automatically organizing and optimizing vector databases for efficient AI retrieval",
      "Writing SQL queries by hand",
      "Managing DNS settings",
    ],
    correctIndex: 1,
    explanation:
      "Managed Indexing automates the complex task of organizing vector data for optimal AI-powered search and retrieval.",
    funFact:
      "With Managed Indexing, you can set up enterprise-grade vector search in minutes instead of weeks.",
    isClose: (i) => i === 0,
    category: "kilo_feature",
  },
  {
    story:
      "The Kilo deployment panel shows a single button glowing with potential. One click and entire applications go live.",
    question: "What is the main benefit of Kilo's one-click deploy feature?",
    options: [
      "Reducing deployment to a single mouse click, eliminating complex configuration",
      "Automatically writing all your code",
      "Replacing your entire development team",
      "Eliminating the need for testing",
    ],
    correctIndex: 0,
    explanation:
      "One-click deploy dramatically simplifies the deployment process, turning complex multi-step deployments into a single action.",
    funFact:
      "What traditionally takes hours of DevOps work can be accomplished with a single button press.",
    isClose: (i) => i === 1,
    category: "kilo_feature",
  },
  {
    story:
      "You access the Kilo coding environment. AI assistance is everywhere, suggesting improvements and catching bugs in real-time.",
    question: "How does AI-assisted coding in Kilo help developers?",
    options: [
      "Replacing developers entirely",
      "Providing intelligent suggestions, code completion, and bug detection while you code",
      "Automatically deleting problematic code",
      "Writing documentation only",
    ],
    correctIndex: 1,
    explanation:
      "AI-assisted coding augments developers with smart suggestions, autocompletion, and real-time error detection.",
    funFact:
      "AI-assisted coding can increase developer productivity by 2-3x by handling repetitive patterns and catching errors early.",
    isClose: (i) => i === 0,
    category: "kilo_feature",
  },
  {
    story:
      "A Kilo wizard appears, offering to test your understanding of the platform's ecosystem.",
    question:
      "Which of the following best describes Kilo's overall platform approach?",
    options: [
      "A comprehensive AI development platform combining app building, autonomous agents, and intelligent deployment",
      "A simple code editor with basic syntax highlighting",
      "A hardware manufacturing service",
      "A social network for developers",
    ],
    correctIndex: 0,
    explanation:
      "Kilo provides an integrated platform with multiple AI-powered tools for the full application development lifecycle.",
    funFact:
      "Kilo's platform combines 5+ major features into one cohesive environment for AI-powered development.",
    isClose: (i) => false,
    category: "kilo_feature",
  },
];

// Scale/estimation questions (real-world comparisons)
const SCALE_QUESTIONS: Challenge[] = [
  {
    story:
      "You stand at the entrance of the ancient Crystal Caverns. The cave glows with an ethereal blue light, and whispers of ancient magic echo in the darkness.",
    question: "Roughly how long is 1,000 seconds?",
    options: [
      "About 5 minutes",
      "About 17 minutes",
      "About an hour",
      "About 3 hours",
    ],
    correctIndex: 1,
    explanation:
      "1000 seconds divided by 60 gives approximately 16.67 minutes.",
    funFact:
      "The average pop song is about 3-4 minutes long, so 1,000 seconds is roughly 4 songs!",
    isClose: (i) => i === 0 || i === 2,
    category: "scale",
  },
  {
    story:
      "You press forward deeper into the unknown. The path ahead forks into three directions. Each seems to hold its own secrets, but only one leads closer to your goal.",
    question:
      "If you stack 1,000 coins (like quarters), how tall would the stack be?",
    options: [
      "About as tall as a coffee mug",
      "About as tall as an adult person",
      "About as tall as a two-story house",
      "About as tall as the Eiffel Tower",
    ],
    correctIndex: 1,
    explanation:
      "A quarter is about 1.75mm thick. 1000 × 1.75mm = 1,750mm or about 1.75 meters—roughly the height of an adult.",
    funFact:
      "If you stacked 1,000,000 quarters, you'd have a tower about 1.75 km tall—taller than most mountains!",
    isClose: (i) => i === 0 || i === 2,
    category: "scale",
  },
  {
    story:
      "A challenge appears before you. The ancient ones left this test to prove one's worthiness. Answer wisely, for the cost of failure is steep.",
    question: "1,000 lines of code is roughly how many pages?",
    options: [
      "About 2-3 pages",
      "About 10-15 pages",
      "About 50-60 pages",
      "About 200+ pages",
    ],
    correctIndex: 1,
    explanation:
      "With typical code formatting (30-50 lines per page), 1,000 lines fill roughly 20-33 pages.",
    funFact:
      "The original Pac-Man game had about 3,000 lines of code—a 'tiny' game by today's standards!",
    isClose: (i) => i === 2,
    category: "scale",
  },
  {
    story:
      "The trial intensifies. Your mind must remain sharp, for the shadows of doubt creep ever closer with each passing moment.",
    question: "Roughly how far would you walk in 1,000 steps?",
    options: [
      "About the length of a school bus",
      "About the length of a basketball court",
      "About the length of a soccer field",
      "About the length of a marathon",
    ],
    correctIndex: 1,
    explanation:
      "An average step is about 0.75 meters. 1,000 × 0.75m = 750 meters—roughly the length of 7-8 basketball courts!",
    funFact:
      "A marathon is 42,195 meters, so you'd need about 56,000 steps to complete one!",
    isClose: (i) => i === 2,
    category: "scale",
  },
  {
    story:
      "Your final challenge awaits. The ancient guardians watch, waiting to see if you truly possess the wisdom to complete your quest.",
    question:
      "If you read 1,000 words per minute, how long would it take to read a typical novel (80,000 words)?",
    options: [
      "About 10 minutes",
      "About 80 minutes (1.5 hours)",
      "About 800 minutes (13+ hours)",
      "About 8,000 minutes (5+ days)",
    ],
    correctIndex: 2,
    explanation:
      "80,000 words ÷ 1,000 words/minute = 80 minutes (1 hour and 20 minutes).",
    funFact:
      "The longest novel ever published, 'In Search of Lost Time,' has about 1.2 million words—it would take 20 hours to read at 1,000 wpm!",
    isClose: (i) => i === 1,
    category: "scale",
  },
  {
    story:
      "You encounter a massive library filled with scrolls. The librarian asks: how much can 1GB really hold?",
    question: "Approximately how many photos can 1GB of storage hold?",
    options: [
      "About 50 photos",
      "About 200-300 photos",
      "About 1,000-2,000 photos",
      "About 10,000+ photos",
    ],
    correctIndex: 2,
    explanation:
      "A typical smartphone photo is 0.5-1MB. So 1GB (1024MB) can hold roughly 200-2,000 photos depending on quality.",
    funFact:
      "The average person takes 1,500+ photos per year—that's about 1.5-3GB of storage!",
    isClose: (i) => i === 1,
    category: "scale",
  },
  {
    story:
      "A futuristic display shows the world's data. You need to understand scale.",
    question: "Roughly how many web pages exist on the internet today?",
    options: [
      "About 1 million",
      "About 50 million",
      "About 1-2 billion",
      "About 100 billion+",
    ],
    correctIndex: 2,
    explanation:
      "Google alone indexes over 1 billion web pages, with estimates suggesting 2-5 billion publicly accessible pages.",
    funFact:
      "If you spent just 1 second on each page, it would take 30+ years to see them all!",
    isClose: (i) => i === 3,
    category: "scale",
  },
  {
    story:
      "You face a temporal puzzle. Time itself seems to bend around this question.",
    question: "How many heartbeats does the average human have in a lifetime?",
    options: [
      "About 100 million",
      "About 500 million",
      "About 2-3 billion",
      "About 10 billion",
    ],
    correctIndex: 2,
    explanation: "At 70 bpm × 60 × 24 × 365 × 80 years ≈ 2.9 billion beats.",
    funFact:
      "Your heart beats about 100,000 times per day—enough to fill a small swimming pool!",
    isClose: (i) => i === 1,
    category: "scale",
  },
];

// Conceptual/intuition questions
const CONCEPTUAL_QUESTIONS: Challenge[] = [
  {
    story:
      "A wise sage appears, testing your understanding of computational intuition.",
    question:
      "If you doubled a number every day for 30 days, how large would it be compared to the starting number?",
    options: [
      "About 100 times larger",
      "About 1,000 times larger",
      "About 1 billion times larger",
      "About 1 trillion times larger",
    ],
    correctIndex: 2,
    explanation:
      "2^30 = 1,073,741,824 ≈ 1 billion. Exponential growth is surprisingly powerful!",
    funFact:
      "This is why small habits compound dramatically—like how investing early pays off enormously.",
    isClose: (i) => i === 3,
    category: "conceptual",
  },
  {
    story: "An ancient algorithm master challenges you with a classic problem.",
    question:
      "If you had a chessboard with 1 grain of rice on the first square, 2 on the second, 4 on the third (doubling each time), how many grains would be on the last square?",
    options: [
      "About 1 million grains",
      "About 100 million grains",
      "About 9×10^18 grains (9 quintillion)",
      "About 1×10^24 grains",
    ],
    correctIndex: 2,
    explanation:
      "2^63 = 9,223,372,036,854,775,808 ≈ 9×10^18. This is the famous wheat and chessboard problem!",
    funFact:
      "9 quintillion grains of rice would cover the entire country of India about 1 meter deep!",
    isClose: (i) => i === 1,
    category: "conceptual",
  },
  {
    story:
      "You encounter a neural network visualization. Understanding scales of AI power is key.",
    question:
      "Modern large language models often have billions of parameters. Roughly how many 'connections' might a 100-billion parameter model have?",
    options: [
      "About 10 million",
      "About 1 billion",
      "About 100 billion",
      "About 10 trillion",
    ],
    correctIndex: 2,
    explanation:
      "Each parameter is essentially a connection between neurons in the network—so 100B parameters = 100B connections.",
    funFact:
      "The human brain has about 100 trillion synapses—so we're still smaller than biological neural networks!",
    isClose: (i) => i === 3,
    category: "conceptual",
  },
  {
    story:
      "A quantum computing oracle poses a question about processing power.",
    question:
      "Quantum computers exploit superposition. A quantum bit (qubit) can represent multiple states at once. How might 50 qubits compare to a classical computer's representation?",
    options: [
      "About 50 times more powerful",
      "About 1,000 times more powerful",
      "About 1 quadrillion times more powerful",
      "Cannot be directly compared",
    ],
    correctIndex: 2,
    explanation:
      "50 qubits can represent 2^50 ≈ 1 quadrillion states simultaneously—a quantum advantage.",
    funFact:
      "This is why quantum computers could solve certain problems (like cryptography) exponentially faster!",
    isClose: (i) => i === 3,
    category: "conceptual",
  },
  {
    story: "You face a probability paradox that challenges your intuition.",
    question:
      "In a group of 23 people, what's the probability that at least two share the same birthday?",
    options: ["Less than 1%", "About 25%", "About 50%", "Over 50%"],
    correctIndex: 3,
    explanation:
      "Surprisingly, with 23 people, the probability is about 50.7%! This is the famous birthday paradox.",
    funFact: "With 70 people, the probability jumps to 99.9%!",
    isClose: (i) => i === 2,
    category: "conceptual",
  },
  {
    story:
      "A master of data compression challenges your understanding of information theory.",
    question: "What's the theoretical limit of lossless data compression?",
    options: [
      "50% reduction",
      "90% reduction",
      "No theoretical limit—you can always compress more",
      "You cannot compress random data at all",
    ],
    correctIndex: 3,
    explanation:
      "Random data is incompressible—it has no patterns to exploit. This is a fundamental information theory result.",
    funFact:
      "This is why compression works great on documents and images but poorly on already-compressed files!",
    isClose: (i) => false,
    category: "conceptual",
  },
];

// Combine all questions
const ALL_QUESTIONS = [
  ...SCALE_QUESTIONS,
  ...CONCEPTUAL_QUESTIONS,
  ...KILO_FEATURE_QUESTIONS,
];

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Generate shuffled challenge order for the game
const generateChallengeOrder = (): number[] => {
  return shuffleArray([1, 2, 3, 4, 5]);
};

// Step deduction constants for better maintainability
const STEP_DEDUCTION = {
  correct: 100,
  close: 250,
  wrong: 500,
} as const;

// Maximum steps at game start
const MAX_STEPS = 1000;

// Rounds per game (1-5 challenge order)
const TOTAL_ROUNDS = 5;

// Use a ref to track Kilo feature question usage (persists across calls but can be reset)
const kiloFeatureRoundTracker = { current: 0 };

// Reset function to clear tracker between games
const resetKiloFeatureTracker = () => {
  kiloFeatureRoundTracker.current = 0;
};

// Generate a challenge for a given round with proper Kilo feature distribution
const generateChallenge = (
  genre: Genre,
  round: number,
  challengeOrder: number[]
): Challenge => {
  // Ensure 1 out of every 3 questions is a Kilo feature question
  const shouldBeKiloFeature = round % 3 === 0;

  let challenge: Challenge;

  if (
    shouldBeKiloFeature &&
    kiloFeatureRoundTracker.current < KILO_FEATURE_QUESTIONS.length
  ) {
    // Return a Kilo feature question
    challenge = {
      ...KILO_FEATURE_QUESTIONS[
        kiloFeatureRoundTracker.current % KILO_FEATURE_QUESTIONS.length
      ],
    };
    kiloFeatureRoundTracker.current++;

    // Adapt story to genre
    const genreStories: Record<Genre, string> = {
      fantasy:
        "Ancient Kilo runes glow before you, revealing secrets of the platform's power...",
      scifi:
        "Your ship's Kilo interface illuminates, offering technical wisdom...",
      mystery:
        "Evidence points to Kilo's capabilities—you must deduce the truth...",
      apocalyptic:
        "A pre-war Kilo terminal still functions, dispensing crucial knowledge...",
    };

    challenge.story = `${genreStories[genre]} ${challenge.story}`;
  } else {
    // Return scale or conceptual question
    const nonFeatureQuestions = [...SCALE_QUESTIONS, ...CONCEPTUAL_QUESTIONS];
    const index = (round - 1) % nonFeatureQuestions.length;
    challenge = { ...nonFeatureQuestions[index] };

    // Adapt story to genre
    const genreStories: Record<Genre, string> = {
      fantasy: "The Crystal Caverns shimmer with ancient wisdom...",
      scifi: "The Starship Odyssey's sensors detect an estimation challenge...",
      mystery: "Lord Blackwood's study holds the key to this puzzle...",
      apocalyptic: "The bunker's filtration system needs calibration...",
    };

    challenge.story = `${genreStories[genre]} ${challenge.story}`;
  }

  return challenge;
};

// Use the constants defined above
const stepsDeduction = STEP_DEDUCTION;

// Animated steps display component
function AnimatedSteps({
  steps,
  previousSteps,
  isLow,
}: {
  steps: number;
  previousSteps: number;
  isLow: boolean;
}): React.ReactElement {
  const [displaySteps, setDisplaySteps] = useState(steps);

  useEffect(() => {
    if (steps !== previousSteps) {
      // Animate counting down
      const duration = 500;
      const stepsPerFrame = Math.ceil(
        Math.abs(previousSteps - steps) / (duration / 16)
      );

      let current = previousSteps;
      const timer = setInterval(() => {
        current =
          current + (steps > previousSteps ? stepsPerFrame : -stepsPerFrame);

        if (
          (steps > previousSteps && current >= steps) ||
          (steps < previousSteps && current <= steps)
        ) {
          current = steps;
          clearInterval(timer);
        }
        setDisplaySteps(current);
      }, 16);

      return () => clearInterval(timer);
    }
  }, [steps, previousSteps]);

  return (
    <span
      className={`text-5xl md:text-6xl font-black tabular-nums tracking-tight ${
        isLow ? "text-red-400 scale-110 animate-pulse" : "text-white"
      }`}
    >
      {displaySteps.toLocaleString()}
    </span>
  );
}

// Kilo indicator component
function KiloIndicator({ steps }: { steps: number }): React.ReactElement {
  const kiloPercent = Math.round((steps / 1000) * 100);

  return (
    <div className="flex items-center gap-2 justify-center">
      <span className="text-2xl">💯</span>
      <div className="flex items-center gap-1">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-8 rounded-sm transition-all duration-300 ${
              i < kiloPercent / 10
                ? "bg-gradient-to-t from-yellow-400 to-yellow-300 shadow-lg shadow-yellow-500/30"
                : "bg-white/20"
            }`}
          />
        ))}
      </div>
      <span className="text-2xl">🌟</span>
    </div>
  );
}

// Progress bar component
function StepsProgressBar({
  steps,
  maxSteps = MAX_STEPS,
}: {
  steps: number;
  maxSteps?: number;
}): React.ReactElement {
  const percentage = Math.max(0, (steps / maxSteps) * 100);

  return (
    <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full transition-all duration-500 ease-out rounded-full relative ${
          percentage > 50
            ? "bg-gradient-to-r from-green-500 to-green-400"
            : percentage > 25
            ? "bg-gradient-to-r from-yellow-500 to-amber-400"
            : "bg-gradient-to-r from-red-500 to-red-400 animate-pulse"
        }`}
        style={{ width: `${percentage}%` }}
      >
        {percentage > 10 && (
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        )}
      </div>
    </div>
  );
}

export default function KiloQuestGame() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(
    null
  );
  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [showEnding, setShowEnding] = useState(false);
  const [previousSteps, setPreviousSteps] = useState(1000);
  const [isAnswering, setIsAnswering] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);

  const startGame = useCallback((genre: Genre) => {
    // Reset Kilo feature tracker for new game
    resetKiloFeatureTracker();
    
    const challengeOrder = generateChallengeOrder();
    setSelectedGenre(genre);
    setGameState({
      steps: MAX_STEPS,
      round: 1,
      genre,
      totalStepsUsed: 0,
      correctCount: 0,
      closeCount: 0,
      wrongCount: 0,
      challengeOrder,
      startTime: Date.now(),
    });
    setCurrentChallenge(generateChallenge(genre, 1, challengeOrder));
    setResolution(null);
    setShowEnding(false);
    setPreviousSteps(MAX_STEPS);
    setIsAnswering(false);
    setCopied(false);
    setShowShareCard(false);
  }, []);

  const handleAnswer = useCallback(
    (selectedIndex: number) => {
      if (!gameState || !currentChallenge || isAnswering) return;

      setIsAnswering(true);
      setPreviousSteps(gameState.steps);

      const isCorrect = selectedIndex === currentChallenge.correctIndex;
      const isClose = currentChallenge.isClose(selectedIndex) && !isCorrect;

      const deduction = isCorrect
        ? stepsDeduction.correct
        : isClose
        ? stepsDeduction.close
        : stepsDeduction.wrong;

      const newSteps = gameState.steps - deduction;

      // Small delay for animation
      setTimeout(() => {
        setGameState((prev) =>
          prev
            ? {
                ...prev,
                steps: newSteps,
                totalStepsUsed: prev.totalStepsUsed + deduction,
                correctCount: isCorrect
                  ? prev.correctCount + 1
                  : prev.correctCount,
                closeCount: isClose ? prev.closeCount + 1 : prev.closeCount,
                wrongCount:
                  !isCorrect && !isClose
                    ? prev.wrongCount + 1
                    : prev.wrongCount,
              }
            : null
        );

        setResolution({
          wasCorrect: isCorrect,
          wasClose: isClose,
          stepsDeducted: deduction,
          explanation: currentChallenge.explanation,
          funFact: currentChallenge.funFact,
        });

        setIsAnswering(false);

        if (newSteps <= 0) {
          setShowEnding(true);
        }
      }, 300);
    },
    [gameState, currentChallenge, isAnswering]
  );

  const continueGame = useCallback(() => {
    if (!gameState || !selectedGenre) return;

    const nextRound = gameState.round + 1;
    setGameState((prev) => (prev ? { ...prev, round: nextRound } : null));
    setCurrentChallenge(
      generateChallenge(selectedGenre, nextRound, gameState.challengeOrder)
    );
    setResolution(null);
  }, [gameState, selectedGenre]);

  const restartGame = useCallback(() => {
    // Reset Kilo feature tracker when restarting
    resetKiloFeatureTracker();
    
    setGameState(null);
    setCurrentChallenge(null);
    setResolution(null);
    setSelectedGenre(null);
    setShowEnding(false);
    setPreviousSteps(MAX_STEPS);
    setIsAnswering(false);
    setCopied(false);
    setShowShareCard(false);
  }, []);

  // Start Screen
  if (!gameState) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/3 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        <div className="max-w-2xl w-full relative z-10">
          <div className="text-center mb-8">
            {/* Big kilo branding */}
            <div className="inline-flex items-center gap-3 mb-6 px-6 py-2 bg-[#2D2D2D] rounded-full border border-[#404040]">
              <span className="text-4xl">⚡</span>
              <span className="text-yellow-400 font-mono text-sm tracking-widest">
                KILO SYSTEM v1.0
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tighter">
              <span className="text-gradient">Kilo</span>
              <span className="text-white">Quest</span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-400 font-light mb-4">
              KiloGuess Edition
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#2D2D2D] rounded-lg border border-[#404040]">
              <span className="text-yellow-400">STARTING KILO-STEPS:</span>
              <span className="text-2xl font-black text-white">1,000</span>
            </div>
            <p className="mt-6 text-lg text-gray-500 italic max-w-lg mx-auto">
              You have a thousand steps. Every guess tests your kilo-wisdom.
            </p>
          </div>

          <div className="bg-[#2D2D2D] rounded-3xl p-8 border border-[#404040] shadow-xl">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-xl">🎮</span>
              <h2 className="text-xl font-bold text-white">
                Select Your Quest Genre
              </h2>
              <span className="text-xl">🎮</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-8">
              {[
                {
                  id: "fantasy",
                  emoji: "🐉",
                  name: "Fantasy",
                  color: "from-yellow-500 to-amber-600",
                },
                {
                  id: "scifi",
                  emoji: "🚀",
                  name: "Sci-Fi",
                  color: "from-blue-500 to-cyan-600",
                },
                {
                  id: "mystery",
                  emoji: "🔍",
                  name: "Mystery",
                  color: "from-gray-400 to-gray-500",
                },
                {
                  id: "apocalyptic",
                  emoji: "☢️",
                  name: "Post-Apoc",
                  color: "from-red-500 to-orange-600",
                },
              ].map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => startGame(genre.id as Genre)}
                  className={`p-6 rounded-2xl bg-gradient-to-br ${genre.color} hover:scale-105 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 shadow-lg group relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="text-5xl block mb-2 group-hover:scale-125 transition-transform duration-300 relative z-10">
                    {genre.emoji}
                  </span>
                  <span className="text-white font-bold text-lg relative z-10">
                    {genre.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-yellow-500/50 mt-8 text-sm flex items-center justify-center gap-2">
            <span>🧠</span>
            <span>Test your kilo-wisdom. Survive the estimate.</span>
          </p>
        </div>
      </div>
    );
  }

  // Social Share Component
  function ShareButtons({
    stats,
    genre,
    accuracy,
    title,
  }: {
    stats: {
      steps: number;
      rounds: number;
      correct: number;
      close: number;
      wrong: number;
    };
    genre: string;
    accuracy: number;
    title: string;
  }): React.ReactElement {
    const shareText = `🎮 Just completed KiloQuest ${genre} with ${stats.rounds} rounds, ${accuracy}% accuracy, and earned the "${title}" title! Can you beat my score? #KiloQuest #KiloGuess`;
    const shareUrl = "https://kiloquest.demo";

    const shareLinks = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}&quote=${encodeURIComponent(shareText)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl
      )}`,
    };

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
        // Fallback for environments without clipboard API
        const textarea = document.createElement('textarea');
        textarea.value = `${shareText}\n${shareUrl}`;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          // If all methods fail, show an alert (last resort)
          alert('Failed to copy. Please copy the text manually.');
        } finally {
          document.body.removeChild(textarea);
        }
      }
    };

    return (
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <a
          href={shareLinks.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2]/80 hover:bg-[#1DA1F2] text-white rounded-xl font-medium transition-all duration-300 hover:scale-105"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share on X
        </a>
        <a
          href={shareLinks.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-[#4267B2]/80 hover:bg-[#4267B2] text-white rounded-xl font-medium transition-all duration-300 hover:scale-105"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </a>
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2]/80 hover:bg-[#0A66C2] text-white rounded-xl font-medium transition-all duration-300 hover:scale-105"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          LinkedIn
        </a>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
            copied
              ? "bg-green-500/80 text-white"
              : "bg-[#363636] hover:bg-[#404040] text-white"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    );
  }

  // Achievement Badge Component
  function AchievementBadge({
    icon,
    name,
    description,
    earned,
  }: {
    icon: string;
    name: string;
    description: string;
    earned: boolean;
  }): React.ReactElement {
    return (
      <div
        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
          earned
            ? "bg-yellow-500/10 border border-yellow-400/30"
            : "bg-[#2D2D2D] border border-[#333333] opacity-50"
        }`}
      >
        <span className="text-3xl">
          {icon}
        </span>
        <div className="text-left">
          <p
            className={`font-bold ${
              earned ? "text-yellow-300" : "text-gray-400"
            }`}
          >
            {name}
          </p>
          <p
            className={`text-sm ${
              earned ? "text-yellow-200/70" : "text-gray-500"
            }`}
          >
            {description}
          </p>
        </div>
        {earned && <span className="ml-auto text-yellow-400">✓</span>}
      </div>
    );
  }

  // Celebration Confetti Component
  function Confetti(): React.ReactElement {
    const confettiColors = [
      "#FACC15",
      "#FFD700",
      "#EAB308",
      "#FDE047",
      "#FFF8DC",
      "#FFFAF0",
    ];

    // Use useMemo to avoid recalculating on every render
    const confettiParticles = React.useMemo(() => {
      return Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `-${Math.random() * 20 + 10}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${Math.random() * 2 + 2}s`,
        color: confettiColors[
          Math.floor(Math.random() * confettiColors.length)
        ],
        rotation: Math.random() * 360,
      }));
    }, []);

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confettiParticles.map((particle) => (
          <div
            key={particle.id}
            className="absolute animate-confetti"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.animationDelay,
              animationDuration: particle.animationDuration,
            }}
          >
            <div
              className="w-3 h-3 rotate-45"
              style={{
                backgroundColor: particle.color,
                transform: `rotate(${particle.rotation}deg)`,
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  // Enhanced Ending Screen
  if (showEnding && gameState) {
    const endingIndex = Math.min(
      Math.floor(gameState.totalStepsUsed / 200),
      genreContent[gameState.genre].endings.length - 1
    );
    const archetypeIndex = Math.min(
      Math.floor(gameState.totalStepsUsed / 300),
      genreContent[gameState.genre].archetypes.length - 1
    );
    const accuracy =
      gameState.correctCount + gameState.closeCount + gameState.wrongCount > 0
        ? Math.round(
            (gameState.correctCount /
              (gameState.correctCount +
                gameState.closeCount +
                gameState.wrongCount)) *
              100
          )
        : 0;
    const accuracyRating =
      accuracy >= 80
        ? "Elite Estimator"
        : accuracy >= 60
        ? "Solid Guesser"
        : accuracy >= 40
        ? "Learning Warrior"
        : "Survivor";

    // Calculate time taken
    const timeTaken = gameState.startTime
      ? Math.round((Date.now() - gameState.startTime) / 1000)
      : 0;
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    const timeString = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    // Calculate average steps per round
    const avgStepsPerRound =
      gameState.round > 0
        ? Math.round(gameState.totalStepsUsed / gameState.round)
        : 0;

    // Determine achievements
    const achievements = [
      {
        icon: "🏆",
        name: "First Victory",
        description: "Complete your first KiloQuest",
        earned: true,
      },
      {
        icon: "🎯",
        name: "Sharpshooter",
        description: "80%+ accuracy",
        earned: accuracy >= 80,
      },
      {
        icon: "⚡",
        name: "Speed Demon",
        description: "Complete in under 2 minutes",
        earned: timeTaken < 120,
      },
      {
        icon: "💎",
        name: "Efficiency Expert",
        description: "Avg < 30 steps per round",
        earned: avgStepsPerRound < 30,
      },
      {
        icon: "🔥",
        name: "On Fire",
        description: "5+ correct answers",
        earned: gameState.correctCount >= 5,
      },
      {
        icon: "🎖️",
        name: "Veteran",
        description: "Reach round 10+",
        earned: gameState.round >= 10,
      },
    ];

    const earnedAchievements = achievements.filter((a) => a.earned).length;

    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4 overflow-hidden relative">
        {/* Celebration confetti */}
        <Confetti />

        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-500" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/3 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="max-w-4xl w-full relative z-10">
          {/* Main Results Card */}
          <div className="bg-[#2D2D2D] rounded-3xl p-8 border border-[#404040] shadow-xl mb-6">
            {/* Header Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500/10 rounded-full border border-yellow-400/40 animate-pulse">
                <span className="text-2xl">🏆</span>
                <span className="text-white font-bold tracking-wider">
                  KILO-JOURNEY COMPLETE
                </span>
                <span className="text-2xl">🏆</span>
              </div>
            </div>

            {/* Genre & Round */}
            <div className="text-center mb-6">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2 text-gradient">
                {gameState.genre.toUpperCase()} QUEST
              </h1>
              <div className="inline-flex items-center gap-4 px-6 py-2 bg-[#363636] rounded-full border border-[#404040]">
                <span className="text-gray-400">Rounds Survived:</span>
                <span className="text-3xl font-black text-white">
                  #{gameState.round}
                </span>
              </div>
            </div>

            {/* Story Ending */}
            <div className="bg-[#363636] rounded-2xl p-6 mb-6 border border-[#404040]">
              <p className="text-xl text-gray-300 text-center italic">
                &quot;{genreContent[gameState.genre].endings[endingIndex]}&quot;
              </p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#363636] rounded-2xl p-4 border border-[#404040] text-center">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                  Kilo-Steps Used
                </p>
                <p className="text-3xl md:text-4xl font-black text-white tabular-nums">
                  {gameState.totalStepsUsed.toLocaleString()}
                </p>
                <p className="text-gray-500 text-xs mt-1">out of 1,000</p>
              </div>

              <div className="bg-[#363636] rounded-2xl p-4 border border-[#404040] text-center">
                <p className="text-green-400 text-xs uppercase tracking-wider mb-1">
                  Accuracy
                </p>
                <p className="text-3xl md:text-4xl font-black text-green-400 tabular-nums">
                  {accuracy}%
                </p>
                <p className="text-green-400/60 text-xs mt-1">
                  {accuracyRating}
                </p>
              </div>

              <div className="bg-[#363636] rounded-2xl p-4 border border-[#404040] text-center">
                <p className="text-blue-400 text-xs uppercase tracking-wider mb-1">
                  Time Taken
                </p>
                <p className="text-3xl md:text-4xl font-black text-white tabular-nums">
                  {timeString}
                </p>
                <p className="text-blue-400/60 text-xs mt-1">
                  {gameState.round} rounds
                </p>
              </div>

              <div className="bg-[#363636] rounded-2xl p-4 border border-[#404040] text-center">
                <p className="text-yellow-400 text-xs uppercase tracking-wider mb-1">
                  Avg Steps/Round
                </p>
                <p className="text-3xl md:text-4xl font-black text-white tabular-nums">
                  {avgStepsPerRound}
                </p>
                <p className="text-yellow-400/60 text-xs mt-1">
                  efficiency score
                </p>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-green-500/10 rounded-xl p-4 border border-green-400/30 text-center">
                <p className="text-green-400 text-xs uppercase tracking-wider mb-1">
                  {genreContent[gameState.genre].statsLabels.correct}
                </p>
                <p className="text-3xl font-black text-green-400 tabular-nums">
                  {gameState.correctCount}
                </p>
                <p className="text-green-400/60 text-xs">-100 steps each</p>
              </div>
              <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-400/30 text-center">
                <p className="text-yellow-400 text-xs uppercase tracking-wider mb-1">
                  {genreContent[gameState.genre].statsLabels.close}
                </p>
                <p className="text-3xl font-black text-yellow-400 tabular-nums">
                  {gameState.closeCount}
                </p>
                <p className="text-yellow-400/60 text-xs">-250 steps each</p>
              </div>
              <div className="bg-red-500/10 rounded-xl p-4 border border-red-400/30 text-center">
                <p className="text-red-400 text-xs uppercase tracking-wider mb-1">
                  {genreContent[gameState.genre].statsLabels.wrong}
                </p>
                <p className="text-3xl font-black text-red-400 tabular-nums">
                  {gameState.wrongCount}
                </p>
                <p className="text-red-400/60 text-xs">-500 steps each</p>
              </div>
            </div>

            {/* Kilo-Title */}
            <div className="bg-yellow-500/10 rounded-2xl p-6 mb-6 border border-yellow-400/30 text-center">
              <p className="text-yellow-400 text-sm uppercase tracking-wider mb-2">
                Your Kilo-Title Unlocked
              </p>
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-400 animate-pulse">
                {genreContent[gameState.genre].archetypes[archetypeIndex].name}
              </p>
              <p className="text-xl text-yellow-300/80 font-medium mb-2">
                &quot;
                {
                  genreContent[gameState.genre].archetypes[archetypeIndex]
                    .tagline
                }
                &quot;
              </p>
              <p className="text-yellow-200/70 text-sm max-w-lg mx-auto">
                {
                  genreContent[gameState.genre].archetypes[archetypeIndex]
                    .description
                }
              </p>
            </div>

            {/* Achievements */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-400 text-sm uppercase tracking-wider">
                  Achievements
                </p>
                <p className="text-yellow-400 font-bold">
                  {earnedAchievements}/{achievements.length}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {achievements.map((achievement, index) => (
                  <AchievementBadge key={index} {...achievement} />
                ))}
              </div>
            </div>

            {/* Social Sharing */}
            <div className="mb-6">
              <p className="text-gray-400 text-sm uppercase tracking-wider mb-3 text-center">
                Share Your Achievement
              </p>
              <ShareButtons
                stats={{
                  steps: gameState.totalStepsUsed,
                  rounds: gameState.round,
                  correct: gameState.correctCount,
                  close: gameState.closeCount,
                  wrong: gameState.wrongCount,
                }}
                genre={gameState.genre}
                accuracy={accuracy}
                title={
                  genreContent[gameState.genre].archetypes[archetypeIndex].name
                }
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => startGame(gameState.genre)}
                className="py-4 px-8 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-[#1a1a1a] font-bold text-xl rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 flex items-center gap-2"
              >
                <span>🔄</span> Play Again
              </button>
              <button
                onClick={restartGame}
                className="py-4 px-8 bg-[#363636] hover:bg-[#404040] border border-[#404040] text-white font-bold text-xl rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 flex items-center gap-2"
              >
                <span>🎮</span> New Genre
              </button>
            </div>
          </div>

          {/* Footer Message */}
          <div className="text-center">
            <div className="bg-[#2D2D2D] rounded-xl p-4 mb-4 border border-[#333333]">
              <p className="text-gray-300 italic text-lg">
                {genreContent[gameState.genre].finalMessage}
              </p>
            </div>
            <p className="text-yellow-500/50 text-sm flex items-center justify-center gap-2">
              <span>🌟</span>
              <span>Can you earn all achievements? Try different genres!</span>
              <span>🌟</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Resolution Screen
  if (resolution) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4 overflow-hidden">
        <div className="max-w-2xl w-full">
          <div
            className={`bg-[#2D2D2D] rounded-3xl p-8 border-2 text-center ${
              resolution.wasCorrect
                ? "border-green-500/50"
                : resolution.wasClose
                ? "border-yellow-500/50"
                : "border-red-500/50"
            }`}
          >
            <div className="text-8xl mb-4">
              {resolution.wasCorrect ? "🎯" : resolution.wasClose ? "🤔" : "❌"}
            </div>

            <h2
              className={`text-4xl font-bold mb-2 ${
                resolution.wasCorrect
                  ? "text-green-400"
                  : resolution.wasClose
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {resolution.wasCorrect
                ? "KILO-CORRECT!"
                : resolution.wasClose
                ? "KILO-CLOSE!"
                : "KILO-MISS"}
            </h2>

            <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 bg-[#363636] rounded-full border border-[#404040]">
              <span className="text-gray-400 font-mono">KILO-STEPS LOST:</span>
              <span
                className={`text-3xl font-black tabular-nums ${
                  resolution.wasCorrect
                    ? "text-green-400"
                    : resolution.wasClose
                    ? "text-yellow-400"
                    : "text-red-400"
                } animate-pulse`}
              >
                -{resolution.stepsDeducted}
              </span>
            </div>

            <div className="bg-[#363636] rounded-2xl p-6 mb-6 text-left">
              <p className="text-gray-300 mb-4">{resolution.explanation}</p>
              <div className="border-t border-[#404040] pt-4 mt-4">
                <p className="text-yellow-400 font-semibold mb-1 flex items-center gap-2">
                  <span>💡</span> Kilo-Fact
                </p>
                <p className="text-gray-400">{resolution.funFact}</p>
              </div>
            </div>

            <button
              onClick={continueGame}
              className="py-4 px-8 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-[#1a1a1a] font-bold text-xl rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95"
            >
              ➜ Continue Kilo-Quest
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game Screen
  return (
    <div className="min-h-screen bg-[#1a1a1a] p-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-yellow-500/5 rounded-full blur-2xl animate-pulse delay-700" />
        <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-yellow-500/3 rounded-full blur-2xl animate-pulse delay-300" />
      </div>

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-4 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#2D2D2D] rounded-full border border-[#404040]">
          <span className="font-black text-white tracking-tight">
            KiloQuest
          </span>
          <span className="text-yellow-500 text-sm">|</span>
          <span className="text-gray-400 text-sm font-mono">
            KILO-GUESS v1.0
          </span>
        </div>
      </div>

      {/* Top Bar - Kilo Dashboard */}
      <div className="max-w-4xl mx-auto mb-4 relative z-10">
        <div className="bg-[#2D2D2D] rounded-2xl p-5 border border-[#404040] shadow-xl">
          {/* Kilo Progress Visual */}
          <div className="mb-4">
            <KiloIndicator steps={gameState.steps} />
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>0</span>
              <span>500</span>
              <span>1,000</span>
            </div>
            <StepsProgressBar steps={gameState.steps} />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="text-center flex-1">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                Kilo-Steps Left
              </p>
              <AnimatedSteps
                steps={gameState.steps}
                previousSteps={previousSteps}
                isLow={gameState.steps <= 100}
              />
            </div>

            <div className="flex-shrink-0 px-4 py-2 bg-[#363636] rounded-xl border border-[#404040]">
              <div className="text-center">
                <p className="text-gray-400 text-xs uppercase tracking-wider">
                  Kilo-Round
                </p>
                <p className="text-2xl font-black text-white">
                  #{gameState.round}
                </p>
              </div>
            </div>

            <div className="text-center flex-1 hidden md:block">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                Kilo-Steps Spent
              </p>
              <p className="text-xl font-bold text-gray-300 tabular-nums">
                {gameState.totalStepsUsed.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Story Panel */}
      <div className="max-w-4xl mx-auto mb-4 relative z-10">
        <div className="bg-[#2D2D2D] rounded-3xl p-6 md:p-8 border border-[#404040] shadow-xl transition-all duration-500">
          <div className="flex items-start gap-4">
            <span className="text-3xl">📖</span>
            <div>
              <p className="text-gray-200 text-lg md:text-xl leading-relaxed">
                {currentChallenge?.story}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Panel */}
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="bg-[#2D2D2D] rounded-3xl p-6 md:p-8 border border-[#404040] shadow-xl transition-all duration-500">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl animate-pulse">🎯</span>
            <div>
              <h2 className="text-2xl font-bold text-white">
                KiloGuess Challenge
              </h2>
              <p className="text-gray-500 text-sm">
                Estimate. Survive. Kilo-on.
              </p>
            </div>
          </div>

          <p className="text-xl text-gray-200 mb-6 font-medium">
            {currentChallenge?.question}
          </p>

          <div className="space-y-3">
            {currentChallenge?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={isAnswering}
                className={`w-full p-4 bg-[#363636] hover:bg-[#404040] border border-[#404040] hover:border-yellow-500/50 rounded-xl text-left transition-all duration-300 group transform hover:scale-[1.02] active:scale-95 ${
                  isAnswering ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <span className="inline-flex items-center justify-center w-10 h-10 bg-yellow-500/20 rounded-xl text-center mr-3 font-bold text-yellow-400 group-hover:bg-yellow-500/30 group-hover:scale-110 transition-all duration-300">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-white text-lg">{option}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[#404040]">
            <p className="text-center text-sm text-gray-500 mb-3">
              Kilo-Step Deductions
            </p>
            <div className="flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm font-medium">
                  Kilo-Correct: -100
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse delay-200" />
                <span className="text-yellow-400 text-sm font-medium">
                  Kilo-Close: -250
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse delay-500" />
                <span className="text-red-400 text-sm font-medium">
                  Kilo-Wrong: -500
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
