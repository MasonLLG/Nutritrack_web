/**
 * Typed application errors.
 *
 * These exist so the UI can distinguish "the app is not set up yet" from "the
 * app is broken" without matching on error message strings.
 */

/**
 * The database is reachable but has no data the app requires — typically a
 * fresh clone where migrations ran but seeds did not.
 *
 * This is an expected state with a known remedy, not a fault, so callers render
 * setup instructions rather than an error page.
 */
export class SetupRequiredError extends Error {
  constructor(
    message: string,
    readonly remedy: string,
  ) {
    super(message);
    this.name = "SetupRequiredError";
  }
}
