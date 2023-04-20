import chalk from 'chalk'

chalk.level = 1

export function errorLog(message: string) {
	console.log(chalk.red(`${message}\n`))
}

export function successLog(message: string) {
	console.log(chalk.green(`${message}\n`))
}

export function infoLog(message: string) {
	console.log(chalk.blue(`${message}\n`))
}
