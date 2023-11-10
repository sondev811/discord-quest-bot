const { EmbedBuilder } = require("@discordjs/builders");
const { emoji } = require("../constants/general");

const createRegisterMessages = (body = {}) => {
  return new EmbedBuilder()
    .setTitle(`${emoji.ruby} Điều Khoản Sử Dụng Bot Làng`)
    .setDescription('``⚠️``Trước khi sử dụng bot bạn cần phải lưu ý và chấp thuận các điều khoản sau:\n\n' + emoji.redDot + ' ``Không trao đổi / mua bán các vật phẩm, đơn vị tiền tệ của bot sang các vật phẩm ở các nền tảng khác (VND, Vật phẩm game,...)``\n'+ emoji.blank + '» Chúng mình sẽ không chịu trách nhiệm cho bất cứ giao dịch nào diễn ra bên ngoài bot Làng\n\n'+ emoji.redDot +' ``Không sử dụng tool, script trong quá trình sử dụng bot``\n' + emoji.blank +'» Tài khoản của bạn sẽ bị cấm khi chúng mình phát hiện có phần mềm thứ 3 can thiệp vào trong quá trình sử dụng\n\n'+ emoji.redDot +' ``Không lợi dụng lỗi bot trong quá trình sử dụng``\n'+ emoji.blank +'» Bạn nên báo cáo ngay cho chúng mình khi phát hiện lỗi. Nếu cố tình lợi dụng các bug này tài khoản của bạn có thể bị khóa hoặc bị reset\n\n❓ Nếu bạn có thắc mắc cần giải đáp, hãy liên hệ cho chúng mình ở kênh <#1137086118496575631> hoặc liên hệ trực tiếp <@1091333881342476328>\n\n``⚠️`` Lưu ý : Bạn phải chấp nhận tất cả các điều trên mới có thể sử dụng bot, vi phạm bất kì điều luật nào cũng có thể dẫn đến tình trạng bị khóa tài khoản sử dụng bot.')
    .setColor(0xe59b9b)
    .setTimestamp()
    .setFooter({ 
      text: `Bot Làng • discord.gg/langleuleuliuliu`,
      iconURL: 'https://cdn.discordapp.com/avatars/1168802361481904188/3526d4d2d2283aec1df941b1b5aef6ee.png'
    });
};

module.exports = { createRegisterMessages };