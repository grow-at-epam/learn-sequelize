const _ = require("lodash");
const { QUESTION_TYPE, LANG, DEPENDENCY_TYPE } = require("./SurveyConstants");
const { sequelize } = require("./connector");
const {
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
    const sequenceNumbers = _.times(options.length, i => i + 1);
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
    const options2 = await bulkCreateOptions(true, "Red", "Orange", "Yellow", "Green", "Purple Purple Purple Purple Purple Purple Purple Purple Purple Purple Purple Purple Purple Purple Purple Purple", "Blue", "Pink", "Rose", "Grass", "Ocean", "Violet");

    const options3 = await bulkCreateOptions(false, "Alipay", "WeChat", "China UnionPay", "Master", "Visa", "American Express American Express American Express American Express American Express American Express American Express", "ICBC","ABC","BOC","CCB","COMM","CITIC","CEB","HXBANK","CMBC","GDB");
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
        title: "====== EN ======",
        active: false,
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

async function insertSampleDataZH() {
    const questions = await Question.bulkCreate([{
        title: "您的性别？",
        type: "single"
    }, {
        title: "请选择您喜欢的颜色。",
        type: "multiple"
    }, {
        title: "以下哪个是您首选的支付方式？",
        type: "single"
    }, {
        title: "您以首选的支付方式支付成功了吗？",
        type: "single"
    }, {
        title: "您今天的购买计划已经完成了吗？",
        type: "single"
    }, {
        title: "如果没有，请问有什么未能满足您的需要？",
        type: "text"
    }, {
        title: "您是否查询了尺寸表或使用了尺寸指南？",
        type: "single"
    }, {
        title: "您上次购买博柏利产品是在什么时候？",
        type: "single"
    }, {
        title: "您上次购买博柏利产品是在何种平台？",
        type: "single"
    }]);


    const options1 = await bulkCreateOptions(true, "男", "女");
    const options2 = await bulkCreateOptions(true, "红色", "橙色", "黄色", "绿色", "紫色紫色紫色紫色紫色紫色紫色紫色紫色紫色紫色紫色紫色紫色紫色紫色紫色紫色紫色紫色紫色紫色紫色紫色紫色紫色紫色紫色紫色紫色紫色", "蓝色", "粉色", "玫瑰红", "草绿色", "海蓝色", "紫罗兰色");

    const options3 = await bulkCreateOptions(false, "支付宝", "微信", "中国银联", "Master", "Visa", "American Express American Express American Express American Express American Express American Express American Express", "工商银行","农业银行","中国银行","建设银行","交通银行","中信银行","光大银行","华夏银行","民生银行","广发银行");
    const options4 = await bulkCreateOptions(false, "是", "否");
    const options5 = await bulkCreateOptions(false, "是", "否");
    const options6 = await bulkCreateOptions(false, "是", "否");

    const options7 = await bulkCreateOptions(false, "当月", "半年内", "更久以前");
    const options8 = await bulkCreateOptions(false, "博柏利官方网站", "天猫", "微信商城", "博柏利实体店");


    linkQuestionAndOption(questions[0], options1);
    linkQuestionAndOption(questions[1], options2);
    linkQuestionAndOption(questions[2], options3);
    linkQuestionAndOption(questions[3], options4);
    linkQuestionAndOption(questions[4], options5);
    linkQuestionAndOption(questions[6], options6);
    linkQuestionAndOption(questions[7], options7);
    linkQuestionAndOption(questions[8], options8);


    const survey = await Survey.create({
        title: "====== ZH ======",
        active: false,
        language: LANG.ZH
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
}

async function insertSampleDataEN2() {
    const questions = await Question.bulkCreate([{
        title: "In which age range are you looking for the products?",
        type: "single"
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


    const options0 = await bulkCreateOptions(false, "Below 30", "30 - 40", "40 - 50", "Above 50");
    const options1 = await bulkCreateOptions(false, "Alipay", "WeChat", "China UnionPay", "Master", "Visa", "American Express");
    const options2 = await bulkCreateOptions(false, "Yes", "No");
    const options3 = await bulkCreateOptions(false, "Yes", "No");
    const options5 = await bulkCreateOptions(false, "Yes", "No");
    const options6 = await bulkCreateOptions(false, "Within current month", "No more than 6 months ago", "Longer ago");
    const options7 = await bulkCreateOptions(false, "Official website", "Tmall", "WeChat", "Burberry physical stores");


    linkQuestionAndOption(questions[0], options0);
    linkQuestionAndOption(questions[1], options1);
    linkQuestionAndOption(questions[2], options2);
    linkQuestionAndOption(questions[3], options3);
    linkQuestionAndOption(questions[5], options5);
    linkQuestionAndOption(questions[6], options6);
    linkQuestionAndOption(questions[7], options7);


    const survey = await Survey.create({
        // title: "Burberry Post Checkout Survey",
        active: true,
        language: LANG.EN
    });

    await survey.addQuestion(questions[0], { through: { sequenceNum: 11, skippable: false } });
    await survey.addQuestion(questions[1], { through: { sequenceNum: 12, skippable: false } });
    await survey.addQuestion(questions[2], { through: { sequenceNum: 13, skippable: false } });
    await survey.addQuestion(questions[3], { through: { sequenceNum: 14, skippable: false } });
    await survey.addQuestion(questions[4], { through: { sequenceNum: 15, skippable: true } });
    await survey.addQuestion(questions[5], { through: { sequenceNum: 16, skippable: false } });
    await survey.addQuestion(questions[6], { through: { sequenceNum: 17, skippable: false } });
    await survey.addQuestion(questions[7], { through: { sequenceNum: 18, skippable: false } });
}

async function insertSampleDataZH2() {
    const questions = await Question.bulkCreate([{
        title: "请问您查找的是哪个年龄段的产品？",
        type: "single"
    }, {
        title: "以下哪个是您首选的支付方式？",
        type: "single"
    }, {
        title: "您以首选的支付方式支付成功了吗？",
        type: "single"
    }, {
        title: "您今天的购买计划已经完成了吗？",
        type: "single"
    }, {
        title: "如果没有，请问有什么未能满足您的需要？",
        type: "text"
    }, {
        title: "您是否查询了尺寸表或使用了尺寸指南？",
        type: "single"
    }, {
        title: "您上次购买博柏利产品是在什么时候？",
        type: "single"
    }, {
        title: "您上次购买博柏利产品是在何种平台？",
        type: "single"
    }]);


    const options0 = await bulkCreateOptions(false, "30岁以下", "30 - 40", "40 - 50", "50岁以上");
    const options1 = await bulkCreateOptions(false, "支付宝", "微信", "中国银联", "Master", "Visa", "American Express");
    const options2 = await bulkCreateOptions(false, "是", "否");
    const options3 = await bulkCreateOptions(false, "是", "否");
    const options5 = await bulkCreateOptions(false, "是", "否");
    const options6 = await bulkCreateOptions(false, "当月", "半年内", "更久以前");
    const options7 = await bulkCreateOptions(false, "博柏利官方网站", "天猫", "微信商城", "博柏利实体店");


    linkQuestionAndOption(questions[0], options0);
    linkQuestionAndOption(questions[1], options1);
    linkQuestionAndOption(questions[2], options2);
    linkQuestionAndOption(questions[3], options3);
    linkQuestionAndOption(questions[5], options5);
    linkQuestionAndOption(questions[6], options6);
    linkQuestionAndOption(questions[7], options7);


    const survey = await Survey.create({
        // title: "博柏利客户问卷调查！",
        active: true,
        language: LANG.ZH
    });

    await survey.addQuestion(questions[0], { through: { sequenceNum: 11, skippable: false } });
    await survey.addQuestion(questions[1], { through: { sequenceNum: 12, skippable: false } });
    await survey.addQuestion(questions[2], { through: { sequenceNum: 13, skippable: false } });
    await survey.addQuestion(questions[3], { through: { sequenceNum: 14, skippable: false } });
    await survey.addQuestion(questions[4], { through: { sequenceNum: 15, skippable: true } });
    await survey.addQuestion(questions[5], { through: { sequenceNum: 16, skippable: false } });
    await survey.addQuestion(questions[6], { through: { sequenceNum: 17, skippable: false } });
    await survey.addQuestion(questions[7], { through: { sequenceNum: 18, skippable: false } });
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
    await sequelize.authenticate();
    await sequelize.sync();
    await insertSampleDataEN();
    await insertSampleDataZH();
    await insertSampleDataEN2();
    await insertSampleDataZH2();
    await getAllSurveys();
}

main();
