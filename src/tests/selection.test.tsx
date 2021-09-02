import { mount } from '@cypress/react';
import { addMonths, format } from 'date-fns';
import App from '../App';

describe('Initial things are rendered as expected', () => {
  beforeEach(() => {
    cy.viewport('macbook-16');
    mount(<App />);
  });

  it('Contains the correct initial headings', () => {
    cy.contains('Select dates');
    cy.contains('Select travel dates to see pricing');
  });

  it('Initial months are displayed with correct month and year', () => {
    const leftMonthExpectedDate = format(new Date(), 'MMMM Y');
    const rightMonthExpectedDate = format(addMonths(new Date(), 1), 'MMMM Y');
    cy.get('[data-cy="left-month"').contains(leftMonthExpectedDate);
    cy.get('[data-cy="right-month"').contains(rightMonthExpectedDate);
  });
});
