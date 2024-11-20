// public/js/content/contentApi.js

// 콘텐츠 저장 API 호출
export async function updateContent(href, title, content) {
  const response = await fetch('/api/content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ href, title, content }),
  });
  return response.ok;
}
