import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";

export default function AmaanatAddItemsForm({
  computerName,
}: {
  computerName: string;
}) {
  const { userId } = useParams();
  const userIdAsId = userId as Id<"amaanat_users"> | undefined;

  // Fetch user data using Convex
  const amaanatUser = useQuery(
    api.amaanat.queries.getAmaanatUser,
    userIdAsId ? { id: userIdAsId } : "skip",
  );

  // Fetch user items using Convex
  const amaanatItems =
    useQuery(
      api.amaanat.queries.getUserAmaanatItems,
      userIdAsId ? { userId: userIdAsId } : "skip",
    ) || [];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const [success, setSuccess] = useState<boolean>(false);
  const [addedItem, setAddedItem] = useState<Doc<"amaanat_items"> | null>(null);
  const [showPrintError, setShowPrintError] = useState(false);

  // Add item mutation
  const addItemMutation = useMutation(api.amaanat.mutations.addAmaanatItem);

  async function handleSubmitForm(data: any) {
    if (!userIdAsId) return;

    try {
      const newItem = await addItemMutation({
        user_id: userIdAsId,
        name: data.name,
        details: data.details,
        location: data.location,
      });

      if (newItem) {
        setAddedItem(newItem);
        setSuccess(true);
        reset();
        setTimeout(() => setSuccess(false), 2000);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handlePrintReceipt() {
    if (!amaanatUser) return;

    const storedItems = amaanatItems?.filter((item) => !item.is_returned) || [];

    if (storedItems.length < 1) {
      setShowPrintError(true);
      setTimeout(() => setShowPrintError(false), 3000);
    } else {
      // This function likely needs to be implemented as a Convex function
      // For now, we'll keep it as a client-side function
      const data = {
        itemsNumber: storedItems.length,
        aimsID: amaanatUser.aims_number || "",
        location: storedItems[0]?.location_id ?? "",
        computerName,
      };
      // await printAmaanatReceipt(data);
      console.log("Print receipt with data:", data);
    }
  }

  const returnedItems = amaanatItems.filter((item) => item.is_returned);
  const storedItems = amaanatItems.filter((item) => !item.is_returned);

  if (!userIdAsId) return <div>Invalid user ID</div>;
  if (!amaanatUser) return <div>Loading user data...</div>;

  return (
    <div className="space-y-4 p-6">
      <Link to={`/amaanat/${userId}`} className="text-blue-500 hover:underline">
        Go back
      </Link>

      <Card className="p-4">
        <h1 className="text-xl font-semibold">
          Add items for {amaanatUser.name}
        </h1>
        <form
          onSubmit={handleSubmit(handleSubmitForm)}
          className="space-y-4 mt-4"
        >
          <div>
            <Input
              placeholder="Item Name"
              {...register("name", { required: "Item Name is required" })}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.name.message as string}
              </p>
            )}
          </div>

          <div>
            <Input placeholder="Item Details" {...register("details")} />
          </div>

          <div>
            <Input placeholder="Storing Location" {...register("location")} />
          </div>

          <input
            type="hidden"
            {...register("user_id", { value: userIdAsId })}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Item"}
          </Button>

          {success && addedItem && (
            <Alert className="mt-2">
              <AlertDescription>
                Successfully added {addedItem.name}!
              </AlertDescription>
            </Alert>
          )}
        </form>
      </Card>

      <Button
        onClick={handlePrintReceipt}
        className="w-full"
        disabled={storedItems.length === 0}
      >
        Print Receipt
      </Button>

      {showPrintError && (
        <Alert className="mt-2">
          <AlertDescription>
            Sorry! {amaanatUser.name} does not have any items stored.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-4">
        <h2 className="text-lg font-semibold">
          {amaanatUser.name}'s stored items ({storedItems.length}):
        </h2>
        {storedItems.length < 1 ? (
          <p>No items stored.</p>
        ) : (
          storedItems.map((item) => (
            <p key={item._id} className="border p-2 rounded-md">
              {item.name}
            </p>
          ))
        )}
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-semibold">
          {amaanatUser.name}'s returned items ({returnedItems.length}):
        </h2>
        {returnedItems.length < 1 ? (
          <p>No items returned yet.</p>
        ) : (
          returnedItems.map((item) => (
            <p key={item._id} className="border p-2 rounded-md">
              {item.name}
            </p>
          ))
        )}
      </Card>
    </div>
  );
}
