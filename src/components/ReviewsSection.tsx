import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2, MessageSquare, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { format } from "date-fns";

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHovered(i)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            className="w-6 h-6 transition-colors"
            fill={(hovered || value) >= i ? "#ffd700" : "none"}
            stroke={(hovered || value) >= i ? "#ffd700" : "#555"}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const initials = review.userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className="rounded-2xl p-5 border flex flex-col gap-3"
      style={{ background: "rgba(18,14,6,0.9)", borderColor: "rgba(201,168,76,0.1)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
            style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c" }}
          >
            {initials}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{review.userName}</p>
            <p className="text-gray-600 text-xs mt-0.5">
              {format(new Date(review.createdAt), "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <StarRating value={review.rating} />
      </div>
      <p className="text-gray-400 text-sm leading-relaxed">{review.comment}</p>
    </div>
  );
}

export default function ReviewsSection() {
  const { currentUser } = useAuth();
  const [, setLocation] = useLocation();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      const data = await res.json();
      setReviews(data);
    } catch {
      // silently fail
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const userAlreadyReviewed = currentUser
    ? reviews.some((r) => r.userId === currentUser.uid)
    : false;

  const handleSubmit = async () => {
    if (!currentUser) return;
    if (!comment.trim() || comment.trim().length < 5) {
      setError("Please write at least a few words.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.uid,
          userName: currentUser.displayName || currentUser.email?.split("@")[0] || "Guest",
          rating,
          comment: comment.trim(),
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to submit");
      }
      setSubmitted(true);
      setComment("");
      setRating(5);
      await fetchReviews();
    } catch (err: any) {
      setError(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-28 px-6" style={{ background: "#0d0b08" }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-[#c9a84c] text-xs tracking-widest uppercase mb-3 font-medium">
            What Clients Say
          </p>
          <h2
            className="font-serif font-bold text-white"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
          >
            Customer Reviews
          </h2>
          {avgRating && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <StarRating value={Math.round(Number(avgRating))} />
              <span className="text-[#ffd700] font-bold text-xl">{avgRating}</span>
              <span className="text-gray-500 text-sm">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
            </div>
          )}
        </div>

        {/* Write a Review */}
        <div
          className="rounded-2xl p-6 border mb-10 max-w-2xl mx-auto"
          style={{ background: "rgba(201,168,76,0.04)", borderColor: "rgba(201,168,76,0.15)" }}
        >
          {!currentUser ? (
            <div className="text-center py-4">
              <MessageSquare className="w-8 h-8 text-[#c9a84c]/50 mx-auto mb-3" />
              <p className="text-gray-400 text-sm mb-4">Sign in to leave a review</p>
              <Button
                onClick={() => setLocation("/login")}
                className="rounded-full px-6 h-10 text-black font-semibold text-sm"
                style={{ background: "linear-gradient(135deg, #c9a84c, #ffd700)" }}
              >
                Sign In to Review
              </Button>
            </div>
          ) : submitted || userAlreadyReviewed ? (
            <div className="text-center py-4">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-white font-semibold">Thanks for your review!</p>
              <p className="text-gray-500 text-sm mt-1">Your feedback helps others discover OneTouch.</p>
              {userAlreadyReviewed && !submitted && (
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-[#c9a84c] text-xs mt-3 hover:underline"
                >
                  Update your review
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-white font-semibold text-sm">Share your experience</p>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Your Rating</p>
                <StarRating value={rating} onChange={setRating} />
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Your Review</p>
                <Textarea
                  placeholder="How was your experience at OneTouch? (e.g. great haircut, friendly staff...)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="bg-black/30 border-[#c9a84c]/15 text-white placeholder:text-gray-600 rounded-xl resize-none"
                />
                {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
              </div>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !comment.trim()}
                className="rounded-full px-8 h-10 text-black font-semibold text-sm"
                style={{ background: "linear-gradient(135deg, #c9a84c, #ffd700)" }}
              >
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Submit Review"}
              </Button>
            </div>
          )}
        </div>

        {/* Reviews Grid */}
        {loadingReviews ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 text-[#c9a84c] animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-10 text-gray-600">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No reviews yet. Be the first to leave one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
