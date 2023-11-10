const mongoose = require('mongoose');
const { levelModel } = require('./models/level.model');
const { questModel, TaskTypeEnum, RewardEnum, ActionEnum } = require('./models/quest.model');
require('dotenv/config');

const initializeDatabase = async () => {
  try {
    await mongoose.connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const existingLevels = await levelModel.find();

    if (existingLevels.length === 0) {
      const defaultLevels = [
        {
          id: "1",
          value: 1,
          limitTicketDaily: 2000,
          limitQuestQuantity: 3,
          priceUpgrade: 0
        },
        {
          id: "2",
          value: 2,
          limitTicketDaily: 3000,
          limitQuestQuantity: 3,
          priceUpgrade: 10000
        },
        {
          id: "3",
          value: 3,
          limitTicketDaily: 4000,
          limitQuestQuantity: 4,
          priceUpgrade: 25000
        },
        {
          id: "4",
          value: 4,
          limitTicketDaily: 5000,
          limitQuestQuantity: 4,
          priceUpgrade: 45000
        },
        {
          id: "5",
          value: 5,
          limitTicketDaily: 6000,
          limitQuestQuantity: 5,
          priceUpgrade: 65000
        },
        {
          id: "6",
          value: 6,
          limitTicketDaily: 8000,
          limitQuestQuantity: 5,
          priceUpgrade: 85000
        },
        {
          id: "7",
          value: 7,
          limitTicketDaily: 10000,
          limitQuestQuantity: 6,
          priceUpgrade: 105000
        }
      ];

      await levelModel.insertMany(defaultLevels);
      console.log('Default level inserted successfully.');
    }

    const existingQuest = await questModel.find();

    if (existingQuest.length === 0) {
      const defaultQuest = [
        {
          id: '1',
          type: TaskTypeEnum.DAILY,
          description: `Nhắn tin bất kỳ channel`,
          action: ActionEnum.MESSAGE,
          placeChannel: '',
          minCompletionCriteria: 50,
          maxCompletionCriteria: 300,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 200,
              maxQuantity: 600
            }
          ]
        },
        { 
          id: '2',
          type: TaskTypeEnum.DAILY,
          description: `Nhắn tin tại channel`,
          action: ActionEnum.MESSAGE,
          placeChannel: '1142667605761605753',
          minCompletionCriteria: 50,
          maxCompletionCriteria: 200,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 200,
              maxQuantity: 600
            }
          ]
        },
        {
          id: '3',
          type: TaskTypeEnum.DAILY,
          description: `Đăng bài tại channel feeds`,
          action: ActionEnum.POST_BLOG,
          placeChannel: '1164592748758839306',
          minCompletionCriteria: 1,
          maxCompletionCriteria: 2,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 200,
              maxQuantity: 600
            }
          ]
        },
        {
          id: '4',
          type: TaskTypeEnum.DAILY,
          description: ` Bình luận bài post`,
          action: ActionEnum.REPLY_POST_BLOG,
          placeChannel: '1164592748758839306',
          minCompletionCriteria: 1,
          maxCompletionCriteria: 5,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 200,
              maxQuantity: 600
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
          maxCompletionCriteria: 1,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 200,
              maxQuantity: 600
            }
          ]
        },
        {
          id: '6',
          type: TaskTypeEnum.DAILY,
          description: `Trả lời confession`,
          action: ActionEnum.REPLY_CONFESSION,
          placeChannel: '1158851593802887229',
          minCompletionCriteria: 1,
          maxCompletionCriteria: 5,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 200,
              maxQuantity: 600
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
          maxCompletionCriteria: 1,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 200,
              maxQuantity: 800
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
            }
          ]
        },
        {
          id: '9',
          type: TaskTypeEnum.DAILY,
          description: `Treo voice`,
          action: ActionEnum.VOICE,
          placeChannel: '',
          minCompletionCriteria: 1,
          maxCompletionCriteria: 6,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 200,
              maxQuantity: 600
            }
          ]
        },
        // {
        //   id: '18',
        //   type: TaskTypeEnum.DAILY,
        //   description: `Nộp vật phẩm`,
        //   action: ActionEnum.SUBMIT_ITEM,
        //   placeChannel: '<:leu_cucvang:1158501014677237842>',
        //   minCompletionCriteria: 1,
        //   maxCompletionCriteria: 1,
        //   rewards: [
        //     {
        //       type: RewardEnum.SILVER_TICKET,
        //       minQuantity: 600,
        //       maxQuantity: 800
        //     }
        //   ]
        // },
        // {
        //   id: '19',
        //   type: TaskTypeEnum.DAILY,
        //   description: `Nộp vật phẩm`,
        //   action: ActionEnum.SUBMIT_ITEM,
        //   placeChannel: '<:leu_cucdong:1158504781715877938>',
        //   minCompletionCriteria: 1,
        //   maxCompletionCriteria: 1,
        //   rewards: [
        //     {
        //       type: RewardEnum.SILVER_TICKET,
        //       minQuantity: 600,
        //       maxQuantity: 800
        //     }
        //   ]
        // },
        // {
        //   id: '20',
        //   type: TaskTypeEnum.DAILY,
        //   description: `Nộp vật phẩm`,
        //   action: ActionEnum.SUBMIT_ITEM,
        //   placeChannel: '<:leu_moonglowcrystali:1158503610624245771>',
        //   minCompletionCriteria: 1,
        //   maxCompletionCriteria: 1,
        //   rewards: [
        //     {
        //       type: RewardEnum.SILVER_TICKET,
        //       minQuantity: 600,
        //       maxQuantity: 800
        //     }
        //   ]
        // },
        // {
        //   id: '21',
        //   type: TaskTypeEnum.DAILY,
        //   description: `Nộp vật phẩm`,
        //   action: ActionEnum.SUBMIT_ITEM,
        //   placeChannel: '<:leu_thit:1158523217078661190>',
        //   minCompletionCriteria: 1,
        //   maxCompletionCriteria: 1,
        //   rewards: [
        //     {
        //       type: RewardEnum.SILVER_TICKET,
        //       minQuantity: 600,
        //       maxQuantity: 800
        //     }
        //   ]
        // },
        // {
        //   id: '22',
        //   type: TaskTypeEnum.DAILY,
        //   description: `Nộp vật phẩm`,
        //   action: ActionEnum.SUBMIT_ITEM,
        //   placeChannel: '<:leu_sua:1158509559065890826>',
        //   minCompletionCriteria: 1,
        //   maxCompletionCriteria: 1,
        //   rewards: [
        //     {
        //       type: RewardEnum.SILVER_TICKET,
        //       minQuantity: 600,
        //       maxQuantity: 800
        //     }
        //   ]
        // },
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
              minQuantity: 50,
              maxQuantity: 200
            },
            {
              type: RewardEnum.GIFT,
              minQuantity: 2,
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
              minQuantity: 50,
              maxQuantity: 200
            },
            {
              type: RewardEnum.GIFT,
              minQuantity: 2,
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
              minQuantity: 50,
              maxQuantity: 200
            },
            {
              type: RewardEnum.GIFT,
              minQuantity: 2,
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
              minQuantity: 50,
              maxQuantity: 200
            },
            {
              type: RewardEnum.GIFT,
              minQuantity: 2,
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
              minQuantity: 50,
              maxQuantity: 200
            },
            {
              type: RewardEnum.GIFT,
              minQuantity: 2,
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
              minQuantity: 50,
              maxQuantity: 200
            },
            {
              type: RewardEnum.GIFT,
              minQuantity: 2,
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
              minQuantity: 50,
              maxQuantity: 200
            },
            {
              type: RewardEnum.GIFT,
              minQuantity: 2,
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
          minCompletionCriteria: 10,
          maxCompletionCriteria: 30,
          rewards: [
            {
              type: RewardEnum.SILVER_TICKET,
              minQuantity: 1000,
              maxQuantity: 3000
            },
            {
              type: RewardEnum.GOLD_TICKET,
              minQuantity: 50,
              maxQuantity: 200
            },
            {
              type: RewardEnum.GIFT,
              minQuantity: 2,
              maxQuantity: 3
            }
          ]
        }
      ];

      await questModel.insertMany(defaultQuest);
      console.log('Default quests inserted successfully.');

    }
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    mongoose.connection.close();
  }
};

initializeDatabase();