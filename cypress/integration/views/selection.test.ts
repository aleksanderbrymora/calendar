/// <reference types="cypress" />
import { addDays, format } from 'date-fns';

describe('Selection of dates works', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.viewport('macbook-16');
  });

  it('Cannot select a disabled date', () => {
    // checking if date before today is disabled
    const formattedDate = format(addDays(new Date(), -1), 'd/L/y');
    cy.get(`[data-cy="calendar-day-${formattedDate}"]`)
      .should('be.disabled')
      .should('');
  });

  it('Can select a free date', () => {});
});
