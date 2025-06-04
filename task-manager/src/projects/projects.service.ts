import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(@InjectModel(Project.name) private projectModel: Model<ProjectDocument>) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const createdProject = new this.projectModel(createProjectDto);
    return createdProject.save();
  }

  async findAll(): Promise<Project[]> {
    return this.projectModel.find({ isActive: true }).populate('workspaceId leadUserId').exec();
  }

  async findByWorkspace(workspaceId: string): Promise<Project[]> {
    return this.projectModel
      .find({ workspaceId: new Types.ObjectId(workspaceId), isActive: true })
      .populate('workspaceId leadUserId')
      .exec();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectModel.findById(id).populate('workspaceId leadUserId').exec();

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.projectModel
      .findByIdAndUpdate(id, updateProjectDto, { new: true })
      .populate('workspaceId leadUserId')
      .exec();

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async remove(id: string): Promise<Project> {
    const project = await this.projectModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }
}
