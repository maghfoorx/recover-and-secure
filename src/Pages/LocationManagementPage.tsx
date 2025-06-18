import FullScreenSpinner from "@/components/FullScreenSpinner";
import { api } from "../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { Doc } from "convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LOCATION_COLOUR_BY_SIZE } from "../../convex/types";

export default function LocationManagementPage() {
  const allLocationsGroupedBySize = useQuery(
    api.location.queries.getAllLocations,
  );

  const extraSmallLocations = allLocationsGroupedBySize?.x_small ?? [];
  const smallLocations = allLocationsGroupedBySize?.small ?? [];
  const mediumLocations = allLocationsGroupedBySize?.medium ?? [];
  const largeLocations = allLocationsGroupedBySize?.large ?? [];
  const extraLargeLocations = allLocationsGroupedBySize?.x_large ?? [];

  const totalLocationsNumber =
    extraSmallLocations.length +
    smallLocations.length +
    mediumLocations.length +
    largeLocations.length +
    extraLargeLocations.length;

  const numberGroupsBySize = groupNumbersBySize([
    ...extraSmallLocations,
    ...smallLocations,
    ...mediumLocations,
    ...largeLocations,
    ...extraLargeLocations,
  ]);

  const extraSmallStats = summarize(extraSmallLocations);
  const smallStats = summarize(smallLocations);
  const mediumStats = summarize(mediumLocations);
  const largeStats = summarize(largeLocations);
  const extraLargeStats = summarize(extraLargeLocations);

  if (allLocationsGroupedBySize === undefined) {
    return (
      <div className="h-full max-w-4xl mx-auto px-2 py-6">
        <h1 className="text-3xl font-bold">Location management</h1>
        <div className="h-full flex items-center justify-center">
          <FullScreenSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 py-6">
      <h1 className="text-3xl font-bold mb-4">Location management</h1>
      <div className="text-muted-foreground mb-6">
        Total locations: {totalLocationsNumber}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <LocationStatsCard
          label="Extra small"
          color="pink"
          stats={extraSmallStats}
          numbers={numberGroupsBySize.x_small ?? []}
        />
        <LocationStatsCard
          label="Small"
          color="rose"
          stats={smallStats}
          numbers={numberGroupsBySize.small ?? []}
        />
        <LocationStatsCard
          label="Medium"
          color="orange"
          stats={mediumStats}
          numbers={numberGroupsBySize.medium ?? []}
        />
        <LocationStatsCard
          label="Large"
          color="green"
          stats={largeStats}
          numbers={numberGroupsBySize.large ?? []}
        />

        <LocationStatsCard
          label="Extra large"
          color="teal"
          stats={extraLargeStats}
          numbers={numberGroupsBySize.x_large ?? []}
        />
      </div>

      <CreateLocationBatchForm />
    </div>
  );
}

interface CreateLocationFormData {
  endingNumber: number;
  size: "x_small" | "small" | "medium" | "large" | "x_large";
}

function CreateLocationBatchForm() {
  const createLocations = useMutation(
    api.location.mutations.createLocationsBatch,
  );
  const latestLocationNumber = useQuery(
    api.location.queries.getLatestLocationNumber,
  );

  const startingNumber = (latestLocationNumber ?? 0) + 1;
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateLocationFormData>({
    defaultValues: {
      endingNumber: startingNumber,
      size: "x_small",
    },
  });

  useEffect(() => {
    if (latestLocationNumber !== undefined) {
      const starting = latestLocationNumber + 1;
      reset({
        endingNumber: starting,
        size: "x_small",
      });
    }
  }, [latestLocationNumber, reset]);

  const handleCreate = async (data: CreateLocationFormData) => {
    console.log(data, "HANDLE_CREATE_DATA");
    if (data.endingNumber < startingNumber) {
      toast.error(
        "Ending number must be greater than or equal to starting number.",
      );
      return;
    }

    try {
      await createLocations({
        from: startingNumber,
        to: Number(data.endingNumber),
        size: data.size,
      });
      toast.success(
        `Created ${data.endingNumber - startingNumber + 1} ${data.size} locations.`,
      );
      reset({ endingNumber: endingNumberValue, size: "small" });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create locations.");
    }
  };

  const selectedSize = watch("size");

  const endingNumberValue = watch("endingNumber");

  const totalNewLocationsBeingCreated =
    endingNumberValue - (startingNumber - 1);

  return (
    <div className="max-w-md mt-8">
      <h3 className="text-2xl font-semibold mb-4">Create new locations</h3>
      <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
        <div>
          <Label>Starting Number</Label>
          <Input disabled value={startingNumber} />
        </div>

        <div>
          <Label htmlFor="endingNumber">Ending Number*</Label>
          <Input
            id="endingNumber"
            type="number"
            min={startingNumber}
            step={1}
            {...register("endingNumber", {
              required: "Ending number is required",
              min: {
                value: startingNumber,
                message: `Must be bigger than or equal to ${startingNumber}`,
              },
              validate: (value) =>
                Number.isInteger(Number(value)) || "Must be a whole number",
            })}
          />
          {errors.endingNumber && (
            <p className="text-sm text-red-500 mt-1">
              {errors.endingNumber.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="size">Size</Label>
          <Select
            onValueChange={(val) => {
              console.log(val, "IS_VALUE");
              setValue(
                "size",
                val as "x_small" | "small" | "medium" | "large" | "x_large",
              );
            }}
            defaultValue="x_small"
          >
            <SelectTrigger
              className={cn("w-full", {
                [LOCATION_COLOUR_BY_SIZE[selectedSize]]: true,
              })}
            >
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent className="text-gray-700">
              <SelectItem
                value="x_small"
                className="bg-pink-300 focus:bg-rose-400 hover:opacity-80"
              >
                Extra small
              </SelectItem>
              <SelectItem
                value="small"
                className="bg-rose-300 focus:bg-rose-400 hover:opacity-80"
              >
                Small
              </SelectItem>
              <SelectItem
                value="medium"
                className="bg-orange-300 focus:bg-orange-400 hover:opacity-80"
              >
                Medium
              </SelectItem>
              <SelectItem
                value="large"
                className="bg-green-300 focus:bg-green-400 hover:opacity-80"
              >
                Large
              </SelectItem>
              <SelectItem
                value="x_large"
                className="bg-teal-300 focus:bg-rose-400 hover:opacity-80"
              >
                Extra large
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          Number of new locations being created: {totalNewLocationsBeingCreated}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting
            ? "Creating..."
            : `Create ${totalNewLocationsBeingCreated} new ${totalNewLocationsBeingCreated === 1 ? "location" : "locations"}`}
        </Button>
      </form>
    </div>
  );
}

// Helper to calculate stats
function summarize(locations: Doc<"amaanat_locations">[]) {
  const total = locations.length;
  const occupied = locations.filter((l) => l.is_occupied).length;
  const available = total - occupied;

  return { total, occupied, available };
}

// Card component per size
function LocationStatsCard({
  label,
  color,
  stats,
  numbers,
}: {
  label: string;
  color: "rose" | "orange" | "green" | "teal" | "pink";
  stats: { total: number; occupied: number; available: number };
  numbers: number[];
}) {
  const percentageOccupied = Math.round(
    (stats.occupied / stats.total) * 100 || 0,
  );

  return (
    <Card className="bg-slate-100">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{label}</span>
          <span className={`h-4 w-4 rounded-full bg-${color}-400`} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div>Total: {stats.total}</div>
        <div>Occupied: {stats.occupied}</div>
        <div>Available: {stats.available}</div>
        <Progress
          value={percentageOccupied}
          className={`bg-${color}-100 h-2`}
        />
        <div className="text-xs text-muted-foreground">
          {percentageOccupied}% occupied
        </div>
        <div className="mt-2">
          <div className="font-medium text-xs text-muted-foreground">
            Numbers:{" "}
            <span className="font-normal">
              {compactNumberRanges(numbers) || "None"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function groupNumbersBySize(locations: Doc<"amaanat_locations">[]) {
  const grouped: Record<string, number[]> = {};

  for (const loc of locations) {
    if (!grouped[loc.size]) {
      grouped[loc.size] = [];
    }
    grouped[loc.size].push(loc.number); // assuming each location has a `number` field
  }

  // Sort each size's numbers
  for (const size in grouped) {
    grouped[size] = grouped[size].sort((a, b) => a - b);
  }

  return grouped;
}

function compactNumberRanges(numbers: number[]): string {
  if (numbers.length === 0) return "";

  const ranges: string[] = [];
  let start = numbers[0];
  let end = numbers[0];

  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] === end + 1) {
      end = numbers[i];
    } else {
      ranges.push(start === end ? `${start}` : `${start}–${end}`);
      start = numbers[i];
      end = numbers[i];
    }
  }

  ranges.push(start === end ? `${start}` : `${start}–${end}`);

  return ranges.join(", ");
}
