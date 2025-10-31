import { RestaurantAssessmentModel } from './RestaurantAssessmentModel';
import { RestaurantAssessmentView } from './RestaurantAssessmentView';

export class RestaurantAssessmentController {
  public constructor(
    private readonly model: RestaurantAssessmentModel,
    private readonly view: RestaurantAssessmentView
  ) {}

  public initialize(): void {
    this.view.render();
  }
}
