document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const submitButton = form.querySelector('.btn-submit');
  const formData = {
    name: form.querySelector('#name').value.trim(),
    email: form.querySelector('#email').value.trim(),
    message: form.querySelector('#message').value.trim(),
  };

  // Client-side validation
  if (!formData.name) {
    showNotification('Por favor, insira seu nome.', 'error');
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    showNotification('Por favor, insira um e-mail válido.', 'error');
    return;
  }
  if (formData.message.length < 10) {
    showNotification('A mensagem deve ter pelo menos 10 caracteres.', 'error');
    return;
  }

  // Disable button and show loader
  submitButton.disabled = true;
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

  async function tryFetch(url, options, retries = 3, delay = 1000) {
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
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  }

  try {
    // Use current host for local development
    const backendUrl =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}/.netlify/functions/contact`
        : '/.netlify/functions/contact';

    console.log('Tentando enviar requisição para:', backendUrl);
    console.log('Dados enviados:', formData);

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
      if (response.status === 405) {
        throw new Error('Método não permitido. Verifique a configuração da função Netlify.');
      }
      if (response.status === 404) {
        throw new Error('Função não encontrada. Verifique se a função "contact" está configurada no Netlify.');
      }
      if (response.status === 500) {
        throw new Error('Erro no servidor. Pode ser um problema com a conexão ao MongoDB.');
      }
      throw new Error(`Erro ${response.status}: ${text || response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Resposta não é JSON:', text);
      throw new Error(`Resposta do servidor não é JSON: ${text}`);
    }

    const result = await response.json();
    console.log('Resultado JSON:', result);

    if (response.ok) {
      showNotification('Mensagem enviada com sucesso!', 'success');
      form.reset();
      setTimeout(() => {
        window.location.href = '/thank-you.html';
      }, 2000);
    } else {
      showNotification(`Erro: ${result.error || 'Falha ao enviar a mensagem.'}`, 'error');
    }
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    let errorMessage = error.message || 'Tente novamente mais tarde.';
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão ou tente novamente.';
    }
    showNotification(`Erro ao enviar a mensagem: ${errorMessage}`, 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Enviar Mensagem';
  }
});

// Função para exibir notificações
function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 5000);
}