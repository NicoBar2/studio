import requests
import os

def fetch_links(links, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    session = requests.Session()
    for link in links:
        url = link.get_attribute("href")
        name = os.path.join(output_dir, os.path.basename(url))
        try:
            with session.get(url, stream=True, timeout=10) as response:
                response.raise_for_status()
                with open(name, "wb") as file:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            file.write(chunk)
            print(f"Downloaded: {name}")
        except Exception as e:
            print(f"Failed to download {url}: {e}")
