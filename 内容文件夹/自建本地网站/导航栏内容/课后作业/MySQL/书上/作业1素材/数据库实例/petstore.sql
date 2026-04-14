/*
 Navicat MySQL Data Transfer

 Source Server         : root-link
 Source Server Type    : MySQL
 Source Server Version : 80036
 Source Host           : localhost:3306
 Source Schema         : petstore

 Target Server Type    : MySQL
 Target Server Version : 80036
 File Encoding         : 65001

 Date: 18/06/2024 10:45:31
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for account
-- ----------------------------
DROP TABLE IF EXISTS `account`;
CREATE TABLE `account`  (
  `userid` char(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `fullname` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `sex` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `address` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `email` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `phone` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`userid`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of account
-- ----------------------------
INSERT INTO `account` VALUES ('u0001', '刘晓和', '123456', '男', '广东深圳市', 'liuxh@163.com', '13512345678');
INSERT INTO `account` VALUES ('u0002', '张嘉庆', '123456', '男', '广东深圳市', 'zhangjq@163.com', '13512345679');
INSERT INTO `account` VALUES ('u0003', '罗红红', '123456', '女', '广东深圳市', 'longhh@163.com', '13512345689');
INSERT INTO `account` VALUES ('u0004', '李昊华', '123456', '女', '广东广州市', 'lihh@163.com', '13812345679');
INSERT INTO `account` VALUES ('u0005', '吴美霞', '123456', '女', '广东珠海市', 'wumx@163.com', '13512345879');
INSERT INTO `account` VALUES ('u0006', '王天赐', '123456', '男', '广东中山市', 'wangtc@163.com', '13802345679');

-- ----------------------------
-- Table structure for category
-- ----------------------------
DROP TABLE IF EXISTS `category`;
CREATE TABLE `category`  (
  `catid` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `catname` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `cades` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  PRIMARY KEY (`catid`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of category
-- ----------------------------
INSERT INTO `category` VALUES ('01', '鸟类', '');
INSERT INTO `category` VALUES ('02', '猫', '');
INSERT INTO `category` VALUES ('03', '狗', '');
INSERT INTO `category` VALUES ('04', '鱼', '');
INSERT INTO `category` VALUES ('05', '爬行类', '');

-- ----------------------------
-- Table structure for lineitem
-- ----------------------------
DROP TABLE IF EXISTS `lineitem`;
CREATE TABLE `lineitem`  (
  `orderid` int NOT NULL,
  `itemid` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `quantity` int NOT NULL,
  `unitprice` decimal(10, 2) NOT NULL,
  PRIMARY KEY (`orderid`, `itemid`) USING BTREE,
  INDEX `itemid`(`itemid`) USING BTREE,
  CONSTRAINT `lineitem_ibfk_1` FOREIGN KEY (`itemid`) REFERENCES `product` (`productid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `lineitem_ibfk_2` FOREIGN KEY (`orderid`) REFERENCES `orders` (`orderid`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of lineitem
-- ----------------------------
INSERT INTO `lineitem` VALUES (20130411, 'FI-SW-01', 10, 18.50);
INSERT INTO `lineitem` VALUES (20130411, 'FI-SW-02', 12, 16.50);
INSERT INTO `lineitem` VALUES (20130412, 'K9-BD-01', 2, 120.00);
INSERT INTO `lineitem` VALUES (20130412, 'K9-PO-02', 1, 220.00);
INSERT INTO `lineitem` VALUES (20130413, 'K9-DL-01', 1, 130.00);
INSERT INTO `lineitem` VALUES (20130414, 'RP-SN-01', 2, 125.00);
INSERT INTO `lineitem` VALUES (20130415, 'AV-SB-02', 2, 50.00);

-- ----------------------------
-- Table structure for orders
-- ----------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`  (
  `orderid` int NOT NULL AUTO_INCREMENT,
  `userid` char(6) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `orderdate` datetime NOT NULL,
  `totalprice` decimal(10, 2) NULL DEFAULT NULL,
  `status` tinyint(1) NULL DEFAULT NULL,
  PRIMARY KEY (`orderid`) USING BTREE,
  INDEX `userid`(`userid`) USING BTREE,
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`userid`) REFERENCES `account` (`userid`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 20130416 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of orders
-- ----------------------------
INSERT INTO `orders` VALUES (20130411, 'u0001', '2020-04-11 15:07:34', 500.00, 0);
INSERT INTO `orders` VALUES (20130412, 'u0002', '2020-05-09 15:08:11', 305.60, 0);
INSERT INTO `orders` VALUES (20130413, 'u0003', '2020-06-15 15:09:00', 212.40, 0);
INSERT INTO `orders` VALUES (20130414, 'u0003', '2020-07-16 15:09:30', 120.45, 1);
INSERT INTO `orders` VALUES (20130415, 'u0004', '2020-04-02 15:10:05', 120.30, 0);

-- ----------------------------
-- Table structure for product
-- ----------------------------
DROP TABLE IF EXISTS `product`;
CREATE TABLE `product`  (
  `productid` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `catid` char(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `descn` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `listprice` decimal(10, 2) NULL DEFAULT NULL,
  `unitcost` decimal(10, 2) NULL DEFAULT NULL,
  `qty` int NOT NULL,
  PRIMARY KEY (`productid`) USING BTREE,
  INDEX `catid`(`catid`) USING BTREE,
  CONSTRAINT `product_ibfk_1` FOREIGN KEY (`catid`) REFERENCES `category` (`catid`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of product
-- ----------------------------
INSERT INTO `product` VALUES ('AV-CB-01', '01', '亚马逊鹦鹉', '75 岁以上高龄的好伙伴', 50.00, 60.00, 100);
INSERT INTO `product` VALUES ('AV-SB-02', '01', '燕雀', '非常好的减压宠物', 45.00, 50.00, 98);
INSERT INTO `product` VALUES ('FI-FW-01', '04', '锦鲤', '来自日本的淡水鱼', 45.50, 45.50, 300);
INSERT INTO `product` VALUES ('FI-FW-02', '04', '金鱼', '来自中国的淡水鱼', 6.80, 6.80, 100);
INSERT INTO `product` VALUES ('FI-SW-01', '04', '天使鱼', '来自澳大利亚的海水鱼', 10.00, 10.00, 100);
INSERT INTO `product` VALUES ('FI-SW-02', '04', '虎鲨', '来自澳大利亚的海水鱼', 18.50, 20.00, 200);
INSERT INTO `product` VALUES ('FL-DLH-02', '02', '波斯猫', '友好的家居猫, 像公主一样高贵', 1000.00, 1200.00, 15);
INSERT INTO `product` VALUES ('FL-DSH-01', '02', '马恩岛猫', '灭鼠能手', 80.00, 100.00, 40);
INSERT INTO `product` VALUES ('K9-BD-01', '03', '牛头犬', '来自英格兰的友好的狗', 1350.00, 1500.00, 5);
INSERT INTO `product` VALUES ('K9-CW-01', '03', '吉娃娃犬', '很好的陪伴狗', 180.00, 200.00, 120);
INSERT INTO `product` VALUES ('K9-DL-01', '03', '斑点狗', '来自消防队的大狗', 3000.00, 3000.00, 1);
INSERT INTO `product` VALUES ('K9-PO-02', '03', '狮子犬', '来自法国的可爱的狗', 2000.00, 2000.00, 3);
INSERT INTO `product` VALUES ('K9-RT-01', '03', '金毛猎犬', '大家庭的狗', 300.00, 300.00, 200);
INSERT INTO `product` VALUES ('K9-RT-02', '03', '拉布拉多猎犬', '大猎狗', 800.00, 800.00, 30);
INSERT INTO `product` VALUES ('RP-LI-02', '05', '鬣蜥', '友好的绿色朋友', 60.00, 78.00, 40);
INSERT INTO `product` VALUES ('RP-SN-01', '05', '玉米锦蛇', '兼当看门狗', 200.00, 240.00, 10);

SET FOREIGN_KEY_CHECKS = 1;
