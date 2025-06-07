import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    const savedUser = await user.save();
    const result = await this.userModel.findById(savedUser._id, '-password').exec();
    if (!result) {
      throw new NotFoundException('사용자 생성 후 조회에 실패했습니다.');
    }
    return result;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find({ isActive: true }, '-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id, '-password').exec();
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    return user;
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByUsernameOrEmail(identifier: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({
        $or: [{ username: identifier }, { email: identifier }],
        isActive: true,
      })
      .exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: updateUserDto },
      { new: true, select: '-password' },
    );

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    const result = await this.userModel.findByIdAndUpdate(id, {
      password: hashedPassword,
    });

    if (!result) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
  }

  async remove(id: string): Promise<User> {
    // 소프트 삭제 (isActive를 false로 변경)
    const user = await this.userModel.findByIdAndUpdate(id, { isActive: false }, { new: true, select: '-password' });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user;
  }

  async searchUsers(query: string): Promise<User[]> {
    return this.userModel
      .find(
        {
          $and: [
            { isActive: true },
            {
              $or: [
                { username: { $regex: query, $options: 'i' } },
                { fullName: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
              ],
            },
          ],
        },
        '-password',
      )
      .limit(10)
      .exec();
  }

  async checkUserExists(username: string, email: string): Promise<boolean> {
    const existingUser = await this.userModel.findOne({
      $or: [{ username }, { email }],
    });
    return !!existingUser;
  }
}
