import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Label, LabelDocument } from './schemas/label.schema';
import { CreateLabelDto } from './dto/create-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';

@Injectable()
export class LabelsService {
  constructor(@InjectModel(Label.name) private labelModel: Model<LabelDocument>) {}

  async create(createLabelDto: CreateLabelDto): Promise<Label> {
    const createdLabel = new this.labelModel(createLabelDto);
    return createdLabel.save();
  }

  async findAll(): Promise<Label[]> {
    return this.labelModel.find({ isActive: true }).populate('projectId').exec();
  }

  async findByProject(projectId: string): Promise<Label[]> {
    return this.labelModel.find({ projectId: new Types.ObjectId(projectId), isActive: true }).exec();
  }

  async findOne(id: string): Promise<Label> {
    const label = await this.labelModel.findById(id).populate('projectId').exec();

    if (!label) {
      throw new NotFoundException(`Label with ID ${id} not found`);
    }

    return label;
  }

  async update(id: string, updateLabelDto: UpdateLabelDto): Promise<Label> {
    const label = await this.labelModel
      .findByIdAndUpdate(id, updateLabelDto, { new: true })
      .populate('projectId')
      .exec();

    if (!label) {
      throw new NotFoundException(`Label with ID ${id} not found`);
    }

    return label;
  }

  async remove(id: string): Promise<Label> {
    const label = await this.labelModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();

    if (!label) {
      throw new NotFoundException(`Label with ID ${id} not found`);
    }

    return label;
  }
}
