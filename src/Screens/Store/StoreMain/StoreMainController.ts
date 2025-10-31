import { StoreMainModel } from './StoreMainModel';
import { StoreMainView } from './StoreMainView';

export class StoreMainController {
  public constructor(
    private readonly model: StoreMainModel,
    private readonly view: StoreMainView
  ) {}

  public initialize(): void {
    this.view.render();
  }
}
