
import asyncio
from playwright.async_api import async_playwright, expect

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        try:
            # Wait for server to start
            await page.goto("http://localhost:3000")

            # Wait for the main container to be visible
            await expect(page.locator(".container")).to_be_visible()

            # Check font family of .q-en (English text)
            # We can't easily check computed style with expect, but we can screenshot.

            # Take a screenshot of the whole page
            await page.screenshot(path="verification/screenshot_full.png")

            # Take a screenshot of the container specifically to see padding
            container = page.locator(".container")
            await container.screenshot(path="verification/screenshot_container.png")

            # Take a screenshot of the English text
            q_en = page.locator(".q-en").first
            await q_en.screenshot(path="verification/screenshot_text.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
