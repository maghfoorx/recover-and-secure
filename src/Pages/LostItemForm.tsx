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
      person_name: "",
      item_name: "",
      details: "",
      lost_area: "",
      aims_id: "",
      phone_number: "",
    },
  });

  async function handlePostingForm(data: any) {
    try {
      await postLostItem(data);
      reset();
      toast.success("Successfully added a lost item!");
    } catch (error) {
      toast.error("Failed to add lost item! Please try again.");
      console.error(error);
    }
  }

  return (
    <div className="max-w-lg p-6">
      <h1 className="text-3xl font-bold">Add a Lost Item</h1>
      <form onSubmit={handleSubmit(handlePostingForm)} className="space-y-2">
        <div>
          <Label htmlFor="person_name">Person Name*</Label>
          <Input
            className="my-0"
            id="person_name"
            {...register("person_name", {
              required: "Person name is required",
            })}
          />
        </div>
        <div>
          <Label htmlFor="item_name">Item Name*</Label>
          <Input
            className="my-0"
            id="item_name"
            {...register("item_name", { required: "Item name is required" })}
          />
        </div>
        <div>
          <Label htmlFor="details">Item Details</Label>
          <Input className="my-0" id="details" {...register("details")} />
        </div>
        <div>
          <Label htmlFor="lost_area">Lost Area</Label>
          <Input className="my-0" id="lost_area" {...register("lost_area")} />
        </div>
        <div>
          <Label htmlFor="aims_id">AIMS ID</Label>
          <Input
            className="my-0"
            id="aims_id"
            type="number"
            {...register("aims_id")}
          />
        </div>
        <div>
          <Label htmlFor="phone_number">Phone Number</Label>
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
