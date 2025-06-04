import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Board, BoardDocument } from './schemas/board.schema';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
  constructor(@InjectModel(Board.name) private boardModel: Model<BoardDocument>) {}

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    const createdBoard = new this.boardModel(createBoardDto);
    return createdBoard.save();
  }

  async findAll(): Promise<Board[]> {
    return this.boardModel.find({ isActive: true }).populate('projectId').sort({ orderIndex: 1 }).exec();
  }

  async findByProject(projectId: string): Promise<Board[]> {
    return this.boardModel
      .find({ projectId: new Types.ObjectId(projectId), isActive: true })
      .sort({ orderIndex: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Board> {
    const board = await this.boardModel.findById(id).populate('projectId').exec();

    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }

    return board;
  }

  async update(id: string, updateBoardDto: UpdateBoardDto): Promise<Board> {
    const board = await this.boardModel
      .findByIdAndUpdate(id, updateBoardDto, { new: true })
      .populate('projectId')
      .exec();

    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }

    return board;
  }

  async remove(id: string): Promise<Board> {
    const board = await this.boardModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();

    if (!board) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }

    return board;
  }
}
