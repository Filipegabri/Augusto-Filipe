document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const submitButton = form.querySelector('.btn-submit');
  const formData = {
    name: form.querySelector('#name').value.trim(),
    email: form.querySelector('#email').value.trim(),
    message: form.querySelector('#message').value.trim(),
  };

  // Validação no frontend
  if (!formData.name) {
    alert('Por favor, insira seu nome.');
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    alert('Por favor, insira um e-mail válido.');
    return;
  }
  if (formData.message.length < 10) {
    alert('A mensagem deve ter pelo menos 10 caracteres.');
    return;
  }

  // Desabilitar botão durante a requisição
  submitButton.disabled = true;
  submitButton.textContent = 'Enviando...';

  // Função para tentar a requisição com reintentos
  async function tryFetch(url, options, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          signal: AbortSignal.timeout(10000), // Timeout de 10 segundos
        });
        return response;
      } catch (error) {
        if (i < retries - 1) {
          console.warn(`Tentativa ${i + 1} falhou. Tentando novamente em ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  }

  try {
    // Enviar dados ao backend
    const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3000/contact'
      : 'https://augusto-g-filipe.onrender.com/contact'; // URL absoluta em produção
    const response = await tryFetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (response.ok) {
      alert('Mensagem enviada com sucesso!');
      form.reset();
    } else {
      alert(`Erro: ${result.error || 'Falha ao enviar a mensagem.'}`);
    }
  } catch (error) {
    alert(`Erro ao enviar a mensagem: ${error.message || 'Tente novamente mais tarde.'}`);
    console.error('Erro:', error);
  } finally {
    // Reabilitar botão
    submitButton.disabled = false;
    submitButton.textContent = 'Enviar';
  }
});