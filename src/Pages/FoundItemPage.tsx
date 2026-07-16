import FullScreenSpinner from "@/components/FullScreenSpinner";
import { formatDate } from "@/utils/formatDate";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Check, X } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ReturnFoundItemForm from "@/components/FoundItemReturnForm";

export default function FoundItemPage() {
  const { foundItemId } = useParams();

  const foundItem = useQuery(
    api.lostProperty.queries.getFoundItem,
    foundItemId ? { id: foundItemId as Id<"found_items"> } : "skip",
  );
  const matchedLostItem = useQuery(
    api.lostProperty.queries.getLostItem,
    foundItem?.lost_item_id ? { id: foundItem.lost_item_id } : "skip",
  );

  if (foundItem === undefined) {
    return (
      <div className="w-full h-[700px] flex justify-center items-center">
        <FullScreenSpinner />
      </div>
    );
  }

  if (foundItem === null) {
    return <Navigate to={"/found-items-list"} />;
  }

  return (
    <div className="px-2 py-6 space-y-6 max-w-4xl">
      <Button variant="link" asChild>
        <Link to="/lost-items-list">← Back to lost items</Link>
      </Button>
      <h1 className="text-3xl font-bold">Found Item Page</h1>
      <dl className="mt-4 space-y-3">
        <div className="flex justify-between">
          <dt className="text-sm font-medium text-gray-500">Name</dt>
          <dd className="text-sm text-gray-900 text-right">{foundItem.name}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-sm font-medium text-gray-500">Details</dt>
          <dd className="text-sm text-gray-900 text-right">
            {foundItem.details}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-sm font-medium text-gray-500">Date found</dt>
          <dd className="text-sm text-gray-900">
            {formatDate(foundItem.found_date)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-sm font-medium text-gray-500">Found area</dt>
          <dd className="text-sm text-gray-900">{foundItem.location_found}</dd>
        </div>
        {foundItem.finder_name && (
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">Found by</dt>
            <dd className="text-sm text-gray-900">{foundItem.finder_name}</dd>
          </div>
        )}
        {foundItem.finder_aims_number && (
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">Finder's AIMS</dt>
            <dd className="text-sm text-gray-900">
              {foundItem.finder_aims_number}
            </dd>
          </div>
        )}
        {foundItem.received_by && (
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">Received by</dt>
            <dd className="text-sm text-gray-900">{foundItem.received_by}</dd>
          </div>
        )}
        {foundItem.location_stored && (
          <div className="flex justify-between">
            <dt className="text-sm font-medium text-gray-500">
              Location stored
            </dt>
            <dd className="text-sm text-gray-900">
              {foundItem.location_stored}
            </dd>
          </div>
        )}

        <div className="flex justify-between">
          <dt className="text-sm font-medium text-gray-500">Returned</dt>
          <dd className="text-sm text-gray-900">
            {foundItem.is_returned === false ? (
              <X className="h-8 w-8 text-red-600" />
            ) : (
              <Check className="h-8 w-8 text-green-600" />
            )}
          </dd>
        </div>
      </dl>
      {foundItem.lost_item_id != null && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-emerald-700">
            Matched lost report
          </p>
          {matchedLostItem ? (
            <div className="mt-1 space-y-1">
              <p className="font-semibold text-slate-950">
                {matchedLostItem.name}
              </p>
              {matchedLostItem.details && (
                <p className="text-sm text-slate-600">
                  {matchedLostItem.details}
                </p>
              )}
              <p className="text-xs text-slate-500">
                Reported {formatDate(matchedLostItem.date_reported)}
                {matchedLostItem.reporter_name
                  ? ` · Owner: ${matchedLostItem.reporter_name}`
                  : ""}
                {matchedLostItem.phone_number
                  ? ` · ${matchedLostItem.phone_number}`
                  : ""}
              </p>
            </div>
          ) : (
            <p className="mt-1 text-sm text-slate-600">Loading report...</p>
          )}
        </div>
      )}
      {foundItem?.is_returned === false && (
        <div className="max-w-md">
          <ReturnFoundItemForm foundItem={foundItem} />
        </div>
      )}
    </div>
  );
}
