import { useEffect, useState } from 'react'
import Head from 'next/head'
import Router from 'next/router';
import { useAuth } from '../utils/auth';

export default function Login() {
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const { login, user } = useAuth();

    const handleUsernameInput = (e) => {
        setUsername(e.target.value);
    }

    const handlePasswordInput = (e) => {
        setPassword(e.target.value);
    }

    const handleLoginBtnClick = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            window.alert("Please enter both username and password");
            return;
        }
        if (!login) return;

        const resp = await login(username, password);
        if (resp.ok) {
            Router.push("/");
        } else {
            // TODO: handle login errors
        }
    }

    return (
        <>
            <Head>
                <title>Login</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            {user && <h1>Hello {user.name} ({user.username})</h1>}

            <form method="POST">
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" onChange={handleUsernameInput} />
                <br />

                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" onChange={handlePasswordInput} />
                <br />

                <button type='submit' onClick={handleLoginBtnClick}>Login</button>
            </form>
        </>
    )
}
