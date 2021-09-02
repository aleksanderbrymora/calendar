/// <reference types="cypress" />
import { addMonths, format } from 'date-fns';

describe('Changing months works as expected', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.viewport('macbook-16');
  });

  it('Changes the month by one when next button is pressed', () => {
    const leftMonthExpectedDate = format(addMonths(new Date(), 1), 'MMMM Y');
    const rightMonthExpectedDate = format(addMonths(new Date(), 2), 'MMMM Y');

    cy.get('[data-cy="next-month-button"]').click();

    cy.get('[data-cy="previous-month-button"]').should('not.be.disabled');
    cy.get('[data-cy="next-month-button"]').should('not.be.disabled');

    cy.get('[data-cy="left-month"').contains(leftMonthExpectedDate);
    cy.get('[data-cy="right-month"').contains(rightMonthExpectedDate);
  });

  it('Changes the months in both directions', () => {
    const expectedDate = format(new Date(), 'MMMM Y');
    cy.get('[data-cy="next-month-button"]').click();
    cy.get('[data-cy="previous-month-button"]').click();
    cy.get('[data-cy="left-month"').contains(expectedDate);
  });
});
