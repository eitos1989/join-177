document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.querySelector('.overlay'); // Ersetzen Sie '.overlay' mit dem tatsächlichen Klassennamen Ihres Overlay-Elements
    overlay.addEventListener('animationend', () => {
      overlay.remove(); // Entfernt das Overlay-Element aus dem DOM
    });
  });