const Sequelize = require("sequelize");
const { QUESTION_TYPE, LANG, DEPENDENCY_TYPE } = require("./SurveyConstants");

const { sequelize } = require("./connector");

const timestampColumns = {
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
    }
};
const commonModelOptions = {
    sequelize,
    underscored: true,
    timestamps: false
};

// survey
class Survey extends Sequelize.Model {
}

Survey.init({
    title: Sequelize.STRING(200),
    active: Sequelize.BOOLEAN,
    language: Sequelize.ENUM(LANG.ZH, LANG.EN),
    ...timestampColumns
}, { ...commonModelOptions, modelName: "surveys" });

// question
class Question extends Sequelize.Model {
}

Question.init({
    title: Sequelize.STRING,
    type: Sequelize.ENUM(QUESTION_TYPE.SINGLE, QUESTION_TYPE.MULTIPLE, QUESTION_TYPE.TEXT),
    ...timestampColumns
}, { ...commonModelOptions, modelName: "questions" });

// join table
class SurveyQuestion extends Sequelize.Model {
}

SurveyQuestion.init({
    sequenceNum: Sequelize.INTEGER,
    skippable: Sequelize.BOOLEAN,
    dependsOn: Sequelize.INTEGER,
    dependencyType: Sequelize.ENUM(DEPENDENCY_TYPE.NOT_SELECTED, DEPENDENCY_TYPE.SELECTED),
    ...timestampColumns
}, { ...commonModelOptions, modelName: "surveyQuestion" });

// options of questions
class Option extends Sequelize.Model {
}

Option.init({
    title: Sequelize.STRING,
    allowFreeText: Sequelize.BOOLEAN,
    ...timestampColumns
}, { ...commonModelOptions, modelName: "options" });

// options of questions
class QuestionOption extends Sequelize.Model {
}

QuestionOption.init({
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    sequenceNum: Sequelize.INTEGER,
    ...timestampColumns
}, { ...commonModelOptions, modelName: "questionOption" });

// submission
class Submission extends Sequelize.Model {
}

/**
 * questionOptionId takes value of QuestionOption.id which uniquely identifies the question-option
 * combination.
 */
Submission.init({
    freeText: Sequelize.STRING(250),
    questionOptionId: Sequelize.INTEGER,
    ...timestampColumns
}, { ...commonModelOptions, modelName: "submissions" });

/**
 * Survey has a many-to-many relationship with Question,
 * and the link table name is *SurveyQuestion*.
 */
Question.belongsToMany(Survey, { through: SurveyQuestion });
Survey.belongsToMany(Question, { through: SurveyQuestion });

/**
 * many-to-many association with Option.
 */
Question.belongsToMany(Option, { through: QuestionOption });

/**
 * A submission is one of the following:
 *  (1) the selection of a Single-Selection question;
 *  (2) *one* of the selections of a Multi-Selection question;
 *  (3) the answer of a Free-Text question.
 */
Submission.belongsTo(Survey);
Submission.belongsTo(Question);

module.exports = {
    Survey,
    Question,
    Option,
    Submission,
    SurveyQuestion,
    QuestionOption
};
