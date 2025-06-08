import express from 'express';
import Contest from '../models/contest.js';
import { fetchCodeforcesContests } from '../scrapers/codeforces.js';
import { fetchCodeChefContests } from '../scrapers/codechef.js';
import { fetchLeetcodeContests } from '../scrapers/leetcode.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const platform = req.query.platform?.replace(/\/$/, '');
        let contests;

        if (platform) {
            if (platform === 'Codeforces') {
                contests = await fetchCodeforcesContests();
            } else if (platform === 'CodeChef') {
                contests = await fetchCodeChefContests();
            } else if (platform === 'Leetcode') {
                contests = await fetchLeetcodeContests();
            } else {
                return res.status(400).json({ error: "Invalid platform" });
            }
        } else {
            contests = await Contest.find({});
        }

        res.json(contests);
    } catch (error) {
        console.error("Error Fetching Contests:", error);
        res.status(500).json({ error: 'Server Error' });
    }
});

router.post('/solutions', async (req, res) => {
    try {
        const { contestId, solutionLink } = req.body;
        await Contest.findByIdAndUpdate(contestId, { solutionLink });
        res.json({ message: 'Solution added' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update solution link' });
    }
});

export default router;
