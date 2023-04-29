import { GetServerSideProps } from 'next';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useState } from 'react';
import MyHead from '../components/head';
import Nav from '../components/nav';
import NewTweetForm from '../components/new_tweet_form';
import TweetTemplate, { Tweet, TweetApiResponse } from '../components/tweet_template';
import { useAuth } from '../contexts/auth';
import { URL } from '../utils/constants';
import { getApiBase } from '../utils/utils';


export const getServerSideProps: GetServerSideProps = async (context) => {
  const anonymousUserProps = {
    redirect: {
      permanent: false,
      destination: URL.REGISTER_URL,
    }
  }

  if (!context.req.cookies["refresh_token"]) return anonymousUserProps;

  const tokenResponse = await fetch(`${getApiBase()}/token/refresh/`, {
    method: 'POST',
    headers: { "Cookie": context.req.headers.cookie || "" },
  })
  if (!tokenResponse.ok) return anonymousUserProps;

  const { access } = await tokenResponse.json();
  const userDataResp = await fetch(`${getApiBase()}/users/me/`, { headers: { "Authorization": `Bearer ${access}` } });
  if (!userDataResp.ok) return anonymousUserProps;

  const userData = await userDataResp.json();
  const resp = await fetch(`${getApiBase()}/tweets/?parent__isnull=true&user__followed_by__user__username=${userData.username}&order_by=-created`, { headers: { "Authorization": `Bearer ${access}` } });
  if (resp.ok) {
    return {
      props: {
        user: userData,
        tweetsData: await resp.json(),
      },
    }
  }
  throw new Error('Internal Server Error');
}

interface IHomeProps {
  tweetsData: TweetApiResponse
}

export default function Home({ tweetsData }: IHomeProps) {
  const [allTweetsList, setAllTweetsList] = useState(tweetsData.results);
  const [nextUrl, setNextUrl] = useState(tweetsData.next)
  const { getToken } = useAuth();

  const handleNewTweet = (tweet: Tweet) => {
    setAllTweetsList([tweet, ...allTweetsList]);
  }

  const handleLoadMore = async () => {
    if (!nextUrl) return;
    const nextPath = nextUrl.split("/api/")[1];
    const nextUrlFinal = `${getApiBase()}/${nextPath}`;
    const options = getToken ? { headers: { "Authorization": `Bearer ${await getToken()}` } } : {};
    const resp = await fetch(nextUrlFinal, options);
    if (resp.ok) {
      const respData = await resp.json();
      setNextUrl(respData.next);
      setAllTweetsList([...allTweetsList, ...respData.results]);
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
      <MyHead title='Homepage' />

      <Nav redirectOnLogout={URL.LOGIN_URL} />
      <main className="flex flex-col md:flex-row gap-4 mx-auto max-w-7xl my-4 px-2 sm:px-6 lg:px-8">
        <div className="w-full md:w-1/3">
          <NewTweetForm onSubmit={handleNewTweet} />
        </div>


        <div className="w-full md:w-2/3 flex flex-col gap-4 overflow-y-hidden">
          <InfiniteScroll
            style={{overflow: "hidden"}}
            dataLength={allTweetsList.length}
            next={handleLoadMore}
            hasMore={nextUrl !== null}
            loader={loader}
            endMessage={
              <p style={{ textAlign: 'center' }}>
                <b>Yay! You have seen it all</b>
              </p>
            }
          >
            {allTweetsList.map(tweet => <TweetTemplate key={tweet.id} data={tweet} />)}
          </InfiniteScroll>
        </div>
      </main>
    </>
  )
}
