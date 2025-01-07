import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateModule(
   name,
   tableName,
   modelNameSingular,
   modelNamePlural,
   columns,
   aliases,
   types,
) {
   const moduleDir = path.join(__dirname, '..', '..', 'src', 'dao', name);

   if (fs.existsSync(moduleDir)) {
      console.log(`El modulo ${name} ya existe.`);
      return;
   }

   fs.mkdirSync(moduleDir, { recursive: true });

   fs.writeFileSync(path.join(moduleDir, 'associations.ts'), '');

   const includeContent = generateIncludeContent(modelNameSingular);
   fs.writeFileSync(path.join(moduleDir, 'includes.ts'), includeContent);

   const interfaceContent = generateInterfaceContent(modelNameSingular, columns, aliases, types);
   fs.writeFileSync(path.join(moduleDir, 'interface.ts'), interfaceContent);

   const metadataContent = generateMetadataContent(
      modelNameSingular,
      modelNamePlural,
      tableName,
      aliases,
      columns,
   );
   fs.writeFileSync(path.join(moduleDir, 'metadata.ts'), metadataContent);

   const modelContent = generateModelContent(modelNameSingular, columns, types);
   fs.writeFileSync(path.join(moduleDir, 'model.ts'), modelContent);

   console.log(`El modulo ${name} se generó con éxito en ${moduleDir}`);
   exec(`npx prettier --write ${moduleDir}`, (error, stdout, stderr) => {
      if (error) {
         console.error(`Hibo un error al aplicar formato: ${stderr}`);
         return;
      }
      console.log(`Archivos formateados con éxito: ${stdout}`);
   });
}

function generateInterfaceContent(modelNameSingular, columns, aliases, types) {
   return `
    export type I${capitalizeFirstLetter(modelNameSingular)} = {
    ${columns
       .map((col) => {
          const type = types[col].split('(')[0];
          switch (type) {
             case 'string':
                return `   ${col}?: string;`;
             case 'integer':
                return `   ${col}?: number;`;
             case 'double':
                return `   ${col}?: number;`;
             case 'decimal':
                return `   ${col}?: number;`;
             case 'boolean':
                return `   ${col}?: boolean;`;
             case 'date':
                return `   ${col}?: Date;`;
             case 'onlydate':
                return `   ${col}?: Date;`;
             default:
                break;
          }
          `   ${col}: ${types[col]};`;
       })
       .join('\n')}
    };
 
    type ${capitalizeFirstLetter(modelNameSingular)}ColumnAliasKeys =
    ${aliases.map((alias) => `  | '${alias}'`).join('\n')};
    ;
 
    export type I${capitalizeFirstLetter(modelNameSingular)}ColumnsAliases = {
    [key in ${capitalizeFirstLetter(modelNameSingular)}ColumnAliasKeys]: keyof I${capitalizeFirstLetter(modelNameSingular)};
    };
 
    export type I${capitalizeFirstLetter(modelNameSingular)}Associations = object;
    `;
}

function generateMetadataContent(modelNameSingular, modelNamePlural, tableName, aliases, columns) {
   return `
    import { IMetadata } from '../../utils/interfaces/general';
    import { I${capitalizeFirstLetter(modelNameSingular)}Associations, I${capitalizeFirstLetter(modelNameSingular)}ColumnsAliases } from './interface';
 
    export const ${toSnakeCase(modelNameSingular)}: IMetadata<I${capitalizeFirstLetter(modelNameSingular)}ColumnsAliases, I${capitalizeFirstLetter(modelNameSingular)}Associations> = {
       TABLE: '${tableName}',
       COLUMNS: {
          ${aliases.map((alias, index) => `${alias}: '${columns[index]}'`).join(',\n')}
       },
       PLURAL: '${capitalizeFirstLetter(modelNamePlural)}',
       SINGULAR: '${capitalizeFirstLetter(modelNameSingular)}',
       ASSOCIATIONS: {},
    };
 `;
}

function generateModelContent(modelNameSingular, columns, types) {
   return `
    import { DataTypes, Model, Optional } from 'sequelize';
    import { sequelize } from '../../config';
    import { ${toSnakeCase(modelNameSingular)} } from './metadata';
    import { I${capitalizeFirstLetter(modelNameSingular)} } from './interface';
 
    type ${capitalizeFirstLetter(modelNameSingular)}CreationAttributes = Optional<I${capitalizeFirstLetter(modelNameSingular)}, '${columns[0]}'>;
 
    class ${capitalizeFirstLetter(modelNameSingular)} extends Model<I${capitalizeFirstLetter(modelNameSingular)}, ${capitalizeFirstLetter(modelNameSingular)}CreationAttributes> {}
 
    ${capitalizeFirstLetter(modelNameSingular)}.init(
    {
       ${columns
          .map((col, index) => {
             if (index === 0) {
                return `         ${col}: {
          type: DataTypes.${types[col].toUpperCase()},
          primaryKey: true,
          autoIncrement: true,
       },`;
             }
             if (types[col] === 'decimal') {
                return `         ${col}: {
            type: DataTypes.${types[col].toUpperCase()}(10, 2),
            allowNull: false,
         },`;
             }
             return `         ${col}: {
          type: DataTypes.${types[col].toUpperCase()},
          allowNull: false,
       },`;
          })
          .join('\n')}      
    },
    {
       sequelize: sequelize,
       tableName: ${toSnakeCase(modelNameSingular)}.TABLE,
       timestamps: false,
       modelName: ${toSnakeCase(modelNameSingular)}.SINGULAR,
       name: {
          plural: ${toSnakeCase(modelNameSingular)}.PLURAL,
          singular: ${toSnakeCase(modelNameSingular)}.SINGULAR,
       },
    },
    );
 
    export { ${capitalizeFirstLetter(modelNameSingular)} };
 `;
}

function generateIncludeContent(modelNameSingular) {
   return `
    import { I${capitalizeFirstLetter(modelNameSingular)}Associations } from './interface';

    export const ${modelNameSingular.toLowerCase()}Includes: {
    model: any;
    as: I${capitalizeFirstLetter(modelNameSingular)}Associations[keyof I${capitalizeFirstLetter(modelNameSingular)}Associations];
    attributes: string[];
    include?: {
        model: any;
        as: string;
        attributes: string[];
    }[];
    }[] = [];
    `;
}

function capitalizeFirstLetter(string) {
   return string.charAt(0).toUpperCase() + string.slice(1);
}

function toSnakeCase(string) {
   return string
      .replace(/([A-Z])/g, '_$1')
      .toUpperCase()
      .replace(/^_/, '');
}

export default generateModule;
