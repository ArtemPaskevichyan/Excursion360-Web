import { LinkToState } from "./LinkToState";
import { FieldItemInfo } from "./FieldItemInfo";
import { Vector3, Material, Scene, Animation, AbstractMesh, MeshBuilder, Mesh, TransformNode, VertexData, ActionEvent, StandardMaterial, AssetsManager, Texture, BackgroundMaterial, Color3, ActionManager, ExecuteCodeAction } from "babylonjs";
import { runInThisContext } from "vm";
import { CustomHolographicButton } from "../Stuff/CustomHolographicButton";
import { GUI3DManager, TextBlock } from "babylonjs-gui";
import { StackPanel3D } from "babylonjs-gui";
import { ImagesContent } from "./FieldItemContents/ImagesContent";
import { ObjectsStackPanelHelper } from "./ObjectsStackPanelHelper";

export class FieldItem extends LinkToState {

    private static containerSize: number = 10;

    private closeButton: CustomHolographicButton;
    private navigationButtons: CustomHolographicButton[] = [];
    private imageContent: ImagesContent;
    private contentBackground: Mesh;
    private showContent: boolean = false;
    constructor(
        name: string,
        private fieldItemInfo: FieldItemInfo,
        private material: StandardMaterial,
        private assetsManager: AssetsManager,
        private gui3Dmanager: GUI3DManager,
        scene: Scene) {
        super(
            name,
            Vector3.Zero(),
            material,
            () => this.onTrigger(),
            null,
            scene,
            (p) => {
                const customMesh = new Mesh(name, scene, p);
                const vertexData = new VertexData();
                vertexData.positions = fieldItemInfo.vertex.map(v => [v.x, v.y, v.z]).reduce((a, b) => a.concat(b));
                vertexData.indices = [2, 1, 0, 3, 2, 0];
                vertexData.applyToMesh(customMesh);
                return customMesh;
            });
        var longPosition = fieldItemInfo.vertex[0].add(fieldItemInfo.vertex[1]).scale(0.5);
        var correctPosition = longPosition.normalize().scale(fieldItemInfo.distance);
        this.guiMesh.position = correctPosition;
        this.guiMesh.position.y += 0.6;
        this.guiMesh.lookAt(this.guiMesh.position.scale(1.1));
    }

    protected async onTrigger() {
        this.linkObject.isVisible = false;
        this.toggleShowContent();
    }

    private toggleShowContent() {
        console.error("TODO debug mode, just creating");
        this.showContent = !this.showContent;
        if (!this.contentBackground) {
            this.createContent();
        }
        this.contentBackground.isVisible = this.showContent;
        this.closeButton.isVisible = this.showContent;
        for (const navButton of this.navigationButtons) {
            navButton.isVisible = this.showContent;
        }
        this.imageContent.setIsVisible(this.showContent);
    }
    createContent() {
        const backgroundPlane = MeshBuilder.CreatePlane(`${this.name}_background_plane`, {
            width: FieldItem.containerSize * 1.6,
            height: FieldItem.containerSize * 1.2
        }, this.scene);
        backgroundPlane.parent = this.center;
        const centerPosition = this.fieldItemInfo
            .vertex
            .reduce((prev, curr) => prev.add(curr))
            .normalize()
            .scale(this.fieldItemInfo.distance * 1.1);
        backgroundPlane.position = centerPosition;
        backgroundPlane.lookAt(centerPosition.scale(1.4));

        backgroundPlane.material = this.material;

        this.createNavButton('Фотографии', backgroundPlane);
        this.createNavButton('Видео', backgroundPlane);
        this.createNavButton('Текст', backgroundPlane);
        this.createNavButton('Аудио', backgroundPlane);
        this.updateSelectedButton(this.navigationButtons[0]);

        const closeButton = this.createButton('X', backgroundPlane, 1, 1);
        closeButton.position.x = FieldItem.containerSize / 1.5;
        closeButton.position.y = FieldItem.containerSize / 2;
        closeButton.onPointerClickObservable.add(e => {
            this.linkObject.isVisible = true;
            this.toggleShowContent();
        });
        this.closeButton = closeButton;

        this.imageContent = new ImagesContent(this.fieldItemInfo.images,
            backgroundPlane,
            FieldItem.containerSize * 1.6,
            FieldItem.containerSize,
            this.gui3Dmanager,
            this.assetsManager,
            this.scene);
        this.contentBackground = backgroundPlane;
    }

    private createNavButton(title: string, parent: TransformNode) {
        var button = this.createButton(title, parent);
        this.navigationButtons.push(button);
        ObjectsStackPanelHelper.placeAsHorizontalStack(this.navigationButtons, FieldItem.containerSize * 1.4);
    }

    private createButton(title: string, parent: TransformNode, width = 2, height = 1): CustomHolographicButton {
        var button = new CustomHolographicButton(`field-item-button-${title}`, width, height);
        this.gui3Dmanager.addControl(button);
        button.linkToTransformNode(parent);
        var buttonContent = new TextBlock();
        buttonContent.text = title;
        buttonContent.textWrapping = BABYLON.GUI.TextWrapping.WordWrap;
        buttonContent.resizeToFit = true;
        buttonContent.color = "white";
        buttonContent.fontSize = 140;
        button.content = buttonContent;
        button.contentScaleRatio = 1;
        button.isVisible = true;
        button.position.y += FieldItem.containerSize / 2; // All on one line
        button.onPointerClickObservable.add(d => this.updateSelectedButton(button));
        return button;
    }

    private updateSelectedButton(targetButton: CustomHolographicButton) {
        for (const button of this.navigationButtons) {
            button.scaling = button === targetButton ? Vector3.One().scale(1.2) : Vector3.One();
        }
    }

    protected openGuiMesh() {
        super.openGuiMesh();
        this.material.alpha += 0.3;
    }
    protected hideGuiMesh() {
        super.hideGuiMesh();
        this.material.alpha -= 0.3;
    }

    public dispose() {
        super.dispose();
        this.material.dispose();
        this.imageContent.dispose();
        for (const navButton of this.navigationButtons) {
            navButton.dispose();
        }
    }
}