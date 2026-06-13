import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
import { disableSelfServeMode } from "@/lib/selfServeMode";

const SELF_SERVE_PASSCODE = "lost2026";

export default function SelfServeLostItemPage() {
  const navigate = useNavigate();
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [passcode, setPasscode] = useState("");

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
              Self-serve mode is active. In the next step, this page will host
              the simplified lost item submission form.
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

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <InfoCard
            title="Navigation locked"
            description="Sidebar and staff navigation are hidden while self serve is active."
          />
          <InfoCard
            title="Passcode protected"
            description="Leaving self serve requires the configured passcode."
          />
          <InfoCard
            title="Next step"
            description="Wire this screen to the public lost-item form."
          />
        </div>
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

function InfoCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="text-lg font-semibold text-slate-900">{title}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
