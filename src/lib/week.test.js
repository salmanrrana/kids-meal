import { describe, expect, test } from 'vitest'
import { formatWeekRange, getWeekStart, shiftWeek } from './week'

// Built from local dates, so these hold in every timezone (run with TZ=Asia/Tokyo
// or TZ=America/Los_Angeles to check).
describe('week helpers', () => {
  test('late Saturday night still belongs to that Sunday-start week', () => {
    expect(getWeekStart(new Date(2026, 8, 26, 23, 30))).toBe('2026-09-20')
    expect(getWeekStart(new Date(2026, 8, 20, 0, 5))).toBe('2026-09-20')
  })

  test('labels and shifts weeks without drifting a day', () => {
    expect(formatWeekRange('2026-09-20')).toBe('Sep 20 – Sep 26')
    expect(shiftWeek('2026-09-27', 1)).toBe('2026-10-04')
    expect(shiftWeek('2026-09-20', -1)).toBe('2026-09-13')
  })
})
