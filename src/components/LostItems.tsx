import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { Check, CheckIcon, X, XIcon } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import MatchItemsDialog from "./MatchItemsDialog";
import { formatDate } from "@/utils/formatDate";
import { Checkbox } from "./ui/checkbox";
import { Link } from "react-router-dom";
import {
  getLostItemCategoryDisplayLabel,
  LOST_ITEM_CATEGORIES,
} from "@/lib/lostItemCategories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const ALL_CATEGORIES_VALUE = "all_categories";

export default function LostItems(): JSX.Element {
  const [isFilteredByNotFound, setIsFilteredByNotFound] = useState(
    localStorage.getItem("filterFoundItemsByNotFoundOnly") === "true",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    localStorage.getItem("filterLostItemsByCategory") || ALL_CATEGORIES_VALUE,
  );

  // Fetch data using Convex queries
  const lostItems =
    useQuery(api.lostProperty.queries.getLostItemsReported) || [];
  const foundItems =
    useQuery(api.lostProperty.queries.getFoundItemsReported) || [];

  // Define mutations
  const deleteLostItem = useMutation(api.lostProperty.mutations.deleteLostItem);
  const updateFoundColumn = useMutation(
    api.lostProperty.mutations.updateFoundColumn,
  );
  const unFoundLostItem = useMutation(
    api.lostProperty.mutations.unFoundLostItem,
  );
  const matchItems = useMutation(
    api.lostProperty.mutations.matchLostItemWithFoundItem,
  );
  const unmatchItems = useMutation(api.lostProperty.mutations.unmatchItems);

  const [searchBarValue, setSearchBarValue] = useState("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [modalData, setModalData] = useState<Doc<"lost_items"> | null>(null);
  const [matchingDialogOpen, setMatchingDialogOpen] = useState(false);

  useEffect(() => {
    if (modalData?._id != null) {
      const refreshedModalData = lostItems.find(
        (item) => item._id === modalData._id,
      );
      if (refreshedModalData != null) {
        setModalData(refreshedModalData);
      }
    }
  }, [lostItems]);

  const filteredItems = useMemo(() => {
    const search = searchBarValue.toLowerCase();

    const includesAimsID = lostItems.filter((item) =>
      item?.aims_number?.toString().toLowerCase().includes(search),
    );
    const includesItemName = lostItems.filter((item) =>
      item.name.toLowerCase().includes(search),
    );
    const includesItemDetails = lostItems.filter((item) =>
      item?.details?.toLowerCase().includes(search),
    );

    let uniqueMatches = Array.from(
      new Set([...includesAimsID, ...includesItemName, ...includesItemDetails]),
    );

    if (isFilteredByNotFound) {
      uniqueMatches = uniqueMatches.filter((item) => !item.is_found);
    }

    if (selectedCategory !== ALL_CATEGORIES_VALUE) {
      uniqueMatches = uniqueMatches.filter(
        (item) => item.category_slug === selectedCategory,
      );
    }

    return uniqueMatches;
  }, [lostItems, searchBarValue, isFilteredByNotFound, selectedCategory]);

  const foundCount = lostItems.filter((item) => item.is_found).length;

  function handleRowClick(row: Doc<"lost_items">) {
    setModalData(row);
    setOpenDialog(true);
  }

  async function handleDeletingLostItem(id: Id<"lost_items">) {
    await deleteLostItem({ id });
    setOpenDialog(false);
  }

  async function handleToggleFoundItem(id: Id<"lost_items">) {
    try {
      if (modalData?.is_found === false) {
        await updateFoundColumn({ id });
        toast.success("Item marked as found", {
          style: { background: "green", color: "white" },
        });
      } else if (modalData?.is_found === true) {
        await unFoundLostItem({ id });
        toast.success("Item marked as lost", {
          style: { background: "green", color: "white" },
        });
      }
    } catch (error) {
      toast.error("Operation failed", {
        style: { background: "red", color: "white" },
      });
    }
  }

  const foundItemsToMatchWith = foundItems.filter(
    (item) => item.lost_item_id === undefined && item.is_returned === false,
  );

  const matchedFoundItem = modalData?.found_item_id
    ? foundItems.find((item) => item._id === modalData.found_item_id)
    : undefined;

  async function handleUnmatch(
    lostItemId: Id<"lost_items">,
    foundItemId: Id<"found_items">,
  ) {
    try {
      await unmatchItems({ lostItemId, foundItemId });
      toast.success("Match removed", {
        style: { backgroundColor: "green", color: "white" },
      });
    } catch (error) {
      toast.error("Failed to remove match. Please try again.", {
        style: { backgroundColor: "red", color: "white" },
      });
    }
  }

  async function createMatch(
    lostItemId: Id<"lost_items">,
    foundItemId: Id<"found_items">,
  ) {
    try {
      const response = await matchItems({
        lostItemId,
        foundItemId,
      });

      toast.success("Match created successfully", {
        style: { backgroundColor: "green", color: "white" },
      });
      return response;
    } catch (error) {
      toast.error("Failed to create match. Please try again.", {
        style: { backgroundColor: "red", color: "white" },
      });
      throw error;
    }
  }

  return (
    <div className="flex flex-col flex-1 h-full px-0 py-6 space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Lost items
          </h1>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
          <Card className="border-sky-200 bg-white shadow-none">
            <CardContent className="p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Total reports
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {lostItems.length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 bg-white shadow-none">
            <CardContent className="p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Marked found
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {foundCount}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-slate-200 shadow-none">
        <CardHeader className="px-6 pb-2 pt-5">
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-5 pt-0">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_280px]">
            <Input
              value={searchBarValue}
              onChange={(e) => setSearchBarValue(e.target.value)}
              placeholder="Search by item name, AIMS id or details"
              className="h-11 bg-white"
            />
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                localStorage.setItem("filterLostItemsByCategory", value);
                setSelectedCategory(value);
              }}
            >
              <SelectTrigger className="h-11 bg-white">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES_VALUE}>
                  All categories
                </SelectItem>
                {LOST_ITEM_CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {getLostItemCategoryDisplayLabel(category.value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
              <Checkbox
                checked={isFilteredByNotFound}
                onCheckedChange={() => {
                  const updatedValue = !isFilteredByNotFound;
                  const stringToStore = updatedValue.toString();
                  localStorage.setItem(
                    "filterFoundItemsByNotFoundOnly",
                    stringToStore,
                  );
                  setIsFilteredByNotFound(updatedValue);
                }}
              />
              <span>Show not found items only</span>
            </label>

            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-900">{filteredItems.length}</span>{" "}
              of {lostItems.length} reports
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 overflow-hidden border-slate-200 shadow-none">
        <CardHeader className="px-6 pb-3 pt-5">
          <CardTitle className="text-lg">Reported items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[calc(100vh-23rem)] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur">
                <TableRow className="border-b border-slate-200 hover:bg-transparent">
                  <TableHead className="w-[28%] pl-6">Item</TableHead>
                  <TableHead className="w-[42%]">Details</TableHead>
                  <TableHead className="w-[15%]">Status</TableHead>
                  <TableHead className="w-[15%] pr-6">AIMS id</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-28 text-center text-sm text-slate-500"
                    >
                      No lost items match the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow
                      key={item._id}
                      onClick={() => handleRowClick(item)}
                      className="cursor-pointer border-b border-slate-100 hover:bg-sky-50/60"
                    >
                      <TableCell className="pl-6 align-top">
                        <div className="space-y-2">
                          <p className="font-medium text-slate-950">
                            {item.name}
                          </p>
                          {item.category_slug && (
                            <Badge
                              variant="secondary"
                              className="rounded-full bg-slate-100 text-slate-700"
                            >
                              {getLostItemCategoryDisplayLabel(
                                item.category_slug,
                              )}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-top text-sm leading-6 text-slate-600">
                        {item.details || "No details provided."}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                          {item.is_found ? (
                            <>
                              <CheckIcon className="h-4 w-4 text-emerald-600" />
                              Found
                            </>
                          ) : (
                            <>
                              <XIcon className="h-4 w-4 text-rose-600" />
                              Not found
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="pr-6 align-top font-medium text-slate-900">
                        {item.aims_number}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-xl overflow-y-auto max-h-[800px]">
          {modalData && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {modalData.name}
                </DialogTitle>
              </DialogHeader>
              <dl className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Details</dt>
                  <dd className="text-sm text-gray-900">{modalData.details}</dd>
                </div>
                {modalData.category_slug && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">
                      Category
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {getLostItemCategoryDisplayLabel(modalData.category_slug)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Person name
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {modalData.reporter_name}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Contact number
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {modalData.phone_number}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">AIMS id</dt>
                  <dd className="text-sm text-gray-900">
                    {modalData.aims_number}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Lost area
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {modalData.location_lost}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Item found
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {modalData.is_found === false ? (
                      <X className="h-8 w-8 text-red-600" />
                    ) : (
                      <Check className="h-8 w-8 text-green-600" />
                    )}
                  </dd>
                </div>
              </dl>
              {modalData.found_item_id != null && (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/60 px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium uppercase tracking-[0.15em] text-emerald-700">
                      Matched found item
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                        >
                          Unmatch
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remove this match?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            The found item will be unlinked and this report
                            will be marked as not found again. Both records
                            are kept.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              modalData.found_item_id &&
                              handleUnmatch(
                                modalData._id,
                                modalData.found_item_id,
                              )
                            }
                          >
                            Remove match
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  {matchedFoundItem ? (
                    <div className="mt-1 space-y-1">
                      <p className="font-semibold text-slate-950">
                        {matchedFoundItem.name}
                      </p>
                      {matchedFoundItem.details && (
                        <p className="text-sm text-slate-600">
                          {matchedFoundItem.details}
                        </p>
                      )}
                      <p className="text-xs text-slate-500">
                        Found {formatDate(matchedFoundItem.found_date)}
                        {matchedFoundItem.location_stored
                          ? ` · Stored at ${matchedFoundItem.location_stored}`
                          : ""}
                        {matchedFoundItem.is_returned ? " · Returned" : ""}
                      </p>
                    </div>
                  ) : null}
                  <Button
                    variant="link"
                    size={"sm"}
                    className="text-xs p-0"
                    asChild
                  >
                    <Link to={`/found-item/${modalData.found_item_id}`}>
                      Go to found item →
                    </Link>
                  </Button>
                </div>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will delete the lost
                        item.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          modalData && handleDeletingLostItem(modalData._id)
                        }
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                {modalData?.found_item_id === undefined && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="secondary">
                        {modalData.is_found
                          ? "Mark as not found"
                          : "Mark as found"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure you want to{" "}
                          {modalData.is_found ? "un-find" : "find"} this item?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will toggle the found status of the lost item.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            modalData && handleToggleFoundItem(modalData._id)
                          }
                        >
                          Yes
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {modalData?.found_item_id === undefined && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setMatchingDialogOpen(true);
                    }}
                  >
                    Match with found item
                  </Button>
                )}
              </div>

              <MatchItemsDialog
                open={matchingDialogOpen}
                onOpenChange={setMatchingDialogOpen}
                fixedSide="lost"
                lostItem={modalData}
                candidates={foundItemsToMatchWith}
                onConfirm={async ({ lostItemId, foundItemId }) => {
                  await createMatch(lostItemId, foundItemId);
                }}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
