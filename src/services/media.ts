/** Media URL helpers */
export function mediaUrl(rel: string) {
  return rel.startsWith('/') ? rel : `/${rel}`
}

