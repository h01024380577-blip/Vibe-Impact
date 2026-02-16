import { ImpactResult } from '@/types/analysis';

export const scenarioImpacts: Record<string, ImpactResult[]> = {
  retry: [
    {
      file: 'order.js',
      function: 'updateOrderStatus()',
      level: 'direct',
      reason: 'handlePaymentError()에서 호출하는 updateOrderStatus()는 결제 실패 시 자동 환불(initiateRefund)을 트리거함. 에러 처리 로직 변경 시 환불 플로우 영향 가능',
    },
    {
      file: 'refund.js',
      function: 'initiateRefund()',
      level: 'direct',
      reason: 'updateOrderStatus()를 통해 간접 호출됨. 에러 타입 변경 시 환불 조건 판단에 영향 가능',
    },
    {
      file: 'notification.js',
      function: 'sendAlert()',
      level: 'indirect',
      reason: 'handlePaymentError()가 sendAlert()를 직접 호출. 에러 메시지 포맷 변경 시 알림 내용 영향',
    },
    {
      file: 'logger.js',
      function: 'logTransaction()',
      level: 'indirect',
      reason: '에러 로깅 포맷/파라미터 변경 시 로그 일관성 영향',
    },
    {
      file: 'auth.js',
      function: 'validateUser()',
      level: 'none',
      reason: 'payment 모듈과 의존 관계 없음',
    },
  ],
  'log-format': [
    {
      file: 'payment.js',
      function: 'processPayment()',
      level: 'indirect',
      reason: 'logTransaction()을 직접 호출. 포맷 변경 시 로그 파싱 로직에 영향 가능',
    },
    {
      file: 'order.js',
      function: 'updateOrderStatus()',
      level: 'indirect',
      reason: 'logTransaction()을 직접 호출. 포맷 변경 시 로그 파싱 로직에 영향 가능',
    },
    {
      file: 'refund.js',
      function: 'initiateRefund()',
      level: 'indirect',
      reason: 'logTransaction()을 직접 호출. 포맷 변경 시 로그 파싱 로직에 영향 가능',
    },
    {
      file: 'notification.js',
      function: 'sendAlert()',
      level: 'indirect',
      reason: 'logTransaction()을 직접 호출. 포맷 변경 시 로그 파싱 로직에 영향 가능',
    },
    {
      file: 'auth.js',
      function: 'validateUser()',
      level: 'none',
      reason: 'logger 모듈과 의존 관계 없음',
    },
  ],
  '2fa': [
    {
      file: 'payment.js',
      function: 'processPayment()',
      level: 'none',
      reason: 'auth 모듈과 의존 관계 없음',
    },
    {
      file: 'order.js',
      function: 'processOrder()',
      level: 'none',
      reason: 'auth 모듈과 의존 관계 없음',
    },
    {
      file: 'refund.js',
      function: 'initiateRefund()',
      level: 'none',
      reason: 'auth 모듈과 의존 관계 없음',
    },
    {
      file: 'notification.js',
      function: 'sendAlert()',
      level: 'none',
      reason: 'auth 모듈과 의존 관계 없음',
    },
    {
      file: 'logger.js',
      function: 'logTransaction()',
      level: 'none',
      reason: 'auth 모듈과 의존 관계 없음',
    },
  ],
};

export const beforeCode: Record<string, string> = {
  retry: `// ❌ 기존 방식 — 맥락 없이 생성된 코드
export function handlePaymentError(orderId, error) {
  const MAX_RETRIES = 3;
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const result = chargeCard(orderId);
      logTransaction(orderId, 'payment_retry_success', i + 1);
      updateOrderStatus(orderId, 'paid');
      return result;
    } catch (retryError) {
      logTransaction(orderId, 'payment_retry', i + 1);
      // ⚠️ 문제: 매 재시도마다 updateOrderStatus('payment_failed') 호출
      // → 매번 환불이 트리거됨!
      updateOrderStatus(orderId, 'payment_failed');
      // ⚠️ 문제: 매 재시도마다 알림 발송
      sendAlert('payment_error', { orderId, error: retryError.message });
    }
  }
  
  throw new PaymentError('Max retries exceeded');
}`,
  'log-format': `// ❌ 기존 방식 — 맥락 없이 생성된 코드
export function logTransaction(orderId, action, detail) {
  // CSV 포맷으로 변경
  const entry = [
    new Date().toISOString(),
    orderId,
    action,
    detail,
    getLogLevel(action)
  ].join(',');
  
  // ⚠️ 문제: 다른 모듈에서 JSON.parse()로 로그를 파싱하는 경우 에러 발생
  writeToFile(entry);
  
  if (getLogLevel(action) === 'error') {
    writeToErrorLog(entry);
  }
}`,
  '2fa': `// ✅ 이 경우는 영향 범위가 작아 기존 방식도 안전
export function validateUser(userId) {
  const user = findUser(userId);
  if (!user) throw new Error('User not found');
  
  // 2단계 인증 추가
  const token = generate2FAToken(user);
  const isValid = verify2FAToken(user, token);
  if (!isValid) throw new Error('2FA verification failed');
  
  return user;
}`,
};

export const afterCode: Record<string, string> = {
  retry: `// ✅ Vibe Impact 방식 — 맥락 인지 코드
export function handlePaymentError(orderId, error) {
  const MAX_RETRIES = 3;
  let lastError = error;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logTransaction(orderId, 'payment_retry', {
        attempt,
        maxRetries: MAX_RETRIES,
        previousError: lastError.message
      });
      
      const result = chargeCard(orderId);
      logTransaction(orderId, 'payment_retry_success', { attempt });
      updateOrderStatus(orderId, 'paid');
      return result;
    } catch (retryError) {
      lastError = retryError;
      logTransaction(orderId, 'payment_retry_failed', {
        attempt,
        error: retryError.message
      });
      // ✅ 재시도 중에는 상태를 'retrying'으로 유지
      // → 환불이 트리거되지 않음
      updateOrderStatus(orderId, 'retrying');
    }
  }
  
  // ✅ 최종 실패 시에만 'payment_failed'로 변경 + 알림
  logTransaction(orderId, 'payment_failed', {
    totalAttempts: MAX_RETRIES,
    finalError: lastError.message
  });
  updateOrderStatus(orderId, 'payment_failed');
  sendAlert('payment_error', {
    orderId,
    error: lastError.message,
    retriesAttempted: MAX_RETRIES
  });
  
  throw new PaymentError(lastError.message);
}`,
  'log-format': `// ✅ Vibe Impact 방식 — 맥락 인지 코드
export function logTransaction(orderId, action, detail) {
  const entry = {
    timestamp: new Date().toISOString(),
    orderId,
    action,
    detail,
    level: getLogLevel(action)
  };
  
  // ✅ 내부적으로는 JSON 유지 (다른 모듈 호환성)
  // CSV는 파일 출력 시에만 변환
  const csvLine = [
    entry.timestamp,
    entry.orderId,
    entry.action,
    typeof entry.detail === 'object' 
      ? JSON.stringify(entry.detail) 
      : entry.detail,
    entry.level
  ].join(',');
  
  writeToFile(csvLine);
  
  if (entry.level === 'error') {
    writeToErrorLog(csvLine);
  }
  
  // ✅ 구조화된 객체도 함께 반환 (다른 모듈 호환)
  return entry;
}`,
  '2fa': `// ✅ Vibe Impact 방식도 동일 (영향 범위가 작아 추가 맥락 불필요)
export function validateUser(userId) {
  const user = findUser(userId);
  if (!user) throw new Error('User not found');
  
  // 2단계 인증 추가
  const token = generate2FAToken(user);
  const isValid = verify2FAToken(user, token);
  if (!isValid) throw new Error('2FA verification failed');
  
  return user;
}`,
};

export const enhancedPrompts: Record<string, string> = {
  retry: `handlePaymentError 함수의 에러 처리 로직을 수정해서 재시도 로직을 추가해줘.

[자동 추가된 맥락 정보]
⚠️ 이 함수 수정 시 아래 의존 관계를 반드시 고려하세요:
1. 이 함수는 payment.js > processPayment()의 catch 블록에서 호출됩니다.
2. 이 함수 내부에서 order.js > updateOrderStatus(orderId, 'payment_failed')를 호출하며, 이는 자동으로 refund.js > initiateRefund()를 트리거합니다. 재시도 로직 추가 시 재시도 중 환불이 시작되지 않도록 주의하세요.
3. notification.js > sendAlert('payment_error', ...)를 호출합니다. 재시도 시마다 알림이 발송되지 않도록 최종 실패 시에만 알림을 보내세요.
4. logger.js > logTransaction()을 호출합니다. 재시도 횟수와 각 시도 결과를 로그에 포함하세요.
5. auth.js는 이 수정과 무관합니다.`,
  'log-format': `logTransaction 함수의 로그 포맷을 JSON에서 CSV로 변경해줘.

[자동 추가된 맥락 정보]
⚠️ 이 함수 수정 시 아래 의존 관계를 반드시 고려하세요:
1. logTransaction()은 payment.js, order.js, refund.js, notification.js 총 4개 파일에서 호출됩니다.
2. 현재 모든 호출부에서 반환값에 의존하지는 않지만, 로그 포맷 변경 시 외부 로그 파싱 시스템에 영향이 있을 수 있습니다.
3. CSV 변환 시 detail 파라미터가 객체인 경우의 직렬화 방법을 고려하세요.
4. auth.js는 이 수정과 무관합니다.`,
  '2fa': `validateUser 함수에 2단계 인증을 추가해줘.

[자동 추가된 맥락 정보]
✅ 이 함수의 영향 범위가 제한적입니다:
1. auth.js 내부의 checkPermission()에서만 호출됩니다.
2. payment, order, refund, notification, logger 모듈과 의존 관계가 없습니다.
3. 안전하게 수정 가능합니다.`,
};

export const problemPoints: Record<string, string[]> = {
  retry: [
    'order.js의 환불 로직과 충돌 가능 — 재시도 중 환불이 매번 트리거됨',
    'notification.js 알림 중복 발생 가능 — 재시도마다 에러 알림 전송',
    'logger.js 로그 포맷 불일치 가능 — 재시도 정보가 로그에 누락',
  ],
  'log-format': [
    '모든 호출부(4개 파일)에서 로그 포맷 불일치 발생 가능',
    '외부 로그 파싱 시스템이 JSON을 기대하면 에러',
    'detail이 객체인 경우 CSV 직렬화 문제',
  ],
  '2fa': [
    '이 수정은 영향 범위가 작아 기존 방식도 비교적 안전합니다',
  ],
};
