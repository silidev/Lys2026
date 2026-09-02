const FILE_PATH = 'sound/services/soundService.ts';
// No test coverage is needed for this file. Speech synthesis is a browser-specific API
// that is difficult to test reliably in a JSDOM environment.
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
    if (voicesPromise) {
        return voicesPromise;
    }
    voicesPromise = new Promise((resolve) => {
        let allVoices = window.speechSynthesis.getVoices();
        if (allVoices.length) {
            return resolve(allVoices);
        }
        window.speechSynthesis.onvoiceschanged = () => {
            allVoices = window.speechSynthesis.getVoices();
            resolve(allVoices);
        };
        // A longer timeout with a re-check provides more reliability.
        setTimeout(() => {
            if (allVoices.length === 0) {
                allVoices = window.speechSynthesis.getVoices();
                resolve(allVoices);
            }
        }, 1000);
    });
    return voicesPromise;
};

// Proactively load voices on script load
if (typeof window !== 'undefined' && window.speechSynthesis) {
    getVoices();
}

/**
 * Speaks a given text using the browser's speech synthesis API. This async function
 * ensures voices are loaded before attempting to speak.
 * @param text The text to speak.
 * @param lang The BCP 47 language code for the voice.
 * @param volume The volume of the speech, from 0 to 1.
 */
export const speak = async (text: string, lang: string = 'en-US', volume: number = 1): Promise<void> => {
    try {
        if (typeof window.speechSynthesis === 'undefined') {
            console.warn('Speech synthesis not supported in this browser.');
            return;
        }
        
        const availableVoices = await getVoices();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;

        // Ensure volume is a finite number. If not, default to 1.
        const safeVolume = typeof volume === 'number' && isFinite(volume) ? volume : 1.0;
        utterance.volume = Math.max(0, Math.min(1, safeVolume)); // Clamp volume between 0 and 1

        let voice = availableVoices.find(v => v.lang === lang);
        if (!voice) {
            const langPrefix = lang.split('-')[0];
            voice = availableVoices.find(v => v.lang.startsWith(langPrefix));
        }
        
        if (voice) {
            utterance.voice = voice;
        }

        window.speechSynthesis.cancel();
        
        // A small delay ensures the `cancel` command is processed before `speak` is called.
        setTimeout(() => {
            window.speechSynthesis.speak(utterance);
        }, 50);

    } catch(e: unknown) {
        console.error("Speech synthesis failed.", e);
    }
};