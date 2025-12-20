const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

const mainImageInput = document.getElementById("mainImage");
const mainImagePreview = document.getElementById("mainImagePreview");
const mainImageLabel = document.getElementById("mainImageLabel");

// 대표 이미지 추가
mainImageInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 이미지 검증
  const validation = validateImage(file);
  if (!validation.valid) {
    alert(validation.error);
    mainImageInput.value = ""; // input 초기화
    return;
  }

  //이미지 미리보기
  displayMainImage(file);
});

// 이미지 검증로직
const validateImage = (file) => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: "JPG, PNG 파일만 업로드 가능합니다." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "파일 크기는 15MB 이하만 가능합니다." };
  }

  return { valid: true };
};

// 이미지 미리보기
const displayMainImage = (file) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    // 이미지 미리보기 생성
    mainImagePreview.innerHTML = `
      <img src="${e.target.result}" alt="대표 이미지" class="image-upload__preview-image">
    `;

    mainImagePreview.classList.add("active");
  };

  reader.readAsDataURL(file);
};
