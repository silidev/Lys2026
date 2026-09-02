const FILE_PATH = '00configs/common/testing.ts';

/**
 * Configuration for the reusable test runner.
 */
export const TestRunnerConfig = {
  /**
   * If true, tests are completely disabled on mobile devices.
   * UI Tests are NEVER run automatically on mobile.
   */
  disablesTestsOnMobile: true,

  /**
   * If true, disables the automatic running of UI tests on application load on desktop browsers.
   * Logic tests always run on startup on desktop.
   * UI Tests are NEVER run automatically on mobile.
   */
  disableRunningUiTestsOnDesktopLoad: false,

  /**
   * The maximum number of failed test logs to write to the browser's console.
   * Set to 0 to disable.
   */
  maxFailedTestsToLog: 99,

  /**
   * The delay in seconds before an intentionally failing test asserts its failure.
   */
  testFailureDelayS: 0,

  /**
   * The timeout for a single test in seconds.
   */
  testTimeoutS: 10, // Keep this on 1 second!!!!

  /**
   * The delay in seconds before automatic UI tests are run on startup.
   * Manual runs are not delayed. Set to 0 to disable the delay.
   */
  automaticUiTestDelayS: 360,
};