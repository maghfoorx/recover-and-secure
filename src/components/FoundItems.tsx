import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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

export default function FoundItems(): JSX.Element {
  const [isFilteredByNotReturned, setIsFilteredByNotReturned] = useState(
    localStorage.getItem("filterFoundItemsByNotReturnedOnly") === "true",
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
        return matchesSearch && !item.is_returned;
      }

      return matchesSearch;
    });

    return filtered;
  }, [foundItems, searchBarValue, isFilteredByNotReturned]);

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
    <div className="px-2 py-6 space-y-6">
      <h1 className="text-3xl font-bold">Found items</h1>

      {/* Totals displayed right after the title */}
      <div className="flex gap-4">
        <Badge className="rounded-sm bg-teal-600 text-white font-normal px-2 py-1">
          Found items: {foundItems.length}
        </Badge>
        <Badge className="rounded-sm bg-teal-600 text-white font-normal px-2 py-1">
          Items returned: {foundItems.filter((item) => item.is_returned).length}
        </Badge>
      </div>

      <div>
        <Input
          value={searchBarValue}
          onChange={(e) => setSearchBarValue(e.target.value)}
          placeholder="Search by item name or details"
          className="max-w-md"
        />

        <label className="flex items-center gap-2 text-sm mt-2">
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
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[20%]">Name</TableHead>
            <TableHead className="w-[60%]">Detail</TableHead>
            <TableHead className="w-[10%] whitespace-nowrap">
              Date found
            </TableHead>
            <TableHead className="w-[10%]">Returned</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No found items
              </TableCell>
            </TableRow>
          ) : (
            filteredItems.map((item) => (
              <TableRow
                key={item._id}
                onClick={() => handleRowClick(item)}
                className="cursor-pointer hover:bg-gray-100"
              >
                <TableCell className="w-[30%]">{item.name}</TableCell>
                <TableCell className="w-[60%]">{item?.details}</TableCell>
                <TableCell className="w-[10%] whitespace-nowrap">
                  {formatDate(item.found_date)}
                </TableCell>
                <TableCell className="w-[10%]">
                  {item.is_returned ? (
                    <CheckIcon className="text-green-500" />
                  ) : (
                    <XIcon className="text-red-500" />
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

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
