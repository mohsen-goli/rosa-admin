import { useCallback, useEffect, useState } from "react";
import { Check, RefreshCw, MessageSquare, Mail } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useLanguageStore } from "../features/language/languageStore";

type FeedbackRow = { id: string; name: string; email: string; message: string; status: "new" | "read"; created_at: string };
const labels = {
  en: { title: "User Messages", subtitle: "Messages sent through the ROSA store website.", refresh: "Refresh", loading: "Loading messages...", empty: "No messages yet.", new: "New", read: "Read", markRead: "Mark as read", markNew: "Mark as new", loadError: "Couldn't load messages. Check the site_feedback table and admin permissions.", updateError: "Couldn't update this message.", updateSuccess: "Message status updated." },
  fa: { title: "پیام‌های کاربران", subtitle: "پیام‌هایی که از طریق سایت فروشگاه ROSA ارسال شده‌اند.", refresh: "بارگذاری مجدد", loading: "در حال دریافت پیام‌ها...", empty: "هنوز پیامی ثبت نشده است.", new: "جدید", read: "خوانده‌شده", markRead: "علامت‌گذاری به‌عنوان خوانده‌شده", markNew: "علامت‌گذاری به‌عنوان جدید", loadError: "دریافت پیام‌ها ناموفق بود. جدول site_feedback و دسترسی ادمین را بررسی کنید.", updateError: "تغییر وضعیت پیام انجام نشد.", updateSuccess: "وضعیت پیام به‌روزرسانی شد." }
};

export function Feedback() {
  const language = useLanguageStore(s => s.language);
  const t = labels[language === "fa" ? "fa" : "en"];
  const [messages, setMessages] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: queryError } = await supabase.from("site_feedback")
        .select("id,name,email,message,status,created_at")
        .order("created_at", { ascending: false });
      if (queryError) {
        setError(t.loadError + " " + queryError.message);
        setMessages([]);
      } else {
        setMessages((data ?? []) as FeedbackRow[]);
      }
    } catch (err) {
      setError(t.loadError + " " + (err instanceof Error ? err.message : String(err)));
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [t.loadError]);

  useEffect(() => { void loadMessages(); }, [loadMessages]);

  async function updateStatus(id: string, status: "new" | "read") {
    if (updatingId) return;
    setUpdatingId(id);
    setNotice("");
    try {
      const { data, error: updateError } = await supabase
        .from("site_feedback")
        .update({ status })
        .eq("id", id)
        .select("id")
        .maybeSingle();
      if (updateError) {
        setNotice(t.updateError + " " + updateError.message);
        return;
      }
      if (!data) {
        setNotice(t.updateError);
        return;
      }
      setNotice(t.updateSuccess);
      await loadMessages();
    } catch (err) {
      setNotice(t.updateError + " " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUpdatingId(null);
    }
  }

  const newCount = messages.filter(message => message.status === "new").length;
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.title}</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.subtitle}</p></div>
      <button onClick={() => void loadMessages()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><RefreshCw size={16}/>{t.refresh}</button>
    </div>
    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"><MessageSquare size={20}/><span className="text-sm font-medium">{t.new}: {newCount}</span></div>
    {notice && <p role="status" className="text-sm text-emerald-600">{notice}</p>}
    {error && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
    {loading ? <div className="rounded-xl border bg-white p-10 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">{t.loading}</div>
      : messages.length === 0 ? <div className="rounded-xl border bg-white p-10 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">{t.empty}</div>
      : <div className="space-y-4">{messages.map(item => <article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div><h2 className="font-semibold text-slate-900 dark:text-white">{item.name}</h2><a href={`mailto:${item.email}`} className="mt-1 inline-flex items-center gap-1.5 text-xs text-pink-600 hover:underline dark:text-pink-400"><Mail size={13}/>{item.email}</a></div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "new" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>{t[item.status]}</span>
        </div>
        <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700 dark:text-slate-300">{item.message}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
          <time className="text-xs text-slate-400">{new Date(item.created_at).toLocaleString(language === "fa" ? "fa-IR" : "en-US")}</time>
          <button disabled={updatingId !== null} onClick={() => void updateStatus(item.id, item.status === "new" ? "read" : "new")} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            <Check size={14}/>{item.status === "new" ? t.markRead : t.markNew}
          </button>
        </div>
      </article>)}</div>}
  </div>;
}
