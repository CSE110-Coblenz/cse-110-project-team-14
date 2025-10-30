import { RestaurantMainModel } from './RestaurantMainModel';
import { RestaurantMainView } from './RestaurantMainView';

export class RestaurantMainController {
  public constructor(
    private readonly model: RestaurantMainModel,
    private readonly view: RestaurantMainView
  ) {}

  public initialize(): void {
    this.view.render();
  }
}
