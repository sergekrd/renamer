const fs = require('fs');
const path = require('path');

// Настройки для замены путей
const aliasMappings = {
  "@application": "../application",
  "@config": "../config",
  "@domain": "../domain",
  "@infrastructure": "../infrastructure",
  "@tests": "../__tests__",
  "@automation/": "automation/",
};

// Исключения для папок
const excludedDirs = ['node_modules', 'dist', '.git'];

const fileExtensions = ['.ts', '.tsx', '.js', '.jsx']; // Файлы для обработки

/**
 * Рекурсивно обходит директорию и возвращает список всех файлов с заданными расширениями
 * @param {string} dir - Путь к директории
 * @returns {string[]} - Список файлов
 */
function getFilesInDirectory(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  for (const file of list) {
    if (excludedDirs.includes(file)) {
        continue;
      }
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesInDirectory(filePath));
    } else if (fileExtensions.includes(path.extname(file))) {
      results.push(filePath);
    }
  }

  return results;
}

/**
 * Заменяет пути импорта в файле согласно заданным алиасам
 * @param {string} filePath - Путь к файлу
 */
function replaceImportPaths(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updatedContent = content;

  for (const [alias, target] of Object.entries(aliasMappings)) {
    const regex = new RegExp(`^(import .*?['"])(\\.{1,2}/)+${target}/`, 'gm');
    updatedContent = updatedContent.replace(regex, `$1${alias}/`);
  }

  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`Обновлено: ${filePath}`);
  }
}

/**
 * Обходит папку и заменяет пути в файлах
 * @param {string} folderPath - Путь к папке
 */
function processFolder(folderPath) {
  const files = getFilesInDirectory(folderPath);
  files.forEach(replaceImportPaths);
}


const targetFolder = path.resolve(process.argv[2] || '.');
processFolder(targetFolder);
console.log('Замена завершена!');