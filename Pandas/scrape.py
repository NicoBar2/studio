from selenium import webdriver
from selenium.webdriver.common.by import By
import os
from utils import list_input

URL = "https://datazone.darwinfoundation.org/es/checklist/checklists-archive"


def scrape_links(driver: webdriver.Chrome):
    driver.get(URL)
    driver.implicitly_wait(3)

    body = driver.find_element(By.CLASS_NAME, "page-content")
    categories = body.find_elements(By.TAG_NAME, "li")

    category_name = list_input(categories)
    os.makedirs(category_name, exist_ok=True)

    category_body = driver.find_element(By.CLASS_NAME, "sppb-tab-lines-content")
    csv_links = category_body.find_elements(By.XPATH, ".//a[contains(@href, '.csv')]")

    return csv_links, category_name
