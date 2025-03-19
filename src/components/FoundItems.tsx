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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

export default function FoundItems(): JSX.Element {
  const { foundItems, handleGetFoundItems } = useFetchLostPropertyData();

  const [searchBarValue, setSearchBarValue] = useState("");
  // Filter found items by either name or details.
  const includesItemName = foundItems.filter((item) =>
    item.item_name
      .toLocaleLowerCase()
      .includes(searchBarValue.toLocaleLowerCase()),
  );
  const includesItemDetails = foundItems.filter((item) =>
    item.details
      .toLocaleLowerCase()
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
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Found Items</h1>

      {/* Totals displayed right after the title */}
      <div className="flex gap-4">
        <Badge className="rounded-sm bg-teal-600 text-white font-normal px-2 py-1">
          Found items: {foundItems.length}
        </Badge>
        <Badge className="rounded-sm bg-teal-600 text-white font-normal px-2 py-1">
          Items returned:{" "}
          {foundItems.filter((item) => item.returned_date).length}
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
            <TableHead>Date Found</TableHead>
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
                <TableCell>{item.item_name}</TableCell>
                <TableCell>{item.details}</TableCell>
                <TableCell>{formatDate(item.found_date)}</TableCell>
                <TableCell>{formatBoolean(item.returned)}</TableCell>
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
                    Date Found
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {formatDate(modalData.found_date)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Found Area
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {modalData.found_area}
                  </dd>
                </div>
                {modalData.finder_name && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">
                      Found By
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {modalData.finder_name}
                    </dd>
                  </div>
                )}
                {modalData.aims_number && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">
                      Founder's AIMS
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {modalData.aims_number}
                    </dd>
                  </div>
                )}
                {modalData.received_by && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">
                      Received By
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {modalData.received_by}
                    </dd>
                  </div>
                )}
              </dl>
              <hr className="my-0" />
              {(modalData.person_name ||
                modalData.returned_by ||
                modalData.returned_date) && (
                <dl className="mt-4 space-y-1">
                  {modalData.person_name && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">
                        Returned To
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {modalData.person_name}
                      </dd>
                    </div>
                  )}
                  {modalData.aims_number && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">
                        Returned Person AIMS Number
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {modalData.aims_number}
                      </dd>
                    </div>
                  )}
                  {modalData.returned_by && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">
                        Returned By
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {modalData.returned_by}
                      </dd>
                    </div>
                  )}
                  {modalData.returned_date && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">
                        Returned Date
                      </dt>
                      <dd className="text-sm text-gray-900">
                        {formatDate(modalData.returned_date)}
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
                  disabled={modalData.returned === 1}
                >
                  Return
                </Button>
              </div>

              {openReturnForm && (
                <form
                  onSubmit={handleSubmit((data) =>
                    handleReturnFoundItem({ ...data, itemID: modalData.id }),
                  )}
                  className="space-y-2"
                >
                  <div>
                    <label className="block text-sm font-medium">
                      Person Name
                    </label>
                    <Input
                      className="my-0"
                      {...register("person_name", { required: true })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      AIMS Number
                    </label>
                    <Input
                      className="my-0"
                      {...register("aims_number", { required: true })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Returned By
                    </label>
                    <Input
                      className="my-0"
                      {...register("returned_by", { required: true })}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button size={"sm"} type="submit">
                      Submit Return
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
