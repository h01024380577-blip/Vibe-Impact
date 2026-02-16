import { ProjectFile } from '@/types/analysis';

export const sampleFiles: ProjectFile[] = [
  {
    name: 'payment.js',
    path: 'src/payment.js',
    content: `import { updateOrderStatus } from './order.js';
import { logTransaction } from './logger.js';
import { sendAlert } from './notification.js';

export function processPayment(orderId, amount) {
  try {
    const result = chargeCard(amount);
    logTransaction(orderId, 'payment_success', amount);
    updateOrderStatus(orderId, 'paid');
    return result;
  } catch (error) {
    handlePaymentError(orderId, error);
  }
}

export function handlePaymentError(orderId, error) {
  logTransaction(orderId, 'payment_failed', error.message);
  updateOrderStatus(orderId, 'payment_failed');
  sendAlert('payment_error', { orderId, error: error.message });
  throw new PaymentError(error.message);
}

function chargeCard(amount) {
  // 외부 결제 API 호출
  return { success: true, transactionId: 'txn_' + Date.now() };
}`,
    functions: ['processPayment', 'handlePaymentError', 'chargeCard'],
  },
  {
    name: 'order.js',
    path: 'src/order.js',
    content: `import { initiateRefund } from './refund.js';
import { logTransaction } from './logger.js';

export function processOrder(userId, items) {
  const orderId = generateOrderId();
  const order = { id: orderId, userId, items, status: 'pending' };
  saveOrder(order);
  return order;
}

export function updateOrderStatus(orderId, status) {
  const order = getOrder(orderId);
  order.status = status;
  
  if (status === 'payment_failed') {
    order.failedAt = new Date();
    logTransaction(orderId, 'status_change', status);
    // 결제 실패 시 자동 환불 시도
    initiateRefund(orderId, order.totalAmount);
  }
  
  saveOrder(order);
  return order;
}

function generateOrderId() { return 'ORD_' + Date.now(); }
function saveOrder(order) { /* DB 저장 */ }
function getOrder(orderId) { return { id: orderId, totalAmount: 0, status: 'pending' }; }`,
    functions: ['processOrder', 'updateOrderStatus', 'generateOrderId', 'saveOrder', 'getOrder'],
  },
  {
    name: 'refund.js',
    path: 'src/refund.js',
    content: `import { logTransaction } from './logger.js';
import { sendAlert } from './notification.js';

export function initiateRefund(orderId, amount) {
  try {
    const result = processRefundToCard(amount);
    logTransaction(orderId, 'refund_success', amount);
    sendAlert('refund_completed', { orderId, amount });
    return result;
  } catch (error) {
    logTransaction(orderId, 'refund_failed', error.message);
    sendAlert('refund_failed', { orderId, error: error.message });
    throw error;
  }
}

function processRefundToCard(amount) {
  return { success: true, refundId: 'ref_' + Date.now() };
}`,
    functions: ['initiateRefund', 'processRefundToCard'],
  },
  {
    name: 'notification.js',
    path: 'src/notification.js',
    content: `import { logTransaction } from './logger.js';

export function sendAlert(type, data) {
  const message = formatAlertMessage(type, data);
  
  // 이메일 발송
  sendEmail(data.orderId, message);
  
  // 슬랙 알림
  sendSlackNotification(message);
  
  logTransaction(data.orderId, 'alert_sent', type);
}

function formatAlertMessage(type, data) {
  const templates = {
    'payment_error': \`결제 오류 발생 - 주문 \${data.orderId}\`,
    'refund_completed': \`환불 완료 - 주문 \${data.orderId}, 금액: \${data.amount}\`,
    'refund_failed': \`환불 실패 - 주문 \${data.orderId}\`
  };
  return templates[type] || \`알림: \${type}\`;
}

function sendEmail(orderId, message) { /* 이메일 전송 */ }
function sendSlackNotification(message) { /* 슬랙 전송 */ }`,
    functions: ['sendAlert', 'formatAlertMessage', 'sendEmail', 'sendSlackNotification'],
  },
  {
    name: 'logger.js',
    path: 'src/logger.js',
    content: `export function logTransaction(orderId, action, detail) {
  const entry = {
    timestamp: new Date().toISOString(),
    orderId,
    action,
    detail,
    level: getLogLevel(action)
  };
  
  writeToFile(entry);
  
  if (entry.level === 'error') {
    writeToErrorLog(entry);
  }
}

function getLogLevel(action) {
  if (action.includes('failed') || action.includes('error')) return 'error';
  return 'info';
}

function writeToFile(entry) { console.log(JSON.stringify(entry)); }
function writeToErrorLog(entry) { console.error(JSON.stringify(entry)); }`,
    functions: ['logTransaction', 'getLogLevel', 'writeToFile', 'writeToErrorLog'],
  },
  {
    name: 'auth.js',
    path: 'src/auth.js',
    content: `export function validateUser(userId) {
  const user = findUser(userId);
  if (!user) throw new Error('User not found');
  return user;
}

export function checkPermission(userId, action) {
  const user = validateUser(userId);
  return user.permissions.includes(action);
}

function findUser(userId) {
  return { id: userId, permissions: ['read', 'write', 'purchase'] };
}`,
    functions: ['validateUser', 'checkPermission', 'findUser'],
  },
];

export const scenarios = [
  {
    id: 'retry',
    label: 'handlePaymentError에 재시도 로직 추가',
    prompt: 'handlePaymentError 함수의 에러 처리 로직을 수정해서 재시도 로직을 추가해줘',
    targetFile: 'payment.js',
    targetFunction: 'handlePaymentError',
  },
  {
    id: 'log-format',
    label: 'logTransaction 로그 포맷을 CSV로 변경',
    prompt: 'logTransaction 함수의 로그 포맷을 JSON에서 CSV로 변경해줘',
    targetFile: 'logger.js',
    targetFunction: 'logTransaction',
  },
  {
    id: '2fa',
    label: 'validateUser에 2단계 인증 추가',
    prompt: 'validateUser 함수에 2단계 인증을 추가해줘',
    targetFile: 'auth.js',
    targetFunction: 'validateUser',
  },
];
