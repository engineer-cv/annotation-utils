import {EventEmitter} from "events";
import {JSON as StoreJSON, Store} from "./Store/Store";
import {View} from "./View/View";
import {SVGNS} from "./Infrastructure/SVGNS";
import {ConfigInput, parseInput} from "./Config";
import {TextSelectionHandler} from "./View/EventHandler/TextSelectionHandler";
import {TwoLabelsClickedHandler} from "./View/EventHandler/TwoLabelsClickedHandler";
import {IAction} from "./Action/IAction";


export class Annotator extends EventEmitter {
    readonly store: Store;
    readonly view: View;
    readonly textSelectionHandler: TextSelectionHandler;
    readonly twoLabelsClickedHandler: TwoLabelsClickedHandler;

    constructor(
        data: string | object,
        private containerElement: HTMLElement,
        public readonly configInput?: ConfigInput
    ) {
        super();
        const config = parseInput(configInput || {}); //解析字符串，返回整数
        this.store = new Store(config);
        this.store.json = typeof data === "string" ? JSON.parse(data) : (data as StoreJSON); //解码字符串
        const svgElement = document.createElementNS(SVGNS, 'svg');      //创建svg元素
        svgElement.setAttribute("xmlns", SVGNS);        //给svg元素设置属性
        containerElement.appendChild(svgElement);       //添加到dom树中去
        this.view = new View(this, svgElement, config);
        this.textSelectionHandler = new TextSelectionHandler(this, config);   // 创建选取文字的实例
        this.twoLabelsClickedHandler = new TwoLabelsClickedHandler(this, config);   //创建点击事件的实例
    }

    //暴露事件
    public applyAction(action: IAction) {
        action.apply(this.store);
    }

    public export(): string {
        this.view.contentEditor.hide();
        // bad for Safari again
        const result = this.view.svgElement.outerHTML.replace(/&nbsp;/, " ");
        this.view.contentEditor.show();
        return result;
    }

     //移除svg
    public remove() {      
        this.view.svgElement.remove();
        this.store.config.contentEditable && this.view.contentEditor.remove();
    }
}
