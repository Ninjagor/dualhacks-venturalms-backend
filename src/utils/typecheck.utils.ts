import Assignment from "../interfaces/questionblock.interface";
import Submission from "../interfaces/submissionblock.interface";

export function isAssignment(obj: any): obj is Assignment {
    if (typeof obj !== "object" || obj === null) {
      return false;
    }
    if (
      "classCode" in obj &&
      "questionDetails" in obj &&
      "expiryDate" in obj &&
      "questionDetails" in obj &&
      typeof obj.classCode === "string" &&
      Array.isArray(obj.questionDetails) &&
      typeof obj.expiryDate === "string" &&
      typeof obj.assignmentName === "string"
    ) {
      for (const question of obj.questionDetails) {
        if (
          typeof question !== "object" ||
          question === null ||
          !("questionPrompt" in question) ||
          !("choices" in question) ||
          !("questionOrderNumber" in question) ||
          typeof question.questionPrompt !== "string" ||
          !Array.isArray(question.choices) ||
          typeof question.questionOrderNumber !== "number"
        ) {
          return false;
        }
        for (const choice of question.choices) {
          if (
            typeof choice !== "object" ||
            choice === null ||
            !("answer" in choice) ||
            !("isCorrect" in choice) ||
            typeof choice.answer !== "string" ||
            typeof choice.isCorrect !== "boolean"
          ) {
            return false;
          }
        }
      }
  
      return true;
    }
  
    return false;
}


export function isSubmission(obj: any): obj is Submission {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  if (
    "assignmentId" in obj &&
    "answerDetails" in obj &&
    typeof obj.assignmentId === "string" &&
    Array.isArray(obj.answerDetails)
  ) {
    for (const answer of obj.answerDetails) {
      if (typeof answer !== "object" || answer === null || !("choiceId" in answer) || typeof answer.choiceId !== "string") {
        return false;
      }
    }

    return true;
  }

  return false;
}