import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Dialog, DialogContent } from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppSidebar } from "./AppSidebar";
import { SidebarTrigger } from "./ui/sidebar";
import { useForm } from "react-hook-form";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full">
      <AppSidebar />
      <SidebarTrigger className="mt-2 rounded-l-none shadow-none" />
      <main className="flex-1 px-0 py-4">
        {children}
        <Toaster />
        <ComputerNameSelecterDialog />
      </main>
    </div>
  );
}

const VALID_COMPUTER_NAMES = ["masroor", "tahir", "nasir", "basheer", "noor"];

interface FormData {
  computerName: string;
  printerName: string;
}

const ComputerNameSelecterDialog = () => {
  const storedName = localStorage.getItem("computerName") ?? "";
  const storedPrinterName = localStorage.getItem("storedPrinterName") ?? "";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      computerName: storedName,
      printerName: storedPrinterName,
    },
  });

  const computerName = watch("computerName");

  const visible =
    !VALID_COMPUTER_NAMES.includes(storedName) || storedPrinterName.length < 1;

  useEffect(() => {
    // Sync localStorage value if it changes
    setValue("computerName", storedName);
    setValue("printerName", storedPrinterName);
  }, []);

  const onSubmit = (data: FormData) => {
    localStorage.setItem("computerName", data.computerName);
    localStorage.setItem("storedPrinterName", data.printerName);
    window.location.reload();
  };

  return (
    <Dialog open={visible} onOpenChange={() => {}}>
      <DialogContent
        className="rounded-sm w-[94%]"
        hideCross={true}
        overlayClassName="backdrop-blur-sm"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-10 flex flex-col gap-4"
        >
          <div className="font-bold text-xl text-center">
            Select computer name for this device
          </div>

          <div>
            <Label htmlFor="computerName" className="text-sm">
              Computer Name
            </Label>
            <Select
              value={computerName}
              onValueChange={(val) => setValue("computerName", val)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select computer name" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {VALID_COMPUTER_NAMES.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="printerName" className="text-sm">
              Set printer name*
            </Label>
            <div className="text-xs text-gray-700">
              Look at your printer settings and copy and paste the name here
            </div>
            <Input
              className="mt-1"
              id="printerName"
              {...register("printerName", {
                required: "Printer name is required",
              })}
            />
            {errors.printerName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.printerName.message}
              </p>
            )}
          </div>

          <div>
            <Button type="submit" className="w-full">
              Save settings
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
