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
}, { sequelize, underscored });


// question
class Question extends Sequelize.Model {
}

Question.init({
    title: Sequelize.STRING,
    type: Sequelize.ENUM('single', 'multiple', 'text'),
    allowText: Sequelize.BOOLEAN,
}, { sequelize, underscored });


// options of questions
class Option extends Sequelize.Model {
}

Option.init({
    title: Sequelize.STRING
}, { sequelize, underscored });


// submission
class Submission extends Sequelize.Model {
}

Submission.init({
    freeText: Sequelize.STRING(200)
}, { sequelize, underscored });


/**
 * Survey has a many-to-many relationship with Question,
 * and the link table name is *SurveyQuestion*.
 */
Survey.belongsToMany(Question, { through: "SurveysQuestions" });
Question.belongsToMany(Survey, { through: "SurveysQuestions" });


/**
 * one-to-many association
 */
Question.hasMany(Option);
Question.belongsTo(Option, {
    as: "Dependency",
    foreignKey: "dependsOn",
    constraints: false
});


/**
 * A submission is one of the following:
 *  (1) the selection of a Single-Selection question;
 *  (2) one of the selections of a Multi-Selection question;
 *  (3) the answer of a Free-Text question.
 */
Submission.belongsTo(Survey);
Submission.belongsTo(Question);
Submission.belongsTo(Option);


/**
 * Generating schema in the database.
 * and creating some dummy data.
 */
sequelize.sync()
    .then(async () => {
        const survey = await Survey.create({
            title: "Choose Your Gift!",
            active: true,
            language: "en"
        });


        const questions = await Question.bulkCreate([{
            title: "Man or Woman?",
            type: "single",
            allowText: true
        }, {
            title: "Choose Your Color",
            type: "single",
            allowText: false
        }]);


        await survey.setQuestions(questions);


        const options1 = await bulkCreateOptions("Man", "Woman");
        const options2 = await bulkCreateOptions("Red", "Orange", "Yellow", "Green", "Purple", "Blue");


        await questions[0].setOptions(options1);
        await questions[1].setOptions(options2);


        // the association is created with alias *Dependency*
        await questions[1].setDependency(options1[1]);

    });

function bulkCreateOptions(...titles) {
    const options = titles.map(title => ({ title }));
    return Option.bulkCreate(options);
}