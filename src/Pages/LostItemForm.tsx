import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

// Define form data type
interface LostItemFormData {
  reporter_name: string;
  name: string;
  details?: string;
  location_lost?: string;
  aims_number?: string;
  phone_number?: string;
}

export default function LostItemForm() {
  // Use Convex mutation
  const postLostItem = useMutation(api.lostProperty.mutations.postLostItem);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LostItemFormData>({
    defaultValues: {
      reporter_name: "",
      name: "",
      details: "",
      location_lost: "",
      aims_number: "",
      phone_number: "",
    },
  });

  async function handlePostingForm(data: LostItemFormData) {
    try {
      // Call Convex mutation with form data
      await postLostItem({
        reporter_name: data.reporter_name,
        name: data.name,
        details: data.details,
        location_lost: data.location_lost,
        aims_number: data.aims_number,
        phone_number: data.phone_number,
      });

      reset();
      toast.success("Successfully added a lost item!", {
        style: {
          background: "green",
          color: "white",
        },
      });
    } catch (error) {
      toast.error("Failed to add lost item! Please try again.", {
        style: {
          background: "red",
          color: "white",
        },
      });
      console.error(error);
    }
  }

  return (
    <div className="max-w-lg px-2 py-6">
      <h1 className="text-3xl font-bold">Add a lost item</h1>
      <form
        onSubmit={handleSubmit(handlePostingForm)}
        className="space-y-4 mt-4"
      >
        <div>
          <Label htmlFor="reporter_name">Person name*</Label>
          <Input
            className="mt-1"
            id="reporter_name"
            {...register("reporter_name", {
              required: "Person name is required",
            })}
          />
          {errors.reporter_name && (
            <p className="text-red-500 text-xs mt-1">
              {errors.reporter_name.message}
            </p>
          )}
        </div>
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
          <Label htmlFor="details">Item details</Label>
          <Input className="mt-1" id="details" {...register("details")} />
        </div>
        <div>
          <Label htmlFor="location_lost">Lost area</Label>
          <Input
            className="mt-1"
            id="location_lost"
            {...register("location_lost")}
          />
        </div>
        <div>
          <Label htmlFor="aims_number">AIMS number</Label>
          <Input
            className="mt-1"
            id="aims_number"
            {...register("aims_number")}
          />
        </div>
        <div>
          <Label htmlFor="phone_number">Phone number</Label>
          <Input
            className="mt-1"
            id="phone_number"
            {...register("phone_number")}
          />
        </div>
        <div>
          <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
}
