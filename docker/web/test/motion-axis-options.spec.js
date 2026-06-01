import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  defaultMotionXYPadSlots,
  motionAxisOptionsForMode,
  nextMotionAxisKey,
} from '../src/utils/motion-axis-options.js'

describe('motion-axis-options', () => {
  it('returns 2D and 3D pad slot defaults', () => {
    assert.equal(defaultMotionXYPadSlots(true).length, 2)
    assert.equal(defaultMotionXYPadSlots(false).length, 1)
  })

  it('cycles axis keys without colliding with the paired axis', () => {
    const options = motionAxisOptionsForMode(true)
    const next = nextMotionAxisKey('translation_x', 'translation_y', options)
    assert.notEqual(next, 'translation_y')
    assert.notEqual(next, 'translation_x')
  })
})
