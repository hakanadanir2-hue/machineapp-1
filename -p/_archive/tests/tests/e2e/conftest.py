import pytest
from playwright.sync_api import sync_playwright

def pytest_configure(config):
    config.addinivalue_line("markers", "smoke: quick smoke tests")
