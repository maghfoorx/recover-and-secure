import { useEffect, useState } from "react";
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
import { FoundItemType } from "@/type/moduleTypes";
import useFetchLostPropertyData from "@/hooks/useFetchLostPropertyData";
import { formatDate } from "@/utils/formatDate";
import { formatBoolean } from "@/utils/formatBoolean";
import {
  deleteFoundItem,
  returnFoundItem,
} from "@/apiApi/modules/lostProperty";
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

export default function FoundItems(): JSX.Element {
  const { foundItems, handleGetFoundItems } = useFetchLostPropertyData();

  const [searchBarValue, setSearchBarValue] = useState("");
  // Filter found items by either name or details.
  const includesItemName = foundItems.filter((item) =>
    item.name.toLocaleLowerCase().includes(searchBarValue.toLocaleLowerCase()),
  );
  const includesItemDetails = foundItems.filter((item) =>
    item?.details
      ?.toLocaleLowerCase()
      .includes(searchBarValue.toLocaleLowerCase()),
  );
  const filteredItemsSet = new Set([
    ...includesItemName,
    ...includesItemDetails,
  ]);
  const filteredItems = Array.from(filteredItemsSet);

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [modalData, setModalData] = useState<FoundItemType | null>(null);
  const [openReturnForm, setOpenReturnForm] = useState(false);

  useEffect(() => {
    if (!openDialog) {
      setOpenReturnForm(false);
    }
  }, [openDialog]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  function handleOpenDialog() {
    setOpenDialog(true);
  }

  function handleCloseDialog() {
    setOpenDialog(false);
  }

  function handleRowClick(row: FoundItemType) {
    setModalData(row);
    handleOpenDialog();
  }

  async function handleDeletingFoundItem(id: number) {
    await deleteFoundItem(id);
    await handleGetFoundItems();
    handleCloseDialog();
  }

  async function handleReturnFoundItem(data: unknown) {
    try {
      await returnFoundItem(data as any);
      await handleGetFoundItems();
      handleCloseDialog();
      reset();
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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Found items</h1>

      {/* Totals displayed right after the title */}
      <div className="flex gap-4">
        <Badge className="rounded-sm bg-teal-600 text-white font-normal px-2 py-1">
          Found items: {foundItems.length}
        </Badge>
        <Badge className="rounded-sm bg-teal-600 text-white font-normal px-2 py-1">
          Items returned:{" "}
          {foundItems.filter((item) => !!item.returned_at).length}
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
                key={item.id}
                onClick={() => handleRowClick(item)}
                className="cursor-pointer hover:bg-gray-100"
              >
                <TableCell>{item.name}</TableCell>
                <TableCell>{item?.details}</TableCell>
                <TableCell>{formatDate(item.found_date)}</TableCell>
                <TableCell>{formatBoolean(item.is_returned)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Item Detail Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-xl">
          {modalData && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900">
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
              <div className="flex justify-end gap-2">
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
                          modalData && handleDeletingFoundItem(modalData.id)
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
                  disabled={modalData.is_returned === 1}
                >
                  Return
                </Button>
              </div>

              {openReturnForm && (
                <form
                  onSubmit={handleSubmit((data) =>
                    handleReturnFoundItem({ ...data, id: modalData.id }),
                  )}
                  className="space-y-2"
                >
                  <div>
                    <label className="block text-sm font-medium">
                      Person name
                    </label>
                    <Input
                      className="my-0"
                      {...register("returned_to_name", { required: true })}
                    />
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
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Returned by
                    </label>
                    <Input
                      className="my-0"
                      {...register("returned_by", { required: true })}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button size={"sm"} type="submit">
                      Submit return
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
