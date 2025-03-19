import { useEffect, useState } from "react";
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
import useFetchLostPropertyData from "@/hooks/useFetchLostPropertyData";
import { LostItemType } from "@/type/moduleTypes";
import {
  deleteLostItem,
  foundLostItem,
  matchLostItemWithFoundItem,
  unFoundLostItem,
} from "@/apiApi/modules/lostProperty";
import { Badge } from "./ui/badge";
import { formatBoolean } from "@/utils/formatBoolean";
import { toast } from "sonner";
import MatchItemDialog from "./MatchItemDialog";
import { Check, Cross, X } from "lucide-react";

export default function LostItems(): JSX.Element {
  const { lostItems, foundItems, handleGetLostItems } =
    useFetchLostPropertyData();
  const [searchBarValue, setSearchBarValue] = useState("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [modalData, setModalData] = useState<LostItemType | null>(null);

  useEffect(() => {
    if (modalData?.id != null) {
      const refreshedModalData = lostItems.find(
        (item) => item.id === modalData.id,
      );
      if (refreshedModalData != null) {
        setModalData(refreshedModalData);
      }
    }
  }, [lostItems]);

  // Reset any extra states when dialog closes
  useEffect(() => {
    if (!openDialog) {
      // Reset additional confirmation states here if needed
    }
  }, [openDialog]);

  // Filter items based on AIMS ID, Item Name or Details
  const includesAimsID = lostItems.filter((item) =>
    item?.aims_number
      ?.toString()
      .toLowerCase()
      .includes(searchBarValue.toLowerCase()),
  );
  const includesItemName = lostItems.filter((item) =>
    item.name.toLowerCase().includes(searchBarValue.toLowerCase()),
  );
  const includesItemDetails = lostItems.filter((item) =>
    item?.details?.toLowerCase().includes(searchBarValue.toLowerCase()),
  );
  const filteredItemsSet = new Set([
    ...includesAimsID,
    ...includesItemName,
    ...includesItemDetails,
  ]);
  const filteredItems = Array.from(filteredItemsSet);

  function handleRowClick(row: LostItemType) {
    setModalData(row);
    setOpenDialog(true);
  }

  async function handleDeletingLostItem(id: number) {
    await deleteLostItem(id);
    await handleGetLostItems();
    setOpenDialog(false);
  }

  async function handleToggleFoundItem(id: number) {
    if (modalData?.is_found === 0) {
      await foundLostItem(id);
      toast.success("Item marked as found", {
        style: {
          background: "green",
          color: "white",
        },
      });
    } else if (modalData?.is_found === 1) {
      await unFoundLostItem(id);
      toast.success("Item marked as lost", {
        style: {
          background: "green",
          color: "white",
        },
      });
    }
    await handleGetLostItems();
  }

  const foundItemsToMatchWith = foundItems.filter(
    (item) => item.lost_item_id == null,
  );

  const [matchingDialogOpen, setMatchingDialogOpen] = useState(false);

  async function createMatch(lostItemId: number, foundItemId: number) {
    const response = await matchLostItemWithFoundItem({
      lostItemId,
      foundItemId,
    });
    console.log(response, "isResponse");
    return response;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Lost items</h1>
      {/* Totals displayed right after the title */}
      <div className="flex gap-4">
        <Badge className="rounded-sm bg-sky-600 text-white font-normal px-2 py-1">
          Lost items: {lostItems.length}
        </Badge>
        <Badge className="rounded-sm bg-sky-600 text-white font-normal px-2 py-1">
          Lost items found:{" "}
          {lostItems.filter((item) => item.is_found === 1).length}
        </Badge>
      </div>

      <Input
        value={searchBarValue}
        onChange={(e) => setSearchBarValue(e.target.value)}
        placeholder="Search by item name, AIMS id or details"
        className="max-w-md"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>AIMS id</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Found</TableHead>
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
                key={item.id}
                onClick={() => handleRowClick(item)}
                className="cursor-pointer hover:bg-gray-100"
              >
                <TableCell>{item.aims_number}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.details}</TableCell>
                <TableCell>{formatBoolean(item.is_found)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Detail Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-xl">
          {modalData && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {modalData.id}: {modalData.name}
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
                  <dt className="text-sm font-medium text-gray-500">Found</dt>
                  <dd className="text-sm text-gray-900">
                    {modalData.is_found === 0 ? (
                      <X className="h-8 w-8 text-red-600" />
                    ) : (
                      <Check className="h-8 w-8 text-green-600" />
                    )}
                  </dd>
                </div>
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
                          modalData && handleDeletingLostItem(modalData.id)
                        }
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                {modalData?.found_item_id == null && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="secondary">
                        {modalData.is_found === 1
                          ? "mark as not found"
                          : "Mark as found"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure you want to{" "}
                          {modalData.is_found === 1 ? "un-find" : "find"} this
                          item?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will toggle the found status of the lost item.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            modalData && handleToggleFoundItem(modalData.id)
                          }
                        >
                          Yes
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {modalData?.found_item_id == null && (
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

              <MatchItemDialog
                open={matchingDialogOpen}
                onOpenChange={setMatchingDialogOpen}
                items={foundItemsToMatchWith}
                type="found"
                onMatch={async (foundItemId) => {
                  const response = await createMatch(modalData.id, foundItemId);

                  console.log(response, "isResponse");

                  if (response?.success === true) {
                    toast.success("Match created successfully", {
                      style: {
                        backgroundColor: "green",
                        color: "white",
                      },
                    });
                  } else {
                    toast.error("Failed to create match. Please try again.", {
                      style: {
                        backgroundColor: "red",
                        color: "white",
                      },
                    });
                  }

                  await handleGetLostItems();
                  setMatchingDialogOpen(false);
                }}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
