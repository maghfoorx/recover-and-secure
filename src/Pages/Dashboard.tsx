import { useEffect, useState } from "react";
import useFetchAmaanatUsers from "@/hooks/useFetchAmaanatUsers";
import useFetchLostPropertyData from "@/hooks/useFetchLostPropertyData";
import { AmaanatUserItemType } from "@/type/moduleTypes";
import { getAmaanatItems } from "@/apiApi/modules/amaanat";
import { filterByStoredItems } from "@/utils/filterBySortedItems";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ClipboardList,
  PackageCheck,
  Inbox,
  Calendar,
  Users,
  Box,
  FilePlus,
} from "lucide-react";

export default function Dashboard(): JSX.Element {
  const { amaanatUsers } = useFetchAmaanatUsers();
  const { foundItems, lostItems } = useFetchLostPropertyData();
  const [amaanatItems, setAmaanatItems] = useState<AmaanatUserItemType[]>([]);

  async function handleGetAmaanatItems() {
    const response = await getAmaanatItems();
    setAmaanatItems(response);
  }

  useEffect(() => {
    handleGetAmaanatItems();
  }, []);

  const storedItemUsers = filterByStoredItems(amaanatUsers, amaanatItems);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Lost items section */}
      <section>
        <h2 className="text-xl">Lost items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex items-center space-x-2">
              <ClipboardList className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-sm text-gray-500">
                Reported lost items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-center">
                {lostItems.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center space-x-2">
              <PackageCheck className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-sm text-gray-500">
                Lost items found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-center">
                {lostItems.filter((item) => item.item_found === "Yes").length}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Found items section */}
      <section>
        <h2 className="text-xl">Found items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex items-center space-x-2">
              <Inbox className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-sm text-gray-500">
                Found items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-center">
                {foundItems.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-sm text-gray-500">
                Found items returned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-center">
                {foundItems.filter((item) => item.returned === 1).length}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Amaanat section */}
      <section>
        <h2 className="text-xl">Amaanat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-sm text-gray-500">
                Amanat users served
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-center">
                {amaanatUsers.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center space-x-2">
              <FilePlus className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-sm text-gray-500">
                Total amanat items handled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-center">
                {amaanatItems.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center space-x-2">
              <Box className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-sm text-gray-500">
                Amanat items currently stored
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-center">
                {amaanatItems.filter((item) => item.returned === 0).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-sm text-gray-500">
                Amanat users with items stored
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-center">
                {storedItemUsers.length}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
