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

  try {
      const response = await fetch('http://localhost:3000/contact', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
          timeout: 5000,
      });

      if (response.ok) {
          form.reset();
          window.location.href = 'thank-you.html';
      } else if (response.status === 400) {
          const errorData = await response.json();
          alert(`Erro: ${errorData.error}`);
      } else if (response.status === 404) {
          alert('Erro: Não foi possível encontrar o serviço de contato. Verifique se o servidor está ativo.');
      } else if (response.status === 500) {
          alert('Erro interno no servidor. Tente novamente mais tarde.');
      } else {
          alert('Erro desconhecido. Por favor, tente novamente.');
      }
  } catch (error) {
      console.error('Erro de conexão:', error);
      alert('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
  } finally {
      // Reabilitar botão
      submitButton.disabled = false;
      submitButton.textContent = 'Enviar Mensagem';
  }
});