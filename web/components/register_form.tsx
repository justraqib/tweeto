import dayjs from 'dayjs';
import FormInput from './form_input';
import Link from 'next/link';
import Router from 'next/router';
import React, { useEffect, useState } from "react";
import { getApiBase } from '../utils/utils';
import { URL } from "../utils/constants";
import { useAuth } from '../contexts/auth';


interface IFormData {
    first_name?: string,
    last_name?: string,
    email?: string,
    username?: string,
    password?: string,
    timezone?: string,
}

interface IFormErrors {
    [key: string]: Array<string> | string,
}



export default function RegisterForm() {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<IFormData>({});
    const [formErrors, setFormErrors] = useState<IFormErrors>({});

    useEffect(() => {
        setFormData({
            ...formData,
            timezone: dayjs.tz.guess()
        });
    }, [])

    const updateFormData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    const initLogin = async () => {
        const { username, password } = formData;

        if (!username || !password || !login) {
            return;
        }

        const resp = await login(username, password);
        if (resp.ok) Router.push("/");
    }

    const handleSubmit = async (e: React.FormEvent) => {
        setLoading(true);
        e.preventDefault();

        const resp = await fetch(`${getApiBase()}/users/`, {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: { "Content-Type": 'application/json' },
        });
        setLoading(false);

        if (resp.ok) {
            initLogin();
        } else if (resp.status == 400) {
            const errors = await resp.json();
            setFormErrors(errors);
        }
    }

    const getErrorMessage = (field_name: string): string | null => {
        if (field_name in formErrors) {
            const error = formErrors[field_name];
            return (typeof error === 'string') ? error : error[0];
        }
        return null;
    }

    return (
        <div className="relative flex flex-col justify-center min-h-screen overflow-hidden">
            <div className="flex justify-center flex-col w-3/4 px-6 py-3 m-auto bg-white border-t border-purple-600 rounded shadow-lg shadow-purple-800/50 lg:max-w-md">
                <img className="w-16 h-16 m-auto" src="/logo.svg" alt="" />
                <h1 className="text-xl my-5 font-bold text-gray-900 text-center mt-2">Sign up for an account</h1>
                <form method="POST" onSubmit={handleSubmit}>
                    <div className='flex gap-4'>
                        <div>
                            <FormInput label="First Name" name="first_name" onChange={updateFormData} errorMessage={getErrorMessage('first_name')} />
                        </div>
                        <div>
                            <FormInput label="Last Name" name="last_name" onChange={updateFormData} errorMessage={getErrorMessage('last_name')} />
                        </div>
                    </div>
                    <FormInput label="Email" name="email" type="email" required={true} onChange={updateFormData} errorMessage={getErrorMessage('email')} />

                    <FormInput label="Username" name="username" required={true} onChange={updateFormData} errorMessage={getErrorMessage('username')} />

                    <FormInput label="Password" name="password" type="password" required={true} onChange={updateFormData} errorMessage={getErrorMessage('password')} />

                    <div style={{ color: 'red' }}>
                        {getErrorMessage('detail')}
                    </div>

                    <button className="w-full font-extrabold text-lg text-white bg-purple-600 hover:bg-purple-900 focus:outline-none rounded-lg px-5 py-2.5 text-center" type='submit' disabled={loading}>Register</button>
                </form>
                <div className="flex mt-2">
                    <p className="font-light to-gray-500">Already have an account?&nbsp;</p>
                    <Link className="font-medium hover:underline text-purple-700" href={URL.LOGIN_URL}>Sign in</Link>
                </div>
            </div>
        </div>
    )
}