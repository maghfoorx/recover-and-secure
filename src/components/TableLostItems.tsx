import useFetchLostItems from "@/customHooks/useFetchLostItems";
import MaterialTable from "material-table";
import { ThemeProvider, createTheme } from "@mui/material";

export default function TableLostItems(): JSX.Element {

    const { lostItems } = useFetchLostItems();
    const COLUMNS = [
        {
            title: "ID",
            field: "ID"
        },
        {
            title: "Name",
            field: "ItemName"
        },
        {
            title: "Details",
            field: "Details"
        },
        {
            title: "Lost Area",
            field: "LostArea"
        },
        {
            title: "Date",
            field: "Date"
        },
        {
            title: "Found",
            field: "ItemFound"
        }
    ]

    const defaultMaterialTheme = createTheme()

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ThemeProvider theme={defaultMaterialTheme}>
                <MaterialTable
                    columns={COLUMNS}
                    data={lostItems}
                />
            </ThemeProvider>
        </div>
    )
}