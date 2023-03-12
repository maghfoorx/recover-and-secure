import FoundItems from "@/components/FoundItems";
import LostItems from "@/components/LostItems";

export default function LostPropertyPage(): JSX.Element {
    return (
        <div>
            <LostItems />
            <FoundItems />
        </div>
    )
}