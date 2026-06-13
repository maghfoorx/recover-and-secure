import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Textarea } from "@/components/ui/textarea";
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

// Define form data type
interface LostItemFormData {
  category_slug: string;
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
    setValue,
    watch,
    clearErrors,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LostItemFormData>({
    defaultValues: {
      category_slug: "",
      reporter_name: "",
      name: "",
      details: "",
      location_lost: "",
      aims_number: "",
      phone_number: "",
    },
  });

  const selectedCategory = watch("category_slug");
  const isCustomCategory = selectedCategory === OTHER_LOST_ITEM_CATEGORY;
  const selectedCategoryDisplayLabel =
    getLostItemCategoryDisplayLabel(selectedCategory);

  const handleCategoryChange = (value: string) => {
    setValue("category_slug", value, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (value === OTHER_LOST_ITEM_CATEGORY) {
      setValue("name", "", {
        shouldDirty: true,
        shouldValidate: false,
      });
      clearErrors("name");
      return;
    }

    setValue("name", getLostItemCategoryLabel(value), {
      shouldDirty: true,
      shouldValidate: false,
    });
    clearErrors("name");
  };

  async function handlePostingForm(data: LostItemFormData) {
    try {
      const resolvedName = isCustomCategory
        ? data.name.trim()
        : getLostItemCategoryLabel(data.category_slug);

      // Call Convex mutation with form data
      await postLostItem({
        category_slug: data.category_slug,
        reporter_name: data.reporter_name,
        name: resolvedName,
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
        <input
          type="hidden"
          {...register("category_slug", {
            required: "Item category is required",
          })}
        />
        <div>
          <Label htmlFor="category_slug">Item category*</Label>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select item category" />
            </SelectTrigger>
            <SelectContent>
              {LOST_ITEM_CATEGORIES.map((category, index) => (
                <SelectItem key={category.value} value={category.value}>
                  {index + 1}. {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category_slug && (
            <p className="text-red-500 text-xs mt-1">
              {errors.category_slug.message}
            </p>
          )}
        </div>
        {isCustomCategory ? (
          <div>
            <Label htmlFor="name">Item name*</Label>
            <Input
              className="mt-1"
              id="name"
              placeholder="Enter the item name"
              {...register("name", {
                validate: (value) =>
                  value.trim().length > 0 || "Item name is required",
              })}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
        ) : selectedCategoryDisplayLabel ? (
          <div className="rounded-md border bg-slate-50 px-3 py-3">
            <div className="text-sm font-medium text-slate-900">
              Selected item
            </div>
            <div className="mt-1 text-sm text-slate-600">
              This report will be saved as{" "}
              <span className="font-medium">
                {selectedCategoryDisplayLabel}
              </span>
              .
            </div>
          </div>
        ) : null}
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
          <Label htmlFor="details">Item details</Label>
          <Textarea className="mt-1" id="details" {...register("details")} />
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
