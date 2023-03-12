import useFetchLostPropertyData from "@/customHooks/useFetchLostPropertyData"
import "../styles/FoundItems.css"

export default function FoundItems(): JSX.Element {

    const { foundItems } = useFetchLostPropertyData();

    console.log("Data from found_items", foundItems)
    return (
        <div className="found-items-component">
            <h1>This is Found Items Component</h1>
        </div>
    )
}