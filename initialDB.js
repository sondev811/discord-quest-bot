const mongoose = require('mongoose');
const { levelModel } = require('./models/level.model');
const { questModel, TaskTypeEnum, RewardEnum, ActionEnum } = require('./models/quest.model');
const { userModel } = require('./models/user.model');
const { UserService } = require('./services/user.service');
const { treasureBoxModel, TreasureItemType } = require('./models/treasureBox.model');
const { specialItemType, specialItemModel, typeBuffSpecial } = require('./models/specialItem.model');
const { GiftService } = require('./services/gift.service');
const { intimacyShopType, intimacyShopModel } = require('./models/intimacyShop');
const { friendModel, relationship } = require('./models/friend.model');
const { FriendService } = require('./services/friend.service');
const { relationshipModel, relationshipType } = require('./models/relationship.model');
require('dotenv/config');

const initializeDatabase = async () => {
  try {
    await mongoose.connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // const existingLevels = await levelModel.find();

    // if (existingLevels.length === 0) {
    //   const defaultLevels = [
    //     {
    //       id: "1",
    //       value: 1,
    //       limitTicketDaily: 2000,
    //       limitQuestQuantity: 3,
    //       priceUpgrade: 0,
    //       priceGoldUpgrade: 0
    //     },
    //     {
    //       id: "2",
    //       value: 2,
    //       limitTicketDaily: 3000,
    //       limitQuestQuantity: 3,
    //       priceUpgrade: 10000,
    //       priceGoldUpgrade: 0
    //     },
    //     {
    //       id: "3",
    //       value: 3,
    //       limitTicketDaily: 4000,
    //       limitQuestQuantity: 4,
    //       priceUpgrade: 25000,
    //       priceGoldUpgrade: 40
    //     },
    //     {
    //       id: "4",
    //       value: 4,
    //       limitTicketDaily: 5000,
    //       limitQuestQuantity: 4,
    //       priceUpgrade: 45000,
    //       priceGoldUpgrade: 70
    //     },
    //     {
    //       id: "5",
    //       value: 5,
    //       limitTicketDaily: 6000,
    //       limitQuestQuantity: 5,
    //       priceUpgrade: 65000,
    //       priceGoldUpgrade: 100
    //     },
    //     {
    //       id: "6",
    //       value: 6,
    //       limitTicketDaily: 8000,
    //       limitQuestQuantity: 5,
    //       priceUpgrade: 85000,
    //       priceGoldUpgrade: 130 
    //     },
    //     {
    //       id: "7",
    //       value: 7,
    //       limitTicketDaily: 10000,
    //       limitQuestQuantity: 6,
    //       priceUpgrade: 105000,
    //       priceGoldUpgrade: 160 
    //     }
    //   ];

    //   await levelModel.insertMany(defaultLevels);
    //   console.log('Default level inserted successfully.');
    // }

    // tạo relationship
    // const existingRelationship = await relationshipModel.find();

    // if (existingRelationship.length === 0) {
    //   const defaultRelationShip = [
    //     {
    //       name: relationshipType.friend,
    //       level: 1,
    //       intimacyPointUpgrade: 0
    //     },
    //     {
    //       name: relationshipType.bestFriend,
    //       level: 2,
    //       intimacyPointUpgrade: 750
    //     },
    //     {
    //       name: relationshipType.soulmate,
    //       level: 3,
    //       intimacyPointUpgrade: 1250
    //     },
    //     {
    //       name: relationshipType.married,
    //       level: 4,
    //       intimacyPointUpgrade: 2000
    //     }
    //   ];

    //   await relationshipModel.insertMany(defaultRelationShip);
    //   console.log('Default relationship inserted successfully.');
    // }

    const existingQuest = await questModel.find();

    if (existingQuest.length === 0) {
      const defaultQuest = [
        {
          id: '1',
          type: TaskTypeEnum.DAILY,
          description: `Nhắn tin bất kỳ channel`,
          action: ActionEnum.MESSAGE,
          placeChannel: '',
          minCompletionCriteria: 400,
          maxCompletionCriteria: 600,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 200,
              maxQuantity: 600
            },
            {
              type: RewardEnum.SEED,
              minQuantity: 1,
              maxQuantity: 1
            },
            {
              type: RewardEnum.FARM_ITEM,
              minQuantity: 1,
              maxQuantity: 1
            }
          ]
        },
        { 
          id: '2',
          type: TaskTypeEnum.DAILY,
          description: `Nhắn tin tại channel`,
          action: ActionEnum.MESSAGE,
          placeChannel: '1142667605761605753',
          minCompletionCriteria: 200,
          maxCompletionCriteria: 400,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 200,
              maxQuantity: 600
            },
            {
              type: RewardEnum.SEED,
              minQuantity: 1,
              maxQuantity: 1
            },
            {
              type: RewardEnum.FARM_ITEM,
              minQuantity: 1,
              maxQuantity: 1
            }
          ]
        },
        {
          id: '3',
          type: TaskTypeEnum.DAILY,
          description: `Đăng bài tại channel feeds`,
          action: ActionEnum.POST_BLOG,
          placeChannel: '1164592748758839306',
          minCompletionCriteria: 5,
          maxCompletionCriteria: 12,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 200,
              maxQuantity: 600
            },
            {
              type: RewardEnum.SEED,
              minQuantity: 1,
              maxQuantity: 1
            },
            {
              type: RewardEnum.FARM_ITEM,
              minQuantity: 1,
              maxQuantity: 1
            }
          ]
        },
        {
          id: '4',
          type: TaskTypeEnum.DAILY,
          description: ` Bình luận bài post`,
          action: ActionEnum.REPLY_POST_BLOG,
          placeChannel: '1164592748758839306',
          minCompletionCriteria: 6,
          maxCompletionCriteria: 13,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 200,
              maxQuantity: 600
            },
            {
              type: RewardEnum.SEED,
              minQuantity: 1,
              maxQuantity: 1
            },
            {
              type: RewardEnum.FARM_ITEM,
              minQuantity: 1,
              maxQuantity: 1
            }
          ]
        },
        {
          id: '5',
          type: TaskTypeEnum.DAILY,
          description: `Đăng bài tại channel confession`,
          action: ActionEnum.POST_CONFESSION,
          placeChannel: '1158851593802887229',
          minCompletionCriteria: 1,
          maxCompletionCriteria: 3,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 200,
              maxQuantity: 600
            },
            {
              type: RewardEnum.SEED,
              minQuantity: 1,
              maxQuantity: 1
            },
            {
              type: RewardEnum.FARM_ITEM,
              minQuantity: 1,
              maxQuantity: 1
            }
          ]
        },
        {
          id: '6',
          type: TaskTypeEnum.DAILY,
          description: `Trả lời confession`,
          action: ActionEnum.REPLY_CONFESSION,
          placeChannel: '1158851593802887229',
          minCompletionCriteria: 3,
          maxCompletionCriteria: 7,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 200,
              maxQuantity: 600
            },
            {
              type: RewardEnum.SEED,
              minQuantity: 1,
              maxQuantity: 1
            },
            {
              type: RewardEnum.FARM_ITEM,
              minQuantity: 1,
              maxQuantity: 1
            }
          ]
        },
        {
          id: '7',
          type: TaskTypeEnum.DAILY,
          description: `Tặng quà cho một người bất kỳ`,
          action: ActionEnum.GIFT,
          placeChannel: '',
          minCompletionCriteria: 1,
          maxCompletionCriteria: 2,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 200,
              maxQuantity: 800
            },
            {
              type: RewardEnum.SEED,
              minQuantity: 1,
              maxQuantity: 1
            },
            {
              type: RewardEnum.FARM_ITEM,
              minQuantity: 1,
              maxQuantity: 1
            }
          ]
        },
        {
          id: '8',
          type: TaskTypeEnum.DAILY,
          description: `Boost Server 1 lần`,
          action: ActionEnum.BOOST_SERVER,
          placeChannel: '',
          minCompletionCriteria: 1,
          maxCompletionCriteria: 1,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 400,
              maxQuantity: 1000
            },
            {
              type: RewardEnum.GOLD_TICKET,
              minQuantity: 7,
              maxQuantity: 15
            },
            {
              type: RewardEnum.SEED,
              minQuantity: 1,
              maxQuantity: 1
            },
            {
              type: RewardEnum.FARM_ITEM,
              minQuantity: 1,
              maxQuantity: 1
            }
          ]
        },
        {
          id: '9',
          type: TaskTypeEnum.DAILY,
          description: `Treo voice`,
          action: ActionEnum.VOICE,
          placeChannel: '',
          minCompletionCriteria: 2,
          maxCompletionCriteria: 9,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 200,
              maxQuantity: 600
            },
            {
              type: RewardEnum.SEED,
              minQuantity: 1,
              maxQuantity: 1
            },
            {
              type: RewardEnum.FARM_ITEM,
              minQuantity: 1,
              maxQuantity: 1
            }
          ]
        },
        {
          id: '18',
          type: TaskTypeEnum.DAILY,
          description: `Trồng cây`,
          action: ActionEnum.FARM,
          placeChannel: '',
          minCompletionCriteria: 2,
          maxCompletionCriteria: 9,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 200,
              maxQuantity: 600
            },
            {
              type: RewardEnum.SEED,
              minQuantity: 1,
              maxQuantity: 1
            },
            {
              type: RewardEnum.FARM_ITEM,
              minQuantity: 1,
              maxQuantity: 1
            }
          ]
        },
        // week task
        {
          id: '10',
          type: TaskTypeEnum.WEEK,
          description: `Nhắn tin bất kỳ channel`,
          action: ActionEnum.MESSAGE,
          placeChannel: '',
          minCompletionCriteria: 1000,
          maxCompletionCriteria: 3000,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 1000,
              maxQuantity: 3000
            },
            {
              type: RewardEnum.GOLD_TICKET,
              minQuantity: 7,
              maxQuantity: 15
            },
            {
              type: RewardEnum.GIFT,
              minQuantity: 2,
              maxQuantity: 3
            },
            {
              type: RewardEnum.SEED,
              minQuantity: 1,
              maxQuantity: 3
            },
            {
              type: RewardEnum.FARM_ITEM,
              minQuantity: 1,
              maxQuantity: 3
            }
          ]
        },
        {
          id: '11',
          type: TaskTypeEnum.WEEK,
          description: `Nhắn tin tại channel`,
          action: ActionEnum.MESSAGE,
          placeChannel: '1142667605761605753',
          minCompletionCriteria: 1000,
          maxCompletionCriteria: 3000,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 1000,
              maxQuantity: 3000
            },
            {
              type: RewardEnum.GOLD_TICKET,
              minQuantity: 7,
              maxQuantity: 15
            },
            {
              type: RewardEnum.GIFT,
              minQuantity: 2,
              maxQuantity: 3
            },
            {
              type: RewardEnum.SEED,
              minQuantity: 1,
              maxQuantity: 3
            },
            {
              type: RewardEnum.FARM_ITEM,
              minQuantity: 1,
              maxQuantity: 3
            }
          ]
        },
        {
          id: '12',
          type: TaskTypeEnum.WEEK,
          description: `Đăng bài tại channel feeds`,
          action: ActionEnum.POST_BLOG,
          placeChannel: '1164592748758839306',
          minCompletionCriteria: 5,
          maxCompletionCriteria: 10,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 1000,
              maxQuantity: 3000
            },
            {
              type: RewardEnum.GOLD_TICKET,
              minQuantity: 7,
              maxQuantity: 15
            },
            {
              type: RewardEnum.GIFT,
              minQuantity: 2,
              maxQuantity: 3
            },
            {
              type: RewardEnum.SEED,
              minQuantity: 1,
              maxQuantity: 3
            },
            {
              type: RewardEnum.FARM_ITEM,
              minQuantity: 1,
              maxQuantity: 3
            }
          ]
        },
        {
          id: '13',
          type: TaskTypeEnum.WEEK,
          description: `Bình luận bài post`,
          action: ActionEnum.REPLY_POST_BLOG,
          placeChannel: '1164592748758839306',
          minCompletionCriteria: 80,
          maxCompletionCriteria: 170,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 1000,
              maxQuantity: 3000
            },
            {
              type: RewardEnum.GOLD_TICKET,
              minQuantity: 7,
              maxQuantity: 15
            },
            {
              type: RewardEnum.GIFT,
              minQuantity: 2,
              maxQuantity: 3
            },
            {
              type: RewardEnum.SEED,
              minQuantity: 1,
              maxQuantity: 3
            },
            {
              type: RewardEnum.FARM_ITEM,
              minQuantity: 1,
              maxQuantity: 3
            }
          ]
        },
        {
          id: '14',
          type: TaskTypeEnum.WEEK,
          description: `Đăng bài tại channel confession`,
          action: ActionEnum.POST_CONFESSION,
          placeChannel: '1158851593802887229',
          minCompletionCriteria: 5,
          maxCompletionCriteria: 10,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 1000,
              maxQuantity: 3000
            },
            {
              type: RewardEnum.GOLD_TICKET,
              minQuantity: 7,
              maxQuantity: 15
            },
            {
              type: RewardEnum.GIFT,
              minQuantity: 2,
              maxQuantity: 3
            },
            {
              type: RewardEnum.SEED,
              minQuantity: 1,
              maxQuantity: 3
            },
            {
              type: RewardEnum.FARM_ITEM,
              minQuantity: 1,
              maxQuantity: 3
            }
          ]
        },
        {
          id: '15',
          type: TaskTypeEnum.WEEK,
          description: `Trả lời confession`,
          action: ActionEnum.REPLY_CONFESSION,
          placeChannel: '1158851593802887229',
          minCompletionCriteria: 80,
          maxCompletionCriteria: 170,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 1000,
              maxQuantity: 3000
            },
            {
              type: RewardEnum.GOLD_TICKET,
              minQuantity: 7,
              maxQuantity: 15
            },
            {
              type: RewardEnum.GIFT,
              minQuantity: 2,
              maxQuantity: 3
            },
            {
              type: RewardEnum.SEED,
              minQuantity: 1,
              maxQuantity: 3
            },
            {
              type: RewardEnum.FARM_ITEM,
              minQuantity: 1,
              maxQuantity: 3
            }
          ]
        },
        {
          id: '16',
          type: TaskTypeEnum.WEEK,
          description: `Tặng quà cho một người bất kỳ`,
          action: ActionEnum.GIFT,
          placeChannel: '',
          minCompletionCriteria: 3,
          maxCompletionCriteria: 5,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 1000,
              maxQuantity: 6000
            },
            {
              type: RewardEnum.GOLD_TICKET,
              minQuantity: 7,
              maxQuantity: 15
            },
            {
              type: RewardEnum.GIFT,
              minQuantity: 2,
              maxQuantity: 3
            },
            {
              type: RewardEnum.SEED,
              minQuantity: 1,
              maxQuantity: 3
            },
            {
              type: RewardEnum.FARM_ITEM,
              minQuantity: 1,
              maxQuantity: 3
            }
          ]
        },
        {
          id: '17',
          type: TaskTypeEnum.WEEK,
          description: `Treo voice`,
          action: ActionEnum.VOICE,
          placeChannel: '',
          minCompletionCriteria: 36,
          maxCompletionCriteria: 72,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 1000,
              maxQuantity: 3000
            },
            {
              type: RewardEnum.GOLD_TICKET,
              minQuantity: 7,
              maxQuantity: 15
            },
            {
              type: RewardEnum.GIFT,
              minQuantity: 2,
              maxQuantity: 3
            },
            {
              type: RewardEnum.SEED,
              minQuantity: 1,
              maxQuantity: 3
            },
            {
              type: RewardEnum.FARM_ITEM,
              minQuantity: 1,
              maxQuantity: 3
            }
          ]
        },
        {
          id: '19',
          type: TaskTypeEnum.WEEK,
          description: `Trồng cây`,
          action: ActionEnum.FARM,
          placeChannel: '',
          minCompletionCriteria: 20,
          maxCompletionCriteria: 40,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 1000,
              maxQuantity: 3000
            },
            {
              type: RewardEnum.SEED,
              minQuantity: 1,
              maxQuantity: 1
            },
            {
              type: RewardEnum.FARM_ITEM,
              minQuantity: 1,
              maxQuantity: 1
            }
          ]
        },
      ];

      await questModel.insertMany(defaultQuest);
      console.log('Default quests inserted successfully.');

    }

    // const users = await userModel.find();
    // users.forEach(user => {
    //   if (!user.maxFriend) {
    //     user.maxFriend = 5;
    //     UserService.updateUser(user);
    //   }
    // })


    // required: add relationship to friends
    // const friends = await friendModel.find();
    // const getRelationShip = await FriendService.getAllRelationship();
    // const friendRelationship = getRelationShip.find(item => item.name === relationshipType.friend);
    // for (const friend of friends) {
    //   if (!friend.relationship) {
    //     await FriendService.updateFriendRelationship(friend.discordIdFirst, friend.discordIdLast, friendRelationship);
    //   }
    // }
    // console.log('updated relationship');

    // thêm reset quest vào shop quest trước sau đó chạy cái này
    // const marryRing = 
    //   {
    //     name: 'Nhẫn kết hôn',
    //     type: specialItemType.WEEDING_RING,
    //     emoji: '<:wedding_ring:1175357600708186112>',
    //     description: 'nhận thêm 10% vé xanh khi điểm danh hằng ngày',
    //     buffInfo: {
    //       typeBuff: RewardEnum.SILVER_TICKET,
    //       valueBuff: 10,
    //     },
    //     typeBuff: typeBuffSpecial.DAILY_BUFF,
    //     id: 2
    //   };
  
    // await specialItemModel.insertMany(marryRing);
    // console.log('Default special item inserted successfully.');
    
    // const existingTreasure = await treasureBoxModel.find();
    // if (existingTreasure.length === 0) {
    //   const friendRing = {
    //     name: 'Nhẫn tình bạn',
    //     type: specialItemType.FRIEND_RING,
    //     emoji: '<:friend_ring:1175357596861988895>',
    //     description: 'nhận thêm 5% vé xanh khi điểm danh hằng ngày',
    //     buffInfo: {
    //       typeBuff: RewardEnum.SILVER_TICKET,
    //       valueBuff: 5,
    //     },
    //     typeBuff: typeBuffSpecial.DAILY_BUFF,
    //     id: 3
    //   };
    //   const friendRingData = await specialItemModel.insertMany(friendRing);

    //   const scroll = {
    //     name: 'Bản chế tạo nhẫn',
    //     type: specialItemType.RING_PIECE,
    //     emoji: '<:scroll_wedding:1175357593963741225>',
    //     description: 'Vật phẩm sử dụng chế tạo nhẫn kết hôn',
    //     weedingPiece: {
    //       value: 1
    //     },
    //     id: 4
    //   };
    //   const scrollData = await specialItemModel.insertMany(scroll);

    //   const resource = {
    //     name: 'Nguyên liệu chế tạo nhẫn',
    //     type: specialItemType.RING_PIECE,
    //     emoji: '<:resource:1175357590486650900>',
    //     description: 'Vật phẩm sử dụng để chế tạo kết hôn',
    //     weedingPiece: {
    //       value: 2
    //     },
    //     id: 5
    //   };
    //   const resourceData = await specialItemModel.insertMany(resource);

    //   const trueSureBox = [
    //     {
    //       name: 'Rương tình bạn',
    //       description: 'Rương chứa quà tặng, role tình bạn, nhẫn tình bạn.',
    //       emoji: '<a:friendtreasure:1175353021635498116>',
    //       isRandomSpecialItem: true,
    //       items: [
    //         {
    //           itemType: TreasureItemType.gift,
    //           giftQuantity: 3
    //         },
    //         {
    //           itemType: TreasureItemType.specialItem,
    //           specialItems: [
    //             ...friendRingData
    //           ]
    //         },
    //         {
    //           itemType: TreasureItemType.role,
    //           roleInfo: {
    //             name: 'Tình Bạn',
    //             roleId: '1175865556235194418',
    //             description: 'nhận thêm 8% vé xanh khi điểm danh hằng ngày',
    //             typeBuff: 'silver_ticket',
    //             valueBuff: 8,
    //             id: 26
    //           }
    //         }
    //       ],
    //       type: intimacyShopType.treasureBox,
    //       id: 1
    //     },
    //     {
    //       name: 'Rương kết hôn',
    //       description: 'Rương chứa nguyên liệu chế tạo nhẫn kết hôn, quà tặng',
    //       emoji: '<a:weddingreasure:1175353026555416586>',
    //       type: intimacyShopType.treasureBox,
    //       items: [
    //         {
    //           itemType: TreasureItemType.gift,
    //           giftQuantity: 3
    //         },
    //         {
    //           itemType: TreasureItemType.specialItem,
    //           specialItems: [
    //             ...scrollData,
    //             ...resourceData
    //           ]
    //         }
    //       ],
    //       id: 2
    //     }
    //   ]
    //   const treasureBoxes = await treasureBoxModel.insertMany(trueSureBox);
    //   console.log('Default treasure box inserted successfully.');

    //   const certificate = {
    //     name: 'Giấy chứng nhận kết hôn',
    //     type: specialItemType.CERTIFICATE,
    //     emoji: '<:certificate:1175398855672598608>',
    //     description: 'Giấy chứng nhận kết hôn',
    //     id: 6
    //   };
    //   const certificateData = await specialItemModel.insertMany(certificate);

    //   const imShop = [
    //     {
    //       id: 1,
    //       type: intimacyShopType.specialItem,
    //       intimacyPrice: 50,
    //       silverTicket: 3000,
    //       specialInfo: certificateData[0]
    //     },
    //   ];
    //   treasureBoxes.forEach((treasure, index) => {
    //     imShop.push({
    //       id: index + 2,
    //       type: intimacyShopType.treasureBox,
    //       intimacyPrice: 300,
    //       silverTicket: 20000,
    //       treasureBoxInfo: treasure
    //     })
    //   });
    //   await intimacyShopModel.insertMany(imShop);
    //   console.log('Default im shop inserted successfully.');
    // }

    // const data = await userModel.find(); 
    // for(const user of data) {
    //   if (user.tickets.silver > 1) {
    //     user.tickets.silver += 4000;
    //     await UserService.updateUser(user);
    //     console.log('Updated', user.username, user.tickets.silver)
    //   }
    // }
    
  } catch (error) {
    console.log('Database initialization error:', error);
  } finally {
    mongoose.connection.close();
  }
};

initializeDatabase();