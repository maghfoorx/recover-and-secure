import {useForm} from 'react-hook-form'
import { useState } from "react";
import { postFoundItem, returnFoundItem } from "@/data/IPC/IPCMessages.lostProperty";

type ReturnItemFormProperties = {
    ItemID: number
}

export default function ReturnItemForm({ItemID}: ReturnItemFormProperties): JSX.Element {

    const {register, handleSubmit, formState: {errors}, reset} = useForm();

    console.log('The ID of item you are about to return is', ItemID)

    return (
        <form onSubmit={handleSubmit((data) => returnFoundItem({...data, itemID: ItemID}))}>
            <p>Person Name</p>
            <input {...register("PersonName", {required: true})}/>
            <p>AIMS number</p>
            <input {...register("AimsNumber", {required: true})}/>
            <p>Returned By</p>
            <input {...register("ReturnedBy", {required: true})}/>
            <br />
            <input type="submit"/>
        </form>
    )
}