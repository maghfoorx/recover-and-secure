import useFetchUserAmaanatItems from "@/hooks/useFetchUserAmaanatItems";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { AmaanatUserItemType } from "@/type/moduleTypes";
import { addAmaanatItem, printAmaanatReceipt } from "@/apiApi/modules/amaanat";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AmaanatAddItemsForm({
  computerName,
}: {
  computerName: string;
}) {
  const { userId } = useParams();
  if (!userId) return null;

  const {
    amaanatUser,
    handleGetAmaanatUser,
    amaanatItems,
    handleGetUserAmaanatItems,
  } = useFetchUserAmaanatItems({ ID: userId });

  useEffect(() => {
    handleGetAmaanatUser(userId);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [success, setSuccess] = useState<boolean>(false);
  const [addedItem, setAddedItem] = useState<AmaanatUserItemType | null>(null);
  const [showPrintError, setShowPrintError] = useState(false);

  async function handleSubmitForm(data: unknown) {
    try {
      const response = await addAmaanatItem(data);
      setAddedItem(response[0]);
      handleGetUserAmaanatItems(userId!);
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error(error);
    }
  }

  async function handlePrintReceipt() {
    const storedItems = amaanatItems?.filter((item) => item.is_returned === 0);
    if (storedItems.length < 1) {
      setShowPrintError(true);
      setTimeout(() => setShowPrintError(false), 3000);
    } else {
      const data = {
        itemsNumber: storedItems.length,
        aimsID: amaanatUser?.aims_number,
        location: storedItems[0]?.location ?? "",
        computerName,
      };
      await printAmaanatReceipt(data);
    }
  }

  const returnedItems = amaanatItems.filter((item) => item.is_returned === 1);
  const storedItems = amaanatItems.filter((item) => item.is_returned === 0);

  return (
    <div className="space-y-4 p-6">
      <Link to={`/amaanat/${userId}`} className="text-blue-500 hover:underline">
        Go back
      </Link>

      <Card className="p-4">
        <h1 className="text-xl font-semibold">
          Add items for {amaanatUser?.name}
        </h1>
        <form
          onSubmit={handleSubmit(handleSubmitForm)}
          className="space-y-4 mt-4"
        >
          <Input
            placeholder="Item Name"
            {...register("name", { required: true })}
          />
          {errors.name && <p className="text-red-500">Item Name is required</p>}

          <Input placeholder="Item Details" {...register("details")} />
          <Input placeholder="Storing Location" {...register("location")} />
          <input type="hidden" {...register("user_id", { value: userId })} />

          <Button type="submit">Add Item</Button>
          {success && addedItem && (
            <Alert className="mt-2">
              <AlertDescription>
                Successfully added {addedItem.name}!
              </AlertDescription>
            </Alert>
          )}
        </form>
      </Card>

      <Button onClick={handlePrintReceipt} className="w-full">
        Print Receipt
      </Button>
      {showPrintError && (
        <Alert className="mt-2">
          <AlertDescription>
            Sorry! {amaanatUser?.name} does not have any items stored.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-4">
        <h2 className="text-lg font-semibold">
          {amaanatUser?.name}'s stored items ({storedItems.length}):
        </h2>
        {storedItems.length < 1 ? (
          <p>No items stored.</p>
        ) : (
          storedItems.map((item) => (
            <p key={item.id} className="border p-2 rounded-md">
              {item.name}
            </p>
          ))
        )}
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-semibold">
          {amaanatUser?.name}'s returned items ({returnedItems.length}):
        </h2>
        {returnedItems.length < 1 ? (
          <p>No items returned yet.</p>
        ) : (
          returnedItems.map((item) => (
            <p key={item.id} className="border p-2 rounded-md">
              {item.name}
            </p>
          ))
        )}
      </Card>
    </div>
  );
}
