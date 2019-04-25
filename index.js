const _ = require("lodash");
const { QUESTION_TYPE, LANG, DEPENDENCY_TYPE } = require("./SurveyConstants");
const {
    sequelize,
    Survey,
    Question,
    Option,
    Submission,
    SurveyQuestion,
    QuestionOption
} = require("./models");


function bulkCreateOptions(allowFreeText, ...titles) {
    const options = titles.map((title) => ({ title }));
    if (allowFreeText) {
        options.push({ title: "Others", allowFreeText: true });
    }
    return Option.bulkCreate(options);
}

async function linkQuestionAndOption(question, options) {
    const sequenceNumbers = _.shuffle(_.times(options.length, i => i + 1));
    const questionOptions = _.map(sequenceNumbers, (num, i) => ({
        questionId: question.id,
        optionId: options[i].id,
        sequenceNum: num
    }));
    await QuestionOption.bulkCreate(questionOptions);
}

async function insertSampleDataEN() {
    const questions = await Question.bulkCreate([{
        title: "Man or Woman?",
        type: "single"
    }, {
        title: "Choose Your favorite Colors",
        type: "multiple"
    }, {
        title: "What was your first choice for payment method?",
        type: "single"
    }, {
        title: "Were you able to check out using this payment method?",
        type: "single"
    }, {
        title: "Were you able to purchase everything you intended to purchase today?",
        type: "single"
    }, {
        title: "If not, what was the trouble?",
        type: "text"
    }, {
        title: "Did you use the size guide/help?",
        type: "single"
    }, {
        title: "When was your last purchase of burberry?",
        type: "single"
    }, {
        title: "Where did you make the purchase?",
        type: "single"
    }]);


    const options1 = await bulkCreateOptions(true, "Man", "Woman");
    const options2 = await bulkCreateOptions(true, "Red", "Orange", "Yellow", "Green", "Purple", "Blue");

    const options3 = await bulkCreateOptions(false, "Alipay", "WeChat", "China UnionPay", "Master", "Visa", "American Express");
    const options4 = await bulkCreateOptions(false, "Yes", "No");
    const options5 = await bulkCreateOptions(false, "Yes", "No");
    const options6 = await bulkCreateOptions(false, "Yes", "No");

    const options7 = await bulkCreateOptions(false, "Within current month", "No more than 6 months ago", "Longer ago");
    const options8 = await bulkCreateOptions(false, "Official website", "Tmall", "WeChat", "Burberry physical stores");


    linkQuestionAndOption(questions[0], options1);
    linkQuestionAndOption(questions[1], options2);
    linkQuestionAndOption(questions[2], options3);
    linkQuestionAndOption(questions[3], options4);
    linkQuestionAndOption(questions[4], options5);
    linkQuestionAndOption(questions[6], options6);
    linkQuestionAndOption(questions[7], options7);
    linkQuestionAndOption(questions[8], options8);


    const survey = await Survey.create({
        title: "Choose Your Gift!",
        active: true,
        language: LANG.EN
    });

    await survey.addQuestion(questions[0], { through: { sequenceNum: 1, skippable: false } });
    await survey.addQuestion(questions[1], { through: { sequenceNum: 2, skippable: true } });
    await survey.addQuestion(questions[2], { through: { sequenceNum: 3, skippable: false } });
    await survey.addQuestion(questions[3], { through: { sequenceNum: 4, skippable: false } });
    await survey.addQuestion(questions[4], { through: { sequenceNum: 5, skippable: false } });
    await survey.addQuestion(questions[5], { through: { sequenceNum: 6, skippable: true } });
    await survey.addQuestion(questions[6], { through: { sequenceNum: 7, skippable: false } });
    await survey.addQuestion(questions[7], { through: { sequenceNum: 8, skippable: false } });
    await survey.addQuestion(questions[8], { through: { sequenceNum: 9, skippable: false } });


    // await survey.addQuestion(questions[0], { through: { sequenceNum: 100 } });
    // await survey.addQuestion(questions[1], {
    //     through: {
    //         sequenceNum: 90,
    //         dependsOn: questionOptionAssociations[1].getDataValue("id"),
    //         dependencyType: "selected"
    //     }
    // });
    // await survey.addQuestion(questions[2], { through: { sequenceNum: 200, skippable: true } });


    // await Submission.create({
    //     questionOptionId: questionOptionAssociations[1].getDataValue("id"),
    //     surveyId: survey.id,
    //     questionId: questions[0].id,
    //     freeText: "hello"
    // });
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

                if (question.type !== QUESTION_TYPE.TEXT) {
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
    await insertSampleDataEN();
    await getAllSurveys();
}

main();
