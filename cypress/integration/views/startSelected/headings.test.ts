/// <reference types="cypress" />

import { addMonths, format } from 'date-fns';
import { minStay } from '../../../support/constants';
import { dates } from '../../../support/dates';

const { formattedTestDate } = dates(6);

describe('Initial things are rendered as expected', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.viewport('macbook-16');
    cy.get('[data-cy="open-calendar-modal"]').click();
    cy.get(`[data-cy="calendar-day-${formattedTestDate}"]`).click();
  });

  it('Contains the correct initial headings', () => {
    cy.contains('Select dates');
    cy.contains(`Minimum stay: ${minStay} days`);
  });

  it('Initial months are displayed with correct month and year', () => {
    const leftMonthExpectedDate = format(new Date(), 'MMMM Y');
    const rightMonthExpectedDate = format(addMonths(new Date(), 1), 'MMMM Y');
    cy.get('[data-cy="left-month"').contains(leftMonthExpectedDate);
    cy.get('[data-cy="right-month"').contains(rightMonthExpectedDate);
  });

  it('Has buttons in the correct state', () => {
    cy.get('[data-cy="previous-month-button"]').should('be.disabled');
    cy.get('[data-cy="next-month-button"]').should('be.not.disabled');
  });
});
