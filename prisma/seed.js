const prisma = require('../src/models/prismaClient');

// Seed Users
const users = [
  { 
    username: 'alice', 
    password: 'hashed_password_123', 
    email: 'alice@example.com', 
    age: 25, 
    height: 165.0, 
    weight: 60.0, 
    BMI: 22.0 
  },
  { 
    username: 'bob', 
    password: 'hashed_password_456', 
    email: 'bob@example.com', 
    age: 30, 
    height: 180.0, 
    weight: 75.0, 
    BMI: 23.1 
  },
  { 
    username: 'carol', 
    password: 'hashed_password_789', 
    email: 'carol@example.com', 
    age: 28, 
    height: 170.0, 
    weight: 65.0, 
    BMI: 22.5 
  },
  { 
    username: 'dave', 
    password: 'hashed_password_abc', 
    email: 'dave@example.com', 
    age: 35, 
    height: 175.0, 
    weight: 80.0, 
    BMI: 26.1 
  },
  { 
    username: 'eve', 
    password: 'hashed_password_def', 
    email: 'eve@example.com', 
    age: 22, 
    height: 160.0, 
    weight: 55.0, 
    BMI: 21.5 
  },
];

async function main() {

  // Create Users
  const insertedUsers = await prisma.user.createManyAndReturn({
    data: users,
  });
  console.log(`Created ${insertedUsers.length} users`);

  // Create Goals for some users
  const goals = [
    {
      userId: insertedUsers[0].id,
      goalWeight: 58.0,
      goalBMI: 21.3,
      goalDescription: 'Lose 2kg and maintain healthy BMI',
    },
    {
      userId: insertedUsers[1].id,
      goalWeight: 72.0,
      goalBMI: 22.2,
      goalDescription: 'Build muscle and reduce body fat',
    },
    {
      userId: insertedUsers[3].id,
      goalWeight: 75.0,
      goalBMI: 24.5,
      goalDescription: 'Lose weight and improve overall health',
    },
  ];

  const insertedGoals = await prisma.goal.createManyAndReturn({
    data: goals,
  });
  console.log(`Created ${insertedGoals.length} goals`);

  // Create Calorie entries
  const calories = [
    {
      userId: insertedUsers[0].id,
      userFoodIntake: 'Grilled chicken breast, brown rice, steamed vegetables',
      aiEstimateCalories: 450,
    },
    {
      userId: insertedUsers[0].id,
      userFoodIntake: 'Oatmeal with berries and Greek yogurt',
      aiEstimateCalories: 320,
    },
    {
      userId: insertedUsers[1].id,
      userFoodIntake: 'Salmon fillet, quinoa, mixed salad',
      aiEstimateCalories: 520,
    },
    {
      userId: insertedUsers[2].id,
      userFoodIntake: 'Whole grain pasta with marinara sauce',
      aiEstimateCalories: 380,
    },
    {
      userId: insertedUsers[3].id,
      userFoodIntake: 'Grilled vegetables and tofu stir-fry',
      aiEstimateCalories: 290,
    },
  ];

  const insertedCalories = await prisma.calorie.createManyAndReturn({
    data: calories,
  });
  console.log(`Created ${insertedCalories.length} calorie entries`);

  // Create Conversations
  const conversations = [
    {
      userId: insertedUsers[0].id,
      title: 'Nutrition Advice',
    },
    {
      userId: insertedUsers[0].id,
      title: 'Workout Plan Discussion',
    },
    {
      userId: insertedUsers[1].id,
      title: 'Weight Loss Journey',
    },
    {
      userId: insertedUsers[2].id,
      title: 'Healthy Meal Ideas',
    },
  ];

  const insertedConversations = await prisma.conversation.createManyAndReturn({
    data: conversations,
  });
  console.log(`Created ${insertedConversations.length} conversations`);

  // Create Conversation Details
  const conversationDetails = [
    {
      conversationId: insertedConversations[0].id,
      userMessage: 'What are some healthy breakfast options?',
      aiMessage: 'Great question! Some healthy breakfast options include oatmeal with fruits, Greek yogurt with berries, whole grain toast with avocado, or scrambled eggs with vegetables.',
    },
    {
      conversationId: insertedConversations[0].id,
      userMessage: 'How many calories should I aim for per meal?',
      aiMessage: 'It depends on your goals and daily caloric needs. Generally, a balanced meal ranges from 400-600 calories. For weight loss, aim for a slight caloric deficit, and for maintenance, match your daily energy expenditure.',
    },
    {
      conversationId: insertedConversations[1].id,
      userMessage: 'What is a good workout routine for beginners?',
      aiMessage: 'For beginners, I recommend starting with 3-4 days per week. Focus on full-body workouts including cardio (20-30 min) and strength training (30-40 min). Start with lighter weights and gradually increase intensity.',
    },
    {
      conversationId: insertedConversations[2].id,
      userMessage: 'How can I track my progress effectively?',
      aiMessage: 'Track your progress by monitoring your weight weekly, taking body measurements, keeping a food diary, and noting how your clothes fit. Remember, progress isn\'t just about the scale - energy levels and strength improvements matter too!',
    },
    {
      conversationId: insertedConversations[3].id,
      userMessage: 'Can you suggest some low-calorie meal ideas?',
      aiMessage: 'Absolutely! Some low-calorie meal ideas include: vegetable stir-fry with lean protein, grilled chicken salad, zucchini noodles with marinara sauce, or a smoothie bowl with fresh fruits and low-fat yogurt.',
    },
  ];

  const insertedConversationDetails = await prisma.conversationDetail.createManyAndReturn({
    data: conversationDetails,
  });
  console.log(`Created ${insertedConversationDetails.length} conversation details`);

  console.log('Seed data inserted successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
