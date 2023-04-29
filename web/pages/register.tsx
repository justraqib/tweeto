import React, { useState } from 'react';
import { API_BASE } from '../utils/config';
import FormInput from '../components/form_input';
import { useAuth } from '../utils/auth';
import Router from 'next/router';
import MyHead from '../components/head';

interface IFormData {
    first_name?: string,
    last_name?: string,
    email?: string,
    username?: string,
    password?: string,
}

interface IFormErrors {
    [key: string]: Array<string> | string,
}

export default function Register() {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<IFormData>({});
    const [formErrors, setFormErrors] = useState<IFormErrors>({});

    const updateFormData = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    const initLogin = async () => {
        const {username, password} = formData;

        if (!username || !password || !login) {
            return;
        }

        const resp = await login(username, password);
        if (resp.ok) Router.push("/");
    }

    const handleSubmit = async (e: React.FormEvent) => {
        setLoading(true);
        e.preventDefault();

        const resp = await fetch(`${API_BASE}/users/`, {
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
        <>
            <MyHead title='Register'/>

            <form method="POST" onSubmit={handleSubmit}>
                <FormInput label="First Name" name="first_name" onChange={updateFormData} errorMessage={getErrorMessage('first_name')} />

                <FormInput label="Last Name" name="last_name" onChange={updateFormData} errorMessage={getErrorMessage('last_name')} />

                <FormInput label="Email" name="email" type="email" required={true} onChange={updateFormData} errorMessage={getErrorMessage('email')} />

                <FormInput label="Username" name="username" required={true} onChange={updateFormData} errorMessage={getErrorMessage('username')} />

                <FormInput label="Password" name="password" type="password" required={true} onChange={updateFormData} errorMessage={getErrorMessage('password')} />

                <div style={{ color: 'red' }}>
                    {getErrorMessage('detail')}
                </div>

                <button type='submit' disabled={loading}>Register</button>
            </form>
        </>
    )
}
