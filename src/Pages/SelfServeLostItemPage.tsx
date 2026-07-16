import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { disableSelfServeMode } from "@/lib/selfServeMode";
import { verifyAdminPassword } from "@/lib/adminAuth";
import { api } from "../../convex/_generated/api";
import {
  getLostItemCategoryLabel,
  LOST_ITEM_CATEGORIES,
  OTHER_LOST_ITEM_CATEGORY,
} from "@/lib/lostItemCategories";
import SearchableSelect from "@/components/SearchableSelect";

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

const SELF_SERVE_INACTIVITY_TIMEOUT_MS = 60000;
const SELF_SERVE_WARNING_COUNTDOWN_MS = 10000;

interface SelfServeLostItemFormData {
  category_slug: string;
  reporter_name: string;
  name: string;
  details?: string;
  location_lost?: string;
  aims_number?: string;
  phone_number?: string;
}

export default function SelfServeLostItemPage() {
  const navigate = useNavigate();
  const postLostItem = useMutation(api.lostProperty.mutations.postLostItem);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [lastSubmittedName, setLastSubmittedName] = useState("");
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [warningTimeRemainingMs, setWarningTimeRemainingMs] = useState(
    SELF_SERVE_WARNING_COUNTDOWN_MS,
  );
  const warningTimeoutRef = useRef<number>();
  const resetTimeoutRef = useRef<number>();
  const warningIntervalRef = useRef<number>();
  const warningDeadlineRef = useRef<number>();
  const warningDialogOpenRef = useRef(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    clearErrors,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SelfServeLostItemFormData>({
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

  const handleExit = () => {
    if (!verifyAdminPassword(passcode)) {
      toast.error("Incorrect passcode", {
        style: { backgroundColor: "red", color: "white" },
      });
      return;
    }

    disableSelfServeMode();
    setPasscode("");
    setExitDialogOpen(false);
    navigate("/dashboard", { replace: true });
    toast.success("Self serve disabled", {
      style: { backgroundColor: "green", color: "white" },
    });
  };

  const handleSubmitLostItem = async (data: SelfServeLostItemFormData) => {
    try {
      const resolvedName = isCustomCategory
        ? data.name.trim()
        : getLostItemCategoryLabel(data.category_slug);

      await postLostItem({
        category_slug: data.category_slug,
        reporter_name: data.reporter_name,
        name: resolvedName,
        details: data.details,
        location_lost: data.location_lost,
        aims_number: data.aims_number,
        phone_number: data.phone_number,
      });

      setLastSubmittedName(resolvedName);
      reset();
      toast.success("Lost item reported", {
        style: { backgroundColor: "green", color: "white" },
      });
    } catch (error) {
      toast.error("Failed to submit lost item", {
        style: { backgroundColor: "red", color: "white" },
      });
      console.error(error);
    }
  };

  const blurActiveElement = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const setWarningDialogState = (open: boolean) => {
    warningDialogOpenRef.current = open;
    setWarningDialogOpen(open);
  };

  const clearInactivityTimers = () => {
    if (warningTimeoutRef.current) {
      window.clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = undefined;
    }

    if (resetTimeoutRef.current) {
      window.clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = undefined;
    }

    if (warningIntervalRef.current) {
      window.clearInterval(warningIntervalRef.current);
      warningIntervalRef.current = undefined;
    }
  };

  const startNewReport = () => {
    blurActiveElement();
    setLastSubmittedName("");
    setWarningDialogState(false);
    setWarningTimeRemainingMs(SELF_SERVE_WARNING_COUNTDOWN_MS);
    reset();
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const resetAfterInactivity = () => {
    clearInactivityTimers();
    startNewReport();
  };

  const armInactivityTimers = () => {
    clearInactivityTimers();

    if (!isDirty || lastSubmittedName || exitDialogOpen) {
      setWarningDialogState(false);
      setWarningTimeRemainingMs(SELF_SERVE_WARNING_COUNTDOWN_MS);
      return;
    }

    warningTimeoutRef.current = window.setTimeout(() => {
      setWarningDialogState(true);
      setWarningTimeRemainingMs(SELF_SERVE_WARNING_COUNTDOWN_MS);
      warningDeadlineRef.current = Date.now() + SELF_SERVE_WARNING_COUNTDOWN_MS;

      warningIntervalRef.current = window.setInterval(() => {
        const deadline = warningDeadlineRef.current;
        if (!deadline) {
          return;
        }

        const remaining = Math.max(deadline - Date.now(), 0);
        setWarningTimeRemainingMs(remaining);
      }, 100);
    }, SELF_SERVE_INACTIVITY_TIMEOUT_MS - SELF_SERVE_WARNING_COUNTDOWN_MS);

    resetTimeoutRef.current = window.setTimeout(() => {
      resetAfterInactivity();
    }, SELF_SERVE_INACTIVITY_TIMEOUT_MS);
  };

  const handleStillActive = () => {
    setWarningDialogState(false);
    setWarningTimeRemainingMs(SELF_SERVE_WARNING_COUNTDOWN_MS);
    armInactivityTimers();
  };

  useEffect(() => {
    if (!lastSubmittedName) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      startNewReport();
    }, 10000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [lastSubmittedName]);

  useEffect(() => {
    if (lastSubmittedName || exitDialogOpen) {
      clearInactivityTimers();
      setWarningDialogState(false);
      return;
    }

    const scheduleReset = () => {
      if (!warningDialogOpenRef.current) {
        armInactivityTimers();
      }
    };

    const activityEvents: Array<keyof WindowEventMap> = [
      "click",
      "input",
      "keydown",
      "scroll",
      "touchstart",
    ];

    armInactivityTimers();

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, scheduleReset, { passive: true });
    });

    return () => {
      clearInactivityTimers();
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, scheduleReset);
      });
    };
  }, [exitDialogOpen, isDirty, lastSubmittedName]);

  const warningProgressValue =
    (warningTimeRemainingMs / SELF_SERVE_WARNING_COUNTDOWN_MS) * 100;
  const warningSecondsRemaining = Math.max(
    0,
    Math.ceil(warningTimeRemainingMs / 1000),
  );

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col rounded-3xl bg-white p-6 shadow-sm sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Self serve
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Lost item reporting
            </h1>
            <p className="max-w-2xl text-lg text-slate-600">
              Use this form to report an item you have lost. A team member will
              review the report and try to match it with found items.
            </p>
          </div>

          <Button
            variant="outline"
            className="shrink-0"
            onClick={() => setExitDialogOpen(true)}
          >
            Exit self serve
          </Button>
        </div>

        {lastSubmittedName ? (
          <SuccessState
            itemName={lastSubmittedName}
            onReportAnother={startNewReport}
          />
        ) : (
          <form
            onSubmit={handleSubmit(handleSubmitLostItem)}
            className="mt-10 grid gap-6"
          >
            <input
              type="hidden"
              {...register("category_slug", {
                required: "Please select an item category",
              })}
            />
            <FormFieldBlock
              label="Item category"
              htmlFor="category_slug"
              error={errors.category_slug?.message}
            >
              <div className="mt-2">
                <SearchableSelect
                  options={NUMBERED_LOST_CATEGORY_OPTIONS}
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  placeholder="Select item category"
                  searchPlaceholder="Search categories..."
                  emptyMessage="No categories match your search."
                  fallbackOption={FALLBACK_OTHER_OPTION}
                  triggerClassName="h-14 rounded-xl text-lg"
                />
              </div>
            </FormFieldBlock>

            {isCustomCategory ? (
              <FormFieldBlock
                label="Item name"
                htmlFor="name"
                error={errors.name?.message}
                helpText="Enter the item name because it is not listed above."
              >
                <Input
                  id="name"
                  className="mt-2 h-14 rounded-xl text-lg"
                  placeholder="Enter the item name"
                  {...register("name", {
                    validate: (value) =>
                      value.trim().length > 0 || "Item name is required",
                  })}
                />
              </FormFieldBlock>
            ) : null}

            <FormFieldBlock
              label="Your name"
              htmlFor="reporter_name"
              error={errors.reporter_name?.message}
            >
              <Input
                id="reporter_name"
                className="mt-2 h-14 rounded-xl text-lg"
                {...register("reporter_name", {
                  required: "Your name is required",
                })}
              />
            </FormFieldBlock>

            <FormFieldBlock
              label="Item details"
              htmlFor="details"
              helpText="Describe colour, brand, size, or anything distinctive."
            >
              <Textarea
                id="details"
                className="mt-2 min-h-28 rounded-xl text-lg"
                {...register("details")}
              />
            </FormFieldBlock>

            <FormFieldBlock
              label="Where did you lose it?"
              htmlFor="location_lost"
            >
              <Input
                id="location_lost"
                className="mt-2 h-14 rounded-xl text-lg"
                {...register("location_lost")}
              />
            </FormFieldBlock>

            <div className="grid gap-6 md:grid-cols-2">
              <FormFieldBlock label="AIMS number" htmlFor="aims_number">
                <Input
                  id="aims_number"
                  className="mt-2 h-14 rounded-xl text-lg"
                  {...register("aims_number")}
                />
              </FormFieldBlock>

              <FormFieldBlock label="Phone number" htmlFor="phone_number">
                <Input
                  id="phone_number"
                  className="mt-2 h-14 rounded-xl text-lg"
                  {...register("phone_number")}
                />
              </FormFieldBlock>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="h-14 w-full rounded-xl text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit lost item"}
              </Button>
            </div>
          </form>
        )}
      </div>

      <Dialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disable self serve</DialogTitle>
            <DialogDescription>
              Enter the passcode to return to the staff dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="self-serve-exit-passcode">Passcode</Label>
            <Input
              id="self-serve-exit-passcode"
              type="password"
              value={passcode}
              onChange={(event) => setPasscode(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleExit();
                }
              }}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setExitDialogOpen(false);
                setPasscode("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleExit}>Disable self serve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={warningDialogOpen}
        onOpenChange={(open) => {
          if (open) {
            setWarningDialogState(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-md" hideCross={true}>
          <DialogHeader>
            <DialogTitle>Are you still active?</DialogTitle>
            <DialogDescription>
              This screen will reset soon to protect the self-serve flow for the
              next person.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-700">
              Resetting in {warningSecondsRemaining}{" "}
              {warningSecondsRemaining === 1 ? "second" : "seconds"}
            </div>
            <Progress value={warningProgressValue} className="h-3" />
          </div>

          <DialogFooter>
            <Button className="w-full sm:w-full" onClick={handleStillActive}>
              I&apos;m still active
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FormFieldBlock({
  label,
  htmlFor,
  error,
  helpText,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="text-lg font-semibold text-slate-900">
        {label}
      </Label>
      {helpText ? <p className="mt-1 text-sm text-slate-500">{helpText}</p> : null}
      {children}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

function SuccessState({
  itemName,
  onReportAnother,
}: {
  itemName: string;
  onReportAnother: () => void;
}) {
  return (
    <div className="mt-10 flex flex-1 items-center justify-center">
      <div className="w-full max-w-2xl rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">
          Submitted
        </p>
        <h2 className="mt-3 text-3xl font-bold text-slate-900">
          Lost item report received
        </h2>
        <p className="mt-4 text-lg text-slate-700">
          Your report for <span className="font-semibold">{itemName}</span> has
          been submitted.
        </p>
        <Button
          className="mt-8 h-14 rounded-xl px-8 text-lg"
          onClick={onReportAnother}
        >
          Report another item
        </Button>
      </div>
    </div>
  );
}
