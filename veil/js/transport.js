/* Слой связи с сервером. Сейчас — заглушка: всё хранится только на устройстве.
   Когда выберете бэкенд, реализуйте эти методы; остальной код менять не нужно (см. LAUNCH.md).
   Входящие сообщения передавайте в onMessage({from, peerId, text, ttl, ts}), удаление чата — в onDestroy(from). */
window.VeilTransport = {
  enabled: false, onMessage: null, onDestroy: null,
  async setUsername() { return { ok: true }; },
  async findUser() { return null; },
  send(chat, msg) { },
  deleteChatForAll(chat) { },
  purchase(kind, id) { return Promise.resolve(false); },
  publishLocation(pos, audience) { }
};
