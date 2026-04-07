import { Star } from "lucide-react";
import { formatDate } from "@/utils/index.js";

export default function ReviewList({ reviews }) {
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <article key={review.id} className="surface p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-950">{review.userName}</p>
              <p className="text-sm text-slate-500">{formatDate(review.createdAt)}</p>
            </div>
            <div className="inline-flex items-center gap-1 text-sm font-medium text-slate-700">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {review.rating}
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">{review.comment}</p>
        </article>
      ))}
    </div>
  );
}

