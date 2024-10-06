import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  createUser(createUserDto: CreateUserDto) {
    return this.userRepository.save(createUserDto);
  }

  findAllUsers() {
    return `This action returns all user`;
  }

  findUserById(id: number) {
    return `This action returns a #${id} user`;
  }

  updateUserById(id: number, updateUserDto: UpdateUserDto) {
    const updateUser = this.userRepository.create(updateUserDto);
    return this.userRepository.update(id, updateUser);
  }

  removeUserById(id: number) {
    return this.userRepository.delete(id);
  }
}
