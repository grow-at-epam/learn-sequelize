const Sequelize = require("sequelize");

const sequelize = new Sequelize({
    database: "post_checkout_survey",
    username: "huaichao",
    password: "test123456",
    dialect: "mysql",
    host: "localhost",
    port: 3306,
});

const underscored = true;


// survey
class Survey extends Sequelize.Model {
}

Survey.init({
    title: Sequelize.STRING(200),
    active: Sequelize.BOOLEAN,
    language: Sequelize.ENUM("zh", "en")
}, { sequelize, underscored, modelName: "surveys" });


// question
class Question extends Sequelize.Model {
}

Question.init({
    title: Sequelize.STRING,
    type: Sequelize.ENUM('single', 'multiple', 'text')
}, { sequelize, underscored, modelName: "questions" });


// join table
class SurveyQuestion extends Sequelize.Model {
}

SurveyQuestion.init({
    sequenceNum: Sequelize.INTEGER,
    skippable: Sequelize.BOOLEAN,
    dependsOn: Sequelize.INTEGER,
    dependencyType: Sequelize.ENUM("selected", "not-selected")
}, { sequelize, underscored, modelName: "surveyQuestion" });


// options of questions
class Option extends Sequelize.Model {
}

Option.init({
    title: Sequelize.STRING,
    allowFreeText: Sequelize.BOOLEAN,
}, { sequelize, underscored, modelName: "options" });


// options of questions
class QuestionOption extends Sequelize.Model {
}

QuestionOption.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sequenceNum: Sequelize.INTEGER
}, { sequelize, underscored, modelName: "questionOption" });


// submission
class Submission extends Sequelize.Model {
}

Submission.init({
    freeText: Sequelize.STRING(200),
    questionOptionId: Sequelize.INTEGER
}, { sequelize, underscored, modelName: "submissions" });


/**
 * Survey has a many-to-many relationship with Question,
 * and the link table name is *SurveyQuestion*.
 */
Question.belongsToMany(Survey, { through: SurveyQuestion });
Survey.belongsToMany(Question, { through: SurveyQuestion });


/**
 * one-to-many association
 */
Question.belongsToMany(Option, { through: QuestionOption });


/**
 * A submission is one of the following:
 *  (1) the selection of a Single-Selection question;
 *  (2) one of the selections of a Multi-Selection question;
 *  (3) the answer of a Free-Text question.
 */
Submission.belongsTo(Survey);
Submission.belongsTo(Question);


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
            questionId: questions[0].id
        });

    })
    .then(async () => {
        const all = await Survey.findAll({
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
        //console.log(all);
    });

function bulkCreateOptions(...titles) {
    const options = titles.map((title, i) => ({ title, sequenceNum: i + 1 }));
    return Option.bulkCreate(options);
}