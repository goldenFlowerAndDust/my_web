/*
 Navicat MySQL Data Transfer

 Source Server         : mylink
 Source Server Type    : MySQL
 Source Server Version : 80021
 Source Host           : localhost:3306
 Source Schema         : xscj

 Target Server Type    : MySQL
 Target Server Version : 80021
 File Encoding         : 65001

 Date: 03/05/2023 17:05:43
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for kc
-- ----------------------------
DROP TABLE IF EXISTS `kc`;
CREATE TABLE `kc`  (
  `课程号` char(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `课程名` char(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `开课学期` tinyint(1) NOT NULL,
  `学时` tinyint(1) NOT NULL,
  `学分` tinyint(1) NULL DEFAULT NULL,
  PRIMARY KEY (`课程号`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of kc
-- ----------------------------
INSERT INTO `kc` VALUES ('101', '计算机基础', 1, 80, 5);
INSERT INTO `kc` VALUES ('102', '程序设计与语言', 2, 68, 4);
INSERT INTO `kc` VALUES ('206', '离散数学', 4, 68, 4);
INSERT INTO `kc` VALUES ('208', '数据结构', 5, 68, 4);
INSERT INTO `kc` VALUES ('209', '操作系统', 6, 68, 4);
INSERT INTO `kc` VALUES ('210', '计算机原理', 5, 85, 5);
INSERT INTO `kc` VALUES ('212', '数据库原理', 7, 68, 4);
INSERT INTO `kc` VALUES ('301', '计算机网络', 7, 51, 3);
INSERT INTO `kc` VALUES ('302', '软件工程', 7, 51, 3);

-- ----------------------------
-- Table structure for xs
-- ----------------------------
DROP TABLE IF EXISTS `xs`;
CREATE TABLE `xs`  (
  `学号` char(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `姓名` char(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `专业名` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `性别` tinyint(1) NOT NULL,
  `出生时间` date NOT NULL,
  `总学分` tinyint(1) NULL DEFAULT NULL,
  `照片` blob NULL,
  `备注` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  PRIMARY KEY (`学号`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of xs
-- ----------------------------
INSERT INTO `xs` VALUES ('081101', '王林', '计算机', 1, '1990-02-10', 50, NULL, NULL);
INSERT INTO `xs` VALUES ('081102', '程明', '计算机', 1, '1991-02-01', 50, NULL, NULL);
INSERT INTO `xs` VALUES ('081103', '王燕', '计算机', 0, '1989-10-06', 50, NULL, NULL);
INSERT INTO `xs` VALUES ('081104', '韦严平', '计算机', 1, '1990-08-26', 50, NULL, NULL);
INSERT INTO `xs` VALUES ('081106', '李方方', '计算机', 1, '1990-11-20', 50, NULL, NULL);
INSERT INTO `xs` VALUES ('081107', '李明', '计算机', 1, '1990-05-01', 54, NULL, '提前修完《数据结构》，并获学分');
INSERT INTO `xs` VALUES ('081108', '林一帆', '计算机', 1, '1989-08-05', 52, NULL, '已提前修完一门课');
INSERT INTO `xs` VALUES ('081109', '张强民', '计算机', 1, '1989-08-11', 50, NULL, NULL);
INSERT INTO `xs` VALUES ('081110', '张蔚', '计算机', 0, '1991-07-22', 50, NULL, '三好生');
INSERT INTO `xs` VALUES ('081111', '赵琳', '计算机', 0, '1990-03-18', 50, NULL, NULL);
INSERT INTO `xs` VALUES ('081113', '严红', '计算机', 0, '1989-08-11', 48, NULL, '有一门功课不及格，待补考');
INSERT INTO `xs` VALUES ('081201', '王敏', '通信工程', 1, '1989-06-10', 42, NULL, NULL);
INSERT INTO `xs` VALUES ('081202', '王林', '通信工程', 1, '1989-01-29', 40, NULL, '有一门课不及格，待补考');

-- ----------------------------
-- Table structure for xs_kc
-- ----------------------------
DROP TABLE IF EXISTS `xs_kc`;
CREATE TABLE `xs_kc`  (
  `学号` char(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `课程号` char(3) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `成绩` tinyint(0) NULL DEFAULT NULL,
  `学分` tinyint(1) NULL DEFAULT NULL,
  PRIMARY KEY (`学号`, `课程号`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of xs_kc
-- ----------------------------
INSERT INTO `xs_kc` VALUES ('081101', '101', 80, 5);
INSERT INTO `xs_kc` VALUES ('081101', '102', 78, 4);
INSERT INTO `xs_kc` VALUES ('081101', '206', 76, 4);
INSERT INTO `xs_kc` VALUES ('081102', '102', 78, 4);
INSERT INTO `xs_kc` VALUES ('081102', '206', 78, 4);
INSERT INTO `xs_kc` VALUES ('081103', '101', 62, 5);
INSERT INTO `xs_kc` VALUES ('081103', '102', 70, 4);
INSERT INTO `xs_kc` VALUES ('081103', '206', 81, 4);

SET FOREIGN_KEY_CHECKS = 1;
