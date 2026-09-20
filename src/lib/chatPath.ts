export function chatHref(threadId?: string) {
  return threadId ? `/social/chat/${threadId}` : '/social/chat'
}
