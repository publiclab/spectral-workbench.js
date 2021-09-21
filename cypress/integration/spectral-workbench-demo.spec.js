/// <reference types="cypress" />
const path = require('path')

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

  const downloadsFolder = Cypress.config('downloadsFolder')

  it('can be clicked through to begin capturing', () => {
    cy.get('#landing-page-next').click()
    cy.get('#setting-page-next').click()
    cy.get('#download-spectrum').click()

    cy.log('**read downloaded file**')

    // file path is relative to the working folder
    const filename = path.join(downloadsFolder, 'spectrum_img.png')

    // browser might take a while to download the file,
    // so use "cy.readFile" to retry until the file exists
    // and has length - and we assume that it has finished downloading then
    cy.readFile(filename, { timeout: 15000 })
    .should('have.length.gt', 50)
  });

})
