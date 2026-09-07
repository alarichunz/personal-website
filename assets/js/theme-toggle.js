// Light / dark toggle. The initial theme is set inline in <head> (see
// baseof.html "theme-init") to avoid a flash; this only handles clicks.
(function () {
  const root = document.documentElement;

  function current() {
    return root.dataset.theme === 'dark' ? 'dark' : 'light';
  }

  function apply(theme) {
    root.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }

  document.querySelectorAll('.theme-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      apply(current() === 'dark' ? 'light' : 'dark');
    });
  });
})();
