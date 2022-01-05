-- --------------------------------------------------------
-- ホスト:                          ap2g_srv2
-- Server version:               5.5.21 - MySQL Community Server (GPL)
-- Server OS:                    Win32
-- HeidiSQL バージョン:               8.1.0.4545
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping structure for テーブル tools.t_作業受付
DROP TABLE IF EXISTS `t_作業受付`;
CREATE TABLE IF NOT EXISTS `t_作業受付` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date_start` datetime DEFAULT NULL COMMENT '発生日時',
  `date_demand` datetime DEFAULT NULL COMMENT '納期',
  `date_end` datetime DEFAULT NULL COMMENT '回復日時',
  `branch` varchar(50) NOT NULL DEFAULT '支店Z' COMMENT '拠点',
  `type` varchar(50) NOT NULL DEFAULT 'その他' COMMENT '参照分類',
  `origin_location` char(1) DEFAULT NULL COMMENT '原因所在（月次集計データ）',
  `origin_system` char(1) DEFAULT NULL COMMENT '対象分類（月次修正データ）',
  `detail` text COMMENT '内容',
  `manage` text COMMENT '対処',
  `comment` text COMMENT 'コメント',
  `work_time` int(11) DEFAULT '0' COMMENT '作業時間',
  `status` varchar(20) DEFAULT '0' COMMENT '進捗状況',
  `flag_report` tinyint(1) NOT NULL DEFAULT '0' COMMENT '月次報告',
  `person_request` varchar(100) DEFAULT NULL COMMENT '発信元',
  `person_in_charge` varchar(50) DEFAULT 'noname' COMMENT '担当者名',
  `person_write` varchar(50) DEFAULT 'noname' COMMENT '記入者名',
  `ip` char(15) DEFAULT NULL COMMENT '更新者IP',
  `insert_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `update_date` datetime DEFAULT NULL,
  `delete_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
