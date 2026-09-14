import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, PlusCircle, ArrowRight, Zap, CheckCircle2, Swords, Code2, Database, Terminal, Check, X, Users } from 'lucide-react';

const SAMPLE_QUESTIONS = [
  {
    category: 'PYTHON',
    difficulty: 'Easy',
    question: 'In Python, what is the boolean value of an empty list `bool([])`?',
    options: ['True', 'False', 'None', 'TypeError'],
    correct: 'False',
    explanation: 'Empty containers (lists, dicts, tuples, strings) evaluate to False in Python.',
  },
  {
    category: 'JAVA',
    difficulty: 'Easy',
    question: 'Which keyword in Java prevents a class from being subclassed?',
    options: ['static', 'sealed', 'final', 'abstract'],
    correct: 'final',
    explanation: 'The final keyword applied to a class prevents inheritance.',
  },
  {
    category: 'SQL',
    difficulty: 'Medium',
    question: 'Which clause is used to filter aggregated group results in SQL?',
    options: ['WHERE', 'GROUP BY', 'HAVING', 'FILTER'],
    correct: 'HAVING',
    explanation: 'HAVING filters grouped records, whereas WHERE filters individual rows before grouping.',
  },
  {
    category: 'REACT',
    difficulty: 'Easy',
    question: 'Which Hook is used to perform side effects in functional components?',
    options: ['useState', 'useEffect', 'useReducer', 'useCallback'],
    correct: 'useEffect',
    explanation: 'useEffect is designed specifically for side effects like data fetching and subscriptions.',
  },
  {
    category: 'GIT',
    difficulty: 'Easy',
    question: 'Which command creates a new branch and immediately switches to it?',
    options: ['git branch <name>', 'git checkout -b <name>', 'git switch <name>', 'git merge <name>'],
    correct: 'git checkout -b <name>',
    explanation: 'git checkout -b (or git switch -c) creates and checks out the new branch simultaneously.',
  },
  {
    category: 'DJANGO',
    difficulty: 'Easy',
    question: 'Which file contains the global configuration and installed apps in Django?',
    options: ['urls.py', 'models.py', 'settings.py', 'manage.py'],
    correct: 'settings.py',
    explanation: 'settings.py defines all configuration, database connections, and INSTALLED_APPS.',
  },
];

function Home() {

  // Interactive In-Hero Demo State (Randomized starting question)
  const [sampleIdx, setSampleIdx] = useState(() => Math.floor(Math.random() * SAMPLE_QUESTIONS.length));
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const currentSample = SAMPLE_QUESTIONS[sampleIdx];

  const handleSelectOption = (opt) => {
    if (hasAnswered) return;
    setSelectedOption(opt);
    setHasAnswered(true);
  };

  const handleNextSample = () => {
    setSelectedOption(null);
    setHasAnswered(false);
    setSampleIdx((prev) => (prev + 1) % SAMPLE_QUESTIONS.length);
  };

  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-65px)] flex flex-col justify-between bg-grid-pattern">
      {/* Top subtle ambient spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 hero-glow pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16 w-full">
        {/* Main Hero & Interactive Demo Grid */}
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center mb-16">

          {/* Left Column: Headline & Action Links */}
          <div className="lg:col-span-7 text-left space-y-6">
            {/* Version Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>QUIZCRAFT v2.0 • TECHNICAL ASSESSMENT ENGINE</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
              Technical Assessment, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-100">
                Engineered for Developers.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
              Create customized technical quizzes from a structured repository, evaluate skills with instant automated scoring, and compete in real-time multiplayer duels.
            </p>

            {/* Primary Actions */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                to="/create"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Start Practicing</span>
              </Link>

              <Link
                to="/multiplayer/host"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 hover:border-amber-500/40 hover:bg-zinc-800 text-zinc-200 hover:text-white font-medium text-sm transition-all cursor-pointer"
              >
                <Swords className="w-4 h-4 text-amber-400" />
                <span>Host Live Game</span>
              </Link>

              <Link
                to="/multiplayer/join"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-700/80 hover:border-emerald-500/40 hover:bg-zinc-800 text-zinc-200 hover:text-white font-medium text-sm transition-all cursor-pointer"
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Join with Code</span>
              </Link>
            </div>

            {/* Tech Badges */}
            <div className="pt-2 flex items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-amber-400/90" /> Spring Boot Core</span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5 text-amber-400/90" /> REST & WebSocket</span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-amber-400/90" /> Paginated DB</span>
            </div>
          </div>

          {/* Right Column: Live Interactive Demo Card */}
          <div className="lg:col-span-5">
            <div className="glass-card p-5 sm:p-6 rounded-2xl border border-zinc-800 shadow-2xl relative">
              {/* Card Header with Mac Dots */}
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 mr-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-300 font-semibold text-[11px] uppercase font-mono">
                    {currentSample.category}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[11px] capitalize">
                    {currentSample.difficulty}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Demo {sampleIdx + 1}/{SAMPLE_QUESTIONS.length}
                </span>
              </div>

              {/* Question Text */}
              <p className="text-sm font-medium text-zinc-100 mb-4 leading-relaxed">
                {currentSample.question}
              </p>

              {/* Interactive Options */}
              <div className="space-y-2 mb-4">
                {currentSample.options.map((opt, i) => {
                  const isChosen = selectedOption === opt;
                  const isCorrect = opt === currentSample.correct;

                  let optClass = 'border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/70';
                  if (hasAnswered) {
                    if (isCorrect) {
                      optClass = 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 font-medium';
                    } else if (isChosen && !isCorrect) {
                      optClass = 'border-rose-500/50 bg-rose-500/15 text-rose-300 font-medium';
                    } else {
                      optClass = 'border-zinc-800/50 bg-zinc-900/30 text-zinc-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelectOption(opt)}
                      disabled={hasAnswered}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${optClass}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-md bg-zinc-800 text-zinc-400 font-mono text-[10px] flex items-center justify-center shrink-0 border border-zinc-700/50">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="font-mono text-xs">{opt}</span>
                      </div>
                      {hasAnswered && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                      {hasAnswered && isChosen && !isCorrect && <X className="w-4 h-4 text-rose-400" />}
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Switcher */}
              {hasAnswered ? (
                <div className="pt-3 border-t border-zinc-800/80">
                  <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
                    💡 <span className="text-zinc-300">{currentSample.explanation}</span>
                  </p>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleNextSample}
                      className="text-xs text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      Try Next Question <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      to="/create"
                      className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/25 font-medium transition-all"
                    >
                      Take Full Quiz
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-zinc-500 text-center font-mono">
                  Select an option to test instant automated evaluation
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-6 border-y border-zinc-800/80 mb-12">
          <div className="p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold font-mono text-white">400+</p>
            <p className="text-xs text-zinc-400 mt-0.5">Curated Questions</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold font-mono text-amber-400">6</p>
            <p className="text-xs text-zinc-400 mt-0.5">Tech Categories</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">&lt;50ms</p>
            <p className="text-xs text-zinc-400 mt-0.5">Evaluation Latency</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-xl sm:text-2xl font-bold font-mono text-white">Live</p>
            <p className="text-xs text-zinc-400 mt-0.5">Multiplayer & Duels</p>
          </div>
        </div>

        {/* Minimal 3-Feature Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="glass-card glass-card-hover p-5 rounded-xl border border-zinc-800">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Dynamic Question Engine</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Generate custom quizzes with flexible difficulty tiers and automated scoring against server question banks.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-5 rounded-xl border border-zinc-800">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">AI Question Generator</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Produce rich technical MCQs on demand with automated duplicate detection and batch insertion into repositories.
            </p>
          </div>

          <div className="glass-card glass-card-hover p-5 rounded-xl border border-zinc-800">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
              <Swords className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">Live Multiplayer Duels</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Create real-time game rooms or challenge friends via shareable tokens with instant leaderboard sync.
            </p>
          </div>
        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-800/80 py-4 text-center text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} QuizCraft • Built with React & Spring Boot</p>
      </footer>
    </div>
  );
}

export default Home;
