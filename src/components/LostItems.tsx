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
import { Check, CheckIcon, Cross, X, XIcon } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import MatchWithFoundItemsDialog from "./MatchItemWithFoundItems";
import { Checkbox } from "./ui/checkbox";

export default function LostItems(): JSX.Element {
  const [isFilteredByNotFound, setIsFilteredByNotFound] = useState(
    localStorage.getItem("filterFoundItemsByNotFoundOnly") === "true",
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

    return uniqueMatches;
  }, [lostItems, searchBarValue, isFilteredByNotFound]);

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
    (item) => item.lost_item_id === undefined,
  );

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
    <div className="px-2 py-6 space-y-6">
      <h1 className="text-3xl font-bold">Lost items</h1>
      {/* Totals displayed right after the title */}
      <div className="flex gap-4">
        <Badge className="rounded-sm bg-sky-600 text-white font-normal px-2 py-1">
          Lost items: {lostItems.length}
        </Badge>
        <Badge className="rounded-sm bg-sky-600 text-white font-normal px-2 py-1">
          Lost items found: {lostItems.filter((item) => item.is_found).length}
        </Badge>
      </div>

      <div>
        <Input
          value={searchBarValue}
          onChange={(e) => setSearchBarValue(e.target.value)}
          placeholder="Search by item name, AIMS id or details"
          className="max-w-md"
        />
        <label className="flex items-center gap-2 text-sm mt-2">
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
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[20%]">Name</TableHead>
            <TableHead className="w-[60%]">Details</TableHead>
            <TableHead className="w-[10%]">Found</TableHead>
            <TableHead className="w-[10%]">AIMS id</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No lost items
              </TableCell>
            </TableRow>
          ) : (
            filteredItems.map((item) => (
              <TableRow
                key={item._id}
                onClick={() => handleRowClick(item)}
                className="cursor-pointer hover:bg-gray-100"
              >
                <TableCell className="w-[20%]">{item.name}</TableCell>
                <TableCell className="w-[60%]">{item.details}</TableCell>
                <TableCell className="w-[10%]">
                  {item.is_found ? (
                    <CheckIcon className="text-green-500" />
                  ) : (
                    <XIcon className="text-red-500" />
                  )}
                </TableCell>
                <TableCell className="w-[10%]">{item.aims_number}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

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
                {modalData.is_found === true && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">
                      Matched with a found item
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {modalData.found_item_id == null ? (
                        <X className="h-8 w-8 text-red-600" />
                      ) : (
                        <Check className="h-8 w-8 text-green-600" />
                      )}
                    </dd>
                  </div>
                )}
              </dl>
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

              <MatchWithFoundItemsDialog
                open={matchingDialogOpen}
                onOpenChange={setMatchingDialogOpen}
                items={foundItemsToMatchWith}
                onMatch={async (foundItemId) => {
                  try {
                    await createMatch(
                      modalData._id,
                      foundItemId as Id<"found_items">,
                    );
                    setMatchingDialogOpen(false);
                  } catch (error) {
                    // Error handling already done in createMatch
                  }
                }}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
