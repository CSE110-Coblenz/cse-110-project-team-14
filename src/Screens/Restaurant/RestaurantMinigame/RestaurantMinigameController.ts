import { RestaurantMinigameModel } from './RestaurantMinigameModel';
import { RestaurantMinigameView } from './RestaurantMinigameView';

export class RestaurantMinigameController {
  public constructor(
    private readonly model: RestaurantMinigameModel,
    private readonly view: RestaurantMinigameView
  ) {}

  public initialize(): void {
    this.view.render();
  }
}
