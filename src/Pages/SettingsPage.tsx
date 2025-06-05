import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  const [printerName, setPrinterName] = useState("UNKNOWN");

  useEffect(() => {
    const stored = localStorage.getItem("storedPrinterName") ?? "UNKNOWN";
    setPrinterName(stored);
  }, []);

  return (
    <div className="px-2 py-6 space-y-6">
      <h2 className="text-3xl font-semibold">Settings</h2>
      <UpdatedComputerNameSelect />
      <PrinterNameDisplay
        printerName={printerName}
        setPrinterName={setPrinterName}
      />
    </div>
  );
}

const UpdatedComputerNameSelect = () => {
  const storedName = localStorage.getItem("computerName") ?? "";

  const handleChange = (value: string) => {
    localStorage.setItem("computerName", value);
    window.location.reload();
  };

  return (
    <div className="max-w-[400px]">
      <Label className="text-sm">Computer Name</Label>
      <Select value={storedName} onValueChange={handleChange}>
        <SelectTrigger className="mt-2">
          <SelectValue placeholder="Select computer name" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="masroor">Masroor</SelectItem>
            <SelectItem value="tahir">Tahir</SelectItem>
            <SelectItem value="nasir">Nasir</SelectItem>
            <SelectItem value="basheer">Basheer</SelectItem>
            <SelectItem value="noor">Noor</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

const PrinterNameDisplay = ({
  printerName,
  setPrinterName,
}: {
  printerName: string;
  setPrinterName: (name: string) => void;
}) => {
  const storedPrinterName =
    localStorage.getItem("storedPrinterName") ?? "UNKNOWN";

  return (
    <div className="max-w-[400px] space-y-2">
      <Label className="text-sm text-muted-foreground">Printer Name</Label>
      <div className="flex items-center gap-2 text-muted-foreground text-lg">
        <span className="font-mono">{printerName}</span>
        <Lock className="w-4 h-4" />
      </div>
      <EditPrinterNameDialog
        currentPrinterName={printerName}
        onSave={(name) => {
          localStorage.setItem("storedPrinterName", name);
          setPrinterName(name);
          toast.success("Printer name updated");
        }}
      />
    </div>
  );
};

const EditPrinterNameDialog = ({
  currentPrinterName,
  onSave,
}: {
  currentPrinterName: string;
  onSave: (name: string) => void;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [authPassed, setAuthPassed] = useState(false);
  const [inputPassword, setInputPassword] = useState("");
  const [newPrinterName, setNewPrinterName] = useState(currentPrinterName);

  useEffect(() => {
    if (dialogOpen === false) {
      // Reset state when dialog closes
      setAuthPassed(false);
      setInputPassword("");
      setNewPrinterName(currentPrinterName);
    }
  }, [dialogOpen, currentPrinterName]);

  const handlePasswordSubmit = () => {
    if (inputPassword === "1234") {
      setAuthPassed(true);
    } else {
      toast.error("Incorrect password");
    }
  };

  const handleSave = () => {
    if (newPrinterName.trim().length === 0) {
      toast.error("Printer name cannot be empty");
      return;
    }
    onSave(newPrinterName);
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>Edit printer name</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Printer Name</DialogTitle>
        </DialogHeader>
        {!authPassed ? (
          <div className="space-y-4">
            <Label htmlFor="password">Enter Password</Label>
            <Input
              id="password"
              type="password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
            />
            <DialogFooter>
              <Button onClick={handlePasswordSubmit}>Unlock</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <Label htmlFor="printer-name">New Printer Name</Label>
            <Input
              id="printer-name"
              value={newPrinterName}
              onChange={(e) => setNewPrinterName(e.target.value)}
            />
            <DialogFooter>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
