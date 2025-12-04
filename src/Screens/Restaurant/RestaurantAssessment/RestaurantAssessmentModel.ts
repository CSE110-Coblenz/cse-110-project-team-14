import { MCProblem, Question, TypingProblem } from '../../../types';

export class RestaurantAssessmentModel {
    private questions: Question[] = [];
    private index = 0;
    private score = 0;

    async load_questions(jsonPath: string): Promise<void> {
        const response = await fetch(jsonPath);
        const totalQuestions = (await response.json()) as Question[];

        // take 7 random questions
        this.questions = totalQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, 7);

        this.index = 0;
        this.score = 0;
    }

    getCurrentQuestion(): Question | null {
        return this.questions[this.index] ?? null;
    }

    answerMC(pickedIndex: number): boolean {
        const question = this.getCurrentQuestion() as MCProblem;
        const correct = question.answerIndex === pickedIndex;
        if (correct) this.score++;
        return correct;
    }

    answerTyping(input: string): boolean {
        const question = this.getCurrentQuestion() as TypingProblem;
        const correct =
        input.trim().toLowerCase() === question.answer.trim().toLowerCase();
        if (correct) this.score++;
        return correct;
    }

    next(): void {
        this.index++;
    }

    isFinished(): boolean {
        return this.index >= this.questions.length;
    }

    getScore(): number {
        return this.score;
    }

    getIndex(): number {
        return this.index;
    }

    getTotal(): number {
        return this.questions.length;
    }

    reset(): void {
        this.index = 0;
        this.score = 0;
    }
}