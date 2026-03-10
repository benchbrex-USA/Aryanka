'use client';

import { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';

export default function NpsWidget() {
  const [show, setShow]         = useState(false);
  const [score, setScore]       = useState<number | null>(null);
  const [comment, setComment]   = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check if we should show the NPS widget
    const dismissed = sessionStorage.getItem('nps_dismissed');
    if (dismissed) return;

    fetch('/api/nps')
      .then((r) => r.json())
      .then((data) => {
        if (data.shouldShow) {
          // Delay 3 seconds after page load
          setTimeout(() => setShow(true), 3000);
        }
      })
      .catch(() => {});
  }, []);

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem('nps_dismissed', '1');
  };

  const handleSubmit = async () => {
    if (score === null) return;
    setSubmitting(true);
    try {
      await fetch('/api/nps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, comment }),
      });
      setSubmitted(true);
      setTimeout(() => setShow(false), 2000);
    } catch {
      setShow(false);
    } finally {
      setSubmitting(false);
    }
  };

  const getLabel = (s: number) => {
    if (s <= 3)  return 'Not at all likely';
    if (s <= 6)  return 'Somewhat unlikely';
    if (s <= 8)  return 'Likely';
    return 'Extremely likely';
  };

  const getColor = (s: number) => {
    if (s <= 3)  return '#EF4444';
    if (s <= 6)  return '#F59E0B';
    if (s <= 8)  return '#3B82F6';
    return '#10B981';
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
      style={{ background: '#0d1117' }}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Quick feedback</span>
            </div>
            <p className="text-sm font-semibold text-white leading-snug">
              How likely are you to recommend Aryanka to a friend or colleague?
            </p>
          </div>
          <button onClick={handleDismiss} className="text-navy-500 hover:text-white transition-colors ml-3 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-4 text-center">
            <p className="text-accent-400 font-semibold text-sm">Thank you for your feedback! 🙏</p>
          </div>
        ) : (
          <>
            {/* Score buttons */}
            <div className="flex gap-1 mb-3">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setScore(i)}
                  className={`flex-1 h-8 rounded-lg text-xs font-semibold transition-all ${
                    score === i
                      ? 'text-white scale-105'
                      : 'text-navy-400 bg-white/5 hover:bg-white/10'
                  }`}
                  style={score === i ? { background: getColor(i), color: '#fff' } : {}}
                >
                  {i}
                </button>
              ))}
            </div>

            <div className="flex justify-between text-[10px] text-navy-600 mb-4">
              <span>Not likely</span>
              <span>Extremely likely</span>
            </div>

            {score !== null && (
              <p className="text-xs font-medium mb-3" style={{ color: getColor(score) }}>
                {getLabel(score)}
              </p>
            )}

            {score !== null && (
              <textarea
                placeholder="What could we improve? (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder-navy-500 border border-white/10 bg-white/[0.03] outline-none focus:border-brand-500/50 transition-colors resize-none mb-3"
              />
            )}

            <div className="flex gap-2">
              <button
                onClick={handleDismiss}
                className="flex-1 py-2 rounded-xl text-xs text-navy-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
              >
                Maybe later
              </button>
              <button
                onClick={handleSubmit}
                disabled={score === null || submitting}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-[#080808] transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #00D4FF, #3B82F6)' }}
              >
                {submitting ? 'Sending…' : 'Submit'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
