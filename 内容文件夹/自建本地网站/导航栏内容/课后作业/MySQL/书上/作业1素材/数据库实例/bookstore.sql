/*
 Navicat MySQL Data Transfer

 Source Server         : root-link
 Source Server Type    : MySQL
 Source Server Version : 80036
 Source Host           : localhost:3306
 Source Schema         : bookstore

 Target Server Type    : MySQL
 Target Server Version : 80036
 File Encoding         : 65001

 Date: 18/06/2024 09:19:20
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for book
-- ----------------------------
DROP TABLE IF EXISTS `book`;
CREATE TABLE `book`  (
  `图书编号` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `图书类别` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '计算机',
  `书名` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `作者` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `出版社` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `出版时间` date NOT NULL,
  `单价` float(5, 2) NOT NULL,
  `数量` int NULL DEFAULT NULL,
  `折扣` float(3, 2) NULL DEFAULT NULL,
  `封面图片` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`图书编号`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of book
-- ----------------------------
INSERT INTO `book` VALUES ('TP.2462', '计算机', '计算机应用基础', '陆大一', '清华大学出版社', '2022-10-19', 45.00, 45, 0.80, NULL);
INSERT INTO `book` VALUES ('TP.2463', '计算机', '计算机网络技术', '林力尔', '清华大学出版社', '2021-10-16', 25.50, 31, 0.80, 'D\\pic\\ll.jpg');
INSERT INTO `book` VALUES ('TP.2525', '计算机', 'PHP高级语言', '王大山', '中国青年出版社', '2022-06-20', 33.25, 3, 0.80, 'D:\\pic\\js.jpg');
INSERT INTO `book` VALUES ('TP.6625', '计算机', 'JavaScript编程', '谢为士', '中国青年出版社', '2021-08-05', 33.00, 60, 0.80, NULL);
INSERT INTO `book` VALUES ('Ts.3010', '数据库', 'ORACLE', '张小五', '北京大学出版社', '2022-08-02', 28.00, NULL, NULL, NULL);
INSERT INTO `book` VALUES ('Ts.3035', '数据库', 'MYSQL数据库', '李陸', '北京大学出版社', '2020-12-26', 20.00, 500, 0.80, 'D:\\pic\\jp.jpg');
INSERT INTO `book` VALUES ('Tw.1283', '网页设计', 'DW网站制作', '李七', '人民邮电出版社', '2021-10-01', 27.00, NULL, NULL, NULL);
INSERT INTO `book` VALUES ('Tw.2562', '网页设计', 'ASP网站制作', '胡莉芭', '中国青年出版社', '2022-07-24', 30.50, 50, 0.80, NULL);
INSERT INTO `book` VALUES ('Tw.3020', '网页设计', '网页程序设计', '刘玖', '清华大学出版社', '2023-02-15', 25.00, NULL, NULL, NULL);

-- ----------------------------
-- Table structure for members
-- ----------------------------
DROP TABLE IF EXISTS `members`;
CREATE TABLE `members`  (
  `用户号` char(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `姓名` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `性别` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `密码` char(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `联系电话` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `注册时间` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`用户号`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of members
-- ----------------------------
INSERT INTO `members` VALUES ('A0012', '赵宏宇', '男', '080100', '13601234123', '2023-03-04 18:23:45');
INSERT INTO `members` VALUES ('A3013', '张凯', '男', '080100', '13611320001', '2023-01-15 09:12:23');
INSERT INTO `members` VALUES ('B0022', '王林', '男', '080100', '12501234123', '2023-01-12 08:12:30');
INSERT INTO `members` VALUES ('B2023', '李小冰', '女', '080100', '13651111081', '2023-01-18 08:57:18');
INSERT INTO `members` VALUES ('C0132', '张莉', '女', '123456', '13822555432', '2022-09-23 00:00:00');
INSERT INTO `members` VALUES ('C0138', '李华', '女', '123456', '13822551234', '2022-08-23 00:00:00');
INSERT INTO `members` VALUES ('D1963', '张三', '男', '222222', '51985523', '2022-01-23 08:15:45');

-- ----------------------------
-- Table structure for sell
-- ----------------------------
DROP TABLE IF EXISTS `sell`;
CREATE TABLE `sell`  (
  `订单号` int NOT NULL AUTO_INCREMENT,
  `用户号` char(18) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `图书编号` char(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `订购册数` int NOT NULL,
  `订购单价` float(5, 2) NOT NULL,
  `订购时间` datetime NOT NULL,
  `是否发货` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `是否收货` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `是否结清` int NULL DEFAULT 0,
  PRIMARY KEY (`订单号`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of sell
-- ----------------------------
INSERT INTO `sell` VALUES (1, 'C0132', 'TP.2525', 13, 20.00, '2023-11-14 12:13:49', '已发货', NULL, 0);
INSERT INTO `sell` VALUES (2, 'D1963', 'TP.2463', 3, 31.50, '2023-11-21 12:25:12', '已发货', NULL, 0);
INSERT INTO `sell` VALUES (3, 'D1963', 'TP.2525', 6, 23.45, '2023-03-26 12:25:23', '已发货', '已收货', 0);
INSERT INTO `sell` VALUES (4, 'C0138', 'Ts.3035', 10, 23.50, '2023-08-01 12:13:49', '已发货', '已收货', 1);
INSERT INTO `sell` VALUES (5, 'C0138', 'TP.2525', 133, 33.50, '2023-08-01 12:13:49', NULL, NULL, 0);
INSERT INTO `sell` VALUES (6, 'A3013', 'Tw.2562', 4, 89.00, '2023-08-20 00:00:00', NULL, NULL, 0);
INSERT INTO `sell` VALUES (7, 'C0138', 'TP.2463', 43, 30.00, '2023-11-08 12:13:49', '已发货', NULL, 0);
INSERT INTO `sell` VALUES (8, 'C0138', 'Ts.3035', 5, 45.50, '2023-11-21 00:00:00', NULL, NULL, 0);
INSERT INTO `sell` VALUES (9, 'C0132', 'Tw.1283', 6, 23.00, '2023-11-28 18:23:35', '已发货', '已收货', 1);

SET FOREIGN_KEY_CHECKS = 1;
