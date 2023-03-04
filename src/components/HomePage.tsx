import { getAllData, getVersion } from "@/data/IPC/IPCMessages";
import { useState } from "react";

export default function HomePage(): JSX.Element {
    const [data, setData] = useState([]);

    async function handleGettingData() {
        const result = await getAllData();
        console.log("The data received is:", result)
    }

    async function handleGetVersion() {
        const version = await getVersion();
        console.log(version)
    }

    return (
        <>
            <h1>This is the Home Page!</h1>
            <button onClick={handleGettingData}>FetchData</button>
            <button onClick={handleGetVersion}>Get Version</button>
        </>
    );
}
