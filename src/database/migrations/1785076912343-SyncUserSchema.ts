import { MigrationInterface, QueryRunner } from "typeorm";

export class SyncUserSchema1785076912343 implements MigrationInterface {
    name = 'SyncUserSchema1785076912343'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "avatarMetadata" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatarMetadata"`);
    }

}
