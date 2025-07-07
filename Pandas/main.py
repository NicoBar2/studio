from selenium import webdriver

from clean import clean_csv_dir, filter_specific_animals
from scrape import scrape_links
from fetch import fetch_links

options = webdriver.ChromeOptions()
options.add_argument("--headless")

service = webdriver.ChromeService()
driver = webdriver.Chrome(service=service, options=options)

links, category_name = scrape_links(driver)
fetch_links(links, category_name)

category_name = "Animales"

filter_specific_animals(category_name)
clean_csv_dir(category_name)