-- AlterTable
ALTER TABLE `Shop` ADD COLUMN `monthlySubscriptionFee` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `shopType` VARCHAR(191) NOT NULL DEFAULT 'COMMISSION';

-- CreateTable
CREATE TABLE `PlatformSettings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `platformFee` DOUBLE NOT NULL DEFAULT 20,
    `deliveryCharge` DOUBLE NOT NULL DEFAULT 20,
    `freeDeliveryThreshold` DOUBLE NOT NULL DEFAULT 150,
    `minimumOrderAmount` DOUBLE NOT NULL DEFAULT 0,
    `basicPlanPrice` DOUBLE NOT NULL DEFAULT 499,
    `basicPlanFeatures` VARCHAR(191) NOT NULL DEFAULT 'Basic listing,Standard support',
    `standardPlanPrice` DOUBLE NOT NULL DEFAULT 999,
    `standardPlanFeatures` VARCHAR(191) NOT NULL DEFAULT 'Featured listing,Priority support,Analytics',
    `premiumPlanPrice` DOUBLE NOT NULL DEFAULT 1999,
    `premiumPlanFeatures` VARCHAR(191) NOT NULL DEFAULT 'Top listing,24/7 support,Advanced analytics,Promotions',
    `defaultCommissionRate` DOUBLE NOT NULL DEFAULT 10,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
