/*
 Navicat MySQL Data Transfer

 Source Server         : root-link
 Source Server Type    : MySQL
 Source Server Version : 80036
 Source Host           : localhost:3306
 Source Schema         : schooldb

 Target Server Type    : MySQL
 Target Server Version : 80036
 File Encoding         : 65001

 Date: 18/06/2024 11:18:36
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for class
-- ----------------------------
DROP TABLE IF EXISTS `class`;
CREATE TABLE `class`  (
  `班级编号` char(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `班级名称` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `院系` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `年级` int NULL DEFAULT NULL,
  `人数` int NULL DEFAULT NULL,
  PRIMARY KEY (`班级编号`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of class
-- ----------------------------
INSERT INTO `class` VALUES ('AC1301', '会计23-1班', '会计学院', 2023, 35);
INSERT INTO `class` VALUES ('AC1302', '会计23-2班', '会计学院', 2023, 35);
INSERT INTO `class` VALUES ('CS1401', '计算机24-1班', '计算机学院', 2024, 35);
INSERT INTO `class` VALUES ('IS1301', '信息系统23-1班', '信息学院', 2024, NULL);
INSERT INTO `class` VALUES ('IS1401', '信息系统24-1班', '信息学院', NULL, 30);

-- ----------------------------
-- Table structure for course
-- ----------------------------
DROP TABLE IF EXISTS `course`;
CREATE TABLE `course`  (
  `课程号` char(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `课程名` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `学分` int NOT NULL,
  `学时` int NOT NULL,
  `学期` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `前置课` char(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`课程号`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of course
-- ----------------------------
INSERT INTO `course` VALUES ('11003', '管理学', 2, 32, '2', NULL);
INSERT INTO `course` VALUES ('11005', '会计学', 3, 48, '2', NULL);
INSERT INTO `course` VALUES ('21001', '计算机基础', 3, 48, '1', NULL);
INSERT INTO `course` VALUES ('21002', 'OFFICE高级应用', 3, 48, '2', '21001');
INSERT INTO `course` VALUES ('21004', '程序设计', 4, 64, '2', '21001');
INSERT INTO `course` VALUES ('21005', '数据库', 4, 64, '4', '21004');
INSERT INTO `course` VALUES ('21006', '操作系统', 4, 64, '5', '21001');
INSERT INTO `course` VALUES ('31001', '管理信息系统', 3, 48, '3', '21004');
INSERT INTO `course` VALUES ('31002', '信息系统_分析与设计', 2, 32, '4', '31001');
INSERT INTO `course` VALUES ('31005', '项目管理', 3, 48, '5', '31001');

-- ----------------------------
-- Table structure for score
-- ----------------------------
DROP TABLE IF EXISTS `score`;
CREATE TABLE `score`  (
  `学号` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `课程号` char(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `成绩` float(5, 2) NULL DEFAULT NULL,
  PRIMARY KEY (`学号`, `课程号`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of score
-- ----------------------------
INSERT INTO `score` VALUES ('2013110101', '11003', 90.00);
INSERT INTO `score` VALUES ('2013110101', '21001', 86.00);
INSERT INTO `score` VALUES ('2013110103', '11003', 89.00);
INSERT INTO `score` VALUES ('2013110103', '21001', 86.00);
INSERT INTO `score` VALUES ('2013110201', '11003', 78.00);
INSERT INTO `score` VALUES ('2013110201', '21001', 92.00);
INSERT INTO `score` VALUES ('2013110202', '11003', 82.00);
INSERT INTO `score` VALUES ('2013110202', '21001', 85.00);
INSERT INTO `score` VALUES ('2013310101', '21004', 83.00);
INSERT INTO `score` VALUES ('2013310101', '31002', 68.00);
INSERT INTO `score` VALUES ('2013310103', '21004', 80.00);
INSERT INTO `score` VALUES ('2013310103', '31002', 76.00);
INSERT INTO `score` VALUES ('2014210101', '21002', 93.00);
INSERT INTO `score` VALUES ('2014210101', '21004', 89.00);
INSERT INTO `score` VALUES ('2014210102', '21002', 95.00);
INSERT INTO `score` VALUES ('2014210102', '21004', 88.00);
INSERT INTO `score` VALUES ('2014310101', '21001', 79.00);
INSERT INTO `score` VALUES ('2014310101', '21004', 80.00);
INSERT INTO `score` VALUES ('2014310102', '21001', 91.00);
INSERT INTO `score` VALUES ('2014310102', '21004', 87.00);

-- ----------------------------
-- Table structure for student
-- ----------------------------
DROP TABLE IF EXISTS `student`;
CREATE TABLE `student`  (
  `学号` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `姓名` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `性别` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `出生日期` date NULL DEFAULT NULL,
  `地区` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `民族` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '汉',
  `班级编号` char(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`学号`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of student
-- ----------------------------
INSERT INTO `student` VALUES ('2013110101', '张晓勇', '男', '2005-12-11', '山西', '汉', 'AC1301');
INSERT INTO `student` VALUES ('2013110103', '王一敏', '女', '2005-01-01', '河北', '汉', 'AC1301');
INSERT INTO `student` VALUES ('2013110201', '江山', '女', '2005-09-17', '内蒙古', '锡伯', 'AC1302');
INSERT INTO `student` VALUES ('2013110202', '李明', '男', '2005-01-14', '广西', '壮', 'AC1302');
INSERT INTO `student` VALUES ('2013310101', '黄菊', '女', '2004-09-30', '北京', '汉', 'IS1301');
INSERT INTO `student` VALUES ('2013310103', '吴昊', '男', '2005-11-18', '河北', '汉', 'IS1301');
INSERT INTO `student` VALUES ('2014210101', '刘涛', '男', '2006-04-03', '湖南', '侗', 'CS1401');
INSERT INTO `student` VALUES ('2014210102', '郭志坚', '男', '2006-02-21', '上海', '汉', 'CS1401');
INSERT INTO `student` VALUES ('2014310101', '王林', '男', '2006-10-09', '河南', '汉', 'IS1401');

SET FOREIGN_KEY_CHECKS = 1;
