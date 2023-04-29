import Avatar from "./avatar"
import dayjs from "dayjs"

export interface Tweet {
    id: number,
    created: string,
    body: string,
    user: {
        id: number,
        name: string,
        email: string,
        about: string,
        location: string,
        timezone: string,
        avatar_url: null,
        date_joined: string,
        username: string,
        followers_count: number,
        following_count: number,
        current_user_follow_id: number,
    }
}

interface ITweetTemplateProps {
    data: Tweet
}


export default function TweetTemplate({ data }: ITweetTemplateProps) {
    return (
        <>
            <div className="bg-white p-4 shadow-sm rounded-sm relative">
                <div className="items-center flex">
                    <Avatar user={data.user} className="inline h-14 w-14 rounded-full" />
                    <div className="ml-3 in">
                        <h1 className="font-bold">
                            {data.user.name}
                        </h1>
                        <span className="text-opacity-60 text-black">
                            @{data.user.username}
                        </span>
                    </div>
                </div>
                <p className="font-medium text-lg my-2">{data.body}</p>
                <span className="text-opacity-60 text-black text-sm ">
                    {dayjs(data.created).tz(data.user.timezone || 'UTC').format('hh:mm A MMM DD, YYYY')}
                </span>
            </div>
        </>
    )
}