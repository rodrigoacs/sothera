const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const INPUT_DIR = 'imagens_originais'
const OUTPUT_DIR = 'imagens_otimizadas'
const MAX_HEIGHT = 500
const MAX_WIDTH = 356
const QUALITY = 65
const EFFORT = 6

console.time('Tempo de processamento')

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
}

fs.readdir(INPUT_DIR, (err, files) => {
  if (err) {
    console.error("Erro ao ler o diretório de entrada:", err)
    console.timeEnd('Tempo de processamento')
    return
  }

  const imageFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase()
    return ext === '.jpg' || ext === '.jpeg'
  })

  if (imageFiles.length === 0) {
    console.log("Nenhuma imagem JPG/JPEG encontrada para processar.")
    console.timeEnd('Tempo de processamento')
    return
  }

  let count = 0

  const promises = imageFiles.map(file => {
    const inputFile = path.join(INPUT_DIR, file)
    const outputFile = path.join(OUTPUT_DIR, `${path.parse(file).name}.avif`)

    try {
      return sharp(inputFile)
        .resize({ width: MAX_WIDTH, height: MAX_HEIGHT, withoutEnlargement: true, fit: 'inside' })
        .avif({ quality: QUALITY, effort: EFFORT })
        .toFile(outputFile)
        .then(() => {
          console.log(`processando ${++count} de ${imageFiles.length}: ${file}`)
        })
    } catch (err) {
      return console.error(`Erro ao processar ${file}:`, err)
    } finally {

    }
  })

  Promise.all(promises).then(() => {
    console.log('Todas as imagens foram processadas com sucesso.')
    console.timeEnd('Tempo de processamento')
  })
})