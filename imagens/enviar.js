document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault(); // Impedir o envio padrão

  const form = e.target;
  const formData = {
    name: form.querySelector('#name').value,
    email: form.querySelector('#email').value,
    message: form.querySelector('#message').value,
  };

  try {
    const response = await fetch('http://localhost:3000/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      form.reset(); // Limpar os campos do formulário
      window.location.href = 'thank-you.html'; // Redirecionar para a página de agradecimento
    } else {
      const errorData = await response.json(); // Parsear JSON do erro
      alert(`Erro ao enviar mensagem: ${errorData.error}`);
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao enviar mensagem: Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
  }
});