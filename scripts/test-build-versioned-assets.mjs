import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const buildVersion = process.env.BUILD_VERSION
if (!buildVersion) {
  throw new Error('请先设置 BUILD_VERSION，例如：BUILD_VERSION=20260430 npm run build')
}

const distDir = join(process.cwd(), 'dist')
const indexPath = join(distDir, 'index.html')

if (!existsSync(indexPath)) {
  throw new Error('dist/index.html 不存在，请先执行 npm run build')
}

const indexHtml = readFileSync(indexPath, 'utf8')
const referencedAssets = [...indexHtml.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((assetPath) => /\/assets\/.+\.(js|css)(?:$|\?)/.test(assetPath))

if (referencedAssets.length === 0) {
  throw new Error('dist/index.html 中没有找到构建产物 JS/CSS 引用')
}

const missingVersionRefs = referencedAssets.filter((assetPath) => !assetPath.includes(buildVersion))
if (missingVersionRefs.length > 0) {
  throw new Error(`以下 index.html 引用未包含 BUILD_VERSION=${buildVersion}：\n${missingVersionRefs.join('\n')}`)
}

const walkFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = join(dir, entry.name)
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath]
  })

const builtAssets = walkFiles(join(distDir, 'assets')).filter((filePath) => /\.(js|css)$/.test(filePath))
const missingVersionFiles = builtAssets.filter((filePath) => !filePath.includes(buildVersion))

if (missingVersionFiles.length > 0) {
  throw new Error(`以下构建产物文件名未包含 BUILD_VERSION=${buildVersion}：\n${missingVersionFiles.join('\n')}`)
}

console.log(`构建产物 JS/CSS 文件名已包含 BUILD_VERSION=${buildVersion}`)
