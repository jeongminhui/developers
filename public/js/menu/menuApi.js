// public/js/menu/menuApi.js
import { fetchData } from '../core/utils.js';

// 메뉴 항목 추가
export async function addMenuItem(newMenuItem) {
  const response = await fetch('/api/addContent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newMenuItem),
  });
  return response.ok;
}

// 메뉴 항목 삭제
export async function deleteMenuItem(href) {
  const data = await fetchData('/data/content.json');
  
  // 삭제 대상 항목 찾기
  const deleteMenuByHref = (items, href) => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.href === href) {
        items.splice(i, 1); // 항목 삭제
        return true;
      }
      if (item.submenu) {
        if (deleteMenuByHref(item.submenu, href)) return true;
      }
    }
    return false;
  };

  if (deleteMenuByHref(data, href)) {
    // JSON 파일에 업데이트된 데이터 저장
    const response = await fetch('/api/updateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.ok;
  }
  return false;
}
