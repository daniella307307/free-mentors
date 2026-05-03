/// <reference types="cypress" />

describe('Free Mentors — layout & home', () => {
  it('shows hero, fixed header, and footer on /', () => {
    cy.visit('/')
    cy.contains('Connect with Mentors. Grow Your Future.').should('be.visible')
    cy.appHeader().should('be.visible')
    cy.appHeader().contains('Role: guest').should('be.visible')
    cy.footer().should('be.visible')
    cy.footer().within(() => {
      cy.contains('Explore').should('be.visible')
      cy.contains('Account').should('be.visible')
    })
  })

  it('offers guest CTAs on the hero', () => {
    cy.visit('/')
    cy.contains('button', 'Get Started').should('be.visible')
    cy.contains('button', 'Explore Mentors').should('be.visible')
  })

  it('navigates to signup from Get Started', () => {
    cy.visit('/')
    cy.contains('button', 'Get Started').click()
    cy.url().should('include', '/auth/signup')
  })

  it('navigates to mentors from hero Explore Mentors', () => {
    cy.visit('/')
    cy.contains('button', 'Explore Mentors').click()
    cy.url().should('include', '/mentors')
    cy.contains('Mentors').should('be.visible')
  })
})

describe('Free Mentors — footer links (guest)', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('opens directory via footer Mentors link', () => {
    cy.footer().find('a[href="/mentors"]').filter(':visible').first().click()
    cy.url().should('include', '/mentors')
  })

  it('opens login via footer', () => {
    cy.footer().find('a[href="/auth/login"]').filter(':visible').first().click()
    cy.url().should('include', '/auth/login')
    cy.contains('Back to home').should('be.visible')
  })

  it('opens signup via footer', () => {
    cy.footer().find('a[href="/auth/signup"]').filter(':visible').first().click()
    cy.url().should('include', '/auth/signup')
  })
})

describe('Free Mentors — auth shell', () => {
  it('login page has no global header/footer; shows auth card', () => {
    cy.visit('/auth/login')
    cy.get('header.MuiAppBar-root').should('not.exist')
    cy.get('footer[aria-label="Site footer"]').should('not.exist')
    cy.get('h1').contains('Free Mentors').should('be.visible')
    cy.get('input[autocomplete="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
  })

  it('signup page has no global header/footer; shows account fields', () => {
    cy.visit('/auth/signup')
    cy.get('header.MuiAppBar-root').should('not.exist')
    cy.get('footer[aria-label="Site footer"]').should('not.exist')
    cy.url().should('include', '/auth/signup')
    cy.contains('Create your account and start learning').should('be.visible')
    cy.get('input[autocomplete="username"]').should('be.visible')
    cy.get('input[autocomplete="email"]').should('be.visible')
  })
})

describe('Free Mentors — mentors directory', () => {
  it('shows mentors page header and refresh control', () => {
    cy.visit('/mentors')
    cy.contains('Every mentor in the directory').should('be.visible')
    cy.contains('button', /refresh/i).should('exist')
  })

  it('brand in header links back to home', () => {
    cy.visit('/mentors')
    cy.appHeader().find('a[href="/"]').first().click()
    cy.url().should('match', /\/$/)
    cy.contains('Connect with Mentors. Grow Your Future.').should('be.visible')
  })
})
