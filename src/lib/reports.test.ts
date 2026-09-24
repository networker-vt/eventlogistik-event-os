import { beforeEach, describe, expect, it } from 'vitest'
import { __resetReportsForTests, listContentReports, submitContentReport, validateReport } from './reports'

describe('content reports', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetReportsForTests()
  })

  it('requires a reason, a description and the truthful checkbox', () => {
    expect(
      validateReport({
        targetKind: 'listing',
        targetId: 'lst-1',
        reason: '',
        description: 'Das ist Betrug',
        truthful: true,
      }),
    ).toBeTruthy()
    expect(
      validateReport({
        targetKind: 'listing',
        targetId: 'lst-1',
        reason: 'scam',
        description: 'kurz',
        truthful: true,
      }),
    ).toBeTruthy()
    expect(
      validateReport({
        targetKind: 'message',
        targetId: 'msg-1',
        reason: 'spam',
        description: 'Das ist eindeutig Spam im Chat.',
        truthful: false,
      }),
    ).toBeTruthy()
  })

  it('stores a valid report locally without a name or email', async () => {
    const saved = await submitContentReport({
      targetKind: 'profile',
      targetId: 'user-2',
      reason: 'hate',
      description: 'Beleidigungen im Profiltext.',
      truthful: true,
    })
    expect(saved.id).toMatch(/^rpt/)
    expect(saved.stored).toBe('local')
    expect(listContentReports()).toHaveLength(1)
    expect(listContentReports()[0]?.email).toBeUndefined()
  })
})
