import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Doc, Id } from "convex/_generated/dataModel";
import { formatDate } from "@/utils/formatDate";
import { getLostItemCategoryLabel } from "@/lib/lostItemCategories";
import {
  assessMatch,
  MATCH_CONFIDENCE_LABELS,
  MatchAssessment,
  MatchConfidence,
} from "@/lib/matchScoring";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Link2,
  Sparkles,
} from "lucide-react";

interface MatchPair {
  lost: Doc<"lost_items">;
  found: Doc<"found_items">;
  assessment: MatchAssessment;
}

type MatchItemsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (ids: {
    lostItemId: Id<"lost_items">;
    foundItemId: Id<"found_items">;
  }) => Promise<void>;
} & (
  | {
      fixedSide: "lost";
      lostItem: Doc<"lost_items"> | null;
      candidates: Doc<"found_items">[];
    }
  | {
      fixedSide: "found";
      foundItem: Doc<"found_items"> | null;
      candidates: Doc<"lost_items">[];
    }
);

const CONFIDENCE_BADGE_CLASSES: Record<MatchConfidence, string> = {
  high: "border-emerald-200 bg-emerald-50 text-emerald-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-slate-200 bg-slate-50 text-slate-600",
  none: "border-slate-200 bg-slate-50 text-slate-500",
};

function ConfidenceBadge({ confidence }: { confidence: MatchConfidence }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full font-medium",
        CONFIDENCE_BADGE_CLASSES[confidence],
      )}
    >
      {MATCH_CONFIDENCE_LABELS[confidence]}
    </Badge>
  );
}

function itemDate(item: Doc<"lost_items"> | Doc<"found_items">) {
  return "date_reported" in item ? item.date_reported : item.found_date;
}

function itemArea(item: Doc<"lost_items"> | Doc<"found_items">) {
  return "date_reported" in item ? item.location_lost : item.location_found;
}

function itemPerson(item: Doc<"lost_items"> | Doc<"found_items">) {
  return "date_reported" in item ? item.reporter_name : item.finder_name;
}

export default function MatchItemsDialog(props: MatchItemsDialogProps) {
  const { open, onOpenChange, onConfirm, fixedSide } = props;
  const fixedItem = fixedSide === "lost" ? props.lostItem : props.foundItem;
  const counterpartLabel = fixedSide === "lost" ? "found item" : "lost report";

  const [search, setSearch] = useState("");
  const [selectedPair, setSelectedPair] = useState<MatchPair | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelectedPair(null);
      setIsConfirming(false);
    }
  }, [open]);

  const pairs = useMemo<MatchPair[]>(() => {
    if (fixedItem == null) return [];
    const built =
      fixedSide === "lost"
        ? (props.candidates as Doc<"found_items">[]).map((found) => ({
            lost: fixedItem as Doc<"lost_items">,
            found,
            assessment: assessMatch(fixedItem as Doc<"lost_items">, found),
          }))
        : (props.candidates as Doc<"lost_items">[]).map((lost) => ({
            lost,
            found: fixedItem as Doc<"found_items">,
            assessment: assessMatch(lost, fixedItem as Doc<"found_items">),
          }));

    return built.sort(
      (a, b) =>
        b.assessment.score - a.assessment.score ||
        itemDate(candidateOf(b, fixedSide)) -
          itemDate(candidateOf(a, fixedSide)),
    );
  }, [fixedItem, fixedSide, props.candidates]);

  const suggestedPairs = useMemo(
    () =>
      pairs
        .filter(
          (pair) =>
            pair.assessment.confidence === "high" ||
            pair.assessment.confidence === "medium",
        )
        .slice(0, 5),
    [pairs],
  );

  const filteredPairs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query.length === 0) return pairs;
    return pairs.filter((pair) => {
      const candidate = candidateOf(pair, fixedSide);
      return (
        candidate.name.toLowerCase().includes(query) ||
        candidate.details?.toLowerCase().includes(query)
      );
    });
  }, [pairs, search, fixedSide]);

  const handleConfirm = async () => {
    if (selectedPair == null) return;
    setIsConfirming(true);
    try {
      await onConfirm({
        lostItemId: selectedPair.lost._id,
        foundItemId: selectedPair.found._id,
      });
      onOpenChange(false);
    } catch {
      // Errors are surfaced by the caller via toasts.
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        {selectedPair == null ? (
          <>
            <DialogHeader>
              <DialogTitle>Match with a {counterpartLabel}</DialogTitle>
              <DialogDescription>
                Pick a {counterpartLabel} to review side by side. Nothing is
                linked until you confirm.
              </DialogDescription>
            </DialogHeader>

            {fixedItem != null && (
              <FixedItemSummary item={fixedItem} side={fixedSide} />
            )}

            <div className="flex max-h-[55vh] min-h-[300px] flex-col gap-3 overflow-y-auto pr-1">
              {suggestedPairs.length > 0 && search.trim().length === 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Suggested matches
                  </div>
                  {suggestedPairs.map((pair) => (
                    <CandidateRow
                      key={candidateOf(pair, fixedSide)._id}
                      pair={pair}
                      fixedSide={fixedSide}
                      highlighted
                      onSelect={() => setSelectedPair(pair)}
                    />
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <div className="text-sm font-semibold text-slate-900">
                  All {counterpartLabel}s ({filteredPairs.length})
                </div>
                <Input
                  placeholder={`Search ${counterpartLabel}s by name or details...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {filteredPairs.length === 0 ? (
                  <p className="rounded-md border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
                    No unmatched {counterpartLabel}s
                    {search.trim().length > 0 ? " match this search." : " yet."}
                  </p>
                ) : (
                  filteredPairs.map((pair) => (
                    <CandidateRow
                      key={candidateOf(pair, fixedSide)._id}
                      pair={pair}
                      fixedSide={fixedSide}
                      onSelect={() => setSelectedPair(pair)}
                    />
                  ))
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Review this match</DialogTitle>
              <DialogDescription>
                Check both records side by side before linking them.
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              <MatchSignals assessment={selectedPair.assessment} />
              <ComparisonGrid pair={selectedPair} />
            </div>

            <DialogFooter className="gap-2 sm:justify-between">
              <Button
                variant="outline"
                onClick={() => setSelectedPair(null)}
                disabled={isConfirming}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to list
              </Button>
              <Button onClick={handleConfirm} disabled={isConfirming}>
                <Link2 className="mr-1 h-4 w-4" />
                {isConfirming ? "Linking..." : "Confirm match"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function candidateOf(pair: MatchPair, fixedSide: "lost" | "found") {
  return fixedSide === "lost" ? pair.found : pair.lost;
}

function FixedItemSummary({
  item,
  side,
}: {
  item: Doc<"lost_items"> | Doc<"found_items">;
  side: "lost" | "found";
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-500">
        {side === "lost" ? "Lost report to match" : "Found item to match"}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="font-semibold text-slate-950">{item.name}</span>
        {item.category_slug && (
          <Badge
            variant="secondary"
            className="rounded-full bg-slate-200 text-slate-700"
          >
            {getLostItemCategoryLabel(item.category_slug)}
          </Badge>
        )}
        <span className="text-sm text-slate-500">
          {formatDate(itemDate(item))}
          {itemArea(item) ? ` · ${itemArea(item)}` : ""}
        </span>
      </div>
      {item.details && (
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
          {item.details}
        </p>
      )}
    </div>
  );
}

function CandidateRow({
  pair,
  fixedSide,
  highlighted = false,
  onSelect,
}: {
  pair: MatchPair;
  fixedSide: "lost" | "found";
  highlighted?: boolean;
  onSelect: () => void;
}) {
  const candidate = candidateOf(pair, fixedSide);
  const { assessment } = pair;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border px-4 py-3 text-left transition-colors hover:border-sky-300 hover:bg-sky-50/60",
        highlighted
          ? "border-amber-200 bg-amber-50/40"
          : "border-slate-200 bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-950">{candidate.name}</span>
            {candidate.category_slug && (
              <Badge
                variant="secondary"
                className="rounded-full bg-slate-100 text-slate-700"
              >
                {getLostItemCategoryLabel(candidate.category_slug)}
              </Badge>
            )}
            {assessment.confidence !== "none" && (
              <ConfidenceBadge confidence={assessment.confidence} />
            )}
          </div>
          <p className="line-clamp-1 text-sm text-slate-600">
            {candidate.details || "No details provided."}
          </p>
          <p className="text-xs text-slate-500">
            {formatDate(itemDate(candidate))}
            {itemArea(candidate) ? ` · ${itemArea(candidate)}` : ""}
            {assessment.reasons.length > 0 &&
              ` · ${assessment.reasons.join(" · ")}`}
          </p>
        </div>
        <span className="mt-1 inline-flex shrink-0 items-center text-sm font-medium text-sky-700">
          Review
          <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </button>
  );
}

function MatchSignals({ assessment }: { assessment: MatchAssessment }) {
  if (assessment.confidence === "none") {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        These records share no obvious signals (category, keywords, area or
        dates). Double-check the details before confirming.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <ConfidenceBadge confidence={assessment.confidence} />
      {assessment.reasons.map((reason) => (
        <Badge
          key={reason}
          variant="outline"
          className="rounded-full border-slate-200 bg-white font-normal text-slate-600"
        >
          {reason}
        </Badge>
      ))}
    </div>
  );
}

function ComparisonGrid({ pair }: { pair: MatchPair }) {
  const { lost, found, assessment } = pair;

  const rows: Array<{
    label: string;
    lostValue?: string;
    foundValue?: string;
    matches?: boolean;
  }> = [
    { label: "Item", lostValue: lost.name, foundValue: found.name },
    {
      label: "Category",
      lostValue: lost.category_slug
        ? getLostItemCategoryLabel(lost.category_slug)
        : undefined,
      foundValue: found.category_slug
        ? getLostItemCategoryLabel(found.category_slug)
        : undefined,
      matches: assessment.sameCategory,
    },
    { label: "Details", lostValue: lost.details, foundValue: found.details },
    {
      label: "Date",
      lostValue: `${formatDate(lost.date_reported)} (reported)`,
      foundValue: `${formatDate(found.found_date)} (found)`,
      matches: assessment.daysApart <= 1,
    },
    {
      label: "Area",
      lostValue: lost.location_lost,
      foundValue: found.location_found,
      matches: assessment.similarLocation,
    },
    {
      label: "Person",
      lostValue: lost.reporter_name
        ? `${lost.reporter_name} (owner)`
        : undefined,
      foundValue: found.finder_name
        ? `${found.finder_name} (finder)`
        : undefined,
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="grid grid-cols-[90px_1fr_1fr] bg-slate-100 text-sm font-semibold text-slate-700">
        <div className="px-3 py-2" />
        <div className="border-l border-slate-200 px-3 py-2 text-sky-800">
          Lost report
        </div>
        <div className="border-l border-slate-200 px-3 py-2 text-teal-800">
          Found item
        </div>
      </div>
      {rows.map((row) => (
        <div
          key={row.label}
          className={cn(
            "grid grid-cols-[90px_1fr_1fr] border-t border-slate-100 text-sm",
            row.matches && "bg-emerald-50/60",
          )}
        >
          <div className="px-3 py-2 font-medium text-slate-500">
            {row.label}
          </div>
          <div className="border-l border-slate-100 px-3 py-2 text-slate-900">
            {row.lostValue || <span className="text-slate-400">—</span>}
          </div>
          <div className="border-l border-slate-100 px-3 py-2 text-slate-900">
            {row.foundValue || <span className="text-slate-400">—</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
