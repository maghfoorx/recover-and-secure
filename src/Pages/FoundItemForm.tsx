import { useForm } from "react-hook-form";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Textarea } from "@/components/ui/textarea";

// Define form data type
interface FoundItemFormData {
  name: string;
  details: string;
  location_found?: string;
  location_stored?: string;
  finder_name?: string;
  finder_aims_number?: string;
  received_by?: string;
}

export default function FoundItemForm() {
  const [isCash, setIsCash] = useState(false);

  // Use Convex mutation
  const postFoundItem = useMutation(api.lostProperty.mutations.postFoundItem);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FoundItemFormData>();

  async function handlePostingForm(data: FoundItemFormData) {
    try {
      // Prepare form data for Convex
      const formData = {
        name: data.name,
        details: data.details,
        location_found: data.location_found,
        location_stored: data.location_stored,
        ...(isCash
          ? {
              finder_name: data.finder_name,
              finder_aims_number: data.finder_aims_number,
              received_by: data.received_by,
            }
          : {}),
      };

      // Call Convex mutation
      await postFoundItem(formData);

      reset();
      setIsCash(false);
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
    <div className="max-w-lg px-2 py-6">
      <h1 className="text-3xl font-bold">Add a found item</h1>
      <form
        onSubmit={handleSubmit(handlePostingForm)}
        className="space-y-4 mt-4"
      >
        <div>
          <Label htmlFor="name">Item name*</Label>
          <Input
            className="mt-1"
            id="name"
            {...register("name", { required: "Item name is required" })}
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="details">Item details*</Label>
          <Textarea
            className="mt-1"
            id="details"
            {...register("details", { required: "Item details are required" })}
          />
          {errors.details && (
            <p className="text-red-500 text-xs mt-1">
              {errors.details.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="location_found">Found area</Label>
          <Input
            className="mt-1"
            id="location_found"
            {...register("location_found")}
          />
        </div>
        <div>
          <Label htmlFor="location_stored">Stored location</Label>
          <Input
            className="mt-1"
            id="location_stored"
            {...register("location_stored")}
          />
          {errors.details && (
            <p className="text-red-500 text-xs mt-1">
              {errors.details.message}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <Label htmlFor="includes_cash">Item includes cash</Label>
          <Switch
            id="includes_cash"
            checked={isCash}
            onCheckedChange={() => setIsCash(!isCash)}
          />
        </div>
        {isCash && (
          <div className="border rounded-md space-y-4 p-4 mt-2">
            <h2 className="text-lg font-semibold">Cash details</h2>
            <div>
              <Label htmlFor="finder_name">Found by</Label>
              <Input
                className="mt-1"
                id="finder_name"
                {...register("finder_name")}
              />
            </div>
            <div>
              <Label htmlFor="finder_aims_number">Finder's aims number</Label>
              <Input
                className="mt-1"
                id="finder_aims_number"
                {...register("finder_aims_number")}
              />
            </div>
            <div>
              <Label htmlFor="received_by">Receiver name</Label>
              <Input
                className="mt-1"
                id="received_by"
                {...register("received_by")}
              />
            </div>
          </div>
        )}
        <div>
          <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
}
