import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import fetch from 'node-fetch';
import puppeteer from 'puppeteer';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

const app = express();

app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Contest Schema
const contestSchema = new mongoose.Schema({
    name: String,
    platform: String,
    url: String,
    startTime: Date,
    endTime: Date,
    status: String,
    solutionLink: String,
});

const Contest = mongoose.model('Contest', contestSchema);

// 📌 Fetch Codeforces Contests
async function fetchCodeforcesContests() {
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

// 📌 Fetch CodeChef Contests
async function fetchCodeChefContests() {
    const response = await fetch('https://kontests.net/api/v1/code_chef');
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

// 📌 Fetch Leetcode Contests using Puppeteer
async function fetchLeetcodeContests() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://leetcode.com/contest/');
    
    const contests = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.contest-card')).map(card => ({
            name: card.querySelector('.text-label-1').innerText,
            platform: 'Leetcode',
            url: `https://leetcode.com${card.querySelector('a').getAttribute('href')}`,
            startTime: new Date(card.querySelector('.text-label-2').innerText),
            status: new Date(card.querySelector('.text-label-2').innerText) > new Date() ? 'upcoming' : 'past',
        }));
    });

    await browser.close();
    return contests;
}

// 📌 Fetch All Contests
async function fetchAllContests() {
    const cfContests = await fetchCodeforcesContests();
    const ccContests = await fetchCodeChefContests();
    const lcContests = await fetchLeetcodeContests();

    const allContests = [...cfContests, ...ccContests, ...lcContests];

    // Save to MongoDB
    await Contest.insertMany(allContests, { ordered: false }).catch(err => console.log(err));

    console.log('Contests updated');
}

// Run the function periodically (every 6 hours)
cron.schedule('0 */6 * * *', fetchAllContests);

// 📌 API Routes
app.get('/contests', async (req, res) => {
    try {
        const platform = req.query.platform?.replace(/\/$/, '');
        console.log("Filtered Platform:", platform);

        let contests;

        if (platform) {
            // **Fetch new contests when a user requests them**
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
            // Fetch all contests from the database if no platform is specified
            contests = await Contest.find({});
        }

        res.json(contests);
    } catch (error) {
        console.error("Error Fetching Contests:", error);
        res.status(500).json({ error: 'Server Error' });
    }
});



app.post('/solutions', async (req, res) => {
    try {
        const { contestId, solutionLink } = req.body;
        await Contest.findByIdAndUpdate(contestId, { solutionLink });
        res.json({ message: 'Solution added' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update solution link' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
