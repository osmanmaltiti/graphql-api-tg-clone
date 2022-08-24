import { renameSync } from 'fs';
import path from 'path';
import { v4 } from 'uuid';
import { prisma } from '../index';

export class UserAPI {
  async createUser(userdata: any) {
    try {
      const newUser = await prisma.user.create({
        data: {
          id: v4(),
          fullname: userdata.fullname,
          number: userdata.number,
          password: userdata.password,
          profile: userdata.profile,
        },
      });

      return await this.updateProfile(newUser);
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(userdata: any) {
    renameSync(
      path.resolve(__dirname, `../../public/profile/${userdata.profile}`),
      path.resolve(__dirname, `../../public/profile/profile-${userdata.id}`)
    );

    try {
      const user = await prisma.user.update({
        where: {
          id: userdata.id,
        },
        data: {
          profile: `profile-${userdata.id}`,
        },
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  async loginUser(data: any) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          number: data.number,
        },
      });

      if (!user) return null;

      if (user.password !== data.password) return null;

      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUser(id: string) {
    try {
      return await prisma.user.findUnique({
        where: {
          id,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getUsers() {
    try {
      return await prisma.user.findMany();
    } catch (error) {
      throw error;
    }
  }
}

export default new UserAPI();
