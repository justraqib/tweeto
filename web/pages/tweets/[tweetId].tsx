import { GetServerSideProps } from "next";
import { useState } from "react";
import MyHead from "../../components/head";
import Nav from "../../components/nav";
import TweetTemplate, { Tweet } from "../../components/tweet_template";
import { getApiBase } from "../../utils/utils";


export const getServerSideProps: GetServerSideProps = async (context) => {
    const { tweetId } = context.query;
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


    const tweetResp = await fetch(`${getApiBase()}/tweets/${tweetId}/`, {
        headers: { "Authorization": `Bearer ${accessToken}` }
    });
    const tweetRepliesResp = await fetch(`${getApiBase()}/tweets/?parent=${tweetId}&order_by=created`);

    return {
        props: {
            tweet: await tweetResp.json(),
            tweetReplies: await tweetRepliesResp.json(),
        }
    }
}


interface ITweetDetailProps {
    tweet: Tweet
    tweetReplies: Array<Tweet>
}

export default function TweetDetail({ tweet, tweetReplies }: ITweetDetailProps) {
    const [allTweetReplies, setAllTweetReplies] = useState(tweetReplies);

    const handleTweetReply = (tweet: Tweet) => {
        setAllTweetReplies([...allTweetReplies, tweet]);
    }

    return (
        <>
            <MyHead title="View tweet" />
            <Nav />
            <main className="flex flex-col md:flex-row gap-4 mx-auto max-w-7xl my-4 px-2 sm:px-6 lg:px-8">
                <div className="w-full md:w-1/3">
                    <TweetTemplate data={tweet} onSubmit={handleTweetReply} alwaysShowReplyForm={true} />
                </div>
                <div className="w-full md:w-2/3 flex flex-col">
                    {allTweetReplies.map(tweet => <TweetTemplate key={tweet.id} data={tweet} />)}
                </div>
            </main>
        </>
    )
}
