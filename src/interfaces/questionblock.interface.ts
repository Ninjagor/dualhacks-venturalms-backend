type choice = {
    answer: string;
    isCorrect: boolean;
}

interface choices extends Array<choice> { }

type question = {
    questionPrompt: string;
    choices: choices;
    questionOrderNumber: number;
}

interface questionDetails extends Array<question> { }

export default interface Assignment {
    classCode: string;
    questionDetails: questionDetails;
    expiryDate: string;
}
