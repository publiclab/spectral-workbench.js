/// <reference types="cypress" />

context('Actions', () => {

  beforeEach(() => {
    cy.visit('http://127.0.0.1:8080/examples/new-capture/')
  })


  it('It reach the default landing page', () => {
    cy.get('#landing-page-content').contains('Spectral WorkBench');
    cy.get('#landing-page-content').contains('What is Spectral Workbench?');
  })

  it('The header navigation stepper is present and it is in the correct order', () => {
    cy.get('.bs-stepper-header')
    cy.get('.bs-stepper-header>div').eq(0).contains('Home Page')
    cy.get('.bs-stepper-header>div').eq(2).contains('Settings')
    cy.get('.bs-stepper-header>div').eq(4).contains('Capture')
    cy.get('.bs-stepper-header>div').eq(6).contains('Plotting')
  });

  it('The default Home page step should be highlighted but not the rest', () => {
    cy.get('.bs-stepper-header')
    cy.get('.bs-stepper-header>div').eq(0).should('have.class', 'active')
    cy.get('.bs-stepper-header>div').eq(2).not('have.class', 'active')
    cy.get('.bs-stepper-header>div').eq(4).not('have.class', 'active')
    cy.get('.bs-stepper-header>div').eq(6).not('have.class', 'active')
  });
})