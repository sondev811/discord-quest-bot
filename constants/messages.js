const { intimacyShopType } = require("../models/intimacyShop");
const { emoji } = require("./general");

module.exports = {
  //Error
  error: `❌ Lỗi không xác định. Hãy thử lại 🥺.`,
  getUserTicketError: '❌ Không thể lấy thông tin ticket. Hãy thử lại 🥺',
  getUserInfoError: '❌ Không thể lấy thông tin user. Hãy thử lại 🥺',
  getUserGiveTicketError: '❌ Không thể lấy thông tin người nhận. Hãy thử lại 🥺',
  createUserError: '❌ Tạo tài khoản không thành công. Hãy thử lại 🥺',
  notPermission: 'Bạn không có quyền sử dụng chức năng này',
  developing: 'Chức năng đang phát triển',

  //Confession
  confessionGuideTitle: 'Hướng dẫn gửi confession',
  confessionGuideDM: 'Nhấn nút dưới để gửi confession nha. Bot sẽ gửi tin nhắn riêng thông báo cho bạn khi confession được duyệt.',
  DMConfessionReviewed: 'Confession của bạn đã gửi thành công và đang được xét duyệt. Tôi sẽ gửi tin nhắn kết quả xét duyệt sau.',
  notAccessSetupConfession: 'Bạn không có quyền hạn để setup confession.',
  setupConfessionSuccess: 'Setup confession thành công.',
  confessionReviewed: 'Confession đã được duyệt',
  confessionReviewedFailed: 'Confession đã bị từ chối',
  replyResolve: 'Đã duyệt reply.',
  reviewReject: 'Đã từ chối reply',

  // Register
  unreadyRegisterBot: 'Bạn chưa ký sử dụng bot. Sử dụng command /leudangky để đăng ký.',
  alreadyRegisterBot: 'Bạn đã đăng ký sử dụng bot rồi. Sử dụng command /leuhelp để biết các chức năng của bot.',
  registerSuccess: `${emoji.checked} Đăng ký sử dụng bot thành công. Sử dụng /leudaily điểm danh hoặc /leuhelp để biết thêm nhiều chức năng.`,
  registerFailed: (support, dev) => `❌ Đăng ký sử dụng bot không thành công. Mọi thắc mắc liên hệ trực tiếp <@${dev}> hoặc <#${support}>.`,
  expiredRegister: `Hết thời hạn đăng ký.`,

  // attended
  attended: 'Bạn đã điểm danh rồi.',
  attendedFailed: (support, dev) => `❌ Điểm danh không thành công. Mọi thắc mắc liên hệ trực tiếp <@${dev}> hoặc <#${support}>.`,
  giveUnreadyRegister: (username) => `${username} vẫn chưa đăng ký sử dụng bot để được nhận ticket.`,

  // Ticket
  preventGiveForMySelf: `❌ Bạn không thể tự chuyển ticket cho chính mình.`,
  checkTicket: (username, silver, gold) => `💵 | ${username} đang có ${silver} <:leu_ticket:1168509616938815650> ${emoji.fiveDotX} ${gold} <:leu_ticket_vang:1169279388370604062>`,
  outOfTicket: '❌ Số ticket của bạn không đủ. Hãy kiểm tra lại số ticket bạn đang có.',
  giveTicketFailed: (support, dev) => `❌ Chuyển ticket không thành công. Mọi thắc mắc liên hệ trực tiếp <@${dev}> hoặc <#${support}>.`,
  confirmGiveTicket: (receipt, amount) => `Xác nhận chuyển ${amount} <:leu_ticket:1168509616938815650> cho <@${receipt}>. Làng sẽ thu bạn thêm 10% trên mỗi giao dịch chuyển tiền. Bạn có muốn tiếp tục chuyển tiền không?`,
  rejectGiveTicket: (receipt, amount) => `Đã hủy chuyển ${amount} <:leu_ticket:1168509616938815650> cho <@${receipt}>.`,
  receiptMaxDailyClaimed: (receipt, totalTicketClaimDaily, limitTicketDaily) => `${emoji.redDot} Số tiền chuyển đã vượt quá giới hạn ticket nhận được mỗi ngày của <@${receipt}>. \n${emoji.redDot} Giới hạn của <@${receipt}> là ${totalTicketClaimDaily}/${limitTicketDaily}.\n » Để tăng số giới hạn nhận ticket sử dụng /leuquest và chọn nâng cấp.`,
  // Quest
  getAllQuestError: `❌ Không thể lấy danh sách nhiệm vụ.`,
  itemSubmitted: `Không có nhiệm vụ nộp vật phẩm này hoặc bạn đã nộp rồi.`,
  itemSubmitSuccess: (progress, completionCriteria) => `Đã nộp vật phẩm thành công. Tiến độ nhiệm vụ ${progress}/${completionCriteria}`,
  
  //Level
  upgradeLevelFail: (value, priceUpgrade, priceGoldUpgrade) => `Bạn không đủ vé xanh hoặc vé vàng để nâng lên cấp độ ${value}. Để nâng lên cấp độ ${value} cần ${priceUpgrade}${emoji.silverTicket} và ${priceGoldUpgrade}${emoji.goldenTicket}. Hãy chăm chỉ làm nhiệm vụ để kiếm vé >.<`,
  upgradeLevelSuccess: (value) => `Nâng lên cấp độ ${value} thành công.`,
  upgradeLevelError: () => `Nâng cấp độ không thành công. Có lỗi phát sinh. Mọi thắc mắc liên hệ trực tiếp <@${dev}> hoặc <#${support}>.`,
  upgradedLevelMax: (max) => `Bạn đã đạt cấp độ tối đa là cấp ${max}. Không thể lên cấp. Đợi chúng tôi update thêm <:lchenha:1143699428071460944>`,

  //Shop
  addRoleToShopError: `Lỗi phát sinh khi thêm role vào shop.`,
  addRoleToShopSuccess: (roleId, description, silver, gold) => `Đã thêm role <@&${roleId}> vào shop với mức giá ${silver} <:leu_ticket:1168509616938815650>${gold ? ` hoặc ${gold} <:leu_ticket_vang:1169279388370604062>` : ''}. Role sẽ có giá trị ${description}`,
  addGiftToShopError: `Lỗi phát sinh khi thêm quà tặng vào shop.`,
  addGiftToShopSuccess: (gift, point, silver, gold) => `Đã thêm quà tặng ${gift} vào shop với mức giá ${silver} <:leu_ticket:1168509616938815650>${gold ? ` hoặc ${gold} <:leu_ticket_vang:1169279388370604062>` : ''}. Quà tặng sẽ có giá trị ${point} điểm thân thiết khi tặng bạn bè`,
  insufficientBalance: (emoji, quantity, name, total, ticket, type) => `Số vé của bạn không đủ để mua ${quantity} vật phẩm ${emoji} ${name}. Tổng tiền ${type === 'silver' ? 'sau thuế ': ''}là ${total} ${ticket}.`,
  insufficientBalanceRole: (roleId, total, ticket, type) => `Số vé của bạn không đủ để mua role <@&${roleId}>. Tổng tiền ${type === 'silver' ? 'sau thuế ': ''}là ${total} ${ticket}.`,
  errorPurchase: `Lỗi phát sinh mua vật phẩm.`,
  existRoleOnBag: `Bạn đã sở hữu role này.`,
  addQuestItemToShopError: `Lỗi phát sinh khi thêm vật phẩm nhiệm vụ vào shop.`,
  addQuestItemToShopSuccess: (gift, silver, gold) => `Đã thêm vật phẩm nhiệm vụ ${gift} vào shop với mức giá ${silver} <:leu_ticket:1168509616938815650>${gold ? ` hoặc ${gold} <:leu_ticket_vang:1169279388370604062>` : ''}.`,
  addRoleToIntimacyShopSuccess: (roleId, description, intimacy) => `Đã thêm role <@&${roleId}> vào shop với mức giá ${intimacy}. Role sẽ có giá trị ${description}`,
  notExistFriend: `Bạn chưa có người bạn nào để có thể mua vật phẩm từ cửa hàng này. Hãy kết bạn và kiếm điểm thân thiết`,
  chooseFriend: `Chọn người bạn mua chung`,
  chooseFriend: `Chọn người bạn mua chung`,
  insufficientPoint: (point) => `Điểm thân mật của 2 bạn không đủ. Vật phẩm cần ${point}${emoji.imPoint}`,
  insufficientSilverIntimacyShop: (id, silver) => `Số vé của <@${id}> không đủ. Vật phẩm cần ${Math.floor(silver / 2)}${emoji.silverTicket} cho mỗi người.`,
  sendIntimacyPurchaseConfirm: (id, friend, item) => `${emoji.redDot}<@${id}> đã yêu cầu mua ${item.type === intimacyShopType.treasureBox ? `${item.treasureBoxInfo.emoji} ${item.treasureBoxInfo.name}` : `${item.specialInfo.emoji} ${item.specialInfo.name}`} với giá là ${item.intimacyPrice}${emoji.imPoint} và ${item.silverTicket}${emoji.silverTicket}. \n${emoji.redDot}<@${friend}> Hãy xác nhận.`,
  sendRejectIntimacyPurchase: (id, item) => `<@${id}> đã không đồng ý mua ${item.type === intimacyShopType.treasureBox ? `${item.treasureBoxInfo.emoji} ${item.treasureBoxInfo.name}` : `${item.specialInfo.emoji} ${item.specialInfo.name}`} với giá là ${item.intimacyPrice}${emoji.imPoint} và ${item.silverTicket}${emoji.silverTicket}`,
  purchaseCertificateSuccess: (id, friend, item, point) => `Mua ${item.specialInfo.emoji} ${item.specialInfo.name} thành công. Điểm thân mật của <@${id}> và <@${friend}> còn ${point}${emoji.imPoint}`,
  
  //Friend
  addFriendError: `Lỗi phát sinh khi kết bạn.`,
  addFriendForMySelf: `Bạn không thể gửi kết bạn cho chính mình`,
  friendFull: (maxFriend) => `Không thể kết bạn. Danh sách bạn bè của bạn đã đạt tối đa là ${maxFriend} người.\n » Để tăng số lượng bạn bè bạn cần mua thêm slot bạn bè. Sử dụng lệnh /leurela để biết thêm thông tin.`,
  friendTargetFull: (target, maxFriend) => `Không thể kết bạn. Danh sách bạn bè của <@${target}> đã đạt tối đa là ${maxFriend} người. \n » Để tăng số lượng bạn bè bạn cần mua thêm slot bạn bè. Sử dụng lệnh /leurela để biết thêm thông tin.`,
  alreadyFriend: (target) => `Không thể kết bạn. Bạn và <@${target}> đã là bạn bè.`,
  addFriendUnreadyRegister: (id) => `<@${id}> vẫn chưa đăng ký sử dụng bot.`,
  sentFriendRequest: (target) => `Đã gửi lời mời kết bạn. Đợi phản hồi từ <@${target}>. Tôi sẽ báo kết quả phản hồi qua tin nhắn riêng. Yêu cầu kết sẽ hết hạn sau 5 phút.`,
  rejectAddFriend: (username) => `Bạn đã không đồng ý kết bạn với ${username}.`,
  acceptAddFriend: (username) => `Bạn đã đồng ý kết bạn với ${username}. Hai bạn giờ đã là bạn bè.`,
  notifyRejectAddFriend: (target) => `${target} đã không đồng ý kết bạn.`,
  notifyAcceptAddFriend: (target) => `${target} đã đồng ý kết bạn. Hai bạn giờ đã là bạn bè.`,
  removeFriendForMySelf: `Bạn không thể xóa kết bạn chính mình`,
  removeNotFriend: (target) => `Xóa bạn không thành công. Bạn và <@${target}> không phải là bạn.`,
  confirmRemoveFriend: (target) => `Bạn chắc chắn muốn xoá bạn bè với <@${target}>. Tất cả dữ liệu về mối quan hệ sẽ bị xoá và không thể khôi phục.`,
  acceptRemoveFriend: (target) => `Bạn đã xóa <@${target}> khỏi danh sách bạn bè. Tất cả dữ liệu về mối quan hệ đã bị xoá và không thể khôi phục.`,
  notifyRemoveFriend: (target) => `${target} đã xóa bạn khỏi danh sách bạn bè. Tất cả dữ liệu về mối quan hệ đã bị xoá và không thể khôi phục.`,
  checkFriendForMySelf: `Bạn không thể xem mối quan hệ với chính mình`,
  isNotFriend: (target) => `Bạn và <@${target}> không phải là bạn.`,
  sendGiftForMySelf: `Bạn tặng quà cho chính mình`,
  isNotFriendGift: (target) => `Bạn và <@${target}> không phải là bạn. Kết bạn trước khi tặng quà`,
  insufficientBalanceFriend: (quantity) => `Số vé của bạn không đủ để mua slot bạn bè. Cần ${quantity} ${emoji.silverTicket} để mở thêm slot bạn bè.`,
  purchaseFriendSlotSuccess: (slot) => `Mua thêm slot bạn bè thành công. Số slot bạn bè hiện tại của bạn là ${slot}`,
  upgradeLevelFriendFail: (name, point) => `Điểm thân mật của bạn không đủ để lên ${name}. Điểm thân mật cần để lên cấp là ${point}${emoji.imPoint}.`,
  upgradeLevelFriendSuccess: (name) => `Nâng cấp độ thân thiết thành công. Hai bạn giờ đã là ${name}.`,
  insufficientBalanceCraft: (id) => `<@${id}> không đủ 5000${emoji.silverTicket}. Hãy chuẩn bị đủ 5000${emoji.silverTicket} cho mỗi người và 50${emoji.imPoint} trước khi ghép nhẫn.`,
  insufficientPointCraft: `Điểm thân thiết của 2 bạn không đủ 50${emoji.imPoint}. Hãy chuẩn bị đủ 5000${emoji.silverTicket} cho mỗi người và 50${emoji.imPoint} trước khi ghép nhẫn.`,
  craftFail: `Bạn chưa đủ nguyên liệu để ghép nhẫn kết hôn. Hãy kiếm nguyên liệu bằng cách mở rương kết hôn ở shop điểm thân mật.`,
  craftSuccess: (item) => `Chế tạo thành công. Bạn nhận được ${item.emoji} ${item.name}. Tất cả nguyên liệu chế tạo nhẫn của bạn sẽ bị xóa bỏ.`,
  marryFail: `Bạn chưa có ${emoji.weddingRing} **nhẫn kết hôn** hoặc ${emoji.certificate} **giấy chứng nhận kết hôn**. Hãy đi ghép nhẫn hoặc mua giấy chứng nhận ở **shop điểm thân mật**`,
  sendRequestMarry: (id, friend) => `<@${id}> đã gửi lời mời kết hôn. <@${friend}> hãy cho tôi biết quyết định của bạn.`,
  preventCraftWhenMarried: `Bạn đã kết hôn hoặc đã có nhẫn kết hôn. Bạn không thể ghép nhẫn kết hôn.`,
  sendRejectMarry: (user, friend) => `<@${friend}> đã từ chối lời mời kết hôn từ <@${user}>.`,
  //Role buff
  addRoleError: `Lỗi phát sinh khi thêm role.`,
  addRoleSuccess: (roleId, description) => `Đã thêm role <@&${roleId}>. Role sẽ có giá trị ${description}`,
};