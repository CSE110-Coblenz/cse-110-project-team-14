import Konva from "konva";
import { STAGE_HEIGHT, STAGE_WIDTH } from "../../constants";
import type { View } from "../../types";

export class IntroScreenView implements View {
  private group: Konva.Group;
  private backgroundLayer: Konva.Rect;

  private classroomButton: Konva.Group;
  private restaurantButton: Konva.Group;
  private storeButton: Konva.Group;

  private onClassroomClick: () => void;
  private onRestaurantClick: () => void;
  private onStoreClick: () => void;

  constructor(
    onClassroomClick: () => void,
    onRestaurantClick: () => void,
    onStoreClick: () => void
  ) {
    this.group = new Konva.Group({ visible: false });

    this.onClassroomClick = onClassroomClick;
    this.onRestaurantClick = onRestaurantClick;
    this.onStoreClick = onStoreClick;

    // Background layer
    this.backgroundLayer = new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "#d0f0ff", // light blue
    });
    this.group.add(this.backgroundLayer);

    // Create buttons
    this.classroomButton = this.createButton(
      "Classroom",
      STAGE_WIDTH / 2 - 75,
      200,
      this.onClassroomClick
    );
    this.restaurantButton = this.createButton(
      "Restaurant",
      STAGE_WIDTH / 2 - 75,
      300,
      this.onRestaurantClick
    );
    this.storeButton = this.createButton(
      "Store",
      STAGE_WIDTH / 2 - 75,
      400,
      this.onStoreClick
    );

    this.group.add(
      this.classroomButton,
      this.restaurantButton,
      this.storeButton
    );
  }

  private createButton(
    text: string,
    x: number,
    y: number,
    onClick: () => void
  ): Konva.Group {
    const buttonGroup = new Konva.Group();

    const rect = new Konva.Rect({
      x,
      y,
      width: 150,
      height: 50,
      fill: "#ffffff",
      stroke: "#000",
      strokeWidth: 2,
      cornerRadius: 8,
    });

    const label = new Konva.Text({
      x,
      y: y + 12,
      width: 150,
      align: "center",
      text,
      fontSize: 20,
      fontFamily: "Arial",
      fill: "#000",
    });

    rect.on("click", onClick);
    label.on("click", onClick);

    buttonGroup.add(rect, label);
    return buttonGroup;
  }

  show(): void {
    this.group.visible(true);
  }

  hide(): void {
    this.group.visible(false);
  }

  getGroup(): Konva.Group {
    return this.group;
  }

  // Add this method inside IntroScreenView
loadBackground(imageUrl: string): void {
  Konva.Image.fromURL(imageUrl, (imgNode) => {
    imgNode.setAttrs({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      image: imgNode.image(),
    });

    this.group.add(imgNode);
    imgNode.moveToBottom();
    this.backgroundLayer.moveToBottom();
    this.group.getLayer()?.draw();
  });
}

}
