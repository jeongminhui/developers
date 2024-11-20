// public/js/core/utils.js


export let editMode = null; // 현재 활성화된 편집 모드: null, 'menu', 'content'

// Fetch 요청에 대한 공통 유틸리티
export async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// 클래스 토글
export function toggleClass(element, className) {
  element.classList.toggle(className);
}
