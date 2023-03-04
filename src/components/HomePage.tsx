import { getAllData, getVersion } from "@/data/IPC/IPCMessages";
import { useState } from "react";

interface Person {
  id: number;
  first_name: string;
  second_name: string;
}

export default function HomePage(): JSX.Element {
  const [data, setData] = useState<Person[]>([]);

  async function handleGettingData() {
    const result = await getAllData();
    console.log("The data received is:", result);
    setData(result);
  }

  async function handleGetVersion() {
    const version = await getVersion();
    console.log(version);
  }

  return (
    <>
      <h1>This is the Home Page!</h1>
      <button onClick={handleGettingData}>FetchData</button>
      <button onClick={handleGetVersion}>Get Version</button>
      {data.map((person) => (
        <p key={person.id}>{person.first_name}</p>
      ))}
    </>
  );
}
