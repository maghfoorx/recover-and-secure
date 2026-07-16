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
import { useEffect, useState } from "react";
import { Doc, Id } from "convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LOCATION_COLOUR_BY_SIZE } from "../../convex/types";
import AdminPasswordDialog from "@/components/AdminPasswordDialog";
import { isAdminUnlocked, lockAdmin } from "@/lib/adminAuth";
import { Lock, LockOpen, ShieldCheck } from "lucide-react";

type StorageAreaWithCount = Doc<"storage_areas"> & { locationCount: number };

export default function LocationManagementPage() {
  const allLocationsGroupedBySize = useQuery(
    api.location.queries.getAllLocations,
  );
  const storageAreas = useQuery(api.location.queries.getStorageAreas);

  const [adminUnlocked, setAdminUnlocked] = useState(isAdminUnlocked);
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);

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

  const totalLocationsNumber = allLocations.length;
  const occupiedLocationsNumber = allLocations.filter(
    (location) => location.is_occupied,
  ).length;
  const availableLocationsNumber =
    totalLocationsNumber - occupiedLocationsNumber;
  const unassignedLocations = allLocations.filter(
    (location) => !location.area_id,
  ).length;

  const numberGroupsBySize = groupNumbersBySize(allLocations);

  if (allLocationsGroupedBySize === undefined || storageAreas === undefined) {
    return (
      <div className="h-full px-0 py-6">
        <h1 className="text-4xl font-bold tracking-tight text-slate-950">
          Location management
        </h1>
        <div className="h-full flex items-center justify-center">
          <FullScreenSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full px-0 py-6 space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Location management
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Storage areas and numbered spaces used to store Amaanat items.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[480px]">
          <Card className="border-sky-200 bg-white shadow-none">
            <CardContent className="p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Locations
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {totalLocationsNumber}
              </p>
            </CardContent>
          </Card>
          <Card className="border-emerald-200 bg-white shadow-none">
            <CardContent className="p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Available
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {availableLocationsNumber}
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-white shadow-none">
            <CardContent className="p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                Areas
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {storageAreas.length}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <StorageAreasCard
        storageAreas={storageAreas}
        unassignedLocations={unassignedLocations}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <LocationStatsCard
          label="Extra small"
          color="pink"
          stats={summarize(extraSmallLocations)}
          numbers={numberGroupsBySize.x_small ?? []}
        />
        <LocationStatsCard
          label="Small"
          color="rose"
          stats={summarize(smallLocations)}
          numbers={numberGroupsBySize.small ?? []}
        />
        <LocationStatsCard
          label="Medium"
          color="orange"
          stats={summarize(mediumLocations)}
          numbers={numberGroupsBySize.medium ?? []}
        />
        <LocationStatsCard
          label="Large"
          color="green"
          stats={summarize(largeLocations)}
          numbers={numberGroupsBySize.large ?? []}
        />
        <LocationStatsCard
          label="Extra large"
          color="teal"
          stats={summarize(extraLargeLocations)}
          numbers={numberGroupsBySize.x_large ?? []}
        />
        <LocationStatsCard
          label="Bulky storage"
          color="sky"
          stats={summarize(bulkyStorageLocations)}
          numbers={numberGroupsBySize.bulky_storage ?? []}
        />
      </div>

      <Card className="border-slate-200 shadow-none">
        <CardHeader className="flex flex-row items-start justify-between gap-4 px-6 pb-3 pt-5">
          <div>
            <CardTitle className="text-lg">
              Manage areas &amp; locations
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">
              Create storage areas and batches of numbered locations.
            </p>
          </div>
          {adminUnlocked && (
            <div className="flex shrink-0 items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                Admin unlocked
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  lockAdmin();
                  setAdminUnlocked(false);
                }}
              >
                <Lock className="mr-1 h-3.5 w-3.5" />
                Lock
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {adminUnlocked ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-lg border border-slate-200 bg-slate-50/50 p-5">
                <h3 className="mb-4 font-semibold text-slate-900">
                  Add new area
                </h3>
                <AddAreaForm storageAreas={storageAreas} />
              </section>
              <section className="rounded-lg border border-slate-200 bg-slate-50/50 p-5">
                <h3 className="mb-4 font-semibold text-slate-900">
                  Create new locations
                </h3>
                <CreateLocationBatchForm storageAreas={storageAreas} />
              </section>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200">
                <Lock className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  Admin access required
                </p>
                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                  Anyone can view locations, but creating storage areas and
                  numbered locations requires the admin password.
                </p>
              </div>
              <Button onClick={() => setUnlockDialogOpen(true)}>
                <LockOpen className="mr-1.5 h-4 w-4" />
                Unlock admin tools
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AdminPasswordDialog
        open={unlockDialogOpen}
        onOpenChange={setUnlockDialogOpen}
        onUnlocked={() => setAdminUnlocked(true)}
        description="Enter the admin password to create storage areas and locations."
      />
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
  storageAreas: StorageAreaWithCount[];
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
          <SelectTrigger id="areaId" className="w-full bg-white">
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

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Starting number</Label>
          <Input disabled value={startingNumber} className="bg-white" />
        </div>
        <div>
          <Label htmlFor="endingNumber">Ending number*</Label>
          <Input
            id="endingNumber"
            type="number"
            min={startingNumber}
            step={1}
            className="bg-white"
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
        </div>
      </div>
      {errors.endingNumber && (
        <p className="text-sm text-red-500 mt-1">
          {errors.endingNumber.message}
        </p>
      )}

      <div>
        <Label htmlFor="size">Size</Label>
        <Select
          onValueChange={(val) => {
            setValue("size", val as CreateLocationFormData["size"], {
              shouldDirty: true,
            });
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
              className="bg-pink-300 focus:bg-pink-400 hover:opacity-80"
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
              className="bg-teal-300 focus:bg-teal-400 hover:opacity-80"
            >
              Extra large
            </SelectItem>
            <SelectItem
              value="bulky_storage"
              className="bg-sky-300 focus:bg-sky-400 hover:opacity-80"
            >
              Bulky storage
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-slate-600">
        Number of new locations being created:{" "}
        <span className="font-semibold text-slate-900">
          {totalNewLocationsBeingCreated}
        </span>
      </p>
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
  );
}

function AddAreaForm({
  storageAreas,
}: {
  storageAreas: StorageAreaWithCount[];
}) {
  const createStorageArea = useMutation(
    api.location.mutations.createStorageArea,
  );
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
    <form onSubmit={handleSubmit(handleCreateArea)} className="space-y-4">
      <div>
        <Label htmlFor="areaName">Area name*</Label>
        <Input
          id="areaName"
          placeholder="Rack A"
          className="bg-white"
          {...register("name", {
            required: "Area name is required",
            onChange: (event) => handleAreaNameChange(event.target.value),
          })}
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="areaCode">Short code*</Label>
        <Input
          id="areaCode"
          placeholder="RA"
          className="bg-white"
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
          <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>
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
  );
}

function StorageAreasCard({
  storageAreas,
  unassignedLocations,
}: {
  storageAreas: StorageAreaWithCount[];
  unassignedLocations: number;
}) {
  return (
    <Card className="border-slate-200 shadow-none">
      <CardHeader className="px-6 pb-3 pt-5">
        <CardTitle className="text-lg">Storage areas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            <div className="rounded-md border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 sm:col-span-2 lg:col-span-4">
              No areas yet. Unlock the admin tools below to create the first
              one.
            </div>
          )}
        </div>
        {unassignedLocations > 0 && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {unassignedLocations} existing location
            {unassignedLocations === 1 ? "" : "s"} do not have an area yet. New
            locations will use the area system from now on.
          </div>
        )}
      </CardContent>
    </Card>
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
