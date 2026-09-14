import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { addQuestion, updateQuestion, deleteQuestion, generateQuestions, getCategorySummary, getPagedQuestions, getMyQuestions } from '../../api/questionApi';
import { PlusCircle, Edit3, Trash2, FolderKanban, HelpCircle, XCircle, Sparkles, Loader2, Check, ChevronRight, ChevronLeft, Coffee, Terminal, Database, Code2, GitBranch, Server, Layers, Zap, BookOpen } from 'lucide-react';
import ToastContainer from '../../components/ToastContainer';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';

const getCategoryIcon = (cat) => {
  const c = cat?.toLowerCase() || '';
  if (c.includes('java') && !c.includes('script')) return <Coffee className="w-5 h-5 text-amber-400" />;
  if (c.includes('python')) return <Terminal className="w-5 h-5 text-emerald-400" />;
  if (c.includes('sql')) return <Database className="w-5 h-5 text-blue-400" />;
  if (c.includes('react')) return <Code2 className="w-5 h-5 text-cyan-400" />;
  if (c.includes('git')) return <GitBranch className="w-5 h-5 text-orange-400" />;
  if (c.includes('django')) return <Server className="w-5 h-5 text-emerald-400" />;
  if (c.includes('spring')) return <Layers className="w-5 h-5 text-green-400" />;
  if (c.includes('script') || c.includes('js')) return <Zap className="w-5 h-5 text-yellow-400" />;
  return <BookOpen className="w-5 h-5 text-amber-400" />;
};

const CATEGORY_COLORS = {
  java: { grad: 'from-orange-500/15 to-amber-500/5', border: 'border-orange-500/20 hover:border-orange-400/40', text: 'text-orange-300' },
  python: { grad: 'from-green-500/15 to-emerald-500/5', border: 'border-green-500/20 hover:border-green-400/40', text: 'text-green-300' },
  sql: { grad: 'from-blue-500/15 to-cyan-500/5', border: 'border-blue-500/20 hover:border-blue-400/40', text: 'text-blue-300' },
  javascript: { grad: 'from-yellow-500/15 to-amber-500/5', border: 'border-yellow-500/20 hover:border-yellow-400/40', text: 'text-yellow-300' },
  default: { grad: 'from-amber-500/15 to-orange-500/5', border: 'border-amber-500/20 hover:border-amber-400/40', text: 'text-amber-300' },
};

const DIFFICULTY_CONFIG = {
  easy: { dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]', grad: 'from-emerald-500/15 to-green-500/5', border: 'border-emerald-500/30 hover:border-emerald-400/50', text: 'text-emerald-400', label: 'Easy' },
  medium: { dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]', grad: 'from-amber-500/15 to-yellow-500/5', border: 'border-amber-500/30 hover:border-amber-400/50', text: 'text-amber-400', label: 'Medium' },
  hard: { dot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.7)]', grad: 'from-rose-500/15 to-red-500/5', border: 'border-rose-500/30 hover:border-rose-400/50', text: 'text-rose-400', label: 'Hard' },
};

const emptyForm = {
  category: '', difficultyLevel: '', questionTitle: '',
  option1: '', option2: '', option3: '', option4: '', rightAnswer: '',
};

function QuestionManager() {
  const [searchParams] = useSearchParams();
  const isAiMode = searchParams.get('mode') === 'ai';

  const [categorySummary, setCategorySummary] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [pagedData, setPagedData] = useState({ content: [], page: { totalPages: 0, totalElements: 0, number: 0 } });
  const [currentPage, setCurrentPage] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const [myData, setMyData] = useState({ content: [], page: { totalPages: 0, totalElements: 0, number: 0 } });
  const [myPage, setMyPage] = useState(0);
  const [loadingMine, setLoadingMine] = useState(false);

  const { toasts, showToast, removeToast } = useToast();
  const { isAdmin } = useAuth();
  const basePath = isAdmin ? '/admin/questions' : '/user/questions';

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [aiTopic, setAiTopic] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState('easy');
  const [aiCount, setAiCount] = useState(3);
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  
  const fetchSummary = useCallback(async () => {
    try {
      const res = await getCategorySummary();
      setCategorySummary(res.data);
    } catch {
      showToast('Could not load categories. Is the backend running on :8080?', 'error');
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const fetchMyQuestions = useCallback(async (page = 0) => {
    setLoadingMine(true);
    try {
      const res = await getMyQuestions(page);
      setMyData(res.data);
      setMyPage(page);
    } catch {
      showToast('Could not load your questions.', 'error');
    } finally {
      setLoadingMine(false);
    }
  }, []);

  const fetchPagedQuestions = useCallback(async (page = 0) => {
    if (!selectedCategory || !selectedDifficulty) return;
    setLoadingQuestions(true);
    try {
      const res = await getPagedQuestions(selectedCategory, selectedDifficulty, page);
      setPagedData(res.data);
      setCurrentPage(page);
    } catch {
      showToast('Could not load questions.', 'error');
    } finally {
      setLoadingQuestions(false);
    }
  }, [selectedCategory, selectedDifficulty]);

  useEffect(() => {
    fetchSummary();

    if (!isAdmin) {
      fetchMyQuestions();
    }
  }, [fetchSummary, fetchMyQuestions, isAdmin]);

  useEffect(() => {
    if (selectedCategory && selectedDifficulty) fetchPagedQuestions(0);
  }, [selectedCategory, selectedDifficulty]);

  const view = selectedDifficulty ? 'questions' : selectedCategory ? 'difficulties' : 'categories';
  const categoryMap = categorySummary.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.count;
    return acc;
  }, {});
  const difficultyData = categorySummary.filter(item => item.category === selectedCategory);
  const getCatConfig = (cat) => CATEGORY_COLORS[cat?.toLowerCase()] || CATEGORY_COLORS.default;
  const uniqueCategories = [...new Set(categorySummary.map((s) => s.category))];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateQuestion(editingId, form);
        showToast('Question updated successfully.', 'success');
      } else {
        await addQuestion(form);
        showToast('Question added successfully.', 'success');
      }
      setForm(emptyForm);
      setEditingId(null);

      fetchSummary();

      if (isAdmin && view === 'questions') {
        fetchPagedQuestions(currentPage);
      }

      if (!isAdmin) {
        fetchMyQuestions(myPage);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save question.', 'error');
    }
  };

  const handleEdit = (q) => {
    setForm({
      category: q.category,
      difficultyLevel: q.difficultyLevel,
      questionTitle: q.questionTitle,
      option1: q.option1,
      option2: q.option2,
      option3: q.option3,
      option4: q.option4,
      rightAnswer: q.rightAnswer,
    });
    setEditingId(q.pk);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await deleteQuestion(id);
      showToast('Question deleted successfully.', 'success');

      fetchSummary();

      if (isAdmin) {
        fetchPagedQuestions(currentPage);
      }

      if (!isAdmin) {
        // If deleting last item on page, go back one page
        const newPage = myData.content.length === 1 && myPage > 0 ? myPage - 1 : myPage;
        fetchMyQuestions(newPage);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete question.', 'error');
    }
  };

  const cancelEdit = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setAiLoading(true);
    try {
      const res = await generateQuestions(aiTopic, aiDifficulty, aiCount);
      setGeneratedQuestions(res.data.questions);
      if (res.data.duplicatesSkipped > 0) {
        showToast(
          `Generated ${res.data.questions.length} of ${res.data.requested} — ${res.data.duplicatesSkipped} duplicate${res.data.duplicatesSkipped > 1 ? 's' : ''} skipped.`,
          'success'
        );
      } else {
        showToast(`Generated ${res.data.questions.length} questions. Review and add below.`, 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to generate questions.', 'error');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddGenerated = async (question, index) => {
    try {
      await addQuestion(question);
      showToast('Question added to bank.', 'success');
      setGeneratedQuestions((prev) => prev.filter((_, i) => i !== index));
      fetchSummary();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add question.', 'error');
    }
  };

  const handleDiscardGenerated = (index) => {
    setGeneratedQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isAiMode ? 'bg-amber-500/10 border border-amber-500/25 text-amber-400' : 'bg-zinc-800 border border-zinc-700 text-zinc-300'
          }`}>
            {isAiMode ? <Sparkles className="w-5 h-5" /> : <FolderKanban className="w-5 h-5" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {isAiMode ? 'AI Question Generator' : 'Manage Questions'}
            </h1>
            <p className="text-xs text-zinc-400">
              {isAiMode
                ? 'Generate questions using AI and review them into your central repository'
                : 'Add, update, or remove items from your central question repository'}
            </p>
          </div>
        </div>

        {isAiMode ? (
          <Link
            to={basePath}
            className="text-xs font-semibold text-zinc-300 hover:text-white px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700/80 hover:bg-zinc-800 transition-colors"
          >
            Switch to Manual Mode
          </Link>
        ) : (
          <Link
            to={`${basePath}?mode=ai`}
            className="text-xs font-semibold text-amber-300 hover:text-white px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-1.5 hover:bg-amber-500/20 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Generator Mode</span>
          </Link>
        )}
      </div>

      {/* AI Question Generator (Only visible in AI Mode) */}
      {isAiMode && (
        <div className="glass-card p-6 rounded-2xl mb-10 shadow-xl border border-zinc-800">
          <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Generate Questions with AI</span>
          </h2>

          <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
            <select
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              required
              className="md:col-span-2 bg-zinc-900 border border-zinc-700/80 focus:border-amber-500 text-zinc-100 rounded-xl px-4 py-2.5 text-sm outline-none cursor-pointer"
            >
              <option value="" disabled>Select a category</option>
              {uniqueCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={aiDifficulty}
              onChange={(e) => setAiDifficulty(e.target.value)}
              className="bg-zinc-900 border border-zinc-700/80 focus:border-amber-500 text-zinc-100 rounded-xl px-4 py-2.5 text-sm outline-none cursor-pointer"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <input
              type="number"
              min="1"
              max="10"
              value={aiCount}
              onChange={(e) => setAiCount(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-700/80 focus:border-amber-500 text-zinc-100 rounded-xl px-4 py-2.5 text-sm outline-none font-mono"
            />

            <button
              type="submit"
              disabled={aiLoading}
              className="md:col-span-4 inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-bold px-5 py-3 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{aiLoading ? 'Generating Questions...' : 'Generate Questions'}</span>
            </button>
          </form>

          {generatedQuestions.length > 0 && (
            <div className="mt-6 space-y-3 pt-4 border-t border-slate-800">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Review & Add ({generatedQuestions.length})
              </p>
              {generatedQuestions.map((q, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white text-sm">{q.questionTitle}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {q.category} · {q.difficultyLevel} · Answer: <span className="text-emerald-400">{q.rightAnswer}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAddGenerated(q, idx)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                    <button
                      onClick={() => handleDiscardGenerated(idx)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-300 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Discard</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

            {/* Manual Form (Compact 3-Row Layout) */}
      {!isAiMode && (
        <div className="glass-card p-4 sm:p-5 rounded-2xl mb-6 border border-zinc-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>{editingId ? 'Edit Question' : 'Add New Question'}</span>
            </h2>
            {editingId && (
              <span className="text-[11px] text-amber-400 font-mono">Editing #{editingId}</span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5">
            {/* Row 1: Category Dropdown, Difficulty Dropdown, and Right Answer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Category Dropdown */}
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-amber-500 text-zinc-100 rounded-xl px-3 py-2.5 text-xs sm:text-sm outline-none transition-all cursor-pointer"
              >
                <option value="" disabled className="bg-zinc-900 text-zinc-400">
                  Select Category
                </option>
                {uniqueCategories.map((c) => (
                  <option key={c} value={c} className="bg-zinc-900 text-zinc-100 capitalize">
                    {c}
                  </option>
                ))}
              </select>

              {/* Difficulty Dropdown */}
              <select
                name="difficultyLevel"
                value={form.difficultyLevel}
                onChange={handleChange}
                required
                className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-amber-500 text-zinc-100 rounded-xl px-3 py-2.5 text-xs sm:text-sm outline-none transition-all cursor-pointer"
              >
                <option value="" disabled className="bg-zinc-900 text-zinc-400">
                  Select Difficulty
                </option>
                <option value="easy" className="bg-zinc-900 text-zinc-100">
                  Easy
                </option>
                <option value="medium" className="bg-zinc-900 text-zinc-100">
                  Medium
                </option>
                <option value="hard" className="bg-zinc-900 text-zinc-100">
                  Hard
                </option>
              </select>

              {/* Correct Answer */}
              <input
                name="rightAnswer"
                value={form.rightAnswer}
                onChange={handleChange}
                placeholder="Correct Answer (exact match)"
                required
                className="bg-zinc-900 border border-emerald-500/50 focus:border-emerald-400 text-emerald-300 rounded-xl px-3 py-2.5 text-xs sm:text-sm placeholder-zinc-500 outline-none transition-all font-mono"
              />
            </div>

            {/* Row 2: Question Prompt */}
            <input
              name="questionTitle"
              value={form.questionTitle}
              onChange={handleChange}
              placeholder="Question Title / Prompt..."
              required
              className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-amber-500 text-zinc-100 rounded-xl px-3 py-2.5 text-xs sm:text-sm placeholder-zinc-500 outline-none transition-all"
            />

            {/* Row 3: All 4 Options in 1 Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <input
                name="option1"
                value={form.option1}
                onChange={handleChange}
                placeholder="Option 1"
                required
                className="bg-zinc-900 border border-zinc-700/80 focus:border-amber-500 text-zinc-100 rounded-xl px-3 py-2.5 text-xs sm:text-sm placeholder-zinc-500 outline-none transition-all font-mono"
              />
              <input
                name="option2"
                value={form.option2}
                onChange={handleChange}
                placeholder="Option 2"
                required
                className="bg-zinc-900 border border-zinc-700/80 focus:border-amber-500 text-zinc-100 rounded-xl px-3 py-2.5 text-xs sm:text-sm placeholder-zinc-500 outline-none transition-all font-mono"
              />
              <input
                name="option3"
                value={form.option3}
                onChange={handleChange}
                placeholder="Option 3"
                required
                className="bg-zinc-900 border border-zinc-700/80 focus:border-amber-500 text-zinc-100 rounded-xl px-3 py-2.5 text-xs sm:text-sm placeholder-zinc-500 outline-none transition-all font-mono"
              />
              <input
                name="option4"
                value={form.option4}
                onChange={handleChange}
                placeholder="Option 4"
                required
                className="bg-zinc-900 border border-zinc-700/80 focus:border-amber-500 text-zinc-100 rounded-xl px-3 py-2.5 text-xs sm:text-sm placeholder-zinc-500 outline-none transition-all font-mono"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{editingId ? 'Update Question' : 'Save Question'}</span>
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Breadcrumb */}
      {isAdmin && (
      <>
      <div className="flex items-center gap-2 text-sm mb-6 px-1">
        <button
          onClick={() => { setSelectedCategory(null); setSelectedDifficulty(null); }}
          className={`font-medium transition-colors ${view === 'categories' ? 'text-white cursor-default' : 'text-amber-400 hover:text-amber-300 cursor-pointer'}`}
        >
          Question Bank
        </button>
        {selectedCategory && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <button
              onClick={() => setSelectedDifficulty(null)}
              className={`font-medium capitalize transition-colors ${view === 'difficulties' ? 'text-white cursor-default' : 'text-amber-400 hover:text-amber-300 cursor-pointer'}`}
            >
              {selectedCategory}
            </button>
          </>
        )}
        {selectedDifficulty && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <span className="font-medium text-white capitalize">{selectedDifficulty}</span>
          </>
        )}
      </div>

      {/* Level 1: Category Cards (Compact & Balanced) */}
      {view === 'categories' && (
        loadingSummary ? (
          <div className="text-center py-12 text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading categories...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {Object.entries(categoryMap).map(([cat, count]) => {
              const cfg = getCatConfig(cat);
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`bg-gradient-to-br ${cfg.grad} border ${cfg.border} rounded-xl p-3 flex items-center gap-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer group`}
                >
                  <span className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center shrink-0">
                    {getCategoryIcon(cat)}
                  </span>
                  <div className="min-w-0">
                    <p className={`font-bold capitalize text-sm truncate ${cfg.text}`}>{cat}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{count} questions</p>
                  </div>
                </button>
              );
            })}
          </div>
        )
      )}

      {/* Level 2: Difficulty Cards (Compact 3-Pill Layout) */}
      {view === 'difficulties' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {['easy', 'medium', 'hard'].map((diff) => {
            const cfg = DIFFICULTY_CONFIG[diff];
            const found = difficultyData.find((d) => d.difficultyLevel?.toLowerCase() === diff);
            const count = found?.count ?? 0;
            return (
              <button
                key={diff}
                onClick={() => count > 0 && setSelectedDifficulty(diff)}
                disabled={count === 0}
                className={`bg-gradient-to-br ${cfg.grad} border ${cfg.border} rounded-xl p-3.5 flex items-center gap-3.5 text-left transition-all ${
                  count > 0 ? 'hover:-translate-y-0.5 hover:shadow-lg cursor-pointer' : 'opacity-40 cursor-not-allowed'
                }`}
              >
                <span className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center shrink-0">
                  <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${cfg.text}`}>{cfg.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{count} questions available</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Level 3: Paginated Questions (Ultra-Compact Rows) */}
      {view === 'questions' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1 mb-1">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider capitalize">
              {selectedCategory} · {selectedDifficulty} ({pagedData.page?.totalElements ?? 0} questions)
            </h3>
          </div>

          {loadingQuestions ? (
            <div className="text-center py-10 text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading questions...
            </div>
          ) : (
            <>
              {pagedData.content.map((q) => (
                <div
                  key={q.pk}
                  className="glass-card glass-card-hover px-3.5 py-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border border-slate-800/90 hover:border-slate-700 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap text-[11px] mb-1">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border-amber-500/25 text-amber-300 font-mono font-semibold uppercase text-[10px]">
                        {q.category}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 capitalize text-[10px]">
                        {q.difficultyLevel}
                      </span>
                      <span className="text-slate-500">
                        • by <span className="text-slate-400">{q.createdBy || 'System/Admin'}</span>
                      </span>
                    </div>

                    <p className="font-medium text-white text-sm leading-snug truncate">
                      {q.questionTitle}
                    </p>

                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
                      <span className="text-slate-500 text-[10px]">Ans:</span>
                      <span className="text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                        ✓ {q.rightAnswer}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 sm:self-center">
                    <button
                      onClick={() => handleEdit(q)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 px-2 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(q.pk)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {(pagedData.page?.totalPages ?? 0) > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => fetchPagedQuestions(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Prev
                  </button>
                  <span className="text-xs text-slate-400 font-mono">
                    Page {currentPage + 1} / {pagedData.page?.totalPages}
                  </span>
                  <button
                    onClick={() => fetchPagedQuestions(currentPage + 1)}
                    disabled={currentPage + 1 >= (pagedData.page?.totalPages ?? 0)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  )}

  {!isAdmin && (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1 mb-1">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Your Questions ({myData.page?.totalElements ?? 0})
        </h3>
      </div>

      {loadingMine ? (
        <div className="text-center py-10 text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading your questions...
        </div>
      ) : myData.content.length === 0 ? (
        <div className="glass-card p-8 rounded-xl text-center border border-slate-800">
          <p className="text-slate-400 text-sm">
            You haven't added any questions yet.
          </p>
        </div>
      ) : (
        <>
          {myData.content.map((q) => (
            <div
              key={q.pk}
              className="glass-card glass-card-hover px-3.5 py-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border border-slate-800/90 hover:border-slate-700 transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap text-[11px] mb-1">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border-amber-500/25 text-amber-300 font-mono font-semibold uppercase text-[10px]">
                    {q.category}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 capitalize text-[10px]">
                    {q.difficultyLevel}
                  </span>
                </div>

                <p className="font-medium text-white text-sm leading-snug truncate">
                  {q.questionTitle}
                </p>

                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
                  <span className="text-slate-500 text-[10px]">Ans:</span>
                  <span className="text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 text-[10px]">
                    ✓ {q.rightAnswer}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 sm:self-center">
                <button
                  onClick={() => handleEdit(q)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 px-2 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(q.pk)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 px-2 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}

          {/* User Questions Pagination — server-side */}
          {(myData.page?.totalPages ?? 0) > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <button
                onClick={() => fetchMyQuestions(myPage - 1)}
                disabled={myPage === 0}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <span className="text-xs text-slate-400 font-mono">
                Page {myPage + 1} / {myData.page?.totalPages}
              </span>
              <button
                onClick={() => fetchMyQuestions(myPage + 1)}
                disabled={myPage + 1 >= (myData.page?.totalPages ?? 0)}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )}

    </div>
  );
}

export default QuestionManager;