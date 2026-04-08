import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--ignore-certificate-errors"])
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        await page.goto("https://localhost:8443/manual-trading")
        await page.wait_for_selector(".manual-trading", timeout=20000)
        await asyncio.sleep(3)

        # Take a screenshot of the trade panel with Account Selector
        await page.screenshot(path="/home/jules/verification/final_interface_with_account_selector.png")

        # Open the account selector
        try:
            await page.locator(".account-selector__display").click()
            await asyncio.sleep(1)
            await page.screenshot(path="/home/jules/verification/final_account_list.png")
        except:
            print("Account selector not found or not clickable (possibly not logged in)")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
