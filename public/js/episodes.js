document.addEventListener('DOMContentLoaded', () => {
  const playButtons = document.querySelectorAll('.play-btn');

  playButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      try {
        const res = await fetch(`/episodes/${id}/listen`, { method: 'POST' });
        const data = await res.json();
        
        if (res.ok) {
          alert(`Воспроизведение начато! Всего прослушиваний: ${data.playsCount}`);
        } else {
          alert(data.error || 'Не удалось запустить воспроизведение');
        }
      } catch (err) {
        console.error('Ошибка при воспроизведении:', err);
      }
    });
  });
});