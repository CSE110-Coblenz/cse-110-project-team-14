import { ScreenController, type ScreenSwitcher } from "../../types";
import { IntroScreenView } from "./IntroScreenView";

export class IntroScreenController extends ScreenController{
  private view: IntroScreenView;
  private screenSwitcher: ScreenSwitcher;

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;

    this.view = new IntroScreenView(
      () => this.goToClassroom(),
      () => this.goToRestaurant(),
      () => this.goToStore()
    );
  }

  async start(): Promise<void> {
    this.view.show();
  }

  private goToClassroom(): void {
    this.screenSwitcher.switchToScreen({ type: "Classroom" });
  }

  private goToRestaurant(): void {
    this.screenSwitcher.switchToScreen({ type: "Restaurant" });
  }

  private goToStore(): void {
    this.screenSwitcher.switchToScreen({ type: "Store" });
  }

  show(): void {
    this.view.show();
  }

  hide(): void {
    this.view.hide();
  }

  getView(): IntroScreenView {
    return this.view;
  }
}
