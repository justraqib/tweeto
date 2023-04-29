import { User } from "../utils/auth";

interface IAvatarProps {
    user: User,
    className?: string,
}

const Avatar = ({user, className}: IAvatarProps) => {
    const avatarUrl = user.avatar_url || `https://ui-avatars.com/api/?background=random&size=128&name=${user.username}`;

    return <img
        className={className}
        src={avatarUrl}
        alt={`${user.username}'s avatar`}
    />
}

export default Avatar;
