import { addAmaanatItem, printAmaanatReceipt } from "@/IPC/IPCMessages.amaanat";
import useFetchUserAmaanatItems from "@/custom-hooks/useFetchUserAmaanatItems";
import { AmaanatUserItemType } from "@/type-definitions/types.amaanat";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import "./amaanat-add-items.css"

export default function AmaanatAddItemsForm({ computerName }: { computerName: string}) {
    const { userId } = useParams();
    if (!userId) return null;

    const { amaanatUser, handleGetAmaanatUser, amaanatItems, handleGetUserAmaanatItems } = useFetchUserAmaanatItems({ ID: userId});

    useEffect(() => {
        handleGetAmaanatUser(userId);
    }, []);

    const {register, handleSubmit, formState: {errors}, reset} = useForm();

    const [sucess, setSuccess] = useState<boolean>(false);
    const [addedItem, setAddedItem] = useState<AmaanatUserItemType | null>(null)

    async function handleSubmitForm(data: unknown) {
        try {
            const response = await addAmaanatItem(data);
            console.log(response, 'is the response');
            setAddedItem(response[0])
            handleGetUserAmaanatItems(userId!)
            setSuccess(true)
            reset();
            setTimeout(() => setSuccess(false), 2000)
        }
        catch (error) {
            console.error(error)
        }
    }
    console.log(computerName)

    async function handlePrintReceipt() {
        const data = {
            itemsNumber: amaanatItems?.filter((item) => item.Returned === 1).length,
            aimsID: amaanatUser?.AIMSNo,
            location: amaanatItems?.filter(item => item.Returned === 0)[0].StoredLocation ?? '',
            computerName,
        }
        console.log(data)
        await printAmaanatReceipt(data)
    }
    
    return (
        <div>
            <Link to={`/amaanat/${userId}`} className="go-back">Go back</Link>
            <form onSubmit={handleSubmit((data) => handleSubmitForm(data))}>
                <h1>{`Add items for ${amaanatUser?.Name}`}</h1>
                <p>Item Name</p>
                <input {...register('ItemName', {required: true})}/>
                <p>Item Details</p>
                <input {...register('ItemDetails')}/>
                <p>Storing Location</p>
                <input {...register('StoredLocation')}/>
                <input type="hidden" {...register('UserID', { value: userId })} />
                <br />
                <input type="submit"/>
                {sucess && addedItem && <h3>Successfully added {addedItem.ItemName}!</h3>}
            </form>
                <button onClick={handlePrintReceipt}>Print Receipt</button>
                <h2>{amaanatUser?.Name} items currently stored ({amaanatItems?.filter((item) => item.Returned === 0).length}):</h2>
            <div className="added-items">
                {amaanatItems
                ?.filter((item) => item.Returned === 0)
                ?.map((item) => {
                    return (
                        <p key={item.ID} className="added-item">{item.ItemName}</p>
                    )
                })}
            </div>
            <h2>{amaanatUser?.Name} items returned ({amaanatItems?.filter((item) => item.Returned === 1).length}):</h2>
            <div className="added-items">
            {amaanatItems
            ?.filter((item) => item.Returned === 1)
            ?.map((item) => {
                    return (
                        <p key={item.ID} className="added-item">{item.ItemName}</p>
                    )
                })}
            </div>
        </div>
    )
}