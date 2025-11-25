/**
 * Speak text in French using browser TTS
 */
export class FrenchTTS {
    private static queue: SpeechSynthesisUtterance[] = [];
    static speak(text: string, lang: string = "fr-FR") {
        
        if (!window.speechSynthesis) return;
        
        
        const utter = new window.SpeechSynthesisUtterance(text);
        utter.lang = lang;
        utter.rate = 0.95;
        utter.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        if (!voices.length) {
        // voices not loaded yet, wait
            window.speechSynthesis.onvoiceschanged = () =>FrenchTTS.speak(text, lang);
            return;
        }
        const voice = voices.find(v => v.lang.startsWith(lang.split("-")[0]));
        if (voice) utter.voice = voice;

        //window.speechSynthesis.cancel(); // Stop any previous speech
        
        utter.onend = () => {
            FrenchTTS.queue.shift();
            if (FrenchTTS.queue.length > 0) window.speechSynthesis.speak(FrenchTTS.queue[0]);
        };

        FrenchTTS.queue.push(utter);
        if (FrenchTTS.queue.length === 1) window.speechSynthesis.speak(utter);
    }
}
