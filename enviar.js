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
    // Enviar dados ao backend
    const response = await fetch('/api/enviar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (response.ok) {
      alert('Mensagem enviada com sucesso!');
      form.reset(); // Limpar o formulário
    } else {
      alert(`Erro: ${result.error || 'Falha ao enviar a mensagem.'}`);
    }
  } catch (error) {
    alert('Erro ao enviar a mensagem. Tente novamente mais tarde.');
    console.error('Erro:', error);
  } finally {
    // Reabilitar botão
    submitButton.disabled = false;
    submitButton.textContent = 'Enviar';
  }
});