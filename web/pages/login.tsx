import { useState } from 'react'
import Head from 'next/head'
import Router from 'next/router';

export default function Home() {
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();

    const handleUsernameInput = (e) => {
        setUsername(e.target.value);
    }

    const handlePasswordInput = (e) => {
        setPassword(e.target.value);
    }

    const handleLoginBtnClick = (e) => {
        e.preventDefault();

        fetch('http://0.0.0.0:8000/api/token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'username': username,
                'password': password,
            })
        })
            .then((res) => res.json())
            .then((data) => {
                document.cookie = `access=${data.access}`;
                document.cookie = `refresh=${data.refresh}`;

                Router.push("/profile");
            })
    }

    return (
        <>
            <Head>
                <title>Login</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <form method="POST">
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" onChange={handleUsernameInput} />
                <br />

                <label htmlFor="password">Password</label>
                <input type="text" id="password" name="password" onChange={handlePasswordInput} />
                <br />

                <button type='submit' onClick={handleLoginBtnClick}>Login</button>
            </form>
        </>
    )
}
