import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  PackageCheck,
  Inbox,
  Calendar,
  Users,
  Box,
  FilePlus,
  FileDown,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { formatDate } from "@/utils/formatDate";
import { getLostItemCategoryLabel } from "@/lib/lostItemCategories";

export default function Dashboard(): JSX.Element {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Fetch all data using Convex queries
  const lostItems =
    useQuery(api.lostProperty.queries.getLostItemsReported) || [];
  const foundItems =
    useQuery(api.lostProperty.queries.getFoundItemsReported) || [];
  const amaanatUsers = useQuery(api.amaanat.queries.getAllAmaanatUsers) || [];
  const amaanatItems = useQuery(api.amaanat.queries.getTotalAmaanatItems) || [];

  const storedItemUsers = amaanatUsers.filter((user) =>
    amaanatItems.some((item) => item.user_id === user._id && !item.is_returned),
  );

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);

    try {
      const unreturnedFoundItems = foundItems.filter(
        (item) => !item.is_returned,
      );

      const reportData = {
        generatedAt: new Date().toLocaleString("en-GB"),
        summary: {
          lostItems: lostItems.length,
          lostItemsFound: lostItems.filter((item) => item.is_found).length,
          foundItems: foundItems.length,
          foundItemsReturned: foundItems.filter((item) => item.is_returned)
            .length,
          amaanatUsers: amaanatUsers.length,
          amaanatItems: amaanatItems.length,
          amaanatItemsStored: amaanatItems.filter((item) => !item.is_returned)
            .length,
        },
        categoryTotals: {
          lost: buildCategoryTotals(lostItems),
          found: buildCategoryTotals(foundItems),
          amaanat: buildCategoryTotals(amaanatItems),
          unreturnedFound: buildCategoryTotals(unreturnedFoundItems),
        },
        unreturnedFoundItems: unreturnedFoundItems.map((item) => ({
          Item: item.name,
          Category: getCategoryName(item.category_slug),
          Details: item.details || "-",
          "Found date": formatDate(item.found_date),
          "Office ref": item.location_stored || "-",
          "Found area": item.location_found || "-",
          "Found by": item.finder_name || "-",
          "Received by": item.received_by || "-",
        })),
      };

      const result = await window.ipcApi.generateEventReportPdf(reportData);

      toast.success(`Report saved to ${result.filePath}`);
    } catch (error) {
      toast.error("Failed to generate report PDF");
      console.error(error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="px-2 py-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Operational overview and staff controls.
          </p>
        </div>
        <Button onClick={handleGenerateReport} disabled={isGeneratingReport}>
          <FileDown className="h-4 w-4" />
          {isGeneratingReport ? "Generating PDF..." : "Generate PDF report"}
        </Button>
      </div>

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

function buildCategoryTotals(items: Array<{ category_slug?: string }>) {
  return items.reduce<Record<string, number>>((totals, item) => {
    const category = getCategoryName(item.category_slug);
    totals[category] = (totals[category] ?? 0) + 1;
    return totals;
  }, {});
}

function getCategoryName(categorySlug?: string) {
  if (!categorySlug) {
    return "Uncategorized";
  }

  return getLostItemCategoryLabel(categorySlug) || "Uncategorized";
}
