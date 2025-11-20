import { RestaurantAssessmentModel } from './RestaurantAssessmentModel';
import { RestaurantAssessmentView } from './RestaurantAssessmentView';
import type {ScreenSwitcher} from "../../../types.ts";
import { ScreenController } from "../../../types";

export class RestaurantAssessmentController extends ScreenController {
  private model: RestaurantAssessmentModel;
  private view: RestaurantAssessmentView;
  private screenSwitcher: ScreenSwitcher;
  private typingBuffer = "";

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;
    this.model = new RestaurantAssessmentModel();
    this.view = new RestaurantAssessmentView(() => this.switchToRestaurant());
    this.setupTypingHandler();
  }

    async start(): Promise<void>{
      await this.model.load_questions("/ItemImage/Restaurant/questions.json");
      this.view.show();
      this.showQuestionHandler();
    }

    private showQuestionHandler(): void{
      const problem = this.model.getCurrentQuestion();
      if(!problem) return;
      if(problem.type === "mcq"){
        this.view.showMCQ(problem, (pickedIndex)=> this.handleMCQ(pickedIndex));
      }
      else{
        this.typingBuffer = "";
        this.view.showTyping(problem, this.typingBuffer);
      }
    }

    private handleMCQ(pickedIndex:number):void{
      const answer = this.model.answerMC(pickedIndex);
      this.view.showFeedback(answer);
      setTimeout(()=> this.advance(), 1200);
    }

    private setupTypingHandler():void{
      window.addEventListener("keydown", (e) => {
        const problem = this.model.getCurrentQuestion();
        if(!problem || problem.type !== "type"){
          return;
        }
        if(e.key === "Enter"){
          const answer = this.model.answerTyping(this.typingBuffer);
          this.view.showFeedback(answer);
          setTimeout(()=> this.advance(), 1200);
          return;
        }
        if(e.key === "Backspace"){
          this.typingBuffer = this.typingBuffer.slice(0,-1);
        }
        else if(e.key.length === 1){
          this.typingBuffer += e.key;
        }
        this.view.updateTypingText(this.typingBuffer);
      });
    }

    private advance(): void{
      this.model.next();
      if(this.model.isFinished()){
        this.view.showResults(this.model.getScore(), this.model.getTotal());
        return;
      }
      this.showQuestionHandler();
    }

    private switchToRestaurant(): void{
      this.model.reset();
      this.screenSwitcher.switchToScreen({type: "Restaurant"});
    }

    getView() : RestaurantAssessmentView {
      return this.view;
    }
    
    show(): void{
      this.view.show();
    }
    
    hide(): void{
      this.view.hide();
    }
 
}
