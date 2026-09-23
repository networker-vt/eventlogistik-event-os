import { describe, expect, it } from 'vitest'
import { orbiFeedReply } from './orbiFeed'

describe('Orbi feed replies', () => {
  it('answers from the sentence and stays off dating', () => {
    const travel = orbiFeedReply('Flug nach Wien', { interests: ['jobs'] })
    expect(travel.to).toBe('/abflug')
    const people = orbiFeedReply('Leute treffen heute')
    expect(people.to).not.toMatch(/social|wallet/)
    expect(people.id).not.toBe('b2b')
  })

  it('keeps kids on learning, jobs, or services', () => {
    const kid = orbiFeedReply('Flug und Freunde treffen', { kids: true, interests: ['social', 'travel'] })
    expect(kid.id).toBe('learning')
    expect(kid.to).toBe('/campus')
    const job = orbiFeedReply('Ich suche einen Minijob', { kids: true })
    expect(job.to).toBe('/treffer')
  })
})
