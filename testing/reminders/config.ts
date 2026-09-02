const FILE_PATH = 'testing/reminders/config.ts';

export const TtsRemindersConfig = {
  /**
   * The text to be spoken on successful test completion.
   */
  testSuccessTTS: 'Superheldinnen',

  /**
   * The text to be spoken on test failure.
   */
  testFailureTTS: 'Bösewichter',

  /**
   * The delay in seconds before the first TTS notification is played after tests complete.
   */
  initialTTSSoundDelayS: 60,

  /**
   * The interval in seconds for the first TTS repeat. The second TTS is played this many
   * seconds after the first one.
   */
  initialTtsRepeatIntervalS: 300, // 5 minutes

  /**
   * The factor by which the TTS repeat interval is multiplied for each subsequent repetition.
   * A value of 4 means the interval quadruples each time.
   */
  ttsRepeatIntervalMultiplier: 4,

  /**
   * The percentage by which to reduce the volume of repeated TTS notifications.
   * E.g., a value of 60 means the repeat volume will be 40% of the original.
   */
  ttsRepeatVolumeReductionPercent: 60,
};
