import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Doc } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

type ReturnFormProps = {
  foundItem: Doc<"found_items">;
  onCancel?: () => void;
  onSuccess?: () => void;
};

export default function ReturnFoundItemForm({
  foundItem,
  onCancel,
  onSuccess,
}: ReturnFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const returnFoundItem = useMutation(
    api.lostProperty.mutations.returnFoundItem,
  );

  async function handleReturnFoundItem(data: any) {
    if (!foundItem) return;

    try {
      await returnFoundItem({
        id: foundItem._id,
        returned_to_name: data.returned_to_name,
        returned_to_aims_number: data.returned_to_aims_number,
        returned_by: data.returned_by,
      });

      reset();
      toast.success("Item returned successfully", {
        style: { backgroundColor: "green", color: "white" },
      });
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to return item", {
        style: { backgroundColor: "red", color: "white" },
      });
      console.error(error);
    }
  }

  return (
    <div>
      <div className="font-semibold text-2xl">Return item</div>
      <form
        onSubmit={handleSubmit(handleReturnFoundItem)}
        className="space-y-2 mt-4"
      >
        <div>
          <label className="block text-sm font-medium">Person name</label>
          <Input
            className="my-0"
            {...register("returned_to_name", { required: true })}
          />
          {errors.returned_to_name && (
            <p className="text-red-500 text-xs mt-1">This field is required</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">AIMS number</label>
          <Input
            className="my-0"
            {...register("returned_to_aims_number", { required: true })}
          />
          {errors.returned_to_aims_number && (
            <p className="text-red-500 text-xs mt-1">This field is required</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Returned by</label>
          <Input
            className="my-0"
            {...register("returned_by", { required: true })}
          />
          {errors.returned_by && (
            <p className="text-red-500 text-xs mt-1">This field is required</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => {
              reset();
              onCancel?.();
            }}
          >
            Cancel
          </Button>
          <Button size="sm" type="submit">
            Submit return
          </Button>
        </div>
      </form>
    </div>
  );
}
