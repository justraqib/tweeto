import React, { useState } from "react";
import { useAuth } from "../contexts/auth";
import { getApiBase } from "../utils/utils"

export default function NewTweetForm() {
    const { getToken } = useAuth();
    const [tweetBody, setTweetBody] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!getToken) {
            console.error("getToken is undefined");
            return;
        }

        const token = await getToken();
        const resp = await fetch(`${getApiBase()}/tweets/`, {
            method: 'POST',
            body: JSON.stringify({ body: tweetBody }),
            headers: {
                "Content-Type": 'application/json',
                "Authorization": `Bearer ${token}`,
            },
        });
        if ( resp.ok ) {
            (e.target as HTMLFormElement).reset();
        } else {
            alert("Unable to tweet");
        }
    }

    return (
        <>
            <form method="POST" onSubmit={handleSubmit} className="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="px-4 py-2 bg-white rounded-t-lg">
                    <label htmlFor="newTweet" className="sr-only">Your tweet</label>
                    <textarea id="newTweet" rows={4} onChange={(e) => { setTweetBody(e.target.value) }} className="w-full px-0 text-sm text-gray-900 bg-white border-0 focus:ring-0 focus:outline-none resize-none" placeholder="Write something..." required></textarea>
                </div>

                <div className="flex items-center justify-end px-3 py-2 border-t">
                    <button type="submit" className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 hover:bg-blue-800">
                        Tweet
                    </button>
                </div>
            </form>
        </>
    )
}
