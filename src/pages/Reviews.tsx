import { useCallback, useEffect, useState } from "react";
import { Check, X, Star, RefreshCw, MessageSquare } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useLanguageStore } from "../features/language/languageStore";

type ReviewRow = { id: string; display_name: string | null; email: string; review: string; rating: number; status: "pending" | "approved" | "rejected"; is_demo: boolean; created_at: string };
const labels = {
 en: { title:"Customer Reviews", subtitle:"Review and moderate customer feedback before it appears in the store.", refresh:"Refresh", loading:"Loading reviews...", empty:"No reviews found.", pending:"Pending", approved:"Approved", rejected:"Rejected", demo:"DEMO", approve:"Approve", reject:"Reject", customer:"Customer", loadError:"Couldn't load reviews. Check the Supabase migration and admin permissions.", updateError:"Couldn't update this review.", updateSuccess:"Review status updated." },
 fa: { title:"نظرات مشتریان", subtitle:"نظرات را بررسی و قبل از نمایش در فروشگاه تأیید کنید.", refresh:"بارگذاری مجدد", loading:"در حال دریافت نظرات...", empty:"نظری ثبت نشده است.", pending:"در انتظار بررسی", approved:"تأییدشده", rejected:"ردشده", demo:"آزمایشی", approve:"تأیید", reject:"رد نظر", customer:"مشتری", loadError:"دریافت نظرات ناموفق بود. مهاجرت Supabase و دسترسی ادمین را بررسی کنید.", updateError:"به‌روزرسانی نظر انجام نشد.", updateSuccess:"وضعیت نظر به‌روزرسانی شد." }
};

export function Reviews() {
 const language = useLanguageStore(s => s.language);
 const t = labels[language === "fa" ? "fa" : "en"];
 const [reviews,setReviews] = useState<ReviewRow[]>([]);
 const [loading,setLoading] = useState(true);
 const [error,setError] = useState("");
 const [notice,setNotice] = useState("");
 const loadReviews = useCallback(async () => {
  setLoading(true); setError("");
  const {data,error:queryError} = await supabase.from("reviews").select("id,display_name,email,review,rating,status,is_demo,created_at").order("created_at",{ascending:false});
  if(queryError){setError(t.loadError);setReviews([]);} else setReviews((data ?? []) as ReviewRow[]);
  setLoading(false);
 },[t.loadError]);
 useEffect(()=>{void loadReviews();},[loadReviews]);
 async function moderate(id:string,status:"approved"|"rejected"){
  setNotice("");
  const {error:updateError}=await supabase.from("reviews").update({status}).eq("id",id);
  if(updateError){setNotice(t.updateError);return;}
  setNotice(t.updateSuccess); await loadReviews();
 }
 const pendingCount=reviews.filter(r=>r.status==="pending").length;
 return <div className="space-y-6">
  <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.title}</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.subtitle}</p></div><button onClick={()=>void loadReviews()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"><RefreshCw size={16}/>{t.refresh}</button></div>
  <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"><MessageSquare size={20}/><span className="text-sm font-medium">{t.pending}: {pendingCount}</span></div>
  {notice&&<p role="status" className="text-sm text-emerald-600">{notice}</p>}
  {error&&<p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
  {loading?<div className="rounded-xl border bg-white p-10 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">{t.loading}</div>:reviews.length===0?<div className="rounded-xl border bg-white p-10 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900">{t.empty}</div>:
   <div className="space-y-4">{reviews.map(item=><article key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-slate-900 dark:text-white">{item.display_name||t.customer}</h2>{item.is_demo&&<span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">{t.demo}</span>}</div><p className="mt-1 text-xs text-slate-500">{item.email}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status==="approved"?"bg-emerald-100 text-emerald-700":item.status==="rejected"?"bg-rose-100 text-rose-700":"bg-amber-100 text-amber-700"}`}>{t[item.status]}</span></div>
    <div className="mt-3 flex items-center gap-1 text-amber-500" aria-label={`${item.rating} / 5`}>{Array.from({length:item.rating}).map((_,i)=><Star key={i} size={15} fill="currentColor"/>)}</div>
    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">{item.review}</p>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800"><time className="text-xs text-slate-400">{new Date(item.created_at).toLocaleString(language==="fa"?"fa-IR":"en-US")}</time>{item.status==="pending"&&<div className="flex gap-2"><button onClick={()=>void moderate(item.id,"approved")} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"><Check size={14}/>{t.approve}</button><button onClick={()=>void moderate(item.id,"rejected")} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700"><X size={14}/>{t.reject}</button></div>}</div>
   </article>)}</div>}
 </div>;
}
