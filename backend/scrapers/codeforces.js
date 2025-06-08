import fetch from 'node-fetch';

export async function fetchCodeforcesContests() {
    const response = await fetch('https://codeforces.com/api/contest.list');
    const data = await response.json();
    if (data.status === 'OK') {
        return data.result.map(contest => ({
            name: contest.name,
            platform: 'Codeforces',
            url: `https://codeforces.com/contests/${contest.id}`,
            startTime: new Date(contest.startTimeSeconds * 1000),
            endTime: new Date((contest.startTimeSeconds + contest.durationSeconds) * 1000),
            status: contest.phase === 'BEFORE' ? 'upcoming' : 'past',
        }));
    }
    return [];
}
