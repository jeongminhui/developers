// public/js/content/contentUtils.js

// 콘텐츠 데이터에서 특정 해시 값을 기반으로 항목 찾기
export function findContentByHash(data, hash) {
  for (const item of data) {
    if (item.href === hash) return item;
    if (item.submenu) {
      const result = findContentByHash(item.submenu, hash);
      if (result) return result;
    }
  }
  return null;
}

// Breadcrumb 생성 시 경로를 탐색
export function findPathToContent(data, targetHref, path = []) {
  for (const item of data) {
    const newPath = [...path, item];
    if (item.href === targetHref) {
      return newPath; // 목표에 도달하면 경로 반환
    }
    if (item.submenu) {
      const result = findPathToContent(item.submenu, targetHref, newPath);
      if (result) return result;
    }
  }
  return null;
}
