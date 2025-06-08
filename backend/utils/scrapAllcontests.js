import { fetchCodeforcesContests } from '../scrapers/codeforces.js';
import { fetchCodeChefContests } from '../scrapers/codechef.js';
import { fetchLeetcodeContests } from '../scrapers/leetcode.js';
import Contest from '../models/contest.js';

export async function fetchAllContests() {
    const cfContests = await fetchCodeforcesContests();
    const ccContests = await fetchCodeChefContests();
    const lcContests = await fetchLeetcodeContests();

    const allContests = [...cfContests, ...ccContests, ...lcContests];

    await Contest.insertMany(allContests, { ordered: false }).catch(err => console.log(err));
    console.log('Contests updated');
}
