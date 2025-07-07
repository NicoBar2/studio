from selenium.webdriver.remote.webelement import WebElement


def list_input(categories: list[WebElement]):
    for idx, category in enumerate(categories, 1):
        print(f"{idx}. {category.text}")
    choice = int(input("Select a category by number: ")) - 1
    if choice < 0 or choice >= len(categories):
        raise ValueError("Invalid choice. Please select a valid category number.")
    categories[choice].click()
    return categories[choice].text.replace(" ", "_").replace("/", "_")
