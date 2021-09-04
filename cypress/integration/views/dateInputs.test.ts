/// <reference types="cypress" />

describe('Inputs are empty initially and have correct information on them', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.viewport('macbook-16');
    cy.get('[data-cy="open-calendar-modal"]').click();
  });

  it('Has date inputs empty', () => {
    cy.get('input#checkIn').should('not.have.value');
    cy.get('input#checkout').should('not.have.value');
  });

  it('Has focus on check-in input', () => {
    cy.get('input#checkIn').should('have.focus');
  });

  it('Inputs have correct placeholders', () => {
    cy.get('input#checkIn')
      .invoke('attr', 'placeholder')
      .should('eq', 'DD/MM/YYYY');

    cy.get('input#checkout')
      .invoke('attr', 'placeholder')
      .should('eq', 'Select Date');

    cy.get('input#checkout')
      .focus()
      .invoke('attr', 'placeholder')
      .should('eq', 'DD/MM/YYYY');
  });
});
