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
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Dashboard(): JSX.Element {
  // Fetch all data using Convex queries
  const lostItems =
    useQuery(api.lostProperty.queries.getLostItemsReported) || [];
  const foundItems =
    useQuery(api.lostProperty.queries.getFoundItemsReported) || [];
  const amaanatUsers = useQuery(api.amaanat.queries.getAllAmaanatUsers) || [];
  const amaanatItems = useQuery(api.amaanat.queries.getTotalAmaanatItems) || [];

  // Calculate stored item users
  const storedItemUsers = amaanatUsers.filter((user) =>
    amaanatItems.some((item) => item.user_id === user._id && !item.is_returned),
  );

  return (
    <div className="px-2 py-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Lost items section */}
      <section>
        <h2 className="text-xl">Lost items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                {lostItems.filter((item) => item.is_found).length}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Found items section */}
      <section>
        <h2 className="text-xl">Found items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                {foundItems.filter((item) => item.is_returned).length}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Amaanat section */}
      <section>
        <h2 className="text-xl">Amaanat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
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

          <Card>
            <CardHeader className="flex items-center space-x-2">
              <Box className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-sm text-gray-500">
                Amanat items currently stored
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-center">
                {amaanatItems.filter((item) => !item.is_returned).length}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
