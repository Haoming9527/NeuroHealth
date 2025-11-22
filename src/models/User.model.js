const prisma = require('./prismaClient');

const sanitizeUser = (user) => {
  if (!user) {
    return null;
  }
  const { password, ...safeUser } = user;
  return safeUser;
};

module.exports.sanitizeUser = sanitizeUser;

module.exports.createUser = async function createUser(data) {
  const user = await prisma.user.create({ data });
  return sanitizeUser(user);
};

module.exports.getAllUsers = async function getAllUsers() {
  const users = await prisma.user.findMany();
  return users.map(sanitizeUser);
};

module.exports.updateUser = async function updateUser(id, data) {
  const user = await prisma.user.update({
    where: { id },
    data,
  });
  return sanitizeUser(user);
};

module.exports.deleteUser = async function deleteUser(id) {
  const user = await prisma.user.delete({
    where: { id },
  });
  return sanitizeUser(user);
};

module.exports.findUserByEmail = function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  });
};

module.exports.findUserById = function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
  });
};

