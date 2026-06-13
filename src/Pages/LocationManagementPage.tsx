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
import { Doc, Id } from "convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LOCATION_COLOUR_BY_SIZE } from "../../convex/types";

export default function LocationManagementPage() {
  const allLocationsGroupedBySize = useQuery(
    api.location.queries.getAllLocations,
  );
  const storageAreas = useQuery(api.location.queries.getStorageAreas);

  const extraSmallLocations = allLocationsGroupedBySize?.x_small ?? [];
  const smallLocations = allLocationsGroupedBySize?.small ?? [];
  const mediumLocations = allLocationsGroupedBySize?.medium ?? [];
  const largeLocations = allLocationsGroupedBySize?.large ?? [];
  const extraLargeLocations = allLocationsGroupedBySize?.x_large ?? [];
  const bulkyStorageLocations = allLocationsGroupedBySize?.bulky_storage ?? [];
  const allLocations = [
    ...extraSmallLocations,
    ...smallLocations,
    ...mediumLocations,
    ...largeLocations,
    ...extraLargeLocations,
    ...bulkyStorageLocations,
  ];

  const totalLocationsNumber =
    extraSmallLocations.length +
    smallLocations.length +
    mediumLocations.length +
    largeLocations.length +
    extraLargeLocations.length +
    bulkyStorageLocations.length;
  const unassignedLocations = allLocations.filter((location) => !location.area_id)
    .length;

  const numberGroupsBySize = groupNumbersBySize(allLocations);

  const extraSmallStats = summarize(extraSmallLocations);
  const smallStats = summarize(smallLocations);
  const mediumStats = summarize(mediumLocations);
  const largeStats = summarize(largeLocations);
  const extraLargeStats = summarize(extraLargeLocations);
  const bulkyStorageStats = summarize(bulkyStorageLocations);

  if (allLocationsGroupedBySize === undefined || storageAreas === undefined) {
    return (
      <div className="h-full px-2 py-6">
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

      <StorageAreasCard
        storageAreas={storageAreas}
        unassignedLocations={unassignedLocations}
      />

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
        <LocationStatsCard
          label="Bulky storage"
          color="sky"
          stats={bulkyStorageStats}
          numbers={numberGroupsBySize.bulky_storage ?? []}
        />
      </div>

      <CreateLocationBatchForm storageAreas={storageAreas} />
    </div>
  );
}

interface CreateLocationFormData {
  areaId: string;
  endingNumber: number;
  size: "x_small" | "small" | "medium" | "large" | "x_large" | "bulky_storage";
}

interface StorageAreaFormData {
  name: string;
  code: string;
}

function CreateLocationBatchForm({
  storageAreas,
}: {
  storageAreas: Array<
    Doc<"storage_areas"> & {
      locationCount: number;
    }
  >;
}) {
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
      areaId: "",
      endingNumber: startingNumber,
      size: "x_small",
    },
  });

  useEffect(() => {
    if (latestLocationNumber !== undefined) {
      const starting = latestLocationNumber + 1;
      reset({
        areaId: "",
        endingNumber: starting,
        size: "x_small",
      });
    }
  }, [latestLocationNumber, reset]);

  const handleCreate = async (data: CreateLocationFormData) => {
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
        areaId: data.areaId as Id<"storage_areas">,
        size: data.size,
      });
      const selectedArea = storageAreas.find((area) => area._id === data.areaId);
      toast.success(
        `Created ${data.endingNumber - startingNumber + 1} ${data.size} locations in ${selectedArea?.name ?? "the selected area"}.`,
      );
      reset({
        areaId: "",
        endingNumber: data.endingNumber + 1,
        size: data.size,
      });
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create locations.",
      );
    }
  };

  const selectedSize = watch("size");
  const endingNumberValue = watch("endingNumber");
  const totalNewLocationsBeingCreated =
    endingNumberValue - (startingNumber - 1);
  const hasAreas = storageAreas.length > 0;

  return (
    <div className="max-w-md mt-8">
      <h3 className="text-2xl font-semibold mb-4">Create new locations</h3>
      <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
        <input
          type="hidden"
          {...register("areaId", {
            required: "Area is required",
          })}
        />
        <div>
          <Label htmlFor="areaId">Area*</Label>
          <Select
            value={watch("areaId") || undefined}
            onValueChange={(val) =>
              setValue("areaId", val, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            disabled={!hasAreas}
          >
            <SelectTrigger id="areaId" className="w-full">
              <SelectValue placeholder="Select area" />
            </SelectTrigger>
            <SelectContent>
              {storageAreas.map((area) => (
                <SelectItem key={area._id} value={area._id}>
                  {area.name} ({area.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!hasAreas && (
            <p className="text-sm text-amber-700 mt-1">
              Create an area first before adding new locations.
            </p>
          )}
          {errors.areaId && (
            <p className="text-sm text-red-500 mt-1">{errors.areaId.message}</p>
          )}
        </div>

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
              setValue(
                "size",
                val as CreateLocationFormData["size"],
                { shouldDirty: true },
              );
            }}
            value={selectedSize}
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
              <SelectItem
                value="bulky_storage"
                className="bg-teal-300 focus:bg-rose-400 hover:opacity-80"
              >
                Bulky storage
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          Number of new locations being created: {totalNewLocationsBeingCreated}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting || !hasAreas}
          className="w-full"
        >
          {isSubmitting
            ? "Creating..."
            : `Create ${totalNewLocationsBeingCreated} new ${totalNewLocationsBeingCreated === 1 ? "location" : "locations"}`}
        </Button>
      </form>
    </div>
  );
}

function StorageAreasCard({
  storageAreas,
  unassignedLocations,
}: {
  storageAreas: Array<
    Doc<"storage_areas"> & {
      locationCount: number;
    }
  >;
  unassignedLocations: number;
}) {
  const createStorageArea = useMutation(api.location.mutations.createStorageArea);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { dirtyFields, errors, isSubmitting },
  } = useForm<StorageAreaFormData>({
    defaultValues: {
      name: "",
      code: "",
    },
  });

  const areaCode = normalizeAreaCode(watch("code"));
  const existingCodeMatch = storageAreas.find((area) => area.code === areaCode);

  const handleAreaNameChange = (name: string) => {
    setValue("name", name, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (!dirtyFields.code) {
      setValue("code", getSuggestedAreaCode(name), {
        shouldDirty: false,
        shouldValidate: true,
      });
    }
  };

  const handleCreateArea = async (data: StorageAreaFormData) => {
    try {
      await createStorageArea({
        name: data.name,
        code: data.code,
      });
      toast.success("Area created.");
      reset({
        name: "",
        code: "",
      });
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create area.",
      );
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr] mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Storage areas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {storageAreas.map((area) => (
              <div
                key={area._id}
                className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="text-sm font-semibold text-slate-950">
                  {area.name}
                </div>
                <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                  {area.code}
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  {area.locationCount} location
                  {area.locationCount === 1 ? "" : "s"}
                </div>
              </div>
            ))}
            {storageAreas.length === 0 && (
              <div className="rounded-md border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
                No areas yet.
              </div>
            )}
          </div>
          {unassignedLocations > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {unassignedLocations} existing location
              {unassignedLocations === 1 ? "" : "s"} do not have an area yet.
              New locations will use the area system from now on.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add new area</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleCreateArea)} className="space-y-4">
            <div>
              <Label htmlFor="areaName">Area name*</Label>
              <Input
                id="areaName"
                placeholder="Rack A"
                {...register("name", {
                  required: "Area name is required",
                  onChange: (event) => handleAreaNameChange(event.target.value),
                })}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="areaCode">Short code*</Label>
              <Input
                id="areaCode"
                placeholder="RA"
                {...register("code", {
                  required: "Short code is required",
                })}
                onChange={(event) =>
                  setValue("code", normalizeAreaCode(event.target.value), {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              {errors.code && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.code.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Existing codes:{" "}
                {storageAreas.length > 0
                  ? storageAreas.map((area) => area.code).join(", ")
                  : "None yet"}
              </p>
              {existingCodeMatch && (
                <p className="text-sm text-amber-700 mt-1">
                  Code "{areaCode}" is already used by {existingCodeMatch.name}.
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !!existingCodeMatch}
              className="w-full"
            >
              {isSubmitting ? "Creating..." : "Create area"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function summarize(locations: Doc<"amaanat_locations">[]) {
  const total = locations.length;
  const occupied = locations.filter((l) => l.is_occupied).length;
  const available = total - occupied;

  return { total, occupied, available };
}

function LocationStatsCard({
  label,
  color,
  stats,
  numbers,
}: {
  label: string;
  color: "rose" | "orange" | "green" | "teal" | "pink" | "sky";
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
    grouped[loc.size].push(loc.number);
  }

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

function normalizeAreaCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

function getSuggestedAreaCode(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean);

  if (parts.length === 0) {
    return "";
  }

  if (parts.length === 1) {
    return normalizeAreaCode(parts[0].slice(0, 2));
  }

  return normalizeAreaCode(parts.slice(0, 2).map((part) => part[0]).join(""));
}
