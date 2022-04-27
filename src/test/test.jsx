import { Component } from "react";
import Text2Speech from "../components/text2speech";
class Test extends Component {
    constructor(props) {
        super(props);
        this.editorJSData = {
            "time" : 1651036979461,
            "blocks" : [
                {
                    "id" : "vS0gbiRgdv",
                    "type" : "paragraph",
                    "data" : {
                        "text" : "Topic sentences are similar to mini thesis statements. Like a thesis statement, a topic sentence has a specific main point. Whereas the thesis is the main point of the essay, the topic sentence is the main point of the paragraph. Like the thesis statement, a topic sentence has a unifying function. But a thesis statement or topic sentence alone doesn’t guarantee unity. An essay is unified if all the paragraphs relate to the thesis, whereas a paragraph is unified if all the sentences relate to the topic sentence. Note: Not all paragraphs need topic sentences. In particular, opening and closing paragraphs, which serve different functions from body paragraphs, generally don’t have topic sentences."
                    }
                }
            ],
            "version" : "2.23.1"
        }
    }
    render() {
        return(
            <>
                <div className="">
                    <div>POPUP MODE</div>
                    <p>{JSON.stringify(this.editorJSData.blocks, null, 2)}</p>
                    <Text2Speech
                    editorJSDataBlocks={this.editorJSData.blocks} 
                    />
                </div>
            </>
            
        )
    }
}
export default Test;