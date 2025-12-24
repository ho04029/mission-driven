export class DatePicker {
  constructor() {
    this.pickers = new Map();
    this.tempSelectedDate = null;
  }

  init(inputElement, sessionId, options = {}) {
    if (!inputElement) return;

    const {
      minDate = null,
      maxDate = null,
      defaultDate = null,
      onChange = null,
    } = options;

    // 기존 달력이 있으면 제거
    if (this.pickers.has(sessionId)) {
      this.pickers.get(sessionId).destroy();
    }

    // flatpickr 초기화
    const picker = flatpickr(inputElement, {
      locale: "ko",
      dateFormat: "Y년 m월 d일",
      minDate: minDate,
      maxDate: maxDate,

      disableMobile: true, // 모바일 모드 끄기
      defaultDate: defaultDate,
      closeOnSelect: false,
      inline: false,
      monthSelectorType: "static",

      // 날짜 선택
      onChange: (selectedDates, dateStr, instance) => {
        this.tempSelectedDate = selectedDates[0];
      },

      // 달력 오픈
      onOpen: (selectedDates, dateStr, instance) => {
        // instance와 calendarContainer 존재 확인
        if (!instance || !instance.calendarContainer) {
          console.error("DatePicker: Calendar container not found");
          return;
        }

        // 이미 날짜가 선택되어 있으면 그 날짜 사용
        if (selectedDates.length > 0) {
          this.tempSelectedDate = selectedDates[0];
        } else {
          // 날짜가 없으면 오늘 날짜를 임시 선택
          const today = new Date();

          let initialDate = today;

          if (minDate && today < new Date(minDate)) {
            initialDate = new Date(minDate);
          } else if (maxDate && today > new Date(maxDate)) {
            initialDate = new Date(maxDate);
          }

          instance.setDate(initialDate, false);
          this.tempSelectedDate = initialDate;
        }

        this.addConfirmButton(instance, sessionId, onChange);
        this.updateDisabledDates(instance, minDate, maxDate);
      },

      // 달력 닫기
      onClose: (selectedDates, dateStr, instance) => {
        // instance와 calendarContainer 존재 확인
        if (!instance || !instance.calendarContainer) {
          return;
        }

        this.removeConfirmButton(instance);

        if (this.tempSelectedDate && selectedDates.length === 0) {
          instance.clear();
        }
      },
    });

    this.pickers.set(sessionId, picker);
    return picker;
  }

  // 선택 완료 버튼 추가
  addConfirmButton(instance, sessionId, onChange) {
    // 방어 코드 추가
    if (!instance || !instance.calendarContainer) {
      console.error(
        "DatePicker: Cannot add confirm button - calendar not found"
      );
      return;
    }

    const calendar = instance.calendarContainer;

    // 이미 버튼이 있으면 제거
    const existingButton = calendar.querySelector(".flatpickr-confirm-button");
    if (existingButton) {
      existingButton.remove();
    }

    // 선택 완료 버튼 생성
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "flatpickr-confirm-button";
    buttonContainer.innerHTML = `
      <button type="button" class="flatpickr-confirm-btn">
        선택 완료
      </button>
    `;

    // 달력 하단에 추가
    calendar.appendChild(buttonContainer);

    // 선택 완료 버튼 클릭 이벤트
    const confirmBtn = buttonContainer.querySelector(".flatpickr-confirm-btn");
    confirmBtn.addEventListener("click", () => {
      if (this.tempSelectedDate) {
        // 선택 확정
        instance.setDate(this.tempSelectedDate, true, "Y년 m월 d일");

        // onChange 콜백 실행
        if (onChange) {
          const dateStr = instance.formatDate(
            this.tempSelectedDate,
            "Y년 m월 d일"
          );
          onChange(this.tempSelectedDate, dateStr);
        }

        // 달력 닫기
        instance.close();
      }
    });
  }

  // 선택 완료 버튼 제거
  removeConfirmButton(instance) {
    // 방어 코드 추가
    if (!instance || !instance.calendarContainer) {
      return;
    }

    const calendar = instance.calendarContainer;
    const button = calendar.querySelector(".flatpickr-confirm-button");
    if (button) {
      button.remove();
    }
  }

  // 비활성화 날짜 스타일 업데이트
  updateDisabledDates(instance, minDate, maxDate) {
    // 방어 코드 추가
    if (!instance || !instance.calendarContainer) {
      return;
    }

    const calendar = instance.calendarContainer;
    const days = calendar.querySelectorAll(".flatpickr-day");

    days.forEach((day) => {
      if (day.classList.contains("flatpickr-disabled")) {
        day.style.color = "#E5E5E5";
        day.style.cursor = "not-allowed";
      }
    });
  }

  // 날짜 범위 업데이트
  updateRange(sessionId, minDate, maxDate) {
    const picker = this.pickers.get(sessionId);
    if (picker) {
      picker.set("minDate", minDate);
      picker.set("maxDate", maxDate);
    }
  }

  // 선택된 날짜 가져오기
  getDate(sessionId) {
    const picker = this.pickers.get(sessionId);
    return picker ? picker.selectedDates[0] : null;
  }

  // 날짜 설정
  setDate(sessionId, date) {
    const picker = this.pickers.get(sessionId);
    if (picker) {
      picker.setDate(date);
    }
  }

  // 달력 제거
  destroy(sessionId) {
    const picker = this.pickers.get(sessionId);
    if (picker) {
      try {
        picker.destroy();
      } catch (error) {
        console.error("DatePicker destroy error:", error);
      }
      this.pickers.delete(sessionId);
    }
  }

  // 모든 달력 제거
  destroyAll() {
    this.pickers.forEach((picker) => {
      try {
        picker.destroy();
      } catch (error) {
        console.error("DatePicker destroyAll error:", error);
      }
    });
    this.pickers.clear();
  }
}
