import { Page } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';

export class SharedSteps {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Locators
  private jobListContainer = '#jobs_list_container';
  private acceptCookiesButton = 'button.careersite-button[data-action="click->common--cookies--alert#acceptAll"]';

  // Methods

  async saveJobsToJson() {
    const jobs = await this.page.$$eval(`${this.jobListContainer} > li`, (elements) => {
      return elements.map((el) => {
        const titleElement = el.querySelector('.company-link-style');
        const locationElement = el.querySelector('.mt-1.text-md > span:first-child');
        
        return {
          title: titleElement?.textContent?.trim() ?? '',
          location: locationElement?.textContent?.trim() ?? ''
        };
      });
    });

    const fs = require('fs');
    const path = require('path');

    const jsonContent = JSON.stringify(jobs, null, 2);
    const dirPath = path.join(__dirname, '..', 'data-results');
    const filePath = path.join(dirPath, 'jobs_data.json');

    // Create the directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(filePath, jsonContent);

    console.log('Jobs data has been saved to jobs_data.json');
  }

  async selectRandomOption(specificSelector: string): Promise<string> {
    // Wait for the specific dropdown to be visible
    await this.page.waitForSelector(specificSelector, { state: 'visible' });

    // Get all enabled options for this specific dropdown
    const options = await this.page.$$eval(`${specificSelector} button:not([disabled])`, (buttons) => {
      return buttons.map((button) => ({
        text: button.querySelector('div')?.textContent?.trim() || '',
        value: button.getAttribute('data-value') || ''
      }));
    });

    // Remove the "All" option if present
    const filteredOptions = options.filter(option => option.text !== 'All');

    // Select a random option
    const randomIndex = Math.floor(Math.random() * filteredOptions.length);
    const selectedOption = filteredOptions[randomIndex];

    // Click the selected option
    await this.page.click(`${specificSelector} button[data-value="${selectedOption.value}"]`);

    console.log(`Selected option: ${selectedOption.text}`);
    return selectedOption.text;
  }
  
  async takeScreenshotOnFailure(page: Page, testInfo: { status: string; title: string }) {
    if (testInfo.status !== 'passed') {
      const screenshotPath = `screenshots/${testInfo.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot saved: ${screenshotPath}`);
    }
  }

  async compareJsonFiles(filePath1: string, fileName1: string, filePath2: string, fileName2: string) {
    const fullFilePath1 = path.join(__dirname, filePath1, fileName1);
    const fullFilePath2 = path.join(__dirname, filePath2, fileName2);

    const file1 = JSON.parse(await fs.readFile(fullFilePath1, 'utf8'));
    const file2 = JSON.parse(await fs.readFile(fullFilePath2, 'utf8'));

    if (file1.length !== file2.length) {
      return false;
    }

    const sortedFile1 = file1.map((item: Record<string, unknown>) => JSON.stringify(Object.entries(item).sort())).sort();
    const sortedFile2 = file2.map((item: Record<string, unknown>) => JSON.stringify(Object.entries(item).sort())).sort();

    return JSON.stringify(sortedFile1) === JSON.stringify(sortedFile2);
  }


  async acceptCookiesIfPresent() {
    try {
      const cookieButton = this.page.locator(this.acceptCookiesButton);
      if (await cookieButton.isVisible({ timeout: 5000 })) {
        await cookieButton.click();
        console.log('Cookies accepted');
      }
    } catch (error) {
      console.log('Cookie banner not found or already accepted');
    }
  }
}