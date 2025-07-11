import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { cn } from "@/lib/utils";

export default function AmaanatPage(): JSX.Element {
  const navigate = useNavigate();

  // Convex queries
  const amaanatUsers = useQuery(api.amaanat.queries.getAllAmaanatUsers) ?? [];
  const amaanatItems = useQuery(api.amaanat.queries.getTotalAmaanatItems) ?? [];

  // Local state
  const [searchBarValue, setSearchBarValue] = useState<string>("");
  const [isFilteredByStored, setIsFilteredByStored] = useState(
    localStorage.getItem("filterAmaanatUsersWithStoredItemsOnly") === "true",
  );

  // Memoized filtering logic
  const usersWithItemCounts = useMemo(() => {
    return amaanatUsers.map((user) => {
      const storedItems = amaanatItems.filter(
        (item) => item.user_id === user._id && !item.is_returned,
      ).length;
      const returnedItems = amaanatItems.filter(
        (item) => item.user_id === user._id && item.is_returned,
      ).length;

      return {
        ...user,
        storedItems,
        returnedItems,
      };
    });
  }, [amaanatUsers, amaanatItems]);

  // Filter users based on stored items
  const filteredOnStoredItems = useMemo(() => {
    return usersWithItemCounts.filter((user) => user.storedItems > 0);
  }, [usersWithItemCounts]);

  // Determine which users to show
  const usersToShow = isFilteredByStored
    ? filteredOnStoredItems
    : usersWithItemCounts;

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    return usersToShow.filter(
      (user) =>
        user.aims_number
          ?.toLowerCase()
          ?.includes(searchBarValue.toLowerCase()) ||
        user.name?.toLowerCase()?.includes(searchBarValue.toLowerCase()),
    );
  }, [usersToShow, searchBarValue]);

  // Show loading state
  if (amaanatUsers === undefined || amaanatItems === undefined) {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-3xl font-bold">Amaanat</h1>
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full px-2 py-6 space-y-4">
      <h1 className="text-3xl font-bold">Amaanat</h1>

      <div className="flex flex-col gap-1">
        <Input
          value={searchBarValue}
          onChange={(event) => setSearchBarValue(event.target.value)}
          placeholder="Search name or AIMS number"
          className="rounded-sm"
        />
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={isFilteredByStored}
            onCheckedChange={() => {
              const updatedValue = !isFilteredByStored;
              localStorage.setItem(
                "filterAmaanatUsersWithStoredItemsOnly",
                updatedValue.toString(),
              );
              setIsFilteredByStored(updatedValue);
            }}
          />
          <span>Show users with stored items only</span>
        </label>
      </div>

      {/* Main scrollable table area */}
      <div className="flex-1 relative h-full">
        <div className="absolute h-full w-full overflow-y-auto">
          <Table className="w-full">
            <TableHeader className="bg-white">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Stored items</TableHead>
                <TableHead>Returned items</TableHead>
                <TableHead>AIMS number</TableHead>
                <TableHead>Jamaat</TableHead>
                <TableHead>Phone number</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user._id}
                    onClick={() => navigate(`/amaanat/${user._id}`)}
                    className={cn("cursor-pointer hover:opacity-80", {
                      "bg-green-300 hover:bg-green-300": user.storedItems === 0,
                    })}
                  >
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.storedItems}</TableCell>
                    <TableCell>{user.returnedItems}</TableCell>
                    <TableCell>{user.aims_number}</TableCell>
                    <TableCell>{user.jamaat}</TableCell>
                    <TableCell>{user.phone_number}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
