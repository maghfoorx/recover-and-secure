import { useEffect, useState } from "react";
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
import { disableSelfServeMode } from "@/lib/selfServeMode";
import { api } from "../../convex/_generated/api";

const SELF_SERVE_PASSCODE = "lost2026";

interface SelfServeLostItemFormData {
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SelfServeLostItemFormData>({
    defaultValues: {
      reporter_name: "",
      name: "",
      details: "",
      location_lost: "",
      aims_number: "",
      phone_number: "",
    },
  });

  const handleExit = () => {
    if (passcode !== SELF_SERVE_PASSCODE) {
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
      await postLostItem({
        reporter_name: data.reporter_name,
        name: data.name,
        details: data.details,
        location_lost: data.location_lost,
        aims_number: data.aims_number,
        phone_number: data.phone_number,
      });

      setLastSubmittedName(data.name);
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

  const startNewReport = () => {
    setLastSubmittedName("");
    reset();
    window.scrollTo({ top: 0, behavior: "auto" });
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
              label="Item name"
              htmlFor="name"
              error={errors.name?.message}
            >
              <Input
                id="name"
                className="mt-2 h-14 rounded-xl text-lg"
                {...register("name", {
                  required: "Item name is required",
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
