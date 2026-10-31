const ALLOWED_TAGS = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'P', 'BR', 'DIV'])

function sanitizeNode(node: Node): Node | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(node.textContent ?? '')
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null
  }

  const element = node as HTMLElement
  const children = Array.from(element.childNodes)
    .map((child) => sanitizeNode(child))
    .filter((child): child is Node => child !== null)

  if (!ALLOWED_TAGS.has(element.tagName)) {
    const fragment = document.createDocumentFragment()
    children.forEach((child) => fragment.appendChild(child))
    return fragment
  }

  const clean = document.createElement(element.tagName.toLowerCase())
  children.forEach((child) => clean.appendChild(child))
  return clean
}

export function sanitizeQuestionHtml(html: string): string {
  if (!html.trim() || typeof document === 'undefined') {
    return ''
  }

  const template = document.createElement('template')
  template.innerHTML = html
  const container = document.createElement('div')

  Array.from(template.content.childNodes).forEach((child) => {
    const clean = sanitizeNode(child)
    if (clean) {
      container.appendChild(clean)
    }
  })

  return container.innerHTML
}

export function plainTextFromHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6])>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export function isRichTextEmpty(html: string): boolean {
  return plainTextFromHtml(html).length === 0
}

export function previewText(html: string, maxLength = 96): string {
  const text = plainTextFromHtml(html)
  if (text.length <= maxLength) {
    return text
  }
  return `${text.slice(0, maxLength).trimEnd()}…`
}

export function cleanQuestionHtml(html: string): string {
  const clean = sanitizeQuestionHtml(html)
  return isRichTextEmpty(clean) ? '' : clean
}
