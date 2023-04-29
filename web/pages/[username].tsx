import { MapPinIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router"
import { useEffect, useState } from "react";
import Avatar from "../components/avatar";
import Nav from "../components/nav";
import { User } from "../utils/auth";
import { API_BASE } from "../utils/config";

export default function UserProfile() {
    const router = useRouter()
    const { username } = router.query
    const [userData, setUserData] = useState<User | null>(null)

    const fetchUserDetails = async () => {
        const resp = await fetch(`${API_BASE}/users/${username}/`);
        if (resp.ok) {
            const data = await resp.json();
            setUserData(data);
        }
    }

    const getMonthYear = (date: string): string => {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {year:"numeric", month:"long"});;
    }

    useEffect(() => {
        username && fetchUserDetails();
    }, [username]);

    return (
        <>
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
