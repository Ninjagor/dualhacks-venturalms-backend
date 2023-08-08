type answer = {
    choiceId: string;
}

interface answerDetails extends Array<answer> { }

export default interface Submission {
    assignmentId: string;
    answerDetails: answerDetails;
}
