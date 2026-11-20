import { useCallback, useEffect, useState } from "react";
import { Check, X, Star, RefreshCw, MessageSquare } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useLanguageStore } from "../features/language/languageStore";

type ReviewRow = {
  id: string; display_name: string; rating: number; title: string; body: string;
  status: "pending" | "approved" | "rejected"; created_at: string; user_id: string;
};
const labels = {
  en: { title: "Customer Reviews", subtitle: "Review and moderate customer feedback before it appears in the store.", refresh: "Refresh", loading: "Loading reviews...", empty: "No reviews found.", pending: "Pending", approved: "Approved", rejected: "Rejected", approve: "Approve", reject: "Reject", customer: "Customer", loadError: "Couldn't load reviews. Check the product_reviews table and admin permissions.", updateError: "Couldn't update this review.", updateSuccess: "Review status updated.", updating: "Updating review...", noRow: "No review was updated. Check admin permissions (RLS)." },
  fa: { title: "نظرات مشتریان", subtitle: "نظرات را بررسی و قبل از نمایش در فروشگاه تأیید کنید.", refresh: "بارگذاری مجدد", loading: "در حال دریافت نظرات...", empty: "نظری ثبت نشده است.", pending: "در انتظار بررسی", approved: "تأییدشده", rejected: "ردشده", approve: "تأیید", reject: "رد نظر", customer: "مشتری", loadError: "دریافت نظرات ناموفق بود. جدول product_reviews و دسترسی ادمین را بررسی کنید.", updateError: "به‌روزرسانی نظر انجام نشد.", updateSuccess: "وضعیت نظر به‌روزرسانی شد.", updating: "در حال به‌روزرسانی نظر...", noRow: "هیچ نظری تغییر نکرد. دسترسی ادمین (RLS) را بررسی کنید." }
};

export function Reviews() {
  const language = useLanguageStore(s => s.language);
  const t = labels[language === "fa" ? "fa" : "en"];
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data, error: queryError } = await supabase.from("product_reviews")
        .select("id,display_name,rating,title,body,status,created_at,user_id")
        .order("created_at", { ascending: false });
      if (queryError) { setError(`${t.loadError} ${queryError.message}`); setReviews([]); }
      else setReviews((data ?? []) as ReviewRow[]);
    } catch (err) {
      setError(`${t.loadError} ${err instanceof Error ? err.message : String(err)}`);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [t.loadError]);

  useEffect(() => { void loadReviews(); }, [loadReviews]);

  async function moderate(id: string, status: "approved" | "rejected") {
    if (updatingId) return;
    setUpdatingId(id);
    setNotice(t.updating);
    setError("");
    try {
      const { data, error: updateError } = await supabase
        .from("product_reviews")
        .update({ status })
        .eq("id", id)
        .select("id")
        .maybeSingle();

      if (updateError) {
        console.error("[ROSA reviews] moderation failed:", updateError);
        setNotice("");
        setError(`${t.updateError} ${updateError.message}`);
        return;
      }
      if (!data) {
        setNotice("");
        setError(t.noRow);
        return;
      }

      setNotice(t.updateSuccess);
      await loadReviews();
    } catch (err) {
      console.error("[ROSA reviews] unexpected moderation error:", err);
      setNotice("");
      setError(`${t.updateError} ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUpdatingId(null);
    }
  }

  const pendingCount = reviews.filter(r => r.status === "pending").length;
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.title}</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.subtitle}</p></div>
      <button type="button" onClick={() => void loadReviews()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><RefreshCw size={16}/>{t.refresh}</button>
    </div>
    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"><MessageSquare size={20}/><span className="text-sm font-medium">{t.pending}: {pendingCount}</span></div>
    {notice && <p role="status" aria-live="polite" className="text-sm text-emerald-600">{notice}</p>}
    {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
    {loading ? <div className="rounded-xl border bg-white p-10 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">{t.loading}</div>
      : reviews.length === 0 ? <div className="rounded-xl border bg-white p-10 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">{t.empty}</div>
      : <div className="space-y-4">{reviews.map(item => <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h2 className="font-semibold text-slate-900 dark:text-white">{item.display_name || t.customer}</h2><p className="mt-1 text-xs text-slate-500">{item.title}</p></div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "approved" ? "bg-emerald-100 text-emerald-700" : item.status === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>{t[item.status]}</span>
        </div>
        <div className="mt-3 flex items-center gap-1 text-amber-500" aria-label={`${item.rating} / 5`}>{Array.from({ length: item.rating }).map((_, i) => <Star key={i} size={15} fill="currentColor"/>)}</div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">{item.body}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <time className="text-xs text-slate-400">{new Date(item.created_at).toLocaleString(language === "fa" ? "fa-IR" : "en-US")}</time>
          {item.status === "pending" && <div className="flex gap-2">
            <button type="button" disabled={updatingId !== null} onClick={(event) => { event.preventDefault(); event.stopPropagation(); void moderate(item.id, "approved"); }} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"><Check size={14}/>{updatingId === item.id ? t.updating : t.approve}</button>
            <button type="button" disabled={updatingId !== null} onClick={(event) => { event.preventDefault(); event.stopPropagation(); void moderate(item.id, "rejected"); }} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"><X size={14}/>{updatingId === item.id ? t.updating : t.reject}</button>
          </div>}
        </div>
      </article>)}</div>}
  </div>;
}
