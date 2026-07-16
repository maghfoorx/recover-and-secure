import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Textarea } from "@/components/ui/textarea";
import SearchableSelect from "@/components/SearchableSelect";
import {
  getLostItemCategoryLabel,
  LOST_ITEM_CATEGORIES,
  OTHER_LOST_ITEM_CATEGORY,
} from "@/lib/lostItemCategories";

// Numbered options for the searchable dropdown, so staff can type the
// name ("phone") or a memorised number ("1"). "Other" is included as a
// regular numbered entry so users who scroll can find it, and is also
// offered via the fallback row when a search yields no matches.
const NUMBERED_LOST_CATEGORY_OPTIONS = LOST_ITEM_CATEGORIES.map(
  (category, index) => ({
    value: category.value,
    label: `${index + 1}. ${category.label}`,
  }),
);

const FALLBACK_OTHER_OPTION = {
  value: OTHER_LOST_ITEM_CATEGORY,
  label: "Other: specify in details",
};

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
          <div className="mt-1">
            <SearchableSelect
              options={NUMBERED_LOST_CATEGORY_OPTIONS}
              value={selectedCategory}
              onChange={handleCategoryChange}
              placeholder="Select item category"
              searchPlaceholder="Search categories..."
              emptyMessage="No categories match your search."
              fallbackOption={FALLBACK_OTHER_OPTION}
            />
          </div>
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
