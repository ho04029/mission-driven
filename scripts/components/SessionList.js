export class SessionList {
  constructor(containerElement) {
    this.container = containerElement;
    this.sessions = [];
    this.sessionIdCounter = 1;

    this.addButton = document.getElementById("addSessionButton");

    this.init();
  }

  init() {
    this.addSession();

    // 회차 추가 버튼 이벤트
    this.addButton?.addEventListener("click", () => this.addSession());
  }

  // 회차 추가
  addSession() {
    const sessionId = this.sessionIdCounter++;
    const sessionNumber = this.sessions.length + 1;

    this.sessions.push({
      id: sessionId,
      number: sessionNumber,
    });

    const sessionElement = this.createSessionElement(sessionId, sessionNumber);
    this.container.appendChild(sessionElement);

    // 모든 회차 제목 및 삭제 버튼 업데이트
    this.updateAllSessions();
  }

  // 회차 HTML 생성
  createSessionElement(sessionId, sessionNumber) {
    const sessionItem = document.createElement("div");
    sessionItem.className = "session-item";
    sessionItem.dataset.sessionId = sessionId;

    sessionItem.innerHTML = `
      <div class="session-item__header">
        <h3 class="session-item__title">${sessionNumber}회차 정보</h3>
        <button 
          type="button" 
          class="session-item__remove" 
          data-session-id="${sessionId}"
          aria-label="회차 삭제"
          style="display: none;"
        >
          <span>×</span>
        </button>
      </div>
      
      <div class="session-item__content">
        
        <!-- 날짜/시간 그리드 -->
        <div class="session-datetime">
          
          <!-- 날짜 선택 -->
          <div class="session-datetime__field">
            <label class="session-datetime__label">날짜 선택</label>
            <input 
              type="date" 
              name="session_date_${sessionId}"
              class="session-datetime__input"
              required
            />
          </div>
          
          <!-- 시작 시간 -->
          <div class="session-datetime__field">
            <label class="session-datetime__label">시작 시간</label>
            <input 
              type="time" 
              name="session_start_time_${sessionId}"
              class="session-datetime__input"
              required
            />
          </div>
          
          <!-- 종료 시간 -->
          <div class="session-datetime__field">
            <label class="session-datetime__label">종료 시간</label>
            <input 
              type="time" 
              name="session_end_time_${sessionId}"
              class="session-datetime__input"
              required
            />
          </div>
          
        </div>
        
        <!-- 활동 내용 -->
        <div class="session-activity">
          <label class="session-activity__label">활동 내용</label>
          <p class="session-activity__description">
            날짜별 활동 내용을 간단히 적어주세요
          </p>
          
          <div class="session-activity__wrapper">
            <textarea 
              name="session_activity_${sessionId}"
              class="session-activity__textarea"
              placeholder="활동 내용을 간단히 입력해주세요"
              rows="4"
              minlength="8"
              maxlength="800"
              required
            ></textarea>
            
            <div class="session-activity__footer">
              <span class="session-activity__counter">
                <span class="session-activity__count">0</span>/800 (최소 8자)
              </span>
            </div>
          </div>
        </div>
        
      </div>
    `;

    // 회차 삭제 버튼
    const removeBtn = sessionItem.querySelector(".session-item__remove");
    removeBtn.addEventListener("click", () => this.removeSession(sessionId));
  }

  // 회차 삭제
  removeSession(sessionId) {
    if (this.sessions.length === 1) {
      alert("최소 1개의 회차가 필요합니다.");
      return;
    }

    if (!confirm("이 회차를 삭제하시겠습니까?")) {
      return;
    }

    this.sessions = this.sessions.filter((s) => s.id !== sessionId);

    const sessionElement = this.container.querySelector(
      `[data-session-id="${sessionId}"]`
    );
    if (sessionElement) {
      sessionElement.remove();
    }

    // 모든 회차 번호 재조정 및 업데이트
    this.updateAllSessions();
  }

  // 모든 회차 업데이트 (제목, 삭제 버튼)
  updateAllSessions() {
    const sessionElements = this.container.querySelectorAll(".session-item");

    sessionElements.forEach((element, index) => {
      const sessionNumber = index + 1;

      // 제목 업데이트
      const title = element.querySelector(".session-item__title");
      if (this.sessions.length === 1) {
        title.textContent = "회차 정보";
      } else {
        title.textContent = `${sessionNumber}회차 정보`;
      }

      // 삭제 버튼 표시/숨김
      const removeBtn = element.querySelector(".session-item__remove");
      if (this.sessions.length === 1) {
        removeBtn.style.display = "none";
      } else {
        removeBtn.style.display = "flex";
      }
    });
  }
}
