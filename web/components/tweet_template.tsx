import dayjs from "dayjs"
import Router from "next/router"
import { useEffect, useState } from "react"
import { ChatBubbleLeftIcon as ChatBubbleLeftIconSolid, HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid"
import { ChatBubbleLeftIcon as ChatBubbleLeftIconOutline, HeartIcon as HeartIconOutline } from "@heroicons/react/24/outline"
import Avatar from "./avatar"
import NewTweetForm from "./new_tweet_form"
import { useAuth, User } from "../contexts/auth"
import { getApiBase } from "../utils/utils"
import { URL } from "../utils/constants"
import Link from "next/link"

export interface Tweet {
    id: number
    created: string
    body: string
    likes_count: number
    replies_count: number
    current_user_like_id: number
    user: User
}

export interface TweetApiResponse {
    count: number
    previous: string | null
    next: string | null
    results: Array<Tweet>
}

interface ITweetTemplateProps {
    data: Tweet
    onSubmit?: (tweet: Tweet) => void
    alwaysShowReplyForm?: boolean

}


export default function TweetTemplate({ data, onSubmit, alwaysShowReplyForm = false }: ITweetTemplateProps) {
    const { getToken } = useAuth();
    const [likesCount, setLikesCount] = useState(data.likes_count);
    const [currentUserLikeId, setCurrentUserLikeId] = useState(data.current_user_like_id);
    const [isReplying, setIsReplying] = useState(alwaysShowReplyForm);
    const [repliesCount, setRepliesCount] = useState(data.replies_count);
    const [tweet, setTweet] = useState(data.body);

    useEffect(() => {
        setLikesCount(data.likes_count);
        setCurrentUserLikeId(data.current_user_like_id);
        setIsReplying(alwaysShowReplyForm);
        setRepliesCount(data.replies_count);
        setTweet(data.body);
    }, [data]);

    const likeTweet = async () => {
        if (!getToken) return;
        const token = await getToken();

        const resp = await fetch(`${getApiBase()}/tweet-likes/`, {
            method: 'POST',
            body: JSON.stringify({ tweet: data.id }),
            headers: {
                "Content-Type": 'application/json',
                "Authorization": `Bearer ${token}`
            },
        })
        if (resp.ok) {
            const likeData = await resp.json();
            setLikesCount(likesCount + 1);
            setCurrentUserLikeId(likeData.id);
        }
    }

    const unlikeTweet = async () => {
        if (!getToken) return;
        const token = await getToken();

        const resp = await fetch(`${getApiBase()}/tweet-likes/${currentUserLikeId}/`, {
            method: 'DELETE',
            headers: { "Authorization": `Bearer ${token}` },
        })

        if (resp.ok) {
            setLikesCount(likesCount - 1);
            setCurrentUserLikeId(0);
        }
    }

    const handleLikeClick = () => {
        currentUserLikeId === 0 ? likeTweet() : unlikeTweet();
    }


    const handleCommentClick = () => {
        if (alwaysShowReplyForm) return;
        setIsReplying(!isReplying);
    }

    const handleTweetReply = (tweet: Tweet) => {
        setRepliesCount(repliesCount + 1);
        if (!alwaysShowReplyForm) setIsReplying(false);
        if (onSubmit) onSubmit(tweet);
    }

    const handleTweetClick = (e: React.MouseEvent<HTMLElement>) => {
        Router.push(URL.TWEET_URL(data.id));
    }

    return (
        <div className="relative hover:bg-gray-300 cursor-pointer bg-white p-4 shadow-sm rounded-sm [&_form]:relative [&_button]:relative [&_a]:relative">
            <div className="absolute top-0 bottom-0 left-0 right-0" onClick={handleTweetClick}></div>
            <div className="items-center inline-flex">
                <Link href={URL.PROFILE_URL(data.user.username)}>
                    <Avatar user={data.user} className="inline h-14 w-14 rounded-full hover:ring-1" />
                </Link>
                <div className="ml-3">
                    <Link href={URL.PROFILE_URL(data.user.username)}>
                        <h1 className="font-bold hover:text-gray-600">
                            {data.user.name}
                        </h1>
                    </Link>
                    <Link href={URL.PROFILE_URL(data.user.username)} className="text-opacity-60 text-black hover:text-opacity-40">
                        @{data.user.username}
                    </Link>
                </div>
            </div>
            <p className="font-medium text-lg my-2 cursor-pointer select-none">{data.body}</p>
            <span className="text-opacity-60 text-black text-sm ">
                {dayjs(data.created).tz(data.user.timezone || 'UTC').format('hh:mm A MMM DD, YYYY')}
            </span>
            <div className="flex gap-6 align-middle">
                {
                    currentUserLikeId === 0
                        ?
                        <button onClick={handleLikeClick} className="h-5 text-sm flex align-middle gap-1 text-opacity-60 text-black hover:text-opacity-40">
                            <HeartIconOutline className="h-full" /> {likesCount}
                        </button>
                        :
                        <button onClick={handleLikeClick} className="h-5 text-sm flex align-middle gap-1 text-red-600 hover:text-red-800">
                            <HeartIconSolid className="h-full" /> {likesCount}
                        </button>
                }
                {
                    isReplying ?
                        <button onClick={handleCommentClick} className="h-5 text-sm flex align-middle gap-1 text-blue-700 hover:text-blue-900">
                            <ChatBubbleLeftIconSolid className="h-full" /> {repliesCount}
                        </button>
                        :
                        <button onClick={handleCommentClick} className="h-5 text-sm flex align-middle gap-1 text-opacity-60 text-black hover:text-opacity-40">
                            <ChatBubbleLeftIconOutline className="h-full" /> {repliesCount}
                        </button>
                }
            </div>
            {
                isReplying &&
                <NewTweetForm
                    buttonText="Reply"
                    placeholderText="Tweet your reply"
                    className="mt-4 mb-0"
                    parent={data.id}
                    onSubmit={handleTweetReply}
                />
            }
        </div>
    )
}
