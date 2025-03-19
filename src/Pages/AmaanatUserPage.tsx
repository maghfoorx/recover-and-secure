import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/utils/formatDate";
import { AmaanatUserItemType, AmaanatUserType } from "@/type/moduleTypes";
import useFetchUserAmaanatItems from "@/hooks/useFetchUserAmaanatItems";
import {
  addAmaanatItem,
  printAmaanatReceipt,
  returnAmaanatItem,
} from "@/apiApi/modules/amaanat";

export default function AmaanatUserPage() {
  const { userId } = useParams();
  const {
    amaanatItems,
    amaanatUser,
    handleGetAmaanatUser,
    handleGetUserAmaanatItems,
  } = useFetchUserAmaanatItems({ ID: userId || "" });

  useEffect(() => {
    if (userId) handleGetAmaanatUser(userId);
  }, [userId]);

  const handlePrint = async () => {
    const storedItems = amaanatItems.filter((item) => !item.returned);
    if (storedItems.length === 0) {
      toast.error("No items to print", {
        style: { backgroundColor: "red", color: "white" },
      });
      return;
    }
    const computerName = localStorage.getItem("computerName") ?? "";
    const capitalizedComputerName =
      computerName.charAt(0).toUpperCase() + computerName.slice(1);
    const printData = {
      itemsNumber: storedItems.length,
      aimsID: amaanatUser?.aims_no || "",
      location: storedItems[0]?.stored_location || "",
      computerName: capitalizedComputerName,
    };

    await printAmaanatReceipt(printData);
  };

  if (!amaanatUser) return null;

  return (
    <div className="p-6 space-y-6">
      <Header
        onPrint={handlePrint}
        userId={userId!}
        onItemAdded={() => handleGetUserAmaanatItems(userId!)}
      />
      <UserInfoCard user={amaanatUser} />
      <ItemsTabs
        items={amaanatItems}
        refreshItems={() => handleGetUserAmaanatItems(userId!)}
      />
    </div>
  );
}

interface HeaderProps {
  onPrint: () => void;
  userId: string;
  onItemAdded: () => void;
}

function Header({ onPrint, userId, onItemAdded }: HeaderProps) {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  return (
    <>
      <div className="flex justify-between items-start">
        <Button variant="link" asChild>
          <Link to="/">← Back to All Users</Link>
        </Button>
        <div className="flex flex-row gap-2">
          <Button size="sm" onClick={onPrint} variant="secondary">
            Print Receipt
          </Button>
          <Button size="sm" onClick={() => setOpenAddDialog(true)}>
            Add New Items
          </Button>
        </div>
      </div>
      <AddItemDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        userId={userId}
        onItemAdded={onItemAdded}
      />
    </>
  );
}

interface UserInfoCardProps {
  user: AmaanatUserType;
}

function UserInfoCard({ user }: UserInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-4xl">{user.name}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm">
        <table className="min-w-full table-auto">
          <thead>
            <tr>
              <th className="border-b px-2 py-1 text-left">Aims Number</th>
              <th className="border-b px-2 py-1 text-left">Jamaat</th>
              <th className="border-b px-2 py-1 text-left">Phone Number</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b px-2 py-1">{user.aims_no}</td>
              <td className="border-b px-2 py-1">{user.jamaat || "N/A"}</td>
              <td className="border-b px-2 py-1">{user.phone_no}</td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

interface AddItemDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onItemAdded: () => void;
}

function AddItemDialog({
  open,
  onClose,
  userId,
  onItemAdded,
}: AddItemDialogProps) {
  const addForm = useForm({
    defaultValues: {
      item_name: "",
      item_details: "",
      stored_location: "",
    },
  });

  const handleAddItem = async (data: any) => {
    const response = await addAmaanatItem({ ...data, user_id: userId });
    if (response.id != null) {
      onItemAdded();
      toast.success("Item added successfully", {
        style: {
          backgroundColor: "green",
          color: "white",
        },
      });
      addForm.reset();
      onClose();
    } else {
      toast.error("Failed to add item");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        aria-describedby="Add a new item to your Amaanat"
        overlayClassName="backdrop-blur-sm"
      >
        <DialogTitle>Add Item</DialogTitle>
        <div className="mb-10 flex flex-col gap-4">
          <Form {...addForm}>
            <form
              onSubmit={addForm.handleSubmit(handleAddItem)}
              className="space-y-4"
            >
              <FormField
                control={addForm.control}
                name="item_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="item_details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Details</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="stored_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stored Location</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Add Item</Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ItemsTabsProps {
  items: AmaanatUserItemType[];
  refreshItems: () => void;
}

function ItemsTabs({ items, refreshItems }: ItemsTabsProps) {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedItem, setSelectedItem] = useState<AmaanatUserItemType | null>(
    null,
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);

  const storedItems = items.filter((item) => !item.returned);
  const returnedItems = items.filter((item) => item.returned);

  const selectedItemsDetails = storedItems.filter((item) =>
    selectedItems.includes(item.id),
  );

  const handleReturnItemsSubmit = async (returnedBy: string) => {
    await Promise.all(
      selectedItems.map((id) => returnAmaanatItem({ id, returnedBy })),
    );
    refreshItems();
    toast.success("Items returned successfully", {
      style: { backgroundColor: "green", color: "white" },
    });
    setSelectedItems([]);
    setReturnDialogOpen(false);
  };

  return (
    <>
      <Tabs defaultValue="stored">
        <div className="flex flex-row justify-between">
          <TabsList>
            <TabsTrigger value="stored">
              Stored ({storedItems.length})
            </TabsTrigger>
            <TabsTrigger value="returned">
              Returned ({returnedItems.length})
            </TabsTrigger>
          </TabsList>

          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setReturnDialogOpen(true)}
              disabled={selectedItems.length === 0}
            >
              Return selected items
            </Button>
          </div>
        </div>
        <TabsContent value="stored">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Select</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date Stored</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {storedItems.length === 0 && (
                <TableRow>
                  <TableCell className="text-center" colSpan={5}>
                    No items stored for this user
                  </TableCell>
                </TableRow>
              )}
              {storedItems.map((item) => (
                <TableRow
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    setDetailDialogOpen(true);
                  }}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={(checked) =>
                        setSelectedItems((prev) =>
                          checked
                            ? [...prev, item.id]
                            : prev.filter((id) => id !== item.id),
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>{item.item_name}</TableCell>
                  <TableCell>
                    {item.item_details.length > 30
                      ? `${item.item_details.slice(0, 45)}...`
                      : item.item_details}
                  </TableCell>
                  <TableCell>{item.stored_location}</TableCell>
                  <TableCell>{formatDate(item.entry_date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="returned">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Returned By</TableHead>
                <TableHead>Returned Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {returnedItems.length === 0 && (
                <TableRow>
                  <TableCell className="text-center" colSpan={5}>
                    No items returned for this user
                  </TableCell>
                </TableRow>
              )}
              {returnedItems.map((item) => (
                <TableRow
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    setDetailDialogOpen(true);
                  }}
                >
                  <TableCell>{item.item_name}</TableCell>
                  <TableCell>
                    {item.item_details.length > 30
                      ? `${item.item_details.slice(0, 45)}...`
                      : item.item_details}
                  </TableCell>
                  <TableCell>{item.returned_by}</TableCell>
                  <TableCell>
                    {item.returned_date != null
                      ? formatDate(item.returned_date)
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
      <ItemDetailDialog
        item={selectedItem}
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
      />
      <ReturnItemsDialog
        returnItemsDialogOpen={returnDialogOpen}
        setReturnItemsDialogOpen={setReturnDialogOpen}
        selectedItemsDetails={selectedItemsDetails}
        onSubmitReturn={handleReturnItemsSubmit}
      />
    </>
  );
}

interface ItemDetailDialogProps {
  item: AmaanatUserItemType | null;
  open: boolean;
  onClose: () => void;
}
function ItemDetailDialog({ item, open, onClose }: ItemDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-6">
        {item ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {item.item_name}
              </DialogTitle>
            </DialogHeader>
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Details</dt>
                <dd className="text-sm text-gray-900">{item.item_details}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Stored</dt>
                <dd className="text-sm text-gray-900">
                  {formatDate(item.entry_date)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="text-sm text-gray-900">
                  {item.stored_location}
                </dd>
              </div>
              {item.returned && (
                <>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">
                      Returned By
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {item.returned_by}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">
                      Return Date
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {formatDate(item.returned_date!)}
                    </dd>
                  </div>
                </>
              )}
            </dl>
          </>
        ) : (
          <p className="text-gray-600">No item details available.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ReturnItemsDialogProps {
  returnItemsDialogOpen: boolean;
  setReturnItemsDialogOpen: (open: boolean) => void;
  selectedItemsDetails: AmaanatUserItemType[];
  onSubmitReturn: (returnedBy: string) => Promise<void>;
}

function ReturnItemsDialog({
  returnItemsDialogOpen,
  setReturnItemsDialogOpen,
  selectedItemsDetails,
  onSubmitReturn,
}: ReturnItemsDialogProps) {
  const returnForm = useForm({
    defaultValues: {
      returned_by: "",
    },
  });

  const handleFormSubmit = async (data: { returned_by: string }) => {
    await onSubmitReturn(data.returned_by);
    returnForm.reset();
  };

  return (
    <Dialog
      open={returnItemsDialogOpen}
      onOpenChange={setReturnItemsDialogOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Return Items</DialogTitle>
        </DialogHeader>
        <p>You are about to return:</p>
        <ul className="mb-4 list-disc pl-5">
          {selectedItemsDetails.map((item) => (
            <li key={item.id}>{item.item_name}</li>
          ))}
        </ul>
        <Form {...returnForm}>
          <form
            onSubmit={returnForm.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            <FormField
              control={returnForm.control}
              name="returned_by"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Returned By</FormLabel>
                  <FormControl>
                    <Input {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setReturnItemsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Return Items</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
