import Head from 'next/head'
import { useAuth } from '../utils/auth';

export default function Home() {
  const { loading, user } = useAuth();

  return (
    <>
      <Head>
        <title>Homepage</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {
          !loading &&
          (user ?
            `Hello ${user.name} (${user.username})`
            :
            `I don't know you. Please login :(`
          )
        }
      </main>
    </>
  )
}
