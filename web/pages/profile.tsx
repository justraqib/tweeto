import { useEffect, useState } from 'react';
import Head from 'next/head'

export default function Home() {
    const [username, setUsername] = useState("");

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    useEffect(() => {
        const access_token = getCookie("access");
        fetch('http://0.0.0.0:8000/users/me/', {
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        })
            .then((res) => res.json())
            .then((data) => {
                setUsername(data.username);
            })
    }, []);

    return (
        <>
            <Head>
                <title>Homepage</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>Hello <strong>{username}</strong></main>
        </>
    )
}
