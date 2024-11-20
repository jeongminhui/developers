// public/js/menu/menuLoader.js
import { fetchData } from '../core/utils.js';
import { renderContentFromHash } from '../content/contentLoader.js';
import { renderBreadcrumb } from '../ui/breadcrumbRenderer.js';
import { toggleEditMode, findMenuByHref } from '../menu/menuUtils.js';
import { openConfirmModal, openSimpleModal } from "../ui/modalManager.js";

export let menuData = []; // 메뉴 데이터를 임시로 저장할 변수
let isEditMode = false;

// 메뉴 데이터를 로드하고 렌더링
export async function loadMenuData() {
  menuData = await fetchData('/data/content.json');
  renderMenu(menuData);
  renderContentFromHash(menuData);

  if (isAdminPage()) addMenuEditIcon(); // admin 페이지일 경우 메뉴 수정 아이콘 추가
}

// admin 페이지 여부 확인
function isAdminPage() {
  return location.href.includes('/admin');
}

// 메뉴 수정 아이콘 추가
function addMenuEditIcon() {
  const menuContainer = document.querySelector('.menu-list.depth-1-wrap');
  if (!menuContainer) return;

  // 이미 setting-btn이 존재하는지 확인
  const existingButton = menuContainer.parentElement.querySelector('.setting-btn');
  console.log('existingButton', existingButton)
  if (existingButton) return; // 이미 버튼이 있으면 중단

  const editIconButton = document.createElement('button');
  editIconButton.type = 'button';
  editIconButton.className = 'setting-btn';
  editIconButton.innerHTML = `<img id="menu-edit-icon" src="/images/edit-icon.svg" alt="edit-icon" />`;

  editIconButton.addEventListener('click', () => {
    if (isEditMode) {
      saveMenuData(); // 편집 모드 종료 시 데이터 저장
    }
    toggleEditMode();
    isEditMode = !isEditMode;
  
    // 에딧모드로 전환 시 모든 서브메뉴 열기
    if (isEditMode) {
      document.querySelectorAll('.submenu').forEach(submenu => {
        submenu.classList.add('open');
      });
      document.querySelectorAll('.icon').forEach(icon => {
        icon.classList.add('on');
      });
    }
  });
  
  menuContainer.parentElement.insertBefore(editIconButton, menuContainer);
}

// 메뉴 렌더링
export function renderMenu(data) {
  const menuContainer = document.querySelector('.menu-list.depth-1-wrap');
  menuContainer.innerHTML = ''; // 기존 메뉴 초기화
  data.forEach((item) => menuContainer.appendChild(createMenuItem(item, 1)));
}

// 개별 메뉴 항목 생성
export function createMenuItem(item, depth) {
  const li = document.createElement('li');
  li.className = `text depth-${depth}`;

  const a = document.createElement('a');
  a.href = item.href;
  a.textContent = item.label;
  li.appendChild(a);

  // 서브메뉴 생성 및 추가
  if (item.submenu && item.submenu.length > 0 && !isEditMode) {
    const submenu = createSubmenu(item.submenu, depth + 1);
    li.appendChild(submenu);
    addSubmenuToggle(a, submenu, depth); // 서브메뉴 토글 기능 추가
  } else {
    // 서브메뉴가 없는 항목 클릭 시 기본 동작 방지
    a.addEventListener('click', (event) => {
      event.preventDefault();
    });
  }

  if (depth > 1 && !isEditMode) addMenuClickEvent(a, item.href); // 메뉴 클릭 이벤트 추가

  return li;
}

// 서브메뉴 생성
function createSubmenu(submenuItems, depth) {
  const submenu = document.createElement('ul');
  submenu.className = `menu-list depth-${depth}-wrap submenu`;
  submenuItems.forEach((subitem) => submenu.appendChild(createMenuItem(subitem, depth)));
  return submenu;
}

// 서브메뉴 토글 기능 추가
function addSubmenuToggle(anchor, submenu, depth) {
  if (depth === 2) {
    const icon = document.createElement('img');
    icon.src = '/images/chevron-down.svg';
    icon.className = 'icon';
    anchor.appendChild(icon);
    anchor.addEventListener('click', (event) => {
      if (isEditMode) {
        event.preventDefault(); // 에딧모드일 때는 토글 동작 방지
        return;
      }
      event.preventDefault();
      submenu.classList.toggle('open');
      icon.classList.toggle('on'); // 아이콘 상태 변경 (depth-2에만 아이콘 있음)
    });
  } else {
    anchor.addEventListener('click', (event) => {
      if (isEditMode) {
        event.preventDefault(); // 에딧모드일 때는 토글 동작 방지
        return;
      }
      event.preventDefault();
      submenu.classList.toggle('open');
    });
  }
}

// save 버튼 클릭 시 데이터 저장
export async function saveMenuData() {
  try {
    const response = await fetch('/api/updateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(menuData) // 수정된 menuData 전송
    });

    if (response.ok) {
      openSimpleModal('simpleModal', '메뉴 저장 성공', '메뉴가 저장되었습니다.', () => {
        loadMenuData(); // 확인 버튼을 눌렀을 때 메뉴 다시 로드
      });
    } else {
      openSimpleModal('simpleModal', '저장 실패', '메뉴 저장에 실패했습니다.', null, () => {
        console.log('저장 실패 후 취소 버튼 클릭됨');
      });
    }
  } catch (error) {
    console.error('메뉴 저장 중 오류 발생:', error);
    openSimpleModal('simpleModal', '오류', '메뉴 저장 중 오류가 발생했습니다.', null, () => {
      console.log('오류 발생 후 취소 버튼 클릭됨');
    });
  }
}

// 데이터에서 라벨 업데이트
export function updateMenuDataLabel(li, updatedLabel) {
  const href = li.querySelector('a').getAttribute('href');
  const menuItem = findMenuByHref(menuData, href); // menuData에서 항목 찾기
  if (menuItem) {
    menuItem.label = updatedLabel; // menuData에 수정된 라벨 반영
  }
}

// 메뉴 클릭 이벤트 추가
function addMenuClickEvent(anchor, href) {
  anchor.addEventListener('click', (event) => {
    if(!isEditMode){
      event.preventDefault();
      location.hash = href;
      renderContentFromHash(menuData); // 해시 변경에 따른 콘텐츠 렌더링
      renderBreadcrumb(href, menuData); // 경로에 따른 breadcrumb 렌더링
    }
  });
}

// DOMContentLoaded 이벤트 발생 시 메뉴 데이터 로드
document.addEventListener('DOMContentLoaded', loadMenuData);
