
import asyncio
from playwright.async_api import async_playwright, expect

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # Mobile viewport
        page = await browser.new_page(viewport={"width": 390, "height": 844})
        try:
            # Wait for server to start
            await page.goto("http://localhost:3000")

            # Wait for card to be ready
            card = page.locator("#card1")
            await expect(card).to_be_visible()

            # Change text to long text
            await page.evaluate("""() => {
                const qEn = document.querySelector('#card1 .q-en');
                const qCn = document.querySelector('#card1 .q-cn');
                if (qEn) qEn.innerText = "If you could automate one part of your life, what would it be?";
                if (qCn) qCn.innerText = "如果能自动化你生活的一部分，你会选什么？";
            }""")

            # Allow a moment for rendering/reflow
            await page.wait_for_timeout(500)

            # Get computed height of question-screen
            screen = page.locator(".question-screen")
            height = await screen.evaluate("el => getComputedStyle(el).height")
            print(f"Mobile Question screen height: {height}")

            # Take screenshot
            await screen.screenshot(path="verification/screenshot_mobile_fixed.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
