// public/js/menu/menuUtils.js
import { openModal, openConfirmModal, openSimpleModal } from '../ui/modalManager.js';
import { menuData, saveMenuData, renderMenu, createMenuItem, updateMenuDataLabel } from '../menu/menuLoader.js';

// 편집 모드 전환 함수: 편집 아이콘 클릭 시 활성화/비활성화
export function toggleEditMode() {
  const lnbWrap = document.querySelector('.khcD-lnb-menu');
  const editIcon = document.querySelector('.setting-btn img');
  const isEditMode = editIcon.classList.toggle('edit-mode');
  const dimLayer = document.querySelector('.khcD-content-dimmed'); // dimmed
  const btnWrap = document.querySelector('.btn-wrap'); // 컨텐츠 편집 버튼 hide
  const contentWrap = document.querySelector('.khcD-content-body'); // 콘텐츠 영역

  // 편집 모드에 따라 아이콘 이미지 변경 및 메뉴 활성화 상태 변경
  editIcon.src = isEditMode ? '/images/save-icon.svg' : '/images/edit-icon.svg';
  if (lnbWrap) lnbWrap.classList.toggle('active', isEditMode);

  // 딤드 레이어 처리
  if (dimLayer) {
    dimLayer.style.display = isEditMode ? 'block' : 'none';
  }
  if (btnWrap) {
    btnWrap.style.display = isEditMode ? 'none' : 'flex';
  }
    
  // 드래그 방지 설정 (편집 모드일 때 드래그를 막음)
  if (contentWrap) {
    contentWrap.style.userSelect = isEditMode ? 'none' : 'auto';
  }

  toggleEditButtons(isEditMode); // 편집 버튼 토글 처리
  toggleEditTitle(isEditMode); // 편집 모드 상태에 따라 타이틀 추가/제거
}

// '메뉴편집' 타이틀 및 '카테고리 추가' 버튼 추가/제거
function toggleEditTitle(isEditMode) {
  const menuContainer = document.querySelector('.menu-list.depth-1-wrap');
  let editTitle = menuContainer.querySelector('.edit-mode-tit');

  if (isEditMode && !editTitle) {
    // 편집 모드 타이틀 추가
    menuContainer.insertAdjacentHTML(
      'afterbegin',
      `<li class="text depth-1 edit-mode-tit">
         <span>메뉴편집</span>
         <button type="button" id="menu-add-button" class="edit-btn">+ 카테고리 추가</button>
      </li>`
    );
    document.getElementById('menu-add-button').addEventListener('click', handleAddCategory);
  } else if (!isEditMode && editTitle) {
    // 편집 모드 타이틀 제거
    editTitle.remove();
  }
}

// 편집 버튼 토글 처리
function toggleEditButtons(isEditMode) {
  console.log('isEditMode', isEditMode)
  document.querySelectorAll('.menu-list li').forEach((li) => {
    if(!li.classList.contains('edit-mode-tit')){
      isEditMode ? addEditButtonsToItem(li) : removeEditButtonsFromItem(li);
    }
  });
}

// 개별 메뉴 항목에 '추가', '삭제', '수정' 버튼 추가
function addEditButtonsToItem(li) {
  removeEditButtonsFromItem(li); // 기존 편집 버튼 제거
  
  // 편집 버튼 HTML 추가 (깊이에 따라 '추가' 버튼 포함 여부 결정)
  const depth = getItemDepth(li);
  const editHTML = depth <= 3 ? 
    `
    <div class="edit-btn-wrap">
      <span class="edit-btn edit-add-icon">추가</span>
      <span class="edit-btn edit-edit-icon">수정</span>
      <span class="edit-btn edit-del-icon">삭제</span>
    </div>
    ` 
    :
    `
    <div class="edit-btn-wrap">
      <span class="edit-btn edit-edit-icon">수정</span>
      <span class="edit-btn edit-del-icon">삭제</span>
    </div>
    `;

  li.querySelector('a').insertAdjacentHTML('beforeend', editHTML);

  // 추가, 수정, 삭제 버튼 이벤트 연결
  li.querySelector('.edit-add-icon')?.addEventListener('click', (event) => handleAddMenuItem(event, li, depth));
  li.querySelector('.edit-edit-icon')?.addEventListener('click', (event) => handleEditLabel(event, li));
  li.querySelector('.edit-del-icon')?.addEventListener('click', (event) => handleDeleteMenuItem(event, li));
}

// 라벨 수정 시작
function handleEditLabel(event, li) {
  event.preventDefault();

  const labelElement = li.querySelector('a');
  const currentLabel = labelElement.childNodes[0].nodeValue.trim();

  // 라벨을 input 필드로 변경
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentLabel;
  input.className = 'label-editor';

  // 버튼 그룹 생성
  const buttons = document.createElement('div');
  buttons.className = 'edit-btn-wrap';

  // 확인 버튼 생성
  const confirmButton = document.createElement('span');
  confirmButton.textContent = '확인';
  confirmButton.className = 'edit-btn edit-confirm-btn';
  confirmButton.disabled = true;

  // 취소 버튼 생성
  const cancelButton = document.createElement('span');
  cancelButton.textContent = '취소';
  cancelButton.className = 'edit-btn edit-cancel-btn';

  // 기존 텍스트 제거 및 새 요소 추가
  labelElement.textContent = ''; // 기존 텍스트 제거
  labelElement.append(input, buttons); // input과 버튼 그룹 추가
  buttons.append(confirmButton, cancelButton); // 버튼 그룹에 버튼 추가

  // 값 변경 감지
  input.addEventListener('input', () => {
    confirmButton.disabled = input.value.trim() === currentLabel;
  });
  // 확인 버튼 클릭 처리
  confirmButton.addEventListener('click', () => {
    const updatedLabel = input.value.trim();
    if (updatedLabel) {
      labelElement.textContent = updatedLabel; // 수정된 값으로 렌더링
      updateMenuDataLabel(li, updatedLabel); // 데이터에 반영
      li.classList.add('edited'); // 수정된 항목 스타일 추가
    } else {
      labelElement.textContent = currentLabel; // 빈 값이면 원래 값 유지
    }
    toggleEditButtons(true); // 버튼 리셋(tree 구조이기 때문에 이 함수 씀 - 안그럼 하위 메뉴 버튼 렌더 안됨)
  });

  // 취소 버튼 클릭 처리
  cancelButton.addEventListener('click', () => {
    labelElement.textContent = currentLabel; // 원래 값으로 복원
    toggleEditButtons(true); // 버튼 리셋
  });

  // input 필드에 포커스
  input.focus();
}

// 기존 버튼 제거
function removeEditButtonsFromItem(li) {
  li.querySelector('.edit-btn-wrap')?.remove();
}

// 메뉴 항목의 depth 정보 추출
function getItemDepth(li) {
  const depthClass = Array.from(li.classList).find((cls) => cls.startsWith('depth-'));
  return parseInt(depthClass?.split('-')[1], 10);
}

// 새로운 최상위 카테고리 추가 처리
function handleAddCategory() {
  openModal('inputModal', '새 카테고리 추가', '추가할 카테고리 이름을 입력하세요', (label) => {
    const newMenuItem = { 
      label, 
      href: `#new-menu-${Date.now()}`, 
      title: label, 
      content: '<p>새로운 콘텐츠입니다.</p>', 
      submenu: [] 
    };
    menuData.push(newMenuItem); // menuData에 새 항목 추가

    // 메뉴 컨테이너에 새 카테고리 항목 추가
    const menuContainer = document.querySelector('.menu-list.depth-1-wrap');
    const newMenuElement = createMenuItem(newMenuItem, 1);
    newMenuElement.classList.add('added');
    menuContainer.appendChild(newMenuElement);
    addEditButtonsToItem(newMenuElement); // 새 항목에 편집 버튼 추가
  });
}

// 메뉴 항목 추가 처리
function handleAddMenuItem(event, parentLi, depth) {
  event.preventDefault();
  event.stopPropagation();

  openModal('inputModal', '새 메뉴 추가', '추가할 메뉴 이름을 입력하세요', (label) => {
    const newMenuItem = { 
      label, 
      href: `#new-menu-${Date.now()}`, 
      title: label, 
      content: '<p>새로운 콘텐츠입니다.</p>', 
      submenu: [] 
    };
    const parentItem = findMenuByHref(menuData, parentLi.querySelector('a').getAttribute('href'));

    if (parentItem) {
      if (!Array.isArray(parentItem.submenu)) parentItem.submenu = [];
      parentItem.submenu.push(newMenuItem);

      // 부모 항목에 서브 메뉴 추가
      const newMenuElement = createMenuItem(newMenuItem, depth + 1);
      newMenuElement.classList.add('added');
      addSubmenuToParent(parentLi, newMenuElement, depth);
    }
  });
}

// 부모 메뉴 항목에 서브 메뉴 추가
function addSubmenuToParent(parentLi, newMenuElement, depth) {
  let submenuContainer = parentLi.querySelector('ul.submenu');
  if (!submenuContainer) {
    // 서브 메뉴가 없는 경우 새로 생성
    submenuContainer = document.createElement('ul');
    submenuContainer.classList.add('menu-list', `depth-${depth + 1}-wrap`, 'submenu', 'open');
    parentLi.appendChild(submenuContainer);
  }
  submenuContainer.appendChild(newMenuElement);
  addEditButtonsToItem(newMenuElement); // 새 서브 메뉴 항목에 편집 버튼 추가
}

// 메뉴 항목 삭제 처리
function handleDeleteMenuItem(event, parentLi) {
  event.preventDefault();
  event.stopPropagation();

  openConfirmModal('confirmModal', '메뉴 삭제', '정말로 이 메뉴를 삭제하시겠습니까?', () => {
    deleteMenuItemByHref(menuData, parentLi.querySelector('a').getAttribute('href'));
    parentLi.classList.add('deleted'); // 삭제된 항목 표시
  }, null);
}

// 데이터에서 메뉴 항목 삭제
function deleteMenuItemByHref(data, href) {
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (item.href === href) {
      data.splice(i, 1); // 데이터에서 항목 삭제
      return true;
    }
    if (item.submenu && deleteMenuItemByHref(item.submenu, href)) return true;
  }
  return false;
}

// 메뉴 데이터에서 주어진 href에 해당하는 항목 찾기
export function findMenuByHref(data, href) {
  for (const item of data) {
    if (item.href === href) return item;
    if (item.submenu) {
      const found = findMenuByHref(item.submenu, href);
      if (found) return found;
    }
  }
  return null;
}
