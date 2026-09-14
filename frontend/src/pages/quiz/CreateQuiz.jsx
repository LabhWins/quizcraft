import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createQuiz } from '../../api/quizApi';
import { getCategorySummary } from '../../api/questionApi';
import { PlusCircle, ArrowLeft, Brain, Layers, FolderPlus, Sparkles, CheckCircle2 } from 'lucide-react';
import ToastContainer from '../../components/ToastContainer';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';

function CreateQuiz() {
  const { isAdmin } = useAuth();
  const questionsBasePath = isAdmin ? '/admin/questions' : '/user/questions';
  const [summary, setSummary] = useState([]);
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [numQ, setNumQ] = useState(5);
  const [title, setTitle] = useState('');
  const { toasts, showToast, removeToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await getCategorySummary();
        setSummary(res.data || []);
      } catch (err) {
        showToast('Could not load categories. Is the backend running?', 'error');
      } finally {
        setLoadingSummary(false);
      }
    };
    fetchSummary();
  }, []);

  // Unique category list, derived from summary
  const categories = [...new Set(summary.map((s) => s.category))];

  // Difficulties available for the currently selected category
  const difficultiesForCategory = summary.filter((s) => s.category === category);

  // Max questions available for the current category + difficulty combo
  const maxAvailable = summary.find(
    (s) => s.category === category && s.difficultyLevel === difficulty
  )?.count;

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setDifficulty(''); // reset difficulty when category changes
  };

  const handleDifficultyChange = (e) => {
    const newDifficulty = e.target.value;
    setDifficulty(newDifficulty);
    const combo = summary.find((s) => s.category === category && s.difficultyLevel === newDifficulty);
    if (combo && numQ > combo.count) {
      setNumQ(combo.count);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createQuiz(category, difficulty, numQ, title);
      showToast('Quiz created! Redirecting...', 'success');
      navigate(`/quiz/${res.data}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create quiz. Try a lower question count.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingSummary) {
    return (
      <div className="px-6 py-16 text-center text-slate-400">
        Loading quiz categories & question summary...
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-lg mx-auto">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>

      <div className="glass-card p-6 sm:p-7 rounded-2xl shadow-2xl relative overflow-hidden border border-zinc-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Create a Quiz</h1>
            <p className="text-xs text-zinc-400">Customize category, difficulty, & question count</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quiz Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Quiz Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-zinc-100 rounded-xl px-3.5 py-2.5 text-sm placeholder-zinc-500 outline-none transition-all"
              placeholder="e.g. Java Sprint Challenge"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300">Category</label>
              {categories.length === 0 && (
                <Link to={questionsBasePath} className="text-xs text-amber-400 hover:underline flex items-center gap-1">
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Add questions first</span>
                </Link>
              )}
            </div>

            <select
              value={category}
              onChange={handleCategoryChange}
              required
              className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-zinc-100 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all cursor-pointer"
            >
              <option value="" disabled className="bg-zinc-900 text-zinc-400">Select a category</option>
              {categories.map((c) => (
                <option key={c} value={c} className="bg-zinc-900 text-zinc-100 py-1">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Difficulty</label>
            <select
              value={difficulty}
              onChange={handleDifficultyChange}
              required
              disabled={!category}
              className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-zinc-100 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="" disabled className="bg-zinc-900 text-zinc-400">Select difficulty</option>
              {difficultiesForCategory.map((d) => (
                <option key={d.difficultyLevel} value={d.difficultyLevel} className="bg-zinc-900 text-zinc-100 py-1">
                  {d.difficultyLevel} ({d.count} questions available)
                </option>
              ))}
            </select>
          </div>

          {/* Number of Questions */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300">Number of Questions</label>
              {maxAvailable && (
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                  Max: {maxAvailable}
                </span>
              )}
            </div>
            <input
              type="number"
              min="1"
              max={maxAvailable || undefined}
              value={numQ}
              onChange={(e) => setNumQ(Number(e.target.value))}
              required
              disabled={!difficulty}
              className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-zinc-100 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all disabled:opacity-40 disabled:cursor-not-allowed font-mono"
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{loading ? 'Creating Quiz...' : 'Create & Start Quiz'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateQuiz;
