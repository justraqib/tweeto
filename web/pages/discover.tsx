import { GetServerSideProps } from "next";
import { useState } from "react";
import ContactCard from "../components/contact_card";
import MyHead from "../components/head";
import Nav from "../components/nav";
import { useAuth, User } from "../contexts/auth";
import { URL } from "../utils/constants";
import { getApiBase } from "../utils/utils";


export const getServerSideProps: GetServerSideProps = async (context) => {
    const anonymousUserProps = {
        redirect: {
            permanent: false,
            destination: URL.REGISTER_URL,
        }
    }
    if (!context.req.cookies["refresh_token"]) return anonymousUserProps;

    const tokenResponse = await fetch(`${getApiBase()}/token/refresh/`, {
        method: 'POST',
        headers: { "Cookie": context.req.headers.cookie || "" },
    })
    if (!tokenResponse.ok) return anonymousUserProps;

    const { access } = await tokenResponse.json();
    const currentUserData = await fetch(`${getApiBase()}/users/me/`, { headers: { "Authorization": `Bearer ${access}` } });
    if (!currentUserData.ok) return anonymousUserProps;
    const currentUser = await currentUserData.json();

    const allUsersListResp = await fetch(`${getApiBase()}/users/?username__not=${currentUser.username}`, { headers: { "Authorization": `Bearer ${access}` } });
    if (!allUsersListResp.ok) return anonymousUserProps;

    return {
        props: {
            currentUser: currentUser,
            allUsersList: await allUsersListResp.json()
        }
    }
}

interface IDiscoverProps {
    allUsersList: Array<User>
    currentUser: User
}

export default function Search({ allUsersList, currentUser }: IDiscoverProps) {
    const { getToken } = useAuth();
    const [usersList, setUsersList] = useState(allUsersList);

    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!getToken) {
            console.error("getToken is Undefined")
            return;
        }
        const value = e.target.value;
        if (value.length < 3) {
            setUsersList(allUsersList)
        };

        const token = await getToken();
        const resp = await fetch(`${getApiBase()}/users/?q=${value}&username__not=${currentUser.username}`, { headers: { "Authorization": `Bearer ${token}` } })
        if (resp.ok) {
            const userDataResp = await resp.json()
            setUsersList(userDataResp);
        }
    }

    return (
        <>
            <MyHead title="Discover" />
            <Nav redirectOnLogout={URL.LOGIN_URL} />
            <main className="flex flex-col md:flex-row gap-4 mx-auto max-w-7xl my-4 px-2 sm:px-6 lg:px-8">
                <div className="w-full md:w-1/3">
                    <div className="flex w-auto">
                        <button>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                                className="bg-white border border-gray-300 mt-1 rounded-l-md sm:text-sm h-10 w-9 pl-3 border-r-0">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </button>
                        <input className="block border border-gray-300 border-l-0 focus:outline-none mt-1 px-3 py-2 rounded-r-md sm:text-sm w-full" type="text" placeholder="Search" onChange={handleSearchChange} />
                    </div>
                </div>
                <div className=" md:w-2/3 grid sm:grid-cols-3 grid-cols-1 gap-8">
                    {usersList.map(data => <ContactCard data={data} />)}
                </div>
            </main>
        </>
    )
}