const {
    sequelize,
    Survey,
    Question,
    Option,
    Submission,
    SurveyQuestion,
    QuestionOption
} = require("./models");

/**
 * Generating schema in the database.
 * and creating some dummy data.
 */
sequelize.sync()
    .then(async () => {
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


        const questionOptionAssociations = await questions[0].setOptions(options1, { through: { sequenceNum: 2 } });
        await questions[1].setOptions(options2, { through: { sequenceNum: 1 } });


        const survey = await Survey.create({
            title: "Choose Your Gift!",
            active: true,
            language: "en"
        });


        await survey.addQuestion(questions[0], { through: { sequenceNum: 100 } });
        await survey.addQuestion(questions[1], {
            through: {
                sequenceNum: 90,
                dependsOn: questionOptionAssociations[0][1].getDataValue("id"),
                dependencyType: "selected"
            }
        });
        await survey.addQuestion(questions[2], { through: { sequenceNum: 200 } });


        await Submission.create({
            questionOptionId: questionOptionAssociations[0][1].getDataValue("id"),
            surveyId: survey.id,
            questionId: questions[0].id,
            freeText: "hello"
        });

    })
    .then(async () => {
        const surveys = await Survey.findAll({
            include: [
                {
                    model: Question,
                    include: [
                        {
                            model: Option
                        }
                    ]
                }
            ]
        });
        const payload = surveys.map(survey => {
            return {
                id: survey.id,
                title: survey.title,
                language: survey.language,
                questions: survey.questions.map(question => ({
                    id: question.id,
                    type: question.type,
                    title: question.title,
                    sequenceNum: question.sequenceNum,
                    skippable: question.skippable,
                    dependsOn: question.dependsOn,
                    dependencyType: question.dependencyType,
                    options: question.options.map(option => ({
                        id: option.questionOption.id,
                        title: option.title,
                        sequenceNum: option.sequenceNum,
                        allowFreeText: option.allowFreeText
                    }))
                }))
            };
        });
        console.log(JSON.stringify(payload));
    });

function bulkCreateOptions(...titles) {
    const options = titles.map((title, i) => ({ title, sequenceNum: i + 1 }));
    return Option.bulkCreate(options);
}