// Handle form submission
document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const submitButton = form.querySelector('.btn-submit');
  const formData = {
    name: form.querySelector('#name').value.trim(),
    email: form.querySelector('#email').value.trim(),
    message: form.querySelector('#message').value.trim(),
  };

  // Frontend validation (translated to English)
  if (!formData.name) {
    alert('Please enter your name.');
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    alert('Please enter a valid email.');
    return;
  }
  if (formData.message.length < 10) {
    alert('The message must be at least 10 characters long.');
    return;
  }

  // Disable submit button
  submitButton.disabled = true;
  submitButton.textContent = 'Sending...';

  // Retry fetch function with timeout
  async function tryFetch(url, options, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          signal: AbortSignal.timeout(5000), // 5-second timeout
        });
        return response;
      } catch (error) {
        if (i < retries - 1) {
          console.warn(`Attempt ${i + 1} failed. Retrying in ${delay}ms...`, error);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  }

  try {
    // Determine backend URL based on environment
    const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3000/api/contact'
      : 'https://augusto-g-filipe.vercel.app/api/contact';

    console.log('Sending request to:', backendUrl);

    const response = await tryFetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    console.log('Server response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Server response (non-OK):', text);
      throw new Error(`Error ${response.status}: ${text || response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Response is not JSON:', text);
      throw new Error(`Error ${response.status}: Server response is not JSON (Content-Type: ${contentType || 'none'}): ${text}`);
    }

    const result = await response.json();

    if (response.ok) {
      alert('Message sent successfully!');
      form.reset();
      window.location.href = '/thanks.html';
    } else {
      alert(`Error: ${result.error || 'Failed to send message.'}`);
    }
  } catch (error) {
    console.error('Error sending message:', error);
    let errorMessage = error.message || 'Try again later.';
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      errorMessage = 'Could not connect to the server. Check if the backend is active or try again later.';
    } else if (error.name === 'TimeoutError') {
      errorMessage = 'Request timed out. Please try again.';
    }
    alert(`Error sending message: ${errorMessage}`);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Send';
  }
});