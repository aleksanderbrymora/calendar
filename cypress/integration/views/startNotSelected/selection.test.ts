/// <reference types="cypress" />
import { minStay } from '../../../support/constants';
import { dates } from '../../../support/dates';

describe('Selection of unavailable dates is not allowed and gives a reason why', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.viewport('macbook-16');
    cy.get('[data-cy="open-calendar-modal"]').click();
  });

  it('Cannot select yesterday (or any day before today)', () => {
    const { formattedLabelDate, formattedTestDate } = dates(-1);
    cy.get(`[data-cy="calendar-day-${formattedTestDate}"]`)
      .should('be.disabled')
      .invoke('attr', 'aria-label')
      .should('eq', `Not available ${formattedLabelDate}`);
  });

  it('Cannot select a reserved date', () => {
    // this date is hardcoded to be reserved when initializing the store
    const { formattedLabelDate, formattedTestDate } = dates(10);
    cy.get(`[data-cy="calendar-day-${formattedTestDate}"]`)
      .should('be.disabled')
      .invoke('attr', 'aria-label')
      .should('eq', `Not available ${formattedLabelDate}`);
  });

  it('Cannot select a day before reserved day when start is not selected', () => {
    // this date is hardcoded to be reserved when initializing the store
    const { formattedLabelDate, formattedTestDate } = dates(9);
    cy.get(`[data-cy="calendar-day-${formattedTestDate}"]`)
      .should('be.disabled')
      .invoke('attr', 'aria-label')
      .should('eq', `${formattedLabelDate} is only available for check out.`);
  });

  it('Cannot select a day not fulfilling minimum stay requirement', () => {
    // this date is hardcoded to be reserved when initializing the store
    const { formattedLabelDate, formattedTestDate } = dates(8);
    cy.get(`[data-cy="calendar-day-${formattedTestDate}"]`)
      .should('be.disabled')
      .invoke('attr', 'aria-label')
      .should(
        'eq',
        `${formattedLabelDate} is available, but has no eligible check out date, due to the ${minStay} night stay requirement.`,
      );
  });
});

describe('Selection of available dates is possible and there is a label for it', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.viewport('macbook-16');
    cy.get('[data-cy="open-calendar-modal"]').click();
  });
  it('Selects available date', () => {
    const { formattedLabelDate, formattedTestDate } = dates(6);
    cy.get(`[data-cy="calendar-day-${formattedTestDate}"]`)
      .should('not.be.disabled')
      .invoke('attr', 'aria-label')
      .should(
        'eq',
        `Choose ${formattedLabelDate} as your check-in date. It's available, and has ${minStay} night minimum stay requirement`,
      );
    cy.get(`[data-cy="calendar-day-${formattedTestDate}"]`)
      .click()
      .invoke('attr', 'data-selected-start')
      .should('eq', 'true');
  });
});
