const { roleModel } = require("../models/role.model");

class RoleService {

  static async addRole(body) {
    try {
      const newItemModel = new roleModel(body);
      const maxId = await roleModel.findOne().sort({ id: -1 }).select('id').lean();
      newItemModel.id = maxId ? maxId.id + 1 : 1;
      const newItem = await newItemModel.save();
      return newItem;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  static async removeRole(id) {
    try {
      const conditions = { id };
      const removed = await roleModel.deleteMany(conditions);
      return removed;
    } catch (error) {
      console.log(error);      
    }
  }

  static async getAllRole() {
    try {
      const roles = await roleModel.find({});
      return roles;
    } catch (error) {
        console.log(error.message);
    }
  }
}

module.exports = { RoleService };
