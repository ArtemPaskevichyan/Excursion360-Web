import { ILoadingScreen } from "@babylonjs/core/Loading/loadingScreen";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { TextBlock } from "@babylonjs/gui/2D/controls/textBlock";

export class StateChangeLoadingScreen implements ILoadingScreen {

    public displayLoadingUI: () => void;
    public hideLoadingUI: () => void;
    public loadingUIBackgroundColor: string;
    public loadingUIText: string;

    private textBlock: TextBlock;

    constructor(private gui: AdvancedDynamicTexture) {
        this.displayLoadingUI = () => this.displayUIInternal();
        this.hideLoadingUI =    () => this.hideLoadingUIInternal();

        this.textBlock = new TextBlock("StateChangeLoadingScreen TextBlock", "Загрузка...");
        this.textBlock.isVisible = false;
        gui.addControl(this.textBlock);
    }


    private displayUIInternal(): void {
        this.textBlock.isVisible = true;
    }

    private hideLoadingUIInternal(): void {
        this.textBlock.isVisible = false;
    }
}
