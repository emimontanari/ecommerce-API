import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as IsUUID } from 'uuid';
@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService')
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) { }


  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit, offset } = paginationDto
    return this.productRepository.find({
      take: limit,
      skip: offset
    })
  }

  async findOne(term: string) {
    let product: Product;
    if (IsUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term })
    } else {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder.where(`title =:title or slug =:slug`, {
        title: term.toUpperCase(),
        slug: term.toLowerCase()
      }).getOne()
    }

    if (!product) throw new NotFoundException(`Product with ${term} not found`)

    return product
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    })
    if (!product) throw new NotFoundException(`Product with id: ${id} not found`)
    try {
      await this.productRepository.save(product)
      return product
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product)
    return `Product with id :${product.id} delete`
  }


  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail)
    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error, check logs')
  }
}
