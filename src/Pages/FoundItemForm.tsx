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
      <h1 className="text-3xl font-bold">Add a found item</h1>
      <form onSubmit={handleSubmit(handlePostingForm)} className="space-y-2">
        <div>
          <Label htmlFor="name">Item name*</Label>
          <Input
            className="my-0"
            id="name"
            {...register("name", { required: "Item name is required" })}
          />
        </div>
        <div>
          <Label htmlFor="details">Item details*</Label>
          <Input
            className="my-0"
            id="details"
            {...register("details", { required: "Item details are required" })}
          />
        </div>
        <div>
          <Label htmlFor="location_found">Found area</Label>
          <Input
            className="my-0"
            id="location_found"
            {...register("location_found")}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="includes_cash">Item includes cash</Label>
          <Switch
            id="includes_cash"
            checked={isCash}
            onCheckedChange={() => setIsCash(!isCash)}
          />
        </div>
        {isCash && (
          <div className="border rounded-md space-y-2">
            <h2 className="text-lg font-semibold">Cash details</h2>
            <div>
              <Label htmlFor="finder_name">Found by</Label>
              <Input
                className="my-0"
                id="finder_name"
                {...register("finder_name")}
              />
            </div>
            <div>
              <Label htmlFor="finder_aims_number">Finder's aims number</Label>
              <Input
                className="my-0"
                id="finder_aims_number"
                {...register("finder_aims_number")}
              />
            </div>
            <div>
              <Label htmlFor="received_by">Receiver name</Label>
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
