import { StoreMinigameModel } from './StoreMinigameModel';
import { StoreMinigameView } from './StoreMinigameView';

export class StoreMinigameController {
  public constructor(
    private readonly model: StoreMinigameModel,
    private readonly view: StoreMinigameView
  ) {}

  public initialize(): void {
    this.view.render();
  }
}
