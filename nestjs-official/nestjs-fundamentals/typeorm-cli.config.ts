import { Coffee } from 'src/coffees/entities/coffee.entity';
import { Flavor } from 'src/coffees/entities/flavor.entity';
import { CoffeeRefactor1752829338119 } from 'src/migrations/1752829338119-CoffeeRefactor';
import { SchemaSync1752830880981 } from 'src/migrations/1752830880981-SchemaSync';
import { DataSource } from 'typeorm';

/* typeorm-cli.config.ts */
export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'pass123',
  database: 'postgres',
  entities: [Coffee, Flavor],
  migrations: [CoffeeRefactor1752829338119, SchemaSync1752830880981],
});
