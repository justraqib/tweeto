import React, { useState } from 'react';
import FormInput from '../components/form_input';
import { useAuth } from '../utils/auth';
import Router from 'next/router';
import MyHead from '../components/head';

interface IFormData {
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

    const handleSubmit = async (e: React.FormEvent) => {
        setLoading(true);
        e.preventDefault();

        const { username, password } = formData;
        if (!username || !password || !login) {
            return;
        }

        const resp = await login(username, password);
        setLoading(false);

        if (resp.ok) {
            Router.push("/");
        } else {
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
            <MyHead title="Login" />

            <form method="POST" onSubmit={handleSubmit}>
                <FormInput label="Username" name="username" required={true} onChange={updateFormData} errorMessage={getErrorMessage('username')} />

                <FormInput label="Password" name="password" type="password" required={true} onChange={updateFormData} errorMessage={getErrorMessage('password')} />

                <div style={{ color: 'red' }}>
                    {getErrorMessage('detail')}
                </div>

                <button type='submit' disabled={loading}>Login</button>
            </form>
        </>
    )
}
