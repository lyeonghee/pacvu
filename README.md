# PacVu Package Library Work

PacVu 패키지 라이브러리 2D 작업 대시보드

## 📦 기능

- **G-Type (M001)**: Mailer Box - 교박스 구조
- **B-Type (T001)**: Tuck Box - 타공박스 구조  
- **A-Type (R001)**: RSC Shipping Box - 일반 택배박스

## 🎨 주요 기능

- 📐 실시간 치수 조정 및 렌더링
- 📁 SVG / DXF 내보내기
- 🔍 줌/팬 네비게이션
- 🏷️ 라벨, 폴딩라인, 슬롯 표시 옵션

## 🚀 배포

https://pacvu-enginelab.vercel.app

## 📝 파일 구조

```
PacVu_EngineLab/
├── index.html           # 메인 HTML
├── app.js              # 메인 앱 로직
├── style.css           # 스타일시트
├── structures/         # 박스 구조 정의
│   ├── mailer/M001/    # G-Type Mailer
│   ├── tuck/T001/      # B-Type Tuck (최종본)
│   └── shipping/rsc/R001/ # A-Type RSC
├── export/             # SVG/DXF 내보내기
├── data/               # 라이브러리 데이터
└── vercel.json         # Vercel 배포 설정
```

## 🔧 개발

로컬에서 실행:
```bash
# VS Code Live Server 사용 또는
python -m http.server 8000
```

## 📄 라이센스

PacVu EngineLab
