import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Archive,
  CheckCircle2,
  Users,
  Box,
  FilePlus,
  FileDown,
  Link2,
  Search,
} from "lucide-react";
import { useConvex, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { formatDate } from "@/utils/formatDate";
import { getLostItemCategoryLabel } from "@/lib/lostItemCategories";

export default function Dashboard(): JSX.Element {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const convex = useConvex();

  const metrics =
    useQuery(api.lostProperty.queries.getDashboardMetrics) ?? DEFAULT_METRICS;

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);

    try {
      const reportData = await convex.query(
        api.lostProperty.queries.getDashboardReportData,
      );

      const printableReportData = {
        ...reportData,
        categoryTotals: {
          lost: relabelCategoryTotals(reportData.categoryTotals.lost),
          found: relabelCategoryTotals(reportData.categoryTotals.found),
          amaanat: relabelCategoryTotals(reportData.categoryTotals.amaanat),
          unreturnedFound: relabelCategoryTotals(
            reportData.categoryTotals.unreturnedFound,
          ),
        },
        unreturnedFoundItems: reportData.unreturnedFoundItems.map((item) => ({
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

      const result =
        await window.ipcApi.generateEventReportPdf(printableReportData);

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
        </div>
        <Button onClick={handleGenerateReport} disabled={isGeneratingReport}>
          <FileDown className="h-4 w-4" />
          {isGeneratingReport ? "Generating PDF..." : "Generate PDF report"}
        </Button>
      </div>

      <section>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <KpiCard
            title="Open lost reports"
            value={metrics.openLostReports}
            subtitle={`${metrics.lostItemsFound} marked found`}
            icon={Search}
          />
          <KpiCard
            title="Matched lost/found items"
            value={metrics.matchedItems}
            subtitle="Confirmed links"
            icon={Link2}
          />
          <KpiCard
            title="Found items in storage"
            value={metrics.foundItemsInStorage}
            subtitle={`${metrics.foundItemsReturned} returned`}
            icon={Archive}
          />
          <KpiCard
            title="Amaanat items stored"
            value={metrics.amaanatItemsStored}
            subtitle={`${metrics.storedItemUsers} users with stored items`}
            icon={Box}
          />
          <KpiCard
            title="Items returned"
            value={metrics.foundItemsReturned}
            subtitle="Found-property returns"
            icon={CheckCircle2}
          />
          <KpiCard
            title="Total open inventory"
            value={metrics.totalOpenInventory}
            subtitle="Found storage + Amaanat storage"
            icon={FilePlus}
          />
        </div>
      </section>

      {/* Lost items section */}
      <section>
        <h2 className="text-xl">Lost items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Card>
            <CardHeader className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-sm text-gray-500">
                Reported lost items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-center">
                {metrics.lostItems}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-sm text-gray-500">
                Lost items found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-center">
                {metrics.lostItemsFound}
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
              <Archive className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-sm text-gray-500">
                Found items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-center">
                {metrics.foundItems}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-sm text-gray-500">
                Found items returned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-center">
                {metrics.foundItemsReturned}
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
                Amaanat users served
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-center">
                {metrics.amaanatUsers}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center space-x-2">
              <FilePlus className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-sm text-gray-500">
                Total Amaanat items handled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-center">
                {metrics.amaanatItems}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-sm text-gray-500">
                Amaanat users with items stored
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-center">
                {metrics.storedItemUsers}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center space-x-2">
              <Box className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-sm text-gray-500">
                Amaanat items currently stored
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-center">
                {metrics.amaanatItemsStored}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

const DEFAULT_METRICS = {
  lostItems: 0,
  lostItemsFound: 0,
  openLostReports: 0,
  foundItems: 0,
  foundItemsReturned: 0,
  foundItemsInStorage: 0,
  matchedItems: 0,
  amaanatUsers: 0,
  amaanatItems: 0,
  amaanatItemsStored: 0,
  storedItemUsers: 0,
  totalOpenInventory: 0,
};

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: typeof Search;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-x-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm text-gray-500">{title}</CardTitle>
          <div className="text-3xl font-bold text-slate-950">{value}</div>
        </div>
        <Icon className="h-5 w-5 text-gray-400" />
      </CardHeader>
      <CardContent className="pt-0 text-sm text-muted-foreground">
        {subtitle}
      </CardContent>
    </Card>
  );
}

function relabelCategoryTotals(categoryTotals: Record<string, number>) {
  return Object.entries(categoryTotals).reduce<Record<string, number>>(
    (totals, [categorySlug, count]) => {
      totals[getCategoryName(categorySlug)] = count;
      return totals;
    },
    {},
  );
}

function getCategoryName(categorySlug?: string) {
  if (!categorySlug || categorySlug === "uncategorized") {
    return "Uncategorized";
  }

  return getLostItemCategoryLabel(categorySlug) || "Uncategorized";
}
