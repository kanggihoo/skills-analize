---
name: swarm
description: "Fan out N parallel workers, drain them, and return one report. Use for /swarm, 'swarm this', or parallel coverage, races, gauntlets, and exploration."
disable-model-invocation: true
---

# Swarm

N개의 병렬 클라우드 워커에 작업을 나눠 준다. 워커는 서로 다른 조각을 맡거나, 같은 브리프로 경주하거나, 둘을 섞을 수 있다. 부모는 기다리고, 결과를 모아, 보고서 하나를 돌려준다.

## 시작

아무것도 실행하기 전에, 단계마다 항목 하나씩 할 일 목록을 연다.

1. Frame
2. Fan out
3. Aggregate
4. Report

## A단계: Frame

1. 완료 판정 기준과 스웜이 돌려줘야 할 산출물 또는 보고서를 명시한다.
2. 형태를 고른다. 조각으로 나누거나, 같은 브리프로 워커 N명을 경주시키거나, 둘을 섞는다. 경주나 혼합 형태라면, 생성 전에 `first pass`, `rank all`, `best-of` 중 하나를 선언한다.
3. N은 사용자가 정하거나 형태에서 도출한다. N은 전체 워커 수이며, 클라우드 동시 실행 한도가 아니다.
4. `~/.cursor/rules/pstack-models.mdc`의 `swarm workers` 줄에서 워커 모델을 고른다. 규칙이나 그 줄이 없으면 `grok-4.7-xhigh-fast`를 쓴다. `auto` 또는 `inherit-parent`라면 `model`을 생략해 워커가 부모 모델에서 돌게 한다. Task 도구가 슬러그를 거부하면 기본값을 쓰고 그 사실을 말한다. 기본값까지 거부하면 오류 메시지에 나온 같은 계열의 가장 가까운 유효 슬러그를 쓴다. 모델 경주라면 각 팔의 모델을 미리 이름 붙인다.
5. 쓰기 작업을 하는 워커마다 자기 쓰기 가능한 출력을 준다. 워커가 커밋을 검증하거나 측정할 때는, 각 브리프가 정확한 SHA를 명시한다. 측정 브리프는 방법(표본 수, 표본 하나가 무엇인지, 순서)도 명시한다. 워커는 두 가지 모두 결과에 기록한다.

## B단계: Fan out

`subagent_type: generalPurpose`, `environment: "cloud"`, `run_in_background: true`로 메시지 하나에 워커 N명을 모두 띄운다. 모델은 4단계에서 정한 것을 쓰되, `auto` 또는 `inherit-parent`면 설정하지 않는다. `environment: "local"`은 워커가 사용자 컴퓨터의 무언가에 접근해야 할 때만 쓴다.

워커가 기본이 아닌, 푸시된 브랜치에서 시작해야 할 때는 `cloud_base_branch`를 넘긴다.

모든 브리프는 독립적으로 이해되어야 한다. 목표, 범위, 정확한 조각이나 경주 팔, 검증 방법, 보고할 내용을 포함한다. 보고는 증거와 함께 `PASS`, `ISSUES`, `BLOCKED` 중 하나를 쓴다. 결함을 증명할 수 있는 워커는 `ISSUES`로 보고하고, 첫 번째만이 아니라 증명할 수 있는 모든 문제를 나열한다.

워커가 탈락하면 N-1명으로 진행하고 그 사실을 적는다.

## C단계: Aggregate

터미널 결과를 읽는다. 브리프가 명시한 SHA와 방법을 기록하지 않은 결과는 버리고, 그 워커를 한 번 다시 띄운다. 두 번째에도 실패하면 공백으로 기록한다. 공백은 통과로 치지 않는다. 커버리지라면 필요한 모든 조각마다 결과가 있어야 한다. 경주라면 미리 선언한 선택 규칙을 적용한다. first pass, rank all, best-of 중 하나다. 워커의 원본 덤프를 붙여 넣지 않는다.

간결한 결과 표, 증거가 있는 한 줄짜리 문제 목록, 명시적인 공백과 탈락을 유지한다.

## D단계: Report

표, 문제 한 줄 요약, 공백이나 탈락, 사용한 경우 경주 규칙을 담아, 채팅에 통합 보고서 하나를 돌려준다.
