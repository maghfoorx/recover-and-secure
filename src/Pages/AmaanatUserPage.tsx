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
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { printAmaanatReceipt } from "@/apiApi/modules/amaanat";

// Types based on your Convex schema
type AmaanatUserType = {
  _id: Id<"amaanat_users">;
  name: string;
  aims_number?: string;
  jamaat?: string;
  phone_number?: string;
  _creationTime: number;
};

type AmaanatUserItemType = {
  _id: Id<"amaanat_items">;
  user_id: Id<"amaanat_users">;
  name: string;
  details?: string;
  location?: string;
  entry_date: number;
  returned_by?: string;
  is_returned: boolean;
  returned_at?: number;
  _creationTime: number;
};

export default function AmaanatUserPage() {
  const { userId } = useParams();

  // Convex queries
  const amaanatUser = useQuery(
    api.amaanat.queries.getAmaanatUser,
    userId ? { id: userId as Id<"amaanat_users"> } : "skip",
  );

  const amaanatItems =
    useQuery(
      api.amaanat.queries.getUserAmaanatItems,
      userId ? { userId: userId as Id<"amaanat_users"> } : "skip",
    ) || [];

  const handlePrint = async () => {
    const storedItems = amaanatItems.filter((item) => !item.is_returned);
    if (storedItems.length === 0) {
      toast.error("No items to print", {
        style: { backgroundColor: "red", color: "white" },
      });
      return;
    }

    // Note: You'll need to implement the print functionality
    // since printAmaanatReceipt was part of your API
    const computerName = localStorage.getItem("computerName") ?? "";
    const capitalizedComputerName =
      computerName.charAt(0).toUpperCase() + computerName.slice(1);
    const printData = {
      itemsNumber: storedItems.length,
      aimsID: amaanatUser?.aims_number || "",
      location: storedItems[0]?.location || "",
      computerName: capitalizedComputerName,
    };

    await printAmaanatReceipt(printData);
    // You'll need to implement this function or handle printing differently
    console.log("Print data:", printData);
    toast.info("Print functionality needs to be implemented");
  };

  if (!amaanatUser) return <div>Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <Header onPrint={handlePrint} userId={userId!} />
      <UserInfoCard user={amaanatUser} />
      <ItemsTabs items={amaanatItems} />
    </div>
  );
}

interface HeaderProps {
  onPrint: () => void;
  userId: string;
}

function Header({ onPrint, userId }: HeaderProps) {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  return (
    <>
      <div className="flex justify-between items-start">
        <Button variant="link" asChild>
          <Link to="/">← Back to All Users</Link>
        </Button>
        <div className="flex flex-row gap-2">
          <Button size="sm" onClick={onPrint} variant="secondary">
            Print receipt
          </Button>
          <Button size="sm" onClick={() => setOpenAddDialog(true)}>
            Add new items
          </Button>
        </div>
      </div>
      <AddItemDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        userId={userId as Id<"amaanat_users">}
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
              <th className="border-b px-2 py-1 text-left">AIMS number</th>
              <th className="border-b px-2 py-1 text-left">Jamaat</th>
              <th className="border-b px-2 py-1 text-left">Phone number</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b px-2 py-1">{user.aims_number}</td>
              <td className="border-b px-2 py-1">{user.jamaat || "N/A"}</td>
              <td className="border-b px-2 py-1">{user.phone_number}</td>
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
  userId: Id<"amaanat_users">;
}

function AddItemDialog({ open, onClose, userId }: AddItemDialogProps) {
  const addAmaanatItem = useMutation(api.amaanat.mutations.addAmaanatItem);

  const addForm = useForm({
    defaultValues: {
      name: "",
      details: "",
      location: "",
    },
  });

  const handleAddItem = async (data: any) => {
    try {
      await addAmaanatItem({
        user_id: userId,
        name: data.name,
        details: data.details,
        location: data.location,
      });

      toast.success("Item added successfully", {
        style: {
          backgroundColor: "green",
          color: "white",
        },
      });
      addForm.reset();
      onClose();
    } catch (error) {
      toast.error("Failed to add item");
      console.error("Error adding item:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        aria-describedby="Add a new item to your Amaanat"
        overlayClassName="backdrop-blur-sm"
      >
        <DialogTitle>Add item</DialogTitle>
        <div className="mb-10 flex flex-col gap-2">
          <Form {...addForm}>
            <form
              onSubmit={addForm.handleSubmit(handleAddItem)}
              className="space-y-4"
            >
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        className="my-0"
                        {...field}
                        required
                        placeholder="phone"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Details</FormLabel>
                    <FormControl>
                      <Input
                        className="my-0"
                        {...field}
                        required
                        placeholder="black iphone 6"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stored Location</FormLabel>
                    <FormControl>
                      <Input
                        className="my-0"
                        {...field}
                        required
                        placeholder="A1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit">Add item</Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ItemsTabsProps {
  items: AmaanatUserItemType[];
}

function ItemsTabs({ items }: ItemsTabsProps) {
  const [selectedItems, setSelectedItems] = useState<Id<"amaanat_items">[]>([]);
  const [selectedItem, setSelectedItem] = useState<AmaanatUserItemType | null>(
    null,
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);

  const returnAmaanatItem = useMutation(
    api.amaanat.mutations.returnAmaanatItem,
  );

  const storedItems = items.filter((item) => !item.is_returned);
  const returnedItems = items.filter((item) => item.is_returned);

  const selectedItemsDetails = storedItems.filter((item) =>
    selectedItems.includes(item._id),
  );

  const handleReturnItemsSubmit = async (returned_by: string) => {
    try {
      await Promise.all(
        selectedItems.map((id) => returnAmaanatItem({ id, returned_by })),
      );

      toast.success("Items returned successfully", {
        style: { backgroundColor: "green", color: "white" },
      });
      setSelectedItems([]);
      setReturnDialogOpen(false);
    } catch (error) {
      toast.error("Failed to return items");
      console.error("Error returning items:", error);
    }
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
                <TableHead>Item name</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date stored</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {storedItems.length === 0 && (
                <TableRow>
                  <TableCell className="text-center" colSpan={7}>
                    No items stored for this user
                  </TableCell>
                </TableRow>
              )}
              {storedItems.map((item) => (
                <TableRow
                  key={item._id}
                  onClick={() => {
                    setSelectedItem(item);
                    setDetailDialogOpen(true);
                  }}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedItems.includes(item._id)}
                      onCheckedChange={(checked) =>
                        setSelectedItems((prev) =>
                          checked
                            ? [...prev, item._id]
                            : prev.filter((id) => id !== item._id),
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    {(item?.details?.length ?? 0) > 30
                      ? `${item?.details?.slice(0, 45)}...`
                      : item.details}
                  </TableCell>
                  <TableCell>{item.location}</TableCell>
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
                <TableHead>Item name</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Returned by</TableHead>
                <TableHead>Returned date</TableHead>
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
                  key={item._id}
                  onClick={() => {
                    setSelectedItem(item);
                    setDetailDialogOpen(true);
                  }}
                >
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    {(item?.details?.length ?? 0) > 30
                      ? `${item?.details?.slice(0, 45)}...`
                      : item.details}
                  </TableCell>
                  <TableCell>{item.returned_by}</TableCell>
                  <TableCell>
                    {item.returned_at != null
                      ? formatDate(item.returned_at)
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
                {item.name}
              </DialogTitle>
            </DialogHeader>
            <dl className="mt-4 space-y-3">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Details</dt>
                <dd className="text-sm text-gray-900">{item.details}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Stored</dt>
                <dd className="text-sm text-gray-900">
                  {formatDate(item.entry_date)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd className="text-sm text-gray-900">{item.location}</dd>
              </div>
              {item.is_returned && (
                <>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">
                      Returned by
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {item.returned_by}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">
                      Return date
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {formatDate(item.returned_at!)}
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
          <DialogTitle>Return items</DialogTitle>
        </DialogHeader>
        <p>You are about to return:</p>
        <ul className="mb-4 list-disc pl-5">
          {selectedItemsDetails.map((item) => (
            <li key={item._id}>{item.name}</li>
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
                  <FormLabel>Returned by</FormLabel>
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
              <Button type="submit">Return items</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
