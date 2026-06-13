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
import { formatDate } from "@/utils/formatDate";
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
} from "./ui/alert-dialog";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { Check, CheckIcon, X, XIcon } from "lucide-react";
import MatchWithLostItemsDialog from "./MatchItemWithLostItems";
import { Checkbox } from "./ui/checkbox";
import ReturnFoundItemForm from "./FoundItemReturnForm";
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

export default function FoundItems(): JSX.Element {
  const [isFilteredByNotReturned, setIsFilteredByNotReturned] = useState(
    localStorage.getItem("filterFoundItemsByNotReturnedOnly") === "true",
  );
  const [selectedCategory, setSelectedCategory] = useState(
    localStorage.getItem("filterFoundItemsByCategory") || ALL_CATEGORIES_VALUE,
  );

  // Fetch data using Convex queries
  const foundItems =
    useQuery(api.lostProperty.queries.getFoundItemsReported) || [];
  const lostItems =
    useQuery(api.lostProperty.queries.getLostItemsReported) || [];

  // Define mutations
  const deleteFoundItem = useMutation(
    api.lostProperty.mutations.deleteFoundItem,
  );
  const matchItems = useMutation(
    api.lostProperty.mutations.matchLostItemWithFoundItem,
  );

  const [searchBarValue, setSearchBarValue] = useState("");
  // Filter found items by either name or details.
  const filteredItems = useMemo(() => {
    const lowerSearch = searchBarValue.toLowerCase();

    const filtered = foundItems.filter((item) => {
      const matchesName = item.name.toLowerCase().includes(lowerSearch);
      const matchesDetails = item?.details?.toLowerCase().includes(lowerSearch);

      const matchesSearch = matchesName || matchesDetails;

      if (isFilteredByNotReturned) {
        return (
          matchesSearch &&
          !item.is_returned &&
          (selectedCategory === ALL_CATEGORIES_VALUE ||
            item.category_slug === selectedCategory)
        );
      }

      return (
        matchesSearch &&
        (selectedCategory === ALL_CATEGORIES_VALUE ||
          item.category_slug === selectedCategory)
      );
    });

    return filtered;
  }, [foundItems, searchBarValue, isFilteredByNotReturned, selectedCategory]);

  const returnedCount = foundItems.filter((item) => item.is_returned).length;

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [modalData, setModalData] = useState<Doc<"found_items"> | null>(null);
  const [openReturnForm, setOpenReturnForm] = useState(false);
  const [matchingDialogOpen, setMatchingDialogOpen] = useState(false);

  useEffect(() => {
    if (modalData != null) {
      const updatedFoundItem = foundItems.find(
        (item) => item._id === modalData._id,
      );

      if (updatedFoundItem) {
        setModalData(updatedFoundItem);
      }
    }
  }, [foundItems]);

  function handleRowClick(row: Doc<"found_items">) {
    setModalData(row);
    setOpenDialog(true);
  }

  async function handleDeletingFoundItem(id: Id<"found_items">) {
    try {
      await deleteFoundItem({ id });
      setOpenDialog(false);
      toast.success("Found item deleted successfully", {
        style: {
          backgroundColor: "green",
          color: "white",
        },
      });
    } catch (error) {
      toast.error("Failed to delete item", {
        style: {
          backgroundColor: "red",
          color: "white",
        },
      });
    }
  }

  const lostItemsToMatchWith = lostItems.filter(
    (item) => item.found_item_id === undefined,
  );

  return (
    <div className="flex flex-col flex-1 h-full px-0 py-6 space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Found items
          </h1>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
          <Card className="border-teal-200 bg-white shadow-none">
            <CardContent className="p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Total found
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {foundItems.length}
              </p>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 bg-white shadow-none">
            <CardContent className="p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Returned
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {returnedCount}
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
              placeholder="Search by item name or details"
              className="h-11 bg-white"
            />
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                localStorage.setItem("filterFoundItemsByCategory", value);
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
                checked={isFilteredByNotReturned}
                onCheckedChange={() => {
                  const updatedValue = !isFilteredByNotReturned;
                  const stringToStore = updatedValue.toString();
                  localStorage.setItem(
                    "filterFoundItemsByNotReturnedOnly",
                    stringToStore,
                  );
                  setIsFilteredByNotReturned(updatedValue);
                }}
              />
              <span>Show not returned items only</span>
            </label>

            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {filteredItems.length}
              </span>{" "}
              of {foundItems.length} items
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="flex-1 overflow-hidden border-slate-200 shadow-none">
        <CardHeader className="px-6 pb-3 pt-5">
          <CardTitle className="text-lg">Stored items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[calc(100vh-23rem)] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur">
                <TableRow className="border-b border-slate-200 hover:bg-transparent">
                  <TableHead className="w-[28%] pl-6">Item</TableHead>
                  <TableHead className="w-[34%]">Details</TableHead>
                  <TableHead className="w-[18%] whitespace-nowrap">
                    Date found
                  </TableHead>
                  <TableHead className="w-[20%] pr-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-28 text-center text-sm text-slate-500"
                    >
                      No found items match the current filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow
                      key={item._id}
                      onClick={() => handleRowClick(item)}
                      className="cursor-pointer border-b border-slate-100 hover:bg-teal-50/60"
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
                      <TableCell className="align-top whitespace-nowrap font-medium text-slate-700">
                        {formatDate(item.found_date)}
                      </TableCell>
                      <TableCell className="pr-6 align-top">
                        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                          {item.is_returned ? (
                            <>
                              <CheckIcon className="h-4 w-4 text-emerald-600" />
                              Returned
                            </>
                          ) : (
                            <>
                              <XIcon className="h-4 w-4 text-amber-600" />
                              In storage
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Item Detail Dialog */}
      <Dialog
        open={openDialog}
        onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) setOpenReturnForm(false);
        }}
      >
        <DialogContent className="max-w-xl overflow-y-auto max-h-[800px]">
          {modalData && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  {modalData.name}
                </DialogTitle>
              </DialogHeader>
              <dl className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Details</dt>
                  <dd className="text-sm text-gray-900 text-right">
                    {modalData.details}
                  </dd>
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
                    Date found
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {formatDate(modalData.found_date)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Found area
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {modalData.location_found}
                  </dd>
                </div>
                {modalData.finder_name && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">
                      Found by
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {modalData.finder_name}
                    </dd>
                  </div>
                )}
                {modalData.finder_aims_number && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">
                      Finder's AIMS
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {modalData.finder_aims_number}
                    </dd>
                  </div>
                )}
                {modalData.received_by && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">
                      Received by
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {modalData.received_by}
                    </dd>
                  </div>
                )}
                {modalData.location_stored && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">
                      Location stored
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {modalData.location_stored}
                    </dd>
                  </div>
                )}

                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Returned
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {modalData.is_returned === false ? (
                      <X className="h-8 w-8 text-red-600" />
                    ) : (
                      <Check className="h-8 w-8 text-green-600" />
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Matched with a lost item
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {modalData.lost_item_id == null ? (
                      <X className="h-8 w-8 text-red-600" />
                    ) : (
                      <Check className="h-8 w-8 text-green-600" />
                    )}
                  </dd>
                </div>
              </dl>
              <hr className="my-0" />
              {(modalData.returned_to_name ||
                modalData.returned_by ||
                modalData.returned_at) && (
                <dl className="mt-4 space-y-1">
                  {modalData.returned_to_name && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">
                        Returned to
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {modalData.returned_to_name}
                      </dd>
                    </div>
                  )}
                  {modalData.returned_to_aims_number && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">
                        Returned person AIMS number
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {modalData.returned_to_aims_number}
                      </dd>
                    </div>
                  )}
                  {modalData.returned_by && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">
                        Returned by
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {modalData.returned_by}
                      </dd>
                    </div>
                  )}
                  {modalData.returned_at && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">
                        Returned date
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {formatDate(modalData.returned_at)}
                      </dd>
                    </div>
                  )}
                </dl>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size={"sm"} variant="destructive">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will delete the found
                        item.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          modalData && handleDeletingFoundItem(modalData._id)
                        }
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  variant="secondary"
                  size={"sm"}
                  onClick={() => setOpenReturnForm(true)}
                  disabled={modalData.is_returned}
                >
                  Return
                </Button>
                <Button
                  variant="secondary"
                  size={"sm"}
                  onClick={() => setMatchingDialogOpen(true)}
                  disabled={
                    modalData.lost_item_id !== undefined ||
                    modalData.is_returned
                  }
                >
                  Match with Lost Item
                </Button>
              </div>

              {openReturnForm && (
                <ReturnFoundItemForm
                  foundItem={modalData}
                  onCancel={() => {
                    setOpenReturnForm(false);
                  }}
                  onSuccess={() => {
                    setOpenReturnForm(false);
                  }}
                />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Match Item Dialog */}
      <MatchWithLostItemsDialog
        open={matchingDialogOpen}
        onOpenChange={setMatchingDialogOpen}
        items={lostItemsToMatchWith}
        foundItem={modalData}
        onMatch={async (lostItemId) => {
          if (!modalData) return;

          try {
            await matchItems({
              lostItemId: lostItemId as Id<"lost_items">,
              foundItemId: modalData._id,
            });
            setMatchingDialogOpen(false);
            toast.success("Item matched successfully", {
              style: {
                backgroundColor: "green",
                color: "white",
              },
            });
          } catch (error) {
            toast.error("Failed to match item. Please try again later.", {
              style: {
                backgroundColor: "red",
                color: "white",
              },
            });
          }
        }}
      />
    </div>
  );
}
