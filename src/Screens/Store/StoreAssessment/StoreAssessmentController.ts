import { StoreAssessmentModel } from './StoreAssessmentModel';
import { StoreAssessmentView } from './StoreAssessmentView';

export class StoreAssessmentController {
  public constructor(
    private readonly model: StoreAssessmentModel,
    private readonly view: StoreAssessmentView
  ) {}

  public initialize(): void {
    this.view.render();
  }
}
