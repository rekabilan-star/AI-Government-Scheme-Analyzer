import React, { useState, useEffect } from 'react';
import { feedbackApi } from '../services/api.js';
import { Feedback } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { Star, MessageSquareHeart, CheckCircle2, AlertCircle, Send } from 'lucide-react';

export const FeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [category, setCategory] = useState<any>('Eligibility Analyzer');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const res = await feedbackApi.getAllFeedback();
      setFeedbacks(res.data.feedbacks || []);
    } catch (e) {
      // Non-blocking
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg('Please sign in as a citizen or administrator to submit feedback.');
      return;
    }

    if (comment.trim().length < 5) {
      setErrorMsg('Please provide a comment of at least 5 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await feedbackApi.submitFeedback({
        rating,
        category,
        comment: comment.trim()
      });

      setSuccessMsg('Thank you! Your feedback has been registered and helps improve public services.');
      setComment('');
      setRating(5);
      loadFeedback();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md mb-2">
            <MessageSquareHeart className="w-3.5 h-3.5" />
            <span>Citizen Satisfaction & Governance Feedback</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Citizen Feedback & Ratings
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            Help us improve scheme recommendation precision, eligibility rule clarity, and public accessibility.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Submit Your Rating & Experience</h2>

        {successMsg && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Service Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-slate-300 hover:scale-110 transition-transform focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-slate-700">
                {rating} out of 5 stars
              </span>
            </div>
          </div>

          {/* Feedback Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Domain / Module</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Eligibility Analyzer">Eligibility Analyzer & Rules</option>
              <option value="AI Assistant">Gemini AI Assistant Chatbot</option>
              <option value="Scheme Accuracy">Scheme Information & Criteria Accuracy</option>
              <option value="UI & Usability">UI, Navigation & Accessibility</option>
              <option value="General Suggestion">General Citizen Suggestion</option>
            </select>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Detailed Comment</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe your experience, scheme clarity, or suggestions for enhancement..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Citizen Review'}</span>
          </button>
        </form>
      </div>

      {/* Community Feedback Highlights */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Recent Citizen Reviews</h2>

        <div className="space-y-3">
          {feedbacks.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Be the first to share your experience!</p>
          ) : (
            feedbacks.slice(0, 8).map(fb => (
              <div key={fb.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{fb.userName}</span>
                    <span className="text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {fb.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${star <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-slate-700 font-medium leading-relaxed">{fb.comment}</p>

                {fb.adminResponse && (
                  <div className="mt-2 p-2.5 bg-blue-50/60 rounded-lg border border-blue-100 text-[11px] text-blue-900">
                    <span className="font-bold text-blue-700 block">Administration Response:</span>
                    <p className="mt-0.5">{fb.adminResponse}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
