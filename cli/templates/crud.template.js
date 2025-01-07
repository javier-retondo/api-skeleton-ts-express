import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateCrud(name, modelNameSingular, modelNamePlural) {
   const moduleDir = path.join(__dirname, '..', '..', 'src', 'dao', name);
   const crudDir = path.join(__dirname, '..', '..', 'src', 'dao', name, 'crud');

   if (!fs.existsSync(moduleDir)) {
      console.error(`El modulo ${name} no existe.`);
      return;
   }

   fs.mkdirSync(crudDir, { recursive: true });

   const createContent = generateCreateContent(modelNameSingular, modelNamePlural);
   fs.writeFileSync(path.join(crudDir, 'create.ts'), createContent);

   const deleteContent = generateDeleteContent(modelNameSingular, modelNamePlural);
   fs.writeFileSync(path.join(crudDir, 'delete.ts'), deleteContent);

   const findContent = generateFindContent(modelNameSingular, modelNamePlural);
   fs.writeFileSync(path.join(crudDir, 'find.ts'), findContent);

   const updateContent = generateUpdateContent(modelNameSingular, modelNamePlural);
   fs.writeFileSync(path.join(crudDir, 'update.ts'), updateContent);

   const patchContent = generatePatchContent(modelNameSingular, modelNamePlural);
   fs.writeFileSync(path.join(crudDir, 'patch.ts'), patchContent);

   const whereContent = generateWhereContent(modelNameSingular);
   fs.writeFileSync(path.join(crudDir, 'where.ts'), whereContent);

   console.log(`Las clases de crud del ${name} se generaron con éxito en ${crudDir}`);
   exec(`npx prettier --write ${crudDir}`, (error, stdout, stderr) => {
      if (error) {
         console.error(`Hubo un error al aplicar formato: ${stderr}`);
         return;
      }
      console.log(`Archivos formateados con éxito: ${stdout}`);
   });
}

function generateCreateContent(modelNameSingular, modelNamePlural) {
   return `
    import { I${capitalizeFirstLetter(modelNameSingular)} } from '../interface';
    import { ${capitalizeFirstLetter(modelNameSingular)} } from '../model';
    import { EntityCreator } from '../../../abstractions/sequelizeBases/baseCreate';
    import { ${toSnakeCase(modelNameSingular)} } from '../metadata';

    class ${capitalizeFirstLetter(modelNamePlural)}Creator extends EntityCreator<I${capitalizeFirstLetter(modelNameSingular)}> {
    model = ${capitalizeFirstLetter(modelNameSingular)};
    entityName = ${toSnakeCase(modelNameSingular)}.SINGULAR;
    }

    export const ${camellFirstLetter(modelNamePlural)}Creator = new ${capitalizeFirstLetter(modelNamePlural)}Creator();

    `;
}

function generateDeleteContent(modelNameSingular, modelNamePlural) {
   return `
    import { ${capitalizeFirstLetter(modelNameSingular)} } from '../model';
    import { EntityDeleter } from '../../../abstractions/sequelizeBases/baseDelete';
    import { ${toSnakeCase(modelNameSingular)} } from '../metadata';

    class ${capitalizeFirstLetter(modelNamePlural)}Deleter extends EntityDeleter {
    model = ${capitalizeFirstLetter(modelNameSingular)};
    entityName = ${toSnakeCase(modelNameSingular)}.SINGULAR;
    }

    export const ${camellFirstLetter(modelNamePlural)}Deleter = new ${capitalizeFirstLetter(modelNamePlural)}Deleter();
    `;
}

function generateFindContent(modelNameSingular, modelNamePlural) {
   return `
    import { I${capitalizeFirstLetter(modelNameSingular)}, I${capitalizeFirstLetter(modelNameSingular)}Associations, I${capitalizeFirstLetter(modelNameSingular)}ColumnsAliases } from '../interface';
    import { ${capitalizeFirstLetter(modelNameSingular)} } from '../model';
    import { ${toSnakeCase(modelNameSingular)} } from '../metadata';
    import { EntityFinder } from '../../../abstractions/sequelizeBases/baseFind';
    import { ${camellFirstLetter(modelNameSingular)}Includes } from '../includes';

    class ${capitalizeFirstLetter(modelNamePlural)}Finder extends EntityFinder<
    I${capitalizeFirstLetter(modelNameSingular)},
    I${capitalizeFirstLetter(modelNameSingular)}Associations,
    I${capitalizeFirstLetter(modelNameSingular)}ColumnsAliases
    > {
    model = ${capitalizeFirstLetter(modelNameSingular)};
    tableName = ${toSnakeCase(modelNameSingular)}.TABLE;
    columns = ${toSnakeCase(modelNameSingular)}.COLUMNS;
    associations = ${camellFirstLetter(modelNameSingular)}Includes;
    }
    export const ${camellFirstLetter(modelNamePlural)}Finder = new ${capitalizeFirstLetter(modelNamePlural)}Finder();
    `;
}

function generatePatchContent(modelNameSingular, modelNamePlural) {
   return `
    import { I${capitalizeFirstLetter(modelNameSingular)} } from '../interface';
    import { ${capitalizeFirstLetter(modelNameSingular)} } from '../model';
    import { ${toSnakeCase(modelNameSingular)} } from '../metadata';
    import { EntityPatcher } from '../../../abstractions/sequelizeBases/basePatch';

    class ${capitalizeFirstLetter(modelNamePlural)}Patcher extends EntityPatcher<I${capitalizeFirstLetter(modelNameSingular)}> {
    model = ${capitalizeFirstLetter(modelNameSingular)};
    entityName = ${toSnakeCase(modelNameSingular)}.SINGULAR;
    }

    export const ${camellFirstLetter(modelNamePlural)}Patcher = new ${capitalizeFirstLetter(modelNamePlural)}Patcher(); 
    `;
}

function generateUpdateContent(modelNameSingular, modelNamePlural) {
   return `
    import { I${capitalizeFirstLetter(modelNameSingular)} } from '../interface';
    import { ${capitalizeFirstLetter(modelNameSingular)} } from '../model';
    import { ${toSnakeCase(modelNameSingular)} } from '../metadata';
    import { EntityUpdater } from '../../../abstractions/sequelizeBases/baseUpdate';

    class ${capitalizeFirstLetter(modelNamePlural)}Updater extends EntityUpdater<I${capitalizeFirstLetter(modelNameSingular)}> {
    model = ${capitalizeFirstLetter(modelNameSingular)};
    entityName = ${toSnakeCase(modelNameSingular)}.SINGULAR;
    }

    export const ${camellFirstLetter(modelNamePlural)}Updater = new ${capitalizeFirstLetter(modelNamePlural)}Updater();
    `;
}

function generateWhereContent(modelNameSingular) {
   return `
    import { WhereOptions } from 'sequelize';
    import { EntityQueryBuilder } from '../../../abstractions/sequelizeBases/baseWhere';
    import { I${capitalizeFirstLetter(modelNameSingular)}, I${capitalizeFirstLetter(modelNameSingular)}ColumnsAliases } from '../interface';

    export class ${capitalizeFirstLetter(modelNameSingular)}Where extends EntityQueryBuilder<I${capitalizeFirstLetter(modelNameSingular)}> {
    columns: (keyof I${capitalizeFirstLetter(modelNameSingular)})[];
    tableName: string;
    where: WhereOptions<I${capitalizeFirstLetter(modelNameSingular)}> = [];
    constructor(columns: I${capitalizeFirstLetter(modelNameSingular)}ColumnsAliases, tableName: string) {
        super();
        this.tableName = tableName;
        this.columns = Object.values(columns);
    }
    }
    `;
}

function capitalizeFirstLetter(string) {
   return string.charAt(0).toUpperCase() + string.slice(1);
}

function camellFirstLetter(string) {
   return string.charAt(0).toLowerCase() + string.slice(1);
}

function toSnakeCase(string) {
   return string
      .replace(/([A-Z])/g, '_$1')
      .toUpperCase()
      .replace(/^_/, '');
}

export default generateCrud;
