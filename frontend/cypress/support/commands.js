/// <reference types="cypress" />

/** Site footer (stable aria-label from AppFooter). */
Cypress.Commands.add('footer', () => {
  return cy.get('footer[aria-label="Site footer"]')
})

/** Primary marketing header (MUI AppBar is a `header`). */
Cypress.Commands.add('appHeader', () => {
  return cy.get('header.MuiAppBar-root').first()
})
