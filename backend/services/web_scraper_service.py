# Why this file is written:
# This service crawls the AIET website (https://new.aiet.org.in/) and all its
# internal pages, extracts clean text from each page, and returns structured
# page data ready for embedding into Qdrant.

import re
import time
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import List, Dict

class WebScraperService:
    """
    Crawls an entire website starting from a base URL,
    extracts clean text from each page, and returns structured page data.
    """

    def __init__(self, base_url: str, max_pages: int = 60, delay: float = 0.3):
        self.base_url = base_url.rstrip("/")
        self.base_domain = urlparse(base_url).netloc
        self.max_pages = max_pages
        self.delay = delay  # Polite crawl delay between requests
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (compatible; AIETChatbotCrawler/1.0)"
        })

    def _is_same_domain(self, url: str) -> bool:
        """Checks that a URL belongs to the same domain."""
        parsed = urlparse(url)
        return parsed.netloc == self.base_domain or parsed.netloc == ""

    def _is_crawlable(self, url: str) -> bool:
        """Skip binary files, anchors, and external pages."""
        skip_extensions = (".pdf", ".doc", ".docx", ".jpg", ".jpeg",
                           ".png", ".gif", ".svg", ".zip", ".mp4", ".mp3")
        parsed = urlparse(url)
        path = parsed.path.lower()
        return (
            not any(path.endswith(ext) for ext in skip_extensions)
            and "#" not in url
            and "javascript:" not in url.lower()
            and "mailto:" not in url.lower()
        )

    def _extract_text(self, soup: BeautifulSoup) -> str:
        """
        Extracts clean, human-readable text from a BeautifulSoup page.
        Removes scripts, styles, nav menus, footers, and other noise.
        """
        # Remove noise elements
        for tag in soup(["script", "style", "noscript", "nav",
                         "footer", "header", "aside", "iframe",
                         "form", "button", "input"]):
            tag.decompose()

        # Get all remaining text
        text = soup.get_text(separator="\n", strip=True)

        # Collapse multiple blank lines
        text = re.sub(r"\n{3,}", "\n\n", text)
        # Collapse multiple spaces
        text = re.sub(r"[ \t]{2,}", " ", text)

        return text.strip()

    def _get_page_title(self, soup: BeautifulSoup) -> str:
        """Extracts the page title."""
        if soup.title and soup.title.string:
            return soup.title.string.strip()
        h1 = soup.find("h1")
        if h1:
            return h1.get_text(strip=True)
        return "AIET Page"

    def crawl(self) -> List[Dict]:
        """
        Crawls all reachable internal pages starting from base_url.
        Returns a list of dicts: {url, title, text}
        """
        visited = set()
        to_visit = [self.base_url]
        pages = []

        print(f"[WebScraper] Starting crawl of {self.base_url}")
        print(f"[WebScraper] Max pages: {self.max_pages}")

        while to_visit and len(pages) < self.max_pages:
            url = to_visit.pop(0)

            # Normalise URL
            url = url.rstrip("/")
            if url in visited:
                continue
            visited.add(url)

            if not self._is_crawlable(url):
                continue

            try:
                response = self.session.get(url, timeout=10)
                if response.status_code != 200:
                    print(f"[WebScraper]  Skip {url} (HTTP {response.status_code})")
                    continue

                content_type = response.headers.get("Content-Type", "")
                if "text/html" not in content_type:
                    continue

                soup = BeautifulSoup(response.text, "lxml")
                title = self._get_page_title(soup)
                text = self._extract_text(soup)

                if len(text) < 100:  # Skip near-empty pages
                    print(f"[WebScraper]  Skip {url} (too short)")
                    continue

                pages.append({
                    "url": url,
                    "title": title,
                    "text": f"Page: {title}\nURL: {url}\n\n{text}"
                })
                print(f"[WebScraper]  [{len(pages)}/{self.max_pages}] {title[:60]} ({len(text)} chars)")

                # Discover internal links
                for a_tag in soup.find_all("a", href=True):
                    href = a_tag["href"].strip()
                    full_url = urljoin(url, href).rstrip("/")
                    if (
                        self._is_same_domain(full_url)
                        and full_url not in visited
                        and full_url not in to_visit
                        and self._is_crawlable(full_url)
                    ):
                        to_visit.append(full_url)

                time.sleep(self.delay)  # Polite crawl delay

            except requests.exceptions.RequestException as e:
                print(f"[WebScraper]  Error fetching {url}: {e}")
                continue

        print(f"[WebScraper] Done. Crawled {len(pages)} pages.")
        return pages
