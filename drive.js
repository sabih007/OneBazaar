const { chromium } = require("playwright");

async function main() {
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(String(err)));

  const shots = "C:\\Users\\SABIHU~1\\AppData\\Local\\Temp\\claude\\C--Users-Sabih-Ul-Ebad-Khan-Desktop-OneBazaar\\38b7de12-31ce-480f-8e7c-24b651bed0c0\\scratchpad\\";

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForSelector("text=Browse categories");
  await page.screenshot({ path: shots + "1-home.png", fullPage: true });

  await page.click('a[href="/signup"]');
  await page.waitForSelector("text=Create an account");
  await page.screenshot({ path: shots + "2-signup.png", fullPage: true });

  await page.goto("http://localhost:3000/vehicles/lahore", { waitUntil: "networkidle" });
  await page.waitForSelector("text=Vehicles in Lahore");
  await page.screenshot({ path: shots + "3-browse.png", fullPage: true });

  await page.goto("http://localhost:3000/post", { waitUntil: "networkidle" });
  await page.waitForSelector("body");
  await page.screenshot({ path: shots + "4-post.png", fullPage: true });

  console.log("ERRORS:", JSON.stringify(errors));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
