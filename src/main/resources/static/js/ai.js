// BasketHub AI shopping assistant (chat box on the home page)
(function () {
  const fab = document.getElementById('aiFab');
  const panel = document.getElementById('aiPanel');
  const form = document.getElementById('aiForm');
  const input = document.getElementById('aiInput');
  const log = document.getElementById('aiLog');
  if (!fab || !panel || !form) return;

  function addMsg(text, who) {
    const div = document.createElement('div');
    div.className = 'ai-msg ai-' + who;
    div.textContent = text;            // textContent keeps it safe from HTML injection
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
    return div;
  }

  addMsg('Hi! Tell me what you are looking for, e.g. "a gift under ₹1000".', 'bot');

  fab.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) input.focus();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    if (!localStorage.getItem('token')) {
      addMsg('Please sign in first to chat with the assistant.', 'bot');
      return;
    }

    addMsg(question, 'user');
    input.value = '';
    const waiting = addMsg('Thinking…', 'bot');

    const res = await authFetch('/api/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ question })
    });
    if (!res) { waiting.remove(); return; }

    const data = await res.json().catch(() => ({}));
    waiting.textContent = res.ok
      ? data.answer
      : (data.error || data.question || 'Something went wrong. Please try again.');
  });
})();
