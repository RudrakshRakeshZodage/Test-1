import re
from typing import Dict, Any, Tuple, Optional
import httpx
from bs4 import BeautifulSoup

def validate_linkedin_url(url: str) -> bool:
    """Validates public LinkedIn profile URL."""
    if not url:
        return False
    clean_url = url.strip().lower()
    pattern = r"^(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub)\/[a-zA-Z0-9_-]+\/?.*$"
    return bool(re.match(pattern, clean_url))

def validate_instagram_url(url: str) -> bool:
    """Validates public Instagram profile URL."""
    if not url:
        return False
    clean_url = url.strip().lower()
    pattern = r"^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9_\.]+\/?.*$"
    return bool(re.match(pattern, clean_url))

def extract_handle_or_slug(url: str, platform: str) -> str:
    """Extracts username slug from profile URL."""
    clean = url.strip().rstrip("/")
    parts = clean.split("/")
    if platform == "linkedin":
        # e.g. https://www.linkedin.com/in/alex-rivera-ai
        for i, part in enumerate(parts):
            if part in ("in", "pub") and i + 1 < len(parts):
                return parts[i + 1].split("?")[0]
    elif platform == "instagram":
        # e.g. https://www.instagram.com/alexrivera_tech
        if len(parts) >= 1:
            return parts[-1].split("?")[0]
    return parts[-1] if parts else ""

async def fetch_public_page_content(url: str) -> Dict[str, Any]:
    """
    Attempts to fetch public page content safely within public access boundaries.
    Never bypasses authentication, paywalls, or privacy controls.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }
    
    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                title = soup.title.string.strip() if soup.title and soup.title.string else ""
                
                # Extract meta description and OpenGraph tags
                meta_desc = ""
                og_title = ""
                og_desc = ""
                og_image = ""
                
                for meta in soup.find_all("meta"):
                    name = meta.get("name", "").lower()
                    prop = meta.get("property", "").lower()
                    content = meta.get("content", "")
                    if name == "description":
                        meta_desc = content
                    elif prop == "og:title":
                        og_title = content
                    elif prop == "og:description":
                        og_desc = content
                    elif prop == "og:image":
                        og_image = content
                        
                # Extract visible text snippets (sanitized)
                for s in soup(["script", "style", "noscript"]):
                    s.extract()
                text_content = " ".join(soup.stripped_strings)
                # Keep first 3000 chars of sanitized public text
                sanitized_text = text_content[:3000]

                return {
                    "status": "success",
                    "title": title or og_title,
                    "description": meta_desc or og_desc,
                    "image": og_image,
                    "raw_text": sanitized_text,
                    "source_url": url
                }
            elif resp.status_code in (401, 403, 999):
                return {
                    "status": "restricted",
                    "reason": "Login or auth required by platform for automated retrieval.",
                    "source_url": url
                }
            elif resp.status_code == 404:
                return {
                    "status": "not_found",
                    "reason": "Public profile not found at this URL.",
                    "source_url": url
                }
            else:
                return {
                    "status": "unavailable",
                    "reason": f"HTTP status {resp.status_code}",
                    "source_url": url
                }
    except Exception as e:
        return {
            "status": "error",
            "reason": str(e),
            "source_url": url
        }

def verify_identity_consistency(
    name: str,
    linkedin_slug: str,
    linkedin_text: str,
    instagram_handle: str,
    instagram_text: str
) -> Tuple[bool, Optional[str]]:
    """
    Checks if the supplied LinkedIn and Instagram profiles plausibly belong to the same person.
    Returns (is_verified, warning_message).
    """
    clean_name = name.lower().strip()
    name_parts = [p for p in re.split(r"[\s._-]+", clean_name) if len(p) > 2]
    
    clean_li_slug = linkedin_slug.lower()
    clean_ig_handle = instagram_handle.lower()
    
    # Check if name parts appear in slugs or bio text
    li_matches = any(part in clean_li_slug or part in linkedin_text.lower() for part in name_parts) if name_parts else True
    ig_matches = any(part in clean_ig_handle or part in instagram_text.lower() for part in name_parts) if name_parts else True

    # Check for direct handle overlap
    handle_overlap = (
        clean_ig_handle in clean_li_slug or 
        clean_li_slug in clean_ig_handle or
        clean_ig_handle.replace("_", "") in clean_li_slug.replace("-", "")
    )

    if not li_matches and not handle_overlap and clean_name:
        return False, f"Verification Notice: Stated name '{name}' could not be strongly verified in LinkedIn handle '{linkedin_slug}'. Please check source URLs."

    if not ig_matches and not handle_overlap and clean_name:
        return False, f"Verification Notice: Stated name '{name}' could not be directly confirmed in Instagram handle '{instagram_handle}'. Manual verification recommended."

    return True, None
