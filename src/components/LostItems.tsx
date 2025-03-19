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
  unFoundLostItem,
} from "@/apiApi/modules/lostProperty";
import { Badge } from "./ui/badge";

export default function LostItems(): JSX.Element {
  const { lostItems, handleGetLostItems } = useFetchLostPropertyData();
  const [searchBarValue, setSearchBarValue] = useState("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [modalData, setModalData] = useState<LostItemType | null>(null);

  // Reset any extra states when dialog closes
  useEffect(() => {
    if (!openDialog) {
      // Reset additional confirmation states here if needed
    }
  }, [openDialog]);

  // Filter items based on AIMS ID, Item Name or Details
  const includesAimsID = lostItems.filter((item) =>
    item.aims_id
      .toString()
      .toLowerCase()
      .includes(searchBarValue.toLowerCase()),
  );
  const includesItemName = lostItems.filter((item) =>
    item.item_name.toLowerCase().includes(searchBarValue.toLowerCase()),
  );
  const includesItemDetails = lostItems.filter((item) =>
    item.details.toLowerCase().includes(searchBarValue.toLowerCase()),
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
    if (modalData?.item_found === "No") {
      await foundLostItem(id);
    } else if (modalData?.item_found === "Yes") {
      await unFoundLostItem(id);
    }
    await handleGetLostItems();
    setOpenDialog(false);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Lost Items</h1>
      {/* Totals displayed right after the title */}
      <div className="flex gap-4">
        <Badge className="rounded-sm bg-sky-600 text-white font-normal px-2 py-1">
          Lost items: {lostItems.length}
        </Badge>
        <Badge className="rounded-sm bg-sky-600 text-white font-normal px-2 py-1">
          Lost items found:{" "}
          {lostItems.filter((item) => item.item_found === "Yes").length}
        </Badge>
      </div>

      <Input
        value={searchBarValue}
        onChange={(e) => setSearchBarValue(e.target.value)}
        placeholder="Search by Item Name, AIMS ID or Details"
        className="max-w-md"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>AIMS ID</TableHead>
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
                <TableCell>{item.aims_id}</TableCell>
                <TableCell>{item.item_name}</TableCell>
                <TableCell>{item.details}</TableCell>
                <TableCell>{item.item_found}</TableCell>
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
                  {modalData.id}: {modalData.item_name}
                </DialogTitle>
              </DialogHeader>
              <dl className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Details</dt>
                  <dd className="text-sm text-gray-900">{modalData.details}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Person Name
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {modalData.person_name}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Contact No
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {modalData.phone_number}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">AIMS ID</dt>
                  <dd className="text-sm text-gray-900">{modalData.aims_id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Lost Area
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {modalData.lost_area}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Found</dt>
                  <dd className="text-sm text-gray-900">
                    {modalData.item_found}
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
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="secondary">
                      {modalData.item_found === "Yes" ? "UnFound" : "Found"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you sure you want to{" "}
                        {modalData.item_found === "Yes" ? "un-find" : "find"}{" "}
                        this item?
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
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
