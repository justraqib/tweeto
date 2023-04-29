import { MapPinIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import Avatar from "../components/avatar";
import Nav from "../components/nav";
import MyHead from "../components/head";
import { User } from "../contexts/auth";
import { getApiBase } from "../utils/utils";
import { GetServerSideProps } from "next";

interface IUserProfileProps {
    userData: User
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { username } = context.query;
    const resp = await fetch(`${getApiBase()}/users/${username}/`);

    if (resp.ok) {
        return {
            props: {
                userData: await resp.json()
            },
        }
    }

    if (resp.status === 404) {
        return {
            notFound: true,
        }
    }

    throw new Error('Internal Server Error');
}


export default function UserProfile({ userData }: IUserProfileProps) {
    const getMonthYear = (date: string): string => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { year: "numeric", month: "long" });;
    }

    return (
        <>
            <MyHead title={`${userData.username}'s profile`} />
            <Nav />
            {
                userData &&
                <main className="flex flex-col md:flex-row gap-4 mx-auto max-w-7xl my-4 px-2 sm:px-6 lg:px-8">
                    <div className="w-full md:w-1/3">
                        <div className="bg-white p-4 shadow-sm rounded-sm relative">
                            <Avatar user={userData} className="h-32 w-32 rounded-full mx-auto" />
                            <h1 className="mt-5 font-bold">{userData.name}</h1>
                            <span className="text-opacity-60 text-black">@{userData.username}</span>
                            <p className="mt-4">{userData.about}</p>
                            <div className="flex gap-3 mt-4 text-opacity-60 text-black">
                                <span className="flex items-center gap-1">
                                    <MapPinIcon className="h-5 w-5 -m-1" />
                                    <span>{userData.location}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <CalendarDaysIcon className="h-5 w-5" />
                                    <span>Joined {getMonthYear(userData.date_joined)}</span>
                                </span>
                            </div>
                            {/* <div className="flex gap-3 mt-4">
                                <span className="flex items-center gap-1">
                                    <span className="font-semibold">0</span>
                                    <span className="text-black text-opacity-60">Following</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="font-semibold">0</span>
                                    <span className="text-black text-opacity-60">Followers</span>
                                </span>
                            </div> */}
                        </div>
                    </div>
                    <div className="w-full md:w-2/3">
                    </div>
                </main>
            }
        </>
    )
}
