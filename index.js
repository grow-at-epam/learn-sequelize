const _ = require("lodash");
const {
    sequelize,
    Survey,
    Question,
    Option,
    Submission,
    SurveyQuestion,
    QuestionOption
} = require("./models");


function bulkCreateOptions(...titles) {
    const options = titles.map((title) => ({ title }));
    return Option.bulkCreate(options);
}

async function insertSampleData() {
    const questions = await Question.bulkCreate([{
        title: "Man or Woman?",
        type: "single"
    }, {
        title: "Choose Your favorite Colors",
        type: "multiple"
    }, {
        title: "Suggestions",
        type: "text"
    }]);


    const options1 = await bulkCreateOptions("Man", "Woman");
    const options2 = await bulkCreateOptions("Red", "Orange", "Yellow", "Green", "Purple", "Blue");


    const sequenceNumbers1 = _.shuffle(_.times(options1.length, i => i + 1));
    const questionOptions1 = _.map(sequenceNumbers1, (num, i) => ({
        questionId: questions[0].id,
        optionId: options1[i].id,
        sequenceNum: num
    }));
    const questionOptionAssociations = await QuestionOption.bulkCreate(questionOptions1);


    const sequenceNumbers2 = _.shuffle(_.times(options2.length, i => i + 1));
    const questionOptions2 = _.map(sequenceNumbers2, (num, i) => ({
        questionId: questions[1].id,
        optionId: options2[i].id,
        sequenceNum: num
    }));
    await QuestionOption.bulkCreate(questionOptions2);


    const survey = await Survey.create({
        title: "Choose Your Gift!",
        active: true,
        language: "en"
    });


    await survey.addQuestion(questions[0], { through: { sequenceNum: 100 } });
    await survey.addQuestion(questions[1], {
        through: {
            sequenceNum: 90,
            dependsOn: questionOptionAssociations[1].getDataValue("id"),
            dependencyType: "selected"
        }
    });
    await survey.addQuestion(questions[2], { through: { sequenceNum: 200, skippable: true } });


    await Submission.create({
        questionOptionId: questionOptionAssociations[1].getDataValue("id"),
        surveyId: survey.id,
        questionId: questions[0].id,
        freeText: "hello"
    });
}

async function getAllSurveys() {
    const surveys = await Survey.findAll({
        where: { active: true },
        order: [
            [Question, SurveyQuestion, "sequenceNum"],
            [Question, Option, QuestionOption, "sequenceNum"]
        ],
        include: [{
            model: Question,
            include: [{ model: Option }]
        }]
    });
    const payload = {
        surveys: surveys.map(survey => ({
            id: survey.id,
            title: survey.title,
            language: survey.language,

            questions: survey.questions.map(question => {
                const DTO = {
                    id: question.id,
                    type: question.type,
                    title: question.title,
                    sequenceNum: question.surveyQuestion.sequenceNum,
                    skippable: question.surveyQuestion.skippable,
                    dependsOn: question.surveyQuestion.dependsOn,
                    dependencyType: question.surveyQuestion.dependencyType
                };

                if (question.type !== "text") {
                    DTO.options = question.options.map(option => ({
                        id: option.questionOption.id,
                        title: option.title,
                        sequenceNum: option.questionOption.sequenceNum,
                        allowFreeText: option.allowFreeText
                    }));
                }

                return DTO;
            })
        }))
    };
    console.log(JSON.stringify(payload));
}

async function main() {
    await sequelize.sync();
    await insertSampleData();
    await getAllSurveys();
}

main();
