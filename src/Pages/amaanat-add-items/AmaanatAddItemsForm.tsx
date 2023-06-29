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
    const [addedItem, setAddedItem] = useState<AmaanatUserItemType | null>(null);
    const [showPrintError, setShowPrintError] = useState(false)

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

    async function handlePrintReceipt() {
        const storedItems = amaanatItems?.filter(item => item.Returned === 0)
        if (storedItems.length < 1) {
            setShowPrintError(true)
            setTimeout(() => setShowPrintError(false), 3000)
        }
        else {
        const data = {
            itemsNumber: storedItems.length,
            aimsID: amaanatUser?.AIMSNo,
            location: storedItems[0]?.StoredLocation ?? '',
            computerName,
        }
        await printAmaanatReceipt(data)
        }
    }

    const returnedItems = amaanatItems.filter(item => item.Returned === 1)
    const storedItems = amaanatItems.filter(item => item.Returned === 0)
    
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
                {showPrintError && <p>Sorry! {amaanatUser?.Name} does not have any items stored.</p>}
                <h2>{amaanatUser?.Name} items currently stored ({amaanatItems?.filter((item) => item.Returned === 0).length}):</h2>
            <div className="added-items">
                {storedItems.length < 1 && <p>No items stored.</p>}
                {storedItems
                ?.map((item) => {
                    return (
                        <p key={item.ID} className="added-item">{item.ItemName}</p>
                    )
                })}
            </div>
            <h2>{amaanatUser?.Name} items returned ({amaanatItems?.filter((item) => item.Returned === 1).length}):</h2>
            <div className="added-items">
                {returnedItems.length < 1 && <p>No items returned yet.</p>}
            {returnedItems
            ?.map((item) => {
                    return (
                        <p key={item.ID} className="added-item">{item.ItemName}</p>
                    )
                })}
            </div>
        </div>
    )
}