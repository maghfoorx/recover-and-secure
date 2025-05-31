import { useState } from "react";
import { useForm } from "react-hook-form";
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
import MatchItemDialog from "./MatchItemDialog";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { Check, X } from "lucide-react";

export default function FoundItems(): JSX.Element {
  // Fetch data using Convex queries
  const foundItems =
    useQuery(api.lostProperty.queries.getFoundItemsReported) || [];
  const lostItems =
    useQuery(api.lostProperty.queries.getLostItemsReported) || [];

  // Define mutations
  const deleteFoundItem = useMutation(
    api.lostProperty.mutations.deleteFoundItem,
  );
  const returnFoundItem = useMutation(
    api.lostProperty.mutations.returnFoundItem,
  );
  const matchItems = useMutation(
    api.lostProperty.mutations.matchLostItemWithFoundItem,
  );

  const [searchBarValue, setSearchBarValue] = useState("");
  // Filter found items by either name or details.
  const includesItemName = foundItems.filter((item) =>
    item.name.toLowerCase().includes(searchBarValue.toLowerCase()),
  );
  const includesItemDetails = foundItems.filter((item) =>
    item?.details?.toLowerCase().includes(searchBarValue.toLowerCase()),
  );
  const filteredItemsSet = new Set([
    ...includesItemName,
    ...includesItemDetails,
  ]);
  const filteredItems = Array.from(filteredItemsSet);

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [modalData, setModalData] = useState<Doc<"found_items"> | null>(null);
  const [openReturnForm, setOpenReturnForm] = useState(false);
  const [matchingDialogOpen, setMatchingDialogOpen] = useState(false);

  console.log(modalData, "IS_MODALDATA");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

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

  async function handleReturnFoundItem(data: any) {
    if (!modalData) return;

    try {
      await returnFoundItem({
        id: modalData._id,
        returned_to_name: data.returned_to_name,
        returned_to_aims_number: data.returned_to_aims_number,
        returned_by: data.returned_by,
      });

      reset();
      setOpenReturnForm(false);
      toast.success("Item returned successfully", {
        style: {
          backgroundColor: "green",
          color: "white",
        },
      });
    } catch (error) {
      toast.error("Failed to return item", {
        style: {
          backgroundColor: "red",
          color: "white",
        },
      });
      console.error(error);
    }
  }

  const lostItemsToMatchWith = lostItems.filter(
    (item) => item.found_item_id === undefined,
  );

  return (
    <div className="p-6 space-y-6">
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

      <Input
        value={searchBarValue}
        onChange={(e) => setSearchBarValue(e.target.value)}
        placeholder="Search by item name or details"
        className="max-w-md"
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Detail</TableHead>
            <TableHead>Date found</TableHead>
            <TableHead>Returned</TableHead>
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
                <TableCell>{item.name}</TableCell>
                <TableCell>{item?.details}</TableCell>
                <TableCell>{formatDate(item.found_date)}</TableCell>
                <TableCell>{item.is_returned ? "Yes" : "No"}</TableCell>
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
        <DialogContent className="max-w-xl">
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
                  <dd className="text-sm text-gray-900">{modalData.details}</dd>
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
                <form
                  onSubmit={handleSubmit(handleReturnFoundItem)}
                  className="space-y-2 mt-4"
                >
                  <div>
                    <label className="block text-sm font-medium">
                      Person name
                    </label>
                    <Input
                      className="my-0"
                      {...register("returned_to_name", { required: true })}
                    />
                    {errors.returned_to_name && (
                      <p className="text-red-500 text-xs mt-1">
                        This field is required
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      AIMS number
                    </label>
                    <Input
                      className="my-0"
                      {...register("returned_to_aims_number", {
                        required: true,
                      })}
                    />
                    {errors.returned_to_aims_number && (
                      <p className="text-red-500 text-xs mt-1">
                        This field is required
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Returned by
                    </label>
                    <Input
                      className="my-0"
                      {...register("returned_by", { required: true })}
                    />
                    {errors.returned_by && (
                      <p className="text-red-500 text-xs mt-1">
                        This field is required
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOpenReturnForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button size="sm" type="submit">
                      Submit return
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Match Item Dialog */}
      <MatchItemDialog
        open={matchingDialogOpen}
        onOpenChange={setMatchingDialogOpen}
        items={lostItemsToMatchWith}
        type="lost"
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
