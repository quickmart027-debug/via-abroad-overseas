import Link from "next/link";
import { Download, Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth/admin";
import { listEnquiries } from "@/lib/database/admin-queries";
import { enquiryFiltersSchema } from "@/lib/validation/admin";
import { destinations } from "@/data/destinations";

const statusStyles: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  qualified: "bg-emerald-100 text-emerald-700",
  closed: "bg-slate-200 text-slate-600",
  spam: "bg-red-100 text-red-700",
};

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Authorize before touching any request input.
  const { supabase } = await requireAdmin();

  const rawParams = await searchParams;
  const flatParams = Object.fromEntries(
    Object.entries(rawParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  );
  // Hand-edited or stale query params fall back to the default view, not a 500.
  const parsedFilters = enquiryFiltersSchema.safeParse(flatParams);
  const filters = parsedFilters.success ? parsedFilters.data : enquiryFiltersSchema.parse({});
  const { rows, total } = await listEnquiries(supabase, filters);
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));

  function buildQuery(overrides: Record<string, string | number | undefined>) {
    const params = new URLSearchParams();
    const merged = { ...flatParams, ...overrides };
    Object.entries(merged).forEach(([key, value]) => {
      if (value !== undefined && value !== "") params.set(key, String(value));
    });
    return `/admin/enquiries?${params.toString()}`;
  }

  const exportQuery = new URLSearchParams();
  if (filters.type) exportQuery.set("type", filters.type);
  if (filters.status) exportQuery.set("status", filters.status);
  if (filters.country) exportQuery.set("country", filters.country);
  if (filters.search) exportQuery.set("search", filters.search);
  exportQuery.set("sort", filters.sort);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Enquiries</h1>
          <p className="mt-1 text-sm text-slate-500">{total} total records</p>
        </div>
        <a
          href={`/api/admin/export?${exportQuery.toString()}`}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Export CSV
        </a>
      </div>

      <form method="get" className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            name="search"
            placeholder="Search name, email, phone"
            defaultValue={filters.search}
            className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
          />
        </div>
        <select name="type" defaultValue={filters.type ?? ""} className="h-10 rounded-lg border border-slate-300 px-3 text-sm">
          <option value="">All Types</option>
          <option value="general">General Enquiry</option>
          <option value="consultation">Consultation</option>
        </select>
        <select name="status" defaultValue={filters.status ?? ""} className="h-10 rounded-lg border border-slate-300 px-3 text-sm">
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="closed">Closed</option>
          <option value="spam">Spam</option>
        </select>
        <select name="country" defaultValue={filters.country ?? ""} className="h-10 rounded-lg border border-slate-300 px-3 text-sm">
          <option value="">All Countries</option>
          {destinations.map((d) => (
            <option key={d.slug} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={filters.sort} className="h-10 rounded-lg border border-slate-300 px-3 text-sm">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
        <button
          type="submit"
          className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800 lg:col-span-1"
        >
          Apply Filters
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Country</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                  No enquiries match these filters.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <Link href={`/admin/enquiries/${row.id}`} className="font-medium text-slate-900 hover:text-gold-700">
                      {row.full_name}
                    </Link>
                    <p className="text-xs text-slate-500">{row.email}</p>
                  </td>
                  <td className="px-5 py-4 capitalize text-slate-600">{row.enquiry_type}</td>
                  <td className="px-5 py-4 text-slate-600">{row.interested_country || "—"}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {new Date(row.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-between text-sm text-slate-600" aria-label="Pagination">
          <span>
            Page {filters.page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Link
              href={buildQuery({ page: Math.max(1, filters.page - 1) })}
              aria-disabled={filters.page <= 1}
              className={`rounded-lg border border-slate-300 px-3 py-1.5 ${filters.page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-slate-100"}`}
            >
              Previous
            </Link>
            <Link
              href={buildQuery({ page: Math.min(totalPages, filters.page + 1) })}
              aria-disabled={filters.page >= totalPages}
              className={`rounded-lg border border-slate-300 px-3 py-1.5 ${filters.page >= totalPages ? "pointer-events-none opacity-40" : "hover:bg-slate-100"}`}
            >
              Next
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
