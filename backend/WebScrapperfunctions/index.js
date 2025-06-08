import puppeteer from 'puppeteer';


export async function WebScrapper(platformName) {
    if (platformName == 'Leetcode') {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://leetcode.com/contest/', { waitUntil: 'networkidle2' });

        const data = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('[class="swiper-wrapper"]')).map((el) => {
                const name = el.textContent.trim();
                const link = el.closest('a')?.href;
                return { name, link };
            });
        });

        console.log(data);
        await browser.close();
    }
}