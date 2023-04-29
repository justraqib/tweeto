export class URL {
    static LOGIN_URL = '/login';
    static REGISTER_URL = '/register';
    static PROFILE_URL = (username: string) => `/${username}`;
    static TWEET_URL = (tweetId: number) => `/tweets/${tweetId}`;
}
