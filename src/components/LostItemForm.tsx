import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

export default function LostItemForm(): JSX.Element {
    const { register, handleSubmit, formState: { errors }, } = useForm();
    return (
        <>
            <Link to="/">Go Back</Link>
            <h1>This is the form to submit lost property!</h1>
            <form onSubmit={handleSubmit((data) => console.log("This is data the form is submitting:", data))}>
                <p>Person Name</p>
                <input {...register("PersonName")} />
                <p>Item Name</p>
                <input {...register("ItemName")} />
                <p>Item Details</p>
                <input {...register("Details")} />
                <p>Lost Area</p>
                <input {...register("LostArea")} />
                <p>Aims ID</p>
                <input type="number" {...register("Aims ID")} />
                <p>Phone Number</p>
                <input {...register("PhoneNumber")} />
                <br />
                <input type="submit" />
            </form>
        </>
    )
}