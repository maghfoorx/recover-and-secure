import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SettingsPage() {
  return (
    <div className="px-2 py-6 space-y-4">
      <h2 className="text-3xl font-semibold">Settings</h2>
      <UpdatedComputerNameSelect />
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
  );
};
