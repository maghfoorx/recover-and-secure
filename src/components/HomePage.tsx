import { setWindowTitle } from "@/data/IPC/IPCMessages"

export default function HomePage(): JSX.Element {
    return (
        <>
            <h1>This is the Home Page!</h1>
            <button onClick={() => { setWindowTitle("MKA Lost Property") }}>Check window title</button>
        </>
    )
}