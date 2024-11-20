// public/js/editor/editorControls.js

import { editorConfig, ClassicEditor } from './editorConfig.js';
import { updateContent } from '../content/contentApi.js';
import { loadContentData } from '../content/contentLoader.js';
import { openConfirmModal, openSimpleModal  } from "../ui/modalManager.js";

let editorInstance; // 에디터 인스턴스를 저장할 변수

// 에디터 초기화 함수
export async function initializeEditor(contentContainer) {
  // if (!editorInstance) {
  //   editorInstance = await ClassicEditor.create(contentContainer, editorConfig); // 에디터 인스턴스를 생성하고 설정 적용
  // }
  document.getElementById("editButton").addEventListener("click", () => {
    const titleContainer = document.querySelector('.khcD-content-title');
    const editorContainer = document.querySelector('.khcD-editor');
    const menuButton = document.querySelector('.setting-btn');

    if (menuButton) {
      menuButton.style.display = 'none';
    }
    if (editorInstance) return;

    // 제목을 수정 가능하도록 설정
    titleContainer.setAttribute('contenteditable', 'true');
    titleContainer.focus(); // 제목 영역에 포커스

    ClassicEditor.create(editorContainer, editorConfig)
        .then(editor => {
            editorInstance = editor;
            document.getElementById("editButton").disabled = true;
            document.getElementById("saveButton").disabled = false;
        })
        // .then(editor => {
        //     // 에디터 데이터가 로드된 후 하이라이팅 적용
        //     editor.model.document.on('change:data', () => {
        //         document.querySelectorAll('pre code').forEach((block) => {
        //             hljs.highlightElement(block);
        //         });
        //     });
        // })
        .catch(error => console.error(error));
});

document.getElementById("saveButton").addEventListener("click", () => {
    if (editorInstance) {
        const content = editorInstance.getData();
        const title = document.querySelector('.khcD-content-title').innerText; // 제목 텍스트 가져오기
        const href = location.hash || "#guide";
        console.log("Title to save:", title); // title 확인용
        const menuButton = document.querySelector('.setting-btn');

        if (menuButton) {
          menuButton.style.display = 'flex';
        }

        console.log('content', content)

        fetch('/api/content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ href, title, content }) // 제목과 콘텐츠를 함께 전송
        })
        .then(response => {
            if (response.ok) {
                // alert('저장되었습니다.');
                openSimpleModal('simpleModal', '저장 성공', '컨텐츠가 저장되었습니다.', null);

            } else {
                // alert('저장 실패');
                openSimpleModal('simpleModal', '저장 실패', '컨텐츠 저장에 실패했습니다.', null);
            }
        })
        .then(() => loadContentData()) // 데이터 갱신        
        .then(()=> {
            // 해시를 강제로 다시 설정하여 페이지를 리로드
            const currentHash = location.hash || "#guide";
            location.hash = '';  // 일단 해시를 비운 후
            location.hash = currentHash;  // 다시 원래 해시로 설정하여 콘텐츠 갱신
    }) // 데이터 갱신        .catch(error => console.error('Error:', error))
        .finally(() => {
            editorInstance.destroy();
            editorInstance = null;
            document.querySelector('.khcD-content-title').removeAttribute('contenteditable'); // 제목 수정 불가 상태로 전환
            document.getElementById("editButton").disabled = false;
            document.getElementById("saveButton").disabled = true;
        });
    }
});
}

// 콘텐츠 저장 함수
export async function saveContent() {
  if (editorInstance) {
    const content = editorInstance.getData(); // 에디터에서 현재 콘텐츠 데이터를 가져오기
    const title = document.querySelector('.khcD-content-title').innerText; // 콘텐츠의 제목을 가져오기
    const href = location.hash || '#guide'; // 현재 페이지의 해시값을 콘텐츠 식별자로 사용

    const success = await updateContent(href, title, content); // API를 통해 콘텐츠를 서버에 저장
    if (success) {
      // alert('저장되었습니다.');
      openConfirmModal('confirmModal', '저장 성공', '컨텐츠가 저장되었습니다.', null);

      loadContentData(); // 저장 후 최신 콘텐츠 데이터로 페이지를 다시 로드
    } else {
      alert('저장 실패');
      modalManager('confirmModal', '저장 실패', '컨텐츠 저장에 실패했습니다.', null);

    }
  }
}

// 에디터 삭제 함수
// export function destroyEditor() {
//   if (editorInstance) {
//     editorInstance.destroy(); // 에디터 인스턴스를 삭제
//     editorInstance = null; // 인스턴스를 초기화하여 메모리 해제
//   }
// }

export function destroyEditor() {
  if (editorInstance) {
    editorInstance.destroy();
    editorInstance = null;

    const titleContainer = document.querySelector('.khcD-content-title');
    titleContainer.removeAttribute('contenteditable');
    document.getElementById('editButton').disabled = false;
    document.getElementById('saveButton').disabled = true;
  }
}

//   // 해시가 변경될 때마다 콘텐츠와 Breadcrumb 업데이트
//   window.addEventListener('hashchange', () => {
//     renderContentFromHash(contentData);
//     destroyEditor();
// });