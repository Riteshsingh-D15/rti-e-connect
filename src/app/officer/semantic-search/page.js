"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bot,
  Check,
  Copy,
  FileSearch,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import { RoleShell } from "@/components/layout/role-shell";
import { Alert, Card, EmptyState } from "@/components/ui";
import { Button } from "@/components/ui/button";

const SAMPLE_QUERIES = [
  "Road construction expenditure and contractor bitumen quality report",
  "Government school laboratory grant and vacant teacher posts",
  "Jal Jeevan Mission drinking water pipeline TDS purity test",
  "Hospital generic medicine stock register",
];

export default function OfficerSemanticSearchPage() {
  const [queryText, setQueryText] = useState(SAMPLE_QUERIES[0]);
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");

  const runSearch = async (textToQuery = queryText, deptFilter = department) => {
    if (!textToQuery.trim()) return;
    setSearching(true);
    setError("");

    try {
      const res = await fetch("/api/ai/semantic-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          queryText: textToQuery.trim(),
          department: deptFilter || undefined,
          limit: 6,
          threshold: 0.15,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Semantic precedent search failed.");
      } else {
        setResults(data.results || []);
        setMeta({ provider: data.provider, isSimulated: data.isSimulated });
      }
    } catch {
      setError("Network error while querying vector similarity engine.");
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const res = await fetch("/api/departments");
        if (res.ok && active) {
          const list = await res.json();
          setDepartments(Array.isArray(list) ? list.map((d) => d.name) : []);
        }
      } catch {
        // ignore
      }
      if (active) {
        await runSearch(SAMPLE_QUERIES[0], "");
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(""), 2000);
    } catch {
      // ignore clipboard restriction
    }
  };

  return (
    <RoleShell
      title="Semantic Precedent Search (RAG Archive)"
      subtitle="Search historical approved RTI decisions via vector similarity to ensure statutory consistency."
      userRole="GOVERNMENT OFFICER"
    >
      <Card className="p-6 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(queryText, department);
          }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-3"
        >
          <div className="lg:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Describe the RTI query topic, legal issue, or scheme name..."
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div className="lg:col-span-4">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full h-11 px-3.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="">All Departments (Cross-Authority Search)</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" disabled={searching} className="lg:col-span-2 h-11 gap-2">
            {searching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileSearch className="w-4 h-4" />
            )}
            Search Archive
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Quick Precedent Queries:</span>
          {SAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                setQueryText(q);
                runSearch(q, department);
              }}
              className="text-xs px-3 py-1 rounded-full bg-[#F4F7FB] hover:bg-blue-50 text-[#102A43] border border-slate-200 transition-colors cursor-pointer"
            >
              {q.slice(0, 42)}…
            </button>
          ))}
        </div>

        {meta && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Bot className="w-4 h-4 text-[#2563EB]" />
            <span>
              Embedding Engine: <strong>{meta.provider}</strong> · Showing {results.length} matched
              historical orders
            </span>
          </div>
        )}
      </Card>

      {error && (
        <Alert type="error" title="Search Failed">
          {error}
        </Alert>
      )}

      {results.length === 0 && !searching ? (
        <EmptyState
          icon={FileSearch}
          title="No Matching Historical Orders Found"
          description="Try removing the department filter or widening the topic keywords."
        />
      ) : (
        <div className="space-y-4">
          {results.map((rec) => (
            <Card key={rec.id} className="p-6 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                      {rec.referenceNumber}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {rec.departmentName}
                    </span>
                    {rec.isHighConfidenceMatch && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <Sparkles className="w-3 h-3" /> Strong Precedent
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[#102A43]">{rec.subject}</h3>
                </div>

                {/* Similarity Progress Pill */}
                <div className="w-40 shrink-0">
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-slate-500">Similarity</span>
                    <span className="text-[#102A43]">{rec.similarityPercentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#2563EB]"
                      style={{ width: `${Math.min(100, rec.similarityPercentage)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#F4F7FB] border border-slate-200 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Historical Citizen Query
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">{rec.question}</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Approved PIO Order / Precedent Reply
                  </p>
                  <p className="text-sm text-slate-800 leading-relaxed">{rec.approvedResponse}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap gap-1.5">
                  {(rec.legalReferences || []).map((ref) => (
                    <span
                      key={ref}
                      className="text-[11px] font-medium px-2.5 py-0.5 rounded bg-slate-100 text-slate-700"
                    >
                      {ref}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(rec.id, rec.approvedResponse)}
                    className="gap-1.5"
                  >
                    {copiedId === rec.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Excerpt
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Excerpt
                      </>
                    )}
                  </Button>
                  <Link href="/officer/responses">
                    <Button size="sm" variant="navy">
                      Use in Response Studio
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </RoleShell>
  );
}
