import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { postLostItem } from "@/data/IPC/IPCMessages";
import { useState } from "react";

export default function LostItemForm(): JSX.Element {

    const [sucess, setSuccess] = useState<boolean>(false);

    const { register, handleSubmit, formState: { errors }, } = useForm();

    async function handlePostingForm(data: unknown) {
        try {
            await postLostItem(data)
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000)
        }
        catch (error) {
            console.error(error)
        }
    }
    return (
        <>
            <Link to="/">Go Back</Link>
            <h1>This is the form to submit lost property!</h1>
            <form onSubmit={handleSubmit((data) => handlePostingForm(data))}>
                <p>Person Name</p>
                <input {...register("PersonName")} />
                <p>Item Name</p>
                <input {...register("ItemName")} />
                <p>Item Details</p>
                <input {...register("Details")} />
                <p>Lost Area</p>
                <input {...register("LostArea")} />
                <p>Aims ID</p>
                <input type="number" {...register("AimsID")} />
                <p>Phone Number</p>
                <input {...register("PhoneNumber")} />
                <br />
                <input type="submit" />
                {sucess && <h3>Successfully Posted the form!</h3>}
            </form>
        </>
    )
}