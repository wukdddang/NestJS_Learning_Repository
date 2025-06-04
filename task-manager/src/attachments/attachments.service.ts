import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attachment, AttachmentDocument } from './schemas/attachment.schema';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AttachmentsService {
  constructor(@InjectModel(Attachment.name) private attachmentModel: Model<AttachmentDocument>) {}

  async uploadFile(file: Express.Multer.File, taskId: string, uploadedBy: string): Promise<Attachment> {
    if (!file) {
      throw new BadRequestException('파일이 선택되지 않았습니다.');
    }

    // 파일 크기 제한 (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('파일 크기는 10MB를 초과할 수 없습니다.');
    }

    // 허용된 파일 타입 확인
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
      'application/x-rar-compressed',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('지원하지 않는 파일 형식입니다.');
    }

    // 업로드 폴더 생성
    const uploadDir = path.join(process.cwd(), 'uploads', 'attachments');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 고유한 파일명 생성
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = path.extname(file.originalname);
    const fileName = `${timestamp}_${randomString}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // 파일 저장
    fs.writeFileSync(filePath, file.buffer);

    const createAttachmentDto: CreateAttachmentDto = {
      taskId: new Types.ObjectId(taskId),
      uploadedBy: new Types.ObjectId(uploadedBy),
      fileName: fileName,
      originalName: file.originalname,
      fileUrl: `/uploads/attachments/${fileName}`,
      fileSize: file.size,
      mimeType: file.mimetype,
    };

    const attachment = new this.attachmentModel(createAttachmentDto);
    return attachment.save();
  }

  async create(createAttachmentDto: CreateAttachmentDto): Promise<Attachment> {
    const attachment = new this.attachmentModel(createAttachmentDto);
    return attachment.save();
  }

  async findAll(): Promise<Attachment[]> {
    return this.attachmentModel.find({ isActive: true }).populate('taskId uploadedBy').sort({ createdAt: -1 }).exec();
  }

  async findByTask(taskId: string): Promise<Attachment[]> {
    return this.attachmentModel
      .find({ taskId: new Types.ObjectId(taskId), isActive: true })
      .populate('uploadedBy', 'username email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Attachment> {
    const attachment = await this.attachmentModel.findById(id).populate('taskId uploadedBy').exec();

    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    return attachment;
  }

  async update(id: string, updateAttachmentDto: UpdateAttachmentDto): Promise<Attachment> {
    const attachment = await this.attachmentModel
      .findByIdAndUpdate(id, updateAttachmentDto, { new: true })
      .populate('taskId uploadedBy')
      .exec();

    if (!attachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    return attachment;
  }

  async remove(id: string, userId: string): Promise<Attachment> {
    const attachment = await this.findOne(id);

    // 업로드한 사용자만 삭제할 수 있도록 권한 확인
    if (attachment.uploadedBy.toString() !== userId) {
      throw new BadRequestException('파일을 삭제할 권한이 없습니다.');
    }

    // 실제 파일 삭제
    const filePath = path.join(process.cwd(), 'uploads', 'attachments', attachment.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const deletedAttachment = await this.attachmentModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();

    if (!deletedAttachment) {
      throw new NotFoundException(`Attachment with ID ${id} not found`);
    }

    return deletedAttachment;
  }

  async getFileStats(taskId?: string): Promise<any> {
    const query = taskId ? { taskId: new Types.ObjectId(taskId), isActive: true } : { isActive: true };

    const stats = await this.attachmentModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: '$fileSize' },
          avgSize: { $avg: '$fileSize' },
          fileTypes: { $addToSet: '$mimeType' },
        },
      },
    ]);

    return (
      stats[0] || {
        totalFiles: 0,
        totalSize: 0,
        avgSize: 0,
        fileTypes: [],
      }
    );
  }

  async downloadFile(id: string): Promise<{ filePath: string; originalName: string }> {
    const attachment = await this.findOne(id);
    const filePath = path.join(process.cwd(), 'uploads', 'attachments', attachment.fileName);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('파일을 찾을 수 없습니다.');
    }

    return {
      filePath,
      originalName: attachment.originalName,
    };
  }
}
