// Apply the saved choices before the stylesheet paints.
try {
  const theme = localStorage.getItem('kartstart-theme');
  const language = localStorage.getItem('kartstart-language');
  if (theme === 'light') {
    document.documentElement.dataset.theme = 'light';
    document.querySelector('meta[name="theme-color"]').content = '#f5f5ef';
  }
  if (['ru', 'en', 'az'].includes(language)) {
    document.documentElement.lang = language;
  }
} catch {
  // The default theme and language are available when storage is blocked.
}
