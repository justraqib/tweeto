import { MapPinIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import Avatar from "../components/avatar";
import Nav from "../components/nav";
import MyHead from "../components/head";
import { User, useAuth } from "../contexts/auth";
import { getApiBase } from "../utils/utils";
import { GetServerSideProps } from "next";
import { useState } from "react";
import dayjs from "dayjs";
import TweetTemplate, { TweetApiResponse } from "../components/tweet_template";
import InfiniteScroll from "react-infinite-scroll-component";

interface IUserProfileProps {
    tweetsData: TweetApiResponse,
    userData: User
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { username } = context.query;
    let accessToken;

    if (context.req.cookies["refresh_token"]) {
        const tokenResponse = await fetch(`${getApiBase()}/token/refresh/`, {
            method: 'POST',
            headers: { "Cookie": context.req.headers.cookie || "" },
        })
        if (tokenResponse.ok) {
            const { access } = await tokenResponse.json();
            accessToken = access;
        }
    }

    const headers = accessToken ? { "Authorization": `Bearer ${accessToken}` } : undefined;
    const userDataResp = await fetch(`${getApiBase()}/users/${username}/`, { headers: headers });
    const tweetsDataResp = await fetch(`${getApiBase()}/tweets/?parent__isnull=true&user__username=${username}&order_by=-created`, { headers: headers });

    if (userDataResp.ok && tweetsDataResp.ok) {
        return {
            props: {
                tweetsData: await tweetsDataResp.json(),
                userData: await userDataResp.json()
            },
        }
    }

    if (userDataResp.status === 404 || tweetsDataResp.status === 404) {
        return {
            notFound: true,
        }
    }

    throw new Error('Internal Server Error');
}



export default function UserProfile({ tweetsData, userData }: IUserProfileProps) {
    const [currentUserFollowId, setCurrentUserFollowId] = useState(userData.current_user_follow_id);
    const [nextUrl, setNextUrl] = useState(tweetsData.next);
    const [allTweetData, setAllTweetData] = useState(tweetsData.results)
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
                body: JSON.stringify({ follows: userData.id }),
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

    const handleLoadMore = async () => {
        if (!nextUrl) return
        const nextPath = nextUrl.split("/api/")[1];
        const nextUrlFinal = `${getApiBase()}/${nextPath}`;
        const option = getToken ? { headers: { "Authorization": `Bearer ${await getToken()}` } } : {};
        const resp = await fetch(nextUrlFinal, option);
        if (resp.ok) {
            const respData = await resp.json();
            setNextUrl(respData.next);
            setAllTweetData([...allTweetData, ...respData.results]);
            console.log(respData);
        } else {
            console.error("Unable to fetch more tweet!");
        }
    }

    const loader = <div className="flex justify-center items-center">
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p>loading....</p>
    </div>


    return (
        <>
            <MyHead title={`${userData.username}'s profile`} />
            <Nav />
            {
                userData &&
                <main className="flex flex-col md:flex-row gap-4 mx-auto max-w-7xl my-4 px-2 sm:px-6 lg:px-8">
                    <div className="w-full md:w-1/3">
                        <div className="bg-white p-4 shadow-sm rounded-sm relative">
                            <Avatar user={userData} className="h-32 w-32 rounded-full mx-auto" />
                            {user && user.id !== userData.id &&
                                <div className="flex justify-center gap-4 my-4">
                                    <button onClick={handleFollowClick} className="rounded-md w-28 border border-transparent bg-purple-600 px-5 py-3 text-base font-medium text-white hover:bg-purple-700">{currentUserFollowId ? 'Unfollow' : 'Follow'}</button>
                                    <button className="rounded-md w-28 border border-purple-100 bg-white px-5 py-3 text-base font-medium text-purple-600 hover:bg-purple-50">Message</button>
                                </div>
                            }
                            <h1 className="mt-5 font-bold">{userData.name}</h1>
                            <span className="text-opacity-60 text-black">@{userData.username}</span>
                            <p className="mt-4">{userData.about}</p>
                            <div className="flex gap-3 mt-4 text-opacity-60 text-black">
                                <span className="flex items-center gap-1">
                                    <MapPinIcon className="h-5 w-5 -m-1" />
                                    <span>{userData.location}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <CalendarDaysIcon className="h-5 w-5" />
                                    <span>Joined {dayjs(userData.date_joined).tz(user?.timezone || 'UTC').format('MMMM YYYY')}</span>
                                </span>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <span className="flex items-center gap-1">
                                    <span className="font-semibold">{userData.following_count}</span>
                                    <span className="text-black text-opacity-60">Following</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="font-semibold">{userData.followers_count}</span>
                                    <span className="text-black text-opacity-60">Followers</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="w-full md:w-2/3 flex flex-col gap-4">
                        <InfiniteScroll
                            style={{ overflow: "hidden" }}
                            dataLength={allTweetData.length}
                            next={handleLoadMore}
                            hasMore={nextUrl !== null}
                            loader={loader}
                            endMessage={
                                <p style={{ textAlign: 'center' }}>
                                    <b>Yay! You have seen it all</b>
                                </p>
                            }
                        >
                            {allTweetData.map(tweet => <TweetTemplate key={tweet.id} data={tweet} />)}
                        </InfiniteScroll>
                        {nextUrl &&
                            <button onClick={handleLoadMore}>Load more</button>
                        }
                    </div>
                </main>
            }
        </>
    )
}
