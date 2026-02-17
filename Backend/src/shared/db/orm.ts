import { MikroORM } from "@mikro-orm/core";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { MySqlDriver } from "@mikro-orm/mysql";
import { runSeeders } from "./seeder.js";

export const orm = await MikroORM.init({
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  clientUrl: 'mysql://admin:admin@127.0.0.1:3307/Petsbnb',
  highlighter: new SqlHighlighter(),
  driver: MySqlDriver,
  debug: true,
  schemaGenerator: {
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
    ignoreSchema: []
  }
})

export const syncSchema = async () => {
  console.log("🔄 Sincronizando esquema de la base de datos...");
  const generator = orm.getSchemaGenerator();
  await generator.updateSchema();

  const em = orm.em.fork();
  await runSeeders(em);

}