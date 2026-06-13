import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
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
import { Doc, Id } from "../../convex/_generated/dataModel";
import { printAmaanatReceipt } from "@/apiApi/modules/amaanat";
import FullScreenSpinner from "@/components/FullScreenSpinner";
import {
  LOCATION_COLOUR_BY_SIZE,
  LOCATION_NAME_BY_ID,
} from "../../convex/types";
import { cn } from "@/lib/utils";
import { Infer } from "convex/values";
import { getUserAmaanatItems } from "convex/amaanat/queries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getLostItemCategoryDisplayLabel,
  getLostItemCategoryLabel,
  LOST_ITEM_CATEGORIES,
  OTHER_LOST_ITEM_CATEGORY,
} from "@/lib/lostItemCategories";

const ALL_CATEGORIES_VALUE = "all_categories";

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
  category_slug?: string;
  name: string;
  details?: string;
  location_id: Id<"amaanat_locations">;
  locationNumber: number | null;
  locationSize: string | null;
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

    const computerName = localStorage.getItem("computerName") ?? "";
    const printerName = localStorage.getItem("storedPrinterName");

    if (!printerName) {
      toast.error("No printer name is set", {
        style: { backgroundColor: "red", color: "white" },
      });
      return;
    }

    const storedLocationString = Array.from(
      new Set(storedItems.map((item) => item.locationNumber)),
    ).join(" | ");
    const capitalizedComputerName =
      computerName.charAt(0).toUpperCase() + computerName.slice(1);
    const printData = {
      itemsNumber: storedItems.length,
      aimsID: amaanatUser?.aims_number || "",
      location: storedLocationString,
      computerName: capitalizedComputerName,
      printerName: printerName,
    };

    await printAmaanatReceipt(printData);
    // console.log("Print data:", printData);
    // toast.info("Print functionality needs to be implemented");
  };

  if (amaanatUser === undefined)
    return (
      <div className="flex items-center justify-center h-full">
        <FullScreenSpinner />
      </div>
    );

  if (amaanatUser === null) {
    return (
      <div className="px-2 py-6 space-y-6">
        <div>
          <Button variant="link" asChild>
            <Link to="/">← Back to all users</Link>
          </Button>
        </div>
        <div>Something has gone wrong. This user can't be found.</div>
      </div>
    );
  }

  return (
    <div className="px-2 py-6 space-y-6">
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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <Button variant="outline" size="lg" asChild className="w-full lg:w-auto">
          <Link to="/">← Back to all users</Link>
        </Button>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-auto">
          <Button
            size="lg"
            onClick={onPrint}
            variant="secondary"
            className="w-full"
          >
            Print receipt
          </Button>
          <Button
            size="lg"
            onClick={() => setOpenAddDialog(true)}
            className="w-full"
          >
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
      <CardHeader className="pb-4">
        <CardTitle className="text-3xl md:text-4xl">{user.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-3 md:grid-cols-3">
          <InfoTile label="AIMS number" value={user.aims_number || "N/A"} />
          <InfoTile label="Jamaat" value={user.jamaat || "N/A"} />
          <InfoTile label="Phone number" value={user.phone_number || "N/A"} />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-slate-950">{value}</div>
    </div>
  );
}

interface AddItemDialogProps {
  open: boolean;
  onClose: () => void;
  userId: Id<"amaanat_users">;
}

function AddItemDialog({ open, onClose, userId }: AddItemDialogProps) {
  const addAmaanatItem = useMutation(api.amaanat.mutations.addAmaanatItem);

  // Pass userId to get locations available for this specific user
  const allAvailableLocationsBySize = useQuery(
    api.location.queries.getAvailableLocations,
    { userId },
  );

  const availableLocationIds = useMemo(() => {
    return allAvailableLocationsBySize
      ? Object.values(allAvailableLocationsBySize)
          .flat()
          .map((loc) => loc._id)
      : [];
  }, [allAvailableLocationsBySize]);

  const addItemSchema = z.object({
    category_slug: z.string().min(1, "Item category is required"),
    name: z.string(),
    details: z.string().optional(),
    location: z
      .string()
      .refine(
        (val) => availableLocationIds.includes(val as Id<"amaanat_locations">),
        {
          message: "Please select a valid location",
        },
      ),
  }).superRefine((data, ctx) => {
    if (
      data.category_slug === OTHER_LOST_ITEM_CATEGORY &&
      data.name.trim().length === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Item name is required",
        path: ["name"],
      });
    }
  });

  const addForm = useForm({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      category_slug: "",
      name: "",
      details: "",
      location: "",
    },
  });

  const selectedCategory = addForm.watch("category_slug");
  const isCustomCategory = selectedCategory === OTHER_LOST_ITEM_CATEGORY;
  const selectedCategoryDisplayLabel =
    getLostItemCategoryDisplayLabel(selectedCategory);

  const handleCategoryChange = (value: string) => {
    addForm.setValue("category_slug", value, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (value === OTHER_LOST_ITEM_CATEGORY) {
      addForm.setValue("name", "", {
        shouldDirty: true,
        shouldValidate: false,
      });
      addForm.clearErrors("name");
      return;
    }

    addForm.setValue("name", getLostItemCategoryLabel(value), {
      shouldDirty: true,
      shouldValidate: false,
    });
    addForm.clearErrors("name");
  };

  const handleAddItem = async (data: any) => {
    try {
      const resolvedName = isCustomCategory
        ? data.name.trim()
        : getLostItemCategoryLabel(data.category_slug);

      await addAmaanatItem({
        user_id: userId,
        category_slug: data.category_slug,
        name: resolvedName,
        details: data.details,
        location: data.location,
      });

      toast.success(
        "Item added successfully. Add another item or close the dialog",
        {
          style: {
            backgroundColor: "green",
            color: "white",
          },
        },
      );

      addForm.reset({
        category_slug: "",
        name: "",
        details: "",
        location: "",
      });
    } catch (error) {
      toast.error("Failed to add item");
      console.error("Error adding item:", error);
    }
  };

  const handleCloseDialog = () => {
    addForm.reset({
      category_slug: "",
      name: "",
      details: "",
      location: "",
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent
        aria-describedby="Add a new item to your Amaanat"
        overlayClassName="backdrop-blur-sm"
        className="max-w-[900px]"
      >
        <DialogTitle>Add item</DialogTitle>
        <div className="flex flex-col gap-2">
          <Form {...addForm}>
            <form
              onSubmit={addForm.handleSubmit(handleAddItem)}
              className="space-y-2"
            >
              <FormField
                control={addForm.control}
                name="category_slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item category*</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={handleCategoryChange}
                      >
                        <SelectTrigger className="my-0">
                          <SelectValue placeholder="Select item category" />
                        </SelectTrigger>
                        <SelectContent>
                          {LOST_ITEM_CATEGORIES.map((category, index) => (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                            >
                              {index + 1}. {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isCustomCategory ? (
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item name*</FormLabel>
                      <FormControl>
                        <Input
                          className="my-0"
                          {...field}
                          placeholder="phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : selectedCategoryDisplayLabel ? (
                <div className="rounded-md border bg-slate-50 px-3 py-3">
                  <div className="text-sm font-medium text-slate-900">
                    Selected item
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    This Amaanat item will be saved as{" "}
                    <span className="font-medium">
                      {selectedCategoryDisplayLabel}
                    </span>
                    .
                  </div>
                </div>
              ) : null}

              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <input type="hidden" {...field} />
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
                    <FormLabel>Choose storage location*</FormLabel>
                    <FormControl>
                      <Tabs defaultValue="x_small" className="w-full">
                        <TabsList className="grid grid-cols-6">
                          {(
                            [
                              "x_small",
                              "small",
                              "medium",
                              "large",
                              "x_large",
                              "bulky_storage",
                            ] as const
                          ).map((size) => {
                            const isUsedByCurrentUser =
                              allAvailableLocationsBySize?.[size]?.some(
                                (availableLoc) => availableLoc.is_occupied,
                              );

                            return (
                              <TabsTrigger
                                key={size}
                                value={size}
                                className={cn(
                                  LOCATION_COLOUR_BY_SIZE[size],
                                  "relative data-[state=active]:border data-[state=active]:border-gray-400 data-[state=active]:font-semibold data-[state=active]:shadow-sm data-[state=active]:saturate-150",
                                  {
                                    // override with more saturated color when active
                                    "data-[state=active]:bg-pink-200":
                                      size === "x_small",

                                    "data-[state=active]:bg-rose-200":
                                      size === "small",
                                    "data-[state=active]:bg-orange-200":
                                      size === "medium",
                                    "data-[state=active]:bg-green-200":
                                      size === "large",

                                    "data-[state=active]:bg-teal-200":
                                      size === "x_large",
                                    "data-[state=active]:bg-sky-200":
                                      size === "bulky_storage",
                                  },
                                )}
                              >
                                {LOCATION_NAME_BY_ID[size]}

                                {isUsedByCurrentUser && (
                                  <span className="absolute z-50 -top-1 -right-0 w-3 h-3 bg-green-500 rounded-full"></span>
                                )}
                              </TabsTrigger>
                            );
                          })}
                        </TabsList>

                        {(
                          [
                            "x_small",
                            "small",
                            "medium",
                            "large",
                            "x_large",
                            "bulky_storage",
                          ] as const
                        ).map((size) => (
                          <TabsContent key={size} value={size}>
                            <div className="flex flex-wrap gap-2 p-2 mt-4 h-[200px] overflow-y-auto items-start content-start">
                              {(allAvailableLocationsBySize?.[size] || [])
                                .length === 0 && (
                                <div className="px-2">
                                  All {size} locations are occupied by other
                                  users
                                </div>
                              )}
                              {(allAvailableLocationsBySize?.[size] || [])
                                .sort((a, b) => {
                                  // Sort occupied locations (by current user) first
                                  const aOccupied = a.is_occupied ? 1 : 0;
                                  const bOccupied = b.is_occupied ? 1 : 0;
                                  return bOccupied - aOccupied;
                                })
                                .map((loc) => {
                                  // Check if this location is already used by current user
                                  const isUsedByCurrentUser =
                                    allAvailableLocationsBySize?.[size]?.some(
                                      (availableLoc) =>
                                        availableLoc._id === loc._id &&
                                        availableLoc.is_occupied,
                                    );

                                  return (
                                    <Button
                                      size={"sm"}
                                      variant={"outline"}
                                      key={loc._id}
                                      type="button"
                                      onClick={() => field.onChange(loc._id)}
                                      className={cn(
                                        "px-3 py-1 rounded-md border text-sm transition hover:opacity-55 relative",
                                        {
                                          "bg-blue-600 text-white border-blue-600 hover:bg-opacity-55 hover:bg-blue-600 hover:text-white":
                                            field.value === loc._id,
                                          "text-gray-800 border-gray-300 hover:bg-opacity-55":
                                            field.value !== loc._id,
                                          [LOCATION_COLOUR_BY_SIZE[size]]:
                                            field.value !== loc._id,
                                          "ring-4 ring-green-400":
                                            isUsedByCurrentUser,
                                        },
                                      )}
                                    >
                                      {loc.number}
                                      {isUsedByCurrentUser && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
                                      )}
                                    </Button>
                                  );
                                })}
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    addForm.reset({
                      category_slug: "",
                      name: "",
                      details: "",
                      location: "",
                    });
                    onClose();
                  }}
                >
                  Done adding items
                </Button>
                <Button type="submit">Add Item</Button>
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
  const [selectedCategory, setSelectedCategory] = useState(
    localStorage.getItem("filterAmaanatItemsByCategory") ||
      ALL_CATEGORIES_VALUE,
  );

  const returnAmaanatItem = useMutation(
    api.amaanat.mutations.returnAmaanatItem,
  );

  const storedItems = useMemo(
    () => items.filter((item) => !item.is_returned),
    [items],
  );
  const returnedItems = useMemo(
    () => items.filter((item) => item.is_returned),
    [items],
  );

  const filteredStoredItems = useMemo(() => {
    if (selectedCategory === ALL_CATEGORIES_VALUE) {
      return storedItems;
    }

    return storedItems.filter((item) => item.category_slug === selectedCategory);
  }, [selectedCategory, storedItems]);

  const filteredReturnedItems = useMemo(() => {
    if (selectedCategory === ALL_CATEGORIES_VALUE) {
      return returnedItems;
    }

    return returnedItems.filter(
      (item) => item.category_slug === selectedCategory,
    );
  }, [selectedCategory, returnedItems]);

  const selectedItemsDetails = storedItems.filter((item) =>
    selectedItems.includes(item._id),
  );

  useEffect(() => {
    setSelectedItems((previous) =>
      previous.filter((id) =>
        filteredStoredItems.some((item) => item._id === id),
      ),
    );
  }, [filteredStoredItems]);

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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <TabsList className="grid h-12 w-full grid-cols-2 lg:max-w-md">
            <TabsTrigger value="stored" className="text-base">
              Stored ({storedItems.length})
            </TabsTrigger>
            <TabsTrigger value="returned" className="text-base">
              Returned ({returnedItems.length})
            </TabsTrigger>
          </TabsList>

          <div className="w-full lg:w-auto">
            <Button
              size="lg"
              variant="outline"
              onClick={() => setReturnDialogOpen(true)}
              disabled={selectedItems.length === 0}
              className="w-full lg:w-auto"
            >
              {selectedItems.length > 0
                ? `Return selected items (${selectedItems.length})`
                : "Return selected items"}
            </Button>
          </div>
        </div>
        {selectedItems.length > 0 && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {selectedItems.length} item
            {selectedItems.length === 1 ? "" : "s"} selected for return
          </div>
        )}
        <div className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full max-w-sm">
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                localStorage.setItem("filterAmaanatItemsByCategory", value);
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
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filteredStoredItems.length + filteredReturnedItems.length}
            </span>{" "}
            of {items.length} items
          </p>
        </div>
        <TabsContent value="stored">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Select</TableHead>
                <TableHead>Item name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date stored</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStoredItems.length === 0 && (
                <TableRow>
                  <TableCell className="text-center" colSpan={6}>
                    {selectedCategory === ALL_CATEGORIES_VALUE
                      ? "No items stored for this user"
                      : "No stored items match the current category filter"}
                  </TableCell>
                </TableRow>
              )}
              {filteredStoredItems.map((item) => (
                <TableRow
                  key={item._id}
                  onClick={() => {
                    setSelectedItem(item);
                    setDetailDialogOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      className="h-5 w-5"
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
                    {item.category_slug
                      ? getLostItemCategoryDisplayLabel(item.category_slug)
                      : "Uncategorized"}
                  </TableCell>
                  <TableCell>
                    {(item?.details?.length ?? 0) > 30
                      ? `${item?.details?.slice(0, 45)}...`
                      : item.details}
                  </TableCell>
                  <TableCell
                    className={cn("text-sm text-gray-900", {
                      [LOCATION_COLOUR_BY_SIZE[
                        item?.locationSize as unknown as
                          | "small"
                          | "medium"
                          | "large"
                      ]]: Boolean([
                        LOCATION_COLOUR_BY_SIZE[
                          item?.locationSize as unknown as
                            | "small"
                            | "medium"
                            | "large"
                        ],
                      ]),
                    })}
                  >
                    {item.locationNumber}
                  </TableCell>
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
                <TableHead>Category</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Returned by</TableHead>
                <TableHead>Returned date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReturnedItems.length === 0 && (
                <TableRow>
                  <TableCell className="text-center" colSpan={5}>
                    {selectedCategory === ALL_CATEGORIES_VALUE
                      ? "No items returned for this user"
                      : "No returned items match the current category filter"}
                  </TableCell>
                </TableRow>
              )}
              {filteredReturnedItems.map((item) => (
                <TableRow
                  key={item._id}
                  onClick={() => {
                    setSelectedItem(item);
                    setDetailDialogOpen(true);
                  }}
                  className="cursor-pointer"
                >
                  <TableCell>{item.name}</TableCell>
                  <TableCell>
                    {item.category_slug
                      ? getLostItemCategoryDisplayLabel(item.category_slug)
                      : "Uncategorized"}
                  </TableCell>
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
              {item.category_slug && (
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Category
                  </dt>
                  <dd className="text-sm text-gray-900">
                    {getLostItemCategoryDisplayLabel(item.category_slug)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Stored</dt>
                <dd className="text-sm text-gray-900">
                  {formatDate(item.entry_date)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-500">Location</dt>
                <dd
                  className={cn("text-sm text-gray-900", {
                    [LOCATION_COLOUR_BY_SIZE[
                      item?.locationSize as unknown as
                        | "small"
                        | "medium"
                        | "large"
                    ]]: Boolean([
                      LOCATION_COLOUR_BY_SIZE[
                        item?.locationSize as unknown as
                          | "small"
                          | "medium"
                          | "large"
                      ],
                    ]),
                  })}
                >
                  {item?.locationNumber}
                </dd>
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
