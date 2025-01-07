import generateModule from './templates/model.template.js';
import generateCrud from './templates/crud.template.js';
import generateAPI from './templates/api.template.js';

import { Command } from 'commander';

const program = new Command();

program
   .name('module_generator-cli')
   .description('CLI para generar modulos nuevos en el DAO y rutas de la aplicación')
   .version('1.0.0');

program
   .command('generate-module <name>')
   .description('Generar un nuevo modulo en el DAO de la aplicación')
   .action((name) => {
      promptModuleDetails(name);
   });

program
   .command('generate-crud <name>')
   .description('Generar el crud del modulo en el DAO de la aplicación')
   .action((name) => {
      promptCrudDetails(name);
   });

program
   .command('generate-api')
   .description('Generar las rutas del modulo en la API de la aplicación')
   .action(() => {
      promptModuleAPI();
   });

program.parse(process.argv);

async function promptModuleDetails(name) {
   const inquirer = (await import('inquirer')).default;

   const answers = await inquirer.prompt([
      {
         type: 'input',
         name: 'tableName',
         message: 'Ingrese el nombre de la tabla en la DB:',
      },
      {
         type: 'input',
         name: 'modelNameSingular',
         message: 'Ingrese el nombre del modelo (singular):',
      },
      {
         type: 'input',
         name: 'modelNamePlural',
         message: 'Ingrese el nombre del modelo (plural):',
      },
      {
         type: 'input',
         name: 'columns',
         message: 'Ingrese los nombres de las columnas (separados por coma):',
      },
      {
         type: 'input',
         name: 'aliases',
         message: 'Ingrese los alias de las columnas (separados por coma):',
      },
   ]);

   const columns = answers.columns.split(',').map((col) => col.trim());
   const aliases = answers.aliases.split(',').map((alias) => alias.trim());

   if (columns.length !== aliases.length) {
      console.error('La cantidad de columnas y alias no coincide.');
      return;
   }

   const types = {};

   for (let i = 0; i < columns.length; i++) {
      const typeAnswer = await inquirer.prompt({
         type: 'list',
         name: `type`,
         message: `Elija el tipo para la columna '${columns[i]}'`,
         choices: ['string', 'integer', 'double', 'decimal', 'boolean', 'date', 'dateonly', 'otro'],
      });
      types[columns[i]] = typeAnswer.type;

      if (typeAnswer.type === 'string') {
         const { length } = await inquirer.prompt({
            type: 'input',
            name: 'length',
            message: `Ingrese el largo para la columna '${columns[i]}' (entero positivo):`,
            validate: (input) => {
               const parsed = parseInt(input, 10);
               return Number.isInteger(parsed) && parsed > 0
                  ? true
                  : 'Por favor, ingrese un entero positivo.';
            },
         });
         types[columns[i]] = `string(${length})`;
      } else if (typeAnswer.type === 'otro') {
         const { type } = await inquirer.prompt({
            type: 'input',
            name: 'type',
            message: `Ingrese el tipo para la columna '${columns[i]}' (ej: string(50), integer, double, decimal, boolean, date, dateonly):`,
            validate: (input) => {
               return input ? true : 'Por favor, ingrese un tipo válido.';
            },
         });
         types[columns[i]] = type;
      }
   }
   generateModule(
      name,
      answers.tableName,
      answers.modelNameSingular,
      answers.modelNamePlural,
      columns,
      aliases,
      types,
   );

   generateCrud(name, answers.modelNameSingular, answers.modelNamePlural);
}

async function promptCrudDetails(name) {
   const inquirer = (await import('inquirer')).default;

   const answers = await inquirer.prompt([
      {
         type: 'input',
         name: 'modelNameSingular',
         message: 'Ingrese el nombre del modelo (singular):',
      },
      {
         type: 'input',
         name: 'modelNamePlural',
         message: 'Ingrese el nombre del modelo (plural):',
      },
   ]);

   generateCrud(name, answers.modelNameSingular, answers.modelNamePlural);
}

async function promptModuleAPI() {
   const inquirer = (await import('inquirer')).default;

   const answers = await inquirer.prompt([
      {
         type: 'input',
         name: 'name',
         message: 'Ingrese el nombre de la carpeta contenedora:',
      },
      {
         type: 'input',
         name: 'moduleSingular',
         message: 'Ingrese el nombre del modelo (singular):',
      },
      {
         type: 'input',
         name: 'modulePlural',
         message: 'Ingrese el nombre del modelo (plural):',
      },
      {
         type: 'input',
         name: 'modulePath',
         message: `Ingrese la ubicación de la carpeta contenedora separado por barras (relativa desde api/v1):`,
      },
   ]);

   generateAPI(answers.name, answers.moduleSingular, answers.modulePlural, answers.modulePath);
}
