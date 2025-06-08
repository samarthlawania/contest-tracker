import fetch from 'node-fetch';

export async function fetchCodeChefContests() {
    const response = await fetch('https://codechef-api.vercel.app)');
    const contests = await response.json();
    return contests.map(contest => ({
        name: contest.name,
        platform: 'CodeChef',
        url: contest.url,
        startTime: new Date(contest.start_time),
        endTime: new Date(contest.end_time),
        status: new Date(contest.start_time) > new Date() ? 'upcoming' : 'past',
    }));
}
