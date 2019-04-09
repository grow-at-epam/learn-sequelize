drop database if exists post_checkout_survey;

create database if not exists post_checkout_survey
    default character set utf8mb4
    default collate utf8mb4_general_ci;

use post_checkout_survey;

grant all on post_checkout_survey.* to 'huaichao'@'localhost' identified by 'test123456';

flush privileges;
