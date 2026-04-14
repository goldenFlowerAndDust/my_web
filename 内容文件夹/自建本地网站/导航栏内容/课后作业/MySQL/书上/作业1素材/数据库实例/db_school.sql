/*
 Navicat MySQL Data Transfer

 Source Server         : mylink
 Source Server Type    : MySQL
 Source Server Version : 80021
 Source Host           : localhost:3306
 Source Schema         : db_school

 Target Server Type    : MySQL
 Target Server Version : 80021
 File Encoding         : 65001

 Date: 03/05/2023 17:25:24
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for tb_class
-- ----------------------------
DROP TABLE IF EXISTS `tb_class`;
CREATE TABLE `tb_class`  (
  `classNo` char(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `className` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `department` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `grade` smallint(0) NULL DEFAULT NULL,
  `classNum` tinyint(0) NULL DEFAULT NULL,
  PRIMARY KEY (`classNo`) USING BTREE,
  UNIQUE INDEX `className`(`className`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tb_class
-- ----------------------------
INSERT INTO `tb_class` VALUES ('AC1301', '会计13-1班', '会计学院', 2013, 80);
INSERT INTO `tb_class` VALUES ('AC1302', '会计13-2班', '会计学院', 2013, 48);
INSERT INTO `tb_class` VALUES ('CS1401', '计算机14-1班', '计算机学院', 2014, 35);
INSERT INTO `tb_class` VALUES ('IS1301', '信息系统13-1班', '信息学院', 2013, NULL);
INSERT INTO `tb_class` VALUES ('IS1401', '信息系统14-1班', '信息学院', NULL, 30);

-- ----------------------------
-- Table structure for tb_course
-- ----------------------------
DROP TABLE IF EXISTS `tb_course`;
CREATE TABLE `tb_course`  (
  `courseNo` char(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `courseName` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `credit` int(0) NOT NULL,
  `courseHour` int(0) NOT NULL,
  `term` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `priorCourse` char(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`courseNo`) USING BTREE,
  INDEX `priorCourse`(`priorCourse`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tb_course
-- ----------------------------
INSERT INTO `tb_course` VALUES ('11003', '管理学', 2, 32, '2', NULL);
INSERT INTO `tb_course` VALUES ('11005', '会计学', 3, 48, '2', NULL);
INSERT INTO `tb_course` VALUES ('21001', '计算机基础', 3, 48, '1', NULL);
INSERT INTO `tb_course` VALUES ('21002', 'OFFICE高级应用', 3, 48, '2', '21001');
INSERT INTO `tb_course` VALUES ('21004', '程序设计', 4, 64, '2', '21001');
INSERT INTO `tb_course` VALUES ('21005', '数据库', 4, 64, '4', '21004');
INSERT INTO `tb_course` VALUES ('21006', '操作系统', 4, 64, '5', '21001');
INSERT INTO `tb_course` VALUES ('31001', '管理信息系统', 3, 48, '3', '21004');
INSERT INTO `tb_course` VALUES ('31002', '信息系统_分析与设计', 2, 32, '4', '31001');
INSERT INTO `tb_course` VALUES ('31005', '项目管理', 3, 48, '5', '31001');

-- ----------------------------
-- Table structure for tb_score
-- ----------------------------
DROP TABLE IF EXISTS `tb_score`;
CREATE TABLE `tb_score`  (
  `studentNo` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `courseNo` char(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `score` float NULL DEFAULT NULL,
  PRIMARY KEY (`studentNo`, `courseNo`) USING BTREE,
  INDEX `courseNo`(`courseNo`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tb_score
-- ----------------------------
INSERT INTO `tb_score` VALUES ('2013110101', '11003', 100);
INSERT INTO `tb_score` VALUES ('2013110101', '21001', 86);
INSERT INTO `tb_score` VALUES ('2013110103', '11003', 89);
INSERT INTO `tb_score` VALUES ('2013110103', '21001', 86);
INSERT INTO `tb_score` VALUES ('2013110201', '11003', 100);
INSERT INTO `tb_score` VALUES ('2013110201', '21001', 92);
INSERT INTO `tb_score` VALUES ('2013110202', '11003', 100);
INSERT INTO `tb_score` VALUES ('2013110202', '21001', 85);
INSERT INTO `tb_score` VALUES ('2013310101', '21004', 83);
INSERT INTO `tb_score` VALUES ('2013310101', '31002', 68);
INSERT INTO `tb_score` VALUES ('2013310103', '21004', 80);
INSERT INTO `tb_score` VALUES ('2013310103', '31002', 76);
INSERT INTO `tb_score` VALUES ('2014210101', '21002', 93);
INSERT INTO `tb_score` VALUES ('2014210101', '21004', 89);
INSERT INTO `tb_score` VALUES ('2014210102', '21002', 95);
INSERT INTO `tb_score` VALUES ('2014210102', '21004', 88);

-- ----------------------------
-- Table structure for tb_student
-- ----------------------------
DROP TABLE IF EXISTS `tb_student`;
CREATE TABLE `tb_student`  (
  `studentNo` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `studentName` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `sex` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `birthday` date NULL DEFAULT NULL,
  `native` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `nation` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '汉',
  `classNo` char(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`studentNo`) USING BTREE,
  INDEX `classNo`(`classNo`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tb_student
-- ----------------------------
INSERT INTO `tb_student` VALUES ('2013110101', '张晓勇', '男', '1997-12-11', '山西', '汉', 'AC1301');
INSERT INTO `tb_student` VALUES ('2013110103', '王一敏', '女', '0000-00-00', '河北', '汉', 'AC1301');
INSERT INTO `tb_student` VALUES ('2013110201', '江山', '女', '1996-09-17', '内蒙古', '锡伯', 'AC1302');
INSERT INTO `tb_student` VALUES ('2013110202', '李明', '男', '1996-01-14', '广西', '壮', 'AC1302');
INSERT INTO `tb_student` VALUES ('2013310101', '黄菊', '女', '1995-09-30', '北京', '汉', 'IS1301');
INSERT INTO `tb_student` VALUES ('2013310103', '吴昊', '男', '1995-11-18', '河北', '汉', 'IS1301');
INSERT INTO `tb_student` VALUES ('2014210101', '刘涛', '男', '1997-04-03', '湖南', '侗', 'CS1401');
INSERT INTO `tb_student` VALUES ('2014210102', '郭志坚', '男', '1997-02-21', '上海', '汉', 'CS1401');
INSERT INTO `tb_student` VALUES ('2014310101', '王林', '男', '1996-10-09', '河南', '汉', 'IS1401');
INSERT INTO `tb_student` VALUES ('2014310102', '李怡然', '女', '1996-12-31', '辽宁', '汉', 'IS1401');

SET FOREIGN_KEY_CHECKS = 1;
