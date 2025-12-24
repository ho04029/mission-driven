import { ConfirmModal } from "./ConfirmModal.js";
import { DatePicker } from "./DatePicker.js";
import { TimePicker } from "./TimePicker.js";
import { SessionActivityInput } from "./SessionActivityInput.js";

export class SessionList {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.sessions = [];
    this.sessionIdCounter = 1;
    this.confirmModal = new ConfirmModal();
    this.datePicker = new DatePicker();
    this.timePickers = new Map();
    this.activityInputs = new Map();
    this.onSessionChange = options.onSessionChange || null;

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

    this.initDatePicker(sessionId);

    // 모든 회차 제목 및 삭제 버튼 업데이트
    this.updateAllSessions();
  }

  // 달력 초기화
  initDatePicker(sessionId) {
    const sessionElement = this.container.querySelector(
      `[data-session-id="${sessionId}"]`
    );
    const dateInput = sessionElement.querySelector(".session-date-input");

    // 이전/다음 회차 날짜 범위 계산
    const { minDate, maxDate } = this.getDateRange(sessionId);

    // 달력 생성
    this.datePicker.init(dateInput, sessionId, {
      minDate: minDate,
      maxDate: maxDate,
      defaultDate: null,
      onChange: (selectedDate, dateStr) => {
        // 날짜 선택시 sessions 배열 업데이트
        const session = this.sessions.find((s) => s.id === sessionId);
        if (session) {
          session.date = selectedDate;
        }

        // 다른 회차들의 날짜 범위 업데이트
        this.updateAllDateRanges();

        if (this.onSessionChange) {
          this.onSessionChange();
        }
      },
    });
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
        
        <div class="session-datetime">
          
          <!-- 날짜 선택 -->
          <div class="session-datetime__field">
            <label class="session-datetime__label">날짜 선택</label>
            <input 
              type="text" 
              name="session_date_${sessionId}"
              class="session-datetime__input session-date-input"
              placeholder="날짜를 선택해주세요"
              readonly
              required
            />
          </div>
          
          <!-- 시작 시간 -->
          <div class="session-datetime__field">
            <label class="session-datetime__label">시작 시간</label>
            <div class="time-picker">
              <button type="button" class="time-picker__period" data-period="AM">오전</button>
              <input 
                type="text" 
                class="time-picker__input time-picker__hour"
                maxlength="2"
                placeholder="10"
              >
              <span class="time-picker__colon">:</span>
              <input 
                type="text" 
                class="time-picker__input time-picker__minute"
                maxlength="2"
                placeholder="00"
              >
            </div>
          </div>
          
          <!-- 종료 시간 -->
          <div class="session-datetime__field">
            <label class="session-datetime__label">종료 시간</label>
            <div class="time-picker">
              <button type="button" class="time-picker__period" data-period="AM">오전</button>
              <input 
                type="text" 
                class="time-picker__input time-picker__hour"
                maxlength="2"
                placeholder="11"
              >
              <span class="time-picker__colon">:</span>
              <input 
                type="text" 
                class="time-picker__input time-picker__minute"
                maxlength="2"
                placeholder="00"
              >
            </div>
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
              <span class="session-activity__count">
                <span class="session-activity__counter">0</span>/800 (최소 8자)
              </span>
            </div>
            <p class="input-wrapper__error"></p>
          </div>
        </div>
        
      </div>
    `;

    // 회차 삭제 버튼
    const removeBtn = sessionItem.querySelector(".session-item__remove");
    removeBtn.addEventListener("click", () =>
      this.confirmRemoveSession(sessionId)
    );

    // 시간 선택 초기화
    this.initTimePicker(sessionId, sessionItem);

    // 활동 내용 초기화
    this.initActivityInput(sessionId, sessionItem);

    return sessionItem;
  }

  // 시간 선택 초기화
  initTimePicker(sessionId, sessionElement) {
    const timePickers = sessionElement.querySelectorAll(".time-picker");
    const startTimePicker = timePickers[0];
    const endTimePicker = timePickers[1];

    const startInputs = {
      periodBtn: startTimePicker.querySelector(".time-picker__period"),
      hourInput: startTimePicker.querySelector(".time-picker__hour"),
      minuteInput: startTimePicker.querySelector(".time-picker__minute"),
    };

    const endInputs = {
      periodBtn: endTimePicker.querySelector(".time-picker__period"),
      hourInput: endTimePicker.querySelector(".time-picker__hour"),
      minuteInput: endTimePicker.querySelector(".time-picker__minute"),
    };

    const timePicker = new TimePicker(startInputs, endInputs, sessionId);

    // 시간 변경시 콜백 호출
    const allInputs = [
      startInputs.hourInput,
      startInputs.minuteInput,
      endInputs.hourInput,
      endInputs.minuteInput,
    ];

    allInputs.forEach((input) => {
      input.addEventListener("input", () => {
        if (this.onSessionChange) {
          this.onSessionChange();
        }
      });
    });

    this.timePickers.set(sessionId, timePicker);
  }

  // 활동 내용 초기화
  initActivityInput(sessionId, sessionElement) {
    const textarea = sessionElement.querySelector(
      ".session-activity__textarea"
    );

    const activityInput = new SessionActivityInput(textarea, {
      minLength: 8,
      maxLength: 800,
      required: true,
    });

    // 시간 변경시 콜백 호출
    textarea.addEventListener("input", () => {
      if (this.onSessionChange) {
        this.onSessionChange();
      }
    });

    textarea.addEventListener("paste", () => {
      if (this.onSessionChange) {
        this.onSessionChange();
      }
    });

    this.activityInputs.set(sessionId, activityInput);
  }

  // 회차의 선택 가능한 날짜 범위 계산
  getDateRange(sessionId) {
    const currentIndex = this.sessions.findIndex((s) => s.id === sessionId);

    let minDate = new Date(); // 기본: 오늘부터
    let maxDate = null; // 기본: 제한 없음

    // 이전 회차가 있으면, 그 날짜 다음날부터
    if (currentIndex > 0) {
      const prevSession = this.sessions[currentIndex - 1];
      if (prevSession.date) {
        minDate = new Date(prevSession.date);
        minDate.setDate(minDate.getDate() + 1); // 다음날
      }
    }

    // 다음 회차가 있으면, 그 날짜 전날까지
    if (currentIndex < this.sessions.length - 1) {
      const nextSession = this.sessions[currentIndex + 1];
      if (nextSession.date) {
        maxDate = new Date(nextSession.date);
        maxDate.setDate(maxDate.getDate() - 1); // 전날
      }
    }

    return { minDate, maxDate };
  }

  // 회차 삭제 버튼 클릭시 모달 오픈
  async confirmRemoveSession(sessionId) {
    if (this.sessions.length === 1) {
      this.showToast("최소 1개의 회차가 필요합니다.");
      return;
    }

    const confirmed = await this.confirmModal.open();

    // 확인버튼 클릭시 회차 삭제
    if (confirmed) {
      this.removeSession(sessionId);
    }
  }

  // 회차 삭제
  removeSession(sessionId) {
    this.datePicker.destroy(sessionId);
    this.timePickers.delete(sessionId);

    this.sessions = this.sessions.filter((s) => s.id !== sessionId);

    const sessionElement = this.container.querySelector(
      `[data-session-id="${sessionId}"]`
    );
    if (sessionElement) {
      sessionElement.remove();
    }

    // 모든 회차 번호 재조정 및 업데이트
    this.updateAllSessions();
    // 모든 회차 날짜 범위 재조정
    this.updateAllDateRanges();
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

  // 모든 회차의 날짜 범위 업데이트
  updateAllDateRanges() {
    this.sessions.forEach((session) => {
      const { minDate, maxDate } = this.getDateRange(session.id);
      this.datePicker.updateRange(session.id, minDate, maxDate);
    });
  }

  // 모든 회차 데이터 가져오기
  getAllSessionsData() {
    return this.sessions
      .map((session) => {
        const element = this.container.querySelector(
          `[data-session-id="${session.id}"]`
        );
        if (!element) return null;

        const date = element.querySelector(
          `input[name="session_date_${session.id}"]`
        ).value;
        const activity = element.querySelector(
          `textarea[name="session_activity_${session.id}"]`
        ).value;

        return {
          id: session.id,
          number: session.number,
          date,
          // TODO: 시간 부분 수정
          time: this.timePickers.get(session.id),
          activity,
        };
      })
      .filter(Boolean);
  }

  // 조용한 검증 (alert 없이)
  validateSilent() {
    for (let i = 0; i < this.sessions.length; i++) {
      const session = this.sessions[i];

      // 날짜 체크
      if (!session.date) {
        return false;
      }

      // 활동 내용 체크
      const activityInput = this.activityInputs.get(session.id);
      if (activityInput && !activityInput.isValid()) {
        return false;
      }
    }

    return true;
  }
}
