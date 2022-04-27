import { Component } from "react";
import person from '../images/person.svg';
import play from '../images/play.svg';
import pause from '../images/pause.svg';
import SpeechAPI from "../core/speechService";

class Text2Speech extends Component {
    constructor(props) {
        super(props);
        this.RATES = [1, 1.25, 1.5, 2, 2.5];
        this.currentText = {
            blockIndex: 0,
            sentenceIndex: -1
        };
        this.state = {
            rate: 1,
            editorJSDataBlocks: props.editorJSDataBlocks || [],
            play: false,
            isReady: false,
            showVoices: false
        };
        this.isSpeaking = false;
        this.speechAPI = null;
        this.initateSpeech = false;
        this.currentVoice = null;
        this.isReset = false;
    }
    splitPunctuations = (str) => {
        return str.split(". ");
    }
    
    readText = (str) => {
        this.speechAPI.setText(str);
        this.speechAPI.initSpeak(this.state.rate, this.currentVoice);
        this.speechAPI.end(() => {
            if (this.isReset) {
                this.isReset = false;
                return;
            }
            const block = this.getNextText();
            block && this.readText(block.text);
        });
        this.speechAPI.play();
    }
    toggleVoiceList = (e) => {
        this.setState({
            showVoices: !this.state.showVoices
        });
    }
    getNextText = () => {
        const blocks = this.state.editorJSDataBlocks;
        // if current block still has text
        const currentBlock = blocks[this.currentText.blockIndex];
        if (currentBlock.type === "paragraph" || currentBlock.type === "header") {
            const text = currentBlock.data.text;
            const arr = this.splitPunctuations(text);
            if (this.currentText.sentenceIndex < arr.length - 1) {
                this.currentText.sentenceIndex = this.currentText.sentenceIndex + 1;
                return {
                    blockIndex: this.currentText.blockIndex,
                    sentenceIndex: this.currentText.sentenceIndex,
                    text: arr[this.currentText.sentenceIndex]
                }
            }
        }

        // find next block
        for(let i = this.currentText.blockIndex + 1; i < blocks.length; i++) {
            const block = blocks[i];
            if (block.type === "paragraph" || block.type === "header") {
                const text = block.data.text;
                const arr = this.splitPunctuations(text);
                this.currentText = {
                    blockIndex: i,
                    sentenceIndex: 0
                };
                return {
                    blockIndex: i,
                    sentenceIndex: this.currentText.sentenceIndex,
                    text: arr[this.currentText.sentenceIndex]
                }
            }
        }
    }
    read = async () => {
        const block = this.getNextText();
        block && this.readText(block.text);
    }
    registerSpeech = async() => {
        this.speechAPI = new SpeechAPI("ts-speech-btn");
        await this.speechAPI.setVoices();
        this.setState({
            isReady: true
        });
    }
    componentDidMount() {
        this.registerSpeech();
    }
    componentWillUnmount() {
        this.speechAPI.destroy();
    }
    playPauseHandler = (e) => {
        if (!this.initateSpeech) {
            // first time
            this.initateSpeech = true;
            this.read();
        } else if (this.state.play){
            this.speechAPI.pause();
        } else {
            const flag = this.speechAPI.resume();
            if (!flag) {
                // create new from current
                this.restartFromLast();
                this.speechAPI.initSpeak(this.state.rate, this.currentVoice);
                this.currentText.sentenceIndex = this.currentText.sentenceIndex - 1; // since its already moved
                this.read();
            }
        }
        this.setState({
            play: !this.state.play
        });
    }
    rateHandler = () => {
        const index = this.RATES.findIndex(i => this.state.rate === i);
        if (index === this.RATES.length - 1) {
            this.restartFromLast(this.currentVoice, this.RATES[0]);
            this.setState({
                rate: this.RATES[0]
            });
        } else {
            this.restartFromLast(this.currentVoice, this.RATES[index + 1]);
            this.setState({
                rate: this.RATES[index + 1]
            });
        }
    }
    stripBrandName(str) {
        const companies = ['Microsoft', 'Google'];
        const companyName = companies.find(i => str.startsWith(i));
        if (!companyName) return str;
        let index = str.indexOf(companyName);
        let _str = str.slice(index + companyName.length);
        index = _str.indexOf('(');
        return _str.slice(0, index);
    }
    getVoices() {
        const voices = this.speechAPI.getVoices();
        return voices.map((i, index) => {
            const lang = i.lang.split("-")[1];
            const name = this.stripBrandName(i.name);
            return (
                <div key={index} data-item-id={index} className="ts-voice-itemwrapper">
                    <div className="ts-voice-lang">{lang}</div>
                    <div className="ts-voice-name" title={name}>{name}</div>
                </div>
            );
        });
    }
    restartFromLast = (voice, rate) => {
        this.speechAPI.pause();
        this.isReset = true;
        this.speechAPI.destroy();
        this.speechAPI.initSpeak(rate, voice);
        this.currentText.sentenceIndex = this.currentText.sentenceIndex - 1; // restart from last sentence
        this.read();
    }
    changeVoice = (e) => {
        /**
         * cancel exisiting
         * change voice
         * start again
         */
        const target = e.target.classList.contains("ts-voice-itemwrapper") ? e.target : e.target.parentElement;
        const index = target.dataset.itemId;
        const voice = this.speechAPI.getVoices()[index];
        this.currentVoice = voice;
        this.restartFromLast(voice, this.state.rate);
        this.setState({
            showVoices: false
        })
    }
    render() {
        return(
            <div className={"vts-text-speech-container"}>
                <div className="ts-controls-wrapper">
                    <div className="ts-control-iconwrapper" onClick={this.toggleVoiceList}>
                        <img src={person} className="ts-control-icon"/>
                    </div>
                    <div className="ts-control-iconwrapper" id="ts-speech-btn" onClick={this.playPauseHandler}>
                        <img src={this.state.play ? pause : play} className="ts-control-icon"/>
                    </div>
                    <div className="ts-control-iconwrapper" onClick={this.rateHandler}>
                        <span className="ts-control-txt">{this.state.rate + 'x'}</span>
                    </div>
                </div>
                {
                    this.state.isReady && 
                    <div className={"ts-voice-profileswrapper " + (this.state.showVoices ? '' : 'ts-voice-hide')}>
                        <div className="ts-voice-list" onClick={this.changeVoice}>
                            {
                                this.getVoices()
                            }
                        </div>
                    </div>
                }
            </div>
        )
    }
}
export default Text2Speech;