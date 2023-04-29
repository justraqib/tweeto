import { GetServerSideProps } from 'next';
import { useState } from 'react';
import MyHead from '../components/head';
import Nav from '../components/nav';
import NewTweetForm from '../components/new_tweet_form';
import TweetTemplate, { Tweet } from '../components/tweet_template';
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
  tweetsData: {
    count: number
    previous: string | null
    next: string | null
    results: Array<Tweet>
  }
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
    console.log(options)
    const resp = await fetch(nextUrlFinal, options);
    if (resp.ok) {
      const respData = await resp.json();
      setNextUrl(respData.next);
      setAllTweetsList([...allTweetsList, ...respData.results]);
    } else {
      console.error("Unable to fetch more tweets!");
    }
  }

  return (
    <>
      <MyHead title='Homepage' />

      <Nav redirectOnLogout={URL.LOGIN_URL} />
      <main className="flex flex-col md:flex-row gap-4 mx-auto max-w-7xl my-4 px-2 sm:px-6 lg:px-8">
        <div className="w-full md:w-1/3">
          <NewTweetForm onSubmit={handleNewTweet} />
        </div>
        <div className="w-full md:w-2/3 flex flex-col gap-4">
          {allTweetsList.map(tweet => <TweetTemplate key={tweet.id} data={tweet} />)}
          { nextUrl && <button className='bg-blue-400 px-2 py-4' onClick={handleLoadMore}>Load more</button> }
        </div>
      </main>
    </>
  )
}
