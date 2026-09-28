/* Слой связи с сервером. Сейчас — заглушка: сообщения хранятся только на устройстве.
   Для запуска замените реализации на реальные (WebSocket/HTTP) — остальной код менять не нужно.
   См. LAUNCH.md. */
window.VeilTransport = {
  send(chat, msg) { /* TODO: зашифровать (E2E) и отправить на сервер; получатель шлёт входящие через deliver() */ },
  purchase(kind, id) { /* TODO: платёжный провайдер; вернуть Promise<boolean> */ return Promise.resolve(false); },
  publishLocation(pos, audience) { /* TODO: отправлять геопозицию только выбранной аудитории */ },
  deleteChatForAll(chatId) { /* TODO: команда серверу удалить чат у обоих участников */ }
};
