// node 1_HackerrankAutomation.js --url=https://www.hackerrank.com --config=config.json 
// npm init -y
// npm install minimist
// npm install puppeteer 

let minimist = require("minimist");
let puppeteer = require("puppeteer");
let fs = require("fs");
const { cachedDataVersionTag } = require("v8");
let args = minimist(process.argv);

let configJSON = fs.readFileSync(args.config, "utf-8");
let configJSO = JSON.parse(configJSON);

async function run() {
    // To open the browser
    let browser = await puppeteer.launch({
        headless: false,
        args: [
            '--start-maximized'
        ],
        defaultViewport: null
    });

    // We are getting all the tabs , here the nuber of tabs in initial stage is 1
    let pages = await browser.pages();
    let page = pages[0];

    // Open the url
    await page.goto(args.url);

    //  Wait till the contents gets loaded of the selected attribute and then click on login on page1 
    await page.waitForSelector("a[data-event-action='Login']");
    await page.click("a[data-event-action='Login']");

    // Wait till the contents gets loaded of the selected attribute and then click on login on page2 (login for developers)
    await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
    await page.click("a[href='https://www.hackerrank.com/login']");

    // Typing the user id in login page
    await page.waitForSelector("input[name='username']");
    await page.type("input[name='username']", configJSO.userid, { delay: 20 });

    // Typing the password in login page
    await page.waitForSelector("input[name='password']");
    await page.type("input[name='password']", configJSO.password, { delay: 20 });

    // Waiting on the page for 6 seconds so all the contents of the page gets loaded 
    await page.waitFor(6000);

    // Press click on page3
    await page.waitForSelector("button[data-analytics='LoginPassword']");
    await page.click("button[data-analytics='LoginPassword']");

    // Click on compete
    await page.waitForSelector("a[data-analytics='NavBarContests']");
    await page.click("a[data-analytics='NavBarContests']");

    // Click on manage contests
    await page.waitForSelector("a[href='/administration/contests/']");
    await page.click("a[href='/administration/contests/']");


    // Finding the number of pages

    // Exception for handling if the total number of pages is only 1
    try{
        await page.waitForSelector("a[data-attr1='Last']", {timeout: 5000});
        let Hackerrankpages = await page.$eval("a[data-attr1='Last']", function (atag) {
            let totalPages = parseInt(atag.getAttribute("data-page"));
            return totalPages;
        });
    }
    catch(e){
        Hackerrankpages = 1;
    }

    for (let i = 1; i <= Hackerrankpages; i++) {
        await handleAllContestsOfAPage(page, browser);

        if (i != numPages) {
            await page.waitForSelector("a[data-attr1='Right']");
            await page.click("a[data-attr1='Right']");
        }
    }
}
//$$ eval behaves like document selector all which selects all those  boxes of the given attribute 
async function handleAllContestsOfAPage(page, browser) {
    // Finding all the urls of the same page
    await page.waitForSelector("a.backbone.block-center");
    let curls = await page.$$eval("a.backbone.block-center", function (atags) {
        let urls = [];

        for (let i = 0; i < atags.length; i++) {
            let url = atags[i].getAttribute("href");
            urls.push(url);
        }

        return urls;
    });

    for (let i = 0; i < curls.length; i++) {
        let ntab = await browser.newPage();
        await saveModeratorInContest(ntab, args.url + curls[i], configJSO.moderator);
        await ntab.close();
        await page.waitFor(3000);
    }
}

async function saveModeratorInContest(ntab, fullCurl, moderator) {
    await ntab.bringToFront();
    await ntab.goto(fullCurl);
    await ntab.waitFor(3000);

    // Clicking on the moderators icon
    await ntab.waitForSelector("li[data-tab='moderators']");
    await ntab.click("li[data-tab='moderators']");

    // Typing the moderator name using jso 
    await ntab.waitForSelector("input#moderator");
    await ntab.type("input#moderator", moderator, { delay: 50 });

    // Pressing Enter 
    await ntab.keyboard.press("Enter");
}
run();