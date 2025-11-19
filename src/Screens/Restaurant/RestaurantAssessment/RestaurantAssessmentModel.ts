import {Question, MCProblem, TypingProblem} from '../../../types';

export class RestaurantAssessmentModel {
    private questions: Question[] = [];
    private index = 0;
    private score = 0;

    //Load questions from json file
    async load_questions(jsonPath: string): Promise<void> {
        const response = await fetch(jsonPath);
        const totalQuestions = (await response.json()) as Question[];

        //Shuffles question bank and outputs 7 problems
        this.questions = totalQuestions.sort(() => Math.random() - .5).slice(0,7);
    }

    //Returns the question that the player is on
    getCurrentQuestion(): Question | null {
        return this.questions[this.index] || null;
    }

    //Returns true if player picks the correct answer
    answerMC(pickedIndex: number) : boolean {
        const question = this.getCurrentQuestion() as MCProblem;
        const correct = question.answerIndex == pickedIndex;
        if(correct){
            this.score++;
        }
        return correct;
    }

    //Returns true if player types the correct answer
    answerTyping(input: string): boolean {
        const question = this.getCurrentQuestion() as TypingProblem;
        const correct = input.trim().toLowerCase() === question.answer.trim().toLowerCase();
        if(correct){
            this.score++;
        }
        return correct;
    }

    //Goes to next question
    next() : void {
        this.index++;
    }

    //Returns true if player finished all questions
    isFinished():boolean{
        return this.index >= this.questions.length;
    }

    //Returns score
    getScore():number{
        return this.score;
    }

    //Returns number of questions in total given
    getTotal():number{
        return this.questions.length;
    }
}
