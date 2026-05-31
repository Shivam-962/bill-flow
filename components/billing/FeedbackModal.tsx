'use client';

import { useState } from 'react';
import { useErpStore } from '@/store/useErpStore';
import { X, Star, Sparkles, Send } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { dismissFeedbackPrompt } = useErpStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState('');
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const apiKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || '';

    // If key is present, POST to Web3Forms email dispatcher API
    if (apiKey) {
      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            access_key: apiKey,
            subject: 'New BillFlow ERP Feedback Review',
            name: name,
            email: email,
            message: `Rating: ${rating} Stars\n\nComments:\n${message}`
          })
        });

        const result = await response.json();
        if (result.success) {
          setIsSuccess(true);
          localStorage.setItem('bf_feedback_submitted', 'true');
          dismissFeedbackPrompt();
        } else {
          alert('Failed to send feedback: ' + result.message);
        }
      } catch (err) {
        console.error('Feedback send failed:', err);
        alert('Network error while submitting feedback. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Simulation mode if key is missing (ensures no crashes for user)
      setTimeout(() => {
        setIsSuccess(true);
        localStorage.setItem('bf_feedback_submitted', 'true');
        dismissFeedbackPrompt();
        setIsSubmitting(false);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl rounded-2xl overflow-hidden flex flex-col transition-all">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-850">
          <h3 className="font-poppins font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
            <Sparkles className="text-warning animate-pulse" size={16} />
            Share Your Feedback
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-success/15 text-success flex items-center justify-center mx-auto text-xl font-bold animate-bounce">
              ✓
            </div>
            <div>
              <h4 className="font-poppins font-bold text-slate-800 dark:text-white text-sm">Thank You for Your Feedback!</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Your response has been sent successfully. We use your reviews to constantly improve the billing terminal speed and layouts.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/95 transition-all"
            >
              Continue Billing
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              We noticed you've done multiple POS checkouts! Let us know how we can make the terminal faster or more convenient.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Cashier / Manager"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-primary transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@shop.com"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-primary transition"
                />
              </div>
            </div>

            {/* Stars rating selector */}
            <div className="space-y-1 text-center py-2">
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">Rate Your Experience</label>
              <div className="flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = hoveredRating !== null ? star <= hoveredRating : star <= rating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(null)}
                      className="p-1 text-slate-300 hover:scale-110 transition-transform duration-100"
                    >
                      <Star
                        size={22}
                        className={isActive ? 'fill-warning text-warning' : 'text-slate-350'}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Message / Suggestions</label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What can we improve? (e.g. barcode scanner speed, UI margins, button placements...)"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none resize-none focus:border-primary transition"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-primary text-white text-xs font-poppins font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/95 disabled:opacity-50 flex items-center justify-center gap-1.5 transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending Review...
                </>
              ) : (
                <>
                  <Send size={12} />
                  Send Feedback
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
