// public/js/ui/modalManager.js

// 팝업 열기 함수 - 사용자 입력 팝업을 열고 제목, 입력창 플레이스홀더 및 확인 콜백을 설정
export function openModal(modalId, title, placeholder, callback, cancelCallback) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "flex";
    const modalTitle = modal.querySelector(".modal-title");
    const userInput = modal.querySelector("#modalInputField");
    const confirmButton = modal.querySelector("#modalConfirmButton");
    const cancelButton = modal.querySelector("#modalDismissButton");

    if (modalTitle) modalTitle.textContent = title;
    if (userInput) {
      userInput.placeholder = placeholder;
      userInput.focus(); // 팝업 열리면 인풋에 포커싱
    }

    // 확인 버튼 클릭 시 콜백 실행 및 모달 닫기
    const confirmAction = () => {
      const value = userInput.value;
      if (value) {
        callback(value);
        closeModal(modalId);
      } else {
        alert("값을 입력해 주세요");
      }
      userInput.value = ""; // 입력 필드 초기화
    };

    // 취소 버튼 클릭 시 취소 콜백 실행
    const cancelAction = () => {
      console.log('cancelButton', cancelCallback, modalId)
      if (typeof cancelCallback === "function") {
        cancelCallback(); // 취소 콜백 실행
      }
      closeModal(modalId);
    };

    confirmButton.onclick = confirmAction;
    cancelButton.onclick = cancelAction;

    // 엔터 키가 눌렸을 때 확인 또는 취소 버튼에 따라 동작
    modal.onkeydown = (event) => {
      if (event.key === "Enter") {
        if (document.activeElement === confirmButton) {
          confirmAction();
        } else if (document.activeElement === cancelButton) {
          cancelAction();
        }
      } else if (event.key === "Escape") {
        closeModal(modalId); // ESC 키로 모달 닫기
      }
    };
  }
}

// 확인 모달 열기 - 확인 메세지와 콜백을 설정하여 사용자에게 확인 요청
export function openConfirmModal(modalId, title, message, confirmCallback, cancelCallback) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "flex";
    const modalTitle = modal.querySelector(".modal-title");
    const modalMessage = modal.querySelector(".modal-message");
    const confirmButton = modal.querySelector("#modalConfirmButton");
    const cancelButton = modal.querySelector("#modalDismissButton");

    if (modalTitle) modalTitle.textContent = title;
    if (modalMessage) modalMessage.textContent = message;

    // 기본 포커스를 확인 버튼에 설정
    confirmButton.focus();

    // 확인 버튼 클릭 시 콜백 실행 및 모달 닫기
    const confirmAction = () => {
      if (typeof confirmCallback === "function") {
        confirmCallback(); // 콜백이 함수일 경우 실행
      }
      closeModal(modalId);
    };

    // 취소 버튼 클릭 시 취소 콜백 실행
    const cancelAction = () => {
      console.log('cancelButton', cancelCallback, modalId)
      if (typeof cancelCallback === "function") {
        cancelCallback(); // 취소 콜백 실행
      }
      closeModal(modalId);
    };

    confirmButton.onclick = confirmAction;
    cancelButton.onclick = cancelAction;

    // 엔터 키가 눌렸을 때 확인 또는 취소 버튼에 따라 동작
    modal.onkeydown = (event) => {
      if (event.key === "Enter") {
        if (document.activeElement === confirmButton) {
          confirmAction();
        } else if (document.activeElement === cancelButton) {
          cancelAction();
        }
      } else if (event.key === "Escape") {
        closeModal(modalId); // ESC 키로 모달 닫기
      }
    };
  }
}

// 단순 확인 모달 열기 - 확인 버튼만 있는 모달
export function openSimpleModal(modalId, title, message, confirmCallback) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "flex";
    const modalTitle = modal.querySelector(".modal-title");
    const modalMessage = modal.querySelector(".modal-message");
    const confirmButton = modal.querySelector("#modalConfirmButton");

    if (modalTitle) modalTitle.textContent = title;
    if (modalMessage) modalMessage.textContent = message;

    // 기본 포커스를 확인 버튼에 설정
    confirmButton.focus();

    // 확인 버튼 클릭 시 콜백 실행 및 모달 닫기
    const confirmAction = () => {
      if (typeof confirmCallback === "function") {
        confirmCallback(); // 콜백이 함수일 경우 실행
      }
      closeModal(modalId);
    };

    confirmButton.onclick = confirmAction;

    // 엔터 키가 눌렸을 때 확인 버튼에 따라 동작
    modal.onkeydown = (event) => {
      if (event.key === "Enter") {
        confirmAction();
      } else if (event.key === "Escape") {
        closeModal(modalId); // ESC 키로 모달 닫기
      }
    };
  }
}

// 모달 닫기 함수 - 지정된 모달을 화면에서 숨김
export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
  }
}

// 모달 초기화 - 취소 버튼 클릭 시 모달을 닫도록 이벤트 설정
export function initializeModal(modalId) {
  const modal = document.getElementById(modalId);
  const cancelButton = modal.querySelector("#modalDismissButton");

  if (cancelButton) {
    cancelButton.addEventListener("click", () => closeModal(modalId));
  }
}
