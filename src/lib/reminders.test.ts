import { beforeEach, describe, expect, it } from 'vitest'
import {
  __resetRemindersForTests,
  dueReminders,
  enqueueReminder,
  remainingReminderSlots,
  setReminderOptIn,
  tapReminder,
  REMINDERS_PER_WEEK,
} from './reminders'

describe('opt-in reminders', () => {
  beforeEach(() => {
    localStorage.clear()
    __resetRemindersForTests()
  })

  it('stays silent until opt-in and caps at 1–2 per week', () => {
    expect(enqueueReminder({ title: 'A', actionTo: '/match', actionLabel: 'Go' })).toBeNull()
    setReminderOptIn(true)
    expect(remainingReminderSlots()).toBe(REMINDERS_PER_WEEK)
    expect(enqueueReminder({ id: 'a', title: 'Prefs', actionTo: '/match', actionLabel: 'Match' })).not.toBeNull()
    expect(enqueueReminder({ id: 'b', title: 'Job', actionTo: '/listings/x', actionLabel: 'Open' })).not.toBeNull()
    expect(enqueueReminder({ id: 'c', title: 'Extra', actionTo: '/', actionLabel: 'Home' })).toBeNull()
    expect(dueReminders()).toHaveLength(2)
    const first = dueReminders()[0]
    expect(tapReminder(first.id)?.actionTo).toBeTruthy()
    expect(dueReminders()).toHaveLength(1)
  })
})
