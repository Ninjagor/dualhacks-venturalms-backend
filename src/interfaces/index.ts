export interface choice {
    answer: string;
    isCorrect: boolean;
}

export interface question {
    questionPrompt: string;
    choices: choice[];
    questionOrderNumber: number;
}

export interface answer {
    choiceId: string;
}

export interface Submission {
    assignmentId: string;
    answerDetails: answer[];
}

export interface Assignment {
    classCode: string;
    questionDetails: question[];
    dueDate: string;
}

export interface StudentId {
    studentId: string
};

export interface UserDetailsResult {
    id: string;
    name: string;
    email: string;
}