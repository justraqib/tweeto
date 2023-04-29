import Head from 'next/head'
import Nav from '../components/nav';
import NewTweetForm from '../components/new_tweet_form';
import { useAuth } from '../utils/auth';

export default function Home() {
  const { loading, user } = useAuth();

  return (
    <>
      <Head>
        <title>Homepage</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <Nav />
      <main>
        {
          !loading &&
          (user ?
            <div className='p-4'>
              <NewTweetForm />
            </div>
            :
            `I don't know you. Please login :(`
          )
        }
      </main>
    </>
  )
}
