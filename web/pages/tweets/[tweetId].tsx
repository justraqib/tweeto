import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import MyHead from "../../components/head";
import Nav from "../../components/nav";
import TweetTemplate, { Tweet, TweetApiResponse } from "../../components/tweet_template";
import { useAuth } from "../../contexts/auth";
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
    tweetReplies: TweetApiResponse
}

export default function TweetDetail({ tweet, tweetReplies }: ITweetDetailProps) {
    const [allTweetReplies, setAllTweetReplies] = useState(tweetReplies.results);
    const [nextUrl, setNextUrl] = useState(tweetReplies.next);
    const { getToken } = useAuth();

    useEffect(() => {
        setAllTweetReplies(tweetReplies.results);
    }, [tweetReplies]);

    const handleTweetReply = (tweet: Tweet) => {
        setAllTweetReplies([tweet, ...allTweetReplies]);
    }

    const handleLoadMore = async () => {
        if (!nextUrl) return
        const nextPath = nextUrl.split("/api/")[1];
        const nextUrlFinal = `${getApiBase()}/${nextPath}`;
        const options = getToken ? { headers: { "Authorization": `Bearer ${await getToken()}` } } : {};
        const resp = await fetch(nextUrlFinal, options);
        if (resp.ok) {
            const respData = await resp.json();
            setNextUrl(respData.next);
            setAllTweetReplies([...allTweetReplies, ...respData.results]);
        } else {
            console.error("Unable to fetch more tweets!");
        }
    }

    const loader = <div className="flex justify-center items-center">
    <svg className="animate-spin -ml-1 mr-3 h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>


    return (
        <>
            <MyHead title="View tweet" />
            <Nav />
            <main className="flex flex-col md:flex-row gap-4 mx-auto max-w-7xl my-4 px-2 sm:px-6 lg:px-8">
                <div className="w-full md:w-1/3">
                    <TweetTemplate data={tweet} onSubmit={handleTweetReply} alwaysShowReplyForm={true} />
                </div>
                <div className="w-full md:w-2/3 flex flex-col">
                    <InfiniteScroll
                    style={{overflow: "hidden"}}
                     dataLength={allTweetReplies.length}
                     next = {handleLoadMore}
                     hasMore = { nextUrl !== null}
                     loader = {loader}
                     endMessage = {<p style={{ textAlign: "center"}}>
                        <b>Yay! You have seen it all</b>
                     </p>}
                    >
                        {allTweetReplies.map(tweet => <TweetTemplate key={tweet.id} data={tweet} />)}
                    </InfiniteScroll>
                </div>
            </main>
        </>
    )
}
