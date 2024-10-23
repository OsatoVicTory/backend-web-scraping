const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

exports.scrape = async (req, res) => {
    const { url, timeout } = req.body;
    try {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.58 Safari/537.36 Firefox/91.0");
    await page.setExtraHTTPHeaders({
        'accept-language': 'en-US,en;q=0.9',
        'referer': 'https://www.recaptcha.net/',
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7", 
        "Accept-Encoding": "gzip, deflate, br, zstd", 
        "Connection": "keep-alive",
        "Accept-Language": "en-US,en;q=0.9,ru;q=0.8", 
        "Sec-Ch-Ua": "\"Chromium\";v=\"130\", \"Google Chrome\";v=\"130\", \"Not?A_Brand\";v=\"99\"", 
        "Sec-Ch-Ua-Mobile": "?0", 
        "Sec-Ch-Ua-Platform": "\"Windows\"", 
        "Sec-Fetch-Dest": "document", 
        "Sec-Fetch-Mode": "navigate", 
        "Sec-Fetch-Site": "cross-site", 
        "Sec-Fetch-User": "?1", 
        "Upgrade-Insecure-Requests": "1",
    });

    await Promise.all([
        page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeout || 60000 }),
        page.waitForSelector('meta[property="og:description"]', { timeout: timeout || 60000 })
    ]);
    
    function parseImgUrl(URL) {
        if(!URL) return URL;
        if(['https', 'www'].find(site => URL.startsWith(site))) return URL;
        if(URL.startsWith('//')) return `https:${URL}`;
        return url+URL;
    };

    
    const html = await page.content();
    const $ = cheerio.load(html);
    const response = { title: url, pTag: url, img: url, site: url };

        
    const title = $('meta[property="og:title"]').attr('content');
    const pTag = $('meta[property="og:description"]').attr('content');
    response.title = title || url;
    response.pTag = pTag || url;
    response.img = parseImgUrl($('meta[property="og:image"]').attr('content'));
    response.site = $('meta[property="og:url"]').attr('content') || url;
    response.FOUND_DATA = title || pTag ? true : false;

    await browser.close();
    
    res.status(200).json(response);

    } catch (err) {
        console.log(err.message);
        res.status(500).json({ status: 'failed', message: err.message });
    }
};
