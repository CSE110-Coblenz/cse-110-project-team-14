    import { MCProblem, Question, TypingProblem } from "../../../types";

    export class RestaurantAssessmentModel {
    private questions: Question[] = [];
    private index = 0;
    private score = 0;
    private bestScore = 0; // track best score this session

    async load_questions(jsonPath: string): Promise<void> {
        const response = await fetch(jsonPath);
        const all = (await response.json()) as Question[];

        // Shuffle and pick 7 random
        this.questions = all.sort(() => Math.random() - 0.5).slice(0, 7);
        this.index = 0;
        this.score = 0;
    }

    getCurrentQuestion(): Question | null {
        return this.questions[this.index] || null;
    }

    answerMC(choice: number): boolean {
        const q = this.getCurrentQuestion() as MCProblem;
        const correct = q.answerIndex === choice;
        if (correct) this.score++;
        return correct;
    }

    answerTyping(input: string): boolean {
        const q = this.getCurrentQuestion() as TypingProblem;
        const correct =
        input.trim().toLowerCase() === q.answer.trim().toLowerCase();
        if (correct) this.score++;
        return correct;
    }

    next(): void {
        this.index++;
    }

    isFinished(): boolean {
        return this.index >= this.questions.length;
    }

    getCurrentScore(): number {
        return this.score;
    }

    getTotalCount(): number {
        return this.questions.length;
    }

    getCurrentIndex(): number {
        return this.index + 1; // 1-based index
    }

    updateBestScore(): void {
        if (this.score > this.bestScore) {
        this.bestScore = this.score;
        localStorage.setItem("restaurantBestScore", String(this.bestScore));
        }
    }

    getBestScore(): number {
        const stored = localStorage.getItem("restaurantBestScore");
        return stored ? Number(stored) : this.bestScore;
    }

    reset(): void {
        this.index = 0;
        this.score = 0;
    }
    }
