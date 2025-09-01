const express = require('express')
const path = require('path')
const fs = require('fs').promises

const app = express()
const PORT = 3000

const ORIGINAIS_DIR = 'imagens_originais'
const OTIMIZADAS_DIR = 'imagens_otimizadas'

app.use(express.static('public'))
app.use('/originais', express.static(path.join(__dirname, ORIGINAIS_DIR)))
app.use('/otimizadas', express.static(path.join(__dirname, OTIMIZADAS_DIR)))

const formatarTamanho = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

app.get('/api/imagens', async (req, res) => {
  try {
    const pastaOriginais = path.join(__dirname, ORIGINAIS_DIR)
    const pastaOtimizadas = path.join(__dirname, OTIMIZADAS_DIR)

    const arquivosOriginais = await fs.readdir(pastaOriginais)

    const paresDeImagens = []

    for (const arquivo of arquivosOriginais) {
      if (arquivo.toLowerCase().endsWith('.jpg') || arquivo.toLowerCase().endsWith('.jpeg')) {
        const nomeBase = path.parse(arquivo).name
        const arquivoOtimizado = `${nomeBase}.avif`

        const caminhoOriginal = path.join(pastaOriginais, arquivo)
        const caminhoOtimizado = path.join(pastaOtimizadas, arquivoOtimizado)

        try {
          const statsOriginal = await fs.stat(caminhoOriginal)
          const statsOtimizada = await fs.stat(caminhoOtimizado)

          paresDeImagens.push({
            id: nomeBase,
            original: {
              path: `/originais/${arquivo}`,
              size: formatarTamanho(statsOriginal.size)
            },
            otimizada: {
              path: `/otimizadas/${arquivoOtimizado}`,
              size: formatarTamanho(statsOtimizada.size)
            }
          })
        } catch (e) {
          console.log(`Par otimizado para ${arquivo} não encontrado. Ignorando.`)
        }
      }
    }

    res.json(paresDeImagens)

  } catch (error) {
    console.error('Erro ao listar imagens:', error)
    res.status(500).json({ error: 'Falha ao ler os diretórios de imagens.' })
  }
})

app.get('/api/stats', async (req, res) => {
  const calcularTamanhoPasta = async (diretorio) => {
    try {
      const arquivos = await fs.readdir(diretorio)
      let tamanhoTotal = 0
      for (const arquivo of arquivos) {
        const stats = await fs.stat(path.join(diretorio, arquivo))
        tamanhoTotal += stats.size
      }
      return tamanhoTotal
    } catch (error) {
      if (error.code === 'ENOENT') {
        return 0
      }
      throw error
    }
  }

  try {
    const pastaOriginais = path.join(__dirname, ORIGINAIS_DIR)
    const pastaOtimizadas = path.join(__dirname, OTIMIZADAS_DIR)

    const tamanhoOriginais = await calcularTamanhoPasta(pastaOriginais)
    const tamanhoOtimizadas = await calcularTamanhoPasta(pastaOtimizadas)

    const reducaoPercentual = tamanhoOriginais > 0
      ? (((tamanhoOriginais - tamanhoOtimizadas) / tamanhoOriginais) * 100).toFixed(1)
      : 0

    res.json({
      original: {
        size: formatarTamanho(tamanhoOriginais)
      },
      optimized: {
        size: formatarTamanho(tamanhoOtimizadas)
      },
      reduction: `${reducaoPercentual}%`
    })

  } catch (error) {
    console.error('Erro ao calcular estatísticas das pastas:', error)
    res.status(500).json({ error: 'Falha ao calcular o tamanho das pastas.' })
  }
})

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})