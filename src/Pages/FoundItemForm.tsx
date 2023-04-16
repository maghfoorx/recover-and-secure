import { Link } from "react-router-dom";
import {useForm} from 'react-hook-form'
import { useState } from "react";
import { postFoundItem } from "@/data/IPC/IPCMessages";

export default function FoundItemForm(): JSX.Element {

    const [sucess, setSuccess] = useState<boolean>(false)
    const {register, handleSubmit, formState: {errors}, reset} = useForm()

    async function handlePostingForm(data:unknown) {
        try {
            await postFoundItem(data)
            setSuccess(true);
            reset();
            setTimeout(() => setSuccess(false), 2000)

        }
        catch (error) {
            console.error(error)
        }
    }
    return (
        <div>
            <Link to="/">Go Back</Link>
            <h1>Wow! Item Found! fill this out</h1>
            <form onSubmit={handleSubmit((data) => handlePostingForm(data))}>
                <p>Item Name</p>
                <input {...register("ItemName", {required: true})}/>
                <p>Item Details</p>
                <input {...register("Details", {required: true})}/>
                <p>Found Area</p>
                <input {...register("FoundArea")}/>
                <br />
                <input type="submit"/>
                {sucess && <h3>Successfully submitted the form!</h3>}
            </form>
        </div>
    )
}