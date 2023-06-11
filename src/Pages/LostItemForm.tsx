import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { postLostItem } from "@/IPC/IPCMessages.lostProperty";
import { useState } from "react";

export default function LostItemForm(): JSX.Element {

    const [sucess, setSuccess] = useState<boolean>(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm();

    async function handlePostingForm(data: unknown) {
        try {
            await postLostItem(data)
            setSuccess(true);
            reset();
            setTimeout(() => setSuccess(false), 2000)
        }
        catch (error) {
            console.error(error)
        }
    }
    return (
        <>
            <Link to="/" className="go-back">Go Back</Link>
            <form onSubmit={handleSubmit((data) => handlePostingForm(data))}>
                <h1>Add a lost item</h1>
                <p>Person Name</p>
                <input {...register("PersonName", { required: true })} />
                <p>Item Name</p>
                <input {...register("ItemName", { required: true })} />
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
                {sucess && <h3>Successfully added a lost item!👍</h3>}
            </form>
        </>
    )
}