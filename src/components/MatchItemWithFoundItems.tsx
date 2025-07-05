import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Doc, Id } from "convex/_generated/dataModel";

export default function MatchWithFoundItemsDialog({
  open,
  onOpenChange,
  items,
  onMatch,
  lostItem,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: Doc<"found_items">[];
  onMatch: (itemId: Id<"found_items">) => void;
  lostItem: Doc<"lost_items"> | null;
}) {
  const [search, setSearch] = useState("");

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.details?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Match with found item</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-[500px]">
          {lostItem != null && (
            <div className="rounded-sm p-2 bg-slate-200 text-sm">
              <div className="font-semibold">Item to match with</div>
              <div className="flex justify-between items-center">
                <dt className="text-gray-500">Name</dt>
                <dd className="text-right">{lostItem.name}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-sm font-medium text-gray-500">Details</dt>
                <dd className="text-sm text-gray-900 text-right">
                  {lostItem.details}
                </dd>
              </div>
            </div>
          )}
          <Input
            placeholder={"Search found items..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-2"
          />
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.details}</TableCell>
                    <TableCell>
                      {new Date(item?.found_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => onMatch(item._id)}>
                        Match
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
