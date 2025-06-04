import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { List, ListDocument } from './schemas/list.schema';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';

@Injectable()
export class ListsService {
  constructor(@InjectModel(List.name) private listModel: Model<ListDocument>) {}

  async create(createListDto: CreateListDto): Promise<List> {
    const createdList = new this.listModel(createListDto);
    return createdList.save();
  }

  async findAll(): Promise<List[]> {
    return this.listModel.find({ isActive: true }).populate('boardId').sort({ orderIndex: 1 }).exec();
  }

  async findByBoard(boardId: string): Promise<List[]> {
    return this.listModel
      .find({ boardId: new Types.ObjectId(boardId), isActive: true })
      .sort({ orderIndex: 1 })
      .exec();
  }

  async findOne(id: string): Promise<List> {
    const list = await this.listModel.findById(id).populate('boardId').exec();

    if (!list) {
      throw new NotFoundException(`List with ID ${id} not found`);
    }

    return list;
  }

  async update(id: string, updateListDto: UpdateListDto): Promise<List> {
    const list = await this.listModel.findByIdAndUpdate(id, updateListDto, { new: true }).populate('boardId').exec();

    if (!list) {
      throw new NotFoundException(`List with ID ${id} not found`);
    }

    return list;
  }

  async remove(id: string): Promise<List> {
    const list = await this.listModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();

    if (!list) {
      throw new NotFoundException(`List with ID ${id} not found`);
    }

    return list;
  }
}
