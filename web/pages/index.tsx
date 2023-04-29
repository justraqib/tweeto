import { useEffect, useState } from 'react';
import Head from 'next/head'

export default function Home() {
  const [name, setName] = useState("");

  useEffect(() => {
    fetch('http://0.0.0.0:8000/test/')
      .then((res) => res.json())
      .then((data) => {
        setName(data["name"]);
      })
  }, []);

  return (
    <>
      <Head>
        <title>Homepage</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>Testing {name}</main>
    </>
  )
}
