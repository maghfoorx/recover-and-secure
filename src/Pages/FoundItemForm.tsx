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
interface FoundItemFormData {
  category_slug: string;
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
    setValue,
    watch,
    clearErrors,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FoundItemFormData>({
    defaultValues: {
      category_slug: "",
      name: "",
      details: "",
      location_found: "",
      location_stored: "",
      finder_name: "",
      finder_aims_number: "",
      received_by: "",
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

  async function handlePostingForm(data: FoundItemFormData) {
    try {
      const resolvedName = isCustomCategory
        ? data.name.trim()
        : getLostItemCategoryLabel(data.category_slug);

      // Prepare form data for Convex
      const formData = {
        category_slug: data.category_slug,
        name: resolvedName,
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
              This found item will be saved as{" "}
              <span className="font-medium">
                {selectedCategoryDisplayLabel}
              </span>
              .
            </div>
          </div>
        ) : null}
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
