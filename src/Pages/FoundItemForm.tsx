import { Link } from "react-router-dom";
import {useForm} from 'react-hook-form'
import { useState } from "react";
import { postFoundItem } from "@/IPC/IPCMessages.lostProperty";
import '../styles/FoundItemForm.css'

export default function FoundItemForm(): JSX.Element {

    const [isCash, setIsCash] = useState(false)


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
            <Link to="/" className="go-back">Go Back</Link>
            <form onSubmit={handleSubmit((data) => handlePostingForm(data))}>
                <h1>Add a found item</h1>
                <label>
                <input
                type="checkbox"
                checked={isCash}
                onChange={() => setIsCash(!isCash)}
                />
                <span>Item includes Cash</span>
                </label>
                <p>Item Name</p>
                <input {...register("ItemName", {required: true})}/>
                <p>Item Details</p>
                <input {...register("Details", {required: true})}/>
                <p>Found Area</p>
                <input {...register("FoundArea")}/>
                {
                isCash &&
                <div>
                <p>Found By</p>
                <input {...register("FinderName")}/>
                <p>Finder's AIMS: </p>
                <input {...register("AIMSNumber")}/>
                </div>
                }
                <br />
                <input type="submit"/>
                {sucess && <h3>Successfully added found item!👍</h3>}
            </form>
        </div>
    )
}