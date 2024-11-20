// public/js/content/contentLoader.js

import { fetchData } from '../core/utils.js';
import { findContentByHash } from './contentUtils.js';
import { renderBreadcrumb } from '../ui/breadcrumbRenderer.js';
import { initializeEditor, destroyEditor } from '../editor/editorControls.js';
import { initializeModal } from "../ui/modalManager.js";

let contentData = null;

// JSON 데이터 로드 및 초기 렌더링
export async function loadContentData() {
  contentData = await fetchData('/data/content.json');
  renderContentFromHash(contentData); // 초기 해시값 기반 콘텐츠 렌더링
}


// 해시 값에 따라 콘텐츠 렌더링
export function renderContentFromHash(data) {
  
  const hash = location.hash || '#guide';
  const selectedContent = findContentByHash(data, hash);

  if (selectedContent) {
    document.querySelector('.khcD-content-title').textContent = selectedContent.title;
    const contentEditor = document.querySelector('.khcD-editor');
    contentEditor.innerHTML = selectedContent.content; // 업데이트된 콘텐츠 렌더링

    // 동적으로 추가된 콘텐츠의 코드 하이라이팅
    contentEditor.querySelectorAll("pre code").forEach((block) => {
      // 이미 하이라이팅된 경우, 속성 제거
      if (block.dataset.highlighted) {
        delete block.dataset.highlighted;
      }
      hljs.highlightElement(block);
    });
    renderBreadcrumb(hash, data); // Breadcrumb 업데이트

    // 스크롤 위치를 최상단으로 이동
    // window.scrollTo(0, 0);
    // 해시 변경 시 스크롤 위치를 최상단으로 설정
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// DOM 로드 및 해시 변경 이벤트 처리
document.addEventListener('DOMContentLoaded', () => {
  loadContentData();
  // admin.html 페이지일 때만 설정 버튼 생성
  if (window.location.pathname.includes("admin")) {
    initializeEditor();
    initializeModal("confirmModal"); // 페이지 로드 후 입력 모달 초기화
  }
  window.addEventListener('hashchange', () => {
    destroyEditor();  // 에디터 데이터 날리고 강제 종료
    renderContentFromHash(contentData); // 저장 후 최신 콘텐츠 데이터로 페이지를 다시 로드

  });
    // 스크롤 업 버튼 기능
    const scrollUpButton = document.getElementById("scrollButton");
    scrollUpButton.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
});