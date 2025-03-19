import { useForm } from "react-hook-form";
import { useState } from "react";
import { postFoundItem } from "@/apiApi/modules/lostProperty";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function FoundItemForm() {
  const [isCash, setIsCash] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  async function handlePostingForm(data: any) {
    try {
      await postFoundItem(data);
      reset();
      toast.success("Successfully added found item!", {
        style: {
          backgroundColor: "green",
          color: "white",
        },
      });
    } catch (error) {
      toast.error("Failed to add found item!", {
        style: {
          backgroundColor: "red",
          color: "white",
        },
      });
      console.error(error);
    }
  }

  return (
    <div className="max-w-lg p-6">
      <h1 className="text-3xl font-bold">Add a Found Item</h1>
      <form onSubmit={handleSubmit(handlePostingForm)} className="space-y-2">
        <div>
          <Label htmlFor="item_name">Item Name*</Label>
          <Input
            className="my-0"
            id="item_name"
            {...register("item_name", { required: "Item name is required" })}
          />
        </div>
        <div>
          <Label htmlFor="details">Item Details*</Label>
          <Input
            className="my-0"
            id="details"
            {...register("details", { required: "Item details are required" })}
          />
        </div>
        <div>
          <Label htmlFor="found_area">Found Area</Label>
          <Input className="my-0" id="found_area" {...register("found_area")} />
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="includes_cash">Item includes Cash</Label>
          <Switch
            id="includes_cash"
            checked={isCash}
            onCheckedChange={() => setIsCash(!isCash)}
          />
        </div>
        {isCash && (
          <div className="border rounded-md space-y-2">
            <h2 className="text-lg font-semibold">Cash Details</h2>
            <div>
              <Label htmlFor="finder_name">Found By</Label>
              <Input
                className="my-0"
                id="finder_name"
                {...register("finder_name")}
              />
            </div>
            <div>
              <Label htmlFor="aims_number">Finder's AIMS</Label>
              <Input
                className="my-0"
                id="aims_number"
                {...register("aims_number")}
              />
            </div>
            <div>
              <Label htmlFor="received_by">Receiver Name</Label>
              <Input
                className="my-0"
                id="received_by"
                {...register("received_by")}
              />
            </div>
          </div>
        )}
        <div>
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
}
