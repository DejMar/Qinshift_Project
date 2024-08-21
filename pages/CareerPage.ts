import { Page } from '@playwright/test';
import { SharedSteps } from '../shared/SharedSteps'; // Corrected this line

export class CareerPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Locators
  private careerPageUrl = 'https://career.qinshift.com/';
  private jobListings = '.job-listings';
  private applyButton = '.apply-button';
  private jobTitle = '.job-title';
  private jobOpenings = 'span.truncate:has-text("Job openings")'
  private allJobsButton = 'a.careersite-button[href="/jobs"] span.truncate:has-text("All jobs")';
  private locationDropdown = 'button[title="Locations"]';

  // Methods

  async clickJobOpenings() {
    await this.page.click(this.jobOpenings);
  }

  async clickAllJobsButton() {
    await this.page.click(this.allJobsButton);
  }

  async navigateToCareerPage() {
    await this.page.goto(this.careerPageUrl);
  }

  async getJobListings() {
    return this.page.locator(this.jobListings);
  }

  async clickApplyButton() {
    await this.page.click(this.applyButton);
  }

  async getJobTitle() {
    return this.page.locator(this.jobTitle).textContent();
  }

  async isJobListingVisible() {
    return this.page.locator(this.jobListings).isVisible();
  }

  async selectRandomLocation(): Promise<string> {
    const sharedSteps = new SharedSteps(this.page);
    return sharedSteps.selectRandomOption(this.locationDropdown);
  }

  async selectRandomTechnology(): Promise<string> {
    const sharedSteps = new SharedSteps(this.page);
    return sharedSteps.selectRandomOption('#technology-dropdown');
  }
}