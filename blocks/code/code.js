/* global Prism */

/**
 * Code block: renders a syntax-highlighted code snippet with a copy button.
 * Language comes from a `language-*` variant class on the block. Highlighting
 * uses Prism (loaded via head.html); it degrades gracefully if Prism is absent.
 */
export default async function decorate(block) {
  const classList = block.className.split(' ');
  const languageClass = classList.find((cls) => cls.startsWith('language-'));

  const preElement = block.querySelector('pre');
  const codeElement = block.querySelector('code');
  if (!preElement || !codeElement) return;

  if (languageClass) {
    preElement.classList.add(languageClass);
    codeElement.classList.add(languageClass);
    if (typeof Prism !== 'undefined' && Prism.highlightElement) {
      Prism.highlightElement(codeElement);
    }
  }

  // Copy button
  const copyButton = document.createElement('button');
  copyButton.classList.add('copy-code-button');
  copyButton.type = 'button';
  copyButton.textContent = 'Copy';

  block.style.position = 'relative';
  block.insertBefore(copyButton, block.firstChild);

  copyButton.addEventListener('click', () => {
    const codeContent = codeElement.innerText;
    navigator.clipboard.writeText(codeContent)
      .then(() => {
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
          copyButton.textContent = 'Copy';
        }, 3000);
      })
      // eslint-disable-next-line no-console
      .catch((err) => console.error('Failed to copy:', err));
  });
}
