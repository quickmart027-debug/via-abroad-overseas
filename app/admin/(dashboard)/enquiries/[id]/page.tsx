import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, MessageCircle } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { getEnquiryById, listAdminNotes } from "@/lib/database/admin-queries";
import { StatusSelect } from "@/components/admin/status-select";
import { NotesPanel } from "@/components/admin/notes-panel";
import { z } from "zod";

/**
 * wa.me link that opens a chat WITH THE STUDENT (not the business number).
 * wa.me needs digits only, including the country code; a bare 10-digit
 * Indian mobile (starts 6-9) gets the 91 prefix.
 */
function studentWhatsappHref(phone: string, message: string) {
  let digits = phone.replace(/\D/g, "");
  if (/^0?[6-9]\d{9}$/.test(digits)) digits = `91${digits.slice(-10)}`;
  if (digits.length < 10) return undefined;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export default async function AdminEnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const enquiry = await getEnquiryById(supabase, id);
  if (!enquiry) notFound();

  const notes = await listAdminNotes(supabase, id);
  const whatsappHref = studentWhatsappHref(
    enquiry.phone,
    `Hello ${enquiry.full_name}, this is VIA ABROAD OVERSEAS following up on your enquiry.`
  );

  const fields: [string, string | null][] = [
    ["Interested Country", enquiry.interested_country],
    ["Service Required", enquiry.service_required],
    ["Current Qualification", enquiry.current_qualification],
    ["Interested Course", enquiry.interested_course],
    ["Source Page", enquiry.source_path],
    ["UTM Source", enquiry.utm_source],
    ["UTM Medium", enquiry.utm_medium],
    ["UTM Campaign", enquiry.utm_campaign],
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/admin/enquiries" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Enquiries
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{enquiry.full_name}</h1>
            <p className="mt-1 text-sm capitalize text-slate-500">
              {enquiry.enquiry_type === "consultation" ? "Consultation Request" : "General Enquiry"} ·{" "}
              {new Date(enquiry.created_at).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
          <StatusSelect enquiryId={enquiry.id} currentStatus={enquiry.status} />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={`tel:${enquiry.phone}`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {enquiry.phone}
          </a>
          <a
            href={`mailto:${enquiry.email}`}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            {enquiry.email}
          </a>
          {whatsappHref && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp
            </a>
          )}
        </div>

        <dl className="mt-6 grid gap-x-6 gap-y-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          {fields
            .filter(([, value]) => Boolean(value))
            .map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
                <dd className="mt-0.5 text-sm text-slate-800">{value}</dd>
              </div>
            ))}
        </dl>

        {enquiry.message && (
          <div className="mt-6 border-t border-slate-100 pt-6">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Message</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{enquiry.message}</dd>
          </div>
        )}
      </div>

      <NotesPanel enquiryId={enquiry.id} notes={notes} />
    </div>
  );
}
