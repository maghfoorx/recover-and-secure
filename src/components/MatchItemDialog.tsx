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

export default function MatchItemDialog({
  open,
  onOpenChange,
  items,
  onMatch,
  type,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: Doc<"found_items">[] | Doc<"lost_items">[];
  onMatch: (itemId: Id<"found_items"> | Id<"lost_items">) => void;
  type: "lost" | "found";
}) {
  const [search, setSearch] = useState("");

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.details?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[700px]">
        <DialogHeader>
          <DialogTitle>Match with {type} item</DialogTitle>
        </DialogHeader>
        <div>
          <Input
            placeholder={`Search ${type} items...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                      {type === "lost"
                        ? new Date(item?.date_reported).toLocaleDateString()
                        : new Date(item?.found_date).toLocaleDateString()}
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
