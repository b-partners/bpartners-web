import { mount } from '@cypress/react'
import specTitle from 'cypress-sonarqube-reporter/specTitle'

import App from '../App'

import authProvider from '../providers/auth-provider'
import { whoami1, token1, user1 } from './mocks/responses/security-api'
import { accounts1, accountHolders1 } from './mocks/responses/account-api'
import { images1 } from './mocks/responses/file-api'

describe(specTitle('Account'), () => {
  beforeEach(() => {
    cy.intercept('POST', '/token', token1)
    cy.intercept('GET', '/whoami', whoami1).as('whoami')
    cy.then(
      async () =>
        await authProvider.login('dummy', 'dummy', {
          redirectionStatusUrls: {
            successurl: 'dummy',
            FailureUrl: 'dummy'
          }
        })
    )
    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getUser1')
  })

  it('is displayed on login', () => {
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1')
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1')
    mount(<App />)

    cy.wait('@getUser1')
    cy.get('[href="/account"]').click()

    cy.get('[href="/account"]').click()

    cy.wait('@getAccount1')
    cy.wait('@getAccountHolder1')

    cy.contains('Ma société')
    cy.contains('101')
    cy.contains('Ivandry')
    cy.contains('Madagascar')
    cy.contains('6 rue Paul Langevin')

    cy.contains('Mon identité')
    cy.contains('First Name 1')
    cy.contains('last Name 1')
    cy.contains('11 11 11')

    cy.contains('Mon abonnement')
    cy.contains(`L'ambitieux`)
    cy.contains(`0€ de coût fixe par mois`)
  })

  it('upload logo image', () => {
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1')
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1')
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw`, images1).as('logoUpload')

    mount(<App />)

    cy.wait('@getUser1')
    cy.get('[href="/account"]').click()

    cy.wait('@getAccount1')
    cy.wait('@getAccountHolder1')

    cy.get('#upload-photo-label').should('be.visible')
      .selectFile('public/favicon64.png', { force: true })

  })
})
