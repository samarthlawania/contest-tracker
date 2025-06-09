import puppeteer from 'puppeteer';

export async function WebScrapper(platformName) {
    try {
        if (platformName === 'LEETCODE') {
            const browser = await puppeteer.launch({
                headless: false, // <- Run in non-headless mode
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled',
                ],
                defaultViewport: null,
            });

            const page = await browser.newPage();

            // Pretend to be a real browser
            await page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            );

            await page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US,en;q=0.9',
            });

            await page.goto('https://leetcode.com/contest/', {
                waitUntil: 'domcontentloaded',
            });

            // Wait for contests to appear
            await page.waitForSelector('.swiper-slide', { timeout: 10000 });

            const data = await page.evaluate(() => {
                const baseUrl = 'https://leetcode.com';
                return Array.from(document.querySelectorAll('.swiper-slide')).map((slide) => {
                    const name = slide.querySelector('.truncate')?.textContent.trim() || '';
                    const link = slide.querySelector('a')?.getAttribute('href') || null;
                    return {
                        name,
                        link: link ? baseUrl + link : null,
                    };
                });
            });

            console.log(data);
            await browser.close();
            return data;
        }
    } catch (e) {
        console.error('Scraping failed:', e.message);
    }
}
