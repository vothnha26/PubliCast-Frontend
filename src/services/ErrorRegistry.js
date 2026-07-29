/**
 * ErrorRegistry Service (Observer Pattern)
 * Decouples Validation Logic from Region UI Components.
 * Supports cleanup via unsubscribe function.
 */

class ErrorRegistryService {
  constructor() {
    this.listeners = new Set()
    this.errors = []
  }

  /**
   * Subscribe to error updates
   * @param {Function} listener
   * @returns {Function} Unsubscribe function for useEffect cleanup
   */
  subscribe(listener) {
    this.listeners.add(listener)
    // Immediately emit current errors to new subscriber
    listener(this.errors)

    // Return cleanup mechanism (Refinement A)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Set new errors and notify all observers
   * @param {Array} newErrors
   */
  setErrors(newErrors = []) {
    this.errors = newErrors
    this.notify()
  }

  /**
   * Clear all errors
   */
  clear() {
    this.errors = []
    this.notify()
  }

  /**
   * Notify all registered subscribers
   */
  notify() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.errors)
      } catch (err) {
        console.error("Error in ErrorRegistry listener:", err)
      }
    })
  }

  getErrors() {
    return this.errors
  }
}

export const ErrorRegistry = new ErrorRegistryService()
