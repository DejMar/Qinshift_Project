import { test, expect } from '@playwright/test';
import { CareerPage } from '../pages/CareerPage';
import { SharedSteps } from '../shared/SharedSteps';
import { comparingLinks } from '../shared/comparingLinks';

test.describe('QinShift Careers tests', () => {
  let careerPage: CareerPage;
  let sharedSteps: SharedSteps;

  test.beforeEach(async ({ page }) => {
    careerPage = new CareerPage(page);
    sharedSteps = new SharedSteps(page);
    await careerPage.navigateToCareerPage();
    await sharedSteps.acceptCookiesIfPresent()
  });

  test.afterEach(async ({ page }, testInfo) => {
    await sharedSteps.takeScreenshotOnFailure(page, { status: testInfo.status ?? '', title: testInfo.title });
  });

  test('Verify job listings are visible', async ({ page }) => {
    await careerPage.clickJobOpenings();
    await careerPage.clickAllJobsButton();  
    await sharedSteps.saveJobsToJson();
    const compared = await sharedSteps.compareJsonFiles(comparingLinks.originalPath, comparingLinks.expectedData, comparingLinks.actualPath, comparingLinks.actualData)
    expect(compared).toBeTruthy()
  });

  test('Check job title', async () => {
    await careerPage.clickJobOpenings();
    await careerPage.clickAllJobsButton();
    const location = careerPage.selectRandomLocation();
    console.log(location)
  });
});