import { describe, expect, it } from 'vitest'
import { catalogCompanies } from '../data/catalog/companies'
import { catalogTransporters } from '../data/catalog/transporters'
import { catalogVenues } from '../data/catalog/venues'
import { seedProfiles } from '../data/seed'

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
const PHONE = /\+49|\bphone\b|0\d{2,4}[\s/-]?\d{5,}/i

describe('public catalog contact data', () => {
  it('ships no phone numbers or email addresses in company, venue, or transporter data', () => {
    const blob = JSON.stringify({ catalogCompanies, catalogVenues, catalogTransporters })
    expect(blob).not.toMatch(EMAIL)
    expect(blob).not.toMatch(PHONE)
    expect(catalogCompanies[0]?.name).toBeTruthy()
    expect(catalogCompanies[0]?.city).toBeTruthy()
  })

  it('uses only fictitious example.invalid addresses in seed profiles', () => {
    for (const profile of seedProfiles) {
      expect(profile.email.endsWith('@example.invalid')).toBe(true)
    }
  })
})
