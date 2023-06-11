import { Link } from "react-router-dom";
import {useForm} from 'react-hook-form'
import { useState } from "react";
import { addAmaanatUser } from "@/IPC/IPCMessages.amaanat";

export default function AmaanatSignUpForm() {
    const {register, handleSubmit, formState: {errors}, reset} = useForm()

    const [sucess, setSuccess] = useState<boolean>(false);

    async function handleSignUpUser(data:unknown) {
        try {
            await addAmaanatUser(data)
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
            <Link to="/amaanat" className="go-back">Go Back</Link>
            <form onSubmit={handleSubmit((data) => handleSignUpUser(data))}>
                <h1>Sign Up Amaanat User</h1>
                <p>Person Name*</p>
                <input {...register('Name', {required: true})}/>
                <p>AIMS Number*</p>
                <input {...register('AIMSNo', {required: true})} />
                <p>Phone Number</p>
                <input {...register('PhoneNo')}/>
                <br />
                <input type="submit"/>
                {sucess && <h3>Successfully added amaanat user!👍</h3>}
            </form>
        </div>
    )
}