import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { postLostItem } from "@/apiApi/modules/lostProperty";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function LostItemForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      reporter_name: "",
      name: "",
      details: "",
      location_lost: "",
      aims_number: "",
      phone_number: "",
    },
  });

  async function handlePostingForm(data: any) {
    try {
      await postLostItem({ ...data, is_found: false });
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
    <div className="max-w-lg p-6">
      <h1 className="text-3xl font-bold">Add a lost item</h1>
      <form onSubmit={handleSubmit(handlePostingForm)} className="space-y-2">
        <div>
          <Label htmlFor="reporter_name">Person name*</Label>
          <Input
            className="my-0"
            id="reporter_name"
            {...register("reporter_name", {
              required: "Person name is required",
            })}
          />
        </div>
        <div>
          <Label htmlFor="name">Item name*</Label>
          <Input
            className="my-0"
            id="name"
            {...register("name", { required: "Item name is required" })}
          />
        </div>
        <div>
          <Label htmlFor="details">Item details</Label>
          <Input className="my-0" id="details" {...register("details")} />
        </div>
        <div>
          <Label htmlFor="location_lost">Lost area</Label>
          <Input
            className="my-0"
            id="location_lost"
            {...register("location_lost")}
          />
        </div>
        <div>
          <Label htmlFor="aims_number">AIMS number</Label>
          <Input
            className="my-0"
            id="aims_number"
            type="number"
            {...register("aims_number")}
          />
        </div>
        <div>
          <Label htmlFor="phone_number">Phone number</Label>
          <Input
            className="my-0"
            id="phone_number"
            {...register("phone_number")}
          />
        </div>
        <div>
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
}
