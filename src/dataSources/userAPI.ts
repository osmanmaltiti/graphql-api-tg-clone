import { v4 } from 'uuid';
import { prisma } from '../index';

export class UserAPI {
  async createUser(userdata: any) {
    try {
      return await prisma.user.create({
        data: {
          id: v4(),
          fullname: userdata.fullname,
          number: userdata.number,
          password: userdata.password,
          profile: userdata.profile,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getUsers() {
    try {
      return await prisma.user.findMany();
    } catch (error) {
      console.log(error);
    }
  }
}

export default new UserAPI();
