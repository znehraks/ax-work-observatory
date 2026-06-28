# 구현 노트

## 선택한 접근

가장 적합한 방식은 `Imagegen 시안 + SVG/Framer Motion 애니메이션 + HTML 라벨` 하이브리드로 결정했다.

이유:

- 신문 삽화 같은 아날로그 감성을 유지할 수 있다.
- 영상이나 3D보다 흐름도 가독성이 좋다.
- 텍스트는 HTML로 관리하므로 정확하고 교체하기 쉽다.
- 연구 주제는 `content/research.ts` 데이터만 바꿔도 같은 문법으로 다시 렌더링된다.
- `Frame Notes` 상세 화면으로 깊은 매핑 설명을 분리할 수 있다.

## 이번 구현 변경

- 중앙 dispatch 이미지 영역을 추상 카드/선 장식에서 데이터 기반 SVG 도식으로 교체했다.
- `DispatchFlowIllustration`, `FlowNode`, `FlowGlyph`를 추가했다.
- 각 연구의 `machine.parts[].marker` 좌표를 사용해 노드 위치를 자동 배치한다.
- `intake -> context -> engine -> gate -> artifact` 메인 흐름선을 그리고, `artifact -> feedback -> intake` 피드백 루프를 별도로 그린다.
- Framer Motion으로 path drawing, node pulse, ink token movement를 구현했다.
- 하단 HTML 라벨은 긴 프로젝트별 장치명 대신 공통 단계명으로 줄였다.
- 프로젝트별 정확한 매핑은 기존 `Frame Notes` 상세 오버레이에 유지했다.
- 중앙 슬롯 배경을 어두운 추상 사진에서 warm paper / ink diagram 톤으로 변경했다.

## 유지보수 원칙

- 새로운 연구 항목은 먼저 `content/research.ts`에 추가한다.
- SVG 도식이 깨지면 `machine.parts[].marker` 좌표를 조정한다.
- 메인 화면의 라벨은 짧게 유지하고, 긴 설명은 상세 오버레이에서 처리한다.
- 장식용 모션보다 workflow 이해를 돕는 모션만 추가한다.
- 3D는 상세 설명이나 보조 장면에 제한하고, 첫 화면의 주 정보는 SVG/HTML로 유지한다.

