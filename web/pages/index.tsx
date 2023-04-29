import MyHead from '../components/head';
import Nav from '../components/nav';
import NewTweetForm from '../components/new_tweet_form';
import { useAuth } from '../utils/auth';

export default function Home() {
  const { loading, user } = useAuth();

  return (
    <>
      <MyHead title='Homepage' />

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
