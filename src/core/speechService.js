class SpeechAPI {
    constructor(domID, text) {
        this.speechSynthesis = window.speechSynthesis;
        this.element = document.getElementById(domID);
        this.text = text;
        this.voices = [];
        this.speakText = null;
    }
    setElement(domID) {
        this.element = document.getElementById(domID);
    }
    setText(text) {
        this.text = text;
    }
    end(callback) {
        this.speakText.onend = callback;
    }
    initSpeak(rate, voice) {
        if (!this.text) return;
        this.speakText = new SpeechSynthesisUtterance(this.text);
        this.speakText.rate = rate ? rate : 1;
        this.speakText.voice = voice ? voice : this.voices[0];
    }
    play() {
        this.speechSynthesis.speak(this.speakText);
    }
    pause() {
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.pause();
        } else {
            this.destroy();
        }
    }
    resume() {
        if (this.speechSynthesis.paused) {
            this.speechSynthesis.resume();
            return true;
        }
        return false;
    }
    setRate(val) {
        this.speakText.rate = val;
    }
    destroy() {
        this.speechSynthesis.cancel();
    }
    setVoices() {
        return this.initVoices().then(voices => {
            this.voices = voices;
        });
    }
    changeVoice(e) {
        this.speakText.voice = e;
    }
    getVoices() {
        return this.voices;
    }
    initVoices() {
        return new Promise((resolve) => {
            const voices = this.speechSynthesis.getVoices();
            if (voices.length) resolve(voices);
            this.speechSynthesis.addEventListener('voiceschanged', () => {
                const voices = this.speechSynthesis.getVoices();
                resolve(voices);
            });
        });
    }
}
export default SpeechAPI;