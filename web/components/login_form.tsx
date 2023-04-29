import Link from "next/link";
import Router from "next/router";
import { useState } from "react";
import { useAuth } from "../contexts/auth";
import { URL } from "../utils/constants";
import FormInput from "./form_input";

interface IFormData {
    username?: string,
    password?: string,
}

interface IFormErrors {
    [key: string]: Array<string> | string,
}

export default function LoginForm() {
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
        <div className="relative flex flex-col justify-center min-h-screen overflow-hidden">
            <div className="flex justify-center flex-col w-3/4 p-6 m-auto bg-white border-t border-purple-600 rounded shadow-lg shadow-purple-800/50 lg:max-w-md">
                <img className="w-16 h-16 m-auto" src="/logo.svg" alt="" />
                <h1 className="text-xl my-5 font-bold text-gray-900 text-center mt-2">Sign in to your account</h1>
                <form method="POST" onSubmit={handleSubmit}>
                    <FormInput label="Username" name="username" required={true} onChange={updateFormData} errorMessage={getErrorMessage('username')} />
                    <FormInput label="Password" name="password" type="password" required={true} onChange={updateFormData} errorMessage={getErrorMessage('password')} />

                    <div style={{ color: 'red' }}>
                        {getErrorMessage('detail')}
                    </div>

                    <button className="w-full font-extrabold text-white bg-purple-600 hover:bg-purple-900 focus:outline-none rounded-lg px-5 py-2.5 text-center" type='submit' disabled={loading}>Login</button>
                </form>
                <div className="flex mt-4">
                    <p className="font-light to-gray-500">Don't have an account yet?&nbsp;</p>
                    <Link className="font-medium hover:underline text-purple-700" href={URL.REGISTER_URL}>Sign up</Link>
                </div>
            </div>
        </div>
    )
}