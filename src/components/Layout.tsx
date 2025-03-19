import React from "react";
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

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full">
      <AppSidebar />
      <main className="flex-1 p-4">
        {children}
        <Toaster />
        <ComputerNameSelecterDialog />
      </main>
    </div>
  );
}

const VALID_COMPUTER_NAMES = ["masroor", "tahir", "nasir", "basheer", "noor"];

const ComputerNameSelecterDialog = () => {
  const storedName = localStorage.getItem("computerName") ?? "";

  const handleChange = (value: any) => {
    localStorage.setItem("computerName", value);
    window.location.reload();
  };

  const visible = !VALID_COMPUTER_NAMES.includes(storedName);

  return (
    <Dialog open={visible} onOpenChange={() => {}}>
      <DialogContent
        className="rounded-sm h-[400px] w-[94%]"
        hideCross={true}
        overlayClassName="backdrop-blur-sm"
      >
        <div className="mb-10 flex flex-col gap-4">
          <div className="font-bold text-xl text-center">
            Select computer name for this device
          </div>
          <div>
            <label htmlFor="computer-name-dialog" className="text-sm">
              Computer Name
            </label>
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
