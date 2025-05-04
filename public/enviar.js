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

  // Desabilitar botão
  submitButton.disabled = true;
  submitButton.textContent = 'Enviando...';

  // Função para tentar a requisição
  async function tryFetch(url, options, retries = 5, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          signal: AbortSignal.timeout(10000),
        });
        return response;
      } catch (error) {
        if (i < retries - 1) {
          console.warn(`Tentativa ${i + 1} falhou. Tentando novamente em ${delay}ms...`, error);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  }

  try {
    // URL do backend
    const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3000/api/contact'
      : 'https://augusto-g-filipe.vercel.app/api/contact';

    console.log('Enviando requisição para:', backendUrl);

    const response = await tryFetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    console.log('Resposta do servidor:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Resposta do servidor (não-OK):', text);
      throw new Error(`Erro ${response.status}: ${text || response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Resposta não é JSON:', text);
      throw new Error(`Erro ${response.status}: Resposta do servidor não é JSON (Content-Type: ${contentType || 'nenhum'}): ${text}`);
    }

    const result = await response.json();

    if (response.ok) {
      alert('Mensagem enviada com sucesso!');
      form.reset();
      window.location.href = '/thanks.html';
    } else {
      alert(`Erro: ${result.error || 'Falha ao enviar a mensagem.'}`);
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    let errorMessage = error.message || 'Tente novamente mais tarde.';
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      errorMessage = 'Não foi possível conectar ao servidor. Verifique se o backend está ativo ou tente novamente mais tarde.';
    }
    alert(`Erro ao enviar a mensagem: ${errorMessage}`);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Enviar';
  }
});