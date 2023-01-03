export default class ContentManager {
  exports: string[] = []
  defaultExport: string = ''
  contextCode: string = ''

  addContext(contextCode: string): void {
    this.contextCode += `${contextCode}\n`
  }

  addExport(exported: string): void {
    this.exports.push(exported)
  }

  addDefaultExport(exported: string): void {
    this.defaultExport = exported
  }

  export(): string {
    const contentArr = [
      this.contextCode,
      `export { ${this.exports.join(', ')} }`
    ]

    if (this.defaultExport) {
      contentArr.push(`export default ${this.defaultExport}`)
    }

    return contentArr.join('\n')
  }
}
