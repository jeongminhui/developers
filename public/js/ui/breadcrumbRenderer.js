// public/js/ui/breadcrumbRenderer.js
import { findPathToContent } from '../content/contentUtils.js';

export function renderBreadcrumb(href, data) {
  const breadcrumbContainer = document.querySelector('.khcD-breadcrumb ul');
  breadcrumbContainer.innerHTML = ''; // 기존 breadcrumb 초기화
  // let firstContentsHref;
  // firstContentsHref = data[0].submenu[0].href

  // // '문서'를 기본으로 추가
  // const documentItem = document.createElement('li');
  // const documentLink = document.createElement('a');
  // documentLink.href = firstContentsHref;
  // documentLink.textContent = '문서';
  // documentItem.appendChild(documentLink);
  // breadcrumbContainer.appendChild(documentItem);

  // 경로를 찾고 breadcrumb 생성
  const path = findPathToContent(data, href);
  if (path) {
    path.forEach((item, order, items) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = order > 0 ? item.href : ( order==0 && item.submenu ) ? item.submenu[0].href : '';
      a.textContent = item.label;
      li.appendChild(a);
      breadcrumbContainer.appendChild(li);
    });
  }

  addBreadcrumbClickEvent(breadcrumbContainer, data); // 각 항목에 클릭 이벤트 추가
}

// Breadcrumb 항목 클릭 이벤트 추가 함수
function addBreadcrumbClickEvent(container, data) {
  container.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const href = event.target.getAttribute('href');
      location.hash = href; // 해시값 업데이트
      renderBreadcrumb(href, data); // Breadcrumb 업데이트
      // 콘텐츠도 해당 해시에 맞게 업데이트
      import('../content/contentLoader.js').then((module) => {
        module.renderContentFromHash(data);
      });
    });
  });
}
