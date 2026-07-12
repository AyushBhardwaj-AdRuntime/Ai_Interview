 
 const interviewModel = require("../model/user.model")

 
 const PHASE = {
 ASKING: "ASKING",
 WAITING_FOR_ANSWER: "WAITING_FOR_ANSWER",
 ANSWERING: "ANSWERING",
};
 class InterviewState  {
 constructor (interviewId){
     this.interviewId = interviewId ;
     this.currentQuestion = "";
     this.currentAnswer= "";
      this.questions = []
  this.phase = PHASE.ASKING ;
if (!this.questionAskedAt) {
    this.questionAskedAt = new Date();
}
        this.questionCount = 0;
 }     
  addQuestion(text) {
    if (!this.questionAskedAt) {
        this.questionAskedAt = new Date();
    }

    this.currentQuestion += text;
}
  addAnswer(text){
    this.currentAnswer += text;
  }
   resetCurrentTurn() {
    this.currentQuestion = "";
    this.currentAnswer = "";
    this.questionAskedAt = null;
}
   async saveQuestionAnswer (){
     await interviewModel.findByIdAndUpdate(
         this.interviewId ,
         {
        $push: {
            "interview.questions": {
                question: this.currentQuestion,
                answer: this.currentAnswer,
                askedAt: this.questionAskedAt,
                  answeredAt: new Date(),
            }
        }
    } 
     )
 
     this.questionCount++;
     this.resetCurrentTurn();
   }
     
 }
 module.exports = {InterviewState , PHASE}