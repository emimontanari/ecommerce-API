import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService
  ) { }
  async runSeed() {

    this.insertNewProducts()
    return 'SEDD EXECUTE!'
  }

  private async insertNewProducts() {
    await this.productsService.deleteAllProduct();

    const products = initialData.products;

    const insertPromise = []

    products.forEach(product => {

      insertPromise.push(this.productsService.create(product))
    });

    await Promise.all(insertPromise);

    return true
  }
}
