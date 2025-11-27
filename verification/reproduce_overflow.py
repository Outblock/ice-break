
import asyncio
from playwright.async_api import async_playwright, expect

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        try:
            # Wait for server to start
            await page.goto("http://localhost:3000")

            # Wait for card to be ready
            card = page.locator("#card1")
            await expect(card).to_be_visible()

            # Change text to long text
            # We target the .q-en and .q-cn divs inside card1
            await page.evaluate("""() => {
                const qEn = document.querySelector('#card1 .q-en');
                const qCn = document.querySelector('#card1 .q-cn');
                if (qEn) qEn.innerText = "If you could automate one part of your life, what would it be? Maybe verify frontend automatically?";
                if (qCn) qCn.innerText = "如果能自动化你生活的一部分，你会选什么？也许是自动验证前端？";
            }""")

            # Allow a moment for rendering/reflow
            await page.wait_for_timeout(500)

            # Get computed height of question-screen
            screen = page.locator(".question-screen")
            height = await screen.evaluate("el => getComputedStyle(el).height")
            print(f"Question screen height: {height}")

            # Take screenshot
            await screen.screenshot(path="verification/screenshot_overflow_fixed.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
