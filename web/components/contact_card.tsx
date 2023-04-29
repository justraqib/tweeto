import Avatar from "./avatar";
import { useAuth, User } from "../contexts/auth";
import { URL } from "../utils/constants";
import Link from "next/link";
import { useState } from "react";
import { getApiBase } from "../utils/utils";

interface IContactCardProps {
    data: User
}

export default function ContactCard({ data }: IContactCardProps) {
    const [currentUserFollowId, setCurrentUserFollowId] = useState(data.current_user_follow_id);
    const { getToken, user } = useAuth();


    const handleFollowClick = async () => {
        if (!getToken) {
            console.error("getToken is undefined");
            return;
        }

        const token = await getToken();
        if (currentUserFollowId == 0) {
            const resp = await fetch(`${getApiBase()}/user-follows/`, {
                method: 'POST',
                body: JSON.stringify({ follows: data.id }),
                headers: {
                    "Content-Type": 'application/json',
                    "Authorization": `Bearer ${token}`,
                },
            })
            if (resp.ok) {
                const { id } = await resp.json();
                setCurrentUserFollowId(id);
            }
        } else {
            const resp = await fetch(`${getApiBase()}/user-follows/${currentUserFollowId}/`, {
                method: 'DELETE',
                headers: { "Authorization": `Bearer ${token}` },
            })
            if (resp.ok) {
                setCurrentUserFollowId(0);
            }
        }
    }



    return (
        <>
            <div className="bg-white items-center sm:p-5 p-8">
                <Link href={URL.PROFILE_URL(data.username)}>
                    <Avatar user={data} className="flex w-full m-auto mb-3 p-1 h-32 w-32 rounded-full hover:ring-1" />
                </Link>
                <Link href={URL.PROFILE_URL(data.username)}>
                    <h1 className=" text-center my-1 font-bold hover:text-gray-600">
                        {data.name}
                    </h1>
                </Link>
                <Link href={URL.PROFILE_URL(data.username)} className="text-opacity-60 text-black hover:text-opacity-40">
                    <span className="text-center inline-block w-full">@{data.username}</span>
                </Link>
                {user && user.id !== data.id &&
                    <div className="flex justify-center mt-2 gap-3">
                        <button onClick={handleFollowClick} className="rounded-md w-28 border border-transparent bg-purple-600 py-2 text-base font-medium text-white hover:bg-purple-700">{currentUserFollowId ? 'Unfollow' : 'Follow'}</button>
                        <button className="rounded-md w-28 border border-purple-100 bg-white py-3 text-base font-medium text-purple-600 hover:bg-purple-50">Message</button>
                    </div>
                }
            </div>
        </>

    )
}