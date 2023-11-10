const { ApplicationCommandOptionType } = require("discord.js")

const schema = [
  {
    name: "leudangky",
    description: "Lệnh để đăng ký sử dụng bot, cho người chưa sử dụng bot lần nào"
  },
  {
    name: "leuinfo",
    description: "Lệnh để kiểm tra thông tin cá nhân của bạn"
  },
  {
    name: "leutickets",
    description: "Lệnh kiểm tra số lượng vé bạn đang có"
  },
  {
    name: "leugive",
    description: "Lệnh chuyển ticket cho ai đó",
    options: [
      {
        name: "username",
        type: ApplicationCommandOptionType.User,
        description: "Username muốn chuyển ticket",
        required: true
      }
    ]
  },
  {
    name: "leudaily",
    description: "Lệnh điểm danh hàng ngày"
  },
  {
    name: "leuquest",
    description: "Lệnh hiện danh sách nhiệm vụ hằng ngày của bạn"
  },
  {
    name: "leushop",
    description: "Hiển thị kênh shop của server"
  },
  {
    name: "leuthemban",
    description: "Lệnh kết bạn với ai đó",
    options: [
      {
        name: "username",
        type: ApplicationCommandOptionType.User,
        description: "Username muốn kết bạn",
        required: true
      }
    ]
  },
  {
    name: "leuxoaban",
    description: "Lệnh xóa kết bạn",
    options: [
      {
        name: "username",
        type: ApplicationCommandOptionType.User,
        description: "Username muốn xóa kết bạn",
        required: true
      }
    ]
  },
  {
    name: "leurela",
    description: "Xem các mối quan hệ của bạn"
  },
  {
    name: "leutangqua",
    description: "Tặng quà cho bạn",
    options: [
      {
        name: "username",
        type: ApplicationCommandOptionType.User,
        description: "Username muốn tặng quà",
        required: true
      }
    ]
  },
  {
    name: "leubag",
    description: "Xem các túi đồ của bạn"
  },
]

module.exports = { schema };
