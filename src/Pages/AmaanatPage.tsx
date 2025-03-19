import { useEffect, useState } from "react";
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
import useFetchAmaanatUsers from "@/hooks/useFetchAmaanatUsers";
import { getAmaanatItems } from "@/apiApi/modules/amaanat";
import { filterByStoredItems } from "@/utils/filterBySortedItems";
import { AmaanatUserType, AmaanatUserItemType } from "@/type/moduleTypes";

export default function AmaanatPage(): JSX.Element {
  const navigate = useNavigate();
  const { amaanatUsers } = useFetchAmaanatUsers();
  const [searchBarValue, setSearchBarValue] = useState<string>("");
  const [amaanatItems, setAmaanatItems] = useState<AmaanatUserItemType[]>([]);
  const [isFilteredByStored, setIsFilteredByStored] = useState(false);

  useEffect(() => {
    async function fetchAmaanatItems() {
      const response = await getAmaanatItems();
      setAmaanatItems(response);
    }
    fetchAmaanatItems();
  }, []);

  const filteredOnStoredItems = filterByStoredItems(amaanatUsers, amaanatItems);
  const usersToShow = isFilteredByStored ? filteredOnStoredItems : amaanatUsers;

  const filteredUsers = usersToShow.filter(
    (user) =>
      user.aims_no?.toLowerCase()?.includes(searchBarValue.toLowerCase()) ||
      user.name?.toLowerCase()?.includes(searchBarValue.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-4">
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
            onCheckedChange={() => setIsFilteredByStored(!isFilteredByStored)}
          />
          <span>Show users with stored items only</span>
        </label>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>AIMS number</TableHead>
              <TableHead>Jamaat</TableHead>
              <TableHead>Phone number</TableHead>
              <TableHead>Stored items</TableHead>
              <TableHead>Returned items</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const storedItems = amaanatItems.filter(
                  (item) => item.user_id === user.id && item.is_returned === 0,
                ).length;
                const returnedItems = amaanatItems.filter(
                  (item) => item.user_id === user.id && item.is_returned === 1,
                ).length;

                return (
                  <TableRow
                    key={user.id}
                    onClick={() => navigate(`/amaanat/${user.id}`)}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.aims_number}</TableCell>
                    <TableCell>{user.jamaat}</TableCell>
                    <TableCell>{user.phone_number}</TableCell>
                    <TableCell>{storedItems}</TableCell>
                    <TableCell>{returnedItems}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
