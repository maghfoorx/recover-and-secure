import useFetchAmaanatData from "@/customHooks/useFetchAmaanatData"

export default function AmaanatPage(): JSX.Element {
    const { amaanatUsers } = useFetchAmaanatData();

    console.log(amaanatUsers)
    return (
        <>
            <h1>This is Amaanat Page</h1>
        </>
    )
}