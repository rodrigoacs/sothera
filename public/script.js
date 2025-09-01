document.addEventListener('DOMContentLoaded', () => {
  const imageList = document.getElementById('imageList')
  const welcomeMessage = document.getElementById('welcomeMessage')
  const comparisonContainer = document.getElementById('comparisonContainer')
  const originalCard = document.getElementById('originalCard')
  const optimizedCard = document.getElementById('optimizedCard')
  let activeListItem = null

  function displayImages(original, otimizada) {
    welcomeMessage.classList.add('hidden')
    comparisonContainer.classList.remove('hidden')

    originalCard.innerHTML = `
            <h2>Original (JPG)</h2>
            <img src="${original.path}" alt="Imagem Original">
            <p>Tamanho: ${original.size}</p>
        `
    optimizedCard.innerHTML = `
            <h2>Otimizada (WebP)</h2>
            <img src="${otimizada.path}" alt="Imagem Otimizada">
            <p>Tamanho: ${otimizada.size}</p>
        `
  }

  async function carregarListaDeImagens() {
    try {
      const response = await fetch('/api/imagens')
      if (!response.ok) throw new Error('Falha ao buscar a lista de imagens.')

      const imagens = await response.json()

      if (imagens.length === 0) {
        imageList.innerHTML = '<li>Nenhuma imagem encontrada. Verifique as pastas.</li>'
        return
      }

      imagens.forEach(par => {
        const li = document.createElement('li')
        li.textContent = par.id
        li.onclick = () => {
          if (activeListItem) {
            activeListItem.classList.remove('active')
          }
          li.classList.add('active')
          activeListItem = li

          displayImages(par.original, par.otimizada)
        }
        imageList.appendChild(li)
      })

    } catch (error) {
      console.error('Erro:', error)
      imageList.innerHTML = '<li>Erro ao carregar imagens.</li>'
    }
  }

  carregarListaDeImagens()
  carregarEstatisticas()
})

async function carregarEstatisticas() {
  const statsBox = document.getElementById('folderStats')
  statsBox.innerHTML = '<p>Calculando...</p>'

  try {
    const response = await fetch('/api/stats')
    if (!response.ok) throw new Error('Falha ao buscar estatísticas.')

    const stats = await response.json()

    statsBox.innerHTML = `
            <h3>Tamanho Total</h3>
            <div class="stat-item">
                <span>Originais:</span>
                <strong>${stats.original.size}</strong>
            </div>
            <div class="stat-item">
                <span>Otimizadas:</span>
                <strong>${stats.optimized.size}</strong>
            </div>
            <div class="stat-reduction">
                <span>Redução:</span>
                <strong>${stats.reduction}</strong>
            </div>
        `

  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error)
    statsBox.innerHTML = '<p>Erro ao carregar totais.</p>'
  }
}