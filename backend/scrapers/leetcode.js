import axios from "axios";
import { load } from "cheerio";

export async function fetchLeetcodeContests() {
    try {
        const url = "https://leetcode.com/contest/";
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const $ = load(data);
        let contests = [];

        $(".swiper-slide").each((_, element) => {
            const name = $(element).find(".truncate span").text().trim();
            const link = "https://leetcode.com" + $(element).find("a").attr("href");
            const startTime = $(element).find(".text-label-2").text().trim();

            if (name && link && startTime) {
                contests.push({
                    name,
                    platform: "Leetcode",
                    start_time: startTime,
                    url: link,
                });
            }
        });

        return contests;
    } catch (error) {
        console.error("Error fetching Leetcode contests:", error);
        return [];
    }
}
