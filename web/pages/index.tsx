import { GetServerSideProps } from 'next';
import { useState } from 'react';
import MyHead from '../components/head';
import Nav from '../components/nav';
import NewTweetForm from '../components/new_tweet_form';
import TweetTemplate, { Tweet } from '../components/tweet';
import { User } from '../contexts/auth';
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
  const resp = await fetch(`${getApiBase()}/tweets/?user__followed_by__user__username=${userData.username}&order_by=-created`);
  if (resp.ok) {
    return {
      props: {
        user: userData,
        tweetsList: await resp.json(),
      },
    }
  }

  throw new Error('Internal Server Error');
}

interface IHomeProps {
  tweetsList: Array<Tweet>
}

export default function Home({ tweetsList }: IHomeProps) {
  const [allTweetsList, setAllTweetsList] = useState(tweetsList);

  const handleNewTweet = (tweet: Tweet) => {
    setAllTweetsList([tweet, ...allTweetsList]);
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
          {allTweetsList.map(tweet => <TweetTemplate data={tweet} />)}
        </div>
      </main>
    </>
  )
}
