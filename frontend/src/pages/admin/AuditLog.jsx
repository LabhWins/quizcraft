import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { History as HistoryIcon, Plus, Pencil, Trash, ArrowLeft } from 'lucide-react';

function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/question/auditlog').then((res) => setLogs(res.data)).finally(() => setLoading(false));
  }, []);

  const iconFor = (action) => {
    if (action === 'ADD') return <Plus className="w-4 h-4 text-emerald-400" />;
    if (action === 'UPDATE') return <Pencil className="w-4 h-4 text-amber-400" />;
    return <Trash className="w-4 h-4 text-rose-400" />;
  };

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>
      <div className="flex items-center gap-3 mb-8">
        <HistoryIcon className="w-6 h-6 text-amber-400" />
        <h1 className="text-2xl font-bold text-white">Activity Log</h1>
      </div>
      {loading ? (
        <p className="text-zinc-400">Loading...</p>
      ) : (
        <div className="space-y-2">
          {logs.map((l) => (
            <div key={l.id} className="glass-card p-4 rounded-xl flex items-center gap-3 border border-zinc-800">
              {iconFor(l.action)}
              <div className="flex-1">
                <p className="text-sm text-zinc-100">
                  <span className="font-semibold text-white">{l.username}</span> {l.action.toLowerCase()}ed "{l.questionTitle}"
                </p>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">{new Date(l.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AuditLog;