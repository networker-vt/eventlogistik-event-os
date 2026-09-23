import { describe, expect, it } from 'vitest'
import {
  ORBI_IDLE_MS,
  ORBI_STAGES,
  cueOrbiNavRun,
  isOrbiMotion,
  isOrbiStage,
  orbiNavRunRemaining,
  poseAfterIdle,
  poseForBusy,
  poseForNav,
  poseForTap,
  resolveOrbiPose,
} from './orbiMotion'

describe('Orbi Kind motions', () => {
  it('locks the provisional defaults', () => {
    expect(ORBI_IDLE_MS).toBe(8000)
    expect(poseForTap()).toBe('winken')
    expect(poseAfterIdle()).toBe('tanzen')
    expect(poseForBusy()).toBe('arbeiten')
    expect(poseForNav()).toBe('rennen')
  })

  it('resolves busy, nav, and reduced motion ahead of the live pose', () => {
    expect(resolveOrbiPose({ live: 'idle' })).toBe('idle')
    expect(resolveOrbiPose({ live: 'tanzen' })).toBe('tanzen')
    expect(resolveOrbiPose({ live: 'idle', busy: true })).toBe('arbeiten')
    expect(resolveOrbiPose({ live: 'rennen' })).toBe('rennen')
    expect(resolveOrbiPose({ live: 'tanzen', reduced: true })).toBe('idle')
    expect(resolveOrbiPose({ live: 'idle', busy: true, reduced: true })).toBe('idle')
    expect(resolveOrbiPose({ live: 'idle', motion: 'arbeiten' })).toBe('arbeiten')
    expect(resolveOrbiPose({ live: 'tanzen', pinned: 'winken', busy: true })).toBe('winken')
  })

  it('keeps a nav run cue only for its brief window', () => {
    cueOrbiNavRun(1_000, 900)
    expect(orbiNavRunRemaining(1_000)).toBe(900)
    expect(orbiNavRunRemaining(1_500)).toBe(400)
    expect(orbiNavRunRemaining(2_000)).toBe(0)
  })

  it('accepts only known poses', () => {
    expect(isOrbiMotion('idle')).toBe(true)
    expect(isOrbiMotion('tanzen')).toBe(true)
    expect(isOrbiMotion('stock')).toBe(false)
    expect(isOrbiMotion(null)).toBe(false)
  })

  it('names Kind as the shipped stage and keeps Teen and Adult as stubs', () => {
    expect(ORBI_STAGES[0]).toBe('kind')
    expect(isOrbiStage('teen')).toBe(true)
    expect(isOrbiStage('adult')).toBe(true)
    expect(isOrbiStage('stock')).toBe(false)
  })
})
